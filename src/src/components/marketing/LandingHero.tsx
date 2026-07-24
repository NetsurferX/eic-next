'use client'

import { useState } from 'react'
import { COLOR_LABELS } from '@/lib/rules/colors'
import './landing.css'

// Same sounds as the real legend (src/lib/rules/colors.ts), with the display
// swatch darkened slightly for contrast against this page's light turquoise
// background. Label/example text still comes straight from the production
// entries via their real (undarkened) hex.
const LEGEND_PAIRS: [displayHex: string, prodHex: string][] = [
  ['#0057B8', '#00b0f0'],
  ['#C0003C', '#CC0000'],
  ['#D4560B', '#EE5B00'],
  ['#6B2C91', '#7030A0'],
  ['#B8860B', '#FCD116'],
  ['#2B4C9B', '#4472C4'],
  ['#1B8A3D', '#23D300'],
  ['#833C0B', '#833C0B'],
]

const SOUNDS = LEGEND_PAIRS.map(([hex, prodHex]) => ({
  hex,
  label: COLOR_LABELS[prodHex]?.label ?? '',
  example: COLOR_LABELS[prodHex]?.example ?? '',
}))

const VOWEL_HEX: Record<string, string> = {
  a: '#0057B8', e: '#D4560B', i: '#C0003C', o: '#B8860B', u: '#6B2C91', y: '#C0003C',
}

function LiveColoredText({ value }: { value: string }) {
  return (
    <>
      {value.split('').map((ch, i) => {
        const hex = VOWEL_HEX[ch.toLowerCase()]
        return (
          <span key={i} className={hex ? 'eic-landing-vowel' : undefined} style={{ color: hex ?? '#0B3B3A' }}>
            {ch}
          </span>
        )
      })}
    </>
  )
}

function OwlMascot() {
  return (
    <svg viewBox="0 0 220 240" className="eic-landing-owl-svg" aria-hidden="true">
      <defs>
        <radialGradient id="owlBody2" cx="38%" cy="25%" r="85%">
          <stop offset="0%" stopColor="#EFC98A" />
          <stop offset="55%" stopColor="#DFA968" />
          <stop offset="100%" stopColor="#B87F45" />
        </radialGradient>
        <linearGradient id="owlBelly2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBF1DC" />
          <stop offset="100%" stopColor="#EAD3A3" />
        </linearGradient>
        <linearGradient id="owlWing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8F5A2E" />
          <stop offset="100%" stopColor="#6E3F1F" />
        </linearGradient>
      </defs>

      <ellipse cx="110" cy="224" rx="52" ry="8" fill="#0B3B3A" opacity="0.15" />
      <path d="M92 205 Q110 220 128 205 L120 175 L100 175 Z" fill="#8F5A2E" />

      <path d="M52 130 Q34 100 44 70 Q58 95 66 108 Q70 140 84 168 Q60 165 52 130 Z" fill="url(#owlWing)" />
      <path d="M168 130 Q186 100 176 70 Q162 95 154 108 Q150 140 136 168 Q160 165 168 130 Z" fill="url(#owlWing)" />
      <path d="M58 118 Q50 128 56 140" stroke="#5C3116" strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M162 118 Q170 128 164 140" stroke="#5C3116" strokeWidth="2" fill="none" opacity="0.5" />

      <ellipse cx="110" cy="140" rx="54" ry="66" fill="url(#owlBody2)" />
      <ellipse cx="110" cy="168" rx="32" ry="38" fill="url(#owlBelly2)" />
      {[0, 1, 2].map(row =>
        Array.from({ length: 4 - (row % 2) }).map((_, col) => (
          <path
            key={`${row}-${col}`}
            d={`M${88 + col * 15 + (row % 2 ? 7 : 0)} ${146 + row * 16} q6 8 0 16 q-6 -8 0 -16 Z`}
            fill="#DDBB86"
            opacity={0.55}
          />
        ))
      )}

      <path d="M84 48 Q78 30 92 22 Q86 40 94 54 Z" fill="#B87F45" />
      <path d="M136 48 Q142 30 128 22 Q134 40 126 54 Z" fill="#B87F45" />

      <circle cx="110" cy="86" r="44" fill="url(#owlBody2)" />
      <ellipse cx="110" cy="92" rx="38" ry="34" fill="#F6E4BE" opacity={0.9} />

      <circle cx="93" cy="90" r="15" fill="#2B1608" />
      <circle cx="127" cy="90" r="15" fill="#2B1608" />
      <circle cx="93" cy="90" r="15" fill="none" stroke="#B87F45" strokeWidth="2.5" />
      <circle cx="127" cy="90" r="15" fill="none" stroke="#B87F45" strokeWidth="2.5" />
      <circle cx="96" cy="86" r="5.5" fill="#F6E4BE" />
      <circle cx="130" cy="86" r="5.5" fill="#F6E4BE" />
      <circle cx="93" cy="90" r="8.5" fill="#1A0E05" />
      <circle cx="127" cy="90" r="8.5" fill="#1A0E05" />
      <circle cx="90" cy="87" r="2.2" fill="#fff" opacity={0.85} />
      <circle cx="124" cy="87" r="2.2" fill="#fff" opacity={0.85} />

      <path d="M104 104 L116 104 L110 118 Z" fill="#E8873A" />
      <path d="M104 104 L116 104 L110 111 Z" fill="#D9732A" />

      <path d="M80 76 Q93 70 104 76" stroke="#8F5A2E" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity={0.7} />
      <path d="M116 76 Q127 70 140 76" stroke="#8F5A2E" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity={0.7} />

      <path d="M96 202 l-4 12 M100 204 l0 12 M104 202 l4 12" stroke="#D9732A" strokeWidth="3" strokeLinecap="round" />
      <path d="M116 202 l-4 12 M120 204 l0 12 M124 202 l4 12" stroke="#D9732A" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export default function LandingHero() {
  const [value, setValue] = useState('seashells')

  return (
    <div className="eic-landing">
      <nav className="eic-landing-nav">
        <div className="eic-landing-brand">
          <span className="eic-landing-badge">EiC</span>
          <span className="eic-landing-brand-name">English in Colours</span>
        </div>
        <div className="eic-landing-nav-links">
          <a href="/" className="eic-landing-nav-link eic-landing-nav-link--active">Home</a>
          <a href="#" className="eic-landing-nav-link">About</a>
          <a href="/learn" className="eic-landing-nav-link">Study</a>
          <a href="#" className="eic-landing-nav-link">Brewn</a>
        </div>
        <button className="eic-landing-signup">Sign up</button>
      </nav>

      <div className="eic-landing-headline-wrap">
        <p className="eic-landing-eyebrow">Phonics, visualized</p>
        <h1 className="eic-landing-h1">
          See, Hear, Speak:
          <br />
          English, Decoded.
        </h1>
        <p className="eic-landing-sub">
          Master pronunciation with instant, visual grapheme coloring — every
          sound gets its own color, every silent letter fades away.
        </p>
      </div>

      <main className="eic-landing-main">
        <div className="eic-landing-input-card">
          <p className="eic-landing-input-label">Try it — type any word or sentence</p>
          <div className="eic-landing-input-row">
            <input
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Type a word or sentence…"
              className="eic-landing-input"
            />
            <button className="eic-landing-decode-btn">Decode →</button>
          </div>
          <div className="eic-landing-preview">
            <LiveColoredText value={value || 'type something above'} />
          </div>
          <div className="eic-landing-cta-row">
            <a href="/" className="eic-landing-btn-primary">Start Learning →</a>
            <a href="#" className="eic-landing-btn-secondary">Explore Features</a>
          </div>
        </div>
      </main>

      <section className="eic-landing-lower">
        <div className="eic-landing-card">
          <p className="eic-landing-card-label">Sound Legend</p>
          <div className="eic-landing-legend-grid">
            {SOUNDS.map(s => (
              <div key={s.hex} className="eic-landing-legend-item">
                <span className="eic-landing-dot" style={{ background: s.hex }} />
                <span className="eic-landing-legend-ipa" style={{ color: s.hex }}>{s.label}</span>
                <span className="eic-landing-legend-ex">— {s.example}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="eic-landing-owl-wrap">
          <OwlMascot />
        </div>

        <div className="eic-landing-card eic-landing-stats-card">
          <div className="eic-landing-stat">
            <p className="eic-landing-stat-label">Words</p>
            <p className="eic-landing-stat-value">6</p>
          </div>
          <div className="eic-landing-stat">
            <p className="eic-landing-stat-label">Top sound</p>
            <p className="eic-landing-stat-value" style={{ color: '#C0003C' }}>i/ɪ</p>
          </div>
          <div className="eic-landing-stat">
            <p className="eic-landing-stat-label">Coach</p>
            <p className="eic-landing-stat-value">/i:/</p>
          </div>
          <div className="eic-landing-stat">
            <p className="eic-landing-stat-label">Difficulty</p>
            <p className="eic-landing-stat-value eic-landing-stat-muted">B1</p>
          </div>
        </div>
      </section>
    </div>
  )
}
