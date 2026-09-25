'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Mascot } from './Mascot'
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
function buildQueue(current: Group, distractors: Group[], next: Group | null): QueueItem[] {
  const nextCount = next ? 1 : 0
  let currentCount = 6
  let distractorTotal = 10 - currentCount - nextCount
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
  return shuffle(items)
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
const BASKET_W = 100
const BASKET_H = 78
const MAX_FISH_SHOWN = 8
// dintele: un triunghi cu umeri, repetat pe orizontală ca mască CSS
const TOOTH_MASK = `url("data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='28' height='34' viewBox='0 0 28 34'><path d='M0 0H28V14L14 34L0 14Z' fill='black'/></svg>")}")`
let balloonSeq = 0

// Patru „specii" (spate, burtă, aripioare), ca peștii din coș să nu fie
// identici: argintiu-albăstrui, auriu-portocaliu, păstrăv măsliniu (cu pete),
// roșiatic. Poziția/înclinarea fiecărui pește vin din FISH_SLOTS — un morman
// așezat în deschiderea coșului, nu un rând ordonat.
const FISH_PALETTE = [
  { back: '#3f6d8a', belly: '#dfe9ee', fin: '#2c5068', spots: false },
  { back: '#e2721f', belly: '#f8c98a', fin: '#a94d10', spots: false },
  { back: '#6b7a3a', belly: '#e9e2b4', fin: '#4a5626', spots: true },
  { back: '#c9553f', belly: '#f5bfae', fin: '#8f3524', spots: false },
]
// [stânga, sus, înclinare°] în coordonatele coșului (100×78); ordinea = ordinea la umplere.
// Primii pești stau în deschiderea coșului (sus 8–9 — zona vizibilă dintre buza din spate
// și peretele din față, care acoperă tot ce e sub y≈27 la centru); ceilalți se
// îngrămădesc deasupra, peste buza din spate.
const FISH_SLOTS: [number, number, number][] = [
  [34, 9, -6], [12, 8, -12], [54, 8, 10], [30, 0, 8],
  [52, -2, -14], [14, -3, 16], [36, -10, -4], [24, -14, 20],
]

function Fish({ index }: { index: number }) {
  const uid = useId().replace(/:/g, '')
  const pal = FISH_PALETTE[index % FISH_PALETTE.length]
  const [left, top, rot] = FISH_SLOTS[index % FISH_SLOTS.length]
  return (
    <div style={{ position: 'absolute', left, top, width: 34, height: 17, transform: `rotate(${rot}deg)` }}>
      <svg className="bv-fish" width="34" height="17" viewBox="0 0 40 20" style={{ overflow: 'visible' }} aria-hidden="true">
        <defs>
          <linearGradient id={`fg${uid}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={pal.back} />
            <stop offset=".55" stopColor={pal.back} />
            <stop offset=".75" stopColor={pal.belly} />
            <stop offset="1" stopColor={pal.belly} />
          </linearGradient>
        </defs>
        {/* coada bifurcată, înotătoarea dorsală */}
        <path d="M29 10 L39 2.5 Q36.5 10 39 17.5 Z" fill={pal.fin} stroke="rgba(0,0,0,.3)" strokeWidth=".6" strokeLinejoin="round" />
        <path d="M12 4 Q17 -1 25 4.5 Z" fill={pal.fin} stroke="rgba(0,0,0,.3)" strokeWidth=".6" />
        {/* corpul cu spate întunecat și burtă deschisă */}
        <path d="M2 10 C5 4, 14 2, 22 3.5 C27 4.5, 30 8, 31 10 C30 12, 27 15.5, 22 16.5 C14 18, 5 16, 2 10 Z" fill={`url(#fg${uid})`} stroke={pal.fin} strokeWidth=".8" />
        {pal.spots && (
          <g fill="rgba(0,0,0,.35)">
            <circle cx="14" cy="6.5" r=".9" /><circle cx="19" cy="5.5" r=".8" /><circle cx="23" cy="7" r=".8" />
          </g>
        )}
        {/* linia laterală, solzi, branhie */}
        <path d="M7 10 Q18 8.3 29 10" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth=".8" />
        <path d="M12 6.5 q2.2 2 0 4.5 M16 6 q2.2 2.4 0 5 M20 6.3 q2.2 2.2 0 4.6 M24 7 q2 2 0 4" fill="none" stroke="rgba(0,0,0,.14)" strokeWidth=".7" />
        <path d="M9.5 6 Q7.8 10 9.5 14" fill="none" stroke="rgba(0,0,0,.3)" strokeWidth=".9" />
        {/* înotătoarea pectorală și ochiul */}
        <path d="M13 12.5 Q16 16.5 20 15 Q17 12.5 13 12.5 Z" fill={pal.fin} opacity=".85" />
        <circle cx="5.6" cy="8.4" r="1.7" fill="#f7f2de" stroke="rgba(0,0,0,.4)" strokeWidth=".4" />
        <circle cx="5.3" cy="8.4" r=".95" fill="#111" />
      </svg>
    </div>
  )
}

// Coș din nuiele împletite (SVG), care acumulează pești — câte unul pentru
// fiecare punct/balon colectat. Straturi: interiorul + buza din spate → peștii
// → peretele din față (împletitura) + buza răsucită din față, ca peștii să
// stea „în" coș. Numărul real e pe perete; peștii vizibili sunt limitați la
// MAX_FISH_SHOWN ca să nu iasă din coș.
const BASKET_BODY = 'M7 18 C8 52 18 76 50 76 C82 76 92 52 93 18 A43 11 0 0 1 7 18 Z'

function FishBasket({ count, flash }: { count: number; flash: boolean }) {
  const uid = useId().replace(/:/g, '')
  const shown = Math.min(Math.max(count, 0), MAX_FISH_SHOWN)
  return (
    <div className={flash ? 'bv-flash' : ''} style={basketWrapStyle}>
      <svg width={BASKET_W} height={BASKET_H} viewBox="0 0 100 78" style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
        <ellipse cx="50" cy="18" rx="43" ry="11" fill="#4f341a" />
        <ellipse cx="50" cy="18" rx="43" ry="11" fill="none" stroke="#a5742f" strokeWidth="5" />
      </svg>
      {Array.from({ length: shown }).map((_, i) => (
        <Fish key={i} index={i} />
      ))}
      <svg width={BASKET_W} height={BASKET_H} viewBox="0 0 100 78" style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
        <defs>
          <pattern id={`w${uid}`} width="14" height="10" patternUnits="userSpaceOnUse">
            <rect width="14" height="10" fill="#9c6a28" />
            <rect x="0.5" y="0.6" width="12.5" height="4" rx="2" fill="#d9ae66" />
            <rect x="-6.5" y="5.6" width="12.5" height="4" rx="2" fill="#c8994f" />
            <rect x="7.5" y="5.6" width="12.5" height="4" rx="2" fill="#c8994f" />
            <rect x="6.2" y="0" width="1.6" height="10" fill="rgba(60,35,8,.28)" />
          </pattern>
          <linearGradient id={`s${uid}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#3a2208" stopOpacity=".5" />
            <stop offset=".3" stopColor="#fff" stopOpacity=".08" />
            <stop offset=".7" stopColor="#3a2208" stopOpacity=".05" />
            <stop offset="1" stopColor="#3a2208" stopOpacity=".55" />
          </linearGradient>
          <clipPath id={`c${uid}`}><path d={BASKET_BODY} /></clipPath>
        </defs>
        <path d={BASKET_BODY} fill={`url(#w${uid})`} stroke="#6e4a1c" strokeWidth="1.2" />
        <path d={BASKET_BODY} fill={`url(#s${uid})`} />
        <g clipPath={`url(#c${uid})`} fill="none" stroke="rgba(60,35,8,.35)" strokeWidth="1.2">
          <path d="M0 36 Q50 50 100 36" />
          <path d="M0 50 Q50 64 100 50" />
          <path d="M0 63 Q50 75 100 63" />
        </g>
        <path d="M7 18 A43 11 0 0 0 93 18" fill="none" stroke="#b78334" strokeWidth="6" strokeLinecap="round" />
        <path d="M7 18 A43 11 0 0 0 93 18" fill="none" stroke="#e6bd72" strokeWidth="3" strokeDasharray="5 4" />
      </svg>
      <span style={basketBadgeStyle}>{count}</span>
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
  const [missCount, setMissCount] = useState(0)
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
    setMissCount(0)
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
      setMissCount(missRef.current)
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

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 10, position: 'relative' }}>
        {/* o singură vulpe: `idle` (nu `talking`, care adaugă un portret facial lângă cap) */}
        <Mascot state={done?.passed ? 'cheering' : 'idle'} action={done?.passed ? 'celebrating' : undefined} size={56} />
        {helpMessage && (
          <span style={{ position: 'absolute', left: 60, top: -6, background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: '2px 8px', fontSize: 13, fontWeight: 700 }}>
            {helpMessage}
          </span>
        )}
        <span style={{ fontSize: 13, color: '#a03060' }}>💗 {hearts}</span>
        <button onClick={useHelp} disabled={hearts <= 0 || paused} style={pillBtnStyle}>🦊 Ajutor</button>
        <button
          onClick={() => (paused ? resumeGame() : pauseGame('pause'))}
          disabled={!!done}
          style={pillBtnStyle}
        >
          {paused ? '▶ Continuă' : '⏸ Pauză'}
        </button>
        {onExit && (
          <button onClick={() => pauseGame('exit')} style={pillBtnStyle}>✕ Ieși</button>
        )}
      </div>

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
          <FishBasket count={Math.max(score, 0)} flash={scoreFlash} />
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

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, fontSize: 13, color: '#555', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontWeight: 600, color: '#2b2b2b' }}>Scor: {score}</span>
        <span>Greșeli: {missCount}</span>
        <span>Balon {Math.min(queuePos + 1, queueLen)}/{queueLen}</span>
      </div>

      <style>{`
        @keyframes bv-flash { 0% { filter: brightness(1) } 50% { filter: brightness(1.6) } 100% { filter: brightness(1) } }
        .bv-flash { animation: bv-flash 400ms ease-out; }
        @keyframes bv-pop { 0% { transform: scale(1); opacity: 1 } 40% { transform: scale(1.35); opacity: 1 } 100% { transform: scale(1.7); opacity: 0 } }
        @keyframes bv-ring { 0% { transform: scale(.6); opacity: .9 } 100% { transform: scale(2); opacity: 0 } }
        @keyframes bv-shard { 0% { transform: translate(0,0) scale(1); opacity: 1 } 100% { transform: translate(var(--dx), var(--dy)) scale(.3); opacity: 0 } }
        @keyframes bv-chomp { 0% { transform: translateY(0) scaleY(1) } 30% { transform: translateY(5px) scaleY(.8) } 60% { transform: translateY(-1px) scaleY(1.05) } 100% { transform: translateY(0) scaleY(1) } }
        .bv-chomp { animation: bv-chomp 450ms ease-out; }
        @keyframes bv-fish-in { 0% { transform: translateY(-14px) scale(.4); opacity: 0 } 70% { transform: translateY(2px) scale(1.15); opacity: 1 } 100% { transform: translateY(0) scale(1); opacity: 1 } }
        .bv-fish { animation: bv-fish-in 350ms ease-out; }
        .bv-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid #9cc7e4; animation: bv-ring 450ms ease-out forwards; pointer-events: none; }
        .bv-shard { position: absolute; left: 50%; top: 50%; width: 7px; height: 7px; margin: -3px 0 0 -3px; border-radius: 50%; border: 1px solid rgba(0,0,0,.12); animation: bv-shard 500ms ease-out forwards; pointer-events: none; }
      `}</style>
    </div>
  )
}

const basketWrapStyle: React.CSSProperties = {
  position: 'relative',
  width: BASKET_W, height: BASKET_H,
  filter: 'drop-shadow(0 3px 3px rgba(0,0,0,.2))',
}

const basketBadgeStyle: React.CSSProperties = {
  position: 'absolute', left: '50%', bottom: 10, transform: 'translateX(-50%)',
  padding: '0 8px', borderRadius: 9, border: '1px solid #b78334',
  background: 'rgba(255,248,230,.94)',
  fontSize: 12, fontWeight: 700, lineHeight: '17px', color: '#5c4424',
}

const pillBtnStyle: React.CSSProperties = {
  border: '1px solid #e8e6e1', background: '#f8f7f4', borderRadius: 999,
  padding: '6px 14px', fontSize: 12.5, cursor: 'pointer',
}
