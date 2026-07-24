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

// Colour legend and "hard mode" distractor groups both come from the single
// canonical source (src/lib/rules/colors.ts) — this used to be a hand-copied
// 4th mirror of the engine's colour map that could silently drift out of
// sync. Edit a colour or its neighbours there; this file just re-exports it.
export { COLOR_LABELS, NEAR_COLOR_GROUPS } from '@/lib/rules/colors'

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
