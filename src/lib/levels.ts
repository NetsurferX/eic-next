// ── Fixed lesson data — colours match the canonical EiC sound map exactly ──
// (see lib/rules/colors.ts — SOUND_COLORS is the single source of truth)
// Shared between the /learn page and the landing-page level teaser, so both
// always agree on level names, colours and progress math.
export type Accent = 'en-GB' | 'en-US'

export interface LessonWord {
  text: string
  mark: string   // substring of `text` that carries the target sound — only this part gets coloured
  accent?: Accent   // override, dacă diferă de accentul coloanei (ex. cuvinte cu æn/æm)
}

export interface Lesson {
  id: string
  letter: string     // sound shown at the top of the column — no slashes
  color: string
  tabLabel: string   // Romanian colour-name shown on the tabs
  accent?: Accent    // implicit 'en-US' dacă lipsește
  words: LessonWord[]
}

// A level is a set of 4 columns (4 rules). Finishing all 4 columns of a
// level unlocks the next level's 4 columns, with 4 new EiC rules/sounds.
// TO ADD A NEW LEVEL: append a Level object here — everything else (progress
// state, unlock logic, animations) is driven off LEVELS.length automatically.
export interface Level {
  id: string
  name: string        // shown under the title, e.g. "Nivelul 2 · Alte vocale"
  lessons: Lesson[]    // always 4
}

export const LEVELS: Level[] = [
  {
    id: 'lvl1',
    name: 'Nivelul 1 · Vocale scurte',
    lessons: [
      {
        id: 'a', letter: 'a', color: '#008E40', tabLabel: 'Verde',
        words: [
          { text: 'dark',   mark: 'a' },
          { text: 'cart',   mark: 'a' },
          { text: 'father', mark: 'a' },
          { text: 'star',   mark: 'a' },
          { text: 'farm',   mark: 'a' },
          { text: 'hard',   mark: 'a' },
        ],
      },
      {
        id: 'e', letter: 'e', color: '#EE5B00', tabLabel: 'Portocaliu',
        words: [
          { text: 'bed',    mark: 'e' },
          { text: 'head',   mark: 'ea' },
          { text: 'said',   mark: 'ai' },
          { text: 'friend', mark: 'ie' },
          { text: 'left',   mark: 'e' },
          { text: 'red',    mark: 'e' },
        ],
      },
      {
        id: 'o', letter: 'o', color: '#FF3399', tabLabel: 'Roz',
        // Coloana /o/ — accent britanic (regula 6 din EiC — /learn — Modificări de implementat)
        accent: 'en-GB',
        words: [
          { text: 'hot',   mark: 'o' },
          { text: 'top',   mark: 'o' },
          { text: 'stop',  mark: 'o' },
          { text: 'clock', mark: 'o' },
          { text: 'dog',   mark: 'o' },
          { text: 'box',   mark: 'o' },
        ],
      },
      {
        id: 'i', letter: 'i', color: '#CC0000', tabLabel: 'Roșu',
        words: [
          { text: 'sit',  mark: 'i' },
          { text: 'tip',  mark: 'i' },
          { text: 'big',  mark: 'i' },
          { text: 'fish', mark: 'i' },
          { text: 'hit',  mark: 'i' },
          { text: 'list', mark: 'i' },
        ],
      },
    ],
  },
  {
    id: 'lvl2',
    name: 'Nivelul 2 · Alte vocale',
    lessons: [
      {
        id: 'ae', letter: 'æ', color: '#00A2E0', tabLabel: 'Bleu',
        // Coloana æ — accent britanic (regula 6). Cuvintele cu æn/æm (man, hand)
        // sunt oricum acoperite de accentul coloanei; word.accent rămâne
        // disponibil pentru un eventual cuvânt cu æn/æm dintr-o ALTĂ coloană.
        accent: 'en-GB',
        words: [
          { text: 'cat',  mark: 'a' },
          { text: 'hat',  mark: 'a' },
          { text: 'bag',  mark: 'a' },
          { text: 'man',  mark: 'a' },
          { text: 'sad',  mark: 'a' },
          { text: 'hand', mark: 'a' },
        ],
      },
      {
        id: 'u', letter: 'uː', color: '#7030A0', tabLabel: 'Mov',
        words: [
          { text: 'moon', mark: 'oo' },
          { text: 'food', mark: 'oo' },
          { text: 'room', mark: 'oo' },
          { text: 'soon', mark: 'oo' },
          { text: 'book', mark: 'oo' },
          { text: 'good', mark: 'oo' },
        ],
      },
      {
        // Header simbol: ə + U+200D (SYLLABIC_MARKER, engine/display.ts) + ʊ —
        // aceeași convenție ca segment.ts pentru diftongul əʊ/oʊ. `color`
        // NU mai e galben plat (#FCD116 era doar banda din mijloc a
        // tricolorului, un placeholder rămas de dinainte să existe
        // gradientul) — engine/display.ts randează acest sunet mereu cu
        // tricolorul românesc (albastru/galben/roșu), niciodată o culoare
        // unică. `color` rămâne totuși un hex SIMPLU (nu un gradient),
        // fiindcă e folosit peste tot în globals.css prin color-mix(), care
        // nu acceptă un gradient ca argument — deci am ales #CE1126 (roșu),
        // aceeași culoare pe care display.ts o folosește deja ca
        // TRICOLOR_UNDERLINE_COLOR, adică "ancora" convențională a acestui
        // sunet. Fundalul cromatic REAL, cu toate trei benzile, apare pe
        // cuvinte (MarkedWord), pe litera din capul coloanei, pe butonul
        // "Repetă" și pe cupă — vezi lib/tricolorStyle.ts (TRICOLOR_BANDS /
        // TRICOLOR_CSS_HORIZONTAL) și /learn/page.tsx (lessonId === 'ou').
        id: 'ou', letter: 'ə\u200Dʊ', color: '#CE1126', tabLabel: 'Tricolor',
        words: [
          { text: 'go',   mark: 'o' },
          { text: 'boat', mark: 'oa' },
          { text: 'road', mark: 'oa' },
          { text: 'home', mark: 'o' },
          { text: 'snow', mark: 'ow' },
          { text: 'show', mark: 'ow' },
        ],
      },
      {
        id: 'ei', letter: 'eɪ', color: '#00246C', tabLabel: 'Bleumarin',
        words: [
          { text: 'day',  mark: 'ay' },
          { text: 'name', mark: 'a' },
          { text: 'rain', mark: 'ai' },
          { text: 'play', mark: 'ay' },
          { text: 'gate', mark: 'a' },
          { text: 'wait', mark: 'ai' },
        ],
      },
    ],
  },
  {
    id: 'lvl3',
    name: 'Nivelul 3 · Diftongi',
    lessons: [
      {
        id: 'ju', letter: 'juː', color: '#833C0B', tabLabel: 'Maro',
        words: [
          { text: 'cute',     mark: 'u' },
          { text: 'music',    mark: 'u' },
          { text: 'use',      mark: 'u' },
          { text: 'computer', mark: 'u' },
          { text: 'human',    mark: 'u' },
          { text: 'few',      mark: 'ew' },
        ],
      },
      {
        id: 'ai', letter: 'aɪ', color: '#4472C4', tabLabel: 'Albastru',
        words: [
          { text: 'night', mark: 'i' },
          { text: 'my',    mark: 'y' },
          { text: 'time',  mark: 'i' },
          { text: 'like',  mark: 'i' },
          { text: 'high',  mark: 'igh' },
          { text: 'five',  mark: 'i' },
        ],
      },
      {
        id: 'au', letter: 'aʊ', color: '#23D300', tabLabel: 'Verde deschis',
        words: [
          { text: 'loud',  mark: 'ou' },
          { text: 'cow',   mark: 'ow' },
          { text: 'house', mark: 'ou' },
          { text: 'now',   mark: 'ow' },
          { text: 'mouth', mark: 'ou' },
          { text: 'down',  mark: 'ow' },
        ],
      },
      {
        id: 'oi', letter: 'oɪ', color: '#FF3399', tabLabel: 'Roz-roșu',
        words: [
          { text: 'boy',   mark: 'oy' },
          { text: 'coin',  mark: 'oi' },
          { text: 'toy',   mark: 'oy' },
          { text: 'voice', mark: 'oi' },
          { text: 'enjoy', mark: 'oy' },
          { text: 'point', mark: 'oi' },
        ],
      },
    ],
  },
]

export const STORAGE_KEY = 'eic-lesson-progress-v5'   // bumped — v4 saves could carry the "next level's column 0 never unlocks" bug
export const REPS_PER_LESSON = 5

export interface SavedProgress {
  levelIndex: number
  unlockedLevels: boolean[]
  colUnlocked: boolean[][]
  starsEarned: number[][]
  active: number
  allDone: boolean
}
