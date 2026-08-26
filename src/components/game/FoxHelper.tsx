'use client'

import { useState, useEffect } from 'react'

// ── Vulpea-asistent (FoxHelper) — spre deosebire de Mascot (bufnița din
//    docul de coloană/nivel), asta stă PERMANENT pe ecran, ca un Clippy
//    prietenos: salută la intrare, comentează evenimentele jocului printr-o
//    coadă de mesaje (queue) și oferă un meniu rapid de acțiuni la click.
//    Mesajul implicit (idleTip) e mereu calculat live din starea lecției de
//    către LearnPage — vulpea nu are propriul set de „tips" rotative. ──

export type FoxMood = 'greeting' | 'celebrate' | 'hint' | 'idle'

export type FoxTip = { id: string; text: string; mood?: FoxMood }
export type FoxAction = { id: string; label: string; onClick: () => void }

const FIDGETS = ['fox-fidget-wag', 'fox-fidget-wink', 'fox-fidget-tilt']

export function FoxHelper({
  idleTip,
  queue = [],
  onDequeue,
  actions,
}: {
  idleTip: string
  queue?: FoxTip[]
  onDequeue?: () => void
  actions?: FoxAction[]
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [fidget, setFidget] = useState<string | null>(null)
  const [thinking, setThinking] = useState(false)

  const current = queue[0] ?? null

  // Rezolvă mesajul curent din coadă, cu o pauză scurtă de "gândit" înainte
  // de text, apoi îl scoate din coadă singur după o durată proporțională cu
  // lungimea textului.
  useEffect(() => {
    if (!current) return
    setThinking(true)
    const think = setTimeout(() => setThinking(false), 350)
    const dur = Math.max(2600, Math.min(current.text.length * 60, 6000))
    const dequeue = setTimeout(() => onDequeue?.(), dur)
    return () => { clearTimeout(think); clearTimeout(dequeue) }
  }, [current?.id, onDequeue])

  // Fidget-uri aleatorii — doar cât timp vulpea n-are nimic de spus și
  // meniul e închis, ca să nu pară complet inertă în starea idle.
  useEffect(() => {
    if (current || menuOpen) return
    const t = setInterval(() => {
      setFidget(FIDGETS[Math.floor(Math.random() * FIDGETS.length)])
      setTimeout(() => setFidget(null), 900)
    }, 8000 + Math.random() * 6000)
    return () => clearInterval(t)
  }, [current, menuOpen])

  const tip = current ?? (menuOpen ? null : { id: 'idle', text: idleTip, mood: 'idle' as const })
  const mood: FoxMood = tip?.mood ?? 'idle'

  return (
    <div className="fox-helper" role="status">
      {menuOpen && actions && actions.length > 0 && (
        <div className="fox-menu">
          {actions.map(a => (
            <button key={a.id} className="fox-menu-item" onClick={() => { a.onClick(); setMenuOpen(false) }}>
              {a.label}
            </button>
          ))}
        </div>
      )}

      {!menuOpen && tip && (
        <div className={`fox-bubble fox-bubble-${mood}`}>
          <p className="fox-bubble-text">{thinking ? '···' : tip.text}</p>
        </div>
      )}

      <button
        className={`fox-avatar fox-avatar-${mood} ${fidget ?? ''}`}
        onClick={() => setMenuOpen(m => !m)}
        aria-label="Asistent"
        title="Vulpea te ajută"
      >
        {mood === 'celebrate' ? '🥳' : '🦊'}
      </button>
    </div>
  )
}
