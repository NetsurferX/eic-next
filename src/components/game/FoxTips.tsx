'use client'

import { useEffect } from 'react'
import type { FoxTip } from '@/components/game/FoxHelper'

// ── Mesajele și meniul rapid ale lui Aik, afișate lângă MEDALIONUL DE SUS
//    (capul vulpii din coloana activă). Preia rolul fostului medalion de jos
//    (FoxHelper): coada de mesaje (bulă care dispare singură). Meniul vulpii
//    NU mai e aici — se deschide din butonul HELP din bara de sus a paginii.
//    Nu desenează avatarul — medalionul îl desenează LearnPage. ──

export function FoxTips({
  queue,
  onDequeue,
}: {
  queue: FoxTip[]
  onDequeue: () => void
}) {
  const current = queue[0] ?? null

  // Scoate mesajul curent din coadă după o durată proporțională cu lungimea textului.
  useEffect(() => {
    if (!current) return
    const dur = Math.max(2600, Math.min(current.text.length * 60, 6000))
    const t = setTimeout(onDequeue, dur)
    return () => clearTimeout(t)
  }, [current?.id, onDequeue])   // eslint-disable-line react-hooks/exhaustive-deps

  if (!current) return null

  return (
    <div
      className="fox-tips"
      role="status"
      onClick={(e) => e.stopPropagation()}   // nu declanșa sunetul literei / selectarea coloanei
    >
      <div className={`fox-bubble fox-bubble-${current.mood ?? 'idle'}`}>
        <p className="fox-bubble-text">{current.text}</p>
      </div>
    </div>
  )
}
