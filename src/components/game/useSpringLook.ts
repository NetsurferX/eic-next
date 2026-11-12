'use client'

import { useEffect, useRef, type RefObject } from 'react'

// Spring cu două axe, scris direct pe DOM (fără setState pe cadru).
// Ținta e eșantionată în fiecare frame; fără țintă, vulpea revine acasă
// cu un rest de mișcare neregulată (două sinusoide dezacordate).
export function useSpringLook(
  elRef: RefObject<HTMLElement | null>,
  sample: () => { x: number; y: number } | null,
  opts?: { maxRot?: number; maxShift?: number },
) {
  const sampleRef = useRef(sample)
  sampleRef.current = sample
  const maxRot = opts?.maxRot ?? 7
  const maxShift = opts?.maxShift ?? 4

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let px = 0, py = 0, vx = 0, vy = 0
    let raf = 0
    const tick = (now: number) => {
      const el = elRef.current
      const target = sampleRef.current()
      let tx = 0
      let ty = 0
      if (el && target) {
        const r = el.getBoundingClientRect()
        const dx = (target.x - (r.left + r.width / 2)) / Math.max(r.width * 3.4, 72)
        const dy = (target.y - (r.top + r.height * 0.32)) / Math.max(r.height * 3.4, 72)
        tx = clamp(dx, -1, 1)
        ty = clamp(dy, -1, 1)
      }
      const s = now / 1000
      tx += Math.sin(s * 0.65) * 0.07 + Math.sin(s * 1.9) * 0.035
      ty += Math.sin(s * 0.9 + 1.2) * 0.05
      vx += (tx - px) * 0.05
      vx *= 0.78
      px += vx
      vy += (ty - py) * 0.045
      vy *= 0.8
      py += vy
      if (el) {
        el.style.transform =
          `translate(${(px * maxShift).toFixed(2)}px, ${(py * maxShift * 0.5).toFixed(2)}px) rotate(${(px * maxRot).toFixed(2)}deg)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [elRef, maxRot, maxShift])
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}
