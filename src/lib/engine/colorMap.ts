// engine/colorMap.ts
// Sound → colour. Nothing in this file knows about graphemes/letters — it
// only ever looks at IPA display strings. Edit COLOR_MAP to change a colour;
// you never need to touch align.ts to do that.

export const COLOR_SILENT    = '#000000'
export const COLOR_CONSONANT = '#000000'

export const COLOR_MAP: Record<string, string> = {
  'æ':  '#00b0f0',
  'ʌ':  '#008E40', 'a': '#008E40', 'ɑ': '#008E40',
  'ə':  '#888888', 'ɜ': '#888888', 'ər': '#888888', 'er': '#888888', 'ɐ': '#888888',
  'e':  '#EE5B00', 'ɛ': '#EE5B00', 'eɪ': '#EE5B00', 'eỷ': '#EE5B00',
  'ɪ':  '#CC0000', 'i': '#CC0000', 'iː': '#CC0000',
  'ɒ':  '#FF3399', 'ɔ': '#FF3399', 'o':  '#FF3399',
  'oʊ': '#FF3399', 'əw': '#FF3399',
  'ʊ':  '#7030A0', 'u': '#7030A0', 'uː': '#7030A0',
  'aɪ': '#4472C4', 'aỷ': '#4472C4', 'aw': '#4472C4',
  'aʊ': '#4472C4', 'oɪ': '#4472C4', 'oỷ': '#4472C4', 'ɔɪ': '#4472C4',
  'j':  '#E57373', 'w': '#E57373', 'ỷ': '#E57373',
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
