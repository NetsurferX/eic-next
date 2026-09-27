'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Konva from 'konva'
import confetti from 'canvas-confetti'

// ─────────────────────────────────────────────────────────────────────────
// PROTOTIP IZOLAT — nu atinge BuleleVulpiiGame.tsx (versiunea din producție,
// DOM + CSS) și nu e conectat la levels.ts / LEVELS.
//
// Actualizare: prima variantă folosea `react-konva` (Stage/Layer declarativ).
// Sub Turbopack (bundler-ul implicit Next 16) apărea o eroare de runtime —
// `Cannot read properties of undefined (reading 'ReactCurrentOwner')` — un
// bug confirmat, nerezolvat, în react-konva cu React 18.3.x
// (konvajs/react-konva#851; aceeași clasă de bug ca cea urmărită de echipa
// Next.js pentru react-three-fiber sub Turbopack). `--webpack` ca ocolire
// lovea altă problemă (konva cere pachetul Node `canvas`).
//
// Soluție: desenez direct cu `konva` (API imperativ — Stage/Layer/Shape
// create manual, actualizate prin mutații + layer.batchDraw()), FĂRĂ
// react-konva și fără react-reconciler. Tot Canvas, tot canvas-confetti,
// dar fără reconciler React care să intre în conflict cu Turbopack.
//
// Simplificat deliberat față de spec (e doar test de motor de randare):
//  - 4 grupuri demo proprii, nu Lesson-uri din levels.ts;
//  - fără nivel 2, fără vulpe/ajutor, fără dinți-cioburi desenate, fără
//    penalizare la apăsare greșită.
// ─────────────────────────────────────────────────────────────────────────

interface DemoGroup {
  id: string
  letter: string
  color: string
  word: string
}

const GROUPS: DemoGroup[] = [
  { id: 'ae', letter: 'æ', color: '#00A2E0', word: 'cat' },
  { id: 'aa', letter: 'a', color: '#008E40', word: 'car' },
  { id: 'ii', letter: 'i', color: '#FF3399', word: 'see' },
  { id: 'oo', letter: 'o', color: '#EE5B00', word: 'dog' },
]

const TOTAL_BALLOONS = 10
const STAGE_W = 460
const STAGE_H = 300
const TEETH_H = 30
const BALLOON_R = 28
const FLIGHT_MS = 4200

function buildQueue(): DemoGroup[] {
  const main = GROUPS[0]
  const rest = GROUPS.slice(1)
  const items: DemoGroup[] = []
  for (let i = 0; i < 6; i++) items.push(main)
  for (let i = 0; i < TOTAL_BALLOONS - 6; i++) items.push(rest[i % rest.length])
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

// dinți: zigzag pe toată lățimea scenei, ca fâșia din versiunea DOM
function teethPoints(w: number, h: number, teeth = 10): number[] {
  const pts: number[] = [0, 0]
  const step = w / teeth
  for (let i = 0; i <= teeth; i++) pts.push(i * step, i % 2 === 0 ? h : h * 0.45)
  pts.push(w, 0)
  return pts
}

type Phase = 'flying' | 'correct' | 'miss'

export default function BuleleVulpiiCanvasScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage | null>(null)
  const layerRef = useRef<Konva.Layer | null>(null)
  const balloonRef = useRef<Konva.Circle | null>(null)
  const labelRef = useRef<Konva.Text | null>(null)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef(0)

  const [queue, setQueue] = useState<DemoGroup[]>(() => buildQueue())
  const [pos, setPos] = useState(0)
  const [score, setScore] = useState(0)
  const [phase, setPhase] = useState<Phase>('flying')
  const [flashBtn, setFlashBtn] = useState<string | null>(null)
  const [wrongBtn, setWrongBtn] = useState<string | null>(null)

  const startY = STAGE_H - BALLOON_R - 8
  const topY = TEETH_H + BALLOON_R + 4
  const stageX = STAGE_W * 0.5

  const current = queue[pos]
  const done = pos >= queue.length

  // construiește scena Konva o singură dată
  useEffect(() => {
    if (!containerRef.current) return
    const stage = new Konva.Stage({ container: containerRef.current, width: STAGE_W, height: STAGE_H })
    const layer = new Konva.Layer()
    stage.add(layer)

    const bg = new Konva.Rect({ x: 0, y: 0, width: STAGE_W, height: STAGE_H, fill: '#eaf4fb' })
    const balloon = new Konva.Circle({
      x: stageX, y: startY, radius: BALLOON_R,
      fill: '#ffffff', stroke: '#cfe4f2', strokeWidth: 2,
      shadowColor: 'black', shadowOpacity: 0.15, shadowBlur: 6,
    })
    const label = new Konva.Text({
      x: stageX - BALLOON_R, y: startY - 12, width: BALLOON_R * 2, align: 'center',
      text: '', fontSize: 22, fontStyle: 'bold', fill: '#333',
    })
    const teeth = new Konva.Line({
      points: teethPoints(STAGE_W, TEETH_H), closed: true,
      fill: '#dcebf4', stroke: '#b7d3e4', strokeWidth: 1,
    })

    layer.add(bg, balloon, label, teeth)
    layer.draw()

    stageRef.current = stage
    layerRef.current = layer
    balloonRef.current = balloon
    labelRef.current = label

    return () => { stage.destroy() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // sincronizează litera/culoarea balonului cu grupul curent din coadă
  useEffect(() => {
    const label = labelRef.current
    if (label && current) {
      label.text(current.letter)
      label.fill(current.color)
      layerRef.current?.batchDraw()
    }
  }, [current])

  const fireConfetti = useCallback((color: string, miss = false) => {
    const rect = containerRef.current?.getBoundingClientRect()
    const originX = rect ? (rect.left + rect.width * 0.5) / window.innerWidth : 0.5
    const originY = rect ? (rect.top + rect.height * 0.35) / window.innerHeight : 0.3
    confetti({
      particleCount: miss ? 14 : 40,
      spread: miss ? 50 : 70,
      startVelocity: miss ? 18 : 32,
      gravity: miss ? 1.4 : 1,
      scalar: miss ? 0.6 : 0.9,
      colors: miss ? ['#c9c9c9', '#ffffff', '#9aa0a6'] : [color, '#ffffff', '#ffd166'],
      origin: { x: originX, y: originY },
    })
  }, [])

  function next() {
    setPos(p => p + 1)
    setPhase('flying')
  }

  // buclă de zbor a balonului curent
  useEffect(() => {
    if (done || phase !== 'flying') return
    const balloon = balloonRef.current
    const label = labelRef.current
    if (balloon) { balloon.y(startY); balloon.scale({ x: 1, y: 1 }); balloon.opacity(1) }
    if (label) { label.y(startY - 12); label.opacity(1) }
    layerRef.current?.batchDraw()

    startRef.current = performance.now()
    const tick = (t: number) => {
      const elapsed = t - startRef.current
      const progress = Math.min(1, elapsed / FLIGHT_MS)
      const y = startY - progress * (startY - topY)
      if (balloon) balloon.y(y)
      if (label) label.y(y - 12)
      layerRef.current?.batchDraw()
      if (progress >= 1) {
        setPhase('miss')
        fireConfetti('#ccc', true)
        window.setTimeout(next, 550)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, phase, done])

  // efect vizual (mărire la 'correct', dispariție la 'miss') aplicat direct pe shape-uri
  useEffect(() => {
    const balloon = balloonRef.current
    const label = labelRef.current
    if (!balloon || !label) return
    const scale = phase === 'correct' ? 1.3 : 1
    balloon.scale({ x: scale, y: scale })
    const opacity = phase === 'miss' ? 0 : 1
    balloon.opacity(opacity)
    label.opacity(opacity)
    layerRef.current?.batchDraw()
  }, [phase])

  function handlePress(group: DemoGroup) {
    if (done || phase !== 'flying' || !current) return
    if (group.id === current.id) {
      setPhase('correct')
      setFlashBtn(group.id)
      setScore(s => s + 1)
      fireConfetti(group.color)
      window.setTimeout(() => { setFlashBtn(null); next() }, 420)
    } else {
      setWrongBtn(group.id)
      window.setTimeout(() => setWrongBtn(null), 220)
    }
  }

  function restart() {
    setQueue(buildQueue())
    setPos(0)
    setScore(0)
    setPhase('flying')
  }

  return (
    <div>
      <div
        ref={containerRef}
        style={{ width: STAGE_W, height: STAGE_H, margin: '0 auto', borderRadius: 16, overflow: 'hidden' }}
      />

      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14 }}>
        {GROUPS.map(g => (
          <button
            key={g.id}
            onClick={() => handlePress(g)}
            disabled={done}
            style={{
              width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: done ? 'default' : 'pointer',
              background: g.color,
              boxShadow:
                flashBtn === g.id ? '0 0 0 5px rgba(0,0,0,.18)'
                  : wrongBtn === g.id ? '0 0 0 4px rgba(224,49,49,.4)'
                    : '0 1px 3px rgba(0,0,0,.15)',
              transition: 'box-shadow 150ms',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: g.color }}>
              {g.letter}
            </span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 13, color: '#555' }}>
        <span>🎉 Scor: {score}</span>
        <span>Balon {Math.min(pos + 1, queue.length)}/{queue.length}</span>
      </div>

      {done && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Gata — scor {score}/{queue.length}</div>
          <button
            onClick={restart}
            style={{ border: '1px solid #e8e6e1', background: '#f8f7f4', borderRadius: 999, padding: '6px 14px', fontSize: 12.5, cursor: 'pointer' }}
          >
            ↻ Reia
          </button>
        </div>
      )}
    </div>
  )
}
