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

export type GameLevel = 1 | 2 | 3 | 4 | 5

export interface GameState {
  level:       GameLevel
  words:       GameWord[]
  current:     number    // index into words
  score:       number
  streak:      number
  maxStreak:   number
  xp:          number
  roundsDone:  number
  totalRounds: number
  phase:       'intro' | 'playing' | 'feedback' | 'done'
  lastCorrect: boolean | null
}

// SYNCED with engine/colorMap.ts (2026-07). Previous version had two stale
// entries: schwa listed as '#888888' (real value is '#000000' per the
// B_tehnic §9 correction already applied in colorMap.ts), and a '#E57373'
// j/w bucket that colorMap.ts's own comments say was removed — j now shares
// red with i/ɪ, w is plain consonant black. Both dropped below; if a game
// was relying on either entry existing, that game was quizzing a colour
// the engine no longer produces.
export const COLOR_LABELS: Record<string, { label: string; example: string }> = {
  '#008E40': { label: 'ɑ / ʌ',  example: 'car, cup' },
  '#00b0f0': { label: 'æ',      example: 'cat, hat' },
  '#7030A0': { label: 'u / ʊ',  example: 'moon, book' },
  '#CC0000': { label: 'i / ɪ / j', example: 'see, sit, yes' },
  '#EE5B00': { label: 'e / ɛ',  example: 'bed, say' },
  '#FF3399': { label: 'ɒ / ɔ',  example: 'hot, or' },
  '#FCD116': { label: 'oʊ',     example: 'go, boat' },
  '#00246C': { label: 'eɪ',     example: 'day, name' },
  '#833C0B': { label: 'juː',    example: 'cute, beauty' },
  '#4472C4': { label: 'aɪ',     example: 'night, my' },
  '#23D300': { label: 'aʊ',     example: 'loud, cow' },
}

export const LEVEL_INFO: Record<GameLevel, { name: string; desc: string; icon: string; rule: string }> = {
  1: {
    name: 'Colours',
    desc: 'What sound does this colour represent?',
    icon: '🎨',
    rule: 'Every vowel sound has its own colour. Learn to read the colour before you read the letter.',
  },
  2: {
    name: 'Silent Hunt',
    desc: 'Tap the letters that make no sound.',
    icon: '🔇',
    rule: 'Silent letters render in plain black — the same black as an ordinary consonant. Colour alone won\u2019t give it away; you have to know the word.',
  },
  3: {
    name: 'Stress Mark',
    desc: 'Tap the stressed vowel group.',
    icon: '💡',
    rule: 'The stressed syllable is underlined. Every other vowel in the word is unstressed.',
  },
  4: {
    name: 'Gradient',
    desc: 'Tap the part that fades or blends.',
    icon: '🌈',
    rule: 'Unstressed short vowels (\u028c, \u026a, \u0252, \u028a) fade into black. Some diphthongs blend two colours together.',
  },
  5: {
    name: 'Full Word',
    desc: 'Read the whole word at once.',
    icon: '🏆',
    rule: 'Now put it all together \u2014 colour, silence, stress and gradient, all at once.',
  },
}

// Static, hand-built example nodes for each level's intro screen — NOT
// pulled from the live pipeline, just enough for a one-time illustration
// before the round starts. Rendered via the real WordRenderer so the
// colours/underline/gradient shown are the actual engine output, not a
// mockup.
export const INTRO_EXAMPLES: Record<GameLevel, { word: string; nodes: GameNode[] }> = {
  1: {
    word: 'cat',
    nodes: [
      { t: 'c', s: 'k', c: '', u: false, x: true },
      { t: 'a', s: 'æ', c: '#00b0f0', u: true, x: false },
      { t: 't', s: 't', c: '', u: false, x: true },
    ],
  },
  2: {
    word: 'night',
    nodes: [
      { t: 'n', s: 'n', c: '', u: false, x: true },
      { t: 'i', s: 'aɪ', c: '#4472C4', u: false, x: false },
      { t: 'gh', s: '', c: '#4472C4', u: false, x: false },
      { t: 't', s: 't', c: '', u: false, x: true },
    ],
  },
  3: {
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
  },
  4: {
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
  },
  5: {
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
  },
}
