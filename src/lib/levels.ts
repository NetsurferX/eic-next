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

// A level is a set of columns (rules) — USUALLY 4, but not fixed any more
// (Nivelul 5 are 1, Nivelul 6 are 2): finishing all of a level's columns
// unlocks the next level's columns. colUnlocked/starsEarned in page.tsx are
// now sized dynamically from level.lessons.length, not hardcoded to 4.
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
  {
    id: 'lvl4',
    name: 'Nivelul 4 · Consoane speciale',
    // 4 coloane noi, alese pentru categoriile de consoane cu tratament
    // GRAFIC distinct (nu culoare — consoanele EiC sunt aproape toate negre,
    // §3.1). Culorile coloanelor de mai jos sunt accente de UI (nu au
    // corespondent în colors.ts).
    lessons: [
      {
        id: 'sh', letter: 'ʃ', color: '#7030A0', tabLabel: 'Mov',
        words: [
          { text: 'shoe',   mark: 'sh' },
          { text: 'fish',   mark: 'sh' },
          { text: 'nation', mark: 'ti' },
          { text: 'sure',   mark: 's' },
          { text: 'ocean',  mark: 'ce' },
          { text: 'sugar',  mark: 's' },
        ],
      },
      {
        id: 'ch', letter: 'tʃ', color: '#EE5B00', tabLabel: 'Portocaliu',
        words: [
          { text: 'church',  mark: 'ch' },
          { text: 'match',   mark: 'tch' },
          { text: 'catch',   mark: 'tch' },
          { text: 'kitchen', mark: 'tch' },
          { text: 'chair',   mark: 'ch' },
          { text: 'teacher', mark: 'ch' },
        ],
      },
      {
        id: 'dj', letter: 'dʒ', color: '#008E40', tabLabel: 'Verde',
        words: [
          { text: 'jam',     mark: 'j' },
          { text: 'bridge',  mark: 'dge' },
          { text: 'giraffe', mark: 'g' },
          { text: 'magic',   mark: 'g' },
          { text: 'danger',  mark: 'g' },
          { text: 'soldier', mark: 'di' },
        ],
      },
      {
        id: 'th', letter: 'θ/ð', color: '#00A2E0', tabLabel: 'Bleu',
        words: [
          { text: 'think',   mark: 'th' },
          { text: 'north',   mark: 'th' },
          { text: 'south',   mark: 'th' },
          { text: 'tooth',   mark: 'th' },
          { text: 'though',  mark: 'th' },
          { text: 'weather', mark: 'th' },
        ],
      },
    ],
  },
  {
    id: 'lvl5',
    name: 'Nivelul 5 · Consoane vocalice',
    // O singură coloană combinată (nu separat pe l/m — efectul vizual e
    // identic, alb-cu-chenar, deci n-are sens didactic să fie predate ca
    // „sunete" diferite). Necesită detectorul general din
    // engine/syllabicConsonants.ts, conectat în WordRenderer.tsx.
    lessons: [
      {
        id: 'syllabic-lm', letter: 'l̩/m̩', color: '#000000', tabLabel: 'Negru (alb-chenar)',
        words: [
          { text: 'little', mark: 'le' },
          { text: 'table',  mark: 'le' },
          { text: 'apple',  mark: 'le' },
          { text: 'uncle',  mark: 'le' },
          { text: 'handle', mark: 'le' },
          { text: 'rhythm', mark: 'm' },
          { text: 'chasm',  mark: 'm' },
          { text: 'prism',  mark: 'm' },
        ],
      },
    ],
  },
  {
    id: 'lvl6',
    name: 'Nivelul 6 · Litere cu semn diacritic',
    // 2 coloane mici — atât cât există în surse verificate (fotografii ale
    // cărții, §3.3/§3.4).
    lessons: [
      {
        id: 'dot-z', letter: 'ṡ', color: '#000000', tabLabel: 'Negru (punct)',
        words: [
          { text: 'is',    mark: 's' },
          { text: 'busy',  mark: 's' },
          { text: 'rose',  mark: 's' },
          { text: 'Xena',  mark: 'X' },
        ],
      },
      {
        id: 'ring-gz', letter: 'x̊', color: '#000000', tabLabel: 'Negru (inel)',
        words: [
          { text: 'exam',    mark: 'x' },
          { text: 'example', mark: 'x' },
          { text: 'exactly', mark: 'x' },
        ],
      },
    ],
  },
  {
    id: 'lvl7',
    name: 'Nivelul 7 · Consoane din carte',
    // 4 coloane, direct din fotografiile cărții (§3.4). ğ/t̂/ẗ din aceleași
    // poze NU au coloane proprii — sunt exact /dʒ//ʃ//tʃ/ deja predate în
    // Nivelul 4, doar altă ortografie; considerate redundante.
    lessons: [
      {
        id: 'd-hat', letter: 'đ', color: '#833C0B', tabLabel: 'Maro',
        // -ed surd (/t/) — looked, reaped, shocked, helped, laughed, kissed.
        words: [
          { text: 'looked',  mark: 'ed' },
          { text: 'reaped',  mark: 'ed' },
          { text: 'shocked', mark: 'ed' },
          { text: 'helped',  mark: 'ed' },
          { text: 'laughed', mark: 'ed' },
          { text: 'kissed',  mark: 'ed' },
        ],
      },
      {
        id: 'c-hook', letter: 'ƈ', color: '#CC0000', tabLabel: 'Roșu',
        // c → /s/ — cent, force, mercy, circle, dance, since.
        words: [
          { text: 'cent',   mark: 'c' },
          { text: 'force',  mark: 'c' },
          { text: 'mercy',  mark: 'c' },
          { text: 'circle', mark: 'c' },
          { text: 'dance',  mark: 'c' },
          { text: 'since',  mark: 'c' },
        ],
      },
      {
        id: 'gh-ph-f', letter: 'gh/ph', color: '#23D300', tabLabel: 'Verde deschis',
        // gh/ph → /f/ — alphabet, laugh, tough, rough, phone, graph.
        words: [
          { text: 'alphabet', mark: 'ph' },
          { text: 'laugh',    mark: 'gh' },
          { text: 'tough',    mark: 'gh' },
          { text: 'rough',    mark: 'gh' },
          { text: 'phone',    mark: 'ph' },
          { text: 'graph',    mark: 'ph' },
        ],
      },
      {
        id: 'zh', letter: 'š', color: '#4472C4', tabLabel: 'Albastru',
        // /ʒ/ — pleasure, measure, confusion, vision, treasure, television.
        words: [
          { text: 'pleasure',   mark: 's' },
          { text: 'measure',    mark: 's' },
          { text: 'confusion',  mark: 'si' },
          { text: 'vision',     mark: 'si' },
          { text: 'treasure',   mark: 's' },
          { text: 'television', mark: 'si' },
        ],
      },
    ],
  },
  {
    id: 'lvl8',
    name: 'Nivelul 8 · Vocale suplimentare',
    lessons: [
      {
        id: 'strut', letter: 'ʌ', color: '#008E40', tabLabel: 'Verde-gradient',
        // STRUT — necesită accent='en-GB' explicit: dicționarul US din acest
        // proiect transcrie STRUT ca schwa (/ə/), nu /ʌ/ (o convenție de
        // transcriere americană pentru acest sunet — nu ține de regula
        // rhotic care altfel preferă US, vezi db.ts selectBest). Fără acest
        // accent, cuvintele ar ieși negre (schwa), nu cu gradientul verde
        // corect. Verificat direct: 'uk' → ʌ pe toate cele 6 cuvinte.
        accent: 'en-GB',
        words: [
          { text: 'cup',  mark: 'u' },
          { text: 'son',  mark: 'o' },
          { text: 'run',  mark: 'u' },
          { text: 'bus',  mark: 'u' },
          { text: 'sun',  mark: 'u' },
          { text: 'luck', mark: 'u' },
        ],
      },
      {
        id: 'rotic-o', letter: 'o', color: '#FF3399', tabLabel: 'Roz',
        // [o] rotic (door/force) — distinct de [ɒ] non-rotic (hot/dog, deja
        // acoperit în Nivelul 1) prin lipsa gradientului: rotic e flat.
        words: [
          { text: 'door',  mark: 'oor' },
          { text: 'force', mark: 'or' },
          { text: 'floor', mark: 'oor' },
          { text: 'four',  mark: 'our' },
          { text: 'sport', mark: 'or' },
          { text: 'short', mark: 'or' },
        ],
      },
    ],
  },
]

export const STORAGE_KEY = 'eic-lesson-progress-v6'   // bumped — v5 saves are shaped for the old 3-level/4-column-per-level LEVELS array; Nivelurile 4-8 (variable column counts) need a fresh shape
export const REPS_PER_LESSON = 5

export interface SavedProgress {
  levelIndex: number
  unlockedLevels: boolean[]
  colUnlocked: boolean[][]
  starsEarned: number[][]
  active: number
  allDone: boolean
}
