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

export type GameLevel = 1 | 2 | 3

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

export const COLOR_LABELS: Record<string, { label: string; example: string }> = {
  '#008E40': { label: 'ɑ / ʌ',  example: 'car, cup' },
  '#00b0f0': { label: 'æ',      example: 'cat, hat' },
  '#7030A0': { label: 'u / ʊ',  example: 'moon, book' },
  '#888888': { label: 'ə',      example: 'about, the' },
  '#CC0000': { label: 'i / ɪ',  example: 'see, sit' },
  '#E57373': { label: 'j / w',  example: 'yes, we' },
  '#EE5B00': { label: 'e / ɛ',  example: 'bed, say' },
  '#FF3399': { label: 'ɒ / ɔ',  example: 'hot, or' },
}

export const LEVEL_INFO = {
  1: { name: 'Colours',      desc: 'What sound does this colour represent?',      icon: '🎨' },
  2: { name: 'Silent Hunt',  desc: 'Tap the letters that make no sound.',         icon: '🔇' },
  3: { name: 'Stress Mark',  desc: 'Tap the stressed vowel group.',               icon: '💡' },
}
