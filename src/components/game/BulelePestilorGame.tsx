'use client'

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { MascotV2, type MascotStateV2 } from '@/components/game/MascotV2'
import { speakWord } from '@/lib/speak'
import WordRenderer from '@/components/WordRenderer'
import type { RenderNode } from '@/lib/renderNode'
import type { Lesson, LessonWord } from '@/lib/levels'
import { tricolorLetterStyle, TRICOLOR_BANDS, TRICOLOR_UNDERLINE_COLOR } from '@/lib/tricolorStyle'

// ─────────────────────────────────────────────────────────────────────────
// Bulele Vulpii — varianta „PEȘTI” (componentă NOUĂ, paralelă cu BuleleVulpiiGame).
// Același API ca BuleleVulpiiGame (lesson/distractorLessons/nextLesson/level/
// onFinish/onExit). Nefolosită în /learn. Nu modifică BuleleVulpiiGame.tsx, Mascot*.tsx, levels.ts sau altceva.
// Aceeași logică de joc (coadă 60/35/5, zona roz = indiciu, ajutor ×10,
// +1 / −1 / +2, prag 80%), dar:
//  • baloanele devin PEȘTI care înoată de la stânga la dreapta; unul care
//    ajunge la capăt fără apăsare corectă SCAPĂ (−1);
//  • vulpea stă pe un ponton și PESCUIEȘTE: la apăsare corectă undița
//    aruncă, peștele se colorează, e tras sus și zboară într-o celulă;
//  • acvariul e o grilă de celule (câte una per pește din coadă): un pește
//    prins umple celula lui, în culoarea sunetului; celula rămâne goală
//    dacă peștele a scăpat. Dinții dispar (nu mai au rol).
// ─────────────────────────────────────────────────────────────────────────

export type BulelePestilorLevel = 1 | 2
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

const TOTAL = 10
function buildQueue(current: Group, distractors: Group[], next: Group | null): QueueItem[] {
  const nextCount = next ? 1 : 0
  let currentCount = 6
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
const SKY_H = 130            // zona de sus: ponton + vulpe + acvariu
const SAND_H = 16
// Ritm (mai lent decât prima variantă: 6000 / 1300 / 250) — ajustabil aici.
const SWIM_MS = 10000   // traversarea completă a apei
const NEXT_FISH_DELAY_MS = 800
const FISH_W = 112
const PULL_MS = 1900
const FOX_LEFT = 14
const FOX_SIZE = 84
const TIP = { x: FOX_LEFT + 138, y: SKY_H - 84 }      // vârful undiței (în repaus)
const ROD_BASE = { x: FOX_LEFT + 70, y: SKY_H - 44 }  // de unde pornește undița
const FLOAT = { x: FOX_LEFT + 146, y: SKY_H + 3 }     // pluta, la suprafața apei
const MOUTH = 0.42 * FISH_W                            // distanța centru → gură
const HANG = -35 * Math.PI / 180                       // înclinarea peștelui când e tras în sus
const NEUTRAL = '#f4f1ea'

type Zone = 'blue' | 'pink'
type FState = 'swimming' | 'hooked' | 'miss'
interface LiveFish {
  id: number; qi: number; group: Group; word: LessonWord
  y: number; phase: number; progress: number; zone: Zone; state: FState
}
interface Cell { filled: boolean; lesson: Lesson | null; bonus: boolean }

let fishSeq = 0

function fishX(progress: number, W: number) { return (-0.08 + 1.16 * (progress / 100)) * W }
function fishY(f: LiveFish, p: number) { return f.y + Math.sin((p / 100) * Math.PI * 4 + f.phase) * 8 }
// Poziția peștelui care înoată = un singur transform (GPU), scris direct pe element la fiecare frame.
function swimTransform(f: LiveFish, p: number, W: number) {
  const dy = Math.cos((p / 100) * Math.PI * 4 + f.phase) * 8 * Math.PI * 4 / 100
  const dx = 1.16 * W / 100
  const tilt = f.state === 'swimming' ? (Math.atan2(dy, dx) * 180) / Math.PI : 0
  return `translate3d(${fishX(p, W).toFixed(1)}px, ${fishY(f, p).toFixed(1)}px, 0) translate(-50%,-50%) rotate(${tilt.toFixed(2)}deg)`
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

function buildLabel(lesson: Lesson, level: Level, word: LessonWord, solved: boolean): { node: ReactNode; len: number } {
  const tri = lesson.id === 'ou'
  if (level === 1) {
    const txt = lesson.letter
    const style: CSSProperties = solved
      ? (tri ? tricolorLetterStyle(6) : { color: lesson.color })
      : { color: '#333' }
    return { node: <span style={style}>{txt}</span>, len: txt.replace(/\u200D/g, '').length }
  }
  const text = word.text
  const nodes = nodesCache.get(text.toLowerCase())
  if (solved && nodes) return { node: <WordRenderer nodes={nodes} wordStr={text} />, len: text.length }
  const idx = text.toLowerCase().indexOf(word.mark.toLowerCase())
  if (!solved || idx === -1) return { node: <span style={{ color: '#333' }}>{text}</span>, len: text.length }
  const markEnd = idx + word.mark.length
  const markChars = [...text.slice(idx, markEnd)]
  return {
    len: text.length,
    node: (
      <span style={{ color: '#333' }}>
        {text.slice(0, idx)}
        {markChars.map((ch, k) => {
          if (tri && isVowelLike(ch)) {
            return <span key={k} style={{ ...tricolorLetterStyle(), textDecorationColor: TRICOLOR_UNDERLINE_COLOR }}>{ch}</span>
          }
          const diac = lesson.id === 'oi' && k === markChars.length - 1
          if (diac) return <span key={k} style={{ color: '#CC0000' }}>{OFFGLIDE[ch] ?? ch}</span>
          return <span key={k} style={isVowelLike(ch) ? { color: lesson.color } : undefined}>{ch}</span>
        })}
        {text.slice(markEnd)}
      </span>
    ),
  }
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
      <svg width={width} height={height} viewBox="0 0 100 50" style={{ overflow: 'visible', display: 'block' }} aria-hidden="true">
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
        position: 'absolute', left: '22%', top: '20%', width: '52%', height: '60%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, lineHeight: 1, whiteSpace: 'nowrap', fontSize: (width * fs) / 100,
      }}>
        {label}
      </div>
    </div>
  )
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
  const [cellPx, setCellPx] = useState(44)

  const stageRef = useRef<HTMLDivElement>(null)
  const cellRefs = useRef<(HTMLDivElement | null)[]>([])
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
  const swimElRef = useRef<HTMLDivElement | null>(null)
  const pullFishRef = useRef<HTMLDivElement | null>(null)
  const rodARef = useRef<SVGPathElement | null>(null)
  const rodBRef = useRef<SVGPathElement | null>(null)
  const lineRef = useRef<SVGPathElement | null>(null)
  const hookRef = useRef<SVGPathElement | null>(null)

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms))
  }
  function flashScore() { setScoreFlash(true); later(() => setScoreFlash(false), 400) }

  function spawnAt(pos: number, q: QueueItem[]) {
    const item = q[pos]
    progressRef.current = 0
    setFourthVisible(item.group.kind === 'next')
    setFish({
      id: fishSeq++, qi: pos, group: item.group, word: pickWord(item.group.lesson),
      y: SKY_H + 46 + Math.random() * (STAGE_H - SKY_H - SAND_H - 92),
      phase: Math.random() * Math.PI * 2, progress: 0, zone: 'blue', state: 'swimming',
    })
    speakWord(ttsWordFor(item.group.lesson))
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
    const upd = () => setCellPx((stageRef.current?.clientWidth ?? 680) < 520 ? 34 : 44)
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
      progressRef.current = Math.min(100, progressRef.current + (100 * dt) / SWIM_MS)
      apply()
      const p = progressRef.current
      if (p >= 100) {
        setFish(prev => (prev && prev.id === fishId ? { ...prev, zone: 'pink', state: 'miss' } : prev))
        return
      }
      if (p >= 66 && !pinkSent) {
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
      speakWord(ttsWordFor(fish.group.lesson))
      setHintGroup(fish.group)
      later(() => setHintGroup(null), 1000)
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

  // ── tragerea peștelui: undița aruncă, peștele e ridicat, zboară în celulă ──
  function startPull(f: LiveFish) {
    const stage = stageRef.current
    const cellEl = cellRefs.current[f.qi]
    if (!stage || !cellEl) { finishPull(f); return }
    const W = stage.clientWidth
    const p0 = progressRef.current
    const start = { x: fishX(p0, W), y: fishY(f, p0) }
    const sr = stage.getBoundingClientRect()
    const cr = cellEl.getBoundingClientRect()
    const target = { x: cr.left - sr.left + cr.width / 2, y: cr.top - sr.top + cr.height / 2 }
    // peștele e tras de GURĂ: stă înclinat cu botul în sus, atârnat sub vârful undiței
    const up = { x: TIP.x - Math.cos(HANG) * MOUTH, y: TIP.y + 20 - Math.sin(HANG) * MOUTH }
    const endScale = (cellPx - 6) / FISH_W
    const t0 = performance.now()
    pullingRef.current = true
    setPull(true)
    const mouthOf = (x: number, y: number, rot: number) => ({ x: x + Math.cos(rot) * MOUTH, y: y + Math.sin(rot) * MOUTH })
    const step = (now: number) => {
      const t = Math.min((now - t0) / PULL_MS, 1)
      let fx = start.x, fy = start.y, rot = 0, scale = 1, line = true, taut = false, bend = 0
      let m = mouthOf(fx, fy, 0), lx = TIP.x, ly = TIP.y
      if (t < 0.3) {                        // aruncare: firul (moale) ajunge la gura peștelui
        const e = ease(t / 0.3)
        lx = lerp(TIP.x, m.x, e); ly = lerp(TIP.y, m.y, e); bend = 0.3 * e
      } else if (t < 0.6) {                 // tragere: fir întins, peștele se ridică și se înclină
        const e = ease((t - 0.3) / 0.3)
        fx = lerp(start.x, up.x, e); fy = lerp(start.y, up.y, e); rot = lerp(0, HANG, e)
        m = mouthOf(fx, fy, rot); lx = m.x; ly = m.y; taut = true; bend = lerp(0.3, 1, e)
      } else {                              // se desprinde și zboară în celulă; lanseta revine elastic
        line = false
        const e = ease((t - 0.6) / 0.4)
        const cx = (up.x + target.x) / 2, cy = Math.min(up.y, target.y) - 36
        const a = 1 - e
        fx = a * a * up.x + 2 * a * e * cx + e * e * target.x
        fy = a * a * up.y + 2 * a * e * cy + e * e * target.y
        rot = lerp(HANG, 0, e)
        scale = lerp(1, endScale, e)
        bend = 1 - e
      }
      // totul direct pe DOM, fără setState pe frame
      const pf = pullFishRef.current
      if (pf) pf.style.transform = `translate3d(${fx.toFixed(1)}px, ${fy.toFixed(1)}px, 0) translate(-50%,-50%) rotate(${rot.toFixed(3)}rad) scale(${scale.toFixed(3)})`
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
      if (t < 1) rafRef.current = requestAnimationFrame(step)
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
    speakWord(ttsWordFor(fish.group.lesson))
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

  const visibleGroups = fourthVisible && nextGroup
    ? [currentGroup, ...distractorGroups, nextGroup]
    : [currentGroup, ...distractorGroups]

  const pink = fish?.zone === 'pink' && fish.state === 'swimming'
  const waterBg = pink
    ? 'linear-gradient(#fdeef4, #f8d9e5)'
    : 'linear-gradient(#eaf4fb, #cfe6f3)'

  const mascotState: MascotStateV2 = done
    ? (done.passed ? 'cheering' : 'idle')
    : paused ? 'sleeping'
      : pull ? 'pointing'
        : cheer ? 'clapping'
          : helpMessage || pink ? 'pointing' : 'idle'

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: '#a03060' }}>💗 {hearts}</span>
        <button onClick={useHelp} disabled={hearts <= 0 || paused} style={pillBtn}>Ajută-mă</button>
        {helpMessage && (
          <span style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: '2px 8px', fontSize: 13, fontWeight: 700 }}>
            {helpMessage}
          </span>
        )}
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={togglePause} disabled={!!done} style={pillBtn}>{paused ? '▶ Continuă' : '⏸ Pauză'}</button>
          {onExit && <button onClick={() => { if (!pausedRef.current) togglePause(); setConfirmExit(true) }} aria-label="Ieși din joc" style={{ ...pillBtn, marginLeft: 6 }}>✕</button>}
        </div>
      </div>

      <div ref={stageRef} style={{ position: 'relative', height: STAGE_H, borderRadius: 14, overflow: 'hidden', background: '#f4f9fc' }}>
        {/* apa */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: SKY_H, bottom: 0, background: waterBg, transition: 'background 400ms' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: SKY_H, height: 3, background: 'rgba(255,255,255,.7)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: SAND_H, background: 'linear-gradient(#e8cf8f,#d4b56b)' }} />
        <div className="pf-bubbles" aria-hidden="true"><span /><span /><span /></div>

        {/* pontonul */}
        <div style={{ position: 'absolute', left: 0, top: SKY_H - 10, width: 170, height: 12, background: 'repeating-linear-gradient(90deg,#b88a55 0 22px,#a77a47 22px 24px)', borderRadius: '0 0 6px 0' }} />
        <div style={{ position: 'absolute', left: 150, top: SKY_H + 2, width: 8, height: 40, background: '#8a6238' }} />
        {/* vulpea (singura de pe ecran) */}
        <div style={{ position: 'absolute', left: FOX_LEFT, top: SKY_H - 10 - FOX_SIZE + 6 }}>
          <MascotV2 state={mascotState} action={done?.passed ? 'celebrating' : undefined} size={FOX_SIZE} />
        </div>

        {/* acvariul pe celule */}
        <div style={aquariumStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(5, ${cellPx}px)`, gap: 3 }}>
            {cells.map((c, i) => {
              const tri = c.lesson?.id === 'ou'
              const lb = c.lesson ? buildLabel(c.lesson, 1, { text: '', mark: '' }, true) : null
              return (
                <div
                  key={i}
                  ref={el => { cellRefs.current[i] = el }}
                  style={{
                    width: cellPx, height: cellPx, borderRadius: 6, boxSizing: 'border-box',
                    background: c.filled ? 'linear-gradient(#d6f0ee,#8fcfdd)' : 'rgba(255,255,255,.35)',
                    border: c.filled && c.lesson ? `2px solid ${c.lesson.color}` : '1.5px dashed rgba(33,88,102,.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {c.filled && c.lesson && lb && (
                    <div className="pf-cellfish">
                      <FishSvg body={c.lesson.color} tricolor={tri} label={lb.node} len={lb.len} width={cellPx - 6} wag={false} />
                    </div>
                  )}
                  {c.filled && c.bonus && <span style={{ position: 'absolute', top: -7, right: -5, fontSize: 11 }}>✨</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* undița: lansetă curbată, mulinetă, fir cu buclă moale, plută cu ondulații, cârlig cu momeală */}
        {(() => {
          const rg = rodGeom(0)
          const tip = rg.tip
          return (
            <svg width="100%" height={STAGE_H} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }} aria-hidden="true">
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
                animation: fish.state === 'miss' ? 'pf-away 600ms ease-in forwards' : undefined,
              }}
            >
              <FishSvg
                body={solved ? fish.group.lesson.color : NEUTRAL}
                tricolor={solved && fish.group.lesson.id === 'ou'}
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
            <div ref={pullFishRef} style={{ position: 'absolute', left: 0, top: 0, willChange: 'transform', zIndex: 4, transform: 'translate3d(-999px,-999px,0)' }}>
              <FishSvg
                body={fish.group.lesson.color}
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
                  <button style={{ ...pillBtn, background: '#1a1917', color: '#fff', borderColor: '#1a1917' }} onClick={() => { setConfirmExit(false); togglePause() }}>Rămâi în joc</button>
                  <button style={pillBtn} onClick={() => { window.speechSynthesis?.cancel(); onExit?.() }}>Ieși</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 18, fontWeight: 700 }}>⏸ Pauză</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ ...pillBtn, background: '#1a1917', color: '#fff', borderColor: '#1a1917' }} onClick={togglePause}>▶ Continuă</button>
                  <button style={pillBtn} onClick={start}>↻ Reia nivelul</button>
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
            <button onClick={start} style={pillBtn}>Reia</button>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, fontSize: 13, color: '#555' }}>
        <span style={festiveScore} className={scoreFlash ? 'pf-score-flash' : undefined}>🎉 Scor: {score}</span>
        <span>{cells.filter(c => c.filled).length} / {queueLen} pești</span>
      </div>

      <style>{`
        @keyframes pf-tail { 0% { transform: rotate(0) } 50% { transform: rotate(14deg) } 100% { transform: rotate(0) } }
        .pf-tail { transform-origin: 80px 25px; animation: pf-tail 650ms ease-in-out infinite; }
        @keyframes pf-away { 0% { opacity: 1; margin-left: 0 } 100% { opacity: 0; margin-left: 70px } }
        @keyframes pf-pop { 0% { transform: scale(.3); opacity: 0 } 70% { transform: scale(1.2); opacity: 1 } 100% { transform: scale(1); opacity: 1 } }
        .pf-cellfish { animation: pf-pop 350ms ease-out; }
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
        .pf-bubbles { position: absolute; left: 0; right: 0; bottom: 0; height: ${STAGE_H - SKY_H}px; pointer-events: none; }
        .pf-bubbles span { position: absolute; bottom: ${SAND_H}px; width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.7); animation: pf-bubble 3.6s linear infinite; }
        .pf-bubbles span:nth-child(1) { left: 22%; animation-delay: 0s; }
        .pf-bubbles span:nth-child(2) { left: 52%; width: 4px; height: 4px; animation-delay: 1.2s; }
        .pf-bubbles span:nth-child(3) { left: 82%; width: 6px; height: 6px; animation-delay: 2.3s; }
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
const aquariumStyle: React.CSSProperties = {
  position: 'absolute', right: 8, top: 10, padding: 6, borderRadius: 12,
  background: 'linear-gradient(180deg,#e3f5f3,#b6e0e8)',
  border: '3px solid rgba(255,255,255,.85)',
  boxShadow: 'inset 0 0 12px rgba(20,60,80,.3), 0 3px 4px rgba(0,0,0,.15)',
  zIndex: 2,
}
const festiveScore: React.CSSProperties = {
  fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", cursive, sans-serif',
  fontWeight: 800, fontSize: 20, letterSpacing: 0.3,
  background: 'linear-gradient(90deg, #ff8a3d, #ffb703, #ff8a3d)',
  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
}
