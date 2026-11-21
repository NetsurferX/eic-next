'use client'

import { useId, type CSSProperties } from 'react'

// ── Tăblița de lemn vechi „HELP", atârnată sub pontonul vulpii (jocul cu pești).
//    Preia sarcina fostului buton „Ajută-mă": apăsată, vulpea spune sunetul
//    din nou (costă o inimioară). Desenată integral în SVG — literele de pirat
//    sunt trasee (nu font), deci arată la fel pe orice dispozitiv, fără încărcări
//    externe. Dimensiunea desenului: 132×58 (viewBox). ──

export const HELP_SIGN_W = 132
export const HELP_SIGN_H = 58

function HelpLetters() {
  return (
    <>
      <g transform="translate(20 18)">{/* H */}
        <path d="M0 1 L8 0 L7.4 29 L1 30 Z" /><path d="M14 1 L22 0 L21 29 L13.6 30 Z" /><path d="M7 12 L15 11 L14.6 18.6 L7 19.4 Z" />
        <path d="M-1.5 0.2 L10 -1 L8.6 3.6 L0 4.4 Z" /><path d="M12.4 0 L23.5 -1.2 L22 3.4 L13.4 4.2 Z" />
        <path d="M-1.2 29 L9 29.4 L8.4 31.2 L-1 31 Z" /><path d="M12.6 29.4 L22.8 29 L23 31 L12.8 31.4 Z" />
      </g>
      <g transform="translate(48 18)">{/* E */}
        <path d="M0 1 L8 0 L7.4 29 L1 30 Z" />
        <path d="M-1.5 0.2 L10 -1 L9 3.6 L0 4.4 Z" />
        <path d="M7 0.4 L18 2 L17.4 8.4 L14.6 6.2 L7 7 Z" />
        <path d="M7 12.4 L15.4 12 L15 17.4 L7 17.8 Z" />
        <path d="M7 23.4 L14.6 22 L18.4 25.4 L17.6 30.6 L7 30 Z" />
        <path d="M-1.2 29 L9 29.4 L8.4 31.2 L-1 31 Z" />
      </g>
      <g transform="translate(72 18)">{/* L */}
        <path d="M0 1 L8 0 L7.4 29 L1 30 Z" />
        <path d="M-1.5 0.2 L10 -1 L9 3.6 L0 4.4 Z" />
        <path d="M7 23 L12.4 21.4 L16.6 24.6 L16 30.6 L7 30 Z" />
        <path d="M-1.2 29 L9 29.4 L8.4 31.2 L-1 31 Z" />
      </g>
      <g transform="translate(94 18)">{/* P */}
        <path d="M0 1 L8 0 L7.4 29 L1 30 Z" />
        <path d="M-1.5 0.2 L10 -1 L9 3.6 L0 4.4 Z" />
        <path fillRule="evenodd" d="M7 0.4 L12 0 Q19.4 0 19.4 9.4 Q19.4 18.6 12 18.6 L7 19 Z M7.4 5.6 L10.6 5.4 Q13.4 5.6 13.4 9.4 Q13.4 13.4 10.6 13.6 L7.4 13.8 Z" />
        <path d="M-1.2 29 L9 29.4 L8.4 31.2 L-1 31 Z" />
      </g>
    </>
  )
}

export function HelpSign({
  onClick,
  disabled,
  style,
  width = HELP_SIGN_W,
  ropes = true,
  className = 'pf-sign',
  ariaLabel = 'Ajută-mă: ascultă din nou sunetul',
  expanded,
  cream = false,
}: {
  onClick: () => void
  disabled?: boolean
  style?: CSSProperties
  width?: number          // lățimea desenată; înălțimea se scalează proporțional
  ropes?: boolean         // false = doar scândura (varianta compactă, fără frânghii)
  className?: string
  ariaLabel?: string
  expanded?: boolean      // dacă e setat, tăblița deschide un meniu (aria-haspopup + aria-expanded)
  cream?: boolean         // litere alb-gălbui, cu contur brun-închis (în loc de litere închise tăiate în lemn)
}) {
  const gid = useId().replace(/:/g, '')
  // Fără frânghii, decupăm desenul pe scândură (y 11 → 57); altfel îl arătăm întreg.
  const vbY = ropes ? 0 : 11
  const vbH = ropes ? HELP_SIGN_H : 46
  const height = (width * vbH) / HELP_SIGN_W
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-haspopup={expanded === undefined ? undefined : 'menu'}
      aria-expanded={expanded}
      title="HELP"
      style={{
        position: 'absolute', padding: 0, margin: 0, border: 'none', background: 'none',
        width, height, ...style,
      }}
    >
      <svg width={width} height={height} viewBox={`0 ${vbY} ${HELP_SIGN_W} ${vbH}`} style={{ display: 'block', overflow: 'visible' }} aria-hidden="true">
        <defs>
          <linearGradient id={`${gid}-wood`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b98c54" /><stop offset=".5" stopColor="#9a6f3f" /><stop offset="1" stopColor="#7a5430" />
          </linearGradient>
        </defs>
        {/* frânghii */}
        {ropes && (
          <>
            <path d="M22 0 L24 14" stroke="#5a3f24" strokeWidth="3" strokeLinecap="round" />
            <path d="M22 0 L24 14" stroke="#b79a6c" strokeWidth="1" strokeDasharray="2 2.2" strokeLinecap="round" />
            <path d="M110 0 L108 14" stroke="#5a3f24" strokeWidth="3" strokeLinecap="round" />
            <path d="M110 0 L108 14" stroke="#b79a6c" strokeWidth="1" strokeDasharray="2 2.2" strokeLinecap="round" />
          </>
        )}
        {/* tăblia, cu margini roase */}
        <path
          d="M4 14 L20 12.5 L46 14 L74 12.5 L100 14 L128 12.8 L129.5 20 L128 31 L129 44 L127 53 L102 54.5 L76 53 L50 54.6 L24 53.2 L5 54.5 L3 44 L4.5 31 L3 21 Z"
          fill={`url(#${gid}-wood)`} stroke="#3f2a16" strokeWidth="2" strokeLinejoin="round"
        />
        {/* fibre */}
        <g fill="none" stroke="#4a3018" strokeWidth=".8" opacity=".38" strokeLinecap="round">
          <path d="M6 19 C30 17 50 21 78 18 S112 20 127 18" />
          <path d="M5 25 C28 27 56 23 84 26 S110 24 128 26" />
          <path d="M6 41 C30 39 52 43 80 40 S112 42 127 40" />
          <path d="M5 48 C26 50 54 46 82 49 S112 47 127 49" />
        </g>
        {/* crăpătură (între litere) și pete de uzură */}
        <path d="M69 12.8 L71 21 L68 27 L70 33" fill="none" stroke="#2c1b0c" strokeWidth="1.1" strokeLinecap="round" opacity=".7" />
        <ellipse cx="14" cy="47" rx="9" ry="3.2" fill="#5f6b3c" opacity=".28" />
        <ellipse cx="116" cy="20" rx="8" ry="2.6" fill="#5f6b3c" opacity=".22" />
        <ellipse cx="88" cy="50" rx="12" ry="2.4" fill="#3b2510" opacity=".25" />
        {/* cuie */}
        <g fill="#2c1d10"><circle cx="10" cy="19" r="2.1" /><circle cx="122" cy="19" r="2.1" /><circle cx="10" cy="48" r="2.1" /><circle cx="122" cy="48" r="2.1" /></g>
        <g fill="#c9a36b" opacity=".7"><circle cx="9.5" cy="18.4" r=".7" /><circle cx="121.5" cy="18.4" r=".7" /><circle cx="9.5" cy="47.4" r=".7" /><circle cx="121.5" cy="47.4" r=".7" /></g>
        {/* literele de pirat: întâi o umbră deschisă (efect de tăietură), apoi literele */}
        {cream ? (
          <>
            {/* litere alb-gălbui: întâi un contur brun-închis, apoi literele */}
            <g fill="#2a1a0d" stroke="#2a1a0d" strokeWidth="2.6" strokeLinejoin="round" opacity=".9"><HelpLetters /></g>
            <g fill="#f6efc9" stroke="#f6efc9" strokeWidth=".6" strokeLinejoin="round"><HelpLetters /></g>
          </>
        ) : (
          <>
            <g transform="translate(.9 1.1)" fill="#e2bd86" stroke="#e2bd86" strokeWidth=".6" strokeLinejoin="round" opacity=".38"><HelpLetters /></g>
            <g fill="#2a1a0d" stroke="#2a1a0d" strokeWidth=".6" strokeLinejoin="round"><HelpLetters /></g>
          </>
        )}
      </svg>
    </button>
  )
}
