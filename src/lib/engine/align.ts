// engine/align.ts
// Maps Seg[] (IPA phonemes after transforms) onto the word's letters.
//
// TWO RULES drive this, not a dictionary:
//
// 1. CONSONANT_SPELLINGS table: each IPA display (e.g. 'sh', 'k', 'r') lists
//    every letter sequence that can spell it in English, longest first.
//    Handles: ti/ci→sh ("nation"), ch→k ("school"), rr/ll/nn/tt ("current",
//    "better"), ph/gh→f ("phone","enough"), kn/gn→n ("knight"), tch→ch, etc.
//
// 2. R-CONTROLLED VOWEL rule: after consuming vowel letters, if the next
//    letter is 'r' AND the next phoneme is NOT /r/, absorb the 'r' into this
//    vowel node. Handles: er/ir/or/ur/ar as single phoneme ("inter-", "her").
//
// With these two rules almost all English spelling irregularities are covered
// without touching a word list.

import type { RenderNode, Seg } from './types'
import { getColor, COLOR_SILENT, COLOR_CONSONANT } from './colorMap'

// ── Graphic vowel / consonant ─────────────────────────────────────────────────
// Only a/e/i/o/u define vowel-letter RUNS (y/w handled separately as glides).

export const GRAPHIC_VOWELS = new Set([...'aeiou', ...'AEIOU'])
export function isGraphicVowel(c: string): boolean { return GRAPHIC_VOWELS.has(c) }
export function isGraphicCons(c: string):  boolean { return !GRAPHIC_VOWELS.has(c) }

// ── Glide sounds ──────────────────────────────────────────────────────────────
const GLIDE_DISPLAYS = new Set(['j', 'w', 'ỷ'])

// IPA displays that are vowel sounds (used to decide vowel-run width)
const VOWEL_DISPLAY_STARTS = new Set([...'aeiouæɑɔəɛɪʊʌỷyw'])
function isVowelDisplay(d: string): boolean {
  return d.length > 0 && VOWEL_DISPLAY_STARTS.has(d[0])
}

// ── Consonant spelling table ──────────────────────────────────────────────────
// Key   = IPA display string (after TRANSFORMS in segment.ts)
// Value = letter sequences that spell it, LONGEST FIRST (greedy match wins)
//
// Adding a new rule: just add a line here. No other file needs to change.

const CONSONANT_SPELLINGS = new Map<string, string[]>([
  // Affricates & fricatives
  ['sh',  ['tsch', 'sch', 'ssh', 'sh',
           'ti', 'ci', 'si']],     // "nation"→ti, "social"→ci, "pension"→si
  ['ch',  ['tch', 'ch']],          // "catch", "church"
  ['j',   ['dge', 'dg', 'j']],    // "judge", "fridge"
  ['zh',  ['si', 'zi', 'z']],     // "vision", "azure"
  ['ng',  ['ngg', 'ng']],          // "finger", "ring"
  ['th',  ['th']],
  ['dh',  ['th']],
  // Stops
  ['k',   ['ck', 'kk', 'ch',       // "back", "bookkeeper", "school"
           'kh', 'k', 'c', 'q']],  // "khaki", "cat", "queen"
  ['g',   ['gg', 'gh', 'g']],     // "bigger", "ghost"
  ['t',   ['tt', 't']],
  ['d',   ['dd', 'd']],
  ['p',   ['pp', 'p']],
  ['b',   ['bb', 'b']],
  // Fricatives
  ['f',   ['ph', 'gh', 'ff', 'f']], // "phone", "enough", "off"
  ['v',   ['vv', 'v']],
  ['s',   ['ss', 's']],
  ['z',   ['zz', 'z', 's']],       // "buzz", "zero", "his"
  ['h',   ['wh', 'h']],            // "who" (wh→h), "hat"
  // Nasals & liquids
  ['n',   ['kn', 'gn', 'nn', 'n']], // "knight", "gnome", "inn"
  ['m',   ['mm', 'm']],
  ['l',   ['ll', 'l']],
  ['r',   ['rr', 'wr', 'rh', 'r']], // "current", "write", "rhythm"
  // Glides (as graphic consonants — position-based edge cases)
  ['w',   ['wh', 'w']],
])

function tryConsSpellings(display: string, word: string, pos: number): string {
  const spellings = CONSONANT_SPELLINGS.get(display)
  if (!spellings) return ''
  const wLow = word.toLowerCase()
  for (const sp of spellings) {
    if (wLow.startsWith(sp, pos)) return word.slice(pos, pos + sp.length)
  }
  return ''
}

// ── Vowel consumption ─────────────────────────────────────────────────────────

function consumeVowel(
  display: string,
  word: string,
  pos: number,
  nextDisplay: string | undefined
): { consumed: string; newPos: number } {
  const wLen = word.length

  // Glide sound: consume exactly 1 letter (it may be a consonant-looking letter
  // like 'u' in "queen" or 'o' in "one") — never extend into the adjacent vowel run
  if (GLIDE_DISPLAYS.has(display)) {
    const consumed = pos < wLen ? word[pos] : ''
    return { consumed, newPos: pos + (consumed ? 1 : 0) }
  }

  // True vowel: consume the consecutive vowel-letter run.
  //
  // CONSECUTIVE-VOWEL RULE: if the next phoneme is also a plain vowel
  // (not r-colored like 'ər'), take only 1 letter — the rest belong to
  // that next phoneme ("ia" in "association" = i + eɪ, not one run).
  // R-colored vowels like 'ər' are excluded because they follow a diphthong
  // without competing for the same letters ("power": aw→'ow', ər→'er').
  const R_COLORED = new Set(['ər', 'er', 'ar', 'or', 'ur', 'ɪr', 'ɛr'])
  const isPlainVowelDisplay = (d: string) =>
    d.length > 0 && VOWEL_DISPLAY_STARTS.has(d[0]) && !R_COLORED.has(d)

  const start = pos
  if (nextDisplay && isPlainVowelDisplay(nextDisplay)) {
    // Consecutive plain vowel phonemes: 1 letter each
    if (pos < wLen && isGraphicVowel(word[pos])) pos++
    // No trailing extensions here — they'd grab letters belonging to next phoneme
  } else {
    // Full vowel run + extensions
    while (pos < wLen && isGraphicVowel(word[pos])) pos++

    // Trailing w/y that completes a digraph (ow/aw/ay/oy/ey)
    if (pos > start && pos < wLen && 'wyWY'.includes(word[pos])) pos++

    // Silent 'gh' after vowel run (night, high, caught, though).
    // Guard: don't absorb if next phoneme could itself be spelled by gh.
    if (pos > start && pos + 1 < wLen
        && (word[pos] === 'g' || word[pos] === 'G')
        && (word[pos + 1] === 'h' || word[pos + 1] === 'H')
        && nextDisplay !== 'f' && nextDisplay !== 'g') {
      pos += 2
    }

    // R-controlled absorption: absorb a trailing 'r' when:
    // a) Display IS r-colored (ər, er…) — the 'r' is part of the phoneme, or
    // b) Plain vowel followed by a consonant phoneme (medial r — "inter-",
    //    "current" if rr wasn't in CONSONANT_SPELLINGS).
    // Does NOT fire at end-of-word for plain vowels → UK "power","mother",'r' stays mute.
    const nextIsConsonant = nextDisplay !== undefined
      && !isPlainVowelDisplay(nextDisplay)
      && !R_COLORED.has(nextDisplay)
      && nextDisplay !== 'r'
    if (pos < wLen && (word[pos] === 'r' || word[pos] === 'R') && nextDisplay !== 'r') {
      if (R_COLORED.has(display) || nextIsConsonant) pos++
    }
  }

  return { consumed: word.slice(start, pos), newPos: pos }
}

// ── Main alignment ────────────────────────────────────────────────────────────

export function align(word: string, segs: Seg[]): RenderNode[] {
  if (segs.length === 0)
    return [{ t: word, s: '', c: COLOR_SILENT, u: false, x: false }]

  const nodes: RenderNode[] = []
  let pos = 0
  const wLen = word.length

  for (let si = 0; si < segs.length; si++) {
    const { ipa, display, isVowel, accented } = segs[si]
    const nextDisplay = si + 1 < segs.length ? segs[si + 1].display : undefined

    // Latent phoneme — no letters consumed (syllabic marker, zero-width joiner)
    if (!display || display === '\u200d') {
      nodes.push({ t: '', s: display ?? '', c: COLOR_CONSONANT, u: false, x: true })
      continue
    }

    let consumed = ''

    if (isVowel) {
      const r = consumeVowel(display, word, pos, nextDisplay)
      consumed = r.consumed
      pos = r.newPos
    } else {
      // 1. Try spelling table (handles ti→sh, rr→r, ch→k, ph→f, kn→n, etc.)
      const fromTable = tryConsSpellings(display, word, pos)
      if (fromTable) {
        consumed = fromTable
        pos += fromTable.length
      } else if (pos < wLen && isGraphicCons(word[pos])) {
        // 2. Generic fallback: 1 letter (2 for IPA digraphs like th, ng)
        consumed = word[pos++]
        if (ipa.length >= 2 && pos < wLen && isGraphicCons(word[pos]))
          consumed += word[pos++]
      }
      // 3. Nothing matched → consumed stays '' (truly latent phoneme)
    }

    const color      = getColor(display)
    const isCons     = !color
    const isStressed = accented && isVowel

    nodes.push({
      t: consumed,
      s: display,
      c: color ?? (isCons ? COLOR_CONSONANT : COLOR_SILENT),
      u: isStressed,
      x: isCons,
    })
  }

  // Remaining letters → silent tail
  if (pos < wLen)
    nodes.push({ t: word.slice(pos), s: '', c: COLOR_SILENT, u: false, x: false })

  return nodes
}
