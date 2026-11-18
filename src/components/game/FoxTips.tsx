'use client'

import { useEffect, useRef } from 'react'
import type { FoxTip, FoxAction } from '@/components/game/FoxHelper'

// ── Mesajele și meniul rapid ale lui Aik, afișate lângă MEDALIONUL DE SUS
//    (capul vulpii din coloana activă). Preia rolul fostului medalion de jos
//    (FoxHelper): coada de mesaje (bulă care dispare singură) + meniul de
//    acțiuni la apăsarea medalionului. Nu desenează avatarul — medalionul
//    îl desenează LearnPage; aici doar bula / meniul, poziționate sub el. ──

export function FoxTips({
  queue,
  onDequeue,
  actions,
  menuOpen,
  onMenuOpenChange,
}: {
  queue: FoxTip[]
  onDequeue: () => void
  actions: FoxAction[]
  menuOpen: boolean
  onMenuOpenChange: (open: boolean) => void
}) {
  const current = queue[0] ?? null
  const rootRef = useRef<HTMLDivElement>(null)

  // Scoate mesajul curent din coadă după o durată proporțională cu lungimea textului.
  useEffect(() => {
    if (!current) return
    const dur = Math.max(2600, Math.min(current.text.length * 60, 6000))
    const t = setTimeout(onDequeue, dur)
    return () => clearTimeout(t)
  }, [current?.id, onDequeue])   // eslint-disable-line react-hooks/exhaustive-deps

  // Meniul se închide la apăsarea în afara lui sau a medalionului.
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: PointerEvent) => {
      const target = e.target as Element | null
      if (target?.closest('.fox-tips, .aik-corner')) return
      onMenuOpenChange(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [menuOpen, onMenuOpenChange])

  if (!menuOpen && !current) return null

  return (
    <div
      ref={rootRef}
      className="fox-tips"
      role="status"
      onClick={(e) => e.stopPropagation()}   // nu declanșa sunetul literei / selectarea coloanei
    >
      {menuOpen && actions.length > 0 ? (
        <div className="fox-menu">
          {actions.map(a => (
            <button
              key={a.id}
              type="button"
              className="fox-menu-item"
              onClick={() => { a.onClick(); onMenuOpenChange(false) }}
            >
              {a.label}
            </button>
          ))}
        </div>
      ) : current ? (
        <div className={`fox-bubble fox-bubble-${current.mood ?? 'idle'}`}>
          <p className="fox-bubble-text">{current.text}</p>
        </div>
      ) : null}
    </div>
  )
}
