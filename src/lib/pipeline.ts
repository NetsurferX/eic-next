// Exact port of PhoneticPipeline.cs + ColorMap.cs
// Used server-side only — processes IPA strings from lexicon.db

export interface RenderNode {
  t: string    // grapheme
  s: string    // sound display
  c: string    // hex colour
  u: boolean   // isStressed
  x: boolean   // isConsonant
  underlineOverride?: 'force' | 'deny'  // set client-side by applyRegexOverrides() from ruleConfig.ts
}

// ── ColorMap ──────────────────────────────────────────────────────────────────

export const COLOR_SILENT    = '#000000'
export const COLOR_CONSONANT = '#000000'

const COLOR_MAP: Record<string, string> = {
  'æ':  '#00b0f0',
  'ʌ':  '#008E40', 'a': '#008E40', 'ɑ': '#008E40',
  'ə':  '#888888', 'ɜ': '#888888', 'ər': '#888888', 'er': '#888888',
  'e':  '#EE5B00', 'ɛ': '#EE5B00', 'eɪ': '#EE5B00', 'eỷ': '#EE5B00',
  'ɪ':  '#CC0000', 'i': '#CC0000', 'iː': '#CC0000',
  'ɒ':  '#FF3399', 'ɔ': '#FF3399', 'o':  '#FF3399',
  'oʊ': '#FF3399', 'əw': '#FF3399',
  'ʊ':  '#7030A0', 'u': '#7030A0', 'uː': '#7030A0',
  'aɪ': '#4472C4', 'aỷ': '#4472C4', 'aw': '#4472C4',
  'aʊ': '#4472C4', 'oɪ': '#4472C4', 'oỷ': '#4472C4', 'ɔɪ': '#4472C4',
  'j':  '#E57373', 'w': '#E57373', 'ỷ': '#E57373',
}

function getColor(sound: string): string | null {
  if (!sound) return null
  const k = sound.toLowerCase()
  if (COLOR_MAP[k]) return COLOR_MAP[k]
  if (k.length > 1 && COLOR_MAP[k[0]]) return COLOR_MAP[k[0]]
  return null
}

const VOWEL_CHARS = new Set([...'aeioujæɑɔəwɛɪʊʌyøœɒɝɚɜỷ'])

function isVowelSound(s: string): boolean {
  return s.length > 0 && VOWEL_CHARS.has(s[0])
}

// ── Transforms (priority order — longest first) ───────────────────────────────

const TRANSFORMS: [string, string][] = [
  // Schwa+R
  ['ɜːr','ər'],['ɝːr','ər'],['ɚːr','ər'],
  ['ɜr', 'ər'],['ɝr', 'ər'],['ɚr', 'ər'],
  ['ɜː', 'ər'],['ɝː', 'ər'],['ɚː', 'ər'],
  ['ɜ',  'ər'],['ɝ',  'ər'],['ɚ',  'ər'],
  // OR
  ['ɔːr','or'],['ɔr','or'],['ɔɹ','or'],
  // Diphthongs
  ['ɔɪ','oỷ'],['oɪ','oỷ'],
  ['aɪ','aỷ'],['eɪ','eỷ'],
  ['aʊ','aw'],
  ['əʊ','əw'],['oʊ','əw'],
  // ER
  ['ɛːr','er'],['ɛr','er'],['ɛɹ','er'],
  // Long vowels
  ['iː','i'],['uː','u'],
  ['ɑː','ɑ'],['ɔː','ɔ'],
  ['æː','æ'],['eː','e'],
  // Consonant digraphs
  ['tʃ','ch'],['dʒ','j'],
  ['ŋg','ng'],['ŋ','ng'],
  ['θ','th'],['ð','dh'],
  ['ʃ','sh'],['ɹ','r'],
  // Semivowels
  ['j','j'],['w','w'],['ỷ','ỷ'],
  // Simple vowels
  ['æ','æ'],['ɪ','ɪ'],
  ['ɑ','ɑ'],['ɒ','ɒ'],
  ['ɛ','ɛ'],['ʌ','ʌ'],
  ['ʊ','ʊ'],['ə','ə'],
]

const STRIP = new Set([...'/,.ˌːˑ'])
const VOWEL_FALLBACK = new Set([...'aeioujæɑɔəwɛɪʊʌyøœɒỷ'])

interface Seg {
  ipa:      string
  display:  string
  isVowel:  boolean
  accented: boolean
}

// ── Pipeline ──────────────────────────────────────────────────────────────────

export function processIpa(word: string, rawIpa: string): RenderNode[] {
  if (!rawIpa?.trim()) {
    return [{ t: word, s: '', c: COLOR_SILENT, u: false, x: false }]
  }

  // 1. Strip noise characters
  const ipa = [...rawIpa].filter(c => !STRIP.has(c)).join('').trim()

  // 2. Find primary stress position (anchor according to rules):
  // - If the character after the stress marker is a vowel (or vowel group),
  //   the target accent starts at that vowel/group.
  // - If the character after the stress marker is a consonant (or group),
  //   the target accent is the first vowel/group that follows that consonant group.
  const stressAt = ipa.indexOf('ˈ')
  const clean    = ipa.replace(/ˈ/g, '')
  let stressPos = -1
  if (stressAt >= 0) {
    // position in `ipa` immediately after the marker
    let j = stressAt + 1
    // guard
    if (j < ipa.length) {
      // If next char is vowel-like, anchor there; otherwise scan forward to first vowel-like
      const isVowelChar = (ch: string) => ch && VOWEL_CHARS.has(ch)
      if (isVowelChar(ipa[j])) {
        // map to index in `clean` (one stress marker removed before j)
        stressPos = j - 1
      } else {
        let k = j
        while (k < ipa.length && !isVowelChar(ipa[k])) k++
        if (k < ipa.length) stressPos = k - 1
      }
    }
  }

  // 3. Segment IPA into phonemes
  const segs = segment(clean, stressPos)

  // 4. Map segments onto word letters
  return mapToWord(word, segs)
}

function segment(clean: string, stressPos: number): Seg[] {
  const result: Seg[] = []
  let i = 0

  while (i < clean.length) {
    let matched = false

    for (const [pat, rep] of TRANSFORMS) {
      if (i + pat.length > clean.length) continue
      if (clean.slice(i, i + pat.length) !== pat) continue

      const accented = stressPos >= 0 && stressPos >= i && stressPos < i + pat.length
      result.push({ ipa: pat, display: rep, isVowel: isVowelSound(rep), accented })
      i += pat.length
      matched = true
      break
    }

    if (!matched) {
      const c       = clean[i]
      const accented = stressPos === i
      const isVowel  = VOWEL_FALLBACK.has(c.toLowerCase())
      result.push({ ipa: c, display: c, isVowel, accented })
      i++
    }
  }

  // Fallback: accent first vowel if nothing caught the stress marker
  if (stressPos >= 0 && result.every(s => !s.accented)) {
    let cum = 0
    for (let k = 0; k < result.length; k++) {
      if (cum >= stressPos && result[k].isVowel) {
        result[k] = { ...result[k], accented: true }
        break
      }
      cum += result[k].ipa.length
    }
  }

  return result
}

// ── Grapheme classification ───────────────────────────────────────────────────
const GRAPHIC_VOWELS    = new Set([...'aeiouAEIOU'])
const SEMIVOWEL_DISPLAY = new Set(['j', 'w', 'ỷ'])

function isGraphicVowel(c: string): boolean { return GRAPHIC_VOWELS.has(c) }
function isGraphicCons(c: string):  boolean { return !GRAPHIC_VOWELS.has(c) }

// ── mapToWord v4 — strict left-to-right vowel/consonant matching ──────────────
//
// Algorithm:
//   Walk IPA segments and word characters strictly left-to-right.
//   - Consonant IPA  → consume 1 consonant grapheme (2 for IPA digraph)
//   - Vowel IPA      → consume entire consecutive vowel grapheme run
//   - Semivowel IPA  → consume 1 consonant grapheme if available, else empty
//   - Empty display  → latent phoneme, no grapheme consumed
//   - Remaining word letters after all segs → silent

function mapToWord(word: string, segs: Seg[]): RenderNode[] {
  if (segs.length === 0)
    return [{ t: word, s: '', c: COLOR_SILENT, u: false, x: false }]

  const nodes: RenderNode[] = []
  let pos = 0
  const wLen = word.length

  for (const seg of segs) {
    const { ipa, display, isVowel, accented } = seg

    // Latent phoneme or syllabic marker — no grapheme consumed
    if (!display || display === '\u200d') {
      nodes.push({ t: '', s: display ?? '', c: COLOR_CONSONANT, u: false, x: true })
      continue
    }

    let consumed = ''

    if (SEMIVOWEL_DISPLAY.has(display)) {
      // Semivowel: take 1 consonant grapheme if current position is consonant
      if (pos < wLen && isGraphicCons(word[pos])) {
        consumed = word[pos++]
      }
      // else: latent semivowel — no grapheme shown

    } else if (isVowel) {
      // Vowel: consume the entire consecutive vowel grapheme run
      const start = pos
      while (pos < wLen && isGraphicVowel(word[pos])) pos++
      consumed = word.slice(start, pos)

    } else {
      // Consonant: take 1 consonant grapheme (2 for IPA digraphs)
      if (pos < wLen && isGraphicCons(word[pos])) {
        consumed = word[pos++]
        // IPA digraph → try to take a second adjacent consonant
        if (ipa.length >= 2 && pos < wLen && isGraphicCons(word[pos]))
          consumed += word[pos++]
      }
    }

    const color      = getColor(display)
    const isStressed = accented && isVowel
    const isSilent   = !color && !isVowel
    const isCons     = !color && !isVowel

    nodes.push({
      t: consumed,
      s: display,
      c: color ?? (isSilent ? COLOR_SILENT : COLOR_CONSONANT),
      u: isStressed,
      x: isCons || color === COLOR_CONSONANT,
    })
  }

  // Remaining word letters → silent
  if (pos < wLen)
    nodes.push({ t: word.slice(pos), s: '', c: COLOR_SILENT, u: false, x: false })

  return nodes
}

// ── Scoring (for UK/US selection) ────────────────────────────────────────────

export function scoreNodes(nodes: RenderNode[]): number {
  return nodes
    .filter(n => n.t && n.c !== COLOR_SILENT && n.c !== COLOR_CONSONANT)
    .reduce((sum, n) => sum + n.t.length, 0)
}

// ── Word properties for cache.db columns ─────────────────────────────────────

export interface WordProps {
  dominantColor:  string | null
  hasSilent:      boolean
  hasStress:      boolean
  syllableCount:  number
}

export function extractProps(nodes: RenderNode[]): WordProps {
  const colorCounts: Record<string, number> = {}
  let hasSilent = false
  let hasStress = false
  let syllableCount = 0

  for (const n of nodes) {
    // Silent: grey AND graphic consonant grapheme
    if (n.c === COLOR_SILENT && n.t && isGraphicCons(n.t)) hasSilent = true

    // Stress
    if (n.u) hasStress = true

    // Syllable count — each stressed or schwa vowel = 1 syllable (approximation)
    if (n.c !== COLOR_SILENT && n.c !== COLOR_CONSONANT && n.t) {
      syllableCount++
      const c = colorCounts[n.c] ?? 0
      colorCounts[n.c] = c + n.t.length
    }
  }

  // Dominant colour
  const entries = Object.entries(colorCounts)
  const dominantColor = entries.length > 0
    ? entries.sort((a, b) => b[1] - a[1])[0][0]
    : null

  return {
    dominantColor,
    hasSilent,
    hasStress,
    syllableCount: Math.max(1, syllableCount),
  }
}