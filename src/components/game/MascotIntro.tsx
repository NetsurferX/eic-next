'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Mascot } from './Mascot'

// ── Intro de bun-venit: la deschiderea paginii, vulpea apare mare, la
//    centrul ecranului, apoi „zboară" spre locul ei permanent — dock-ul
//    din colțul dreapta-jos (`.fox-helper`/`.fox-avatar`, vezi
//    FoxHelper.tsx). Poziția/dimensiunea de sosire (în CSS, `.flying`) sunt
//    ținute manual în sincron cu regulile `.fox-helper`/`.fox-avatar` din
//    globals.css — dacă acelea se schimbă, actualizează-le și pe astea.
//
//    Randată doar cât timp `onComplete` nu a fost încă apelat — la final,
//    componenta-părinte o demontează și montează dock-ul real (FoxHelper)
//    exact în locul unde a aterizat vulpea mare, pentru o predare fără
//    sărituri vizuale. ──

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

  useEffect(() => {
    try { setSeenBefore(localStorage.getItem('eic-fox-seen') === '1') } catch { /* ignore */ }

    // mișcare redusă → sărim direct peste intro, fără animație
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      onComplete()
      return
    }
    const flyTimer = window.setTimeout(() => setPhase('flying'), HOLD_MS)
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
        style={{ '--intro-size': `${MASCOT_SIZE}px` } as CSSProperties}
      >
        <Mascot
          state={phase === 'enter' ? 'cheering' : 'idle'}
          size={MASCOT_SIZE}
          message={phase === 'enter' ? (seenBefore ? 'Bine ai revenit!' : 'Salut! Sunt Vulpea 🦊') : null}
        />
      </div>
    </div>
  )
}

export default MascotIntro
