// engine/segment.ts
// Turns a raw IPA string into Seg[] — phoneme-sized chunks with a display
// form, vowel flag, and whether the chunk carries primary stress.
//
// TRANSFORMS is intentionally a flat priority list, longest-pattern-first:
// to change how a sound is displayed, edit one line here. Nothing else in
// the engine needs to change.

import type { Seg } from './types'
import { isVowelSound, VOWEL_CHARS } from '../rules/colors'

const TRANSFORMS: [string, string][] = [
  // Schwa+R
  ['ɜːr','ər'],['ɝːr','ər'],['ɚːr','ər'],
  ['ɜr', 'ər'],['ɝr', 'ər'],['ɚr', 'ər'],
  ['ɜː', 'ər'],['ɝː', 'ər'],['ɚː', 'ər'],
  ['ɜ',  'ər'],['ɝ',  'ər'],['ɚ',  'ər'],
  // OR
  ['ɔːr','or'],['ɔr','or'],['ɔɹ','or'],
  // RULE 11 (spec 2026-07-31): -or-/-ar- spelling + /ɔr/~/ɔːr/~/ɒr/ ⇒ /or/.
  // ɔːr/ɔr/ɔɹ already covered above; ɒr was the missing attested variant.
  ['ɒr','or'],
  // Diphthongs
  ['ɔɪ','oy̓'],['oɪ','o'],
  ['aɪ','ay̓'],['eɪ','ey̓'],
  ['aʊ','aw'],
  ['əʊ','əw'],['oʊ','əw'],
  // RULE 14 (spec 2026-07-31): /ʊə/⇒/uə/, except when the /ʊ/ was already
  // consumed by a preceding aʊ/oʊ/əʊ match above (e.g. "allowance" aʊ‍əns —
  // aʊ is matched first at this position, so plain ʊə never gets a chance
  // to fire there; no explicit aʊə guard needed, priority order does it).
  ['ʊə','uə'],
  // ER
  ['ɛːr','er'],['ɛr','er'],['ɛɹ','er'],
  // Long vowels
  ['iː','i'],['uː','u'],
  ['ɑː','ɑ'],['ɔː','ɔ'],   
  ['æː','æ'],['eː','e'],
  // Consonant digraphs
  // NOTE: /dʒ/ used to map to display 'j' — an exact collision with the
  // /j/ semivowel (also displayed 'j', see the identity mapping below).
  // Since colors.ts's VOWEL_CHARS/isVowelSound() and align.ts's
  // GLIDE_DISPLAYS both key off the raw display STRING 'j', that collision
  // silently made every /dʒ/ word (judge, gem, barge...) go through the
  // 1-letter glide-consumption path and get coloured red like semivowel y,
  // instead of being treated as an ordinary black consonant (spec Tabel
  // 3.2: g→ğ is negru + diacritic, not roșu). 'dj' is a new, non-colliding
  // display token — mirrors how /tʃ/ already got its own 'ch' token instead
  // of reusing plain 't'.
  ['tʃ','ch'],['dʒ','dj'],
  ['ŋɡ','ng'],['ŋg','ng'],['ŋ','ng'],  // both script-g (U+0261) and plain g
  ['θ','th'],['ð','dh'],
  ['ʃ','sh'],['ɹ','r'],
  // SPEC ADDITIONS (B_tehnic §8 Tabel 1): /gz/ ("example"), /kʃ/ ("sexual").
  // Must come before any single-char consonant fallback below.
  ['ɡz','gz'],['gz','gz'],['kʃ','kʃ'],
  // SPEC ADDITION (§9 Tabel 2): /juː/ ("cute, beauty") — must come before
  // the plain 'j' identity mapping below or it will never be reached.
  ['juː','y̓u'],['jʊ','y̓u'],['ju','y̓u'],
  // j/w/ỷ — vowel-adjacent sounds, no special "semivowel" category.
  // isVowelSound() already returns true for these (see rules/colors.ts);
  // align.ts treats them exactly like any other vowel sound.
  ['j','j'],['w','w'],['y̓','y̓'],
  ['ɐ',  'ə'],  // near-open central vowel, UK variant of schwa (e.g. "power" UK)
  ['ɑ','ɑ'],['ɒ','ɒ'],
  ['ɛ','ɛ'],['ʌ','ʌ'],
  ['ʊ','ʊ'],['ə','ə'],
]

const STRIP = new Set([...'/,.ˌːˑ'])
const VOWEL_FALLBACK = new Set([...'aeioujæɑɔəwɛɪʊʌyøœɒy̓ɐ'])

/**
 * Stress anchoring needs a DIFFERENT notion of "vowel" than sound
 * classification does. VOWEL_CHARS (rules/colors.ts) correctly includes j/w/ỷ —
 * they're vowel-adjacent sounds for coloring purposes. But a glide can never
 * itself carry primary stress; only a true syllable nucleus can. Using
 * VOWEL_CHARS here caused stress to land on a glide instead of skipping past
 * it to the real vowel (e.g. "question" /ˈkwɛstʃən/ — stress marker before
 * "kw" should skip both consonant 'k' AND glide 'w' to land on 'ɛ', but
 * VOWEL_CHARS treats 'w' as a stop-here vowel and the scan halted early).
 */
const STRESS_ANCHOR_CHARS = new Set(
  [...VOWEL_CHARS].filter(c => c !== 'j' && c !== 'w' && c !== 'y̓' && c !== 'y')
)

function findStressPos(rawIpa: string): { clean: string; stressPos: number } {
  const ipa = [...rawIpa].filter(c => !STRIP.has(c)).join('').trim()
  const stressAt = ipa.indexOf('ˈ')
  const clean = ipa.replace(/ˈ/g, '')

  if (stressAt < 0) return { clean, stressPos: -1 }

  // If the char right after the marker is a true vowel, anchor there.
  // Otherwise scan forward (skipping consonants AND glides) to the first
  // true vowel.
  let j = stressAt + 1
  if (j >= ipa.length) return { clean, stressPos: -1 }

  const isAnchorChar = (ch: string) => ch && STRESS_ANCHOR_CHARS.has(ch)
  if (isAnchorChar(ipa[j])) return { clean, stressPos: j - 1 }

  let k = j
  while (k < ipa.length && !isAnchorChar(ipa[k])) k++
  return { clean, stressPos: k < ipa.length ? k - 1 : -1 }
}

export function segment(rawIpa: string): Seg[] {
  const { clean, stressPos } = findStressPos(rawIpa)
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
      const c = clean[i]
      const accented = stressPos === i
      const isVowel = VOWEL_FALLBACK.has(c.toLowerCase())
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