'use client'

import { useRef, useState } from 'react'
import { Fox, Shadow, Stage, Shell, POSE, REST, btn, usePreload, useRaf, useReducedMotion, type FoxFrame } from '../_anim'

// Sărbătoarea: la „Corect” — sărituri de bucurie cu aterizări elastice și
// explozii de stele/confetti cu gravitație. La „Aproape” — înclină capul,
// apoi arată spre ecran, cu un balon de încurajare. Pur vizual, fără scor.

const SIZE = 220
const COLORS = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#e67e22']
type Part = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; life: number; max: number; star: boolean; color: string; sz: number }
type Mode = 'idle' | 'cheer' | 'oops'

export default function Page() {
  usePreload()
  const reduced = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const s = useRef({ mode: 'idle' as Mode, t: 0, parts: [] as Part[], burst2: false, w: 600 })
  const [f, setF] = useState<FoxFrame>(REST)
  const [parts, setParts] = useState<Part[]>([])
  const [bubble, setBubble] = useState(false)

  const burst = (n: number) => {
    const o = s.current
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 220 + Math.random() * 320, star = i % 3 === 0
      o.parts.push({
        x: o.w / 2, y: 70 + SIZE * 0.7, vx: Math.cos(a) * v, vy: Math.abs(Math.sin(a)) * v + 120,
        rot: Math.random() * 360, vr: (Math.random() - 0.5) * 720, life: 0, max: 1.6 + Math.random() * 0.8,
        star, color: COLORS[i % COLORS.length], sz: star ? 20 + Math.random() * 12 : 8,
      })
    }
  }
  const start = (m: Mode) => {
    const o = s.current
    o.mode = m; o.t = 0; o.burst2 = false
    if (m === 'cheer') burst(34)
  }

  useRaf((_t, dt) => {
    const o = s.current
    o.w = stageRef.current?.clientWidth ?? 600
    const base: FoxFrame = { ...REST, x: o.w / 2 }
    let fr: FoxFrame = { ...base, sy: 1 + 0.012 * Math.sin(_t * 3) }
    let showBubble = false
    if (o.mode !== 'idle') o.t += dt
    const t = o.t
    if (o.mode === 'cheer') {
      const period = 0.42
      const ph = (t % period) / period
      const y = 38 * Math.abs(Math.sin(ph * Math.PI))
      const land = 1 - Math.min(1, y / 6)
      fr = { ...base, src: t < 1.6 ? POSE.cheer : POSE.celebrate, y, sy: 1 + 0.06 * (y / 38) - 0.12 * land, sx: 1 - 0.03 * (y / 38) + 0.08 * land, rot: Math.sin(t * 14) * 2 }
      if (t > 0.9 && !o.burst2) { o.burst2 = true; burst(18) }
      if (t > 2.6) o.mode = 'idle'
    } else if (o.mode === 'oops') {
      if (t < 0.9) fr = { ...base, src: POSE.front, rot: Math.sin(t * 9) * 6 * Math.exp(-t * 1.2) }
      else { fr = { ...base, src: POSE.point, y: Math.abs(Math.sin((t - 0.9) * 6)) * 6 }; showBubble = true }
      if (t > 2.6) o.mode = 'idle'
    }
    o.parts = o.parts
      .map((p) => ({ ...p, x: p.x + p.vx * dt, y: p.y + p.vy * dt, vy: p.vy - 900 * dt, vx: p.vx * (1 - 0.8 * dt), rot: p.rot + p.vr * dt, life: p.life + dt }))
      .filter((p) => p.life < p.max && p.y > -20)
    setBubble(showBubble)
    setF(fr)
    setParts(o.parts)
  }, reduced)

  return (
    <Shell title="🎉 Sărbătoarea" desc="Cele două reacții ale vulpii la un răspuns. Apasă butoanele.">
      <Stage stageRef={stageRef}>
        <Shadow x={f.x} size={SIZE} k={1 - f.y / 120} />
        <Fox f={f} size={SIZE} />
        {bubble && (
          <div style={{ position: 'absolute', left: f.x + 70, bottom: 250, background: '#fff', padding: '8px 12px', borderRadius: 14, fontSize: 14, boxShadow: '0 2px 8px rgba(0,0,0,.15)', zIndex: 4 }}>
            Aproape! Mai încearcă 💪
          </div>
        )}
        {parts.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', left: p.x, bottom: p.y, zIndex: 5, pointerEvents: 'none',
              opacity: p.life > p.max * 0.7 ? 1 - (p.life - p.max * 0.7) / (p.max * 0.3) : 1,
              transform: `rotate(${p.rot}deg)`,
              ...(p.star ? { fontSize: p.sz, lineHeight: 1 } : { width: p.sz, height: p.sz * 0.5, background: p.color }),
            }}
          >
            {p.star ? '⭐' : null}
          </div>
        ))}
      </Stage>
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button style={btn()} onClick={() => start('cheer')}>✅ Corect!</button>
        <button style={btn()} onClick={() => start('oops')}>🤏 Aproape</button>
      </div>
    </Shell>
  )
}
