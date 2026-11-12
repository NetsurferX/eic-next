'use client'

import { useEffect, useState, type CSSProperties } from 'react'

export type FoxMotionState = 'idle' | 'pointing' | 'clapping' | 'cheering' | 'talking' | 'sleeping'
export type FoxMotionAction = 'idle' | 'walking' | 'running' | 'jumping' | 'grabbing' | 'holding-star' | 'holding-cup' | 'pouring' | 'celebrating' | 'watching' | 'waving'

const P = '/mascot/v2/'
const FRAMES = {
  idle: P + '01_idle_side.png',
  blink: P + '02_idle_blink.png',
  front: P + '03_idle_front.png',
  sit: P + '04_idle_sit.png',
  point: P + '05_point.png',
  wave: P + '06_wave.png',
  clap: P + '07_clap.png',
  cheer: P + '08_cheer_stars.png',
  runA: P + '09_run_left.png',
  runB: P + '10_run_right.png',
  celebrate: P + '11_celebrate_stars.png',
  sleep: P + '12_sleep.png',
} as const

const FRAME_SIZE = 346
const MEASURED: Record<string, { cx: number; bottom: number }> = {
  [FRAMES.idle]: { cx: 178, bottom: 337 }, [FRAMES.blink]: { cx: 177, bottom: 335 },
  [FRAMES.front]: { cx: 175, bottom: 336 }, [FRAMES.sit]: { cx: 165, bottom: 336 },
  [FRAMES.point]: { cx: 166, bottom: 332 }, [FRAMES.wave]: { cx: 170, bottom: 332 },
  [FRAMES.clap]: { cx: 158, bottom: 333 }, [FRAMES.sleep]: { cx: 172, bottom: 279 },
}
function alignFrame(src: string) {
  const m = MEASURED[src]
  if (!m) return undefined
  const dx = ((178 - m.cx) / FRAME_SIZE) * 100
  const dy = ((337 - m.bottom) / FRAME_SIZE) * 100
  return `translate(${dx.toFixed(2)}%, ${dy.toFixed(2)}%)`
}

const STATE_FRAME: Record<FoxMotionState, string> = {
  idle: FRAMES.idle,
  pointing: FRAMES.point,
  clapping: FRAMES.clap,
  cheering: FRAMES.cheer,
  talking: FRAMES.front,
  sleeping: FRAMES.sleep,
}
const ACTION_FRAME: Record<FoxMotionAction, string> = {
  idle: FRAMES.idle,
  walking: FRAMES.runA,
  running: FRAMES.runB,
  jumping: FRAMES.runA,
  grabbing: FRAMES.point,
  'holding-star': FRAMES.clap,
  'holding-cup': FRAMES.clap,
  pouring: FRAMES.clap,
  celebrating: FRAMES.celebrate,
  watching: FRAMES.front,
  waving: FRAMES.wave,
}

export function FoxMotion({
  state = 'idle', action, message = null, size = 96, className = '',
}: {
  state?: FoxMotionState
  action?: FoxMotionAction
  face?: string
  message?: string | null
  size?: number
  className?: string
}) {
  const [blink, setBlink] = useState(false)
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    Object.values(FRAMES).forEach((src) => { const img = new Image(); img.src = src })
  }, [])
  useEffect(() => {
    if (state !== 'idle' || action) { setBlink(false); return }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let timer = 0
    let close = 0
    const schedule = () => {
      timer = window.setTimeout(() => {
        setBlink(true)
        close = window.setTimeout(() => { setBlink(false); schedule() }, 150)
      }, 2600 + Math.random() * 2100)
    }
    schedule()
    return () => { window.clearTimeout(timer); window.clearTimeout(close) }
  }, [state, action])
  useEffect(() => {
    if (state !== 'idle' || action) { setFrame(0); return }
    const id = window.setInterval(() => setFrame((n) => (n + 1) % 10), 1250)
    return () => window.clearInterval(id)
  }, [state, action])

  const src = action ? ACTION_FRAME[action] : state === 'idle' && blink ? FRAMES.blink
     : state === 'idle' && frame === 2 ? FRAMES.front
      : state === 'idle' && (frame === 4 || frame === 5) ? (frame === 4 ? FRAMES.runA : FRAMES.runB)
        : state === 'idle' && frame === 7 ? FRAMES.sit
          : STATE_FRAME[state]

  const motionClass = action === 'running' || action === 'walking' || (!action && state === 'idle' && (frame === 4 || frame === 5)) ? 'fox-motion-running'
    : action === 'jumping' || state === 'cheering' ? 'fox-motion-jumping'
      : state === 'sleeping' ? 'fox-motion-sleeping'
        : state === 'clapping' || action === 'celebrating' ? 'fox-motion-celebrating'
          : 'fox-motion-alive'

  return (
    <div className={`mascot state-${state} ${action ? `mascot-${action}` : ''} fox-motion ${motionClass} ${className}`}
      style={{ '--mascot-size': `${size}px` } as CSSProperties} aria-hidden="true">
      {message && <div key={message} className="mascot-bubble">{message}</div>}
      <div className="mascot-stage">
        <div className="mascot-glow mascot-glow-outer" />
        <div className="mascot-glow mascot-glow-inner" />
        <div className="mascot-shadow" />
        <div className="mascot-fox-anchor">
          <div className="mascot-fox-visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={src} src={src} alt="" className="mascot-fox-img fox-motion-frame" style={{ transform: alignFrame(src) }} draggable={false} />
          </div>
        </div>
        <div className="mascot-sparkles" aria-hidden="true">
          <span className="mascot-sparkle s1">✦</span><span className="mascot-sparkle s2">✧</span>
          <span className="mascot-sparkle s3">✦</span><span className="mascot-sparkle s4">✧</span>
        </div>
      </div>
      <style jsx>{`
        .fox-motion-frame { animation: fox-frame-in 220ms ease both; }
        .fox-motion-alive .mascot-fox-anchor { animation: fox-breathe 3.4s ease-in-out infinite; }
        .fox-motion-running .mascot-fox-anchor { animation: fox-run 360ms ease-in-out infinite alternate; }
        .fox-motion-jumping .mascot-fox-anchor { animation: fox-jump 720ms cubic-bezier(.3,.7,.3,1) infinite; }
        .fox-motion-sleeping .mascot-fox-anchor { animation: fox-sleep 3.4s ease-in-out infinite; }
        .fox-motion-celebrating .mascot-fox-anchor { animation: fox-cheer 520ms ease-in-out infinite alternate; }
        @keyframes fox-frame-in { from { opacity:.55; transform:translateY(3px) scale(.98) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes fox-breathe { 0%,100% { transform:translateY(0) scale(1,1) } 50% { transform:translateY(-2px) scale(1.012,.99) } }
        @keyframes fox-run { from { transform:translateY(0) rotate(-2deg) } to { transform:translateY(-5px) rotate(2deg) } }
        @keyframes fox-jump { 0%,100% { transform:translateY(0) scale(1.04,.94) } 45% { transform:translateY(-13px) scale(.96,1.06) } }
        @keyframes fox-sleep { 0%,100% { transform:translateY(1px) scale(1,1) } 50% { transform:translateY(-2px) scale(1.025,.98) } }
        @keyframes fox-cheer { from { transform:translateY(0) rotate(-3deg) } to { transform:translateY(-9px) rotate(3deg) } }
        @media (prefers-reduced-motion: reduce) { .fox-motion * { animation:none !important; transition:none !important } }
      `}</style>
    </div>
  )
}

export default FoxMotion
