// Exact port of PhoneticPipeline.cs + ColorMap.cs
// Used server-side only — processes IPA strings from lexicon.db

export interface RenderNode {
  t: string    // grapheme
  s: string    // sound display
  c: string    // hex colour
  u: boolean   // isStressed
  x: boolean   // isConsonant
}

// ── ColorMap ──────────────────────────────────────────────────────────────────

export const COLOR_SILENT    = '#cccccc'
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

  // 2. Find primary stress position
  const stressAt  = ipa.indexOf('ˈ')
  const clean     = ipa.replace(/ˈ/g, '')
  const stressPos = stressAt > 0 ? stressAt - 1 : stressAt === 0 ? 0 : -1

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

function mapToWord(word: string, segs: Seg[]): RenderNode[] {
  const nodes: RenderNode[] = []
  let wPos = 0
  const n    = segs.length
  const wLen = word.length

  if (n === 0) {
    return [{ t: word, s: '', c: COLOR_SILENT, u: false, x: false }]
  }

  // Distribute letters: each segment gets at least 1
  // IPA digraphs (ipa.length >= 2) get priority for extra letters
  const gl = new Array(n).fill(1)
  let extra = wLen - n

  for (let pass = 0; pass < 2 && extra > 0; pass++) {
    for (let i = 0; i < n && extra > 0; i++) {
      if (pass === 0 && segs[i].ipa.length < 2) continue
      gl[i]++
      extra--
    }
  }
  if (extra > 0) gl[n - 1] += extra

  for (let i = 0; i < n; i++) {
    const take  = Math.max(0, Math.min(gl[i], wLen - wPos))
    const text  = take > 0 ? word.slice(wPos, wPos + take) : ''
    wPos += take

    const color     = getColor(segs[i].display)
    const isStressed = segs[i].accented && segs[i].isVowel
    const isSilent   = color === null && !segs[i].isVowel
    const isCons     = color === null && segs[i].isVowel === false

    nodes.push({
      t: text,
      s: segs[i].display,
      c: color ?? (isSilent ? COLOR_SILENT : COLOR_CONSONANT),
      u: isStressed,
      x: isCons || (color === COLOR_CONSONANT),
    })
  }

  // Remaining letters → silent
  if (wPos < wLen) {
    nodes.push({ t: word.slice(wPos), s: '', c: COLOR_SILENT, u: false, x: false })
  }

  return nodes
}

// ── Scoring (for UK/US selection) ────────────────────────────────────────────

export function scoreNodes(nodes: RenderNode[]): number {
  return nodes
    .filter(n => n.t && n.c !== COLOR_SILENT && n.c !== COLOR_CONSONANT)
    .reduce((sum, n) => sum + n.t.length, 0)
}

// ── Word properties for cache.db columns ─────────────────────────────────────

const GRAPHIC_CONS = new Set('bcdfghjklmnpqrstvxz')

function isGraphicCons(t: string): boolean {
  return !!t && [...t.toLowerCase()].every(c => GRAPHIC_CONS.has(c))
}

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
