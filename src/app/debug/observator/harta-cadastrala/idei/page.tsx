'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  LEVELS,
  STORAGE_KEY,
  REPS_PER_LESSON,
  type Lesson,
  type LessonWord,
  type Accent,
} from '@/lib/levels'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT: Satul Sunetelor (The Sound Village)
//
// Pentru copii (nu e unealtă de dezvoltator ca /debug/observator).
// Același limbaj vizual ca "Sătucul cadastral" (parcele cu hotare comune,
// drumuri curbate), dar datele sunt LEVELS din lib/levels.ts:
//   - fiecare LECȚIE = o casă; acoperișul are culoarea reală a sunetului
//     (lesson.color, aceeași sursă ca /learn) și litera sunetului;
//   - fiecare NIVEL = un rând de case, cu gard comun între ele
//     (lecțiile aceluiași nivel sunt vecine de hotar);
//   - o ulită are două rânduri (nivelurile 1+2, 3+4, …), spate în spate;
//   - lecție terminată = ferestre aprinse + stea; lecția curentă = vulpița
//     stă în fața casei; lecțiile următoare = casă „cu lacăt”, litera e „?”.
//
// Progresul e CITIT (read-only) din localStorage[STORAGE_KEY], cu aceeași
// regulă ca /learn (starsEarned >= REPS_PER_LESSON). Dacă nu există progres
// real, un slider simulează cât de departe a ajuns copilul.
// VULPIȚA nu „teleportează”: când lecția curentă se schimbă, merge pe
// drumuri (casă → uliță → drumul mare → uliță → casă), lent, cu aceeași
// idee ca la /debug/observator/harta-cadastrala/idei/trafic-in-sat.
// NU scrie nimic în localStorage; NU atinge levels.ts, /learn, gameTypes.ts,
// ColourGame.tsx sau motorul. Wireframe de concept — nelegat de GameSession.
// ─────────────────────────────────────────────────────────────────────────

/* ---------- date plate din LEVELS ---------- */

interface FlatLesson {
  flat: number
  li: number
  ci: number
  lesson: Lesson
}
const FLAT: FlatLesson[] = []
LEVELS.forEach((lvl, li) =>
  lvl.lessons.forEach((lesson, ci) => FLAT.push({ flat: FLAT.length, li, ci, lesson }))
)
const FLAT_INDEX = new Map(FLAT.map((f) => [`${f.li}:${f.ci}`, f.flat]))

/* ---------- geometrie sat ---------- */

const D = 60 // adâncimea parcelei
const R = 9 // jumătate din lățimea ulitei
const S = 2 * (R + D) // rândurile a două ulițe vecine se ating cu spatele
const HW = 62 // lățimea unei parcele (frontul la drum)
const MT = 44 // sus: loc pentru „Poarta satului”
const MAIN_X = 26
const MAIN_W = 24
const X0 = MAIN_X + MAIN_W / 2 // parcelele încep exact la marginea drumului mare
const X_LABEL = X0 + 4 * HW + 10
const WIDTH = X_LABEL + 138
const ROAD_FILL = '#e3d9bb'
const ROAD_EDGE = '#b3a680'
const FENCE = '#8a7a5c'
const N_STREETS = Math.ceil(LEVELS.length / 2)
const HEIGHT = MT + N_STREETS * S + 26

function warp(x: number, y: number): [number, number] {
  return [x + 5 * Math.sin(y / 100), y + 6 * Math.sin(x / 130)]
}
const pts = (a: [number, number][]) => a.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
function roadPath(x1: number, y1: number, x2: number, y2: number): string {
  const n = Math.max(2, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 8))
  const out: string[] = []
  for (let i = 0; i <= n; i++) {
    const [x, y] = warp(x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n)
    out.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return out.join(' ')
}
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

interface House {
  flat: number
  poly: string
  cx: number // centru înainte de warp (casa se desenează în coordonate brute)
  cy: number
  ox: number // deplasarea warp-ului la centru
  oy: number
  wx: number // centru după warp (vulpiță, contur)
  wy: number
}
interface Row {
  li: number
  labelX: number
  labelY: number
}

const HOUSES: House[] = []
const ROWS: Row[] = []
const STREET_Y: number[] = []

;(() => {
  for (let j = 0; j < N_STREETS; j++) STREET_Y.push(MT + R + D + j * S)
  LEVELS.forEach((lvl, li) => {
    const j = Math.floor(li / 2)
    const top = li % 2 === 0
    const ys = STREET_Y[j]
    const s = top ? -1 : 1
    const front = ys + s * R
    const rear = ys + s * (R + D)
    const n = lvl.lessons.length
    const jit = Array.from({ length: n + 1 }, (_, i) =>
      i === 0 || i === n ? 0 : ((hash(`${li}:${i}`) % 9) - 4) * 1.5
    )
    lvl.lessons.forEach((_, ci) => {
      const xa = X0 + ci * HW
      const xb = xa + HW
      const cx = (xa + xb) / 2
      const cy = (front + rear) / 2
      const [wx, wy] = warp(cx, cy)
      HOUSES.push({
        flat: FLAT_INDEX.get(`${li}:${ci}`) ?? 0,
        poly: pts([warp(xa, front), warp(xb, front), warp(xb + jit[ci + 1], rear), warp(xa + jit[ci], rear)]),
        cx,
        cy,
        ox: wx - cx,
        oy: wy - cy,
        wx,
        wy,
      })
    })
    const [lx, ly] = warp(X_LABEL, (front + rear) / 2)
    ROWS.push({ li, labelX: lx, labelY: ly })
  })
})()

/* ---------- drumul vulpiței (pe drumuri reale) ---------- */

const HOUSE_STREET = (flat: number) => {
  const f = FLAT[flat]
  return Math.floor(f.li / 2)
}
const HOUSE_X = new Map(HOUSES.map((h) => [h.flat, h.cx]))

interface FoxRoad {
  pts: [number, number][]
  cum: number[]
  total: number
}

function streetPoint(flat: number): [number, number] {
  return warp(HOUSE_X.get(flat) ?? X0, STREET_Y[HOUSE_STREET(flat)])
}

function foxRoad(a: number, b: number): FoxRoad {
  const ja = HOUSE_STREET(a)
  const jb = HOUSE_STREET(b)
  const xa = HOUSE_X.get(a) ?? X0
  const xb = HOUSE_X.get(b) ?? X0
  const raw: [number, number][] = [[xa, STREET_Y[ja]]]
  if (ja !== jb) raw.push([MAIN_X, STREET_Y[ja]], [MAIN_X, STREET_Y[jb]])
  raw.push([xb, STREET_Y[jb]])
  const out: [number, number][] = []
  for (let i = 0; i < raw.length - 1; i++) {
    const [x1, y1] = raw[i]
    const [x2, y2] = raw[i + 1]
    const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 5))
    for (let k = i === 0 ? 0 : 1; k <= n; k++) out.push(warp(x1 + ((x2 - x1) * k) / n, y1 + ((y2 - y1) * k) / n))
  }
  const cum: number[] = [0]
  for (let i = 1; i < out.length; i++) cum.push(cum[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]))
  return { pts: out, cum, total: cum[cum.length - 1] ?? 0 }
}

function foxAt(r: FoxRoad, d: number): { x: number; y: number; dx: number } {
  const { pts: P, cum } = r
  if (P.length === 0) return { x: 0, y: 0, dx: 1 }
  let i = 1
  while (i < P.length - 1 && cum[i] < d) i++
  const a = P[i - 1] ?? P[0]
  const b = P[i] ?? P[0]
  const seg = (cum[i] ?? 0) - (cum[i - 1] ?? 0) || 1
  const t = Math.max(0, Math.min(1, (d - (cum[i - 1] ?? 0)) / seg))
  return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, dx: b[0] - a[0] }
}

const FOX_SPEED = 70 // unități viewBox / s — lent, ca să se vadă drumul
const FOX_MAX_S = 6 // drumurile foarte lungi nu durează mai mult de atât

/* ---------- casă (văzută din față), în coordonate centrate ---------- */

type State = 'done' | 'current' | 'locked'

function HouseIcon({ color, letter, state }: { color: string; letter: string; state: State }) {
  const locked = state === 'locked'
  const roof = locked ? '#b9b9b9' : color
  const wall = locked ? '#e4e4e4' : '#fff8e6'
  const lit = state === 'done' ? '#ffd84a' : state === 'current' ? '#ffe9a0' : '#9a9a9a'
  const ink = '#4a3b22'
  const shown = locked ? '?' : letter
  const fs = shown.length > 3 ? 7.5 : shown.length > 2 ? 9 : shown.length > 1 ? 11 : 14
  return (
    <g>
      {state === 'done' && (
        <>
          <rect x={9} y={-24} width={5} height={10} fill="#b5654a" stroke={ink} strokeWidth={0.8} />
          <circle cx={11.5} cy={-28} r={2.6} fill="#ffffff" opacity={0.75}>
            <animate attributeName="cy" values="-28;-36" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.75;0" dur="2.6s" repeatCount="indefinite" />
          </circle>
        </>
      )}
      <rect x={-17} y={-6} width={34} height={22} rx={1.5} fill={wall} stroke={ink} strokeWidth={1.1} />
      <polygon points="-22,-6 0,-25 22,-6" fill={roof} stroke={ink} strokeWidth={1.2} strokeLinejoin="round" />
      <text
        x={0}
        y={-11}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fs}
        fontWeight={700}
        fill="#fff"
        stroke="rgba(0,0,0,0.45)"
        strokeWidth={2.2}
        paintOrder="stroke"
        style={{ pointerEvents: 'none' }}
      >
        {shown}
      </text>
      <rect x={-14} y={-1} width={8} height={7} rx={1} fill={lit} stroke={ink} strokeWidth={0.8} />
      <rect x={6} y={-1} width={8} height={7} rx={1} fill={lit} stroke={ink} strokeWidth={0.8} />
      <rect
        x={-4}
        y={5}
        width={8}
        height={11}
        rx={1}
        fill={state === 'current' ? '#3b2f1c' : '#8a5a34'}
        stroke={ink}
        strokeWidth={0.9}
      />
      {locked && (
        <text x={0} y={11.5} textAnchor="middle" dominantBaseline="central" fontSize={7} style={{ pointerEvents: 'none' }}>
          🔒
        </text>
      )}
      {state === 'done' && (
        <text x={-19} y={-20} fontSize={9} style={{ pointerEvents: 'none' }}>
          ⭐
        </text>
      )}
    </g>
  )
}

/* ---------- cuvânt cu partea-sunet colorată + vorbire ---------- */

function MarkedWord({ w, color }: { w: LessonWord; color: string }) {
  const i = w.text.indexOf(w.mark)
  if (i < 0) return <>{w.text}</>
  return (
    <>
      {w.text.slice(0, i)}
      <span style={{ color, fontWeight: 700 }}>{w.mark}</span>
      {w.text.slice(i + w.mark.length)}
    </>
  )
}

function speak(text: string, accent: Accent) {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = accent === 'en-GB' ? 'en-GB' : 'en-US'
    u.rate = 0.85
    window.speechSynthesis.speak(u)
  } catch {
    /* ignore */
  }
}

/* ---------- pagina ---------- */

export default function SatulSunetelorConcept() {
  const [realStars, setRealStars] = useState<number[][] | null>(null)
  const [useReal, setUseReal] = useState(true)
  const [simCount, setSimCount] = useState(6)
  const [sel, setSel] = useState<number | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Citire read-only a progresului real (aceeași cheie ca /learn).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as { starsEarned?: unknown }
        if (Array.isArray(saved.starsEarned)) setRealStars(saved.starsEarned as number[][])
      }
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [])

  const usingReal = realStars !== null && useReal

  const done: boolean[] = useMemo(() => {
    if (usingReal && realStars) {
      return FLAT.map((f) => (realStars[f.li]?.[f.ci] ?? 0) >= REPS_PER_LESSON)
    }
    return FLAT.map((f) => f.flat < simCount)
  }, [usingReal, realStars, simCount])

  const current = done.findIndex((d) => !d) // -1 dacă totul e terminat
  const doneCount = done.filter(Boolean).length
  const stateOf = (flat: number): State => (done[flat] ? 'done' : flat === current ? 'current' : 'locked')

  const levelDone = (li: number) => LEVELS[li].lessons.every((_, ci) => done[FLAT_INDEX.get(`${li}:${ci}`) ?? 0])
  const levelsDone = LEVELS.filter((_, li) => levelDone(li)).length

  const selIdx = sel ?? (current >= 0 ? current : 0)
  const selFlat = FLAT[selIdx]
  const selState = stateOf(selIdx)
  const foxTarget = current >= 0 ? current : FLAT.length - 1

  // --- vulpița merge pe drumuri până la casa curentă ---
  const foxRef = useRef<SVGGElement | null>(null)
  const flipRef = useRef<SVGGElement | null>(null)
  const foxAtRef = useRef<number | null>(null) // casa la care a ajuns ultima dată
  const [walking, setWalking] = useState(false)

  const setFoxXY = (x: number, y: number, dx = 1, bob = 0) => {
    foxRef.current?.setAttribute('transform', `translate(${x.toFixed(1)} ${(y + bob).toFixed(1)})`)
    flipRef.current?.setAttribute('transform', `scale(${dx < 0 ? -1 : 1} 1)`)
  }

  useEffect(() => {
    // așteptăm citirea progresului real, ca vulpița să nu pornească de la valoarea simulată
    if (!hydrated) return
    // primul afișaj: direct la casă, fără plimbare
    if (foxAtRef.current === null) {
      const [x, y] = streetPoint(foxTarget)
      setFoxXY(x, y)
      foxAtRef.current = foxTarget
      return
    }
    if (foxAtRef.current === foxTarget) return
    let raf = 0
    // așteaptă o clipă (slider tras încoace și încolo nu trebuie să pornească zeci de drumuri)
    const timer = window.setTimeout(() => {
      const from = foxAtRef.current as number
      const road = foxRoad(from, foxTarget)
      const speed = Math.max(FOX_SPEED, road.total / FOX_MAX_S)
      let dist = 0
      let last = performance.now()
      setWalking(true)
      const step = (t: number) => {
        const dt = Math.min(0.05, (t - last) / 1000)
        last = t
        dist = Math.min(road.total, dist + speed * dt)
        const p = foxAt(road, dist)
        setFoxXY(p.x, p.y, p.dx, Math.abs(Math.sin(dist / 4)) * -2.2)
        if (dist < road.total) {
          raf = requestAnimationFrame(step)
        } else {
          foxAtRef.current = foxTarget
          setWalking(false)
        }
      }
      raf = requestAnimationFrame(step)
    }, 350)
    return () => {
      window.clearTimeout(timer)
      cancelAnimationFrame(raf)
      // întrerupt: se așază instant la ultima casă cunoscută, ca să nu rămână între drumuri
      setWalking(false)
      const at = foxAtRef.current
      if (at !== null) {
        const [x, y] = streetPoint(at)
        setFoxXY(x, y)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foxTarget, hydrated])

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '1rem 1rem 3rem' }}>
      <Link href="/debug/gamification" style={{ fontSize: '0.85rem', color: '#2F5D8A' }}>
        ← Toate conceptele
      </Link>

      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: '0.5rem 0 0.2rem' }}>
        🏡 Satul Sunetelor
      </h1>
      <p style={{ opacity: 0.75, fontSize: '0.9rem', margin: '0 0 0.8rem', maxWidth: 680 }}>
        Fiecare lecție e o casă, cu acoperișul în culoarea sunetului. Lecțiile unui nivel sunt vecine de
        gard; două niveluri stau spate în spate pe aceeași uliță. Terminezi o lecție și se aprind
        ferestrele; vulpița stă în fața casei la care ai ajuns.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.8rem 1.2rem',
          alignItems: 'center',
          marginBottom: '0.8rem',
          fontSize: '0.85rem',
        }}
      >
        <span>
          <strong>{doneCount}</strong>/{FLAT.length} sunete · <strong>{levelsDone}</strong>/{LEVELS.length}{' '}
          niveluri
        </span>
        <span
          style={{ flex: '1 1 140px', height: 8, borderRadius: 4, background: '#e6e2d3', overflow: 'hidden', minWidth: 120 }}
        >
          <span
            style={{
              display: 'block',
              height: '100%',
              width: `${(doneCount / FLAT.length) * 100}%`,
              background: '#5fbf6a',
              transition: 'width 0.4s',
            }}
          />
        </span>
        {realStars !== null && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <input type="checkbox" checked={useReal} onChange={(e) => setUseReal(e.target.checked)} />
            progresul meu real
          </label>
        )}
        {!usingReal && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            simulează: {simCount} lecții
            <input
              type="range"
              min={0}
              max={FLAT.length}
              value={simCount}
              onChange={(e) => setSimCount(Number(e.target.value))}
            />
          </label>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', alignItems: 'flex-start' }}>
        <div
          style={{
            flex: '1 1 400px',
            minWidth: 0,
            border: '1.5px solid var(--color-border)',
            borderRadius: 12,
            overflow: 'hidden',
            background: '#efe9d3',
          }}
        >
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            role="img"
            aria-label="Satul Sunetelor: o casă pentru fiecare lecție"
          >
            {/* drumuri */}
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d={roadPath(MAIN_X, 4, MAIN_X, HEIGHT - 6)} stroke={ROAD_EDGE} strokeWidth={MAIN_W + 2} />
              {STREET_Y.map((y, j) => (
                <path key={`e${j}`} d={roadPath(MAIN_X, y, X0 + 4 * HW + 4, y)} stroke={ROAD_EDGE} strokeWidth={2 * R + 2} />
              ))}
              <path d={roadPath(MAIN_X, 4, MAIN_X, HEIGHT - 6)} stroke={ROAD_FILL} strokeWidth={MAIN_W - 1} />
              {STREET_Y.map((y, j) => (
                <path key={`f${j}`} d={roadPath(MAIN_X, y, X0 + 4 * HW + 4, y)} stroke={ROAD_FILL} strokeWidth={2 * R - 1} />
              ))}
              <path
                d={roadPath(MAIN_X, 4, MAIN_X, HEIGHT - 6)}
                stroke="#f7f2e2"
                strokeWidth={1.4}
                strokeDasharray="9 7"
                strokeLinecap="butt"
              />
              {STREET_Y.map((y, j) => (
                <path
                  key={`m${j}`}
                  d={roadPath(MAIN_X + MAIN_W / 2, y, X0 + 4 * HW, y)}
                  stroke="#f7f2e2"
                  strokeWidth={1.1}
                  strokeDasharray="7 6"
                  strokeLinecap="butt"
                />
              ))}
            </g>

            <text x={warp(MAIN_X, 20)[0] + 20} y={warp(MAIN_X, 20)[1]} fontSize={10} fill="#6d6248" style={{ fontFamily: 'var(--font-serif)' }}>
              ⬇ Poarta satului — aici începe drumul
            </text>

            {/* parcele + case */}
            {HOUSES.map((h) => {
              const f = FLAT[h.flat]
              const st = stateOf(h.flat)
              const isSel = h.flat === selIdx
              return (
                <g key={h.flat} onClick={() => setSel(h.flat)} style={{ cursor: 'pointer' }}>
                  <title>{`${f.lesson.letter} — ${LEVELS[f.li].name}`}</title>
                  <polygon
                    points={h.poly}
                    fill={st === 'locked' ? '#e0e3d2' : st === 'done' ? '#dcebc0' : '#f3e7b0'}
                    stroke={FENCE}
                    strokeWidth={1.2}
                    strokeLinejoin="round"
                  />
                  <g transform={`translate(${(h.cx + h.ox).toFixed(1)} ${(h.cy + h.oy + 2).toFixed(1)})`}>
                    {st === 'current' ? (
                      <g>
                        <animateTransform
                          attributeName="transform"
                          type="translate"
                          values="0 0; 0 -3; 0 0"
                          dur="1.2s"
                          repeatCount="indefinite"
                        />
                        <HouseIcon color={f.lesson.color} letter={f.lesson.letter} state={st} />
                      </g>
                    ) : (
                      <HouseIcon color={f.lesson.color} letter={f.lesson.letter} state={st} />
                    )}
                  </g>
                  {isSel && (
                    <polygon
                      points={h.poly}
                      fill="none"
                      stroke="#2F5D8A"
                      strokeWidth={3}
                      strokeLinejoin="round"
                      style={{ pointerEvents: 'none' }}
                    />
                  )}
                </g>
              )
            })}

            {/* vulpița: stă pe drum în fața casei curente și merge pe drumuri când se schimbă */}
            <g ref={foxRef} style={{ pointerEvents: 'none' }}>
              <g ref={flipRef}>
                <image href="/mascot/fox-idle.png" x={-13} y={-24} width={28} height={28} preserveAspectRatio="xMidYMid meet" />
              </g>
              {!walking && (
                <text x={0} y={-27} textAnchor="middle" fontSize={8} fontWeight={700} fill="#b8611a" stroke="#efe9d3" strokeWidth={2.4} paintOrder="stroke">
                  {current >= 0 ? 'tu ești aici' : 'satul e gata!'}
                </text>
              )}
            </g>

            {/* etichete de nivel */}
            {ROWS.map((r) => {
              const [num, ...rest] = LEVELS[r.li].name.split(' · ')
              return (
                <g key={r.li} style={{ pointerEvents: 'none' }}>
                  <text x={r.labelX} y={r.labelY - 3} fontSize={10} fontWeight={700} fill="#4a4030">
                    {levelDone(r.li) ? '✅ ' : ''}
                    {num}
                  </text>
                  <text x={r.labelX} y={r.labelY + 9} fontSize={8.5} fill="#6d6248">
                    {rest.join(' · ')}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <aside
          style={{
            flex: '1 1 280px',
            border: '1.5px solid var(--color-border)',
            borderRadius: 12,
            padding: '1rem 1.1rem',
            position: 'sticky',
            top: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 14,
                background: selState === 'locked' ? '#b9b9b9' : selFlat.lesson.color,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: selFlat.lesson.letter.length > 2 ? '1.1rem' : '1.7rem',
                fontWeight: 700,
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              }}
            >
              {selState === 'locked' ? '?' : selFlat.lesson.letter}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem' }}>
                {selState === 'locked' ? 'Casă încuiată' : `Casa sunetului ${selFlat.lesson.letter}`}
              </div>
              <div style={{ fontSize: '0.78rem', opacity: 0.7 }}>
                {LEVELS[selFlat.li].name}
                {selState !== 'locked' && ` · ${selFlat.lesson.tabLabel}`}
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', margin: '0.8rem 0 0.4rem' }}>
            {selState === 'done' && '⭐ Terminată — ferestrele sunt aprinse.'}
            {selState === 'current' && '🦊 Aici ai ajuns. Bate la ușă și învață sunetul!'}
            {selState === 'locked' && '🔒 Termină casele dinaintea ei ca să afli ce sunet locuiește aici.'}
          </p>

          {selState !== 'locked' && (
            <>
              <p style={{ margin: '0.6rem 0 0.3rem', fontSize: '0.78rem', opacity: 0.65 }}>Apasă un cuvânt ca să-l auzi:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {selFlat.lesson.words.map((w) => (
                  <button
                    key={w.text}
                    onClick={() => speak(w.text, w.accent ?? selFlat.lesson.accent ?? 'en-US')}
                    style={{
                      padding: '0.3rem 0.7rem',
                      borderRadius: 999,
                      border: '1.5px solid var(--color-border)',
                      background: '#fff',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                    }}
                  >
                    🔊 <MarkedWord w={w} color={selFlat.lesson.color} />
                  </button>
                ))}
              </div>
            </>
          )}

          {selState === 'current' && (
            <Link
              href="/learn"
              style={{
                display: 'inline-block',
                marginTop: '0.9rem',
                padding: '0.45rem 1rem',
                borderRadius: 999,
                background: '#2F5D8A',
                color: '#fff',
                fontSize: '0.88rem',
                textDecoration: 'none',
              }}
            >
              Mergi la lecție →
            </Link>
          )}

          <p style={{ fontSize: '0.72rem', opacity: 0.55, margin: '1rem 0 0' }}>
            {usingReal ? 'Progres citit din browser (doar citire).' : 'Progres simulat cu sliderul.'} Aici
            „terminat” = {REPS_PER_LESSON} stele, ca în /learn.
          </p>
        </aside>
      </div>
    </div>
  )
}
