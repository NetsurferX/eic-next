// engine/align.ts
// Maps Seg[] (phonemes) onto the word's letters, left to right.
//
// VOWEL CLASSIFICATION: there is no "semivowel" type anywhere in this engine.
// j/w/ỷ are vowel SOUNDS (see colorMap.ts's isVowelSound/VOWEL_CHARS, which
// already returns true for them) — same isVowel flag, same color category,
// same eligibility for stress, as any other vowel.
//
// CONSUMPTION WIDTH (the one place glides differ from a/e/i/o/u): a true
// vowel sound consumes the entire run of adjacent vowel-letters ("ea" in
// "bread" is one run for one sound). A glide sound (j/w/ỷ) consumes exactly
// one letter, because the glide letter itself (y/w) sits next to letters
// belonging to a DIFFERENT phoneme — e.g. in "way" the w-sound and the
// eɪ-sound are two separate phonemes that happen to be letter-adjacent.
// Treating y/w as part of the vowel-letter-run set causes one phoneme to
// swallow letters that belong to the next one (tested: broke "way", "yellow",
// "happy" by making the w/y-segment eat the following vowel letters too).
// So GRAPHIC_VOWELS stays a/e/i/o/u only — that set defines run *boundaries*,
// not "what counts as a vowel sound."

import type { RenderNode, Seg } from './types'
import { getColor, COLOR_SILENT, COLOR_CONSONANT } from './colorMap'

const GLIDE_DISPLAYS = new Set(['j', 'w', 'ỷ'])
const TRAILING_GLIDE_LETTERS = new Set(['w', 'y', 'W', 'Y'])

export const GRAPHIC_VOWELS = new Set([...'aeiou', ...'AEIOU'])

export function isGraphicVowel(c: string): boolean { return GRAPHIC_VOWELS.has(c) }
export function isGraphicCons(c: string):  boolean { return !GRAPHIC_VOWELS.has(c) }

export function align(word: string, segs: Seg[]): RenderNode[] {
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

    if (isVowel) {
      if (GLIDE_DISPLAYS.has(display)) {
        // Glide sound: consume exactly 1 letter, whatever it is — it does
        // not extend into a neighboring vowel-letter run (that run belongs
        // to the next phoneme).
        if (pos < wLen) consumed = word[pos++]
      } else {
        // True vowel sound → consume the consecutive vowel-letter run, plus
        // one trailing w/y if present. The trailing grab handles digraphs
        // where a SINGLE diphthong phoneme is spelled with a true-vowel
        // letter followed by w/y (ow, aw, ew, ay, oy, ey — "power", "brown",
        // "day", "boy"). It only fires after at least one true vowel letter
        // was already consumed, so it never touches a glide-onset w/y at the
        // START of a run (that's the separate branch above) — only a w/y
        // immediately completing a vowel digraph that already started.
        const start = pos
        while (pos < wLen && isGraphicVowel(word[pos])) pos++
        if (pos > start && pos < wLen && TRAILING_GLIDE_LETTERS.has(word[pos])) pos++
        consumed = word.slice(start, pos)
      }

    } else {
      // Consonant: take 1 consonant grapheme (2 for IPA digraphs)
      if (pos < wLen && isGraphicCons(word[pos])) {
        consumed = word[pos++]
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
