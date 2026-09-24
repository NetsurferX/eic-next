'use client'

import { useEffect, useRef, useState } from 'react'
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
//  - nivelurile 1/2/3 (literă / fără literă / cuvânt) NU se înlănțuie
//    singure — apelantul decide, via onFinish, dacă trece la nivelul
//    următor, repetă, sau oprește aici.
//
// Actualizare (2026-09-24): balonul se sparge efectiv la dinți (inel +
// cioburi, dinții „mușcă"); o singură vulpe în joc (starea `idle`, fără
// portretul facial al lui `talking`); buton de Pauză și de Ieși (`onExit`).
// ─────────────────────────────────────────────────────────────────────────

export type BuleleVulpiiLevel = 1 | 2 | 3

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
  /** Nivel 1 = literă în balon, 2 = balon gol, 3 = cuvânt monosilabic. Implicit 1. */
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

// 20 baloane: 60% sunet antrenat, ~35% distractori (împărțiți proporțional
// între câți sunt dați), 5% sunetul următor (dacă există).
function buildQueue(current: Group, distractors: Group[], next: Group | null): QueueItem[] {
  const nextCount = next ? 1 : 0
  let currentCount = 12
  let distractorTotal = 20 - currentCount - nextCount
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
// Geometria zonei de joc: balonul urcă până când vârful lui atinge marginea
// de jos a dinților (nu până în marginea zonei) — acolo se sparge. Dinții
// ocupă treimea centrală (33%–67%) a marginii de sus.
const STAGE_H = 270
const TEETH_BOTTOM = 40
const BALLOON_SIZE = 46
const MAX_RISE_PX = STAGE_H - TEETH_BOTTOM - BALLOON_SIZE
const TEETH_LEFT_MIN = 35   // % — marginea stângă minimă a balonului sub dinți
const TEETH_LEFT_MAX = 58   // % — marginea stângă maximă a balonului sub dinți
let balloonSeq = 0

function renderBalloonContent(level: BuleleVulpiiLevel, b: LiveBalloon) {
  const solved = b.state === 'correct'
  const hex = b.group.lesson.color
  if (level === 2) return null
  if (level === 1) {
    return <span style={{ color: solved ? hex : '#333', fontWeight: 700 }}>{b.group.lesson.letter}</span>
  }
  // Nivel 3: cuvânt monosilabic, doar litera-țintă colorată la răspuns corect
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
  const [shifted, setShifted] = useState(false) // dinți retrași / coșuri afară
  const [scoreFlash, setScoreFlash] = useState(false)
  const [soundBasketFlash, setSoundBasketFlash] = useState(false)
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
  function flashSoundBasket() { setSoundBasketFlash(true); setTimeout(() => setSoundBasketFlash(false), 400) }

  function spawnAt(pos: number, q: QueueItem[]) {
    const item = q[pos]
    setFourthVisible(item.group.kind === 'next')
    setBalloon({
      id: balloonSeq++,
      group: item.group,
      word: pickWord(item.group.lesson),
      x: 12 + Math.random() * 66,
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
    setShifted(false)
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
    const target: 'sound' | 'score' = balloon.group.kind === 'current' ? 'sound' : 'score'
    scoreRef.current += points
    setScore(scoreRef.current)
    correctRef.current += 1
    setBalloon(prev => (prev ? { ...prev, state: 'correct' } : prev))
    setFourthVisible(false)
    setShifted(true)
    flashScore()
    if (target === 'sound') flashSoundBasket()
    setTimeout(() => {
      setShifted(false)
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
        {/* dinți zimțați */}
        <div
          className={teethChomp ? 'bv-chomp' : ''}
          style={{
            position: 'absolute', top: 6, height: 34,
            left: shifted ? '-40%' : '33%', width: '34%',
            background: 'repeating-linear-gradient(45deg, #8baac9, #8baac9 10px, #fff 10px, #fff 20px)',
            clipPath: 'polygon(0% 0%,100% 0%,100% 40%,90% 100%,80% 40%,70% 100%,60% 40%,50% 100%,40% 40%,30% 100%,20% 40%,10% 100%,0% 40%)',
            transition: 'left 420ms cubic-bezier(.25,1,.5,1)',
            transformOrigin: 'top center',
          }}
        />
        {/* coșuri de paie */}
        <div
          style={{
            position: 'absolute', top: 2, height: 46, display: 'flex', gap: 10, justifyContent: 'center',
            left: shifted ? '30%' : '110%', width: '40%',
            transition: 'left 420ms cubic-bezier(.25,1,.5,1)',
          }}
        >
          <div className={scoreFlash ? 'bv-flash' : ''} style={basketStyle}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#5c4424' }}>{score}</span>
          </div>
          <div className={soundBasketFlash ? 'bv-flash' : ''} style={basketStyle}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: lesson.color, border: '2px solid #333' }} />
          </div>
        </div>

        {balloon && (() => {
          // urcă până la dinți; dacă a pornit în afara treimii centrale, derivă
          // ușor spre ea, ca să lovească mereu dinții
          const t = Math.pow(balloon.progress / 100, 1.6)
          const xEnd = Math.min(Math.max(balloon.x, TEETH_LEFT_MIN), TEETH_LEFT_MAX)
          const leftPct = balloon.x + (xEnd - balloon.x) * t
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
                  fontSize: level === 3 ? 12 : 18,
                  boxShadow: '0 2px 6px rgba(0,0,0,.08)',
                  transition: balloon.state === 'correct' ? 'transform 400ms' : undefined,
                  transform: balloon.state === 'correct' ? 'scale(0.7)' : 'scale(1)',
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
        .bv-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid #9cc7e4; animation: bv-ring 450ms ease-out forwards; pointer-events: none; }
        .bv-shard { position: absolute; left: 50%; top: 50%; width: 7px; height: 7px; margin: -3px 0 0 -3px; border-radius: 50%; border: 1px solid rgba(0,0,0,.12); animation: bv-shard 500ms ease-out forwards; pointer-events: none; }
      `}</style>
    </div>
  )
}

const basketStyle: React.CSSProperties = {
  width: 70, height: 46,
  background: 'linear-gradient(135deg, #e8c894 0%, #ccaa70 100%)',
  border: '2px solid #b5955c',
  borderRadius: '0 0 20px 20px',
  boxShadow: '0 4px 6px rgba(0,0,0,.15)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const pillBtnStyle: React.CSSProperties = {
  border: '1px solid #e8e6e1', background: '#f8f7f4', borderRadius: 999,
  padding: '6px 14px', fontSize: 12.5, cursor: 'pointer',
}
