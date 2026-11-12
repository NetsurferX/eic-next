'use client'

import { useRef, useState } from 'react'
import { Fox, Stage, Shell, POSE, REST, btn, usePreload, useRaf, useReducedMotion, type FoxFrame } from '../_anim'

// Somnul: respirație lentă (scalare pe axa solului) + Z-uri care plutesc.
// „Trezește”: tresărire în sus → se uită → salută → se așază → adoarme la loc.

const SIZE = 280
const STARS = [[8, 12], [18, 40], [30, 18], [44, 52], [58, 14], [71, 36], [83, 20], [92, 48], [12, 70], [66, 66]]
const CSS = `
@keyframes zfloat { 0% { transform: translate(0,0) scale(.6); opacity: 0 } 15% { opacity: 1 }
  50% { transform: translate(-14px,-60px) scale(1) } 100% { transform: translate(8px,-130px) scale(1.6); opacity: 0 } }
@keyframes twinkle { 0%,100% { opacity: .25 } 50% { opacity: 1 } }`

export default function Page() {
  usePreload()
  const reduced = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const s = useRef({ waking: false, t: 0, clock: 0 })
  const [f, setF] = useState<FoxFrame>({ ...REST, src: POSE.sleep })
  const [waking, setWaking] = useState(false)

  const wake = () => {
    if (s.current.waking) return
    s.current.waking = true
    s.current.t = 0
    setWaking(true)
  }

  useRaf((_t, dt) => {
    const w = stageRef.current?.clientWidth ?? 600
    const o = s.current
    o.clock += dt
    const base: FoxFrame = { ...REST, x: w / 2 }
    if (!o.waking) {
      const k = Math.sin((o.clock * Math.PI * 2) / 3.4)
      setF({ ...base, src: POSE.sleep, sy: 1 + 0.03 * k, sx: 1 - 0.015 * k })
      return
    }
    o.t += dt
    const t = o.t
    let fr: FoxFrame = { ...base, src: POSE.idle }
    if (t < 0.35) {
      const p = t / 0.35
      fr = { ...base, src: POSE.front, y: 44 * 4 * p * (1 - p), sy: 1 + 0.1 * Math.abs(1 - 2 * p), sx: 0.96, rot: -3 }
    } else if (t < 1.3) {
      const blink = t > 0.85 && t < 0.97
      fr = { ...base, src: blink ? POSE.blink : POSE.idle, sy: 1 + 0.012 * Math.sin(t * 5) }
    } else if (t < 2.3) {
      fr = { ...base, src: POSE.wave, rot: Math.sin((t - 1.3) * 12) * 3 }
    } else if (t < 3.0) {
      fr = { ...base, src: POSE.sit, rot: Math.sin((t - 2.3) * 5) * 1.5 }
    } else if (t < 3.7) {
      const p = (t - 3.0) / 0.7
      fr = { ...base, src: POSE.sit, sy: 1 - 0.07 * p, rot: 4 * p }
    } else if (t < 4.2) {
      const p = (t - 3.7) / 0.5, k = Math.exp(-6 * p) * Math.cos(p * 14)
      fr = { ...base, src: POSE.sleep, sy: 1 - 0.1 * k, sx: 1 + 0.06 * k }
    } else {
      o.waking = false
      setWaking(false)
    }
    setF(fr)
  }, reduced)

  return (
    <Shell title="😴 Somnul" desc="Doarme și respiră. Apasă butonul (sau scena) ca s-o trezești; adoarme singură la loc.">
      <style>{CSS}</style>
      <Stage
        stageRef={stageRef}
        sky="linear-gradient(#0b1d3a, #1d3a63 80%)"
        ground="linear-gradient(#2f5d3a, #234a2e)"
        onClick={wake}
      >
        {STARS.map(([x, y], i) => (
          <div
            key={i}
            style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 3, height: 3, borderRadius: '50%', background: '#fff', animation: `twinkle ${2 + (i % 4) * 0.7}s ease-in-out ${i * 0.3}s infinite` }}
          />
        ))}
        <div style={{ position: 'absolute', right: '10%', top: 24, fontSize: 56 }}>🌙</div>
        {!waking && !reduced &&
          [0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute', left: 'calc(50% - 100px)', bottom: 150, color: '#cfe3ff', fontWeight: 700, fontSize: 28,
                animation: `zfloat 4s ease-out ${i * 1.33}s infinite`, opacity: 0, zIndex: 3, pointerEvents: 'none',
              }}
            >
              Z
            </div>
          ))}
        <Fox f={f} size={SIZE} />
      </Stage>
      <div style={{ marginTop: 12 }}>
        <button style={btn()} disabled={waking} onClick={wake}>{waking ? 'Se trezește…' : 'Trezește vulpea'}</button>
      </div>
    </Shell>
  )
}
