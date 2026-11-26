'use client'

import { speakWord, warmUpVoices } from '@/lib/speak'
import { playStarChime, playLevelFanfare } from '@/lib/sound'
import { LEVELS as ALL_LEVELS, STORAGE_KEY, REPS_PER_LESSON, type SavedProgress, type Level, type Lesson, type LessonWord, type Accent } from '@/lib/levels'
import { Cup, Confetti } from '@/components/game/Cup'
import { Mascot } from '@/components/game/Mascot'
import MascotReward, { useMascotReward } from '@/components/game/MascotReward'
import { type FoxTip, type FoxMood } from '@/components/game/FoxHelper'
import { FoxTips } from '@/components/game/FoxTips'
import { useState, useCallback, useEffect, useRef, useMemo, type CSSProperties, type TouchEvent as ReactTouchEvent } from 'react'
import Link from 'next/link'
import { ringify } from '@/components/SymbolText'
import { HelpSign } from '@/components/game/HelpSign'
import { tricolorLetterStyle, bandsFor, underlineColorFor, bandsCssHorizontal } from '@/lib/tricolorStyle'
import WordRenderer from '@/components/WordRenderer'
import { OnboardingSoundIntro } from '@/components/game/OnboardingSoundIntro'
import { MascotIntro } from '@/components/game/MascotIntro'
import { FoxReel, FACE_IDLE_REEL, FACE_SPEAK_REEL } from '@/components/game/useFrameCycle'
import { StarIcon } from '@/components/game/StarIcon'
import { symbolView, WHITE_OUTLINED_TEXT_STYLE, CONSONANT_IDS, CONSONANT_BLACK } from '@/lib/symbolDisplay'
import type { RenderNode } from '@/lib/renderNode'
import { BuleleVulpiiOverlay, type BuleleVulpiiOverlayConfig } from '@/components/game/BuleleVulpiiOverlay'

const POP_DURATION_MS = 5000    // how long the per-column cup→star pop animation plays
const LEVEL_POP_MS = 1800       // how long the big level-cup celebration plays
const REVEAL_MS = 900           // how long a freshly-unlocked column's reveal-in animation plays
const AUTO_DELAY_MS = 1650      // default gap between words — user-adjustable via the speed slider
const AUTO_DELAY_KEY = 'eic-auto-delay-ms'
const SOUND_INTRO_SEEN_KEY = 'eic-sound-intro-seen'
const BEGINNER_NOTE_SEEN_KEY = 'eic-beginner-note-seen'
const REVIEW_THRESHOLD = 3      // clicking one word this many times sends it to "Cuvinte de exersat"
const LETTER_FOX_PROMPT = "Let's play!"   // mesajul vulpii la click pe litera din capul coloanei

// Alege accentul efectiv al unui cuvânt: override-ul cuvântului > accentul
// coloanei > 'en-US' implicit.
const resolveAccent = (w: { accent?: Accent }, l: { accent?: Accent }): Accent =>
  w.accent ?? l.accent ?? 'en-US'

// ── Pagina /learn arată doar WORDS_PER_COLUMN cuvinte per coloană (primele 4
//   din levels.ts), cu o excepție: prima coloană (/a/) are setul ei propriu.
//   Filtrul e LOCAL paginii — levels.ts (partajat cu landing, jocuri, debug)
//   rămâne neatins. `LEVELS` de mai jos umbrește deliberat importul, ca tot
//   restul fișierului să lucreze automat cu lista scurtă.
//   bug/son: accent en-GB explicit, ca la coloana STRUT (dicționarul US le
//   transcrie cu schwa → ar ieși negre, nu verzi). ──
const WORDS_PER_COLUMN = 4
const COLUMN_WORD_OVERRIDES: Record<string, LessonWord[]> = {
  a: [
    { text: 'farm', mark: 'a' },
    { text: 'hard', mark: 'a' },
    { text: 'bug',  mark: 'u', accent: 'en-GB' },
    { text: 'son',  mark: 'o', accent: 'en-GB' },
  ],
  // /o/ (roz): stop prima, four (ou roz), salt (a roz, l gri), hawk (aw roz)
  // stop: accent britanic (/ɒ/ — în americană „stop" are /ɑ/, nu /ɒ/)
  o: [
    { text: 'stop', mark: 'o', accent: 'en-GB' },
    { text: 'four', mark: 'ou' },
    { text: 'salt', mark: 'a' },
    { text: 'hawk', mark: 'aw' },
  ],
  // u: moon, blue, fruit, soup
  u: [
    { text: 'moon',  mark: 'oo' },
    { text: 'blue',  mark: 'ue' },
    { text: 'fruit', mark: 'ui' },
    { text: 'soup',  mark: 'ou' },
  ],
  // ỷu: cute, music, new (în loc de use), beauty (în loc de computer).
  // new: en-GB explicit — în US „new” e /nu/ (fără yod), n-ar mai aparține coloanei /ỷu/.
  ju: [
    { text: 'cute',   mark: 'u' },
    { text: 'music',  mark: 'u' },
    { text: 'new',    mark: 'ew', accent: 'en-GB' },
    { text: 'beauty', mark: 'eau' },
  ],
  // aỷ: „my” pe primul loc
  ai: [
    { text: 'my',    mark: 'y' },
    { text: 'night', mark: 'i' },
    { text: 'time',  mark: 'i' },
    { text: 'like',  mark: 'i' },
  ],
  // aw: „flower” în loc de „now”
  au: [
    { text: 'loud',   mark: 'ou' },
    { text: 'cow',    mark: 'ow' },
    { text: 'house',  mark: 'ou' },
    { text: 'flower', mark: 'ow' },
  ],
  // ə+ (l̩/m̩): „uncle” cu accent en-GB, ca „u” să fie /ʌ/ (US îl transcrie cu schwa → ar ieși negru)
  'syllabic-lm': [
    { text: 'little', mark: 'le' },
    { text: 'table',  mark: 'le' },
    { text: 'apple',  mark: 'le' },
    { text: 'uncle',  mark: 'le', accent: 'en-GB' },
  ],
}
// Coloanele de consoane sunt NEGRE (culoare + etichetă), nu violet/portocaliu/etc. Local paginii — levels.ts neatins.
// Lecția terminată se strânge și zboară vizual în butonul ei din linia de simboluri de sus
// (clonă a coloanelor, animată peste pagină; pagina reală trece imediat la lecția următoare).
function flyGridToBar(group: number) {
  if (typeof document === 'undefined') return
  const grid = document.querySelector('.lesson-grid') as HTMLElement | null
  const btn = document.querySelector(`[data-symbol-group="${group}"]`) as HTMLElement | null
  if (!grid || !btn) return
  const a = grid.getBoundingClientRect()
  const b = btn.getBoundingClientRect()
  if (!a.width || !b.width) return
  const wrap = document.createElement('div')
  wrap.className = 'lesson-layout lesson-fly'
  wrap.setAttribute('aria-hidden', 'true')
  Object.assign(wrap.style, {
    position: 'fixed', left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`,
    margin: '0', padding: '0', zIndex: '9999', pointerEvents: 'none', transformOrigin: '0 0',
    transition: 'transform 750ms cubic-bezier(.55,0,.25,1), opacity 750ms ease-in',
  })
  wrap.appendChild(grid.cloneNode(true))
  document.body.appendChild(wrap)
  requestAnimationFrame(() => requestAnimationFrame(() => {
    wrap.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${b.width / a.width}, ${b.height / a.height})`
    wrap.style.opacity = '0.2'
  }))
  window.setTimeout(() => {
    wrap.remove()
    btn.classList.add('is-landed')
    window.setTimeout(() => btn.classList.remove('is-landed'), 600)
  }, 780)
}

const LEVELS: Level[] = ALL_LEVELS.map(lvl => ({
  ...lvl,
  lessons: lvl.lessons.map(l => ({
    ...l,
    ...(CONSONANT_IDS.has(l.id) ? { color: CONSONANT_BLACK, tabLabel: l.id === 'syllabic-lm' ? l.tabLabel : 'Negru' } : {}),
    words: (COLUMN_WORD_OVERRIDES[l.id] ?? l.words).slice(0, WORDS_PER_COLUMN),
  })),
}))

// ── Repetări automate: la deschiderea unei coloane, ascultarea pornește
//   singură și se repetă de REPS_PER_LESSON ori (câte o stea per repetare). ──
const REP_START_DELAY_MS = 900    // pauza dintre deschiderea coloanei și prima repetare
const REPLAY_GAP_MS = 1200        // pauza dintre repetările din RE-PLAY (fără animația stelei)
const REP_GAP_MS = 3000           // pauza dintre repetări (lasă loc animației stelei/vulpii, ~2850ms)
const LETTER_PULSE_GAP_MS = 1100  // pauza dintre cele 3 zvâcniri ale literei la deschiderea coloanei
const LETTER_PULSE_AFTER_MS = 7500 // așteptare după ritualul ×3 înainte de auto-repetarea cuvintelor

// Toate cuvintele din toate lecțiile, o singură dată — sursă pentru fetch-ul
// batch către /api/words la montare, care înlocuiește MarkedWord (colora
// manual doar substring-ul `mark`, cu o culoare hardcodată din CSS) cu
// WordRenderer (motorul real): fiecare literă din fiecare cuvânt își ia
// culoarea ei reală din pipeline, nu doar grupul-țintă.
const ALL_LESSON_WORDS: string[] = Array.from(new Set(
  LEVELS.flatMap(lvl => lvl.lessons.flatMap(l => l.words.map(w => w.text.toLowerCase())))
))

// ── Bulele Vulpii — toate coloanele din tot parcursul, într-o singură listă
//   plată, în ordinea în care se deblochează (nivel după nivel). Servește
//   DOAR la ales distractorii ("sunete anterioare") și sunetul următor
//   pentru mini-jocul de baloane de după fiecare coloană — nu schimbă
//   nimic din LEVELS/colUnlocked. ──
const FLAT_LESSONS: Lesson[] = LEVELS.flatMap(lvl => lvl.lessons)
function flatIndexOf(levelIdx: number, columnIdx: number): number {
  let idx = 0
  for (let i = 0; i < levelIdx; i++) idx += LEVELS[i].lessons.length
  return idx + columnIdx
}

// ── Inventar plat al tuturor simbolurilor (lecțiilor) cu poziția lor în
//   LEVELS — folosit exclusiv de bara permanentă de selectare a simbolurilor.
//   Ordinea = ordinea de deblocare; gruparea vizuală „câte patru” se face
//   în UI (gap la fiecare 4 indici). Nu modifică inventarul și nu inventează
//   simboluri. ──
const ALL_SYMBOLS: { lesson: Lesson; levelIdx: number; colIdx: number }[] =
  LEVELS.flatMap((lvl, levelIdx) =>
    lvl.lessons.map((lesson, colIdx) => ({ lesson, levelIdx, colIdx }))
  )

// Accentul de COLORARE per cuvânt (nu doar audio) — până acum `resolveAccent`
// alimenta doar redarea vocală (speak.ts); fără el trecut și la /api/words,
// motorul alegea mereu implicit varianta US pentru colorare (regulă corectă
// și intenționată pentru rhotic — vezi db.ts selectBest — dar greșită pentru
// cazuri ca STRUT, unde US-ul acestui dicționar transcrie /ʌ/ ca schwa,
// nefiind deloc despre rhotic). Construit o singură dată, la nivel de modul,
// din aceeași sursă de adevăr (`resolveAccent`) ca audio-ul, ca cele două să
// nu mai poată diverge.
const ALL_LESSON_WORD_ACCENTS: Record<string, 'uk' | 'us'> = Object.fromEntries(
  LEVELS.flatMap(lvl => lvl.lessons.flatMap(l => l.words.map(w =>
    [w.text.toLowerCase(), resolveAccent(w, l) === 'en-GB' ? 'uk' : 'us'] as const
  )))
)
// Numărul global al fiecărei lecții (1, 2, 3... peste toate nivelurile, nu
// doar 1-4 repetat per nivel) — id-ul coloanei -> poziția ei în ordinea
// completă din LEVELS. Calculat o singură dată, la nivel de modul.
const GLOBAL_LESSON_NUMBER: Record<string, number> = Object.fromEntries(
  LEVELS.flatMap(lvl => lvl.lessons.map(l => l.id)).map((id, i) => [id, i + 1])
)

// Numărătoare grosieră de silabe, doar ca să decidem dacă un cuvânt e
// monosilabic (caz în care sublinierea accentului dispare complet — regula
// 4.2 din protocolul fonologic — dar culoarea rămâne).
function countSyllables(word: string): number {
  const w = word.toLowerCase()
  const groups = w.match(/[aeiouy]+/g)
  let count = groups ? groups.length : 1
  if (w.endsWith('e') && !w.endsWith('le') && count > 1) count--
  return Math.max(count, 1)
}

// /ɔɪ/ off-glide diacritic (Vulpea șireată legend: "boỷ=ỉ") — the print
// reference marks the SECOND letter of the "oy"/"oi" spelling with a
// diacritic instead of a plain letter: 'y' → 'ỷ' ("boy" → "boỷ"), 'i' → 'ỉ'
// ("point"/"coin" → "poỉnt"/"coỉn"). Scoped to lesson id 'oi' only — this is
// the one column the reference book shows this for; other diphthong columns
// (ai/au/ei/ju) aren't confirmed against the book yet, so left untouched.
// Per Dorel's request, the diacritic letter is ALSO its own colour — red
// #CC0000, distinct from the column's magenta (var(--lesson-color)) that
// the rest of "oy"/"oi" keeps. Matches engine/display.ts's OFFGLIDE_COLOR.
const OFFGLIDE_DIACRITIC: Record<string, string> = { y: 'ỷ', Y: 'Ỷ', i: 'ỉ', I: 'Ỉ' }
const OFFGLIDE_COLOR = '#CC0000'

// Randează un cuvânt colorând + subliniind DOAR grupul-țintă (mark). w și y
// au statut de vocală (ca a/e/i/o/u) — deci literele colorate ȘI subliniate
// din interiorul mark-ului sunt vocale+w+y; consoanele adevărate rămân
// negre/gri, niciodată colorate. La cuvinte monosilabice sublinierea
// dispare complet, culoarea rămâne.
function MarkedWord({ text, mark, lessonId, isLocked, isPlaying }: { text: string; mark: string; lessonId?: string; isLocked?: boolean; isPlaying?: boolean }) {
  const idx = text.toLowerCase().indexOf(mark.toLowerCase())
  const isMonosyllabic = countSyllables(text) === 1

  if (idx === -1) return <>{text}</>

  const markEnd  = idx + mark.length
  const before   = text.slice(0, idx)
  const markText = text.slice(idx, markEnd)
  const after    = text.slice(markEnd)
  const isVowelLike = (ch: string) => /[aeiouwy]/i.test(ch) // vocale + w + y — colorare ȘI underline

  // Doar coloana 'oi' (/ɔɪ/): ultima literă a mark-ului ('y' sau 'i') se
  // afișează cu diacritic ȘI cu propria culoare roșie, restul mark-ului
  // (ex. 'o') rămâne pe culoarea coloanei (magenta).
  const diacriticIdx = lessonId === 'oi' && markText.length > 0
    ? markText.length - 1
    : -1

  // Coloana 'ou' (/əʊ/): engine/display.ts randează acest sunet mereu cu
  // tricolorul românesc (albastru/galben/roșu, gradient vertical pe
  // fereastra de cerneală a fontului), niciodată galben plat — vezi
  // TRICOLOR_GRADIENT_SOUNDS din display.ts și lib/tricolorStyle.ts.
  // Fiecare literă a mark-ului își ia propriul ciclu tricolor complet
  // (verificat pe "Vulpea șireată" — "oa"/"ow" nu întind un singur
  // gradient pe ambele litere). Coloanele blocate rămân pe stilul vechi
  // (culoare plată, estompată de CSS) ca să nu se "trădeze" prin gradient.
  const triBands = bandsFor(lessonId ?? '')   // 'ou' → tricolor românesc; 'wa' → negru–galben–negru
  const isTricolorLesson = !!triBands && !isLocked
  // În „mercy”, litera e are un underscore negru, separat de marcajul c → /s/.
  const underlineMercyE = text.toLowerCase() === 'mercy' && mark.toLowerCase() === 'c'

  return (
    <>
      {underlineMercyE
        ? [...before].map((ch, i) => (
            <span
              key={i}
              style={i === 1 ? {
                textDecoration: 'underline',
                textDecorationColor: '#000',
                textUnderlineOffset: '4.7px',
                textDecorationThickness: '2px',
              } : undefined}
            >
              {ch}
            </span>
          ))
        : before}
      {[...markText].map((ch, i) => {
        const vowelLike = isVowelLike(ch)

        if (isTricolorLesson && vowelLike) {
          const underline = !isMonosyllabic
          return (
            <span
              key={i}
              style={{
                ...tricolorLetterStyle(2, 1, triBands ?? undefined),
                // `currentColor` (used by .lesson-word.is-playing's glow
                // rule) is 'transparent' here since the gradient fill sets
                // color:transparent — so the playing-glow needs its own
                // explicit white drop-shadow instead of relying on the
                // shared CSS class.
                ...(isPlaying ? { filter: 'drop-shadow(0 0 3px #fff) drop-shadow(0 0 8px #FCD116)' } : {}),
                ...(underline
                  ? {
                      textDecoration: 'underline',
                      textDecorationColor: underlineColorFor(triBands!),
                      textUnderlineOffset: '4.7px',
                      textDecorationThickness: '2px',
                    }
                  : {}),
              }}
            >
              {ch}
            </span>
          )
        }

        const classes = [
          vowelLike ? 'lesson-word-mark' : '',
          vowelLike && !isMonosyllabic ? 'lesson-word-mark-underline' : '',
        ].filter(Boolean).join(' ')
        const isDiacritic = i === diacriticIdx
        const display = lessonId === 'zh' && ch.toLowerCase() === 's' ? 'š' : (isDiacritic ? (OFFGLIDE_DIACRITIC[ch] ?? ch) : ch)
        const style = isDiacritic ? { color: OFFGLIDE_COLOR } : undefined
        return <span key={i} className={classes || undefined} style={style}>{display}</span>
      })}
      {after}
    </>
  )
}

/* Același stil de simbol în bara permanentă și în antetul coloanei.
   Păstrează excepțiile vizuale (tricolor, diacritică roșie, alb conturat)
   într-un singur loc, ca cele două reprezentări să nu divergă. */
// Simbolul din CAPUL coloanei poate fi altul decât simbolul lecției: la coloana „đ" (-ed → /t/) capul
// arată „t". La activare (ritual / click) apare în dreapta un tabel mic cu variantele grafice
// care corespund sunetului (ex. sh → ŝ, t̂, ŝŝ, ĉ). Capul coloanei + butoane = simbol de BAZĂ
// (sh, z, gz…); variantele doar în acest tabel la activare.
const HEAD_SYMBOL_ALIAS: Record<string, { show: string; eq: string }> = {
  'd-hat': { show: 't', eq: 'đ' },
  zh: { show: 'zh', eq: 'š' },
}
// Variante grafice care apar într-un tabel mic la dreapta simbolului activat.
// Cheie = lesson.id. Valorile = glifele (cu diacritice) care scriu același sunet.
const HEAD_SYMBOL_VARIANTS: Record<string, string[]> = {
  // sh: echivalente grafice, afișate la activare.
  sh: ['ŝ', 't̂', 'ŝŝ', 'ĉ'],
  // gz: glife echivalente, imitând pulsul simbolului principal x̊.
  'ring-gz': ['x', 'gz'],
  // cent: baza = „s” (cap + butoane); ƈ = variantă.
  'c-hook': ['ƈ'],
}
const HEAD_EQ_VISIBLE_MS = 2800

function lessonSymbolTextStyle(lesson: Lesson, unlocked: boolean): CSSProperties | undefined {
  if (!unlocked) return undefined
  const sv = symbolView(lesson)
  const tri = bandsFor(lesson.id)
  if (tri) return tricolorLetterStyle(8, 0.7, tri)
  if (sv.whiteOutlined) return WHITE_OUTLINED_TEXT_STYLE
  if (lesson.id === 'oi') return { color: OFFGLIDE_COLOR }
  return { color: sv.color }
}

export default function LearnPage() {
  const [levelIndex, setLevelIndex]         = useState(0)
  // Bara este împărțită în grupuri fixe de câte patru simboluri.
  // Selectarea unui grup nou activează prima lui coloană deblocată (mare, sus; celelalte mici dedesubt).
  const [selectedSymbolGroup, setSelectedSymbolGroup] = useState(0)
  // direcția ultimei mutări a grupului (pentru animația de glisare pe telefon); n re-montează bara
  const [groupSlide, setGroupSlide] = useState<{ dir: 0 | 1 | -1; n: number }>({ dir: 0, n: 0 })
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null)
  const [unlockedLevels, setUnlockedLevels] = useState<boolean[]>(() => LEVELS.map((_, i) => i === 0))
  // Dimensionat dinamic din level.lessons.length — NU mai presupune 4
  // lecții/nivel (era hardcodat, bug găsit la Nivelul 5, care are 1 singură
  // coloană: cu [i===0,false,false,false] hardcodat, coloana 0 a oricărui
  // nivel cu alt număr de lecții decât 4 fie nu se deschidea, fie array-ul
  // avea sloturi fantomă în plus).
  const [colUnlocked, setColUnlocked]       = useState<boolean[][]>(() => LEVELS.map((lvl, i) => lvl.lessons.map((_, ci) => i === 0 && ci === 0)))
  const [starsEarned, setStarsEarned]       = useState<number[][]>(() => LEVELS.map(lvl => lvl.lessons.map(() => 0)))
  const [active, setActive]                 = useState(0)

  // ── OnboardingSoundIntro — micro-demo animat, o singură dată per lecție
  //   ("prima dată când elevul deschide o categorie nouă de sunet"). Set de
  //   id-uri de lecție deja văzute, persistat separat de progres — ca elevul
  //   să nu re-vadă demo-ul la fiecare vizită, doar prima dată per sunet.
  const [seenIntros, setSeenIntros] = useState<Set<string>>(() => new Set())
  const [introHydrated, setIntroHydrated] = useState(false)
  const [introLesson, setIntroLesson] = useState<Lesson | null>(null)
  // Cuvântul demo din cardul „Un sunet nou": coloana /a/ folosește „bug" (doar „u" colorat),
  // celelalte coloane primul cuvânt. Doar literele din `mark` se colorează.
  const introExample: LessonWord | null = introLesson
    ? (introLesson.id === 'a' ? introLesson.words.find(w => w.text === 'bug') : undefined) ?? introLesson.words[0]
    : null
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SOUND_INTRO_SEEN_KEY)
      if (raw) setSeenIntros(new Set(JSON.parse(raw)))
    } catch { /* ignore */ }
    setIntroHydrated(true)
  }, [])

  // ── Nota "beginner" (th=t, dh=d) — un mesaj de la vulpe, o singură dată
  //   per lecție care are `beginnerNote`, NU o transformare de randare/audio
  //   (analogia din carte e cu sunete ROMÂNEȘTI, nu o schimbare a
  //   cuvântului englezesc). Tracking separat de seenIntros — sunt lucruri
  //   conceptual diferite (demo animat vs. sfat text).
  const [seenBeginnerNotes, setSeenBeginnerNotes] = useState<Set<string>>(() => new Set())
  const [beginnerNoteHydrated, setBeginnerNoteHydrated] = useState(false)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(BEGINNER_NOTE_SEEN_KEY)
      if (raw) setSeenBeginnerNotes(new Set(JSON.parse(raw)))
    } catch { /* ignore */ }
    setBeginnerNoteHydrated(true)
  }, [])
  const [allDone, setAllDone]               = useState(false)
  const [showEic2Menu, setShowEic2Menu]     = useState(false)   // meniul „Continuă ▾" de pe ecranul allDone (Reia EiC1 / Joacă EiC2)

  const [playingWord, setPlayingWord]       = useState<string | null>(null)
  // Coloana căreia îi aparține playingWord — necesar ca să nu se aprindă
  // vizual un cuvânt dintr-o altă coloană care are întâmplător același text
  // (ex. "the" poate apărea în mai multe lecții).
  const [playingColId, setPlayingColId]     = useState<string | null>(null)
  const [isPlayingRep, setIsPlayingRep]     = useState(false)
  // Câte treceri complete pe coloană în RE-PLAY curent — Omite apare după prima (ca stars >= 1)
  const [replayPassesDone, setReplayPassesDone] = useState(0)
  // true când RE-PLAY a fost oprit cu „Stop" (nu se deschide subjocul); „Skip" lasă false
  const replayStopRef = useRef(false)
  // Coloana (nivel:index) pe care ai ajuns întrerupând o alta cu un click: antrenamentul/repetarea
  // NU pornește singur pe ea, ci doar când apeși REPEAT.
  const [pausedColKey, setPausedColKey] = useState<string | null>(null)
  // false pentru repetările pornite automat la navigare (click coloană, săgeți, bara de simboluri): rămân fără joc
  const replayOpensGameRef = useRef(true)
  // 0–100: cât din repetarea curentă (toate trecerile) a fost citit — umple butonul REPEAT/STOP
  const [replayProgress, setReplayProgress] = useState(0)
  const [poppingStarIndex, setPoppingStarIndex] = useState<number | null>(null)
  const [celebrating, setCelebrating]       = useState(false)
  const [freePracticeCount, setFreePracticeCount] = useState(0)
  // ── Zvâcnirea literei din capul coloanei (ex. coloana /a/ la start: 3× sunet + pulse)
  const [letterPulseId, setLetterPulseId] = useState<string | null>(null)
  const letterPulseDoneRef = useRef<Set<string>>(new Set())

  // ── Level-scope celebration state ──
  const [levelCelebrating, setLevelCelebrating]   = useState(false)
  const [showLevelOverlay, setShowLevelOverlay]   = useState(false)
  // Bulele Vulpii — config-ul jocului de baloane deschis după coloana curentă
  // (null = nu rulează). Avansul normal (deblocare coloană/nivel), calculat
  // în handleMainButton/handleStudiedButton, e ținut minte aici și rulat
  // abia când copilul termină/sare peste joc — vezi pendingAdvanceRef.
  const [buleleVulpiiConfig, setBuleleVulpiiConfig] = useState<BuleleVulpiiOverlayConfig | null>(null)
  const pendingAdvanceRef = useRef<(() => void) | null>(null)
  const [justRevealedIndex, setJustRevealedIndex] = useState<number | null>(null)

  // ── Vulpea de recompensă — chiar când o repetiție se termină cu succes,
  //   vulpița „pornește" de lângă coloană, merge la steaua tocmai câștigată, o
  //   apucă și o duce la cupa coloanei active; dacă acea stea a completat
  //   coloana, apucă apoi cupa coloanei și o cară/o varsă în cupa mare de
  //   nivel din sidebar (vezi MascotReward.tsx pentru cronologia completă).
  //   Cupele/stelele se actualizează oricum prin propriul state React — asta
  //   e doar „mesagerul" vizual, poziționat prin getBoundingClientRect pe
  //   elementele reale (steaua din listă, cupa coloanei, cupa mare),
  //   calculate o singură dată, în momentul în care se câștigă steaua. ──
  const { animation: mascotAnimation, startReward, stopReward: cancelMascotReward } = useMascotReward()
  const starRefs = useRef<Record<string, HTMLSpanElement | null>>({})
  const cupRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const bigCupRef = useRef<HTMLDivElement | null>(null)
  const colRefs = useRef<Record<string, HTMLDivElement | null>>({})   // coloanele din grilă — pentru derularea automată pe telefon
  // Coloana a cărei cupă e „golită" vizual chiar acum de vulpe, cât timp o
  // duce/o varsă în cupa mare — vezi .fill-cup.is-emptying în globals.css.
  // Progresul real (React state) rămâne 100%; doar acest flag temporar
  // schimbă înfățișarea cupei coloanei respective cât ține animația.
  const [emptyingColumnId, setEmptyingColumnId] = useState<string | null>(null)

  // ── Resetarea completă a jocului (buton + modal de confirmare) ──
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // ── Viteza între cuvinte — ajustabilă prin slider, persistă în localStorage ──
  const [autoDelayMs, setAutoDelayMs] = useState(AUTO_DELAY_MS)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTO_DELAY_KEY)
      if (saved) setAutoDelayMs(Number(saved))
    } catch { /* ignore */ }
  }, [])
  useEffect(() => {
    try { localStorage.setItem(AUTO_DELAY_KEY, String(autoDelayMs)) } catch { /* ignore */ }
  }, [autoDelayMs])

  // ── Cuvinte de exersat — un cuvânt apăsat individual de REVIEW_THRESHOLD
  //   ori ajunge automat aici, ca semn că pare dificil pentru cel care învață ──
  const [wordClickCounts, setWordClickCounts] = useState<Record<string, number>>({})
  // HYDRATION FIX (2026-08-30): asta era inițializat printr-un lazy
  // initializer care citea localStorage direct în useState(() => ...),
  // spre deosebire de restul stărilor din fișier (vezi autoDelayMs mai sus)
  // care toate încarcă din localStorage într-un useEffect după montare.
  // Efectul practic: pe server reviewWords era mereu [] (localStorage nu
  // există), dar la PRIMUL render pe client lazy-initializer-ul chiar citea
  // valoarea salvată dintr-o vizită anterioară — dacă exista vreun cuvânt
  // de exersat, acel prim render de client producea markup diferit de cel
  // trimis de server (blocul <div className="review-panel"> apărea doar pe
  // client), exact mismatch-ul din eroarea de hidratare. Aliniat acum la
  // același tipar cu celelalte: default gol, încărcare reală în useEffect.
  const [reviewWords, setReviewWords] = useState<{ word: string; colId: string; accent: Accent }[]>([])
  useEffect(() => {
    try {
      const raw = localStorage.getItem('eic-review-words')
      if (raw) setReviewWords(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])
  useEffect(() => {
    try { localStorage.setItem('eic-review-words', JSON.stringify(reviewWords)) } catch { /* ignore */ }
  }, [reviewWords])

  // ── Vulpea-asistent — coadă de mesaje declanșate de evenimentele jocului ──
  const [foxQueue, setFoxQueue] = useState<FoxTip[]>([])
  // Meniul lui Aik (Ce să fac acum? / Repetă sunetul / Am nevoie de ajutor) se deschide din butonul
  // HELP (tăblița de lemn de deasupra medalionului) — nu din medalion și nu la trecerea cursorului.
  const [helpMenuOpen, setHelpMenuOpen] = useState(false)
  useEffect(() => {
    if (!helpMenuOpen) return
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest('.aik-help')) return
      setHelpMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setHelpMenuOpen(false) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey) }
  }, [helpMenuOpen])
  const triggerFox = useCallback((text: string, mood?: FoxMood) => {
    setFoxQueue(q => [...q, { id: `${Date.now()}-${Math.random()}`, text, mood }])
  }, [])
  const dequeueFox = useCallback(() => setFoxQueue(q => q.slice(1)), [])

  const [hydrated, setHydrated] = useState(false)
  // ── intro-ul cu vulpea mare, la centru, care „zboară" apoi spre medalionul de sus
  //    (capul lui Aik din coloana activă) — vezi MascotIntro.tsx. Mesajele lui Aik
  //    (FoxTips) apar abia după aterizare. ──
  const [introDone, setIntroDone] = useState(false)
  const autoCancel  = useRef(false)
  // Holds a { pause } handle for whatever's currently speaking (Web Speech API),
  // so the cleanup/stop logic below can silence it instantly either way.
  const currentAudio = useRef<{ pause: () => void } | null>(null)

  // ── Warm up the speech-synthesis voice list so the first playWord() has it ready ──
  useEffect(() => { warmUpVoices() }, [])

  // ── Colorare reală per cuvânt — fetch batch la montare către /api/words,
  //   cu accentul de colorare corect per cuvânt (ALL_LESSON_WORD_ACCENTS,
  //   vezi comentariul de mai sus). Până când sosește răspunsul (sau dacă
  //   fetch-ul eșuează), MarkedWord rămâne fallback-ul vizual. ──
  const [wordNodes, setWordNodes] = useState<Record<string, RenderNode[]>>({})
  useEffect(() => {
    let cancelled = false
    fetch('/api/words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words: ALL_LESSON_WORDS, accents: ALL_LESSON_WORD_ACCENTS }),
    })
      .then(res => res.json())
      .then((data: { results?: Record<string, RenderNode[]> }) => {
        if (!cancelled && data.results) setWordNodes(data.results)
      })
      .catch(() => { /* MarkedWord fallback rămâne activ */ })
    return () => { cancelled = true }
  }, [])

  // ── Restore progress from a previous visit ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SavedProgress>
        if (saved.levelIndex !== undefined) setLevelIndex(saved.levelIndex)
        if (saved.unlockedLevels) setUnlockedLevels(saved.unlockedLevels)
        if (saved.colUnlocked) setColUnlocked(saved.colUnlocked)
        if (saved.starsEarned) setStarsEarned(saved.starsEarned.map(row => row.map(v => Math.min(v, REPS_PER_LESSON))))   // salvări vechi (5 stele/coloană) → plafonate la noul REPS_PER_LESSON
        if (saved.active !== undefined) setActive(saved.active)
        if (saved.allDone) setAllDone(saved.allDone)
      }
    } catch { /* ignore */ }
    // `hydrated` is real state (not a ref) on purpose: the save-effect below
    // is gated on it via its dependency array, so it only actually runs on
    // the render AFTER these restored values have landed — never on the
    // same pass, with the still-default values, which used to silently
    // overwrite a real saved progress with zeros every time this page
    // remounted (e.g. going home and back mid-lesson).
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      const toSave: SavedProgress = { levelIndex, unlockedLevels, colUnlocked, starsEarned, active, allDone }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch { /* ignore */ }
  }, [hydrated, levelIndex, unlockedLevels, colUnlocked, starsEarned, active, allDone])

  // ── Reluare la revenire — exercițiul continuă singur de unde a rămas
  //   (coloana activă + stelele sunt deja restaurate mai sus; efectul de
  //   repetări automate pornește următoarea repetare). Un singur caz cere
  //   reparat: dacă utilizatorul a plecat în timpul jocului de baloane,
  //   avansul amânat (deblocarea coloanei/nivelului următor) s-a pierdut —
  //   îl refacem aici, o singură dată, imediat după restaurare. ──
  const resumedRef = useRef(false)
  useEffect(() => {
    if (!hydrated || resumedRef.current) return
    resumedRef.current = true
    if ((starsEarned[levelIndex]?.[active] ?? 0) < REPS_PER_LESSON) return
    const lvl = LEVELS[levelIndex]
    if (active + 1 < lvl.lessons.length) {
      if (colUnlocked[levelIndex][active + 1]) return
      setColUnlocked(prev => {
        const copy = prev.map(row => [...row])
        copy[levelIndex][active + 1] = true
        return copy
      })
      setActive(active + 1)
      return
    }
    // ultima coloană a nivelului, terminată, dar nivelul următor încă blocat
    const levelFinished = starsEarned[levelIndex].every(v => v >= REPS_PER_LESSON)
    const isLast = levelIndex === LEVELS.length - 1
    if (levelFinished && (isLast ? !allDone : !unlockedLevels[levelIndex + 1])) {
      if (isLast) setAllDone(true)
      setShowLevelOverlay(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  // ── Salut doar la prima vizită; la reveniri vulpea nu mai spune nimic („Bine ai revenit" a fost scos) ──
  useEffect(() => {
    const seenBefore = (() => {
      try { return localStorage.getItem('eic-fox-seen') === '1' } catch { return false }
    })()
    if (!seenBefore) triggerFox('Salut! Sunt Aik și te ajut la lecție 🦊', 'greeting')
    try { localStorage.setItem('eic-fox-seen', '1') } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Leaving the column (or the level) mid-repetition also stops playback ──
  useEffect(() => {
    setCelebrating(false)
    setPoppingStarIndex(null)
    setFreePracticeCount(0)
  }, [active, levelIndex])

  useEffect(() => {
    return () => {
      autoCancel.current = true
      currentAudio.current?.pause()
    }
  }, [])

  // ── Overlay-ul de nivel e un modal pe tot ecranul — blocăm scroll-ul de fundal cât e deschis ──
  useEffect(() => {
    document.body.style.overflow = showLevelOverlay ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showLevelOverlay])

  const level     = LEVELS[levelIndex]
  const lesson    = level.lessons[active]
  const visibleSymbolGroup = ALL_SYMBOLS.slice(selectedSymbolGroup * 4, selectedSymbolGroup * 4 + 4)
  // Telefon: bara arată doar grupul selectat (mare, între săgeți) și vecinii lui (mici, stânga/dreapta).
  const symbolGroupCount = Math.ceil(ALL_SYMBOLS.length / 4)
  const symbolGroupUnlocked = (g: number) =>
    ALL_SYMBOLS.slice(g * 4, g * 4 + 4).some(item => !!colUnlocked[item.levelIdx]?.[item.colIdx])
  const canGoPrevGroup = selectedSymbolGroup > 0 && symbolGroupUnlocked(selectedSymbolGroup - 1)
  const canGoNextGroup = selectedSymbolGroup < symbolGroupCount - 1 && symbolGroupUnlocked(selectedSymbolGroup + 1)

  // Bara urmărește coloana de antrenat: când se schimbă coloana activă (avans, săgeți, click),
  // grupul ei devine grupul selectat (mare, la mijloc).
  useEffect(() => {
    const idx = ALL_SYMBOLS.findIndex(it => it.levelIdx === levelIndex && it.colIdx === active)
    if (idx >= 0) setSelectedSymbolGroup(Math.floor(idx / 4))
  }, [levelIndex, active])

  // Alegerea unui grup nou (buton, săgeți, swipe): prima coloană deblocată din grup devine
  // coloana activă (mare, sus), iar celelalte trei stau mici dedesubt. Dacă grupul conține deja
  // coloana activă, rămâne ea. Coloana nouă se activează ca la selectarea unui simbol
  // (fără start automat dacă ai întrerupt o coloană; antrenamentul pornește la REPEAT).
  const selectSymbolGroup = (n: number) => {
    if (n === selectedSymbolGroup || n < 0 || n >= symbolGroupCount || !symbolGroupUnlocked(n)) return
    const items = ALL_SYMBOLS.slice(n * 4, n * 4 + 4)
    setSelectedSymbolGroup(n)
    setGroupSlide(prev => ({ dir: n > selectedSymbolGroup ? 1 : -1, n: prev.n + 1 }))
    if (items.some(it => it.levelIdx === levelIndex && it.colIdx === active)) return
    const first = items.find(it => !!colUnlocked[it.levelIdx]?.[it.colIdx])
    if (first) selectSymbol(first.levelIdx, first.colIdx)
  }
  // dir: 1 = grupul următor, -1 = grupul anterior (săgeți sau swipe)
  const goSymbolGroup = (dir: 1 | -1) => selectSymbolGroup(selectedSymbolGroup + dir)
  // Swipe stânga/dreapta pe linia de simboluri și pe coloane (doar telefon):
  // deget spre stânga → grupul următor; spre dreapta → grupul anterior.
  const swipeProps = {
    onTouchStart: (e: ReactTouchEvent) => {
      const t = e.touches[0]
      swipeStartRef.current = t ? { x: t.clientX, y: t.clientY } : null
    },
    onTouchEnd: (e: ReactTouchEvent) => {
      const st = swipeStartRef.current
      swipeStartRef.current = null
      const t = e.changedTouches[0]
      if (!st || !t || !window.matchMedia('(max-width: 720px)').matches) return
      const dx = t.clientX - st.x, dy = t.clientY - st.y
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return   // doar mișcare clar orizontală
      goSymbolGroup(dx < 0 ? 1 : -1)
    },
    onTouchCancel: () => { swipeStartRef.current = null },
  }

  // Declanșează OnboardingSoundIntro prima dată când o lecție (deblocată)
  // devine activă și n-a fost încă văzută. Nu rulează pentru lecții
  // blocate — abia când elevul chiar ajunge la ea.
  useEffect(() => {
    if (!introHydrated) return
    if (!lesson) return
    if (!colUnlocked[levelIndex]?.[active]) return
    if (seenIntros.has(lesson.id)) return
    setIntroLesson(lesson)
  }, [introHydrated, lesson, active, levelIndex, colUnlocked, seenIntros])

  const handleIntroComplete = useCallback(() => {
    if (!introLesson) return
    setSeenIntros(prev => {
      const next = new Set(prev)
      next.add(introLesson.id)
      try { localStorage.setItem(SOUND_INTRO_SEEN_KEY, JSON.stringify([...next])) } catch { /* ignore */ }
      return next
    })
    setIntroLesson(null)
  }, [introLesson])

  // Declanșează nota "beginner" prima dată când o lecție cu `beginnerNote`
  // (deblocată) devine activă. Așteaptă ca OnboardingSoundIntro să nu mai
  // fie pe ecran (introLesson === null) — două mesaje simultan ar fi
  // aglomerat, nu blocant unul pentru celălalt altfel.
  useEffect(() => {
    if (!beginnerNoteHydrated) return
    if (!lesson?.beginnerNote) return
    if (introLesson) return
    if (!colUnlocked[levelIndex]?.[active]) return
    if (seenBeginnerNotes.has(lesson.id)) return

    triggerFox(lesson.beginnerNote, 'hint')
    setSeenBeginnerNotes(prev => {
      const next = new Set(prev)
      next.add(lesson.id)
      try { localStorage.setItem(BEGINNER_NOTE_SEEN_KEY, JSON.stringify([...next])) } catch { /* ignore */ }
      return next
    })
  }, [beginnerNoteHydrated, lesson, introLesson, active, levelIndex, colUnlocked, seenBeginnerNotes, triggerFox])

  const earned    = starsEarned[levelIndex][active]
  const hasTrophy = earned >= REPS_PER_LESSON

  const levelStars    = starsEarned[levelIndex]
  const totalLevelStars = levelStars.reduce((a, b) => a + b, 0)
  const maxLevelStars   = level.lessons.length * REPS_PER_LESSON
  const levelMastered   = totalLevelStars >= maxLevelStars
  const progressPct     = Math.round((totalLevelStars / maxLevelStars) * 100)

  const isLastLevel = levelIndex === LEVELS.length - 1
  const nextLevel   = !isLastLevel ? LEVELS[levelIndex + 1] : null

  // ── Un nivel e „terminat" dacă toate cele 4 coloane ale lui au 5 stele —
  //   calculat direct din starsEarned, NU din compararea cu levelIndex
  //   curent, tocmai ca să rămână corect și atunci când utilizatorul se
  //   întoarce să revadă un nivel mai vechi (vezi visitLevel mai jos):
  //   levelIndex arată ce se VEDE acum pe ecran, nu neapărat cât de departe
  //   a ajuns utilizatorul. ──
  const isLevelDone = useCallback((i: number) => (
    LEVELS[i].lessons.every((_, ci) => starsEarned[i][ci] >= REPS_PER_LESSON)
  ), [starsEarned])

  // The single locked column right after the active one — the one that's
  // "about to be offered". Progression is strictly linear so at most one
  // column ever carries this state.
  const nextUpIndex = colUnlocked[levelIndex].findIndex((u, i) => !u && (i === 0 || colUnlocked[levelIndex][i - 1]))

  // ── playWord — simplificat, fără urmărire boundary/fallback pe litere.
  //   Tot butonul cuvântului se mărește proporțional (vezi CSS
  //   .lesson-word.is-playing) cât timp e activ; nimic nu mai avansează
  //   progresiv pe litere în timp ce vorbește vocea. ──
  const playWord = useCallback(async (word: string, colId: string, accent: Accent = 'en-US') => {
    setPlayingWord(word)
    setPlayingColId(colId)
    try {
      const { promise, stop } = speakWord(word, { accent })
      currentAudio.current = { pause: stop }
      await promise
      if (currentAudio.current?.pause === stop) currentAudio.current = null
    } catch { /* ignore */ }
    setPlayingWord(null)
    setPlayingColId(null)
  }, [])

  // ── Plays every word in a column exactly once, in order, cu pauza dintre
  //   cuvinte controlată de slider-ul de viteză (autoDelayMs) și accentul
  //   fiecărui cuvânt rezolvat individual (word.accent > lesson.accent). ──
  const playColumnOnce = useCallback(async (l: Lesson, onWordDone?: (wi: number) => void) => {
    for (let wi = 0; wi < l.words.length; wi++) {
      if (autoCancel.current) break
      await playWord(l.words[wi].text, l.id, resolveAccent(l.words[wi], l))
      if (autoCancel.current) break
      onWordDone?.(wi)
      if (wi < l.words.length - 1) {
        await new Promise(res => setTimeout(res, autoDelayMs))
      }
    }
  }, [playWord, autoDelayMs])

  // ── Main button: one press = one repetition of the active column. La a
  //    5-a repetiție reușită, coloana avansează SINGURĂ spre următoarea
  //    (fără butonul „Continuă" — regula 4), iar când tot nivelul e
  //    masterizat, apare overlay-ul de nivel. ──
  const handleMainButton = useCallback(async () => {
    if (isPlayingRep) return

    if (showLevelOverlay) {
      setShowLevelOverlay(false)
      setLevelCelebrating(false)
      {
        const g = selectedSymbolGroup
        const gItems = ALL_SYMBOLS.slice(g * 4, g * 4 + 4)
        if (gItems.length && gItems.every(it => (starsEarned[it.levelIdx]?.[it.colIdx] ?? 0) >= REPS_PER_LESSON)) flyGridToBar(g)
      }
      if (nextLevel) {
        const next = levelIndex + 1
        setUnlockedLevels(prev => {
          if (prev[next]) return prev
          const copy = [...prev]; copy[next] = true; return copy
        })
        setColUnlocked(prev => {
          if (prev[next][0]) return prev
          const copy = prev.map(row => [...row])
          copy[next][0] = true
          return copy
        })
        setLevelIndex(next)
        setActive(0)
        setJustRevealedIndex(0)
        setTimeout(() => setJustRevealedIndex(null), REVEAL_MS)
      }
      return
    }

    autoCancel.current = false
    setIsPlayingRep(true)
    await playColumnOnce(lesson)
    setIsPlayingRep(false)
    if (autoCancel.current) return

    // Already mastered — this is just a free practice replay, no star/trophy changes,
    // but the button keeps counting 1→5→1… so it still feels like a game, not a dead end.
    if (starsEarned[levelIndex][active] >= REPS_PER_LESSON) {
      setFreePracticeCount(c => c + 1)
      return
    }

    const newCount = Math.min(starsEarned[levelIndex][active] + 1, REPS_PER_LESSON)
    setPoppingStarIndex(newCount - 1)
    setTimeout(() => setPoppingStarIndex(null), POP_DURATION_MS)
    triggerFox('Bravo, o stea în plus! 🌟', 'celebrate')
    playStarChime()

    const updatedLevelStars = levelStars.map((v, idx) => (idx === active ? newCount : v))
    setStarsEarned(prev => prev.map((row, li) => (li === levelIndex ? updatedLevelStars : row)))

    const columnIsComplete = newCount === REPS_PER_LESSON

    // ── Vulpea de recompensă: pornește din poziția reală a stelei tocmai
    //   câștigate, a cupei coloanei active și a cupei mari, citite chiar
    //   acum prin getBoundingClientRect — un singur calcul, nu o urmărire
    //   continuă. Dacă din orice motiv unul dintre elemente nu e încă
    //   montat, sărim peste efectul vizual fără să blocăm restul logicii
    //   (stelele/cupele se actualizează oricum, prin state-ul React de mai
    //   sus). Cât timp vulpea cară cupa coloanei spre cupa mare (doar la
    //   coloana completă), acea cupă e marcată `emptying` — vezi
    //   .fill-cup.is-emptying în globals.css — sincronizat cu timpii din
    //   MascotReward.tsx (apucarea cupei la 2300ms, overlay-ul dispare la
    //   6000ms). ──
    const starEl    = starRefs.current[`${lesson.id}-${newCount - 1}`]
    const columnCup = cupRefs.current[lesson.id]
    const bigCup    = bigCupRef.current
    if (starEl && columnCup && bigCup) {
      startReward({
        starElement: starEl,
        columnCupElement: columnCup,
        bigCupElement: bigCup,
        columnIsComplete,
        starColor: lesson.color,
      })
      if (columnIsComplete) {
        const completingColumnId = lesson.id
        setTimeout(() => setEmptyingColumnId(completingColumnId), 2300)
        setTimeout(() => setEmptyingColumnId(cur => (cur === completingColumnId ? null : cur)), 6000)
      }
    }

    if (columnIsComplete) {
      setCelebrating(true)

      const completingLevelIndex = levelIndex
      const completingActive = active
      const completingLevel = level
      const completingIsLastLevel = isLastLevel

      // ── Avansul normal (deblocare coloană/nivel), amânat până termină/sare
      //    peste Bulele Vulpii — vezi pendingAdvanceRef mai jos. ──
      const advance = () => {
        const isLastColumn = completingActive + 1 >= completingLevel.lessons.length
        if (!isLastColumn) {
          setColUnlocked(prev => {
            if (prev[completingLevelIndex][completingActive + 1]) return prev
            const copy = prev.map(row => [...row])
            copy[completingLevelIndex][completingActive + 1] = true
            return copy
          })
          setJustRevealedIndex(completingActive + 1)
          setTimeout(() => setJustRevealedIndex(null), REVEAL_MS)
          triggerFox('S-a deschis o coloană nouă!', 'celebrate')
          setActive(completingActive + 1)
        }

        // Every column in the level mastered → a full-screen overlay celebrates
        // the level with its own beautiful cup, then either the next level
        // unlocks or, on the final level, the whole journey is done.
        if (updatedLevelStars.every(v => v >= REPS_PER_LESSON)) {
          setLevelCelebrating(true)
          setShowLevelOverlay(true)
          playLevelFanfare()
          setTimeout(() => setLevelCelebrating(false), LEVEL_POP_MS)
          if (completingIsLastLevel) setAllDone(true)
        }
      }

      // ── Bulele Vulpii — după fiecare coloană terminată, jocul de baloane
      //    pentru sunetul tocmai încheiat (1-2 sunete anterioare ca
      //    distractori, sunetul următor din parcurs ca al 4-lea buton).
      //    PROPUNERE ne-confirmată încă: distractorii sunt pur și simplu
      //    ultimele până la 2 coloane parcurse înaintea celei curente, NU
      //    cele mai greșite real (nimic nu urmărește asta încă). ──
      pendingAdvanceRef.current = advance
      const flatIdx = flatIndexOf(completingLevelIndex, completingActive)
      setBuleleVulpiiConfig({
        lesson,
        distractorLessons: FLAT_LESSONS.slice(Math.max(0, flatIdx - 2), flatIdx).reverse(),
        nextLesson: FLAT_LESSONS[flatIdx + 1] ?? null,
      })
    }
  }, [isPlayingRep, showLevelOverlay, nextLevel, levelIndex, active, level, lesson, levelStars, starsEarned, selectedSymbolGroup, playColumnOnce, isLastLevel, triggerFox, startReward])

  // ── Buton „Știu deja acest sunet" — sare direct la 5 stele, fără să mai
  //   redea audio, și avansează coloana la fel ca handleMainButton. ──
  //   „Omite" (după prima repetare) folosește același handler: oprește
  //   repetarea automată în curs (dacă e una) și trece direct la jocul
  //   dintre coloane. ──
  const handleStudiedButton = useCallback(() => {
    if (starsEarned[levelIndex][active] >= REPS_PER_LESSON || buleleVulpiiConfig) return
    autoCancel.current = true
    currentAudio.current?.pause()

    const newCount = REPS_PER_LESSON
    const updatedLevelStars = levelStars.map((v, idx) => (idx === active ? newCount : v))
    setStarsEarned(prev => prev.map((row, li) => (li === levelIndex ? updatedLevelStars : row)))

    const completingLevelIndex = levelIndex
    const completingActive = active
    const completingLevel = level
    const completingIsLastLevel = isLastLevel

    const advance = () => {
      const isLastColumn = completingActive + 1 >= completingLevel.lessons.length
      if (!isLastColumn) {
        setColUnlocked(prev => {
          if (prev[completingLevelIndex][completingActive + 1]) return prev
          const copy = prev.map(row => [...row])
          copy[completingLevelIndex][completingActive + 1] = true
          return copy
        })
        setJustRevealedIndex(completingActive + 1)
        setTimeout(() => setJustRevealedIndex(null), REVEAL_MS)
        triggerFox('S-a deschis o coloană nouă!', 'celebrate')
        setActive(completingActive + 1)
      }

      if (updatedLevelStars.every(v => v >= REPS_PER_LESSON)) {
        setLevelCelebrating(true)
        setShowLevelOverlay(true)
        playLevelFanfare()
        setTimeout(() => setLevelCelebrating(false), LEVEL_POP_MS)
        if (completingIsLastLevel) setAllDone(true)
      }
    }

    // Bulele Vulpii și aici — "Știu deja acest sunet" tot completează
    // coloana, deci tot declanșează jocul (de discutat dacă vrei ca acest
    // buton să rămână un skip real, fără minijoc).
    pendingAdvanceRef.current = advance
    const flatIdx = flatIndexOf(completingLevelIndex, completingActive)
    setBuleleVulpiiConfig({
      lesson,
      distractorLessons: FLAT_LESSONS.slice(Math.max(0, flatIdx - 2), flatIdx).reverse(),
      nextLesson: FLAT_LESSONS[flatIdx + 1] ?? null,
    })
  }, [buleleVulpiiConfig, starsEarned, levelIndex, active, levelStars, level, lesson, isLastLevel, triggerFox])

  // ── RE-PLAY — după ce omul a absolvit coloana ȘI subjocul (stele pline, jocul închis),
  //   poate rejuca coloana (REPS_PER_LESSON repetări automate) și apoi subjocul.
  //   Nu atinge progresul: nu acordă stele, nu deblochează nimic (pendingAdvanceRef = null). ──
  const handleReplay = useCallback(async (opts?: { openGame?: boolean }) => {
    if (isPlayingRep || buleleVulpiiConfig || showLevelOverlay || introLesson) return
    if (starsEarned[levelIndex][active] < REPS_PER_LESSON) return
    const replayLesson = lesson
    const flatIdx = flatIndexOf(levelIndex, active)
    autoCancel.current = false
    replayStopRef.current = false
    replayOpensGameRef.current = opts?.openGame !== false
    setReplayPassesDone(0)
    setReplayProgress(0)
    setIsPlayingRep(true)
    const nWords = Math.max(1, replayLesson.words.length)
    for (let r = 0; r < REPS_PER_LESSON; r++) {
      await playColumnOnce(replayLesson, (wi) =>
        setReplayProgress(((r * nWords + wi + 1) / (REPS_PER_LESSON * nWords)) * 100))
      if (autoCancel.current) break
      setReplayPassesDone(r + 1) // după prima redare a coloanei → Omite (identic cu stars >= 1)
      if (r < REPS_PER_LESSON - 1) await new Promise(res => setTimeout(res, REPLAY_GAP_MS))
      if (autoCancel.current) break
    }
    setIsPlayingRep(false)
    setReplayPassesDone(0)
    setReplayProgress(0)
    // Stop în timpul RE-PLAY: oprește tot, fără subjoc.
    if (replayStopRef.current || !replayOpensGameRef.current) {
      replayStopRef.current = false
      return
    }
    // Skip în timpul RE-PLAY: oprește restul repetărilor și tot trece la subjoc
    // (ca „Omite" de la prima deblocare → jocul dintre coloane).
    pendingAdvanceRef.current = null
    setBuleleVulpiiConfig({
      lesson: replayLesson,
      distractorLessons: FLAT_LESSONS.slice(Math.max(0, flatIdx - 2), flatIdx).reverse(),
      nextLesson: FLAT_LESSONS[flatIdx + 1] ?? null,
    })
  }, [isPlayingRep, buleleVulpiiConfig, showLevelOverlay, introLesson, starsEarned, levelIndex, active, lesson, playColumnOnce])

  // ── Omite în secțiunea RE-PLAY: oprește audio-ul / bucla; handleReplay
  //   termină și deschide subjocul (vezi mai sus). ──
  const handleReplayOmite = useCallback(() => {
    if (!isPlayingRep) return
    autoCancel.current = true
    currentAudio.current?.pause()
    letterSoundStopRef.current?.()
  }, [isPlayingRep])

  // ── STOP: oprește audio-ul și bucla, NU deschide subjocul și NU lasă coloana să repornească
  //   singură (antrenamentul automat sare peste o coloană „în pauză"); rularea reia doar la
  //   START sau REPEAT, care scot coloana din pauză. ──
  const handleReplayStop = useCallback(() => {
    if (!isPlayingRep) return
    replayStopRef.current = true
    setPausedColKey(`${levelIndex}:${active}`)
    autoCancel.current = true
    currentAudio.current?.pause()
    letterSoundStopRef.current?.()
  }, [isPlayingRep, levelIndex, active])

  // ── PLAY: duce la joc (Bulele Vulpii). În timpul repetării oprește bucla
  //   (handleReplay deschide apoi jocul); în repaus deschide jocul direct.
  //   Nu atinge progresul (pendingAdvanceRef = null). ──
  const handleReplayPlay = useCallback(() => {
    if (buleleVulpiiConfig || showLevelOverlay || introLesson) return
    if (isPlayingRep) { replayOpensGameRef.current = true; handleReplayOmite(); return }
    if (starsEarned[levelIndex][active] < REPS_PER_LESSON) return
    const flatIdx = flatIndexOf(levelIndex, active)
    autoCancel.current = true
    currentAudio.current?.pause()
    letterSoundStopRef.current?.()
    pendingAdvanceRef.current = null
    setBuleleVulpiiConfig({
      lesson,
      distractorLessons: FLAT_LESSONS.slice(Math.max(0, flatIdx - 2), flatIdx).reverse(),
      nextLesson: FLAT_LESSONS[flatIdx + 1] ?? null,
    })
  }, [buleleVulpiiConfig, showLevelOverlay, introLesson, isPlayingRep, handleReplayOmite, starsEarned, levelIndex, active, lesson])

  // RE-PLAY automat după navigare: se armează doar dacă ținta e o coloană
  //   deja terminată; useEffect-ul de mai jos pornește apoi handleReplay.
  const pendingAutoReplayRef = useRef(false)
  const armAutoReplay = useCallback((li: number, ci: number) => {
    if ((starsEarned[li]?.[ci] ?? 0) >= REPS_PER_LESSON) pendingAutoReplayRef.current = true
  }, [starsEarned])

  // autoReplay=true doar la click (nu la hover, ca să nu pornească audio din trecerea mouse-ului)
  // Click pe altă coloană în timp ce una rulează: oprește coloana care rulează
  //   (fără joc), activează coloana nouă și, dacă e terminată, o repetă automat.
  //   Hover-ul (autoReplay=false) nu întrerupe niciodată o redare în curs.
  const selectColumn = useCallback((i: number, autoReplay = false) => {
    if (!colUnlocked[levelIndex][i] || i === active) return
    // „Întrerupere" = o coloană e în antrenament/repetare (rulează sau așteaptă următoarea trecere)
    const interrupting = isPlayingRep || (starsEarned[levelIndex]?.[active] ?? 0) < REPS_PER_LESSON
    if (isPlayingRep) {
      if (!autoReplay) return
      replayStopRef.current = true
      autoCancel.current = true
      currentAudio.current?.pause()
      letterSoundStopRef.current?.()
      setReplayProgress(0)
    }
    setActive(i)
    if (autoReplay) {
      if (interrupting) setPausedColKey(`${levelIndex}:${i}`)   // fără joc, fără start automat
      else armAutoReplay(levelIndex, i)
    }
  }, [isPlayingRep, colUnlocked, levelIndex, active, starsEarned, armAutoReplay])

  // ── Selectare simbol din bara superioară (toate simbolurile, inclusiv
  //   blocate vizibile). Doar cele deblocate pot fi selectate. Oprește
  //   redarea anterioară și schimbă coloana activă, fără să pornească
  //   automat antrenamentul sau RE-PLAY-ul. Pentru o coloană neterminată,
  //   butonul REPEAT rămâne disponibil pentru pornire manuală.
  //   Nu atinge colUnlocked / starsEarned. ──
  const selectSymbol = useCallback((levelIdx: number, colIdx: number) => {
    if (!colUnlocked[levelIdx]?.[colIdx]) return
    // Oprește orice redare în curs și anulează orice RE-PLAY în așteptare.
    if (isPlayingRep) replayStopRef.current = true
    pendingAutoReplayRef.current = false
    autoCancel.current = true
    currentAudio.current?.pause()
    cancelMascotReward()
    setEmptyingColumnId(null)
    const alreadySelected = levelIdx === levelIndex && colIdx === active
    if (!alreadySelected) {
      setLevelIndex(levelIdx)
      setActive(colIdx)
    }
    // Blochează pornirea automată; elevul pornește manual din REPEAT.
    setPausedColKey(`${levelIdx}:${colIdx}`)
  }, [colUnlocked, levelIndex, active, isPlayingRep, cancelMascotReward])

  useEffect(() => {
    if (!pendingAutoReplayRef.current) return
    if (isPlayingRep || buleleVulpiiConfig || showLevelOverlay || introLesson) return
    if ((starsEarned[levelIndex]?.[active] ?? 0) < REPS_PER_LESSON) return
    // Coloană oprită cu STOP (sau întreruptă cu click): nu repornește singură, doar la START/REPEAT.
    if (pausedColKey === `${levelIndex}:${active}`) { pendingAutoReplayRef.current = false; return }
    pendingAutoReplayRef.current = false
    void handleReplay({ openGame: false })   // pornit automat la navigare: doar repetă, nu duce la joc
  }, [levelIndex, active, isPlayingRep, buleleVulpiiConfig, showLevelOverlay, introLesson, starsEarned, handleReplay, pausedColKey])

  // ── "Hover intent" — la trecerea rapidă a mouse-ului peste mai multe
  //   coloane (spre ex. când cursorul doar traversează grila spre alt
  //   punct), nu vrem să se activeze fiecare coloană atinsă în trecere,
  //   ca senzația să fie lină, nu sacadată. Se activează doar coloana pe
  //   care mouse-ul chiar se oprește (110ms), iar plecarea anulează timer-ul. ──
  const hoverIntentRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoverSelectColumn = useCallback((i: number) => {
    if (hoverIntentRef.current) clearTimeout(hoverIntentRef.current)
    hoverIntentRef.current = setTimeout(() => selectColumn(i), 110)
  }, [selectColumn])
  const cancelHoverSelectColumn = useCallback(() => {
    if (hoverIntentRef.current) { clearTimeout(hoverIntentRef.current); hoverIntentRef.current = null }
  }, [])
  useEffect(() => () => { if (hoverIntentRef.current) clearTimeout(hoverIntentRef.current) }, [])

  // ── Permite să revii la un nivel deja deblocat (curent sau terminat),
  //   ca să revezi coloanele lui — fără să atingi progresul (colUnlocked,
  //   starsEarned rămân neschimbate; doar „ce se vede" se mută). ──
  const visitLevel = useCallback((i: number) => {
    if (isPlayingRep || !unlockedLevels[i] || i === levelIndex) return
    autoCancel.current = true
    currentAudio.current?.pause()
    cancelMascotReward()
    setEmptyingColumnId(null)
    setLevelIndex(i)
    const firstUnlockedCol = colUnlocked[i].findIndex(Boolean)
    const targetCol = firstUnlockedCol === -1 ? 0 : firstUnlockedCol
    setActive(targetCol)
    armAutoReplay(i, targetCol)
  }, [isPlayingRep, unlockedLevels, levelIndex, colUnlocked, cancelMascotReward, armAutoReplay])

  // ── Navigare lecție anterioară / următoare (săgeți pe ecran + tastele ←/→).
  //   Merge în ordinea plată a parcursului (FLAT_LESSONS), peste granița
  //   dintre niveluri. Ținta trebuie să fie deja deblocată — nu sare peste
  //   deblocări și nu atinge progresul (doar mută „ce se vede"). ──
  const stepTarget = useCallback((dir: 1 | -1): { li: number; ci: number } | null => {
    // Săgețile comută între LECȚII (= pagina cu coloanele unui nivel), nu între coloane.
    const li = levelIndex + dir
    if (li < 0 || li >= LEVELS.length || !unlockedLevels[li]) return null
    const firstUnlockedCol = colUnlocked[li]?.findIndex(Boolean) ?? -1
    return { li, ci: firstUnlockedCol === -1 ? 0 : firstUnlockedCol }
  }, [levelIndex, unlockedLevels, colUnlocked])

  const stepLesson = useCallback((dir: 1 | -1) => {
    if (isPlayingRep || showLevelOverlay || introLesson || buleleVulpiiConfig) return
    const tgt = stepTarget(dir)
    if (!tgt) return
    autoCancel.current = true
    currentAudio.current?.pause()
    cancelMascotReward()
    setEmptyingColumnId(null)
    if (tgt.li !== levelIndex) setLevelIndex(tgt.li)
    setActive(tgt.ci)
    armAutoReplay(tgt.li, tgt.ci)
  }, [isPlayingRep, showLevelOverlay, introLesson, buleleVulpiiConfig, stepTarget, levelIndex, cancelMascotReward, armAutoReplay])

  const repeatLabel = isPlayingRep
    ? <><span aria-hidden="true">■</span> STOP</>
    : <><span aria-hidden="true">↻</span> REPEAT</>

  // ── NEXT: următoarea coloană (la ultima coloană a nivelului → prima coloană
  //   deblocată din nivelul următor). Oprește repetarea în curs fără să deschidă
  //   subjocul. Nu atinge progresul. ──
  const nextColumnTarget = useCallback((): { li: number; ci: number } | null => {
    const nc = active + 1
    if (nc < level.lessons.length) return colUnlocked[levelIndex]?.[nc] ? { li: levelIndex, ci: nc } : null
    return stepTarget(1)
  }, [active, level, colUnlocked, levelIndex, stepTarget])

  const handleNextColumn = useCallback(() => {
    if (buleleVulpiiConfig || showLevelOverlay || introLesson) return
    const tgt = nextColumnTarget()
    if (!tgt) return
    if (isPlayingRep) replayStopRef.current = true   // fără subjoc după oprire
    autoCancel.current = true
    currentAudio.current?.pause()
    letterSoundStopRef.current?.()
    cancelMascotReward()
    setEmptyingColumnId(null)
    if (tgt.li !== levelIndex) setLevelIndex(tgt.li)
    setActive(tgt.ci)
    armAutoReplay(tgt.li, tgt.ci)
  }, [buleleVulpiiConfig, showLevelOverlay, introLesson, nextColumnTarget, isPlayingRep, levelIndex, cancelMascotReward, armAutoReplay])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) return
      stepLesson(e.key === 'ArrowRight' ? 1 : -1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stepLesson])

  // ── Reia tot jocul de la zero: șterge progresul salvat și readuce toate
  //   flag-urile la valorile inițiale (aceleași cu cele din useState de mai
  //   sus). Cerută printr-un buton + un modal de confirmare, ca să nu se
  //   piardă progresul dintr-o apăsare greșită. ──
  const resetGame = useCallback(() => {
    autoCancel.current = true
    currentAudio.current?.pause()
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }

    setLevelIndex(0)
    setUnlockedLevels(LEVELS.map((_, i) => i === 0))
    setColUnlocked(LEVELS.map((lvl, i) => lvl.lessons.map((_, ci) => i === 0 && ci === 0)))
    setStarsEarned(LEVELS.map(lvl => lvl.lessons.map(() => 0)))
    setActive(0)
    setAllDone(false)

    setPlayingWord(null)
    setPlayingColId(null)
    setIsPlayingRep(false)
    setPoppingStarIndex(null)
    setCelebrating(false)
    setFreePracticeCount(0)
    setLevelCelebrating(false)
    setShowLevelOverlay(false)
    setJustRevealedIndex(null)
    cancelMascotReward()
    setEmptyingColumnId(null)
    setShowResetConfirm(false)
  }, [cancelMascotReward])

  const stopPlayback = useCallback(() => {
    autoCancel.current = true
    currentAudio.current?.pause()
  }, [])

  // ── Click pe LITERA din capul coloanei: Aik propune „Let's play!" și se
  //    aude sunetul izolat (matchWord). Doar la CLICK, nu la hover.
  //    La prima activare a fiecărei coloane (earned === 0, după intro),
  //    același ritual rulează automat de 3 ori — Aik din colțul stânga-sus
  //    al coloanei active zvâcnește și „scoate” sunetul din gură. ──
  const letterSoundStopRef = useRef<(() => void) | null>(null)

  // ── Redă sunetul izolat al literei de `times` ori:
  //   • litera din cap zvâcnește (letterPulseId)
  //   • Aik din colțul coloanei active zvâcnește + undă de sunet din gură
  //   Folosit la startul fiecărei coloane (3×) și la click pe literă (1×).
  // Tabel de variante (sau „= đ") lângă simbolul din cap, vizibil câteva secunde după apăsare / ritual ×3
  const [eqShownId, setEqShownId] = useState<string | null>(null)
  const eqTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showSymbolEq = useCallback((id: string) => {
    if (!HEAD_SYMBOL_ALIAS[id] && !HEAD_SYMBOL_VARIANTS[id]) return
    setEqShownId(id)
    if (eqTimerRef.current) clearTimeout(eqTimerRef.current)
    eqTimerRef.current = setTimeout(() => setEqShownId(null), HEAD_EQ_VISIBLE_MS)
  }, [])
  useEffect(() => () => { if (eqTimerRef.current) clearTimeout(eqTimerRef.current) }, [])

  const playLetterPulse = useCallback(async (l: Lesson, times = 1) => {
    if (!introDone || isPlayingRep || playingWord !== null) return
    letterSoundStopRef.current?.()
    autoCancel.current = false
    const accent = resolveAccent(l.words[0], l)
    const word = l.matchWord ?? l.words[0].text
    for (let i = 0; i < times; i++) {
      if (autoCancel.current) break
      setLetterPulseId(l.id)
      showSymbolEq(l.id)
      if (i === 0 && times > 1) triggerFox(LETTER_FOX_PROMPT, 'greeting')
      const { promise, stop } = speakWord(word, { accent })
      letterSoundStopRef.current = stop
      // zvâcnirea literei + Aik ~420ms (sincron cu animația CSS)
      await Promise.race([
        promise,
        new Promise<void>(r => setTimeout(r, 420)),
      ])
      setLetterPulseId(cur => (cur === l.id ? null : cur))
      try { await promise } catch { /* ignore */ }
      if (letterSoundStopRef.current === stop) letterSoundStopRef.current = null
      if (autoCancel.current) break
      if (i < times - 1) {
        // interval mai mare la startul coloanei (×3); click pe literă (×1) nu ajunge aici
        await new Promise(r => setTimeout(r, LETTER_PULSE_GAP_MS))
      }
    }
  }, [introDone, isPlayingRep, playingWord, triggerFox, showSymbolEq])

  const handleLetterClick = useCallback((l: Lesson, i: number, itemLevelIdx = levelIndex) => {
    if (!introDone || isPlayingRep || playingWord !== null) return
    if (!colUnlocked[itemLevelIdx]?.[i]) return
    if (!seenIntros.has(l.id)) return
    void playLetterPulse(l, 1)
  }, [introDone, isPlayingRep, playingWord, colUnlocked, levelIndex, seenIntros, playLetterPulse])
  useEffect(() => () => { letterSoundStopRef.current?.() }, [])

  // ── La prima activare a FIECĂREI coloane (după intro-uri, earned === 0):
  //   sunetul coloanei de 3 ori + litera + Aik zvâcnesc de fiecare dată.
  //   O singură dată per id de lecție (letterPulseDoneRef).
  useEffect(() => {
    if (!hydrated || !introHydrated || !beginnerNoteHydrated || !introDone) return
    if (introLesson || isPlayingRep || buleleVulpiiConfig || showLevelOverlay || showResetConfirm) return
    if (!lesson) return
    if (!colUnlocked[levelIndex]?.[active]) return
    if (earned > 0) return
    if (letterPulseDoneRef.current.has(lesson.id)) return
    if (!seenIntros.has(lesson.id)) return   // așteaptă OnboardingSoundIntro
    letterPulseDoneRef.current.add(lesson.id)
    const t = setTimeout(() => { void playLetterPulse(lesson, 3) }, 500)
    return () => clearTimeout(t)
  }, [hydrated, introHydrated, beginnerNoteHydrated, introDone, introLesson, isPlayingRep,
      buleleVulpiiConfig, showLevelOverlay, showResetConfirm, lesson, colUnlocked,
      levelIndex, active, earned, seenIntros, playLetterPulse])

  // ── Apasă pe UN cuvânt anume din listă → se aude doar el, o singură dată,
  //    fără să pornească repetiția întregii coloane și fără să afecteze
  //    stelele/progresul. Blocat cât timp o repetiție de coloană e deja în
  //    desfășurare, ca să nu se suprapună două voci. La al treilea click pe
  //    același cuvânt, acesta ajunge în „Cuvinte de exersat". ──
  const playSingleWord = useCallback((word: string, colId: string, isUnlocked: boolean, accent: Accent = 'en-US') => {
    if (isPlayingRep || playingWord !== null || !isUnlocked) return
    autoCancel.current = false
    void playWord(word, colId, accent)

    setWordClickCounts(prev => {
      const key = `${colId}:${word}`
      const count = (prev[key] ?? 0) + 1
      if (count === REVIEW_THRESHOLD) {
        setReviewWords(rw => rw.some(r => r.word === word && r.colId === colId) ? rw : [...rw, { word, colId, accent }])
        triggerFox(`„${word}" pare dificil — l-am pus la exersat!`, 'hint')
      }
      return { ...prev, [key]: count }
    })
  }, [isPlayingRep, playingWord, playWord, triggerFox])

  // ── Repetări automate — fără buton. Când coloana activă e deblocată și
  //   neterminată, iar intro-urile (vulpea mare, demo-ul de sunet) s-au
  //   încheiat, pornește singură o repetare; la sfârșitul ei steaua se
  //   acordă (handleMainButton) → `earned` crește → efectul rulează din nou
  //   și pornește următoarea, până la REPS_PER_LESSON. Se oprește cât timp e
  //   deschis jocul de baloane / overlay-ul de nivel / confirmarea de reset. ──
  useEffect(() => {
    if (!hydrated || !introHydrated || !beginnerNoteHydrated || !introDone) return
    if (introLesson || isPlayingRep || buleleVulpiiConfig || showLevelOverlay || showResetConfirm) return
    if (letterPulseId) return   // așteaptă zvâcnirile literei + Aik (×3)
    if (pausedColKey === `${levelIndex}:${active}`) return   // oprită cu STOP sau întreruptă cu click: pornește doar la START/REPEAT
    if (!colUnlocked[levelIndex]?.[active] || earned >= REPS_PER_LESSON) return
    // După ritualul de 3× pe coloana abia deschisă, așteaptă să se termine
    const startDelay = (earned === 0 && lesson && letterPulseDoneRef.current.has(lesson.id))
      ? LETTER_PULSE_AFTER_MS
      : (earned === 0 ? REP_START_DELAY_MS : REP_GAP_MS)
    const t = setTimeout(() => { void handleMainButton() }, startDelay)
    return () => clearTimeout(t)
  }, [hydrated, introHydrated, beginnerNoteHydrated, introDone, introLesson, isPlayingRep, buleleVulpiiConfig,
      showLevelOverlay, showResetConfirm, colUnlocked, levelIndex, active, earned, handleMainButton,
      letterPulseId, lesson, pausedColKey])

  // ── Telefon: o singură coloană pe rând (vezi @media max-width:720px din
  //   globals.css), deci coloana activă poate fi în afara ecranului. La
  //   schimbarea ei (avans automat, atingere, reluare după salvare) o centrăm
  //   pe verticala ecranului. Două treceri: a doua, după ce layout-ul se așază
  //   (coloana activă se extinde cu stele/buton, animația de reveal). Dacă
  //   coloana e mai înaltă decât ecranul, îi aliniem capul sus. Desktop: nu face nimic. ──
  useEffect(() => {
    if (!hydrated) return
    if (typeof window === 'undefined' || !window.matchMedia('(max-width: 720px)').matches) return
    const centerActive = () => {
      const el = colRefs.current[level.lessons[active]?.id]
      if (!el) return
      const r = el.getBoundingClientRect()
      const vh = window.visualViewport?.height ?? window.innerHeight
      const top = r.height >= vh - 24 ? 12 : (vh - r.height) / 2
      window.scrollTo({ top: Math.max(0, window.scrollY + r.top - top), behavior: 'smooth' })
    }
    const t1 = setTimeout(centerActive, 150)
    const t2 = setTimeout(centerActive, 800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [hydrated, active, level])

  // ── Mesajul implicit al vulpii — calculat live din starea lecției, nu
  //   ales dintr-o listă fixă de „tips" (vezi FoxHelper.tsx). ──
  const foxIdleHint = useMemo(() => {
    if (allDone) return 'Ai terminat tot parcursul — felicitări! 🎉'
    if (hasTrophy) return 'Coloana asta e gata — treci la următoarea!'
    if (earned === 0) return 'Ascultă coloana și repetă fiecare cuvânt cu voce tare.'
    return `Mai ai nevoie de ${REPS_PER_LESSON - earned} stele ca să deblochezi următoarea coloană.`
  }, [allDone, hasTrophy, earned])

  return (
    <main className="lesson-page">
      <div className="lesson-top-row">
        <div className="lesson-top-links">
          <Link href="/" className="lesson-back-btn" onClick={stopPlayback}>← Pagina principală</Link>
          <div className="lesson-step-nav">
            <button type="button" className="lesson-step-btn" aria-label="Lecția anterioară" title="Lecția anterioară (←)"
              disabled={isPlayingRep || !stepTarget(-1)} onClick={() => stepLesson(-1)}>←</button>
            <button type="button" className="lesson-step-btn" aria-label="Lecția următoare" title="Lecția următoare (→)"
              disabled={isPlayingRep || !stepTarget(1)} onClick={() => stepLesson(1)}>→</button>
          </div>
          <Link href="/debug/games/oua-vulpii" onClick={stopPlayback}
            style={{ background: '#fff7e6', color: '#5a4620', border: '1px solid #efcf87', borderRadius: 999, padding: '8px 13px', fontWeight: 900, fontSize: 12, textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 2px 7px #8a682019' }}>
            🦊 Joacă cu vulpița
          </Link>
        </div>
      </div>

      {/* ── Linia permanentă cu TOATE simbolurile (deblocate + blocate).
          Grupate vizual câte 4 (gap mai mare la fiecare 4). Derulare
          orizontală dacă nu încap. Selectarea unui simbol deblocat
          afișează exclusiv coloana lui și pornește antrenamentul. ── */}
      <div className="symbol-bar-wrap" role="toolbar" aria-label="Selectare grupuri de simboluri" {...swipeProps}>
        <button
          type="button"
          className="symbol-bar-arrow"
          aria-label="Grupul anterior"
          disabled={!canGoPrevGroup}
          onClick={() => goSymbolGroup(-1)}
        >
          ‹
        </button>
        <div
          key={groupSlide.n}
          className={`symbol-bar${groupSlide.dir === 1 ? ' slide-next' : groupSlide.dir === -1 ? ' slide-prev' : ''}`}
        >
          {Array.from({ length: Math.ceil(ALL_SYMBOLS.length / 4) }, (_, groupIndex) => {
            const items = ALL_SYMBOLS.slice(groupIndex * 4, groupIndex * 4 + 4)
            const groupUnlocked = items.some(item => !!colUnlocked[item.levelIdx]?.[item.colIdx])
            const groupSelected = selectedSymbolGroup === groupIndex
            return (
              <button
                key={groupIndex}
                data-symbol-group={groupIndex}
                type="button"
                className={`symbol-group-btn ${groupSelected ? 'is-selected' : ''}${groupIndex === selectedSymbolGroup - 1 ? ' is-near-prev' : ''}${groupIndex === selectedSymbolGroup + 1 ? ' is-near-next' : ''}`}
                disabled={!groupUnlocked}
                aria-pressed={groupSelected}
                aria-label={`Grupul ${groupIndex + 1}: ${items.map(item => symbolView(item.lesson).text).join(', ')}`}
                onClick={() => selectSymbolGroup(groupIndex)}
              >
                {items.map(item => {
                  const unlocked = !!colUnlocked[item.levelIdx]?.[item.colIdx]
                  const sv = symbolView(item.lesson)
                  return (
                    <span className="symbol-group-symbol" key={item.lesson.id}>
                      {!unlocked && <span className="symbol-group-lock" aria-hidden="true">🔒</span>}
                      <span className="lesson-letter symbol-btn-text" style={lessonSymbolTextStyle(item.lesson, unlocked)}>
                        {sv.text}
                      </span>
                    </span>
                  )
                })}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          className="symbol-bar-arrow"
          aria-label="Grupul următor"
          disabled={!canGoNextGroup}
          onClick={() => goSymbolGroup(1)}
        >
          ›
        </button>
      </div>

      <div className="lesson-layout" {...swipeProps}>
      <div className="lesson-grid">
        {visibleSymbolGroup.map((item) => {
          const l = item.lesson
          const i = item.colIdx
          const itemLevelIdx = item.levelIdx
          const isUnlocked   = !!colUnlocked[itemLevelIdx]?.[i]
          const isActive     = levelIndex === itemLevelIdx && active === i
          const stars        = starsEarned[itemLevelIdx]?.[i] ?? 0
          const trophyEarned = stars >= REPS_PER_LESSON
          const isNextUp     = itemLevelIdx === levelIndex && i === nextUpIndex
          const isRevealing  = itemLevelIdx === levelIndex && justRevealedIndex === i
          const colBands     = bandsFor(l.id)
          const isTricolor   = !!colBands
          const triBg        = colBands ? bandsCssHorizontal(colBands) : l.color
          const style = { '--lesson-color': l.color } as CSSProperties
          return (
            <div
              key={l.id}
              ref={(el) => { colRefs.current[l.id] = el }}
              className={`lesson-col ${isUnlocked ? 'is-unlocked' : 'is-locked'} ${isActive && isUnlocked ? 'is-active' : ''} ${isNextUp ? 'is-next-up' : ''} ${isRevealing ? 'is-revealing' : ''}`}
              style={style}
              onClick={() => selectSymbol(itemLevelIdx, i)}
              onMouseEnter={() => { if (itemLevelIdx === levelIndex) hoverSelectColumn(i) }}
              onMouseLeave={cancelHoverSelectColumn}
            >
              <div className="lesson-col-head" onClick={() => handleLetterClick(l, i, itemLevelIdx)}>
                {!isUnlocked && <span className="lesson-lock" aria-label="blocat">{isNextUp ? '🔓' : '🔒'}</span>}
                <span className="lesson-number" aria-hidden="true">{GLOBAL_LESSON_NUMBER[l.id]}</span>

                {/* Litera iese din gura lui Aik, într-un balon comics
                    (contur gros + coadă spre gură). Pe coloana activă Aik e
                    vizibil; pe celelalte deblocate rămâne doar balonul. */}
                <div
                  className={[
                    'aik-speech',
                    isUnlocked ? 'is-unlocked' : 'is-locked',
                    isActive && isUnlocked ? 'is-active' : '',
                    letterPulseId === l.id ? 'is-speaking' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {isActive && isUnlocked && (
                    <>
                      {/* Medalionul de sus = capul lui Aik. Deasupra lui stă tăblița de lemn „HELP",
                          care deschide meniul vulpii; mesajele lui Aik apar mai sus, deasupra tăbliței. */}
                      <div className="aik-corner">
                        <div className="aik-corner-face" aria-hidden="true">
                          <FoxReel
                            frames={letterPulseId === l.id ? FACE_SPEAK_REEL : FACE_IDLE_REEL}
                            className="aik-corner-head"
                          />
                        </div>
                        <div className="aik-help" onClick={(e) => e.stopPropagation()}>
                          <HelpSign
                            className="help-sign"
                            width={50}
                            ropes={false}
                            cream
                            ariaLabel="HELP: meniul lui Aik"
                            expanded={helpMenuOpen}
                            onClick={() => setHelpMenuOpen(o => !o)}
                            style={{ position: 'relative', display: 'block' }}
                          />
                          {helpMenuOpen && (
                            <div className="fox-menu aik-help-menu" role="menu">
                              {[
                                { id: 'what-now', label: 'Ce să fac acum?', onClick: () => triggerFox(foxIdleHint, 'hint') },
                                { id: 'repeat', label: 'Repetă sunetul', onClick: () => { if (!isPlayingRep) handleMainButton() } },
                                { id: 'help', label: 'Am nevoie de ajutor', onClick: () => triggerFox('Apasă pe orice cuvânt ca să-l auzi separat, sau „NEXT" (apare după prima repetare) ca să treci la joc și apoi la coloana următoare.', 'hint') },
                              ].map(a => (
                                <button
                                  key={a.id}
                                  type="button"
                                  role="menuitem"
                                  className="fox-menu-item"
                                  onClick={() => { a.onClick(); setHelpMenuOpen(false) }}
                                >
                                  {a.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {!showLevelOverlay && introDone && !helpMenuOpen && (
                        <FoxTips queue={foxQueue} onDequeue={dequeueFox} />
                      )}
                    </>
                  )}
                  <div className="aik-speech-bubble">
                    <span className="aik-speech-tail" aria-hidden="true" />
                    <div
                      className={`lesson-letter${letterPulseId === l.id ? ' is-pulsing' : ''}`}
                      // Tricolor pe /ou/ când e deblocată; altfel culoarea coloanei.
                      // Conturul comics e pe .aik-speech-bubble, nu pe literă.
                      style={lessonSymbolTextStyle(l, isUnlocked)}
                    >
                      <span className={letterPulseId === l.id ? 'letter-inflate' : undefined}>
                        {ringify(HEAD_SYMBOL_ALIAS[l.id]?.show ?? symbolView(l).text)}
                      </span>
                    </div>
                    {eqShownId === l.id && HEAD_SYMBOL_VARIANTS[l.id] && (
                      <span className="lesson-letter-variants" aria-hidden="true">
                        {HEAD_SYMBOL_VARIANTS[l.id].map((g, vi) => (
                          <span
                            key={g + vi}
                            className={`lesson-letter-variant${l.id === 'ring-gz' ? ' lesson-letter-variant-square' : ''}`}
                            style={{
                              color: symbolView(l).color === CONSONANT_BLACK ? '#111' : symbolView(l).color,
                              animationDelay: `${vi * 60}ms`,
                            }}
                          >
                            {ringify(g)}
                          </span>
                        ))}
                      </span>
                    )}
                    {eqShownId === l.id && !HEAD_SYMBOL_VARIANTS[l.id] && HEAD_SYMBOL_ALIAS[l.id] && (
                      <span className="lesson-letter-eq" aria-hidden="true" style={{ color: symbolView(l).color }}>
                        = {HEAD_SYMBOL_ALIAS[l.id].eq}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isUnlocked && (
                <div ref={(el) => { cupRefs.current[l.id] = el }} className="lesson-cup-wrap">
                  <Cup
                    progressPct={(stars / REPS_PER_LESSON) * 100}
                    size={42}
                    color={l.color}
                    bandColors={colBands ?? undefined}
                    celebrating={isActive && celebrating}
                    allFull={trophyEarned}
                    idSuffix={l.id}
                    showBubbles
                    activePulse={isActive && !trophyEarned}
                    emptying={emptyingColumnId === l.id}
                  />
                </div>
              )}
              {!isUnlocked && isNextUp && (
                <p className="lesson-next-hint">se deschide imediat</p>
              )}

              {isActive && isUnlocked && !buleleVulpiiConfig && (
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '6px 0' }}>
                  <button
                    type="button"
                    className={`lesson-replay-btn${isPlayingRep ? ' is-running' : ''}${isTricolor ? ' is-tricolor' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isPlayingRep) { handleReplayStop(); return }
                      setPausedColKey(null)
                      if (trophyEarned) void handleReplay()
                      else void handleMainButton()   // coloană neterminată: pornește antrenamentul
                    }}
                    aria-label={isPlayingRep ? 'Stop: oprește repetarea' : 'Repeat: repetă coloana'}
                    style={{
                      '--rp-bg': triBg,
                      '--rp-pct': `${isPlayingRep ? replayProgress : 0}%`,
                    } as CSSProperties}
                  >
                    <span className="lesson-replay-fill" aria-hidden="true" />
                    <span className="lesson-replay-label">{isPlayingRep ? <><span aria-hidden="true">■</span> STOP</> : stars === 0 ? <><span aria-hidden="true">▶</span> START</> : repeatLabel}</span>
                    <span className="lesson-replay-label lesson-replay-label-on" aria-hidden="true">{isPlayingRep ? <><span aria-hidden="true">■</span> STOP</> : stars === 0 ? <><span aria-hidden="true">▶</span> START</> : repeatLabel}</span>
                  </button>
                </div>
              )}
              {!(isActive && isUnlocked && trophyEarned && !buleleVulpiiConfig) && (
              <div className="lesson-stars" aria-label={`${stars} din ${REPS_PER_LESSON} stele`}>
                {Array.from({ length: REPS_PER_LESSON }).map((_, s) => (
                  <span
                    key={s}
                    ref={(el) => { starRefs.current[`${l.id}-${s}`] = el }}
                    className={`lesson-star-slot ${s < stars ? 'is-filled' : ''}`}
                  >
                    <StarIcon className="lesson-star-icon" />
                    {isActive && poppingStarIndex === s && (
                      <span className="lesson-star-pop" aria-hidden="true">
                        <span className="pop-cup">🏆</span>
                        <StarIcon className="pop-star" />
                        <Confetti count={7} />
                      </span>
                    )}
                  </span>
                ))}
              </div>
              )}

              <div className="lesson-words">
                {l.words.map((w: LessonWord) => {
                  const isPlaying = playingWord === w.text && playingColId === l.id
                  const canClick  = isUnlocked && !isPlayingRep && playingWord === null
                  return (
                    <button
                      key={w.text}
                      type="button"
                      className={`lesson-word ${isPlaying ? 'is-playing' : ''} ${canClick ? 'is-clickable' : ''}`}
                      onClick={(e) => { e.stopPropagation(); playSingleWord(w.text, l.id, isUnlocked, resolveAccent(w, l)) }}
                      disabled={!canClick}
                      aria-label={`Ascultă cuvântul ${w.text}`}
                      title="Apasă ca să auzi doar acest cuvânt"
                    >
                      {wordNodes[w.text.toLowerCase()]
                        ? <WordRenderer nodes={wordNodes[w.text.toLowerCase()]} wordStr={w.text} flatSimple={l.id === 'o'} blackD={l.id === 'd-hat'} zhDisplay={l.id === 'zh'} />
                        : <MarkedWord text={w.text} mark={w.mark} lessonId={l.id} isLocked={!isUnlocked} isPlaying={isPlaying} />}
                    </button>
                  )
                })}
              </div>

              {/* Coloană terminată: ▶ PLAY (duce la joc) + NEXT (coloana următoare).
                  Prima trecere (înainte de stele pline): NEXT = „Știu deja acest sunet" →
                  joc → coloana următoare. */}
              {isActive && isUnlocked && !buleleVulpiiConfig && trophyEarned && (
                <div className="lesson-col-btn-wrap lesson-col-btn-split">
                  <button
                    type="button"
                    className="lesson-col-btn"
                    onClick={(e) => { e.stopPropagation(); handleReplayPlay() }}
                    style={{ background: triBg }}
                  >
                    <span aria-hidden="true">▶</span> PLAY
                  </button>
                  <button
                    type="button"
                    className="lesson-col-btn"
                    disabled={!nextColumnTarget()}
                    onClick={(e) => { e.stopPropagation(); handleNextColumn() }}
                    style={{ background: triBg }}
                  >
                    NEXT <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}
              {isActive && isUnlocked && !buleleVulpiiConfig && !trophyEarned && stars >= 1 && (
                <div className="lesson-col-btn-wrap">
                  <button
                    type="button"
                    className="lesson-col-btn"
                    onClick={(e) => { e.stopPropagation(); handleStudiedButton() }}
                    style={{ background: triBg }}
                  >
                    NEXT <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}

            </div>
          )
        })}
      </div>

      <aside className="lesson-header lesson-sidebar">
        <h1 className="lesson-title">Lesson {selectedSymbolGroup + 1}</h1>

        <button type="button" className="lesson-reset-btn lesson-reset-btn-sidebar" onClick={() => setShowResetConfirm(true)}>
          ↺ Reia de la început
        </button>

        <p className="lesson-subhead">
          {allDone ? 'Repetă cuvintele cu voce tare' : 'Ascultă coloana de 3 ori și repetă fiecare cuvânt cu voce tare'}
        </p>

        {allDone && (
          <div className="eic2-menu">
            <button
              type="button"
              className="eic2-menu-toggle"
              onClick={() => setShowEic2Menu(v => !v)}
              aria-expanded={showEic2Menu}
              aria-haspopup="menu"
            >
              Continuă ▾
            </button>
            {showEic2Menu && (
              <div className="eic2-menu-list" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="eic2-menu-item"
                  onClick={() => { setShowEic2Menu(false); setShowResetConfirm(true) }}
                >
                  ↺ Reia EiC1 de la început
                </button>
                <Link
                  href="/eic2"
                  role="menuitem"
                  className="eic2-menu-item"
                  onClick={() => setShowEic2Menu(false)}
                >
                  🏓 Joacă EiC2 (recapitulare)
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="lesson-speed-control">
          <label htmlFor="speed-slider" className="lesson-speed-label">Viteză</label>
          <input
            id="speed-slider"
            type="range"
            min={800}
            max={3000}
            step={50}
            value={autoDelayMs}
            onChange={(e) => setAutoDelayMs(Number(e.target.value))}
            className="lesson-speed-slider"
          />
        </div>

      </aside>
      </div>

      {/* ── Restul lecțiilor (cele care nu se lucrează acum), sub coloanele lecției afișate:
          câte patru coloane în formatul din v2 (antet cu simbol, stele, cuvinte colorate),
          mai mici, cu titlul „Lesson N". Lecțiile terminate nu mai apar aici: s-au strâns în
          butonul lor din linia de sus. Apăsarea pe un grup deblocat îl afișează deasupra. ── */}
      <section className="lesson-index" aria-label="Celelalte lecții">
        {Array.from({ length: Math.ceil(ALL_SYMBOLS.length / 4) }, (_, groupIndex) => {
          if (groupIndex === selectedSymbolGroup) return null
          const items = ALL_SYMBOLS.slice(groupIndex * 4, groupIndex * 4 + 4)
          if (items.every(it => (starsEarned[it.levelIdx]?.[it.colIdx] ?? 0) >= REPS_PER_LESSON)) return null
          const groupUnlocked = items.some(item => !!colUnlocked[item.levelIdx]?.[item.colIdx])
          return (
            <div className="lesson-index-group" key={groupIndex}>
              <h2 className="lesson-index-title">Lesson {groupIndex + 1}</h2>
              <div
                className={`lesson-index-row${groupUnlocked ? '' : ' is-locked'}`}
                role="button"
                tabIndex={groupUnlocked ? 0 : -1}
                aria-disabled={!groupUnlocked}
                aria-label={`Lesson ${groupIndex + 1}: ${items.map(item => symbolView(item.lesson).text).join(', ')}`}
                onClick={() => selectSymbolGroup(groupIndex)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectSymbolGroup(groupIndex) } }}
              >
                {items.map(item => {
                  const l = item.lesson
                  const unlocked = !!colUnlocked[item.levelIdx]?.[item.colIdx]
                  const stars = starsEarned[item.levelIdx]?.[item.colIdx] ?? 0
                  return (
                    <div
                      key={l.id}
                      className="lesson-col is-unlocked lesson-col-preview"
                      style={{ '--lesson-color': l.color } as CSSProperties}
                    >
                      <div className="lesson-col-head">
                        {!unlocked && <span className="lesson-lock" aria-label="blocat">🔒</span>}
                        <span className="lesson-number" aria-hidden="true">{GLOBAL_LESSON_NUMBER[l.id]}</span>
                        <div className="aik-speech is-unlocked">
                          <div className="aik-speech-bubble">
                            <span className="aik-speech-tail" aria-hidden="true" />
                            <div className="lesson-letter" style={lessonSymbolTextStyle(l, true)}>
                              <span>{ringify(HEAD_SYMBOL_ALIAS[l.id]?.show ?? symbolView(l).text)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="lesson-stars" aria-hidden="true">
                        {Array.from({ length: REPS_PER_LESSON }).map((_, s) => (
                          <span key={s} className={`lesson-star-slot ${s < stars ? 'is-filled' : ''}`}>
                            <StarIcon className="lesson-star-icon" />
                          </span>
                        ))}
                      </div>
                      <div className="lesson-words">
                        {l.words.map((w: LessonWord) => (
                          <div key={w.text} className="lesson-word">
                            {wordNodes[w.text.toLowerCase()]
                              ? <WordRenderer nodes={wordNodes[w.text.toLowerCase()]} wordStr={w.text} flatSimple={l.id === 'o'} blackD={l.id === 'd-hat'} zhDisplay={l.id === 'zh'} />
                              : <MarkedWord text={w.text} mark={w.mark} lessonId={l.id} isLocked={false} isPlaying={false} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </section>


      {introLesson && introExample && (
        <div className="sound-intro-overlay" role="dialog" aria-modal="true" aria-label={`Cum sună ${introLesson.letter}`}>
          <OnboardingSoundIntro
            phoneme={symbolView(introLesson).text}
            words={
              introLesson.id === 'gh-ph-f'
                // f: laugh (gh) deasupra, alphabet (ph) dedesubt — randate cu motorul real; gh/ph aliniate sub simbol
                ? ['laugh', 'alphabet'].map(t => {
                    const w = introLesson.words.find(x => x.text === t) ?? introLesson.words[0]
                    return { text: w.text, mark: w.mark, nodes: wordNodes[w.text.toLowerCase()], accent: resolveAccent(w, introLesson) }
                  })
                : [{ text: introExample.text, mark: introExample.mark }]
            }
            matchWord={introLesson.matchWord}
            color={introLesson.color}
            accent={resolveAccent(introExample, introLesson)}
            onComplete={handleIntroComplete}
          />
        </div>
      )}

      {showLevelOverlay && (
        <div className="level-overlay" role="dialog" aria-modal="true" aria-label="Nivel finalizat">
          <div className="level-overlay-card">
            <div className="level-overlay-cupwrap">
              <span className="level-overlay-rays" style={{ '--ray-color': '#FFB300' } as CSSProperties} aria-hidden="true" />
              <Cup
                progressPct={100}
                size={132}
                color="#FFB300"
                celebrating={levelCelebrating}
                allFull
                idSuffix={`overlay-${level.id}`}
                confettiCount={32}
                big
                showBubbles
              />
              <Mascot state="cheering" size={64} className="level-overlay-mascot" />
            </div>
            <div className="level-overlay-actions">
              <span className="level-overlay-cup-mini" aria-hidden="true">🏆</span>
              <button
                className="level-overlay-btn"
                onClick={handleMainButton}
                aria-label={nextLevel ? `Spre Nivelul ${levelIndex + 2}` : 'Gata'}
                style={{ background: nextLevel ? nextLevel.lessons[0].color : '#FFB300' }}
              >
                {nextLevel ? 'Level' : '🎉'}
              </button>
            </div>
          </div>
        </div>
      )}

      {buleleVulpiiConfig && (
        <BuleleVulpiiOverlay
          config={buleleVulpiiConfig}
          onDone={() => {
            setBuleleVulpiiConfig(null)
            pendingAdvanceRef.current?.()
            pendingAdvanceRef.current = null
          }}
        />
      )}

      {showResetConfirm && (
        <div className="reset-overlay" role="dialog" aria-modal="true" aria-label="Confirmare resetare">
          <div className="reset-overlay-card">
            <p className="reset-overlay-title">Reiei jocul de la început?</p>
            <p className="reset-overlay-sub">Tot progresul — stelele și nivelurile deblocate — va fi șters definitiv.</p>
            <div className="reset-overlay-actions">
              <button type="button" className="reset-overlay-cancel" onClick={() => setShowResetConfirm(false)}>
                Anulează
              </button>
              <button type="button" className="reset-overlay-confirm" onClick={resetGame}>
                Da, reia de la început
              </button>
            </div>
          </div>
        </div>
      )}

      {/* vulpea de recompensă — overlay `position: fixed`, poziționat prin
          coordonate viewport calculate o singură dată (vezi handleMainButton);
          nu urmărește nimic continuu, doar merge la stea, o duce la cupă și,
          la coloană completă, cară/varsă cupa coloanei în cupa mare ── */}
      <MascotReward animation={mascotAnimation} size={96} />

      {/* Aik mare, la centru, la deschiderea paginii — „zboară" apoi
          spre medalionul de sus, din coloana activă (vezi MascotIntro.tsx) ── */}
      {!introDone && <MascotIntro onComplete={() => setIntroDone(true)} />}

    </main>
  )
}
