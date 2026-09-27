'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Mascot, type MascotState } from './Mascot'
import { speakWord } from '@/lib/speak'
import type { Lesson, LessonWord } from '@/lib/levels'

// ─────────────────────────────────────────────────────────────────────────
// Bulele Vulpii — versiune "reală", pe baza specificației exhaustive de la
// Dorel (2026-09-23) și a schiței inițiale din /debug/games/bulele-vulpii.
// Spre deosebire de schiță, componenta NU mai folosește 7 grupuri demo fixe
// — primește sunetul antrenat + sunetele-distractor + sunetul următor ca
// props, direct din LEVELS (levels.ts), deci scorul/culorile/cuvintele
// coincid cu coloana pe care tocmai a terminat-o copilul în /learn.
//
// Mecanica dinți/coșuri a fost înlocuită cu varianta desenată (dinți zimțați
// care se retrag spre stânga, coșuri de paie care alunecă spre centru,
// pâlpâire la impact) pe baza referinței CSS/JS primite de la Dorel — nu mai
// e schematică (emoji).
//
// Ce rămâne simplificat față de spec (de discutat separat):
//  - "sunete anterioare problematice" sunt cele date de apelant în
//    `distractorLessons`, ÎN ORDINEA dată — alegerea CARE coloane și cum
//    sunt ordonate (după gravitate reală a greșelilor) rămâne la apelant;
//    componenta doar le distribuie proporțional în cele 20 de baloane.
//  - nivelurile 1/2 (literă / cuvânt) NU se înlănțuie singure — apelantul
//    decide, via onFinish, dacă trece la nivelul următor, repetă, sau
//    oprește aici.
//
// Actualizare 5 (2026-09-25): nivelul „balon gol" a fost eliminat; fostul
// nivel 3 (cuvânt monosilabic) e acum nivelul 2. Coada a scăzut de la 20 la
// 10 baloane (aceleași proporții 60/35/5), deci scorul maxim e ~10.
//
// Actualizare (2026-09-24): balonul se sparge efectiv la dinți (inel +
// cioburi, dinții „mușcă"); o singură vulpe în joc (starea `idle`, fără
// portretul facial al lui `talking`); buton de Pauză și de Ieși (`onExit`).
// Actualizare 2 (2026-09-24): dinții pe toată lățimea; coșurile sunt mereu
// vizibile (fără deplasarea dinților/coșurilor la punct) și acumulează
// punctele sub formă de pești: coșul de scor = scorul total, coșul sunetului
// antrenat = baloanele sunetului antrenat, în culoarea lui.
// Actualizare 3: coșurile sunt desenate din nuiele împletite (SVG) și stau sus,
// sub dinți.
// Actualizare 4: un singur coș (scorul total), sus în dreapta; peștii sunt
// desenați mai firesc — specii/culori diferite, înclinați și îngrămădiți ca
// într-o captură; baloanele evită doar colțul coșului.
// ─────────────────────────────────────────────────────────────────────────

export type BuleleVulpiiLevel = 1 | 2

export interface BuleleVulpiiResult {
  level: BuleleVulpiiLevel
  rate: number
  passed: boolean
}

export interface BuleleVulpiiGameProps {
  /** Sunetul tocmai antrenat (coloana încheiată) — 60% din baloane. */
  lesson: Lesson
  /** Sunete anterioare problematice — își împart proporțional ~35% din baloane. Poate fi []. */
  distractorLessons?: Lesson[]
  /** Sunetul următor din parcurs — dacă există, apare ca al 4-lea buton și 5% din baloane (a 2 puncte). */
  nextLesson?: Lesson | null
  /** Nivel 1 = literă în balon, 2 = cuvânt monosilabic. Implicit 1. */
  level?: BuleleVulpiiLevel
  onFinish?: (result: BuleleVulpiiResult) => void
  /** Dacă e dat, apare butonul „Ieși" (cu confirmare); apelat când jucătorul chiar iese. */
  onExit?: () => void
}

type GroupKind = 'current' | 'distractor' | 'next'
interface Group { kind: GroupKind; lesson: Lesson }
interface QueueItem { group: Group }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickWord(lesson: Lesson): LessonWord {
  return lesson.words[Math.floor(Math.random() * lesson.words.length)]
}

function ttsWordFor(lesson: Lesson): string {
  return lesson.matchWord ?? lesson.words[0]?.text ?? lesson.letter
}

// 10 baloane: 60% sunet antrenat, ~35% distractori (împărțiți proporțional
// între câți sunt dați), 5% sunetul următor (dacă există — practic 1 balon).
const TOTAL_BALLOONS = 10
function buildQueue(current: Group, distractors: Group[], next: Group | null): QueueItem[] {
  const nextCount = next ? 1 : 0
  let currentCount = 6
  let distractorTotal = TOTAL_BALLOONS - currentCount - nextCount
  if (distractors.length === 0) {
    currentCount += distractorTotal
    distractorTotal = 0
  }
  const items: QueueItem[] = []
  for (let i = 0; i < currentCount; i++) items.push({ group: current })
  if (distractors.length > 0) {
    const base = Math.floor(distractorTotal / distractors.length)
    let extra = distractorTotal - base * distractors.length
    for (const d of distractors) {
      const count = base + (extra > 0 ? 1 : 0)
      if (extra > 0) extra--
      for (let i = 0; i < count; i++) items.push({ group: d })
    }
  }
  if (next) items.push({ group: next })
  // gardă: indiferent de rotunjiri, coada nu depășește niciodată TOTAL_BALLOONS
  return shuffle(items).slice(0, TOTAL_BALLOONS)
}

type Zone = 'blue' | 'pink'
type BalloonState = 'flying' | 'correct' | 'miss'

interface LiveBalloon {
  id: number
  group: Group
  word: LessonWord
  x: number
  progress: number
  zone: Zone
  state: BalloonState
}

const FLIGHT_MS = 5200
const TICK_MS = 50
// Geometria zonei de joc: dinții pe toată lățimea marginii de sus, coșurile
// în colțurile de sus, sub dinți; balonul urcă prin coloana centrală până când
// vârful lui atinge marginea de jos a dinților — acolo se sparge.
const STAGE_H = 290
const TEETH_BOTTOM = 40
const BALLOON_SIZE = 62
const MAX_RISE_PX = STAGE_H - TEETH_BOTTOM - BALLOON_SIZE
const BALLOON_X_MIN = 14    // % — marginea stângă a balonului; coșul e în dreapta-sus
const BALLOON_X_SPAN = 42
// Actualizare 7 (2026-09-27): coșul static (chiar și repoziționat corect
// „în interior") tot avea un plafon dur — la 7+ pești nu mai încăpeau vizual
// și rămânea doar cifra din badge, fără mișcare. Dorel a propus înlocuirea
// completă cu un acvariu: peștii înoată liber (ținte aleatorii, tranziție
// CSS între ele — aceeași tehnică ca la trenurile din /debug/live/harta-metrou),
// deci nu mai există „prea mulți ca să încapă" — pot să se suprapună/treacă
// unii pe lângă alții cât timp înoată, la fel ca într-un acvariu real.
// Corpul SVG al peștelui (Fish) rămâne cel din actualizarea 6; doar poziția
// nu mai vine din FISH_SLOTS fixe, ci e controlată de useSwimmingFish() de
// mai jos, care ține totul într-un singur fișier (fără hook separat).
const FISH_SCALE = 1.15
const ACVARIU_W = 210
const ACVARIU_H = 128
const MAX_SWIM_FISH = 12   // peste atâția, badge-ul arată cifra exactă oricum
const SWIM_RETARGET_MIN_MS = 1700
const SWIM_RETARGET_MAX_MS = 3200
const SWIM_TRANSITION_S = 1.6
// dintele: un triunghi cu umeri, repetat pe orizontală ca mască CSS
const TOOTH_MASK = `url("data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='28' height='34' viewBox='0 0 28 34'><path d='M0 0H28V14L14 34L0 14Z' fill='black'/></svg>")}")`
let balloonSeq = 0

const FISH_PALETTE = [
  { back: '#3f6d8a', belly: '#dfe9ee', fin: '#2c5068', spots: false },
  { back: '#e2721f', belly: '#f8c98a', fin: '#a94d10', spots: false },
  { back: '#6b7a3a', belly: '#e9e2b4', fin: '#4a5626', spots: true },
  { back: '#c9553f', belly: '#f5bfae', fin: '#8f3524', spots: false },
]
const FISH_W = Math.round(34 * FISH_SCALE)
const FISH_H = Math.round(17 * FISH_SCALE)

// Corpul SVG al peștelui e independent de poziție — primește doar culoarea
// (după index, ca înainte) și e poziționat/orientat de părinte (Acvariu).
function Fish({ index }: { index: number }) {
  const uid = useId().replace(/:/g, '')
  const pal = FISH_PALETTE[index % FISH_PALETTE.length]
  return (
    <svg className="bv-fish" width={FISH_W} height={FISH_H} viewBox="0 0 40 20" style={{ overflow: 'visible', display: 'block' }} aria-hidden="true">
      <defs>
        <linearGradient id={`fg${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={pal.back} />
          <stop offset=".55" stopColor={pal.back} />
          <stop offset=".75" stopColor={pal.belly} />
          <stop offset="1" stopColor={pal.belly} />
        </linearGradient>
      </defs>
      {/* coada bifurcată, înotătoarea dorsală — contur gros și închis la
          culoare, ca silueta să se citească și mică/suprapusă */}
      <path className="bv-fish-tail" d="M28 10 L39 1.5 Q35.5 10 39 18.5 Z" fill={pal.fin} stroke="#1a1006" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M11 3.5 Q17 -2.5 26 4 Z" fill={pal.fin} stroke="#1a1006" strokeWidth="1.1" strokeLinejoin="round" />
      {/* corpul cu spate întunecat și burtă deschisă */}
      <path d="M1.5 10 C4.5 3, 14 0.5, 22.5 2.5 C28 3.8, 31 8, 32 10 C31 12, 28 16.2, 22.5 17.5 C14 19.5, 4.5 17, 1.5 10 Z" fill={`url(#fg${uid})`} stroke="#1a1006" strokeWidth="1.3" />
      {pal.spots && (
        <g fill="rgba(0,0,0,.4)">
          <circle cx="14" cy="6.3" r="1.3" /><circle cx="19.5" cy="5.2" r="1.1" /><circle cx="24" cy="7" r="1.1" />
        </g>
      )}
      {/* linia laterală și branhia — un singur semn clar fiecare, fără solzi fini */}
      <path d="M7 10 Q18 8 29 10" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.1" />
      <path d="M9 5.5 Q7 10 9 14.5" fill="none" stroke="rgba(0,0,0,.4)" strokeWidth="1.1" />
      {/* înotătoarea pectorală și ochiul, mărit ca să se distingă la scară mică */}
      <path d="M13 12.5 Q16.5 17 21 15.2 Q17.5 12.5 13 12.5 Z" fill={pal.fin} stroke="#1a1006" strokeWidth=".8" opacity=".9" />
      <circle cx="5.8" cy="8.2" r="2.4" fill="#f7f2de" stroke="#1a1006" strokeWidth=".6" />
      <circle cx="5.4" cy="8.2" r="1.3" fill="#111" />
    </svg>
  )
}

interface SwimFish { id: number; x: number; y: number; flip: boolean }

// Fiecare pește își reprogramează singur (setTimeout recursiv, întârziere
// randomizată) următoarea țintă — nu un singur interval global — ca să nu
// înoate toți sincronizat. Poziția efectivă vine din CSS (left/top +
// transition), la fel ca la trenurile din harta-metrou; aici doar calculăm
// ținta și lăsăm browserul să interpoleze.
const ACVARIU_SAND_H = 14

function useSwimmingFish(count: number) {
  const boundsW = ACVARIU_W - FISH_W
  const boundsH = ACVARIU_H - FISH_H - ACVARIU_SAND_H // nu intră sub nisip
  const fishRef = useRef<Map<number, SwimFish>>(new Map())
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())
  const [fish, setFish] = useState<SwimFish[]>([])

  function publish() {
    setFish(Array.from(fishRef.current.values()).sort((a, b) => a.id - b.id))
  }

  function retarget(id: number) {
    const cur = fishRef.current.get(id)
    if (!cur) return
    const nx = Math.round(Math.random() * boundsW)
    const ny = Math.round(Math.random() * boundsH)
    fishRef.current.set(id, { id, x: nx, y: ny, flip: nx > cur.x })
    publish()
    const delay = SWIM_RETARGET_MIN_MS + Math.random() * (SWIM_RETARGET_MAX_MS - SWIM_RETARGET_MIN_MS)
    timersRef.current.set(id, setTimeout(() => retarget(id), delay))
  }

  useEffect(() => {
    const shown = Math.min(count, MAX_SWIM_FISH)
    // pești noi: intră înotând din marginea din stânga
    for (let id = 0; id < shown; id++) {
      if (fishRef.current.has(id)) continue
      const y = Math.round(Math.random() * boundsH)
      fishRef.current.set(id, { id, x: -FISH_W, y, flip: true })
      const delay = 60 + id * 140 // intră unul câte unul, nu toți deodată
      timersRef.current.set(id, setTimeout(() => retarget(id), delay))
    }
    // pești în minus (scor scăzut): scoatem din capăt, oprim timerul lor
    fishRef.current.forEach((_, id) => {
      if (id >= shown) {
        const t = timersRef.current.get(id)
        if (t) clearTimeout(t)
        timersRef.current.delete(id)
        fishRef.current.delete(id)
      }
    })
    publish()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  useEffect(() => () => { timersRef.current.forEach((t) => clearTimeout(t)) }, [])

  return fish
}

function Acvariu({ count, flash }: { count: number; flash: boolean }) {
  const shown = Math.max(count, 0)
  const fish = useSwimmingFish(shown)
  return (
    <div className={flash ? 'bv-flash' : ''} style={acvariuWrapStyle}>
      {/* sticla + apa: gradient albastru-verde translucid + linie de apă sus */}
      <div style={acvariuGlassStyle} />
      <div className="bv-bubbles" aria-hidden="true">
        <span /><span /><span />
      </div>
      {fish.map((f) => (
        <div
          key={f.id}
          style={{
            position: 'absolute', left: f.x, top: f.y,
            transition: `left ${SWIM_TRANSITION_S}s ease-in-out, top ${SWIM_TRANSITION_S}s ease-in-out`,
            transform: f.flip ? 'scaleX(-1)' : undefined,
          }}
        >
          <Fish index={f.id} />
        </div>
      ))}
      {/* nisip jos, decor */}
      <div style={acvariuSandStyle} />
      <span style={acvariuBadgeStyle}>{count}</span>
    </div>
  )
}

function renderBalloonContent(level: BuleleVulpiiLevel, b: LiveBalloon) {
  const solved = b.state === 'correct'
  const hex = b.group.lesson.color
  if (level === 1) {
    return <span style={{ color: solved ? hex : '#333', fontWeight: 700 }}>{b.group.lesson.letter}</span>
  }
  // Nivel 2: cuvânt monosilabic, doar litera-țintă colorată la răspuns corect
  const text = b.word.text
  const mark = b.word.mark
  const idx = text.toLowerCase().indexOf(mark.toLowerCase())
  if (idx === -1 || !solved) return <span style={{ color: '#333' }}>{text}</span>
  return (
    <span style={{ color: '#333' }}>
      {text.slice(0, idx)}
      <span style={{ color: hex, fontWeight: 700 }}>{text.slice(idx, idx + mark.length)}</span>
      {text.slice(idx + mark.length)}
    </span>
  )
}

export function BuleleVulpiiGame({
  lesson,
  distractorLessons = [],
  nextLesson = null,
  level = 1,
  onFinish,
  onExit,
}: BuleleVulpiiGameProps) {
  const currentGroup: Group = { kind: 'current', lesson }
  const distractorGroups: Group[] = distractorLessons.map(l => ({ kind: 'distractor', lesson: l }))
  const nextGroup: Group | null = nextLesson ? { kind: 'next', lesson: nextLesson } : null
  const allGroups = [currentGroup, ...distractorGroups, ...(nextGroup ? [nextGroup] : [])]

  const [queuePos, setQueuePos] = useState(0)
  const [queueLen, setQueueLen] = useState(0)
  const [balloon, setBalloon] = useState<LiveBalloon | null>(null)
  const [score, setScore] = useState(0)
  const [hearts, setHearts] = useState(10)
  const [fourthVisible, setFourthVisible] = useState(false)
  const [hintGroup, setHintGroup] = useState<Group | null>(null)
  const [scoreFlash, setScoreFlash] = useState(false)
  const [helpMessage, setHelpMessage] = useState<string | null>(null)
  const [done, setDone] = useState<null | { rate: number; passed: boolean }>(null)
  const [overlay, setOverlay] = useState<null | 'pause' | 'exit'>(null)
  const [teethChomp, setTeethChomp] = useState(false)

  const queueRef = useRef<QueueItem[]>([])
  const queuePosRef = useRef(0)
  const scoreRef = useRef(0)
  const correctRef = useRef(0)
  const missRef = useRef(0)
  const heartsRef = useRef(10)
  const hintFiredFor = useRef<Set<number>>(new Set())
  const missHandledFor = useRef<Set<number>>(new Set())
  const pausedRef = useRef(false)
  const pendingSpawnRef = useRef<null | (() => void)>(null)

  const paused = overlay !== null

  function flashScore() { setScoreFlash(true); setTimeout(() => setScoreFlash(false), 400) }

  function spawnAt(pos: number, q: QueueItem[]) {
    const item = q[pos]
    setFourthVisible(item.group.kind === 'next')
    setBalloon({
      id: balloonSeq++,
      group: item.group,
      word: pickWord(item.group.lesson),
      x: BALLOON_X_MIN + Math.random() * BALLOON_X_SPAN,
      progress: 0,
      zone: 'blue',
      state: 'flying',
    })
    speakWord(ttsWordFor(item.group.lesson))
  }

  function advanceQueue() {
    const nextPos = queuePosRef.current + 1
    queuePosRef.current = nextPos
    setQueuePos(nextPos)
    if (nextPos >= queueRef.current.length) {
      const rate = correctRef.current / queueRef.current.length
      setBalloon(null)
      setDone({ rate, passed: rate >= 0.8 })
      onFinish?.({ level, rate, passed: rate >= 0.8 })
      return
    }
    setTimeout(() => {
      const go = () => spawnAt(nextPos, queueRef.current)
      // dacă jocul e pe pauză, următorul balon apare abia la „Continuă"
      if (pausedRef.current) pendingSpawnRef.current = go
      else go()
    }, 250)
  }

  function pauseGame(mode: 'pause' | 'exit') {
    pausedRef.current = true
    setOverlay(mode)
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
  }

  function resumeGame() {
    pausedRef.current = false
    setOverlay(null)
    const pending = pendingSpawnRef.current
    pendingSpawnRef.current = null
    if (pending) pending()
  }

  function exitGame() {
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    onExit?.()
  }

  function start() {
    const q = buildQueue(currentGroup, distractorGroups, nextGroup)
    queueRef.current = q
    queuePosRef.current = 0
    scoreRef.current = 0
    correctRef.current = 0
    missRef.current = 0
    heartsRef.current = 10
    hintFiredFor.current.clear()
    missHandledFor.current.clear()
    pausedRef.current = false
    pendingSpawnRef.current = null
    setOverlay(null)
    setQueueLen(q.length)
    setQueuePos(0)
    setScore(0)
    setHearts(10)
    setDone(null)
    spawnAt(0, q)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { start() }, [lesson.id, level])

  // la ieșirea din componentă, oprește orice sunet rămas în coadă
  useEffect(() => () => { if (typeof window !== 'undefined') window.speechSynthesis?.cancel() }, [])

  // ── zborul balonului curent (oprit cât timp jocul e pe pauză) ──
  useEffect(() => {
    if (!balloon || balloon.state !== 'flying' || overlay) return
    const id = window.setInterval(() => {
      setBalloon(prev => {
        if (!prev || prev.state !== 'flying') return prev
        const p = prev.progress + (100 * TICK_MS) / FLIGHT_MS
        if (p >= 100) return { ...prev, progress: 100, zone: 'pink', state: 'miss' }
        return { ...prev, progress: p, zone: p >= 66 ? 'pink' : 'blue' }
      })
    }, TICK_MS)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balloon?.id, overlay])

  // ── reacții la schimbarea zonei/stării balonului curent ──
  useEffect(() => {
    if (!balloon) return
    if (balloon.zone === 'pink' && !hintFiredFor.current.has(balloon.id)) {
      hintFiredFor.current.add(balloon.id)
      speakWord(ttsWordFor(balloon.group.lesson))
      setHintGroup(balloon.group)
      setTimeout(() => setHintGroup(null), 1000)
    }
    if (balloon.state === 'miss' && !missHandledFor.current.has(balloon.id)) {
      missHandledFor.current.add(balloon.id)
      scoreRef.current -= 1
      setScore(scoreRef.current)
      missRef.current += 1
      flashScore()
      setFourthVisible(false)
      // balonul lovește dinții → se sparge; dinții „mușcă" o clipă
      setTeethChomp(true)
      setTimeout(() => setTeethChomp(false), 450)
      setTimeout(() => { setBalloon(null); advanceQueue() }, 650)
    }
  }, [balloon])

  function handlePress(group: Group) {
    if (!balloon || balloon.state !== 'flying' || pausedRef.current) return
    if (group.lesson.id !== balloon.group.lesson.id) {
      scoreRef.current -= 1
      setScore(scoreRef.current)
      flashScore()
      return
    }
    const points = balloon.group.kind === 'next' ? 2 : 1
    scoreRef.current += points
    setScore(scoreRef.current)
    correctRef.current += 1
    setBalloon(prev => (prev ? { ...prev, state: 'correct' } : prev))
    setFourthVisible(false)
    flashScore()
    setTimeout(() => {
      setBalloon(null)
      advanceQueue()
    }, 900)
  }

  function useHelp() {
    if (!balloon || balloon.state !== 'flying' || pausedRef.current || heartsRef.current <= 0) return
    heartsRef.current -= 1
    setHearts(heartsRef.current)
    speakWord(ttsWordFor(balloon.group.lesson))
    setHelpMessage(balloon.group.lesson.letter)
    setTimeout(() => setHelpMessage(null), 1400)
  }

  const visibleGroups = fourthVisible && nextGroup
    ? [currentGroup, ...distractorGroups, nextGroup]
    : [currentGroup, ...distractorGroups]

  const stageBg = balloon?.zone === 'pink'
    ? 'linear-gradient(#fdeef4, #fbf7f8)'
    : 'linear-gradient(#eaf4fb, #f7fbfd)'

  // Mascotă dinamică: bate din lăbuțe la răspuns corect, se apleacă
  // invitator ("pointing") cât balonul e în zona-indiciu (roz), sare de
  // bucurie la final dacă a trecut pragul, altfel doar respiră liniștit —
  // fără starea `talking` (păstrăm o singură vulpe, fără portret facial
  // suplimentar, ca înainte).
  const mascotState: MascotState = done
    ? (done.passed ? 'cheering' : 'idle')
    : balloon?.state === 'correct'
      ? 'clapping'
      : balloon?.zone === 'pink' && balloon?.state === 'flying'
        ? 'pointing'
        : 'idle'

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', fontFamily: 'inherit', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 10, position: 'relative' }}>
        <Mascot state={mascotState} action={done?.passed ? 'celebrating' : undefined} size={56} />
        {helpMessage && (
          <span style={{ position: 'absolute', left: 60, top: -6, background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: '2px 8px', fontSize: 13, fontWeight: 700 }}>
            {helpMessage}
          </span>
        )}
        <span style={{ fontSize: 13, color: '#a03060' }}>💗 {hearts}</span>
        <button onClick={useHelp} disabled={hearts <= 0 || paused} style={pillBtnStyle}>Ajută-mă</button>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => (paused ? resumeGame() : pauseGame('pause'))}
            disabled={!!done}
            style={pillBtnStyle}
          >
            {paused ? '▶ Continuă' : '⏸ Pauză'}
          </button>
        </div>
      </div>

      {onExit && (
        <button onClick={() => pauseGame('exit')} aria-label="Ieși din joc" style={exitCornerBtnStyle}>✕</button>
      )}

      <div style={{ position: 'relative', height: STAGE_H, borderRadius: 14, overflow: 'hidden', background: stageBg, transition: 'background 400ms' }}>
        {/* dinți zimțați, pe toată lățimea marginii de sus (statici — nu se mai deplasează) */}
        <div
          className={teethChomp ? 'bv-chomp' : ''}
          style={{
            position: 'absolute', top: 6, left: 0, right: 0, height: 34,
            background: 'repeating-linear-gradient(45deg, #8baac9, #8baac9 10px, #fff 10px, #fff 20px)',
            WebkitMaskImage: TOOTH_MASK, maskImage: TOOTH_MASK,
            WebkitMaskSize: '28px 34px', maskSize: '28px 34px',
            WebkitMaskRepeat: 'repeat-x', maskRepeat: 'repeat-x',
            transformOrigin: 'top center',
          }}
        />
        {/* coșul din nuiele — sus în dreapta, sub dinți; mereu vizibil */}
        <div style={{ position: 'absolute', right: 8, top: TEETH_BOTTOM + 14 }}>
          <Acvariu count={Math.max(score, 0)} flash={scoreFlash} />
        </div>

        {balloon && (() => {
          // urcă drept, până la dinți (care acoperă toată lățimea); coșul e în colțul dreapta-sus
          const leftPct = balloon.x
          const bottomPx = (Math.min(balloon.progress, 100) / 100) * MAX_RISE_PX
          const burst = balloon.state === 'miss'
          return (
            <div style={{ position: 'absolute', left: `${leftPct}%`, bottom: bottomPx, width: BALLOON_SIZE, height: BALLOON_SIZE }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%', height: '100%', boxSizing: 'border-box', borderRadius: '50%',
                  background: '#fff', border: '2px solid #cfe4f2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: level === 2 ? 16 : 24,
                  boxShadow: '0 2px 6px rgba(0,0,0,.08)',
                  transition: balloon.state === 'correct' ? 'transform 400ms' : undefined,
                  transform: balloon.state === 'correct' ? 'scale(1.25)' : 'scale(1)',
                  animation: burst ? 'bv-pop 260ms ease-out forwards' : undefined,
                }}
              >
                {renderBalloonContent(level, balloon)}
                {balloon.group.kind === 'next' && (
                  <span style={{ position: 'absolute', top: -8, right: -6, fontSize: 13 }}>✨</span>
                )}
              </div>
              {burst && (
                <>
                  <span className="bv-ring" />
                  {Array.from({ length: 8 }).map((_, i) => {
                    const a = (i * Math.PI) / 4
                    return (
                      <span
                        key={i}
                        className="bv-shard"
                        style={{
                          background: i % 2 ? '#fff' : balloon.group.lesson.color,
                          ['--dx' as string]: `${Math.cos(a) * 34}px`,
                          ['--dy' as string]: `${Math.sin(a) * 34}px`,
                        }}
                      />
                    )
                  })}
                </>
              )}
            </div>
          )
        })()}

        {overlay && !done && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 5, background: 'rgba(255,255,255,.94)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            {overlay === 'pause' ? (
              <>
                <div style={{ fontSize: 18, fontWeight: 700 }}>⏸ Pauză</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button style={{ ...pillBtnStyle, background: '#1a1917', color: '#fff', borderColor: '#1a1917' }} onClick={resumeGame}>▶ Continuă</button>
                  <button style={pillBtnStyle} onClick={start}>↻ Reia nivelul</button>
                  {onExit && <button style={pillBtnStyle} onClick={() => setOverlay('exit')}>✕ Ieși din joc</button>}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Ieși din joc?</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ ...pillBtnStyle, background: '#1a1917', color: '#fff', borderColor: '#1a1917' }} onClick={resumeGame}>Rămâi în joc</button>
                  <button style={pillBtnStyle} onClick={exitGame}>Ieși</button>
                </div>
              </>
            )}
          </div>
        )}

        {done && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              {done.passed ? '🎉 Reușit!' : 'Mai încearcă'} — {Math.round(done.rate * 100)}%
            </div>
            <button onClick={start} style={pillBtnStyle}>Reia</button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 16 }}>
        {visibleGroups.map(g => {
          const hinted = hintGroup?.lesson.id === g.lesson.id
          return (
            <button
              key={g.lesson.id}
              onClick={() => handlePress(g)}
              style={{
                width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: g.lesson.color,
                boxShadow: hinted ? '0 0 0 5px rgba(0,0,0,.12)' : '0 1px 3px rgba(0,0,0,.15)',
                transition: 'box-shadow 200ms',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: g.lesson.color }}>
                {g.lesson.letter}
              </span>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, fontSize: 13, color: '#555', flexWrap: 'wrap', gap: 8 }}>
        <span style={festiveScoreStyle} className={scoreFlash ? 'bv-score-flash' : undefined}>
          🎉 Scor: {score}
        </span>
        <div
          role="img"
          aria-label={`Balon ${Math.min(queuePos + 1, queueLen)} din ${queueLen}`}
          style={{ display: 'flex', alignItems: 'center', gap: 3 }}
        >
          {Array.from({ length: queueLen }).map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`bv-balloon-pip${i < queuePos ? ' bv-balloon-pip-gone' : ''}`}
            >
              <svg viewBox="0 0 24 30" width="20" height="24" fill="none">
                <path
                  d="M12 1C6.2 1 2 5.9 2 11.3c0 5.4 4.3 10.4 9 12.4a1.1 1.1 0 0 0 .9 0c4.8-2 9.1-7 9.1-12.4C21 5.9 17.8 1 12 1Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <path d="M11 23.7 12 29l1-5.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .bv-balloon-pip {
          display: inline-flex; align-items: center; justify-content: center;
          width: 20px; height: 24px; overflow: hidden; color: #b7bec7;
          transition: opacity 380ms ease, transform 380ms ease, width 380ms ease 40ms, margin 380ms ease 40ms;
        }
        .bv-balloon-pip-gone { opacity: 0; transform: scale(.35) translateY(-8px); width: 0; margin: 0 -1.5px; }
        @keyframes bv-flash { 0% { filter: brightness(1) } 50% { filter: brightness(1.6) } 100% { filter: brightness(1) } }
        .bv-flash { animation: bv-flash 400ms ease-out; }
        @keyframes bv-score-flash { 0% { transform: scale(1) } 40% { transform: scale(1.35) rotate(-2deg) } 100% { transform: scale(1) } }
        .bv-score-flash { animation: bv-score-flash 400ms ease-out; display: inline-block; }
        @keyframes bv-pop { 0% { transform: scale(1); opacity: 1 } 40% { transform: scale(1.35); opacity: 1 } 100% { transform: scale(1.7); opacity: 0 } }
        @keyframes bv-ring { 0% { transform: scale(.6); opacity: .9 } 100% { transform: scale(2); opacity: 0 } }
        @keyframes bv-shard { 0% { transform: translate(0,0) scale(1); opacity: 1 } 100% { transform: translate(var(--dx), var(--dy)) scale(.3); opacity: 0 } }
        @keyframes bv-chomp { 0% { transform: translateY(0) scaleY(1) } 30% { transform: translateY(5px) scaleY(.8) } 60% { transform: translateY(-1px) scaleY(1.05) } 100% { transform: translateY(0) scaleY(1) } }
        .bv-chomp { animation: bv-chomp 450ms ease-out; }
        @keyframes bv-fish-in { 0% { transform: translateY(-14px) scale(.4); opacity: 0 } 70% { transform: translateY(2px) scale(1.15); opacity: 1 } 100% { transform: translateY(0) scale(1); opacity: 1 } }
        .bv-fish { animation: bv-fish-in 350ms ease-out; }
        @keyframes bv-tail-wag { 0% { transform: rotate(0deg) } 50% { transform: rotate(14deg) } 100% { transform: rotate(0deg) } }
        .bv-fish-tail { transform-origin: 28px 10px; animation: bv-tail-wag 650ms ease-in-out infinite; }
        @keyframes bv-bubble { 0% { transform: translateY(0) scale(.6); opacity: 0 } 15% { opacity: .8 } 100% { transform: translateY(-120px) scale(1); opacity: 0 } }
        .bv-bubbles { position: absolute; inset: 0; pointer-events: none; }
        .bv-bubbles span { position: absolute; bottom: 4px; width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.55); animation: bv-bubble 3.2s linear infinite; }
        .bv-bubbles span:nth-child(1) { left: 20%; animation-delay: 0s; }
        .bv-bubbles span:nth-child(2) { left: 55%; width: 4px; height: 4px; animation-delay: 1.1s; }
        .bv-bubbles span:nth-child(3) { left: 80%; width: 6px; height: 6px; animation-delay: 2.1s; }
        .bv-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid #9cc7e4; animation: bv-ring 450ms ease-out forwards; pointer-events: none; }
        .bv-shard { position: absolute; left: 50%; top: 50%; width: 7px; height: 7px; margin: -3px 0 0 -3px; border-radius: 50%; border: 1px solid rgba(0,0,0,.12); animation: bv-shard 500ms ease-out forwards; pointer-events: none; }
      `}</style>
    </div>
  )
}

const acvariuWrapStyle: React.CSSProperties = {
  position: 'relative',
  width: ACVARIU_W, height: ACVARIU_H,
  borderRadius: 14,
  overflow: 'hidden',
  filter: 'drop-shadow(0 3px 3px rgba(0,0,0,.2))',
  border: '3px solid rgba(255,255,255,.8)',
  boxShadow: 'inset 0 0 14px rgba(20,60,80,.35)',
}

const acvariuGlassStyle: React.CSSProperties = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(180deg, #d6f0ee 0%, #a9dde3 12%, #7fc7d6 55%, #5fa9bd 100%)',
}

const acvariuSandStyle: React.CSSProperties = {
  position: 'absolute', left: 0, right: 0, bottom: 0, height: ACVARIU_SAND_H,
  background: 'linear-gradient(180deg, #e8cf8f 0%, #d4b56b 100%)',
  borderTop: '1px solid rgba(255,255,255,.4)',
}

const acvariuBadgeStyle: React.CSSProperties = {
  position: 'absolute', left: 6, top: 6,
  padding: '0 8px', borderRadius: 9, border: '1px solid #5fa9bd',
  background: 'rgba(255,255,255,.85)',
  fontSize: 13, fontWeight: 700, lineHeight: '19px', color: '#215866',
  zIndex: 2,
}

const pillBtnStyle: React.CSSProperties = {
  border: '1px solid #e8e6e1', background: '#f8f7f4', borderRadius: 999,
  padding: '6px 14px', fontSize: 12.5, cursor: 'pointer',
}

const exitCornerBtnStyle: React.CSSProperties = {
  position: 'absolute', top: -6, right: -6, zIndex: 6,
  width: 28, height: 28, borderRadius: '50%',
  border: '1px solid #e2e2e2', background: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 14, fontWeight: 700, color: '#666', lineHeight: 1,
  cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,.15)',
}

const festiveScoreStyle: React.CSSProperties = {
  fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", cursive, sans-serif',
  fontWeight: 800,
  fontSize: 20,
  letterSpacing: 0.3,
  background: 'linear-gradient(90deg, #ff8a3d, #ffb703, #ff8a3d)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  textShadow: '0 1px 0 rgba(255,255,255,.5)',
  transition: 'transform 200ms',
}
