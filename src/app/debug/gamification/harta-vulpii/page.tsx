'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MascotV2 } from '@/components/game/MascotV2'
import { LEVELS } from '@/lib/levels'

// Harta Vulpii — traseu cu toate sunetele din LEVELS; vulpea (MascotV2)
// aleargă de la un sunet la următorul, iar sunetul terminat primește o stea.
// Progresul e SIMULAT local (nu citește/scrie STORAGE_KEY). Pagină nouă,
// independentă de `harta-sunetelor` (wireframe) — nu modifică nimic existent.

interface Node {
  key: string
  letter: string
  color: string
  level: number
  x: number // %
  y: number // %
}

const ROW_H = 86
const PAD_TOP = 90

// serpuiește: nivelurile pe rânduri, direcția alternează
const NODES: Node[] = LEVELS.flatMap((lv, li) => {
  const n = lv.lessons.length
  const ltr = li % 2 === 0
  return lv.lessons.map((ls, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1)
    const frac = ltr ? t : 1 - t
    return {
      key: `${lv.id}-${ls.id}`,
      letter: ls.letter,
      color: ls.color,
      level: li,
      x: 12 + frac * 76,
      y: PAD_TOP + li * ROW_H,
    }
  })
})

const HEIGHT = PAD_TOP * 2 + (LEVELS.length - 1) * ROW_H

export default function HartaVulpiiPage() {
  const [pos, setPos] = useState(0) // indexul nodului unde stă vulpea
  const [done, setDone] = useState<number>(0) // câte sunete sunt terminate
  const [phase, setPhase] = useState<'idle' | 'running' | 'celebrate'>('idle')
  const [flip, setFlip] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const t = timers.current
    return () => t.forEach(clearTimeout)
  }, [])

  function advance() {
    if (phase !== 'idle' || pos >= NODES.length - 1) return
    const from = NODES[pos]
    const to = NODES[pos + 1]
    setFlip(to.x < from.x)
    setDone(d => Math.max(d, pos + 1))
    setPhase('running')
    setPos(pos + 1)
    timers.current.push(
      window.setTimeout(() => {
        setPhase('celebrate')
        timers.current.push(window.setTimeout(() => setPhase('idle'), 1300))
      }, 1100),
    )
  }

  function reset() {
    timers.current.forEach(clearTimeout)
    setPos(0); setDone(0); setPhase('idle'); setFlip(false)
  }

  const cur = NODES[pos]
  const points = NODES.map(n => `${n.x},${n.y}`).join(' ')

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/debug/gamification">← Index gamificare</Link>
      <h1 style={{ fontSize: 22, margin: '12px 0 4px' }}>Harta Vulpii</h1>
      <p style={{ fontSize: 13, opacity: 0.75, margin: '0 0 12px' }}>
        {done} / {NODES.length - 1} sunete parcurse · progres simulat
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={advance}
          disabled={phase !== 'idle' || pos >= NODES.length - 1}
          style={{ padding: '8px 14px', borderRadius: 999, border: '2px solid #e67e22', background: '#fff3e6', cursor: 'pointer', fontWeight: 700 }}
        >
          Sunetul următor →
        </button>
        <button onClick={reset} style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid #bbb', background: '#fff', cursor: 'pointer' }}>
          De la început
        </button>
      </div>

      <div style={{ position: 'relative', height: HEIGHT, background: 'linear-gradient(#eaf4fb,#f7fbfd)', borderRadius: 12, overflow: 'hidden' }}>
        <svg viewBox={`0 0 100 ${HEIGHT}`} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <polyline points={points} fill="none" stroke="#c9d8e6" strokeWidth={1.2} strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        </svg>

        {NODES.map((n, i) => {
          const reached = i <= pos
          return (
            <div
              key={n.key}
              style={{
                position: 'absolute', left: `${n.x}%`, top: n.y, transform: 'translate(-50%, -50%)',
                width: 40, height: 40, borderRadius: '50%', background: n.color,
                border: '3px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 15,
                opacity: reached ? 1 : 0.4,
              }}
            >
              {n.letter}
              {i < pos && (
                <span style={{ position: 'absolute', top: -14, right: -10, fontSize: 16 }}>⭐</span>
              )}
            </div>
          )
        })}

        {/* vulpea — se mută cu tranziție; oglindită când merge spre stânga */}
        <div
          style={{
            position: 'absolute', left: `${cur.x}%`, top: cur.y,
            transform: 'translate(-50%, -88%)',
            transition: 'left 1100ms linear, top 1100ms linear',
            pointerEvents: 'none',
          }}
        >
          <div style={{ transform: phase === 'running' && flip ? 'scaleX(-1)' : undefined }}>
            <MascotV2
              size={72}
              state="idle"
              action={phase === 'running' ? 'walking' : phase === 'celebrate' ? 'celebrating' : undefined}
            />
          </div>
        </div>
      </div>

      <p style={{ fontSize: 12, opacity: 0.65 }}>
        Sunetele vin din <code>LEVELS</code> ({LEVELS.length} niveluri).
      </p>
    </main>
  )
}
