'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FoxMotion } from './FoxMotion'
import { FoxReel, FACE_IDLE_REEL } from './useFrameCycle'

// ─────────────────────────────────────────────────────────────────────────
// Săritura vulpii de la medalionul coloanei (/learn) în joc, la relanti.
//
// Vulpea stă la medalion (același portret rotund, dar deasupra fundalului întunecat),
// se ghemuiește o clipă, sare într-un arc lung, se dă peste cap, iar în aer portretul
// devine vulpea întreagă, care aterizează peste vulpea din joc (`.pf-fox`, din
// BulelePestilorGame). Cât timp e pe drum, BuleleVulpiiOverlay ține ascunsă vulpea din
// joc (o singură vulpe pe ecran); la `onLand` o arată în același randat în care dispare
// zburătoarea.
//
// Ținta se re-măsoară la FIECARE cadru: jocul CRESTE din butonul central cât timp
// vulpea e în aer, deci poziția lui se mișcă; doar așa aterizează exact.
//
// Fără joc montat în `GIVE_UP_MS` după decolare sau cu „reduce motion": renunță (onLand).
// ─────────────────────────────────────────────────────────────────────────

export interface FlightOrigin { x: number; y: number; w: number; h: number }

const BASE = 84                 // dimensiunea cu care e desenată vulpea (ca FOX_SIZE din joc); scala o aduce la țintă
const CROUCH_MS = 420           // ghemuirea de dinaintea săriturii (la sfârșitul așteptării)
const GIVE_UP_MS = 1500         // cât așteptăm, după decolare, să apară vulpea din joc

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const smooth = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

export function FoxFlight({
  from, onLand, delayMs = 0, durationMs = 1800,
}: {
  from: FlightOrigin
  onLand: () => void
  /** cât stă (ghemuită) la medalion înainte să sară */
  delayMs?: number
  /** cât durează săritura, de la decolare la aterizare */
  durationMs?: number
}) {
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
    const s0 = from.w / BASE            // la început portretul are exact mărimea medalionului
    let raf = 0
    let takeoffAt = 0                   // momentul real al decolării (după așteptare + după ce există ținta)
    const openedAt = performance.now()
    let done = false

    let shadowP = 0
    const show = (x: number, y: number, rot: number, scaleX: number, scaleY: number, toBody: number) => {
      flyer.style.transform = `translate(${x - BASE / 2}px, ${y - BASE / 2}px) rotate(${rot}deg) scale(${scaleX}, ${scaleY})`
      head.style.opacity = String(1 - toBody)
      body.style.opacity = String(toBody)
      // umbra de pe sol apare doar spre aterizare (în aer ar fi o pată desprinsă de vulpe)
      body.style.setProperty('--fox-shadow-o', String(smooth(0.82, 1, shadowP)))
      flyer.style.visibility = 'visible'
    }

    const tick = (now: number) => {
      if (done) return
      const waited = now - openedAt

      // ── așteptarea la medalion: stă pe loc, iar spre final se ghemuiește (anticipația săriturii) ──
      const target = document.querySelector('.pf-fox') as HTMLElement | null
      const r = target?.getBoundingClientRect()
      const ready = !!r && r.width >= 1
      if (waited < delayMs || !ready) {
        if (waited > delayMs + GIVE_UP_MS) { done = true; landRef.current(); return }
        const k = smooth(delayMs - CROUCH_MS, delayMs, waited)   // 0 → 1 în ultimele CROUCH_MS
        show(sx, sy + k * 5, 0, s0 * (1 + 0.1 * k), s0 * (1 - 0.16 * k), 0)
        raf = requestAnimationFrame(tick)
        return
      }

      // ── săritura ──
      if (!takeoffAt) takeoffAt = now
      const p = clamp01((now - takeoffAt) / durationMs)
      const e = easeInOut(p)

      const tx = r!.left + r!.width / 2
      const ty = r!.top + r!.height / 2
      const sEnd = r!.width / BASE
      const dist = Math.hypot(tx - sx, ty - sy)
      const arc = Math.min(190, 60 + dist * 0.26) * Math.sin(Math.PI * e)   // arc lung; la apogeu pare că „atârnă" (easeInOut)
      const x = lerp(sx, tx, e)
      const y = lerp(sy, ty, e) - arc
      const s = lerp(s0, sEnd, e) * (1 + 0.16 * Math.sin(Math.PI * e))      // mai mare în vârful săriturii
      const rot = -360 * easeInOut(clamp01((p - 0.1) / 0.8))                // tumbul
      // întindere la decolare, ghemuire ușoară la aterizare
      const stretch = 0.12 * Math.sin(Math.PI * clamp01(p / 0.22)) - 0.1 * Math.sin(Math.PI * clamp01((p - 0.86) / 0.14))
      shadowP = p
      show(x, y, rot, s * (1 - stretch * 0.5), s * (1 + stretch), smooth(0.08, 0.4, p))

      if (p >= 1) { done = true; landRef.current(); return }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { done = true; cancelAnimationFrame(raf) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (typeof document === 'undefined') return null
  // în portal, ca să nu fie prins de transformările/filtrele overlay-ului; deasupra lui (z-index 60)
  return createPortal(
    <div
      ref={flyerRef}
      aria-hidden="true"
      style={{
        position: 'fixed', left: 0, top: 0, width: BASE, height: BASE,
        zIndex: 400, pointerEvents: 'none',
        // de la primul randat stă exact peste medalion (care e ascuns de overlay) → fără „clipit" între ele
        transform: `translate(${from.x + from.w / 2 - BASE / 2}px, ${from.y + from.h / 2 - BASE / 2}px) scale(${from.w / BASE})`,
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
      <div ref={bodyRef} className="fox-flight-body" style={{ position: 'absolute', inset: 0, opacity: 0 }}>
        <FoxMotion state="sitting" size={BASE} />
      </div>
    </div>,
    document.body,
  )
}
