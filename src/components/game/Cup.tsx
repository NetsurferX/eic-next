'use client'

import { forwardRef, type CSSProperties } from 'react'

// ── Confetti — o mică explozie de particule, pur CSS, fără librării externe.
//    `big` întinde traiectoria și mărește particulele, pentru celebrarea de nivel. ──
const CONFETTI_COLORS = ['#008E40', '#EE5B00', '#FF3399', '#CC0000', '#FFB300']

export function Confetti({ count = 14, big = false }: { count?: number; big?: boolean }) {
  return (
    <span className="confetti-burst" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`confetti-piece ${big ? 'is-big' : ''} cp-${i % 8}`}
          style={{ '--confetti-color': CONFETTI_COLORS[i % CONFETTI_COLORS.length] } as CSSProperties}
        />
      ))}
    </span>
  )
}

// ── Cupă de umplere reutilizabilă — un lichid colorat urcă spre buza cupei
//    pe măsură ce progresul crește. Folosită pentru cupa de nivel din header,
//    cupa fiecărei coloane, cupa mare din overlay-ul de nivel și teaser-ul
//    de pe pagina principală — doar cu culoare, mărime și opțiuni
//    (bule/glow/inel/confetti mare) diferite. ──
export const Cup = forwardRef<HTMLDivElement, {
  progressPct: number; size?: number; color?: string; celebrating?: boolean; allFull?: boolean; idSuffix: string; confettiCount?: number; big?: boolean; showBubbles?: boolean; className?: string; ring?: boolean; activePulse?: boolean; bump?: boolean
}>(function Cup({ progressPct, size = 64, color = '#FFB300', celebrating = false, allFull = false, idSuffix, confettiCount = 14, big = false, showBubbles = false, className = '', ring = false, activePulse = false, bump = false }, ref) {
  const innerTop = 15, innerBottom = 85
  const fillHeight = ((innerBottom - innerTop) * Math.max(0, Math.min(100, progressPct))) / 100
  const fillY = innerBottom - fillHeight
  const gradId = `cupGrad-${idSuffix}`
  const clipId = `cupClip-${idSuffix}`
  return (
    <div
      ref={ref}
      className={`fill-cup ${allFull ? 'is-full' : ''} ${celebrating ? 'is-celebrating' : ''} ${activePulse ? 'is-active-pulse' : ''} ${bump ? 'is-bump' : ''} ${className}`}
      style={{ width: size, height: size, '--cup-color': color } as CSSProperties}
    >
      <svg viewBox="0 0 100 100" className="fill-cup-svg" aria-hidden="true">
        <defs>
          <clipPath id={clipId}>
            <path d="M20,15 L80,15 L72,70 Q72,85 50,85 Q28,85 28,70 Z" />
          </clipPath>
          <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={`color-mix(in srgb, ${color} 55%, white)`} />
          </linearGradient>
          <linearGradient id={`${gradId}-sheen`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.55" />
            <stop offset="45%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ring && (
          <>
            <circle className="fill-cup-ring-bg" cx="50" cy="50" r="48" />
            <circle className="fill-cup-ring" cx="50" cy="50" r="48" style={{ '--ring-pct': progressPct } as CSSProperties} />
          </>
        )}
        <g clipPath={`url(#${clipId})`}>
          <rect className="fill-cup-liquid" x="15" y={fillY} width="70" height={fillHeight} fill={`url(#${gradId})`} />
          {showBubbles && progressPct > 0 && (
            <>
              <circle className="fill-cup-bubble b1" cx="38" cy="78" r="2.6" />
              <circle className="fill-cup-bubble b2" cx="53" cy="78" r="1.9" />
              <circle className="fill-cup-bubble b3" cx="46" cy="78" r="2.3" />
            </>
          )}
          {/* diagonal shine sweep — a soft highlight travelling across the cup on a loop */}
          <rect className="fill-cup-shine" x="0" y="10" width="16" height="80" fill="white" />
        </g>
        {/* glass sheen — a soft diagonal highlight, purely decorative */}
        <path d="M20,15 L80,15 L72,70 Q72,85 50,85 Q28,85 28,70 Z" fill={`url(#${gradId}-sheen)`} clipPath={`url(#${clipId})`} />
        <path className="fill-cup-outline" d="M20,15 L80,15 L72,70 Q72,85 50,85 Q28,85 28,70 Z" />
        <path className="fill-cup-outline" d="M20,20 Q4,20 4,35 Q4,52 23,49" />
        <path className="fill-cup-outline" d="M80,20 Q96,20 96,35 Q96,52 77,49" />
        <rect className="fill-cup-outline-fill" x="41" y="85" width="18" height="7" />
        <rect className="fill-cup-outline-fill" x="29" y="92" width="42" height="5" rx="2" />
      </svg>
      {celebrating && (
        <span className={`fill-cup-sparkles ${big ? 'is-big' : ''}`} aria-hidden="true">
          <Confetti count={confettiCount} big={big} />
        </span>
      )}
    </div>
  )
})
