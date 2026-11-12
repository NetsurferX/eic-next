'use client'

import { useRef, useState } from 'react'
import { Fox, Shadow, Stage, Shell, POSE, REST, btn, usePreload, useRaf, useReducedMotion, type FoxFrame } from '../_anim'

// Săriturile: ghemuire → arc în aer (întindere pe viteză, nasul în sus la urcare)
// → aterizare cu zguduit elastic amortizat. Sare înainte și se întoarce la margini.

const SIZE = 190
const H = 150
const HOP = 170
type Ph = 'rest' | 'crouch' | 'air' | 'land'
const DUR: Record<Ph, number> = { rest: 0.6, crouch: 0.22, air: 0.78, land: 0.4 }

export default function Page() {
  usePreload()
  const reduced = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(true)
  const autoRef = useRef(true)
  autoRef.current = auto
  const s = useRef({ ph: 'rest' as Ph, t: 0, x: -1, x0: 0, dir: 1 as 1 | -1, want: false })
  const [f, setF] = useState<FoxFrame>(REST)
  const [k, setK] = useState(1)

  useRaf((_t, dt) => {
    const w = stageRef.current?.clientWidth ?? 600
    const o = s.current
    if (o.x < 0) o.x = w * 0.2
    o.t += dt
    let y = 0, sx = 1, sy = 1, rot = 0, src = POSE.idle

    if (o.ph === 'rest') {
      sy = 1 + 0.012 * Math.sin(o.t * 3)
      if ((autoRef.current || o.want) && o.t > DUR.rest) { o.ph = 'crouch'; o.t = 0; o.want = false }
    } else if (o.ph === 'crouch') {
      const p = Math.min(1, o.t / DUR.crouch), e = p * p
      sy = 1 - 0.24 * e; sx = 1 + 0.14 * e; src = POSE.sit
      if (o.t >= DUR.crouch) {
        o.ph = 'air'; o.t = 0; o.x0 = o.x
        if (o.x + o.dir * HOP > w - SIZE / 2 - 10 || o.x + o.dir * HOP < SIZE / 2 + 10) o.dir = (o.dir * -1) as 1 | -1
      }
    } else if (o.ph === 'air') {
      const p = Math.min(1, o.t / DUR.air), vy = 1 - 2 * p
      y = H * 4 * p * (1 - p)
      o.x = o.x0 + o.dir * HOP * p
      sy = 1 + 0.1 * Math.abs(vy); sx = 1 - 0.06 * Math.abs(vy); rot = -12 * vy
      src = p < 0.55 ? POSE.runB : POSE.runA
      if (o.t >= DUR.air) { o.ph = 'land'; o.t = 0 }
    } else {
      const p = Math.min(1, o.t / DUR.land), kk = Math.exp(-5 * p) * Math.cos(p * 16)
      sy = 1 - 0.2 * kk; sx = 1 + 0.12 * kk
      if (o.t >= DUR.land) { o.ph = 'rest'; o.t = 0 }
    }
    setK(1 - 0.55 * (y / H))
    setF({ src, x: o.x, y, flip: o.dir, sx, sy, rot })
  }, reduced)

  return (
    <Shell title="🦘 Săriturile" desc="Click pe scenă = sare acum. Sare înainte și se întoarce la margini.">
      <Stage stageRef={stageRef} onClick={() => { s.current.want = true }}>
        <Shadow x={f.x} size={SIZE} k={k} />
        <Fox f={f} size={SIZE} />
      </Stage>
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button style={btn(auto)} onClick={() => setAuto((a) => !a)}>Automat: {auto ? 'da' : 'nu'}</button>
        <button style={btn()} onClick={() => { s.current.want = true }}>Sari!</button>
      </div>
    </Shell>
  )
}
