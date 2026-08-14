// src/lib/rules/colors.ts
//
// ── SINGLE SOURCE OF TRUTH for every sound → colour mapping in EiC. ──────────
//
// Before this file existed, the same colour data was hand-copied in FOUR
// places (engine/colorMap.ts, ruleConfig.ts's DEFAULT_CONFIG.colors,
// gameTypes.ts's COLOR_LABELS, and scripts/accent-test.ts), with no link
// between them — editing one did not update the others, and nothing warned
// you when they drifted apart. All four now import from here.
//
// TO CHANGE A COLOUR: edit one line in SOUND_COLORS below. That's it.
// Every consumer (the real rendering engine, the /rules editor, the game's
// colour quiz, and the standalone accent-test script) reads this file
// directly, so there is nothing else to keep in sync.
//
// TO ADD A NEW SOUND: add a new SoundColor entry. `sounds` lists every IPA
// display form (as produced by engine/segment.ts's TRANSFORMS table) that
// should take this colour.

export type ColorCategory = 'vowel' | 'semivowel' | 'consonant' | 'silent'

export interface SoundColor {
  sounds: string[]          // IPA display forms sharing this colour
  hex: string
  label: string             // shown in the /rules editor legend
  example?: string          // example word(s) — shown in the game legend
  category: ColorCategory
  neighbors?: string[]      // hex of phonetically-confusable colours (game "hard mode" distractors)
  note?: string             // spec-correction / rationale, kept visible next to the value it explains
}

export const SOUND_COLORS: SoundColor[] = [
  {
    sounds: ['æ'], hex: '#00b0f0', label: 'æ', example: 'cat, hat', category: 'vowel',
    neighbors: ['#EE5B00'],
  },
  {
    sounds: ['ʌ', 'a', 'ɑ'], hex: '#008E40', label: 'ɑ / ʌ', example: 'car, cup', category: 'vowel',
    neighbors: ['#FF3399'],
  },
  {
    sounds: ['ə', 'ɜ', 'ər', 'er', 'ɐ'], hex: '#000000', label: 'ə — schwa', category: 'vowel',
    note: 'SPEC CORRECTION (B_tehnic §9 Tabel 2): schwa is negru (black), not grey.',
  },
  {
    sounds: ['e', 'ɛ'], hex: '#EE5B00', label: 'e / ɛ', example: 'bed, say', category: 'vowel',
    neighbors: ['#00b0f0', '#CC0000'],
  },
  {
    sounds: ['ɪ', 'i', 'iː'], hex: '#CC0000', label: 'i / ɪ', example: 'see, sit', category: 'vowel',
    neighbors: ['#EE5B00'],
  },
  {
    sounds: ['ɒ', 'ɔ', 'o'], hex: '#FF3399', label: 'ɒ / ɔ', example: 'hot, or', category: 'vowel',
    neighbors: ['#008E40', '#7030A0'],
  },
  {
    sounds: ['ʊ', 'u', 'uː'], hex: '#7030A0', label: 'u / ʊ', example: 'moon, book', category: 'vowel',
    neighbors: ['#FF3399', '#FCD116'],
  },
  {
    sounds: ['oʊ', 'əw'], hex: '#FCD116', label: 'əʊ', example: 'go, boat', category: 'vowel',
    neighbors: ['#7030A0', '#23D300'],
    note: 'SPEC CORRECTION (§9): true form is a tricolor gradient '
      + '(#002B7F→#FCD116→#CE1126); no per-sound gradient support yet '
      + '(see EiC-tehnic-spec.md §10.4) — using the midpoint colour as a '
      + 'placeholder until that lands.',
  },
  {
    sounds: ['eɪ', 'ey̓'], hex: '#00246C', label: 'eɪ', example: 'day, name', category: 'vowel',
    neighbors: ['#4472C4'],
    note: 'SPEC CORRECTION (§9): own dark blue, not a variant of e/ɛ.',
  },
  {
    sounds: ['ju', 'y̓u', 'juː'], hex: '#833C0B', label: 'juː', example: 'cute, beauty', category: 'vowel',
    neighbors: ['#7030A0'],
    note: 'SPEC ADDITION (§9): was previously unmapped.',
  },
  {
    sounds: ['aɪ', 'ay̓'], hex: '#4472C4', label: 'aɪ', example: 'night, my', category: 'vowel',
    neighbors: ['#00246C'],
  },
  {
    sounds: ['aw', 'aʊ'], hex: '#23D300', label: 'aʊ', example: 'loud, cow', category: 'vowel',
    neighbors: ['#FCD116'],
    note: 'SPEC CORRECTION (§9): split out of the aɪ blue group it used to share.',
  },
  {
    // BUG FIX: was 'oỷ' (precomposed U+1EF7) — segment.ts's TRANSFORMS
    // actually emits 'oy̓' (y + U+0313 combining comma-above) for /ɔɪ/,
    // same combining convention as every other y̓-glide entry in this file
    // (eɪ→ey̓, aɪ→ay̓, j→y̓). The mismatch was masked by getColor()'s
    // fallback to the first character ('o'), which happens to share this
    // same hex — see the note below. Fixing it now so it stops being
    // silently correct only by coincidence.
    sounds: ['oɪ', 'oy̓', 'ɔɪ'], hex: '#FF3399', label: 'ɔɪ', example: 'boy, coin', category: 'vowel',
    note: 'SPEC CORRECTION (§9): true form is a bicolor roz→roșu gradient; '
      + 'needs seg-splitting support (spec §10.3/10.4) — using the roz '
      + 'start-colour as a placeholder for now.',
  },
  {
    sounds: ['j', 'y̓'], hex: '#CC0000', label: 'j / y̓', example: 'yes', category: 'semivowel',
    note: 'SPEC CORRECTION (Tabelul 5/6): same red as i/ɪ, not its own hue.',
  },
  {
    sounds: ['w'], hex: '#000000', label: 'w', example: 'we', category: 'semivowel',
    note: 'SPEC CORRECTION (Tabelul 5/6): negru like any consonant, not its own hue.',
  },
]

// ── Derived views — every consumer reads ONE of these, never hardcodes hex ──

// COLOR_SILENT used to be identical to COLOR_CONSONANT (#000000), making a
// silent letter visually indistinguishable from an ordinary black consonant.
// Grey sets it apart at a glance, matching the muted/secondary tone already
// used elsewhere in the UI (EicHero's --color-text-muted fallback).
export const COLOR_SILENT = '#8A8578'
export const COLOR_CONSONANT = '#000000'

/** Flat sound → hex lookup. What engine/align.ts and engine/display.ts use. */
export const COLOR_MAP: Record<string, string> = Object.fromEntries(
  SOUND_COLORS.flatMap(entry => entry.sounds.map(sound => [sound, entry.hex]))
)

export function getColor(sound: string): string | null {
  if (!sound) return null
  const k = sound.toLowerCase()
  if (COLOR_MAP[k]) return COLOR_MAP[k]
  if (k.length > 1 && COLOR_MAP[k[0]]) return COLOR_MAP[k[0]]
  return null
}

// IPA-side vowel detection (classifies a SOUND, before any grapheme mapping).
// Includes j/w/ỷ — vowel-adjacent sounds for colouring purposes (see
// engine/segment.ts for why stress-anchoring needs a DIFFERENT vowel set).
export const VOWEL_CHARS = new Set([...'aeioujæɑɔəwɛɪʊʌyøœɒɝɚɜỷɐ'])

export function isVowelSound(s: string): boolean {
  return s.length > 0 && VOWEL_CHARS.has(s[0])
}

/** hex → {label, example}, for the game's colour legend / quiz UI. */
export const COLOR_LABELS: Record<string, { label: string; example: string }> = {}
for (const entry of SOUND_COLORS) {
  if (!entry.example) continue
  if (COLOR_LABELS[entry.hex]) continue // first entry with an example wins a shared hex — see i/ɪ vs j/ỷ
  COLOR_LABELS[entry.hex] = { label: entry.label, example: entry.example }
}

/** hex → confusable hexes, for the game's "hard mode" distractor pool. */
export const NEAR_COLOR_GROUPS: Record<string, string[]> = Object.fromEntries(
  SOUND_COLORS.filter(e => e.neighbors?.length).map(e => [e.hex, e.neighbors!])
)
