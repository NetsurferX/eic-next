export interface GameNode {
  t: string
  s: string
  c: string
  u: boolean
  x: boolean
}

export interface GameWord {
  word:          string
  nodes:         GameNode[]
  dominantColor: string
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface GameSession {
  difficulty:  Difficulty
  words:       GameWord[]
  current:     number
  score:       number
  streak:      number
  maxStreak:   number
  xp:          number
  roundsDone:  number
  totalRounds: number
  phase:       'intro' | 'loading' | 'playing' | 'feedback' | 'done'
  lastCorrect: boolean | null
}

export const DIFFICULTY_INFO: Record<Difficulty, { label: string; icon: string; desc: string }> = {
  easy:   { label: 'Easy',   icon: '🌱', desc: 'Short words, clearly different colours' },
  medium: { label: 'Medium', icon: '🌿', desc: 'Longer words, mixed sounds' },
  hard:   { label: 'Hard',   icon: '🌳', desc: 'Long words, similar-sounding colours' },
}

// SYNCED with engine/colorMap.ts. Previous version had schwa at '#888888'
// (real value '#000000') and a '#E57373' j/w bucket colorMap.ts's own
// comments say was removed — both dropped here.
export const COLOR_LABELS: Record<string, { label: string; example: string }> = {
  '#008E40': { label: 'ɑ / ʌ',     example: 'car, cup' },
  '#00b0f0': { label: 'æ',         example: 'cat, hat' },
  '#7030A0': { label: 'u / ʊ',     example: 'moon, book' },
  '#CC0000': { label: 'i / ɪ / j', example: 'see, sit, yes' },
  '#EE5B00': { label: 'e / ɛ',     example: 'bed, say' },
  '#FF3399': { label: 'ɒ / ɔ',     example: 'hot, or' },
  '#FCD116': { label: 'oʊ',        example: 'go, boat' },
  '#00246C': { label: 'eɪ',        example: 'day, name' },
  '#833C0B': { label: 'juː',       example: 'cute, beauty' },
  '#4472C4': { label: 'aɪ',        example: 'night, my' },
  '#23D300': { label: 'aʊ',        example: 'loud, cow' },
}

// For Hard mode: distractors are pulled from here first (phonetically
// neighbouring sounds), so the wrong options are genuinely confusable
// instead of just visually random. Falls back to the general pool if a
// colour has fewer than 3 neighbours defined.
export const NEAR_COLOR_GROUPS: Record<string, string[]> = {
  '#00b0f0': ['#EE5B00'],                 // æ  ~ e/ɛ   (front vowels)
  '#EE5B00': ['#00b0f0', '#CC0000'],      // e  ~ æ, i
  '#CC0000': ['#EE5B00'],                 // i/ɪ ~ e
  '#008E40': ['#FF3399'],                 // ɑ/ʌ ~ ɒ/ɔ  (back vowels)
  '#FF3399': ['#008E40', '#7030A0'],      // ɒ/ɔ ~ ɑ/ʌ, u
  '#7030A0': ['#FF3399', '#FCD116'],      // u/ʊ ~ ɒ/ɔ, oʊ
  '#FCD116': ['#7030A0', '#23D300'],      // oʊ ~ u, aʊ
  '#23D300': ['#FCD116'],                 // aʊ ~ oʊ
  '#4472C4': ['#00246C'],                 // aɪ ~ eɪ    (both dark/glide diphthongs)
  '#00246C': ['#4472C4'],                 // eɪ ~ aɪ
  '#833C0B': ['#7030A0'],                 // juː ~ u/ʊ
}

export const GAME_RULE =
  'Every vowel sound has its own colour. Learn to read the colour before you read the letter — the shape of the word tells you how it sounds.'

// Static example for the intro screen, rendered via the real WordRenderer.
export const INTRO_EXAMPLE: { word: string; nodes: GameNode[] } = {
  word: 'understand',
  nodes: [
    { t: 'u', s: 'ʌ', c: '#008E40', u: false, x: false },
    { t: 'n', s: 'n', c: '', u: false, x: true },
    { t: 'd', s: 'd', c: '', u: false, x: true },
    { t: 'er', s: 'ər', c: '#000000', u: false, x: false },
    { t: 's', s: 's', c: '', u: false, x: true },
    { t: 't', s: 't', c: '', u: false, x: true },
    { t: 'a', s: 'æ', c: '#00b0f0', u: true, x: false },
    { t: 'n', s: 'n', c: '', u: false, x: true },
    { t: 'd', s: 'd', c: '', u: false, x: true },
  ],
}
