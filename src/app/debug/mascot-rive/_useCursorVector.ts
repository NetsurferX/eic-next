'use client'

import { useEffect, useState, type RefObject } from 'react'

// ─────────────────────────────────────────────────────────────────────────
// Hook comun celor 3 concepte din /debug/mascot-rive — urmărește poziția
// cursorului relativ la centrul unui element ancoră (de regulă wrapper-ul
// din jurul <Mascot />) și expune un vector normalizat, nu pixeli bruți,
// ca fiecare concept să-l poată scala după propria senzație (tilt subtil
// vs. urmărire dramatică vs. praguri de proximitate).
//
// Complet izolat — nu atinge Mascot.tsx, globals.css sau vreun fișier
// existent. Respectă `prefers-reduced-motion`: dacă utilizatorul cere
// mișcare redusă, vectorul rămâne mereu neutru (centrat, inactiv).
// ─────────────────────────────────────────────────────────────────────────

export interface CursorVector {
  /** Offset orizontal normalizat, aprox. -1..1 (poate depăși ușor la cursor foarte aproape). */
  dx: number
  /** Offset vertical normalizat, aprox. -1..1. */
  dy: number
  /** Unghiul cursor→centru element, în radiani (atan2). */
  angle: number
  /** Distanța reală în pixeli de la centrul elementului la cursor. */
  distance: number
  /** False până la prima mișcare de mouse înregistrată, sau dacă reduced-motion e activ. */
  active: boolean
}

const NEUTRAL: CursorVector = { dx: 0, dy: 0, angle: 0, distance: Number.POSITIVE_INFINITY, active: false }

export function useCursorVector<T extends HTMLElement>(ref: RefObject<T | null>): CursorVector {
  const [vector, setVector] = useState<CursorVector>(NEUTRAL)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    function handleMove(e: PointerEvent) {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const rawDx = e.clientX - cx
      const rawDy = e.clientY - cy
      const distance = Math.hypot(rawDx, rawDy)
      // "raza de influență" — de câte ori dimensiunea elementului contează
      // drept offset "maxim" (=1). Dincolo de ea, valoarea e doar clampată.
      const influence = Math.max(rect.width, rect.height) * 3.2
      const dx = clamp(rawDx / influence, -1.4, 1.4)
      const dy = clamp(rawDy / influence, -1.4, 1.4)
      setVector({ dx, dy, angle: Math.atan2(rawDy, rawDx), distance, active: true })
    }

    function handleLeave() {
      setVector(NEUTRAL)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerleave', handleLeave)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerleave', handleLeave)
    }
  }, [ref])

  return vector
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}
