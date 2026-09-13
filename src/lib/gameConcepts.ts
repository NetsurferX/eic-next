// src/lib/gameConcepts.ts
//
// Schematic mini-game CONCEPT PROPOSALS for EiC2 recapitulation.
// These are wireframe-stage ideas for review at /debug/game-concepts — nothing
// here is wired into the real game engine (gameTypes.ts / ColourGame.tsx).
// Pick one, then a detailed spec (screens, state, GameSession integration) follows.

export type ConceptLayout =
  | 'sort-columns'   // drag words into colour-labelled bins
  | 'memory-grid'    // flip-card matching grid
  | 'lane-runner'    // side-scrolling lane with obstacles/gates
  | 'maze-path'      // grid maze, follow the correct coloured path
  | 'chain-flow'     // horizontal chain of linked word tiles
  | 'mc-audio'       // audio prompt + multiple choice tiles
  | 'hunt-highlight' // single word, tap/circle the target letters
  | 'stack-tower'    // vertical stack that grows/shrinks by correct answers

export interface GameConcept {
  slug: string
  name: string
  mechanic: string       // 1-2 sentence description of how it plays
  skill: string          // phonetic skill trained
  layout: ConceptLayout
  accentColors: string[] // hex values used purely for the wireframe mockup
}

export const GAME_CONCEPTS: GameConcept[] = [
  {
    slug: 'sound-sorter',
    name: 'Sound Sorter',
    mechanic:
      'Cuvinte cad pe rând sus pe ecran; copilul le trage în coșul colorat corect, corespunzător sunetului vocalic dominant.',
    skill: 'Identificare rapidă a culorii/sunetului vocalic dominant',
    layout: 'sort-columns',
    accentColors: ['#00A2E0', '#008E40', '#CC0000'],
  },
  {
    slug: 'colour-memory',
    name: 'Colour Match Memory',
    mechanic:
      'Grilă de cărți întoarse: unele au cuvântul scris, altele doar un petic de culoare. Se potrivesc perechi cuvânt–culoare.',
    skill: 'Asociere cuvânt scris ↔ culoare de sunet, fără audio',
    layout: 'memory-grid',
    accentColors: ['#EE5B00', '#7030A0', '#FF3399', '#000000'],
  },
  {
    slug: 'rhyme-rocket',
    name: 'Rhyme Rocket',
    mechanic:
      'O rachetă se lansează mai departe pentru fiecare cuvânt ales corect care rimează (are aceeași culoare finală) cu cuvântul-țintă afișat sus.',
    skill: 'Recunoașterea rimei prin culoare, nu prin ortografie',
    layout: 'lane-runner',
    accentColors: ['#CC0000', '#EE5B00'],
  },
  {
    slug: 'gradient-runner',
    name: 'Gradient Runner',
    mechanic:
      'Alergare fără sfârșit; vulpea sare peste obstacole marcate cu un singur segment din gradientul tricolor (/əʊ/) doar dacă segmentul e în ordinea corectă.',
    skill: 'Recunoașterea conturului/gradientului tricolor al sunetului /əʊ/',
    layout: 'lane-runner',
    accentColors: ['#FCD116', '#EE5B00', '#CC0000'],
  },
  {
    slug: 'mute-letter-hunt',
    name: 'Mute Letter Hunt',
    mechanic:
      'Un cuvânt e afișat mare; copilul atinge literele mute (deja subliniate de motor) înainte ca acestea să dispară treptat din cuvânt.',
    skill: 'Identificarea literelor mute în ortografia originală',
    layout: 'hunt-highlight',
    accentColors: ['#9c9c9c'],
  },
  {
    slug: 'colour-path-maze',
    name: 'Colour Path Maze',
    mechanic:
      'Un labirint mic pe grilă; fiecare celulă are o culoare de sunet. Copilul trasează drumul vulpii doar prin celulele care corespund culorii cuvântului rostit.',
    skill: 'Discriminare vocalică secvențială, planificare drum',
    layout: 'maze-path',
    accentColors: ['#008E40', '#00A2E0', '#7030A0'],
  },
  {
    slug: 'echo-chain',
    name: 'Echo Builder',
    mechanic:
      'Se construiește un lanț orizontal de cuvinte: fiecare cuvânt nou adăugat trebuie să înceapă cu aceeași culoare cu care s-a terminat precedentul (domino fonetic).',
    skill: 'Legătura dintre sunete la joncțiunea cuvintelor, memorie de lucru',
    layout: 'chain-flow',
    accentColors: ['#00A2E0', '#FF3399', '#008E40', '#CC0000'],
  },
  {
    slug: 'fox-dictation',
    name: 'Fox Race Dictation',
    mechanic:
      'Vulpea rostește un cuvânt (audio); copilul alege rapid varianta scrisă+colorată corect dintre 3 variante aproape identice, pentru a avansa în cursă.',
    skill: 'Discriminare auditivă fină între sunete vecine (culori "neighbors")',
    layout: 'mc-audio',
    accentColors: ['#00A2E0', '#EE5B00', '#CC0000'],
  },
  {
    slug: 'diacritic-detective',
    name: 'Diacritic Detective',
    mechanic:
      'Se arată un cuvânt căruia îi lipsește un diacritic (ĉ, t̂, subliniere); copilul alege din 4 variante pe cea corect marcată.',
    skill: 'Recunoașterea diacriticelor de consoane și a rolului lor',
    layout: 'mc-audio',
    accentColors: ['#000000', '#9c9c9c'],
  },
  {
    slug: 'streak-tower',
    name: 'Streak Tower',
    mechanic:
      'Fiecare răspuns corect adaugă un cub colorat (culoarea sunetului) pe un turn; un răspuns greșit dărâmă turnul cu un nivel. Scopul: cel mai înalt turn.',
    skill: 'Recapitulare mixtă rapidă, presiune de tip "streak"',
    layout: 'stack-tower',
    accentColors: ['#00A2E0', '#008E40', '#CC0000', '#7030A0', '#FF3399'],
  },
]
