'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Mascot } from './Mascot'

// ── Intro de bun-venit: la deschiderea paginii, vulpea apare mare, la
//    centrul ecranului, apoi „zboară" spre locul ei permanent — medalionul
//    de sus (`.aik-corner`, capul lui Aik din coloana activă). Poziția și
//    mărimea de sosire se MĂSOARĂ pe elementul real în momentul zborului;
//    dacă medalionul nu e în pagină, rămân valorile de rezervă din CSS
//    (`.flying`: colțul dreapta-jos).
//
//    Randată doar cât timp `onComplete` nu a fost încă apelat — la final,
//    componenta-părinte o demontează, iar medalionul real e chiar acolo
//    unde a aterizat vulpea mare, fără sărituri vizuale. ──

const MASCOT_SIZE = 180   // dimensiunea vulpii mari, la centru (px)
const HOLD_MS = 850       // cât stă mare, la centru, înainte să plece
const FLY_MS = 600        // durata zborului spre dock

export function MascotIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'flying'>('enter')
  // ── implicit `false` (identic pe server ȘI la primul randat pe client,
  //    unde localStorage tot nu poate fi citit încă) — valoarea reală vine
  //    abia din efectul de mai jos, DUPĂ hidratare, ca să nu difere textul
  //    server vs. client (vezi eroarea de hidratare cu "Salut!"/"Bine ai
  //    revenit!"). ──
  const [seenBefore, setSeenBefore] = useState(false)
  // ținta zborului, măsurată pe medalionul de sus: centru (x, y) și scara față de vulpea mare
  const [target, setTarget] = useState<{ x: number; y: number; scale: number } | null>(null)

  useEffect(() => {
    try { setSeenBefore(localStorage.getItem('eic-fox-seen') === '1') } catch { /* ignore */ }

    // mișcare redusă → sărim direct peste intro, fără animație
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      onComplete()
      return
    }
    const flyTimer = window.setTimeout(() => {
      const el = document.querySelector('.aik-corner')
      if (el) {
        const r = el.getBoundingClientRect()
        if (r.width > 0) setTarget({ x: r.left + r.width / 2, y: r.top + r.height / 2, scale: r.width / MASCOT_SIZE })
      }
      setPhase('flying')
    }, HOLD_MS)
    const doneTimer = window.setTimeout(onComplete, HOLD_MS + FLY_MS + 80)
    return () => {
      window.clearTimeout(flyTimer)
      window.clearTimeout(doneTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mascot-intro-overlay" aria-hidden="true">
      <div
        className={`mascot-intro-fox ${phase === 'flying' ? 'flying' : ''}`}
        style={{
          '--intro-size': `${MASCOT_SIZE}px`,
          ...(phase === 'flying' && target
            ? { top: `${target.y}px`, left: `${target.x}px`, transform: `translate(-50%, -50%) scale(${target.scale})` }
            : {}),
        } as CSSProperties}
      >
        <Mascot
          state={phase === 'enter' ? 'cheering' : 'idle'}
          size={MASCOT_SIZE}
          message={phase === 'enter' && !seenBefore ? 'Salut, sînt Aik 🦊' : null}   // fără „Bine ai revenit" la reveniri
        />
      </div>
    </div>
  )
}

export default MascotIntro
