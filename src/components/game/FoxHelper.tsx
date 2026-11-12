'use client'

import { useState, useEffect, useRef } from 'react'
import { useSpringLook } from '@/components/game/useSpringLook'
import { FoxReel, FACE_IDLE_REEL } from '@/components/game/useFrameCycle'

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

// ── avatarul rotund folosește portretele din `public/mascot/` (`fox.png`/
//    `fox-run.png` nu se mai folosesc nicăieri) — câte un cadru pentru
//    fiecare dispoziție ── */
const FACE_BY_MOOD: Record<FoxMood, string> = {
  idle: '/mascot/face-smile.png',
  greeting: '/mascot/face-wink.png',
  celebrate: '/mascot/face-laugh.png',
  hint: '/mascot/face-thinking.png',
}

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

  const lookRef = useRef<HTMLSpanElement>(null)
  const pointer = useRef<{ x: number; y: number } | null>(null)
  useEffect(() => {
    const onMove = (e: PointerEvent) => { pointer.current = { x: e.clientX, y: e.clientY } }
    const onLeave = () => { pointer.current = null }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [])
  useSpringLook(lookRef, () => pointer.current, { maxRot: 9, maxShift: 3 })

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
        <span
          ref={lookRef}
          className={`fox-helper-motion fox-helper-motion-${mood} ${thinking ? 'is-thinking' : ''}`}
          style={{ display: 'block', width: '100%', height: '100%', transformOrigin: '50% 72%' }}
        >
          {mood === 'idle' ? (
            <FoxReel frames={FACE_IDLE_REEL} className="fox-avatar-img" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={FACE_BY_MOOD[mood]} alt="" className="fox-avatar-img" draggable={false} />
          )}
          {thinking && <span className="fox-helper-thoughts" aria-hidden="true"><i /><i /><i /></span>}
          {mood === 'celebrate' && <span className="fox-helper-sparkles" aria-hidden="true">✦ ✧ ✦</span>}
          {mood === 'greeting' && <span className="fox-helper-wave" aria-hidden="true">✦</span>}
        </span>
      </button>
      <style jsx>{`
        .fox-helper-motion { position: relative; }
        .fox-helper-motion-hint { animation: fox-helper-listen 2.8s ease-in-out infinite; }
        .fox-helper-motion-greeting { animation: fox-helper-greet 1.5s ease-in-out 2; }
        .fox-helper-motion-celebrate { animation: fox-helper-celebrate 650ms ease-in-out 3; }
        .fox-helper-thoughts { position:absolute; right:2%; top:2%; display:flex; align-items:flex-end; gap:3px; }
        .fox-helper-thoughts i { display:block; width:5px; height:5px; border-radius:50%; background:#fff; box-shadow:0 1px 5px #5678; animation:fox-helper-thought 1s ease-in-out infinite alternate; }
        .fox-helper-thoughts i:nth-child(2) { width:7px; height:7px; animation-delay:140ms; }
        .fox-helper-thoughts i:nth-child(3) { width:9px; height:9px; animation-delay:280ms; }
        .fox-helper-sparkles,.fox-helper-wave { position:absolute; color:#f7b928; font-size:15px; font-weight:900; text-shadow:0 1px 3px #fff; pointer-events:none; }
        .fox-helper-sparkles { left:-12%; top:-10%; letter-spacing:3px; animation:fox-helper-spark 700ms ease-in-out infinite alternate; }
        .fox-helper-wave { right:-8%; top:0; animation:fox-helper-wave 500ms ease-in-out 3; }
        @keyframes fox-helper-listen { 0%,100% { transform:rotate(0) translateY(0) } 35% { transform:rotate(-3deg) translateY(-2px) } 68% { transform:rotate(2deg) translateY(0) } }
        @keyframes fox-helper-greet { 0%,100% { transform:rotate(0) } 25% { transform:rotate(-4deg) translateY(-2px) } 55% { transform:rotate(3deg) } }
        @keyframes fox-helper-celebrate { 0%,100% { transform:scale(1) } 45% { transform:scale(1.08) rotate(-2deg) } }
        @keyframes fox-helper-thought { to { transform:translateY(-7px); opacity:.45 } }
        @keyframes fox-helper-spark { to { transform:translateY(-5px) scale(1.12); opacity:.6 } }
        @keyframes fox-helper-wave { 0%,100% { transform:rotate(0) } 50% { transform:rotate(22deg) translateY(-3px) } }
        @media (prefers-reduced-motion:reduce) { .fox-helper-motion,.fox-helper-motion * { animation:none !important; transition:none !important } }
      `}</style>
    </div>
  )
}
