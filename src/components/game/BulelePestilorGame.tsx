'use client'

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { FoxMotion, type FoxMotionState } from '@/components/game/FoxMotion'
import { useSpringLook } from '@/components/game/useSpringLook'
import { speakWord } from '@/lib/speak'
import WordRenderer from '@/components/WordRenderer'
import type { RenderNode } from '@/lib/renderNode'
import type { Lesson, LessonWord } from '@/lib/levels'
import { tricolorLetterStyle, TRICOLOR_BANDS, TRICOLOR_UNDERLINE_COLOR } from '@/lib/tricolorStyle'
import { symbolView, bodyColorFor, CONSONANT_IDS, WHITE_OUTLINED_TEXT_STYLE } from '@/lib/symbolDisplay'

// ─────────────────────────────────────────────────────────────────────────
// Vulpea la pescuit (fost „Bulele Vulpii — pești”) — componentă NOUĂ, paralelă cu BuleleVulpiiGame.
// Același API ca BuleleVulpiiGame (lesson/distractorLessons/nextLesson/level/
// onFinish/onExit). Nefolosită în /learn. Nu modifică BuleleVulpiiGame.tsx, Mascot*.tsx, levels.ts sau altceva.
// Aceeași logică de joc (coadă 60/35/5, zona roz = indiciu, ajutor ×10,
// +1 / −1 / +2, prag 80%), cu vulpea animată din FoxMotion, dar:
//  • baloanele devin PEȘTI care înoată de la stânga la dreapta; unul care
//    ajunge la capăt fără apăsare corectă SCAPĂ (−1);
//  • vulpea stă pe un ponton și PESCUIEȘTE: la apăsare corectă undița
//    aruncă, peștele se colorează, e tras sus și cade cu capul în jos într-un TAZ;
//  • tazul (în locul acvariului pe celule) arată doar COZILE peștilor prinși,
//    în culoarea sunetului, iar pe taz scrie câți pești s-au prins. Peștele
//    scăpat nu pune coadă. Dinții dispar (nu mai au rol).
// ─────────────────────────────────────────────────────────────────────────

export type BulelePestilorLevel = 1 | 2 | 3
type Level = BulelePestilorLevel

export interface BulelePestilorResult { level: BulelePestilorLevel; rate: number; passed: boolean }

export interface BulelePestilorGameProps {
  lesson: Lesson
  distractorLessons?: Lesson[]
  nextLesson?: Lesson | null
  level?: BulelePestilorLevel
  onFinish?: (result: BulelePestilorResult) => void
  /** Dacă e dat, apare butonul „Ieși” (cu confirmare). */
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
// Vulpea spune simbolul (cu accentul lecției: la coloana o = en-GB → /ɒ/ RP). La nivelul 3 spune apoi și cuvântul.
// `stillOn` oprește lanțul dacă între timp s-a dat pauză.
function sayAnnouncement(lesson: Lesson, word: LessonWord, level: Level, stillOn: () => boolean) {
  const accent = lesson.accent ?? 'en-US'
  const first = speakWord(ttsWordFor(lesson), { accent })
  if (level === 3) {
    first.promise.then(() => { if (stillOn()) speakWord(word.text, { accent: word.accent ?? accent }) })
  }
}

const TOTAL = 5
function buildQueue(current: Group, distractors: Group[], next: Group | null): QueueItem[] {
  const nextCount = next ? 1 : 0
  let currentCount = 3
  let distractorTotal = TOTAL - currentCount - nextCount
  if (distractors.length === 0) { currentCount += distractorTotal; distractorTotal = 0 }
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
  return shuffle(items).slice(0, TOTAL)
}

// ── geometrie ──
const STAGE_H = 380
// Telefon (scena sub 520px lățime): înălțimea rezervată pentru tot ce e în afara scenei
// (padding overlay + titlu + bara de sus + butoanele de răspuns + numărătoarea de final),
// ca totul să încapă pe ecran FĂRĂ scroll. Ajustabil aici.
const PHONE_RESERVED = 230
const PHONE_MIN_STAGE = 250
const SKY_H = 130            // zona de sus: ponton + vulpe + acvariu
const SAND_H = 16
// Ritm (mai lent decât prima variantă: 6000 / 1300 / 250) — ajustabil aici.
const SWIM_MS = 10000   // traversarea completă a apei
const NEXT_FISH_DELAY_MS = 800
const FISH_W = 140      // pești mai mari (înainte 112)
const FROM_RIGHT_P = 0.75   // șansa ca peștele să vină din dreapta (spre vulpe); restul vin din stânga
const START_HOLD_MS = 0      // pauza de la apariție ELIMINATĂ (înainte 3000): peștele înoată imediat
const ANNOUNCE_BUBBLE_MS = 3000   // bula comics a vulpii rămâne vizibilă atât (nu mai ține peștele pe loc)
const HINT_AT = 80           // la 80% parcurs (mai are 20%) vulpea repetă anunțul, peștele stă iar 3 s
const HINT_HOLD_MS = 3000
const PULL_MS = 1900
const HOLD_MS = 2500    // peștele prins stă nemișcat (atârnat de undiță) cât se repetă sunetul
const LINE_EXTRA = 34   // cât mai jos (px) atârnă peștele sub vârful undiței când e tras sus: mai natural
const SWAY_PX = 5       // legănare foarte ușoară în pauză: deplasare laterală maximă (px)
const SWAY_ROT = 0.07   // ... și înclinare maximă (rad, ~4°)
const SWAY_CYCLES = 2   // câte balansări complete în pauză
const DROP_SPEED = 2    // zborul spre taz: viteză dublă față de înainte
// Ordinea: aruncare (cârligul ajunge în buza peștelui) → PAUZĂ cu legănare, cu peștele încă în apă, prins de buză
//          → tras în sus → zbor în taz. Durata totală e aceeași ca înainte.
const CAST_MS = PULL_MS * 0.3
const LIFT_MS = PULL_MS * 0.3
const PULL_B_MS = (PULL_MS * 0.4) / DROP_SPEED
const PULL_TOTAL_MS = CAST_MS + HOLD_MS + LIFT_MS + PULL_B_MS
const FOX_LEFT = 78   // vulpea e mutată spre dreapta ca tazul să stea lângă ea, pe ponton (înainte 14)
const FOX_SIZE = 84
const TIP = { x: FOX_LEFT + 138, y: SKY_H - 84 }      // vârful undiței (în repaus)
const ROD_BASE = { x: FOX_LEFT + 70, y: SKY_H - 44 }  // de unde pornește undița
const FLOAT = { x: FOX_LEFT + 146, y: SKY_H + 3 }     // pluta, la suprafața apei
const MOUTH = 0.42 * FISH_W                            // distanța centru → gură
const HANG = -35 * Math.PI / 180                       // înclinarea peștelui când e tras în sus
const NEUTRAL = '#f4f1ea'
// Fundalul butonului de răspuns pentru coloana /əʊ/ — aceleași 3 benzi ca peștele (TRICOLOR_BANDS)
const TRICOLOR_BUTTON_BG = `linear-gradient(90deg, ${TRICOLOR_BANDS[0]} 0 33.33%, ${TRICOLOR_BANDS[1]} 33.33% 66.66%, ${TRICOLOR_BANDS[2]} 66.66% 100%)`
// Tazul cu pești (sus-dreapta): w/h = dimensiunea desenului; rim = y-ul buzei tazului
// tazul e desenat în coordonate 104x96 (BUCKET_VB) și afișat la 60% lățime / 70% înălțime (BUCKET)
const BUCKET_VB = { w: 104, h: 112, rim: 30 }   // h=112 → la scara 0.6 iese 70% din înălțimea inițială (96)
const BUCKET_SCALE = 0.6
const BUCKET = { w: BUCKET_VB.w * BUCKET_SCALE, h: BUCKET_VB.h * BUCKET_SCALE, rim: BUCKET_VB.rim * BUCKET_SCALE, top: SKY_H - 10 - BUCKET_VB.h * BUCKET_SCALE, left: 8 }   // tazul stă pe ponton, în stânga vulpii

type Zone = 'blue' | 'pink'
type FState = 'swimming' | 'hooked' | 'miss'
interface LiveFish {
  id: number; qi: number; group: Group; word: LessonWord
  y: number; phase: number; progress: number; zone: Zone; state: FState
  dir: 1 | -1   // 1 = înoată stânga→dreapta, -1 = dreapta→stânga
}
interface Cell { filled: boolean; lesson: Lesson | null; bonus: boolean }

let fishSeq = 0

function fishX(progress: number, W: number, dir: 1 | -1 = 1) {
  return (dir === 1 ? -0.08 + 1.16 * (progress / 100) : 1.08 - 1.16 * (progress / 100)) * W
}
function fishY(f: LiveFish, p: number) { return f.y + Math.sin((p / 100) * Math.PI * 4 + f.phase) * 8 }
// Poziția peștelui care înoată = un singur transform (GPU), scris direct pe element la fiecare frame.
function swimTransform(f: LiveFish, p: number, W: number) {
  const dy = Math.cos((p / 100) * Math.PI * 4 + f.phase) * 8 * Math.PI * 4 / 100
  const dx = 1.16 * W / 100
  const tilt = f.state === 'swimming' ? ((f.dir ?? 1) * Math.atan2(dy, dx) * 180) / Math.PI : 0
  return `translate3d(${fishX(p, W, f.dir ?? 1).toFixed(1)}px, ${fishY(f, p).toFixed(1)}px, 0) translate(-50%,-50%) rotate(${tilt.toFixed(2)}deg)`
}
// Lanseta: `bend` 0 = repaus, 1 = încordată de pește.
function rodGeom(bend: number) {
  const tip = { x: TIP.x, y: TIP.y + 6 * bend }
  const mid = { x: (ROD_BASE.x + tip.x) / 2, y: (ROD_BASE.y + tip.y) / 2 }
  const c = { x: mid.x + lerp(-5, 2, bend), y: mid.y + lerp(-9, 9, bend) }
  return { tip, d: `M${ROD_BASE.x} ${ROD_BASE.y} Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${tip.x} ${tip.y.toFixed(1)}` }
}
// Nodurile motorului (/api/words) — cache de modul, ca să nu recerem la fiecare nivel/pagină.
const nodesCache = new Map<string, RenderNode[]>()
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// ── etichetă pe pește: aceleași reguli de culoare ca /learn (MarkedWord) ──
// Cât peștele înoată e neutru (negru pe alb); la prindere, grupul-țintă ia culoarea
// din motor: vocale/w/y colorate, /əʊ/ = tricolor pe FIECARE literă (cf. /learn),
// /ɔɪ/ = ultima literă cu diacritic roșu. Consoanele rămân negre.
const OFFGLIDE: Record<string, string> = { y: 'ỷ', Y: 'Ỷ', i: 'ỉ', I: 'Ỉ' }
const isVowelLike = (ch: string) => /[aeiouwy]/i.test(ch)

function symbolNode(lesson: Lesson, word?: LessonWord): { node: ReactNode; len: number } {
  const sv = symbolView(lesson)
  // gh/ph: butonul e „f”, dar peștele poartă „ph”/„gh” (după cuvântul lui)
  const txt = lesson.id === 'gh-ph-f' && word ? word.mark : sv.text
  const style: CSSProperties = sv.tricolor ? tricolorLetterStyle(6)
    : sv.whiteOutlined ? WHITE_OUTLINED_TEXT_STYLE
    : { color: sv.color }
  return { node: <span style={style}>{txt}</span>, len: txt.replace(/\u200D/g, '').length }
}

function buildLabel(lesson: Lesson, level: Level, word: LessonWord, solved: boolean): { node: ReactNode; len: number } {
  const flat = lesson.id === 'o'   // coloana o: roz complet, fără negru
  // Nivelul 3: peștele poartă cuvântul, complet prelucrat — mai puțin litera/literele antrenate,
  // care rămân neutre și se umflă/se dezumflă încet până se apasă butonul potrivit.
  if (level === 3) {
    const text = word.text
    const nodes = nodesCache.get(text.toLowerCase())
    const idx = text.toLowerCase().indexOf(word.mark.toLowerCase())
    const range: [number, number] | undefined = !solved && idx !== -1 ? [idx, idx + word.mark.length] : undefined
    if (nodes) return { node: <WordRenderer nodes={nodes} wordStr={text} flatSimple={flat} pulseRange={range} />, len: text.length }
    if (idx === -1) return { node: <span style={{ color: '#333' }}>{text}</span>, len: text.length }
    const markEnd = idx + word.mark.length
    const tri = lesson.id === 'ou'
    return {
      len: text.length,
      node: (
        <span style={{ color: '#333' }}>
          {text.slice(0, idx)}
          {[...text.slice(idx, markEnd)].map((ch, k, arr) => {
            if (!solved) return <span key={k} className="eic-pulse">{ch}</span>
            if (tri && isVowelLike(ch)) return <span key={k} style={{ ...tricolorLetterStyle(), textDecorationColor: TRICOLOR_UNDERLINE_COLOR }}>{ch}</span>
            if (lesson.id === 'oi' && k === arr.length - 1) return <span key={k} style={{ color: '#CC0000' }}>{OFFGLIDE[ch] ?? ch}</span>
            return <span key={k} style={isVowelLike(ch) ? { color: lesson.color } : undefined}>{ch}</span>
          })}
          {text.slice(markEnd)}
        </span>
      ),
    }
  }
  // Nivelul 1: peștele e colorat (corpul), iar la consoane poartă și simbolul din prima clipă.
  // Nivelul 2: peștele vine gol; la apăsarea corectă primește simbolul și culoarea.
  if (solved || (level === 1 && CONSONANT_IDS.has(lesson.id))) return symbolNode(lesson, word)
  return { node: null, len: Math.max(symbolView(lesson).text.replace(/\u200D/g, '').length, 1) }
}

// ── peștele (SVG), cu CAPUL spre dreapta (sensul de înot) ──
function FishSvg({ body, tricolor = false, label, len, width, wag = true }: {
  body: string; tricolor?: boolean; label: ReactNode; len: number; width: number; wag?: boolean
}) {
  const gid = useId().replace(/:/g, '')
  const height = width / 2
  const fill = tricolor ? `url(#${gid})` : body
  const fs = Math.min(26, 50 / (0.65 * Math.max(len, 1))) // în unități viewBox (100 lățime)
  return (
    <div style={{ position: 'relative', width, height }}>
      <svg width={width} height={height} viewBox="0 0 100 50" style={{ overflow: 'visible', display: 'block', transform: 'scaleX(var(--flip, 1))' }} aria-hidden="true">
        {tricolor && (
          <defs>
            <linearGradient id={gid} x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor={TRICOLOR_BANDS[0]} /><stop offset="33%" stopColor={TRICOLOR_BANDS[0]} />
              <stop offset="33%" stopColor={TRICOLOR_BANDS[1]} /><stop offset="66%" stopColor={TRICOLOR_BANDS[1]} />
              <stop offset="66%" stopColor={TRICOLOR_BANDS[2]} /><stop offset="100%" stopColor={TRICOLOR_BANDS[2]} />
            </linearGradient>
          </defs>
        )}
        <g transform="translate(100,0) scale(-1,1)">
          <path className={wag ? 'pf-tail' : undefined} d="M80 25 L99 7 Q92 25 99 43 Z" fill={fill} stroke="#1a1006" strokeWidth="2" strokeLinejoin="round" />
          <path d="M34 9 Q50 -3 67 10 Z" fill={fill} stroke="#1a1006" strokeWidth="2" strokeLinejoin="round" />
          <path d="M6 25 C12 8 40 4 62 8 C74 11 80 20 82 25 C80 30 74 39 62 42 C40 46 12 42 6 25 Z" fill={fill} stroke="#1a1006" strokeWidth="2.2" />
          <path d="M52 44 Q58 50 66 44 Z" fill={fill} stroke="#1a1006" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="16" cy="21" r="4.4" fill="#f7f2de" stroke="#1a1006" strokeWidth="1.3" />
          <circle cx="15.2" cy="21" r="2.2" fill="#111" />
        </g>
        <rect x="22" y="10" width="52" height="30" rx="15" fill="rgba(255,255,255,.95)" stroke="rgba(0,0,0,.2)" strokeWidth="1" />
      </svg>
      <div style={{
        position: 'absolute', left: 'calc(22% + (1 - var(--flip, 1)) * 2%)', top: '20%', width: '52%', height: '60%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, lineHeight: 1, whiteSpace: 'nowrap', fontSize: (width * fs) / 100,
      }}>
        {label}
      </div>
    </div>
  )
}

// Bâzâit neplăcut (două unde dezacordate) pentru răspuns greșit — doar aici, fără a atinge lib/sound.ts.
function playBuzzer() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    const ctx = new AC()
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.18, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    g.connect(ctx.destination)
    for (const f of [110, 117]) {
      const o = ctx.createOscillator()
      o.type = 'sawtooth'; o.frequency.value = f
      o.connect(g); o.start(); o.stop(ctx.currentTime + 0.4)
    }
    window.setTimeout(() => ctx.close(), 600)
  } catch { /* fără sunet dacă audio e blocat */ }
}

export function BulelePestilorGame({
  lesson, distractorLessons = [], nextLesson = null, level = 1, onFinish, onExit,
}: BulelePestilorGameProps) {
  const currentGroup: Group = { kind: 'current', lesson }
  const distractorGroups: Group[] = distractorLessons.map(l => ({ kind: 'distractor', lesson: l }))
  const nextGroup: Group | null = nextLesson ? { kind: 'next', lesson: nextLesson } : null

  const [queueLen, setQueueLen] = useState(0)
  const [fish, setFish] = useState<LiveFish | null>(null)
  const [pull, setPull] = useState(false)
  const [, setNodesVer] = useState(0)
  const [cells, setCells] = useState<Cell[]>([])
  // Telefon (scena sub 520px lățime): scenă calculată din înălțimea ecranului, scorul urcă în bara de sus
  // (nu mai există rând separat jos), ca totul să încapă fără scroll (și în overlay-ul din /learn).
  const [stageH, setStageH] = useState(STAGE_H)
  const [compact, setCompact] = useState(false)
  const caughtCount = cells.filter(c => c.filled).length
  const bucketId = useId().replace(/:/g, '')
  const [score, setScore] = useState(0)
  const [hearts, setHearts] = useState(10)
  const [fourthVisible, setFourthVisible] = useState(false)
  const [hintGroup, setHintGroup] = useState<Group | null>(null)
  const [scoreFlash, setScoreFlash] = useState(false)
  const [helpMessage, setHelpMessage] = useState<string | null>(null)
  const [cheer, setCheer] = useState(false)
  const [done, setDone] = useState<null | { rate: number; passed: boolean }>(null)
  const [paused, setPaused] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)
  const [announce, setAnnounce] = useState<Lesson | null>(null)   // bula comics de lângă capul vulpii
  const [announceWord, setAnnounceWord] = useState<string | null>(null)   // nivelul 3: și cuvântul, în bulă
  const [buzzId, setBuzzId] = useState<string | null>(null)       // butonul care „protestează” (răspuns greșit)

  const stageRef = useRef<HTMLDivElement>(null)
  const bucketRef = useRef<HTMLDivElement | null>(null)
  const stageHRef = useRef(STAGE_H)
  const queueRef = useRef<QueueItem[]>([])
  const queuePosRef = useRef(0)
  const scoreRef = useRef(0)
  const correctRef = useRef(0)
  const heartsRef = useRef(10)
  const hintFiredFor = useRef<Set<number>>(new Set())
  const missHandledFor = useRef<Set<number>>(new Set())
  const pausedRef = useRef(false)
  const pullingRef = useRef(false)
  const pendingSpawnRef = useRef<null | (() => void)>(null)
  const timers = useRef<number[]>([])
  const rafRef = useRef<number | null>(null)
  const progressRef = useRef(0)
  const holdUntilRef = useRef(0)
  const swimElRef = useRef<HTMLDivElement | null>(null)
  const pullFishRef = useRef<HTMLDivElement | null>(null)
  const rodARef = useRef<SVGPathElement | null>(null)
  const rodBRef = useRef<SVGPathElement | null>(null)
  const lineRef = useRef<SVGPathElement | null>(null)
  const hookRef = useRef<SVGPathElement | null>(null)
  const foxLookRef = useRef<HTMLDivElement | null>(null)
  useSpringLook(foxLookRef, () => {
    const fishEl = pullFishRef.current ?? swimElRef.current
    if (fishEl) {
      const r = fishEl.getBoundingClientRect()
      if (r.width > 0) return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    }
    const stage = stageRef.current
    if (!stage) return null
    const sr = stage.getBoundingClientRect()
    return { x: sr.left + FLOAT.x, y: sr.top + FLOAT.y }
  }, { maxRot: 8, maxShift: 4 })

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms))
  }
  function flashScore() { setScoreFlash(true); later(() => setScoreFlash(false), 400) }

  function spawnAt(pos: number, q: QueueItem[]) {
    const item = q[pos]
    progressRef.current = 0
    setFourthVisible(item.group.kind === 'next')
    const w = pickWord(item.group.lesson)
    setFish({
      id: fishSeq++, qi: pos, group: item.group, word: w,
      y: SKY_H + 46 + Math.random() * (stageHRef.current - SKY_H - SAND_H - 92),
      phase: Math.random() * Math.PI * 2, progress: 0, zone: 'blue', state: 'swimming',
      dir: Math.random() < FROM_RIGHT_P ? -1 : 1,
    })
    sayAnnouncement(item.group.lesson, w, level, () => !pausedRef.current)
    holdUntilRef.current = performance.now() + START_HOLD_MS
    setAnnounceWord(level === 3 ? w.text : null)
    setAnnounce(item.group.lesson)
    later(() => setAnnounce(null), ANNOUNCE_BUBBLE_MS)
  }

  function advanceQueue() {
    const nextPos = queuePosRef.current + 1
    queuePosRef.current = nextPos
    if (nextPos >= queueRef.current.length) {
      const rate = correctRef.current / queueRef.current.length
      setFish(null)
      setDone({ rate, passed: rate >= 0.8 })
      onFinish?.({ level, rate, passed: rate >= 0.8 })
      return
    }
    later(() => {
      const go = () => spawnAt(nextPos, queueRef.current)
      if (pausedRef.current) pendingSpawnRef.current = go
      else go()
    }, NEXT_FISH_DELAY_MS)
  }

  function start() {
    timers.current.forEach(t => window.clearTimeout(t))
    timers.current = []
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const q = buildQueue(currentGroup, distractorGroups, nextGroup)
    queueRef.current = q
    queuePosRef.current = 0
    scoreRef.current = 0
    correctRef.current = 0
    heartsRef.current = 10
    hintFiredFor.current.clear()
    missHandledFor.current.clear()
    pausedRef.current = false
    pullingRef.current = false
    pendingSpawnRef.current = null
    setPaused(false)
    setPull(false)
    setQueueLen(q.length)
    setCells(q.map(() => ({ filled: false, lesson: null, bonus: false })))
    setScore(0)
    setHearts(10)
    setDone(null)
    spawnAt(0, q)
  }

  // ── Culorile reale din motor: nodurile cuvintelor (ca /learn), accent per cuvânt ──
  useEffect(() => {
    const all = [lesson, ...distractorLessons, ...(nextLesson ? [nextLesson] : [])]
    const accents: Record<string, 'uk' | 'us'> = {}
    for (const l of all) for (const w of l.words) {
      accents[w.text.toLowerCase()] = (w.accent ?? l.accent ?? 'en-US') === 'en-GB' ? 'uk' : 'us'
    }
    const missing = Object.keys(accents).filter(w => !nodesCache.has(w))
    if (missing.length === 0) return
    let cancelled = false
    fetch('/api/words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words: missing, accents }),
    })
      .then(r => r.json())
      .then((data: { results?: Record<string, RenderNode[]> }) => {
        if (cancelled || !data.results) return
        for (const [w, n] of Object.entries(data.results)) nodesCache.set(w, n)
        setNodesVer(v => v + 1)
      })
      .catch(() => { /* rămâne fallback-ul cu reguli /learn */ })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id, nextLesson?.id])

  useEffect(() => {
    const upd = () => {
      const w = stageRef.current?.clientWidth ?? 680
      const small = w < 520
      const h = small ? Math.max(PHONE_MIN_STAGE, Math.min(STAGE_H, window.innerHeight - PHONE_RESERVED)) : STAGE_H
      stageHRef.current = h
      setStageH(h)
      setCompact(small)
    }
    upd()
    window.addEventListener('resize', upd)
    return () => window.removeEventListener('resize', upd)
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { start() }, [lesson.id, level])
  useEffect(() => () => {
    timers.current.forEach(t => window.clearTimeout(t))
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
  }, [])

  // ── înotul peștelui curent: rAF cu timp real, poziția scrisă direct pe DOM (fără re-render pe frame) ──
  useEffect(() => {
    if (!fish || fish.state !== 'swimming' || paused) return
    const fishId = fish.id
    let raf = 0
    let last = performance.now()
    let pinkSent = fish.zone === 'pink'
    const apply = () => {
      const el = swimElRef.current
      const W = stageRef.current?.clientWidth ?? 680
      if (el) el.style.transform = swimTransform(fish, progressRef.current, W)
    }
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100)   // un tab adormit nu „teleportează” peștele
      last = now
      if (now < holdUntilRef.current) { raf = requestAnimationFrame(tick); return }   // peștele stă pe loc (anunț)
      progressRef.current = Math.min(100, progressRef.current + (100 * dt) / SWIM_MS)
      apply()
      const p = progressRef.current
      if (p >= 100) {
        setFish(prev => (prev && prev.id === fishId ? { ...prev, zone: 'pink', state: 'miss' } : prev))
        return
      }
      if (p >= HINT_AT && !pinkSent) {
        pinkSent = true
        setFish(prev => (prev && prev.id === fishId ? { ...prev, zone: 'pink' } : prev))
      }
      raf = requestAnimationFrame(tick)
    }
    apply()
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fish?.id, paused, fish?.state])

  // ── indiciu (zona roz) și scăpare ──
  useEffect(() => {
    if (!fish) return
    if (fish.zone === 'pink' && !hintFiredFor.current.has(fish.id)) {
      hintFiredFor.current.add(fish.id)
      sayAnnouncement(fish.group.lesson, fish.word, level, () => !pausedRef.current)
      holdUntilRef.current = performance.now() + HINT_HOLD_MS
      setHintGroup(fish.group)
      setAnnounceWord(level === 3 ? fish.word.text : null)
      setAnnounce(fish.group.lesson)
      later(() => { setHintGroup(null); setAnnounce(null) }, HINT_HOLD_MS)
    }
    if (fish.state === 'miss' && !missHandledFor.current.has(fish.id)) {
      missHandledFor.current.add(fish.id)
      scoreRef.current -= 1
      setScore(scoreRef.current)
      flashScore()
      setFourthVisible(false)
      later(() => { setFish(null); advanceQueue() }, 650)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fish])

  // ── tragerea peștelui: undița aruncă, peștele e ridicat, cade cu capul în taz ──
  function startPull(f: LiveFish) {
    const stage = stageRef.current
    const bucketEl = bucketRef.current
    if (!stage || !bucketEl) { finishPull(f); return }
    const W = stage.clientWidth
    const p0 = progressRef.current
    const dir: 1 | -1 = f.dir ?? 1   // ?? 1: protecție pentru peștii creați înainte de un hot-reload
    const start = { x: fishX(p0, W, dir), y: fishY(f, p0) }
    const sr = stage.getBoundingClientRect()
    const cr = bucketEl.getBoundingClientRect()
    const cx0 = cr.left - sr.left + cr.width / 2
    const rimY = cr.top - sr.top + BUCKET.rim
    const above  = { x: cx0, y: rimY - 8 }   // deasupra buzei tazului, cu capul în jos
    const inside = { x: cx0, y: rimY + 16 }   // înăuntru (acoperit de peretele tazului)
    const DROP = (Math.PI / 2) * dir          // cap în jos (peștele păstrează sensul: fără întoarcere în oglindă)
    // peștele e tras de GURĂ: stă înclinat cu botul în sus, atârnat sub vârful undiței
    const up = { x: TIP.x - Math.cos(HANG) * MOUTH * dir, y: TIP.y + 20 - Math.sin(HANG) * MOUTH }
    const upL = { x: up.x, y: up.y + LINE_EXTRA }   // poziția peștelui cu firul lungit (pauza + începutul zborului)
    const endScale = 0.3
    const t0 = performance.now()
    let heldSpoken = false
    pullingRef.current = true
    setPull(true)
    // s = sensul peștelui (1 = cu botul spre dreapta, -1 = spre stânga); rămâne același pe tot parcursul prinderii
    const mouthOf = (x: number, y: number, rot: number, s = 1) => ({ x: x + Math.cos(rot) * MOUTH * s, y: y + Math.sin(rot) * MOUTH * s })
    const step = (now: number) => {
      // timeline: [0..CAST] aruncare · [..+HOLD] prins de buză, nemișcat în apă, se leagănă ·
      //           [..+LIFT] tras în sus · [..TOTAL] zbor în taz (x2)
      const el = now - t0
      const liftAt = CAST_MS + HOLD_MS
      const flyAt = liftAt + LIFT_MS
      if (!heldSpoken && el >= CAST_MS) {
        heldSpoken = true
        sayAnnouncement(f.group.lesson, f.word, level, () => !pausedRef.current)   // se aude încă o dată sunetul (și cuvântul la nivelul 3), exact când cârligul prinde buza
      }
      // legănare ca un pendul: pornește din 0 și revine la 0 la sfârșitul pauzei (fără salt)
      const hp = Math.min(Math.max((el - CAST_MS) / HOLD_MS, 0), 1)
      const sway = Math.sin(Math.PI * hp) * Math.sin(2 * Math.PI * SWAY_CYCLES * hp)
      let fx = start.x, fy = start.y, rot = 0, scale = 1, line = true, taut = false, bend = 0, flip: number = dir
      let m = mouthOf(fx, fy, 0, flip), lx = TIP.x, ly = TIP.y
      if (el < CAST_MS) {                   // aruncare: firul (moale) ajunge la gura peștelui
        const e = ease(el / CAST_MS)
        lx = lerp(TIP.x, m.x, e); ly = lerp(TIP.y, m.y, e); bend = 0.3 * e
      } else if (el < liftAt) {             // cârligul e în buză: peștele stă în apă și se leagănă, firul întins
        fx = start.x + sway * SWAY_PX; rot = sway * SWAY_ROT
        m = mouthOf(fx, fy, rot, dir); lx = m.x; ly = m.y; taut = true; bend = 0.3 + 0.08 * sway
      } else if (el < flyAt) {              // tragere: peștele se ridică și se înclină, atârnat de undiță
        const e = ease((el - liftAt) / LIFT_MS)
        fx = lerp(start.x, upL.x, e); fy = lerp(start.y, upL.y, e); rot = lerp(0, HANG * dir, e)
        m = mouthOf(fx, fy, rot, dir); lx = m.x; ly = m.y; taut = true; bend = lerp(0.3, 1, e)
      } else {                              // zboară deasupra tazului și cade în el; firul se vede, apoi se strânge înapoi la lansetă
        const k = Math.min((el - flyAt) / PULL_B_MS, 1)
        bend = 1 - ease(k)
        if (k < 0.65) {                     // arc spre buza tazului, întorcându-se cu capul în jos
          const e = ease(k / 0.65)
          const cx = (upL.x + above.x) / 2, cy = Math.min(upL.y, above.y) - 30
          const a = 1 - e
          fx = a * a * upL.x + 2 * a * e * cx + e * e * above.x
          fy = a * a * upL.y + 2 * a * e * cy + e * e * above.y
          rot = lerp(HANG * dir, DROP, e)
          scale = lerp(1, endScale, e)
          m = mouthOf(fx, fy, rot, dir); lx = m.x; ly = m.y; taut = true   // firul rămâne întins între lansetă și gura peștelui
        } else {                            // cade în taz; de aici peretele tazului îl acoperă (se văd doar cozile)
          const e = ease((k - 0.65) / 0.35)
          fx = above.x; fy = lerp(above.y, inside.y, e)
          rot = DROP; scale = endScale
          if (pullFishRef.current) pullFishRef.current.style.zIndex = '1'
          // cârligul se eliberează: capătul firului revine rapid la vârful lansetei, peștele cade în taz
          const m0 = mouthOf(above.x, above.y, DROP, dir)
          const r = ease(Math.min((k - 0.65) / 0.2, 1))
          const tipNow = rodGeom(bend).tip
          lx = lerp(m0.x, tipNow.x, r); ly = lerp(m0.y, tipNow.y, r); taut = false
          if (r >= 1) line = false
        }
      }
      // totul direct pe DOM, fără setState pe frame
      const pf = pullFishRef.current
      if (pf) { pf.style.transform = `translate3d(${fx.toFixed(1)}px, ${fy.toFixed(1)}px, 0) translate(-50%,-50%) rotate(${rot.toFixed(3)}rad) scale(${scale.toFixed(3)})`; pf.style.setProperty('--flip', flip.toFixed(3)) }
      const rg = rodGeom(bend)
      rodARef.current?.setAttribute('d', rg.d)
      rodBRef.current?.setAttribute('d', rg.d)
      const ln = lineRef.current, hk = hookRef.current
      if (ln && hk) {
        ln.style.display = hk.style.display = line ? '' : 'none'
        if (line) {
          ln.setAttribute('d', taut
            ? `M${rg.tip.x} ${rg.tip.y.toFixed(1)} L${lx.toFixed(1)} ${ly.toFixed(1)}`
            : `M${rg.tip.x} ${rg.tip.y.toFixed(1)} Q${((rg.tip.x + lx) / 2).toFixed(1)} ${((rg.tip.y + ly) / 2 + 18).toFixed(1)} ${lx.toFixed(1)} ${ly.toFixed(1)}`)
          hk.setAttribute('d', `M${lx.toFixed(1)} ${ly.toFixed(1)} v5 q0 6 -6 5`)
        }
      }
      if (el < PULL_TOTAL_MS) rafRef.current = requestAnimationFrame(step)
      else finishPull(f)
    }
    rafRef.current = requestAnimationFrame(step)
  }

  function finishPull(f: LiveFish) {
    pullingRef.current = false
    setPull(false)
    setFish(null)
    setCells(prev => prev.map((c, i) => i === f.qi
      ? { filled: true, lesson: f.group.lesson, bonus: f.group.kind === 'next' }
      : c))
    setCheer(true)
    later(() => setCheer(false), 650)
    advanceQueue()
  }

  function handlePress(group: Group) {
    if (!fish || fish.state !== 'swimming' || pausedRef.current) return
    if (group.lesson.id !== fish.group.lesson.id) {
      scoreRef.current -= 1
      setScore(scoreRef.current)
      flashScore()
      playBuzzer()                       // peștele rămâne pe loc; butonul protestează
      navigator.vibrate?.(180)
      setBuzzId(group.lesson.id)
      later(() => setBuzzId(null), 450)
      return
    }
    scoreRef.current += fish.group.kind === 'next' ? 2 : 1
    setScore(scoreRef.current)
    correctRef.current += 1
    setFish({ ...fish, state: 'hooked' })
    setFourthVisible(false)
    flashScore()
    startPull(fish)
  }

  function useHelp() {
    if (!fish || fish.state !== 'swimming' || pausedRef.current || heartsRef.current <= 0) return
    heartsRef.current -= 1
    setHearts(heartsRef.current)
    sayAnnouncement(fish.group.lesson, fish.word, level, () => !pausedRef.current)
    setHelpMessage(fish.group.lesson.letter)
    later(() => setHelpMessage(null), 1400)
  }

  function togglePause() {
    if (pullingRef.current || done) return
    if (!pausedRef.current) {
      pausedRef.current = true
      setPaused(true)
      window.speechSynthesis?.cancel()
    } else {
      pausedRef.current = false
      setPaused(false)
      const p = pendingSpawnRef.current
      pendingSpawnRef.current = null
      if (p) p()
    }
  }

  const pb: React.CSSProperties = compact ? { ...pillBtn, padding: '10px 16px', fontSize: 14 } : pillBtn
  const pbBar: React.CSSProperties = compact ? { ...pillBtn, padding: '8px 12px', fontSize: 13 } : pillBtn
  const ansSize = compact ? 64 : 52
  const visibleGroups = fourthVisible && nextGroup
    ? [currentGroup, ...distractorGroups, nextGroup]
    : [currentGroup, ...distractorGroups]

  const pink = fish?.zone === 'pink' && fish.state === 'swimming'
  const waterBg = pink
    ? 'linear-gradient(#fdeef4, #f8d9e5 55%, #f2c3d6)'
    : 'linear-gradient(#eaf4fb, #cfe6f3 55%, #b4d8ec)'
  const waterTop = pink ? '#fdeef4' : '#eaf4fb'   // culoarea de sus a apei (pentru creasta valurilor)

  const mascotState: FoxMotionState = done
    ? (done.passed ? 'cheering' : 'idle')
    : paused ? 'sleeping'
      : pull ? 'pointing'
        : cheer ? 'clapping'
          : helpMessage || pink ? 'pointing' : 'idle'

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 6 : 10, marginBottom: compact ? 6 : 10, flexWrap: compact ? 'nowrap' : 'wrap' }}>
        <span style={{ fontSize: 13, color: '#a03060', whiteSpace: 'nowrap' }}>💗 {hearts}</span>
        <button onClick={useHelp} disabled={hearts <= 0 || paused} style={{ ...pbBar, whiteSpace: 'nowrap' }}>Ajută-mă</button>
        {helpMessage && !compact && (
          <span style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: '2px 8px', fontSize: 13, fontWeight: 700 }}>
            {helpMessage}
          </span>
        )}
        {compact && (
          <span style={{ ...festiveScore, fontSize: 17, whiteSpace: 'nowrap' }} className={scoreFlash ? 'pf-score-flash' : undefined}>
            🎉 {score}
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', whiteSpace: 'nowrap' }}>
          <button onClick={togglePause} disabled={!!done} aria-label={paused ? 'Continuă' : 'Pauză'} style={pbBar}>{compact ? (paused ? '▶' : '⏸') : (paused ? '▶ Continuă' : '⏸ Pauză')}</button>
          {onExit && <button onClick={() => { if (!pausedRef.current) togglePause(); setConfirmExit(true) }} aria-label="Ieși din joc" style={{ ...pbBar, marginLeft: 6 }}>✕</button>}
        </div>
      </div>

      <div ref={stageRef} style={{ position: 'relative', height: stageH, borderRadius: 14, overflow: 'hidden', background: '#f4f9fc' }}>
        {/* indiciul „Ajută-mă” pe telefon: peste scenă, ca să nu lărgească bara de sus */}
        {helpMessage && compact && (
          <div style={{ position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)', zIndex: 5, background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: '2px 10px', fontSize: 15, fontWeight: 700 }}>
            {helpMessage}
          </div>
        )}
        {/* apa */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: SKY_H, bottom: 0, background: waterBg, transition: 'background 400ms' }} />
        {/* adâncime: apa se întunecă ușor spre fund */}
        <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: SKY_H, bottom: 0, pointerEvents: 'none', background: 'linear-gradient(transparent 45%, rgba(40,110,150,.16))' }} />
        {/* particule în suspensie (plancton) care plutesc lent */}
        <div className="pf-motes" aria-hidden="true" style={{ top: SKY_H + 8, bottom: SAND_H }}>
          {[[8,22,3,0],[19,64,2,-3],[31,38,2,-6],[44,78,3,-2],[57,18,2,-8],[66,52,3,-5],[78,30,2,-1],[88,70,2,-7],[95,44,3,-4]].map(([l,tp,s,d], i) => (
            <span key={i} style={{ left: `${l}%`, top: `${tp}%`, width: s, height: s, animationDelay: `${d}s` }} />
          ))}
        </div>
        {/* raze de lumină care se mișcă lent prin apă */}
        <div className="pf-rays" aria-hidden="true" style={{ top: SKY_H, bottom: SAND_H }} />
        {/* suprafața: valuri care se deplasează lent în direcții opuse */}
        <svg aria-hidden="true" width="100%" height="10" style={{ position: 'absolute', left: 0, top: SKY_H - 6, pointerEvents: 'none' }}>
          <defs>
            <pattern id="pf-wave-back" patternUnits="userSpaceOnUse" width="110" height="10">
              <path d="M0 6 Q27 2 55 6 T110 6 V10 H0 Z" fill={waterTop} fillOpacity=".75" style={{ transition: 'fill 400ms' }} />
              <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="-110 0" dur="9s" repeatCount="indefinite" />
            </pattern>
            <pattern id="pf-wave-front" patternUnits="userSpaceOnUse" width="80" height="10">
              <path d="M0 6 Q20 1 40 6 T80 6 V10 H0 Z" fill={waterTop} style={{ transition: 'fill 400ms' }} />
              <path d="M0 6 Q20 1 40 6 T80 6" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="1.5" />
              <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="80 0" dur="6s" repeatCount="indefinite" />
            </pattern>
          </defs>
          <rect width="100%" height="10" fill="url(#pf-wave-back)" />
          <rect width="100%" height="10" fill="url(#pf-wave-front)" />
        </svg>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: SAND_H, background: 'linear-gradient(#e8cf8f,#d4b56b)' }} />
        {/* reflexii de lumină (caustice) pe fund */}
        <div className="pf-caustic" aria-hidden="true" style={{ bottom: SAND_H - 6 }} />
        {/* nisip cu margine ondulată și granulație */}
        <svg aria-hidden="true" width="100%" height={SAND_H + 8} style={{ position: 'absolute', left: 0, bottom: 0, pointerEvents: 'none' }}>
          <defs>
            <linearGradient id="pf-sand-g" gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2={SAND_H + 8}>
              <stop offset="0" stopColor="#ecd698" /><stop offset="1" stopColor="#d2b366" />
            </linearGradient>
            <pattern id="pf-sand" patternUnits="userSpaceOnUse" width="140" height={SAND_H + 8}>
              <path d={`M0 6 Q35 1 70 6 T140 6 V${SAND_H + 8} H0 Z`} fill="url(#pf-sand-g)" />
              {[[12,12],[33,17],[52,10],[74,15],[96,11],[118,18],[131,9],[22,20],[63,21],[104,21]].map(([x,y], i) => (
                <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.4 : 1} fill={i % 2 ? '#bd9a4c' : '#f6e8b8'} opacity=".7" />
              ))}
            </pattern>
          </defs>
          <rect width="100%" height={SAND_H + 8} fill="url(#pf-sand)" />
        </svg>
        {/* stânci și pietricele (decor) */}
        {[{ l: '13%', w: 38, h: 22 }, { l: '57%', w: 30, h: 16 }, { l: '86%', w: 42, h: 24 }].map((r, i) => (
          <div key={i} aria-hidden="true" style={{ position: 'absolute', left: r.l, bottom: SAND_H - 8, width: r.w, height: r.h, pointerEvents: 'none',
            borderRadius: '55% 45% 30% 30% / 70% 65% 30% 30%', background: 'linear-gradient(160deg,#a9b4bd,#6f7d89)', boxShadow: 'inset -4px -3px 0 rgba(0,0,0,.12), inset 3px 2px 0 rgba(255,255,255,.25)' }}>
            <span style={{ position: 'absolute', left: '12%', bottom: 0, width: '45%', height: '28%', borderRadius: '50% 50% 0 0', background: 'rgba(96,170,120,.75)' }} />
          </div>
        ))}
        {[{ l: '25%', s: 8 }, { l: '27.5%', s: 5 }, { l: '44%', s: 7 }, { l: '67%', s: 6 }, { l: '70%', s: 9 }, { l: '78%', s: 5 }].map((r, i) => (
          <div key={i} aria-hidden="true" style={{ position: 'absolute', left: r.l, bottom: SAND_H - 5, width: r.s, height: r.s * 0.65, pointerEvents: 'none',
            borderRadius: '50%', background: i % 2 ? '#b9a98f' : '#9aa6ae', boxShadow: 'inset -1px -1px 0 rgba(0,0,0,.15)' }} />
        ))}
        <div className="pf-bubbles" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /></div>
        {/* alge pe fund (decor, în spatele peștilor) */}
        {[{ l: '34%', h: 40, d: '0s' }, { l: '71%', h: 52, d: '-1.3s' }, { l: '93%', h: 36, d: '-2.1s' }].map((w, i) => (
          <svg key={i} className="pf-weed" aria-hidden="true" width="22" height={w.h} viewBox="0 0 22 52" preserveAspectRatio="none"
            style={{ left: w.l, bottom: SAND_H - 3, height: w.h, animationDelay: w.d }}>
            <path d="M11 52 C3 40 19 32 11 22 C5 14 15 8 11 0" fill="none" stroke="#6fb592" strokeWidth="4" strokeLinecap="round" opacity=".85" />
            <path d="M6 52 C0 44 8 38 4 30" fill="none" stroke="#86c8a4" strokeWidth="3" strokeLinecap="round" opacity=".8" />
          </svg>
        ))}

        {/* pontonul */}
        <div style={{ position: 'absolute', left: 0, top: SKY_H - 10, width: FOX_LEFT + 156, height: 12, background: 'repeating-linear-gradient(90deg,#b88a55 0 22px,#a77a47 22px 24px)', borderRadius: '0 0 6px 0' }} />
        <div style={{ position: 'absolute', left: FOX_LEFT + 136, top: SKY_H + 2, width: 8, height: 40, background: '#8a6238' }} />
        {/* vulpea (singura de pe ecran) */}
        <div className={`pf-fox${pull ? ' is-fight' : ''}`} style={{ position: 'absolute', left: FOX_LEFT, top: SKY_H - 10 - FOX_SIZE + 6 }}>
          <div ref={foxLookRef} style={{ transformOrigin: '42% 78%' }}>
            <FoxMotion state={mascotState} action={done?.passed ? 'celebrating' : pull ? 'jumping' : (!paused && !done && fish?.state === 'swimming' && !pink ? 'watching' : undefined)} size={FOX_SIZE} />
          </div>
        </div>
        {/* bula comics cu simbolul rostit de vulpe; chenarul are culoarea simbolului (negru la consoane) */}
        {announce && !paused && !done && (() => {
          const sv = symbolView(announce)
          const border = sv.tricolor ? TRICOLOR_BANDS[1] : sv.whiteOutlined ? '#000' : sv.color
          return (
            <div style={{
              position: 'absolute', left: FOX_LEFT + FOX_SIZE + 2, top: SKY_H - FOX_SIZE - 16, zIndex: 5,
              background: '#fff', border: `3px solid ${border}`, borderRadius: 14, padding: '2px 12px',
              fontSize: 26, fontWeight: 800, fontStyle: 'italic', boxShadow: '2px 3px 0 rgba(0,0,0,.15)',
            }}>
              <span style={sv.tricolor ? tricolorLetterStyle(6) : sv.whiteOutlined ? WHITE_OUTLINED_TEXT_STYLE : { color: sv.color }}>{sv.text}</span>
              {announceWord && <span style={{ marginLeft: 10, fontSize: 20, fontStyle: 'normal', fontWeight: 700, color: '#333' }}>{announceWord}</span>}
              <span aria-hidden="true" style={{ position: 'absolute', left: -9, bottom: 6, width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderRight: `10px solid ${border}` }} />
            </div>
          )
        })()}

        {/* tazul cu pești: se văd doar cozile; pe taz scrie câți pești s-au prins */}
        <div
          ref={bucketRef}
          style={{ position: 'absolute', left: BUCKET.left, top: BUCKET.top, width: BUCKET.w, height: BUCKET.h, zIndex: 2, pointerEvents: 'none' }}
          aria-label={`${caughtCount} pești prinși`}
        >
          <svg width={BUCKET.w} height={BUCKET.h} viewBox={`0 0 ${BUCKET_VB.w} ${BUCKET_VB.h}`} style={{ overflow: 'visible', display: 'block' }}>
            <defs>
              <linearGradient id={`${bucketId}-tri`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={TRICOLOR_BANDS[0]} /><stop offset="33%" stopColor={TRICOLOR_BANDS[0]} />
                <stop offset="33%" stopColor={TRICOLOR_BANDS[1]} /><stop offset="66%" stopColor={TRICOLOR_BANDS[1]} />
                <stop offset="66%" stopColor={TRICOLOR_BANDS[2]} /><stop offset="100%" stopColor={TRICOLOR_BANDS[2]} />
              </linearGradient>
            </defs>
            {/* cozile (poziție/înclinare fixe per pește: nu sar când se adaugă altele) */}
            {cells.map((c, i) => {
              if (!c.filled || !c.lesson) return null
              if (cells.slice(i + 1).filter(k => k.filled && k.lesson).length >= 6) return null   // doar ultimele 6 cozi
              const x = 22 + ((i * 37) % 61)
              const ang = ((i * 53) % 51) - 25
              const sc = (0.9 + ((i * 17) % 5) / 20) * 1.3   // cozi la 130%
              return (
                <g key={i} transform={`translate(${x} ${BUCKET_VB.rim + 6}) rotate(${ang}) scale(${sc})`}>
                  <path
                    className="pf-tailpop"
                    d="M-3 4 L-10 -22 Q0 -15 10 -22 L3 4 Z"
                    fill={c.lesson.id === 'ou' ? `url(#${bucketId}-tri)` : bodyColorFor(c.lesson)}
                    stroke="#1a1006" strokeWidth="2" strokeLinejoin="round"
                  />
                </g>
              )
            })}
            {/* corpul tazului (acoperă corpurile peștilor) */}
            <path d={`M8 ${BUCKET_VB.rim} L96 ${BUCKET_VB.rim} L88 106 Q87 111 82 111 L22 111 Q17 111 16 106 Z`} fill="#8fa3b8" stroke="#34495e" strokeWidth="2.5" strokeLinejoin="round" />
            <path d={`M10 ${BUCKET_VB.rim + 12} L94 ${BUCKET_VB.rim + 12}`} stroke="rgba(255,255,255,.35)" strokeWidth="2" />
            <rect x="3" y={BUCKET_VB.rim - 4} width="98" height="9" rx="4.5" fill="#6f8499" stroke="#34495e" strokeWidth="2.5" />
            <text
              x="52" y="86" textAnchor="middle" fontSize="40" fontWeight="800" fill="#fff"
              stroke="#34495e" strokeWidth="5" paintOrder="stroke"
              style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", cursive, sans-serif' }}
            >
              {caughtCount}
            </text>
          </svg>
        </div>

        {/* undița: lansetă curbată, mulinetă, fir cu buclă moale, plută cu ondulații, cârlig cu momeală */}
        {(() => {
          const rg = rodGeom(0)
          const tip = rg.tip
          return (
            <svg width="100%" height={stageH} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }} aria-hidden="true">
              <line x1={ROD_BASE.x - 4} y1={ROD_BASE.y + 2} x2={ROD_BASE.x + 10} y2={ROD_BASE.y - 3} stroke="#3d2a18" strokeWidth="7" strokeLinecap="round" />
              <circle cx={ROD_BASE.x + 7} cy={ROD_BASE.y + 6} r="4.5" fill="#9aa3ab" stroke="#4a5158" strokeWidth="1.3" />
              <path ref={rodARef} d={rg.d} fill="none" stroke="#6b4a2b" strokeWidth="4" strokeLinecap="round" />
              <path ref={rodBRef} d={rg.d} fill="none" stroke="#d2a86e" strokeWidth="1.4" strokeLinecap="round" />
              {pull ? (
                <>
                  <path ref={lineRef} d={`M${tip.x} ${tip.y}`} fill="none" stroke="#555" strokeWidth="1.1" />
                  <path ref={hookRef} d={`M${tip.x} ${tip.y}`} fill="none" stroke="#777" strokeWidth="1.5" strokeLinecap="round" />
                </>
              ) : (
                <g className="pf-sway" style={{ transformOrigin: `${tip.x}px ${tip.y}px` }}>
                  <path d={`M${tip.x} ${tip.y} Q${tip.x + 12} ${(tip.y + FLOAT.y) / 2 - 6} ${FLOAT.x} ${FLOAT.y - 8}`} fill="none" stroke="#555" strokeWidth="1.1" />
                  <g className="pf-float">
                    <path d={`M${FLOAT.x - 4.5} ${FLOAT.y} a4.5 4.5 0 0 1 9 0 z`} fill="#e03131" stroke="#333" strokeWidth="0.8" />
                    <path d={`M${FLOAT.x - 4.5} ${FLOAT.y} a4.5 4.5 0 0 0 9 0 z`} fill="#fff" stroke="#333" strokeWidth="0.8" />
                    <line x1={FLOAT.x} y1={FLOAT.y - 9} x2={FLOAT.x} y2={FLOAT.y - 5} stroke="#333" strokeWidth="1" />
                  </g>
                  <line x1={FLOAT.x} y1={FLOAT.y + 4} x2={FLOAT.x} y2={FLOAT.y + 52} stroke="#666" strokeWidth="0.9" />
                  <path d={`M${FLOAT.x} ${FLOAT.y + 52} v4 q0 6 -6 5`} fill="none" stroke="#777" strokeWidth="1.5" strokeLinecap="round" />
                  <path d={`M${FLOAT.x - 7} ${FLOAT.y + 60} q3 -4 6 0 q3 4 5 -1`} fill="none" stroke="#e58aa0" strokeWidth="2.2" strokeLinecap="round" />
                  <ellipse className="pf-ripple" cx={FLOAT.x} cy={FLOAT.y + 1} rx="7" ry="2" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="1" />
                  <ellipse className="pf-ripple pf-ripple2" cx={FLOAT.x} cy={FLOAT.y + 1} rx="7" ry="2" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="1" />
                </g>
              )}
            </svg>
          )
        })()}

        {/* peștele care înoată (cu capul înainte); poziția o scrie rAF direct pe element */}
        {fish && !pull && (() => {
          const W = stageRef.current?.clientWidth ?? 680
          const solved = fish.state === 'hooked'
          const lb = buildLabel(fish.group.lesson, level, fish.word, solved)
          return (
            <div
              ref={swimElRef}
              style={{
                position: 'absolute', left: 0, top: 0, willChange: 'transform', zIndex: 2,
                transform: swimTransform(fish, progressRef.current, W),
                animation: fish.state === 'miss' ? `${(fish.dir ?? 1) === 1 ? 'pf-away' : 'pf-away-l'} 600ms ease-in forwards` : undefined,
                ['--flip' as string]: fish.dir ?? 1,
              }}
            >
              <FishSvg
                body={level === 2 && !solved ? NEUTRAL : bodyColorFor(fish.group.lesson)}
                tricolor={fish.group.lesson.id === 'ou' && !(level === 2 && !solved)}
                label={lb.node} len={lb.len} width={FISH_W}
              />
              {fish.group.kind === 'next' && <span style={{ position: 'absolute', top: -10, right: -4, fontSize: 13 }}>✨</span>}
            </div>
          )
        })()}
        {/* peștele prins, atârnat de undiță / în zbor spre celulă (poziția o scrie rAF) */}
        {fish && pull && (() => {
          const lb = buildLabel(fish.group.lesson, level, fish.word, true)
          return (
            <div ref={pullFishRef} style={{ position: 'absolute', left: 0, top: 0, willChange: 'transform', zIndex: 4, transform: 'translate3d(-999px,-999px,0)', ['--flip' as string]: fish.dir ?? 1 }}>
              <FishSvg
                body={bodyColorFor(fish.group.lesson)}
                tricolor={fish.group.lesson.id === 'ou'}
                label={lb.node} len={lb.len} width={FISH_W} wag={false}
              />
            </div>
          )
        })()}

        {paused && !done && (
          <div style={overlayStyle}>
            {confirmExit ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Ieși din joc?</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ ...pb, background: '#1a1917', color: '#fff', borderColor: '#1a1917' }} onClick={() => { setConfirmExit(false); togglePause() }}>Rămâi în joc</button>
                  <button style={pb} onClick={() => { window.speechSynthesis?.cancel(); onExit?.() }}>Ieși</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 18, fontWeight: 700 }}>⏸ Pauză</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ ...pb, background: '#1a1917', color: '#fff', borderColor: '#1a1917' }} onClick={togglePause}>▶ Continuă</button>
                  <button style={pb} onClick={start}>↻ Reia nivelul</button>
                </div>
              </>
            )}
          </div>
        )}
        {done && (
          <div style={overlayStyle}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              {done.passed ? '🎉 Reușit!' : 'Mai încearcă'} — {Math.round(done.rate * 100)}%
            </div>
            <button onClick={start} style={pb}>Reia</button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: compact ? 10 : 14, marginTop: compact ? 8 : 16 }}>
        {visibleGroups.map(g => {
          const hinted = hintGroup?.lesson.id === g.lesson.id
          const sv = symbolView(g.lesson)
          const ringColor = bodyColorFor(g.lesson)
          return (
            <button
              key={g.lesson.id}
              onClick={() => handlePress(g)}
              className={buzzId === g.lesson.id ? 'pf-wrong' : hinted ? 'pf-buzz' : undefined}
              style={{
                width: ansSize, height: ansSize, borderRadius: '50%', border: 'none', cursor: 'pointer', touchAction: 'manipulation',
                background: g.lesson.id === 'ou' ? TRICOLOR_BUTTON_BG : ringColor,
                boxShadow: hinted ? '0 0 0 5px rgba(0,0,0,.12)' : '0 1px 3px rgba(0,0,0,.15)',
                transition: 'box-shadow 200ms',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ width: compact ? 38 : 30, height: compact ? 38 : 30, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: compact ? 16 : 13, fontWeight: 700, color: sv.color }}>
                <span style={sv.tricolor ? tricolorLetterStyle(6) : sv.whiteOutlined ? WHITE_OUTLINED_TEXT_STYLE : undefined}>{sv.text}</span>
              </span>
            </button>
          )
        })}
      </div>

      {!compact && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, fontSize: 13, color: '#555' }}>
          <span style={festiveScore} className={scoreFlash ? 'pf-score-flash' : undefined}>🎉 Scor: {score}</span>
          <span>{caughtCount} / {queueLen} pești</span>
        </div>
      )}

      <style>{`
        @keyframes pf-buzz { 0%,100% { transform: translateX(0) scale(1) } 12% { transform: translateX(-5px) scale(1.12) } 25% { transform: translateX(5px) scale(1.12) } 37% { transform: translateX(-5px) scale(1.12) } 50% { transform: translateX(5px) scale(1.12) } 62% { transform: translateX(-3px) scale(1.06) } 75% { transform: translateX(3px) scale(1.06) } }
        .pf-buzz { animation: pf-buzz 450ms ease-in-out infinite; outline: 4px solid rgba(255,140,0,.55); outline-offset: 2px; }
        @keyframes pf-wrong { 0%,100% { transform: translateX(0) } 15% { transform: translateX(-8px) rotate(-6deg) } 30% { transform: translateX(8px) rotate(6deg) } 45% { transform: translateX(-7px) rotate(-5deg) } 60% { transform: translateX(7px) rotate(5deg) } 80% { transform: translateX(-3px) } }
        .pf-wrong { animation: pf-wrong 420ms linear; outline: 4px solid rgba(204,0,0,.55); outline-offset: 2px; }
        @keyframes pf-swell { 0%,100% { transform: scale(1) } 50% { transform: scale(1.4) } }
        .eic-pulse { display: inline-block; animation: pf-swell 2.6s ease-in-out infinite; }
        @keyframes pf-tail { 0% { transform: rotate(0) } 50% { transform: rotate(14deg) } 100% { transform: rotate(0) } }
        .pf-tail { transform-origin: 80px 25px; animation: pf-tail 650ms ease-in-out infinite; }
        @keyframes pf-away { 0% { opacity: 1; margin-left: 0 } 100% { opacity: 0; margin-left: 70px } }
        @keyframes pf-away-l { 0% { opacity: 1; margin-left: 0 } 100% { opacity: 0; margin-left: -70px } }
        @keyframes pf-pop { 0% { transform: scale(.3); opacity: 0 } 70% { transform: scale(1.2); opacity: 1 } 100% { transform: scale(1); opacity: 1 } }
        @keyframes pf-tailpop { 0% { transform: translateY(14px); opacity: 0 } 60% { transform: translateY(-3px); opacity: 1 } 100% { transform: translateY(0); opacity: 1 } }
        .pf-tailpop { animation: pf-tailpop 400ms ease-out; }
        @keyframes pf-sway { 0%,100% { transform: rotate(-1.2deg) } 50% { transform: rotate(1.2deg) } }
        .pf-sway { animation: pf-sway 3.2s ease-in-out infinite; }
        @keyframes pf-ripple { 0% { transform: scale(.5); opacity: .9 } 100% { transform: scale(2); opacity: 0 } }
        .pf-ripple { transform-box: fill-box; transform-origin: center; animation: pf-ripple 2.2s ease-out infinite; }
        .pf-ripple2 { animation-delay: 1.1s; }
        @keyframes pf-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(3px) } }
        .pf-float { animation: pf-bob 1.6s ease-in-out infinite; }
        @keyframes pf-score-flash { 0% { transform: scale(1) } 40% { transform: scale(1.35) rotate(-2deg) } 100% { transform: scale(1) } }
        .pf-score-flash { animation: pf-score-flash 400ms ease-out; display: inline-block; }
        @keyframes pf-bubble { 0% { transform: translateY(0) scale(.6); opacity: 0 } 15% { opacity: .8 } 100% { transform: translateY(-150px) scale(1); opacity: 0 } }
        .pf-bubbles { position: absolute; left: 0; right: 0; bottom: 0; height: ${stageH - SKY_H}px; pointer-events: none; }
        .pf-bubbles span { position: absolute; bottom: ${SAND_H}px; width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.7); animation: pf-bubble 3.6s linear infinite, pf-wob 1.7s ease-in-out infinite alternate; }
        .pf-bubbles span:nth-child(1) { left: 22%; animation-delay: 0s; }
        .pf-bubbles span:nth-child(2) { left: 52%; width: 4px; height: 4px; animation-delay: 1.2s; }
        .pf-bubbles span:nth-child(3) { left: 82%; width: 6px; height: 6px; animation-delay: 2.3s; }
        .pf-bubbles span:nth-child(4) { left: 38%; width: 3px; height: 3px; animation-duration: 4.6s, 1.4s; animation-delay: 0.7s; }
        .pf-bubbles span:nth-child(5) { left: 65%; width: 5px; height: 5px; animation-duration: 3.1s, 2s; animation-delay: 1.9s; }
        .pf-bubbles span:nth-child(6) { left: 10%; width: 4px; height: 4px; animation-duration: 4.2s, 1.6s; animation-delay: 3s; }
        .pf-bubbles span:nth-child(7) { left: 92%; width: 3px; height: 3px; animation-duration: 5s, 1.5s; animation-delay: 2.6s; }
        @keyframes pf-wob { 0% { translate: -4px 0 } 100% { translate: 5px 0 } }
        @keyframes pf-mote { 0% { transform: translate(0,0); opacity: .15 } 50% { opacity: .65 } 100% { transform: translate(26px,-14px); opacity: .15 } }
        .pf-motes { position: absolute; left: 0; right: 0; pointer-events: none; }
        .pf-motes span { position: absolute; border-radius: 50%; background: rgba(255,255,255,.9); animation: pf-mote 9s ease-in-out infinite alternate; }
        @keyframes pf-caustic { 0% { background-position: 0 0, 45px 20px } 100% { background-position: 90px 0, -45px 20px } }
        .pf-caustic { position: absolute; left: 0; right: 0; height: 70px; pointer-events: none; animation: pf-caustic 12s linear infinite;
          background-image: radial-gradient(ellipse 26px 7px at 30px 14px, rgba(255,255,255,.55), transparent 70%), radial-gradient(ellipse 20px 6px at 20px 22px, rgba(255,255,255,.4), transparent 70%);
          background-size: 90px 40px, 90px 40px;
          -webkit-mask-image: linear-gradient(transparent, #000 90%); mask-image: linear-gradient(transparent, #000 90%); }
        @keyframes pf-rays-drift { 0% { transform: translateX(-3%) } 100% { transform: translateX(3%) } }
        .pf-rays { position: absolute; left: -20%; width: 140%; pointer-events: none; animation: pf-rays-drift 9s ease-in-out infinite alternate;
          background: repeating-linear-gradient(105deg, transparent 0 70px, rgba(255,255,255,.22) 70px 100px, transparent 100px 190px);
          -webkit-mask-image: linear-gradient(#000, transparent 85%); mask-image: linear-gradient(#000, transparent 85%); }
        @keyframes pf-weed { 0%,100% { transform: rotate(-5deg) } 50% { transform: rotate(5deg) } }
        .pf-weed { position: absolute; pointer-events: none; transform-origin: 50% 100%; animation: pf-weed 3.4s ease-in-out infinite; }
        @keyframes pf-dock { 0%,100% { transform: rotate(-0.35deg) } 38% { transform: rotate(0.7deg) translateY(-1px) } 68% { transform: rotate(-0.15deg) translateY(0.4px) } }
        .pf-fox { transform-origin: 40% 100%; animation: pf-dock 6.4s ease-in-out infinite; }
        .pf-fox.is-fight { animation: pf-fight 0.7s ease-in-out infinite; }
        @keyframes pf-fight { 0%,100% { transform: rotate(0.6deg) } 35% { transform: rotate(-3.2deg) translate(-1px, 1px) } 68% { transform: rotate(2deg) translate(1px, 0) } }
        @media (prefers-reduced-motion: reduce) { .pf-rays, .pf-weed, .pf-motes span, .pf-caustic, .pf-fox { animation: none } }
      `}</style>
    </div>
  )
}


const pillBtn: React.CSSProperties = {
  border: '1px solid #e8e6e1', background: '#f8f7f4', borderRadius: 999,
  padding: '6px 14px', fontSize: 12.5, cursor: 'pointer',
}
const overlayStyle: React.CSSProperties = {
  position: 'absolute', inset: 0, zIndex: 6, background: 'rgba(255,255,255,.93)',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
}
const festiveScore: React.CSSProperties = {
  fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", cursive, sans-serif',
  fontWeight: 800, fontSize: 20, letterSpacing: 0.3,
  background: 'linear-gradient(90deg, #ff8a3d, #ffb703, #ff8a3d)',
  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
}
