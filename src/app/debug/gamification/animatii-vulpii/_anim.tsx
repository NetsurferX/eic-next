'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react'

// ── Utilitare comune pentru animațiile vulpii (rută izolată, nu atinge
//    MascotV2.tsx / Mascot.tsx). Folosește pozele din public/mascot/v2.
//    Animațiile sunt mișcare continuă (transformări + fizică simplă),
//    nu schimbare de poze: pozele se schimbă doar acolo unde o cere
//    mișcarea (picioare strânse/întinse, șezut, somn). ──

const P = '/mascot/v2/'
export const POSE = {
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
}

// aliniere per poză (aceeași măsurătoare ca în MascotV2: centru x=178, sol y=337)
const FRAME = 346
const REF_CX = 178
const REF_BOTTOM = 337
const MEASURED: Record<string, { cx: number; bottom: number }> = {
  [POSE.idle]: { cx: 178, bottom: 337 },
  [POSE.blink]: { cx: 177, bottom: 335 },
  [POSE.front]: { cx: 175, bottom: 336 },
  [POSE.sit]: { cx: 165, bottom: 336 },
  [POSE.point]: { cx: 166, bottom: 332 },
  [POSE.wave]: { cx: 170, bottom: 332 },
  [POSE.clap]: { cx: 158, bottom: 333 },
  [POSE.sleep]: { cx: 172, bottom: 279 },
}
function align(src: string): string {
  const m = MEASURED[src]
  if (!m) return 'none'
  const dx = ((REF_CX - m.cx) / FRAME) * 100
  const dy = ((REF_BOTTOM - m.bottom) / FRAME) * 100
  return `translate(${dx.toFixed(2)}%, ${dy.toFixed(2)}%)`
}

export const GROUND = 56 // înălțimea solului (px) de jos în sus

export type FoxFrame = {
  src: string
  x: number // centrul corpului, px de la stânga scenei
  y: number // înălțime peste sol, px
  flip: 1 | -1
  sx: number
  sy: number
  rot: number // grade
}
export const REST: FoxFrame = { src: POSE.idle, x: 0, y: 0, flip: 1, sx: 1, sy: 1, rot: 0 }

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export function usePreload() {
  useEffect(() => {
    Object.values(POSE).forEach((s) => {
      const i = new Image()
      i.src = s
    })
  }, [])
}

export function useReducedMotion(): boolean {
  const [r, setR] = useState(false)
  useEffect(() => {
    const q = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!q) return
    setR(q.matches)
    const h = () => setR(q.matches)
    q.addEventListener('change', h)
    return () => q.removeEventListener('change', h)
  }, [])
  return r
}

/** rAF loop. cb(timpSecunde, dt). `paused` oprește bucla (reduce-motion). */
export function useRaf(cb: (t: number, dt: number) => void, paused = false) {
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => {
    if (paused) return
    let id = 0
    let last = performance.now()
    const loop = (n: number) => {
      const dt = Math.min(0.05, (n - last) / 1000)
      last = n
      ref.current(n / 1000, dt)
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [paused])
}

export function Fox({ f, size = 200, z = 2 }: { f: FoxFrame; size?: number; z?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: f.x - size / 2,
        bottom: GROUND - size * (9 / 346) + f.y,
        width: size,
        height: size,
        transformOrigin: '51.4% 97.4%',
        transform: `scale(${f.flip * f.sx}, ${f.sy}) rotate(${f.rot}deg)`,
        pointerEvents: 'none',
        zIndex: z,
        willChange: 'transform',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={f.src}
        alt=""
        draggable={false}
        style={{ width: '100%', height: '100%', display: 'block', transform: align(f.src) }}
      />
    </div>
  )
}

/** umbră sub vulpe; k = 1 pe sol, mai mică și mai estompată în aer */
export function Shadow({ x, size, k = 1 }: { x: number; size: number; k?: number }) {
  const w = size * 0.55 * k
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        bottom: GROUND - 7,
        width: w,
        height: 14,
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.22)',
        filter: 'blur(2px)',
        opacity: 0.4 + 0.6 * k,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  )
}

export function Stage({
  children,
  stageRef,
  sky = 'linear-gradient(#cfe8ff, #eaf6ff 70%)',
  ground = 'linear-gradient(#8fd16b, #6cb84e)',
  height = 380,
  onClick,
  onPointerMove,
}: {
  children: ReactNode
  stageRef?: Ref<HTMLDivElement>
  sky?: string
  ground?: string
  height?: number
  onClick?: () => void
  onPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void
}) {
  return (
    <div
      ref={stageRef}
      onClick={onClick}
      onPointerMove={onPointerMove}
      style={{
        position: 'relative',
        overflow: 'hidden',
        height,
        borderRadius: 12,
        background: sky,
        touchAction: 'pan-y',
        userSelect: 'none',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: GROUND, background: ground, zIndex: 0 }}
      />
      {children}
    </div>
  )
}

export function Shell({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  const reduced = useReducedMotion()
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/debug/gamification/animatii-vulpii">← Animații vulpe</Link>
      <h1 style={{ fontSize: 22, margin: '12px 0 4px' }}>{title}</h1>
      <p style={{ margin: '0 0 12px', color: '#444', fontSize: 14 }}>{desc}</p>
      {reduced && (
        <p style={{ background: '#fff3cd', padding: 8, borderRadius: 6, fontSize: 13 }}>
          „Reduce motion” e activ în sistem — animația e oprită.
        </p>
      )}
      {children}
    </main>
  )
}

export const btn = (on = false) => ({
  padding: '6px 14px',
  borderRadius: 999,
  cursor: 'pointer',
  border: on ? '2px solid #e67e22' : '1px solid #bbb',
  background: on ? '#fff3e6' : '#fff',
  color: '#222',
  fontSize: 14,
})
