'use client'

import { useRef, useState } from 'react'
import { Fox, Shadow, Stage, Shell, POSE, REST, clamp, usePreload, useRaf, useReducedMotion, type FoxFrame } from '../_anim'

// Te urmărește: corpul se întoarce spre cursor/deget (lerp elastic), se
// apleacă spre el, clipește la intervale aleatorii, saltă la click.
// Fără mișcare 6s → se așază; 14s → adoarme. La prima mișcare tresare.

const SIZE = 230

export default function Page() {
  usePreload()
  const reduced = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const s = useRef({
    px: null as number | null, py: null as number | null, last: 0, started: false,
    ox: 0, rot: 0, flip: 1 as 1 | -1, mode: 'awake' as 'awake' | 'sit' | 'sleep',
    hop: -1, wave: -1, blinkUntil: 0, nextBlink: 2,
  })
  const [f, setF] = useState<FoxFrame>(REST)
  const [mode, setMode] = useState('awake')

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const o = s.current
    o.px = e.clientX - r.left
    o.py = e.clientY - r.top
    o.last = performance.now() / 1000
    if (o.mode !== 'awake') { o.mode = 'awake'; o.hop = 0 } // tresărire la trezire
  }
  const onClick = () => { s.current.wave = 0; s.current.hop = 0 }

  useRaf((t, dt) => {
    const o = s.current
    const box = stageRef.current
    const w = box?.clientWidth ?? 600
    const h = box?.clientHeight ?? 380
    if (!o.started) { o.started = true; o.last = t }
    const idle = t - o.last
    if (idle > 14 && o.mode !== 'sleep') o.mode = 'sleep'
    else if (idle > 6 && idle <= 14 && o.mode === 'awake') o.mode = 'sit'
    setMode((m) => (m === o.mode ? m : o.mode))

    const foxX = w / 2
    let src = POSE.idle, tx = 0, tr = 0
    if (o.mode === 'sleep') src = POSE.sleep
    else if (o.mode === 'sit') src = POSE.sit
    else {
      const dx = o.px === null ? 0 : o.px - foxX
      tx = clamp(dx * 0.05, -22, 22)
      tr = clamp(dx * 0.02, -7, 7)
      if (Math.abs(dx) < 110) src = POSE.front
      else o.flip = dx < 0 ? -1 : 1
      if (t > o.nextBlink) { o.blinkUntil = t + 0.13; o.nextBlink = t + 2.5 + Math.random() * 2.5 }
      if (src === POSE.idle && t < o.blinkUntil) src = POSE.blink
    }
    const k = Math.min(1, dt * 8)
    o.ox += (tx - o.ox) * k
    o.rot += (tr - o.rot) * k

    let y = 0, sy = 1 + 0.012 * Math.sin(t * 3), sx = 1
    if (o.hop >= 0) {
      o.hop += dt
      const p = o.hop / 0.45
      if (p >= 1) o.hop = -1
      else { y = 34 * 4 * p * (1 - p); sy = 1 + 0.08 * Math.abs(1 - 2 * p); sx = 0.97 }
    }
    if (o.wave >= 0 && o.mode === 'awake') {
      o.wave += dt
      if (o.wave > 1.1) o.wave = -1
      else { src = POSE.wave; o.flip = 1 }
    }
    void h
    setF({ src, x: foxX + o.ox, y, flip: o.flip, sx, sy, rot: o.rot + (o.wave >= 0 ? Math.sin(o.wave * 12) * 3 : 0) })
  }, reduced)

  const label: Record<string, string> = { awake: 'trează', sit: 'așezată (nu mai e urmărită)', sleep: 'doarme' }

  return (
    <Shell title="👀 Te urmărește" desc="Mută cursorul (sau trage degetul) pe scenă. Click/atingere = salută și saltă. Dacă stai nemișcat, adoarme.">
      <Stage stageRef={stageRef} onClick={onClick} onPointerMove={onMove}>
        <Shadow x={f.x} size={SIZE} k={1 - f.y / 120} />
        <Fox f={f} size={SIZE} />
      </Stage>
      <p style={{ fontSize: 13, color: '#555', marginTop: 8 }}>stare: {label[mode] ?? mode}</p>
    </Shell>
  )
}
