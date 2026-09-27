'use client'

import { useEffect, useRef, useState } from 'react'
// import type — erased la compilare; valoarea runtime a lui `konva` se
// încarcă dynamic, mai jos, doar client-side (vezi Actualizarea 6): un
// import static la vârful fișierului face ca Next/Turbopack să încerce să
// rezolve `konva` și în bundle-ul de SSR, unde lovește `Module not found:
// canvas` (intrarea Node a Konva cere pachetul nativ `canvas`).
import type Konva from 'konva'
import confetti from 'canvas-confetti'
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
//
// Actualizare 6 (2026-09-26) — motor de randare: zona de joc (dinți, coș,
// balon) trece de pe DOM absolut-poziționat + CSS keyframes pe <canvas>,
// desenat imperativ cu `konva` (fără `react-konva` — bug confirmat,
// nerezolvat, cu React 18.3.x sub Turbopack: konvajs/react-konva#851).
// Efectul de spargere/reușită trece de la cioburi+inel desenate manual la
// `canvas-confetti` (culorat cu culoarea sunetului la reușită, gri discret la
// ratare). Mascota, inimile/ajutor, pauză/ieșire, butoanele de culoare și
// scorul din subsol RĂMÂN DOM, neschimbate — logica de stare (coadă, scor,
// inimi, indiciu, pauză) e IDENTICĂ cu varianta anterioară, doar randarea
// vizuală a zonei de joc s-a schimbat. Simplificat deliberat față de arta
// SVG originală a coșului/peștilor: coșul e un contur din aceeași formă
// (path-ul SVG original, refolosit ca `Konva.Path`), iar peștii sunt elipse
// colorate (nu desenul detaliat cu aripioare/solzi) — de rafinat ulterior
// dacă fidelitatea vizuală contează.
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
  x: number // % orizontal (0-100) în zona de joc — convertit în px la desenare
  progress: number
  zone: Zone
  state: BalloonState
}

const FLIGHT_MS = 5200
const TICK_MS = 50
// Geometria zonei de joc: dinții pe toată lățimea marginii de sus, coșul
// în colțul dreapta-sus, sub dinți; balonul urcă prin coloana centrală până
// când vârful lui atinge marginea de jos a dinților — acolo se sparge.
const STAGE_H = 290
const TEETH_TOP = 6
const TEETH_H = 34
const TEETH_BOTTOM = TEETH_TOP + TEETH_H // 40
const BALLOON_SIZE = 62
const BALLOON_R = BALLOON_SIZE / 2
const MAX_RISE_PX = STAGE_H - TEETH_BOTTOM - BALLOON_SIZE
const BALLOON_X_MIN = 14 // % — marginea stângă a balonului; coșul e în dreapta-sus
const BALLOON_X_SPAN = 42
const BASKET_W = 100
const BASKET_H = 78
const BASKET_MARGIN = 8
const MAX_FISH_SHOWN = 8
let balloonSeq = 0

// Patru „specii" (spate/aripioare), ca peștii din coș să nu fie identici:
// argintiu-albăstrui, auriu-portocaliu, păstrăv măsliniu, roșiatic.
// Poziția/înclinarea fiecărui pește vin din FISH_SLOTS — un morman așezat în
// deschiderea coșului, nu un rând ordonat. (Elipse colorate — simplificare
// față de desenul SVG original cu aripioare/solzi/pete.)
const FISH_PALETTE = [
  { back: '#3f6d8a', fin: '#2c5068' },
  { back: '#e2721f', fin: '#a94d10' },
  { back: '#6b7a3a', fin: '#4a5626' },
  { back: '#c9553f', fin: '#8f3524' },
]
// [stânga, sus, înclinare°] în coordonatele coșului (100×78, aceleași ca path-ul SVG).
const FISH_SLOTS: [number, number, number][] = [
  [34, 9, -6], [12, 8, -12], [54, 8, 10], [30, 0, 8],
  [52, -2, -14], [14, -3, 16], [36, -10, -4], [24, -14, 20],
]
// coșul din nuiele — același contur SVG folosit înainte, refolosit direct ca
// Konva.Path (`data` acceptă sintaxa unui atribut `d` de SVG)
const BASKET_BODY = 'M7 18 C8 52 18 76 50 76 C82 76 92 52 93 18 A43 11 0 0 1 7 18 Z'

// dinți zimțați pe toată lățimea curentă a scenei (lățime variabilă — panoul
// e responsive; se redesenează la resize)
function teethPoints(w: number, toothW = 28): number[] {
  const count = Math.max(2, Math.round(w / toothW))
  const step = w / count
  const pts: number[] = [0, 0]
  for (let i = 0; i <= count; i++) pts.push(i * step, i % 2 === 0 ? TEETH_H : TEETH_H * 0.4)
  pts.push(w, 0)
  return pts
}

// măsoară lățimea unui text cu un context 2D offscreen — pentru poziționarea
// segmentelor colorate (nivelul 2: doar litera-țintă colorată în cuvânt)
let measureCtx: CanvasRenderingContext2D | null = null
function measureTextWidth(text: string, font: string): number {
  if (typeof document === 'undefined') return text.length * 8
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d')
  if (!measureCtx) return text.length * 8
  measureCtx.font = font
  return measureCtx.measureText(text).width
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

  // ── Konva: refs către scenă și shape-uri persistente ──
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage | null>(null)
  const layerRef = useRef<Konva.Layer | null>(null)
  const bgRef = useRef<Konva.Rect | null>(null)
  const teethRef = useRef<Konva.Line | null>(null)
  const basketGroupRef = useRef<Konva.Group | null>(null)
  const basketBadgeRef = useRef<Konva.Text | null>(null)
  const fishGroupRef = useRef<Konva.Group | null>(null)
  const balloonGroupRef = useRef<Konva.Group | null>(null)
  const stageWRef = useRef(620)
  const fontFamilyRef = useRef('sans-serif')
  const lastBurstId = useRef<number | null>(null)
  const konvaModRef = useRef<typeof import('konva').default | null>(null)
  const [stageReady, setStageReady] = useState(false)

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

  // Mascotă dinamică: bate din lăbuțe la răspuns corect, se apleacă
  // invitator ("pointing") cât balonul e în zona-indiciu (roz), sare de
  // bucurie la final dacă a trecut pragul, altfel doar respiră liniștit.
  const mascotState: MascotState = done
    ? (done.passed ? 'cheering' : 'idle')
    : balloon?.state === 'correct'
      ? 'clapping'
      : balloon?.zone === 'pink' && balloon?.state === 'flying'
        ? 'pointing'
        : 'idle'

  // ── construiește scena Konva o singură dată; se demontează la unmount ──
  // `konva` se încarcă prin import() dynamic (nu static la vârful
  // fișierului), ca să nu fie deloc parte din bundle-ul de SSR — vezi nota
  // de la importul de tip de mai sus.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let cancelled = false
    let ro: ResizeObserver | null = null

    import('konva').then(mod => {
      if (cancelled) return
      const Konva = mod.default
      konvaModRef.current = Konva
      fontFamilyRef.current = window.getComputedStyle(document.body).fontFamily || 'sans-serif'

      const w0 = el.clientWidth || 620
      stageWRef.current = w0
      const stage = new Konva.Stage({ container: el, width: w0, height: STAGE_H })
      const layer = new Konva.Layer()
      stage.add(layer)

      const bg = new Konva.Rect({
        x: 0, y: 0, width: w0, height: STAGE_H,
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: 0, y: STAGE_H },
        fillLinearGradientColorStops: [0, '#eaf4fb', 1, '#f7fbfd'],
      })

      const teeth = new Konva.Line({
        points: teethPoints(w0), closed: true, y: TEETH_TOP,
        fill: '#dce9f5', stroke: '#8baac9', strokeWidth: 1,
      })

      const basketGroup = new Konva.Group({ x: w0 - BASKET_W - BASKET_MARGIN, y: TEETH_BOTTOM + 14 })
      const rim = new Konva.Ellipse({
        x: 50, y: 18, radiusX: 43, radiusY: 11,
        fill: '#4f341a', stroke: '#a5742f', strokeWidth: 2,
      })
      const body = new Konva.Path({
        data: BASKET_BODY, fill: '#c8994f', stroke: '#6e4a1c', strokeWidth: 1.2, opacity: 0.96,
      })
      const fishGroup = new Konva.Group()
      const badge = new Konva.Text({
        x: 0, y: BASKET_H - 22, width: BASKET_W, align: 'center',
        text: '0', fontSize: 13, fontStyle: 'bold', fontFamily: fontFamilyRef.current, fill: '#5c4424',
      })
      basketGroup.add(rim, body, fishGroup, badge)

      const balloonGroup = new Konva.Group({ visible: false })
      const balloonCircle = new Konva.Circle({
        radius: BALLOON_R, fill: '#ffffff', stroke: '#cfe4f2', strokeWidth: 2,
        shadowColor: 'black', shadowOpacity: 0.15, shadowBlur: 6,
      })
      balloonGroup.add(balloonCircle)

      layer.add(bg, teeth, basketGroup, balloonGroup)
      layer.draw()

      stageRef.current = stage
      layerRef.current = layer
      bgRef.current = bg
      teethRef.current = teeth
      basketGroupRef.current = basketGroup
      basketBadgeRef.current = badge
      fishGroupRef.current = fishGroup
      balloonGroupRef.current = balloonGroup

      ro = new ResizeObserver(entries => {
        const cw = entries[0]?.contentRect.width
        if (!cw || Math.abs(cw - stageWRef.current) < 1) return
        stageWRef.current = cw
        stage.width(cw)
        bg.width(cw)
        teeth.points(teethPoints(cw))
        basketGroup.x(cw - BASKET_W - BASKET_MARGIN)
        layer.batchDraw()
      })
      ro.observe(el)

      setStageReady(true)
    })

    return () => {
      cancelled = true
      ro?.disconnect()
      stageRef.current?.destroy()
      stageRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // fundalul zonei de joc (albastru spălăcit / roz spălăcit în zona-indiciu)
  useEffect(() => {
    const bg = bgRef.current
    if (!bg) return
    bg.fillLinearGradientColorStops(
      balloon?.zone === 'pink' ? [0, '#fdeef4', 1, '#fbf7f8'] : [0, '#eaf4fb', 1, '#f7fbfd'],
    )
    layerRef.current?.batchDraw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balloon?.zone, stageReady])

  // peștii din coș + cifra scorului — redesenați la fiecare schimbare de scor
  useEffect(() => {
    const Konva = konvaModRef.current
    const fishGroup = fishGroupRef.current
    const badge = basketBadgeRef.current
    const basketGroup = basketGroupRef.current
    if (!Konva || !fishGroup || !badge) return
    fishGroup.destroyChildren()
    const shown = Math.min(Math.max(score, 0), MAX_FISH_SHOWN)
    for (let i = 0; i < shown; i++) {
      const pal = FISH_PALETTE[i % FISH_PALETTE.length]
      const [left, top, rot] = FISH_SLOTS[i % FISH_SLOTS.length]
      fishGroup.add(new Konva.Ellipse({
        x: left, y: top, radiusX: 15, radiusY: 7, rotation: rot,
        fill: pal.back, stroke: pal.fin, strokeWidth: 1,
      }))
    }
    badge.text(String(Math.max(score, 0)))
    layerRef.current?.batchDraw()
    if (scoreFlash && basketGroup) {
      basketGroup.to({
        scaleX: 1.15, scaleY: 1.15, duration: 0.12,
        onFinish: () => basketGroup.to({ scaleX: 1, scaleY: 1, duration: 0.18 }),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, scoreFlash, stageReady])

  // dinții „mușcă" la impact
  useEffect(() => {
    const teeth = teethRef.current
    if (!teeth || !teethChomp) return
    teeth.to({
      scaleY: 0.8, y: TEETH_TOP + 5, duration: 0.12,
      onFinish: () => teeth.to({
        scaleY: 1.05, y: TEETH_TOP - 1, duration: 0.15,
        onFinish: () => teeth.to({ scaleY: 1, y: TEETH_TOP, duration: 0.12 }),
      }),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teethChomp, stageReady])

  // poziția/conținutul/starea vizuală a balonului curent
  useEffect(() => {
    const Konva = konvaModRef.current
    const group = balloonGroupRef.current
    const layer = layerRef.current
    if (!Konva || !group || !layer) return
    if (!balloon) { group.visible(false); layer.batchDraw(); return }

    group.visible(true)
    const w = stageWRef.current
    const xPx = (balloon.x / 100) * w
    const yPx = STAGE_H - BALLOON_SIZE - (Math.min(balloon.progress, 100) / 100) * MAX_RISE_PX
    group.position({ x: xPx + BALLOON_R, y: yPx + BALLOON_R })

    const scale = balloon.state === 'correct' ? 1.25 : 1
    group.scale({ x: scale, y: scale })
    group.opacity(balloon.state === 'miss' ? 0 : 1)

    // (re)construiește conținutul text — nivelul 1: literă; nivelul 2: cuvânt
    // cu doar litera-țintă colorată la răspuns corect
    group.find('.balloon-text').forEach(n => n.destroy())
    const solved = balloon.state === 'correct'
    const hex = balloon.group.lesson.color
    const fam = fontFamilyRef.current
    const fontSize = level === 2 ? 16 : 24

    if (level === 1) {
      const letter = balloon.group.lesson.letter
      const cssFont = `700 ${fontSize}px ${fam}`
      const w0 = measureTextWidth(letter, cssFont)
      group.add(new Konva.Text({
        name: 'balloon-text', text: letter, x: -w0 / 2, y: -fontSize / 2,
        fontSize, fontStyle: 'bold', fontFamily: fam, fill: solved ? hex : '#333',
      }))
    } else {
      const text = balloon.word.text
      const mark = balloon.word.mark
      const idx = text.toLowerCase().indexOf(mark.toLowerCase())
      const cssFont = `700 ${fontSize}px ${fam}`
      if (idx === -1 || !solved) {
        const w0 = measureTextWidth(text, cssFont)
        group.add(new Konva.Text({
          name: 'balloon-text', text, x: -w0 / 2, y: -fontSize / 2,
          fontSize, fontFamily: fam, fill: '#333',
        }))
      } else {
        const pre = text.slice(0, idx)
        const markTxt = text.slice(idx, idx + mark.length)
        const post = text.slice(idx + mark.length)
        const wPre = measureTextWidth(pre, cssFont)
        const wMark = measureTextWidth(markTxt, cssFont)
        const wPost = measureTextWidth(post, cssFont)
        let cx = -(wPre + wMark + wPost) / 2
        const y = -fontSize / 2
        group.add(new Konva.Text({ name: 'balloon-text', text: pre, x: cx, y, fontSize, fontFamily: fam, fill: '#333' }))
        cx += wPre
        group.add(new Konva.Text({ name: 'balloon-text', text: markTxt, x: cx, y, fontSize, fontStyle: 'bold', fontFamily: fam, fill: hex }))
        cx += wMark
        group.add(new Konva.Text({ name: 'balloon-text', text: post, x: cx, y, fontSize, fontFamily: fam, fill: '#333' }))
      }
    }
    if (balloon.group.kind === 'next') {
      group.add(new Konva.Text({ name: 'balloon-text', text: '✨', x: BALLOON_R - 10, y: -BALLOON_R - 6, fontSize: 13 }))
    }

    layer.batchDraw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balloon, level, stageReady])

  // particule (canvas-confetti) la reușită/ratare — o singură dată per balon
  useEffect(() => {
    if (!balloon || balloon.state === 'flying') return
    if (lastBurstId.current === balloon.id) return
    lastBurstId.current = balloon.id

    const rect = containerRef.current?.getBoundingClientRect()
    const w = stageWRef.current
    const xPx = (balloon.x / 100) * w + BALLOON_R
    const yPx = STAGE_H - BALLOON_SIZE - (Math.min(balloon.progress, 100) / 100) * MAX_RISE_PX + BALLOON_R
    const originX = rect ? (rect.left + xPx) / window.innerWidth : 0.5
    const originY = rect ? (rect.top + yPx) / window.innerHeight : 0.3
    const miss = balloon.state === 'miss'
    confetti({
      particleCount: miss ? 14 : 40,
      spread: miss ? 55 : 70,
      startVelocity: miss ? 18 : 32,
      gravity: miss ? 1.4 : 1,
      scalar: miss ? 0.6 : 0.9,
      colors: miss ? ['#c9c9c9', '#ffffff', '#9aa0a6'] : [balloon.group.lesson.color, '#ffffff', '#ffd166'],
      origin: { x: originX, y: originY },
    })
  }, [balloon])

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

      <div style={{ position: 'relative', height: STAGE_H, borderRadius: 14, overflow: 'hidden' }}>
        <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

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
        <span>Balon {Math.min(queuePos + 1, queueLen)}/{queueLen}</span>
      </div>

      <style>{`
        @keyframes bv-score-flash { 0% { transform: scale(1) } 40% { transform: scale(1.35) rotate(-2deg) } 100% { transform: scale(1) } }
        .bv-score-flash { animation: bv-score-flash 400ms ease-out; display: inline-block; }
      `}</style>
    </div>
  )
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
