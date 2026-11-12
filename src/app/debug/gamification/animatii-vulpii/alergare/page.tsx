'use client'

import { useRef, useState } from 'react'
import { Fox, Shadow, Stage, Shell, GROUND, POSE, REST, usePreload, useRaf, useReducedMotion, type FoxFrame } from '../_anim'

// Alergarea: vulpea rămâne pe loc, lumea trece în paralax. Ciclul de pași
// alternează cele două poze de alergare în ritm cu viteza, corpul sare ușor
// la fiecare pas, praf la fiecare atingere a solului. Frânează lin.

const SIZE = 200
const SPEED_PX = 320
const FAR = [60, 380, 700, 1010].map((x, i) => ({ x, top: 28 + (i % 2) * 36, ch: '☁️', sz: 46 }))
const MID = [0, 1, 2, 3, 4].map((i) => ({ x: i * 260 + 40, ch: i % 2 ? '🌲' : '🌳', sz: 78 }))
const NEAR = [90, 330, 610, 870, 1100].map((x, i) => ({ x, ch: ['🌼', '🍄', '🌷', '🌼', '🍄'][i], sz: 26 }))
type Dust = { x: number; life: number }

export default function Page() {
  usePreload()
  const reduced = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const [target, setTarget] = useState(1.5)
  const tRef = useRef(1.5)
  tRef.current = target
  const s = useRef({ speed: 0, scroll: 0, phase: 0, dust: [] as Dust[] })
  const [view, setView] = useState<{ f: FoxFrame; scroll: number; dust: Dust[]; w: number }>({ f: REST, scroll: 0, dust: [], w: 600 })

  useRaf((t, dt) => {
    const w = stageRef.current?.clientWidth ?? 600
    const o = s.current
    o.speed += (tRef.current - o.speed) * Math.min(1, dt * 3)
    if (Math.abs(o.speed - tRef.current) < 0.01) o.speed = tRef.current
    const prev = Math.floor(o.phase)
    o.scroll += o.speed * SPEED_PX * dt
    o.phase += o.speed * 7.5 * dt
    const foxX = w * 0.45
    if (Math.floor(o.phase) !== prev && o.speed > 0.3) o.dust.push({ x: foxX - 70, life: 0 })
    o.dust = o.dust
      .map((d) => ({ x: d.x - o.speed * SPEED_PX * dt, life: d.life + dt }))
      .filter((d) => d.life < 0.6)

    let f: FoxFrame
    if (o.speed < 0.12) {
      f = { ...REST, x: foxX, sy: 1 + 0.012 * Math.sin(t * 3) }
    } else {
      const sw = Math.abs(Math.sin(o.phase * Math.PI))
      f = {
        src: Math.floor(o.phase) % 2 ? POSE.runB : POSE.runA,
        x: foxX, y: sw * 10 * Math.min(1, o.speed), flip: 1,
        sx: 1, sy: 1, rot: Math.min(4, o.speed * 2),
      }
    }
    setView({ f, scroll: o.scroll, dust: o.dust, w })
  }, reduced)

  const WW = Math.max(1200, view.w + 200)
  const wrap = (x0: number, par: number) => ((((x0 - view.scroll * par) % WW) + WW) % WW) - 100

  return (
    <Shell title="🏃 Alergarea" desc="Slider de viteză; la 0 frânează și se oprește.">
      <Stage stageRef={stageRef}>
        {FAR.map((c, i) => (
          <div key={'f' + i} style={{ position: 'absolute', top: c.top, left: wrap(c.x, 0.15), fontSize: c.sz }}>{c.ch}</div>
        ))}
        {MID.map((c, i) => (
          <div key={'m' + i} style={{ position: 'absolute', bottom: GROUND - 6, left: wrap(c.x, 0.45), fontSize: c.sz, lineHeight: 1 }}>{c.ch}</div>
        ))}
        <div
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, zIndex: 0,
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.35) 0 28px, transparent 28px 64px)',
            backgroundPositionX: -view.scroll,
          }}
        />
        <Shadow x={view.f.x} size={SIZE} k={1 - view.f.y / 40} />
        {view.dust.map((d, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', left: d.x, bottom: GROUND - 4 + d.life * 14, width: 10 + d.life * 34, height: 10 + d.life * 34,
              borderRadius: '50%', background: 'rgba(235,225,200,0.8)', opacity: 1 - d.life / 0.6, zIndex: 1, filter: 'blur(1px)',
            }}
          />
        ))}
        <Fox f={view.f} size={SIZE} />
        {NEAR.map((c, i) => (
          <div key={'n' + i} style={{ position: 'absolute', bottom: GROUND - 20, left: wrap(c.x, 1), fontSize: c.sz, zIndex: 3, lineHeight: 1 }}>{c.ch}</div>
        ))}
      </Stage>
      <label style={{ display: 'block', marginTop: 12, fontSize: 14 }}>
        viteză {target.toFixed(1)}{' '}
        <input type="range" min={0} max={3} step={0.1} value={target} onChange={(e) => setTarget(+e.target.value)} />
      </label>
    </Shell>
  )
}
