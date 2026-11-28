'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FoxMotion } from './FoxMotion'
import { FoxReel, FACE_IDLE_REEL } from './useFrameCycle'

// ─────────────────────────────────────────────────────────────────────────
// Zborul vulpii de la medalionul coloanei (/learn) la vulpea din joc.
//
// Decolează exact din medalion (același portret rotund), se dă peste cap în
// aer, iar în drum portretul se transformă în vulpea întreagă, care aterizează
// peste vulpea din joc (`.pf-fox`, cea din BulelePestilorGame). Cât zboară,
// BuleleVulpiiOverlay ascunde vulpea din joc, ca pe ecran să fie una singură;
// la `onLand` o arată în același randat în care dispare zburătoarea.
//
// Ținta se re-măsoară la FIECARE cadru: jocul intră cu un fade/translate
// (`bulele-game-fade`), iar vulpea din joc se leagănă ușor, deci o poziție
// măsurată o singură dată ar rata aterizarea cu câțiva pixeli.
//
// Fără joc montat în ~1,5 s sau cu „reduce motion": renunță la zbor (onLand).
// ─────────────────────────────────────────────────────────────────────────

export interface FlightOrigin { x: number; y: number; w: number; h: number }

const FLIGHT_MS = 780
const BASE = 84                 // dimensiunea cu care e desenată vulpea (ca FOX_SIZE din joc); scala o aduce la țintă
const GIVE_UP_MS = 1500         // cât așteptăm să apară vulpea din joc

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const smooth = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

export function FoxFlight({ from, onLand }: { from: FlightOrigin; onLand: () => void }) {
  const flyerRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const landRef = useRef(onLand)
  landRef.current = onLand

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      landRef.current()
      return
    }
    const flyer = flyerRef.current
    const head = headRef.current
    const body = bodyRef.current
    if (!flyer || !head || !body) { landRef.current(); return }

    const sx = from.x + from.w / 2
    const sy = from.y + from.h / 2
    const s0 = from.w / BASE            // la decolare portretul are exact mărimea medalionului
    let raf = 0
    let startedAt = 0
    const openedAt = performance.now()
    let done = false

    const tick = (now: number) => {
      if (done) return
      const target = document.querySelector('.pf-fox') as HTMLElement | null
      const r = target?.getBoundingClientRect()
      if (!r || r.width < 1) {
        if (now - openedAt > GIVE_UP_MS) { done = true; landRef.current(); return }
        raf = requestAnimationFrame(tick)
        return
      }
      if (!startedAt) startedAt = now
      const p = clamp01((now - startedAt) / FLIGHT_MS)
      const e = easeInOut(p)

      const tx = r.left + r.width / 2
      const ty = r.top + r.height / 2
      const sEnd = r.width / BASE
      const dist = Math.hypot(tx - sx, ty - sy)
      const arc = Math.min(140, 40 + dist * 0.22) * Math.sin(Math.PI * e)   // urcă în arc, nu în linie dreaptă
      const x = lerp(sx, tx, e)
      const y = lerp(sy, ty, e) - arc
      const scale = lerp(s0, sEnd, e) * (1 + 0.14 * Math.sin(Math.PI * e)) // un pic mai mare în vârful săriturii
      const rot = -360 * easeInOut(clamp01((p - 0.08) / 0.84))             // tumbul, ca la intro

      flyer.style.transform = `translate(${x - BASE / 2}px, ${y - BASE / 2}px) rotate(${rot}deg) scale(${scale})`
      // portretul rotund (ca în medalion) → vulpea întreagă, în prima parte a zborului
      const toBody = smooth(0.1, 0.42, p)
      head.style.opacity = String(1 - toBody)
      body.style.opacity = String(toBody)
      flyer.style.visibility = 'visible'

      if (p >= 1) { done = true; landRef.current(); return }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { done = true; cancelAnimationFrame(raf) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (typeof document === 'undefined') return null
  // în portal, ca să nu fie prins de transformările/filtrele overlay-ului; deasupra lui (z-index 60) și a intro-ului
  return createPortal(
    <div
      ref={flyerRef}
      aria-hidden="true"
      style={{
        position: 'fixed', left: 0, top: 0, width: BASE, height: BASE,
        zIndex: 400, pointerEvents: 'none', visibility: 'hidden',   // apare abia la primul cadru măsurat
        transformOrigin: '50% 50%', willChange: 'transform',
      }}
    >
      <div ref={headRef} style={{ position: 'absolute', inset: 0 }}>
        <FoxReel
          frames={FACE_IDLE_REEL}
          className="fox-flight-head"
          style={{ borderWidth: 2 / Math.max(0.2, from.w / BASE) }}   // 2px reali după scalare, ca în medalion
        />
      </div>
      <div ref={bodyRef} style={{ position: 'absolute', inset: 0, opacity: 0 }}>
        <FoxMotion state="sitting" size={BASE} />
      </div>
    </div>,
    document.body,
  )
}
