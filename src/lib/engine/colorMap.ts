// engine/colorMap.ts
// Sound → colour. Nothing in this file knows about graphemes/letters — it
// only ever looks at IPA display strings. Edit COLOR_MAP to change a colour;
// you never need to touch align.ts to do that.

export const COLOR_SILENT    = '#000000'
export const COLOR_CONSONANT = '#000000'

export const COLOR_MAP: Record<string, string> = {
  'æ':  '#00b0f0',
  'ʌ':  '#008E40', 'a': '#008E40', 'ɑ': '#008E40',
  // SPEC CORRECTION (B_tehnic §9 Tabel 2): schwa is negru, not grey.
  'ə':  '#000000', 'ɜ': '#000000', 'ər': '#000000', 'er': '#000000', 'ɐ': '#000000',
  'e':  '#EE5B00', 'ɛ': '#EE5B00',
  'ɪ':  '#CC0000', 'i': '#CC0000', 'iː': '#CC0000',
  'ɒ':  '#FF3399', 'ɔ': '#FF3399', 'o':  '#FF3399',
  'ʊ':  '#7030A0', 'u': '#7030A0', 'uː': '#7030A0',
  // SPEC CORRECTION (§9): /əʊ/ is its own tricolor-gradient sound
  // (#002B7F→#FCD116→#CE1126). No gradient-by-sound support yet (see
  // EiC-tehnic-spec.md §10.4) — using the gradient's midpoint colour as a
  // single-hue placeholder until that support exists.
  'oʊ': '#FCD116', 'əw': '#FCD116',
  // SPEC CORRECTION (§9): /eɪ/ (name, day) is its own dark blue, not a
  // variant of /e/-/ɛ/.
  'eɪ': '#00246C', 'eỷ': '#00246C',
  // SPEC CORRECTION (§9): /juː/ (cute, beauty) — wasn't mapped before.
  'ju': '#833C0B', 'ỷu': '#833C0B', 'juː': '#833C0B',
  'aɪ': '#4472C4', 'aỷ': '#4472C4',
  // SPEC CORRECTION (§9): /aʊ/ (tower, flower) is verde neon, split out of
  // the aɪ blue group it was previously lumped into.
  'aw': '#23D300', 'aʊ': '#23D300',
  // SPEC CORRECTION (§9): /ɔɪ/ (boy, coin) is bicolor roz→roșu, not the aɪ
  // blue. True two-tone gradient needs seg-splitting (see spec §10.3/10.4);
  // using the roz start-colour as a single-hue placeholder for now.
  'oɪ': '#FF3399', 'oỷ': '#FF3399', 'ɔɪ': '#FF3399',
  // SPEC CORRECTION (Tabelul 5/6): /j/,/ỷ/ take the same red as i/ɪ; /w/ is
  // negru like any other consonant. Neither is a distinct "semivowel" hue —
  // the old #E57373 bucket is gone.
  'j':  '#CC0000', 'ỷ': '#CC0000', 'w': '#000000',
}

export function getColor(sound: string): string | null {
  if (!sound) return null
  const k = sound.toLowerCase()
  if (COLOR_MAP[k]) return COLOR_MAP[k]
  if (k.length > 1 && COLOR_MAP[k[0]]) return COLOR_MAP[k[0]]
  return null
}

// IPA-side vowel detection (used to classify a SOUND, before any grapheme
// mapping happens). Includes j/w/ỷ — they are phonetically vowel-adjacent
// sounds and always were treated as such here; the bug was downstream in
// align.ts intercepting them before this classification could be used.
export const VOWEL_CHARS = new Set([...'aeioujæɑɔəwɛɪʊʌyøœɒɝɚɜỷɐ'])

export function isVowelSound(s: string): boolean {
  return s.length > 0 && VOWEL_CHARS.has(s[0])
}
