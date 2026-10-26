'use client'

// src/app/page.tsx — pagina principală (poarta de intrare).
// Două plăci 3D, apăsabile:
//   „EiC"   → /eic    (editorul, fostă pagină principală)
//   „study" → /learn  (lecțiile / jocul)
// Stilurile sunt locale (prefix .gw-) — nu ating globals.css.
//
// Placa „EiC" e blocată până se termină toate etapele din „study" (vezi mai jos).

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LEVELS, STORAGE_KEY, REPS_PER_LESSON, type SavedProgress } from '@/lib/levels'

// Placa „EiC" rămâne blocată până când utilizatorul termină TOATE etapele
// din „study" (/learn). Sursa adevărului: `allDone` din progresul salvat
// (STORAGE_KEY) — același flag pe care /learn îl setează la ultimul nivel.
// Blocarea e doar la nivelul butonului: ruta /eic în sine nu e atinsă.

export default function Gateway() {
  // null = încă necitit (prima randare / SSR) → tratat ca blocat, fără text
  const [done, setDone] = useState<boolean | null>(null)
  const [pct, setPct] = useState(0)
  const [nudge, setNudge] = useState(false)

  useEffect(() => {
    let finished = false
    let progress = 0
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SavedProgress>
        finished = saved.allDone === true
        const earned = (saved.starsEarned ?? []).flat().reduce((a, b) => a + b, 0)
        const max = LEVELS.reduce((a, l) => a + l.lessons.length, 0) * REPS_PER_LESSON
        progress = finished ? 100 : Math.min(99, Math.round((earned / max) * 100))
      }
    } catch { /* ignore */ }
    setDone(finished)
    setPct(progress)
  }, [])

  const unlocked = done === true

  return (
    <main className="gw-page">
      <style>{CSS}</style>

      {unlocked ? (
        <Link href="/eic" className="gw-tile gw-eic" aria-label="EiC — editorul">
          <span className="gw-band">EiC</span>
        </Link>
      ) : (
        <div className="gw-eic-wrap">
          <button
            type="button"
            className={`gw-tile gw-eic gw-locked${nudge ? ' gw-nudge' : ''}`}
            aria-disabled="true"
            aria-label="EiC — blocat până termini toate etapele din study"
            onClick={() => { setNudge(false); requestAnimationFrame(() => setNudge(true)) }}
            onAnimationEnd={e => { if (e.animationName === 'gw-shake') setNudge(false) }}
          >
            <span className="gw-band">EiC</span>
            <span className="gw-lock" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="9" rx="2.2" fill="currentColor" stroke="none" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
          </button>
          {done === false && (
            <p className="gw-hint">
              Termină toate etapele din <Link href="/learn">study</Link> ca să deschizi EiC
              <span className="gw-meter" aria-label={`Progres ${pct}%`}>
                <span className="gw-meter-fill" style={{ width: `${pct}%` }} />
              </span>
            </p>
          )}
        </div>
      )}

      <Link href="/learn" className="gw-tile gw-study" aria-label="study — lecțiile">
        <span className="gw-band">study</span>
      </Link>
    </main>
  )
}

const CSS = `
.gw-page {
  --gw-blue: #00a2e8;
  --gw-blue-light: #4cc9fa;
  --gw-blue-dark: #0084c0;
  --gw-edge: #005f8e;
  --gw-red: #e53935;

  min-height: 100vh;
  display: flex; flex-wrap: wrap;
  align-items: center; justify-content: center;
  gap: 72px;
  padding: 24px 24px 48px;
  background:
    radial-gradient(circle at 20% 15%, rgba(0, 162, 232, .10) 0, transparent 38%),
    radial-gradient(circle at 82% 85%, rgba(229, 57, 53, .08) 0, transparent 36%),
    radial-gradient(ellipse at 50% 35%, #ffffff 0%, #eaf4fa 100%);
}

.gw-tile {
  position: relative;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  width: 225px; height: 218px;
  border-radius: 32px;
  text-decoration: none;
  background:
    radial-gradient(120% 90% at 30% 0%, rgba(255,255,255,.28) 0%, rgba(255,255,255,0) 55%),
    linear-gradient(160deg, var(--gw-blue-light) 0%, var(--gw-blue) 52%, var(--gw-blue-dark) 100%);
  /* grosimea plăcii + umbra de pe podea + lumină pe muchie */
  box-shadow:
    0 10px 0 var(--gw-edge),
    0 22px 30px rgba(0, 95, 142, .38),
    inset 0 0 0 3px rgba(255, 255, 255, .22),
    inset 0 3px 0 rgba(255, 255, 255, .55),
    inset 0 -14px 24px rgba(0, 60, 100, .22);
  transition:
    transform .18s cubic-bezier(.3,.7,.4,1),
    box-shadow .18s cubic-bezier(.3,.7,.4,1),
    filter .18s;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  animation: gw-pop .55s cubic-bezier(.2,.9,.3,1.2) both;
}
.gw-study { width: 210px; height: 202px; animation-delay: .09s; }

/* luciu curbat pe jumătatea de sus */
.gw-tile::before {
  content: ''; position: absolute; inset: 0 0 50% 0;
  border-radius: 32px 32px 70% 70% / 32px 32px 22% 22%;
  background: linear-gradient(rgba(255,255,255,.34), rgba(255,255,255,0));
  pointer-events: none;
}

/* dungă de lumină care traversează placa la hover */
.gw-tile::after {
  content: ''; position: absolute; top: -20%; bottom: -20%; left: -60%;
  width: 40%;
  background: linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.55) 50%, rgba(255,255,255,0) 100%);
  transform: translateX(0) skewX(-12deg);
  opacity: 0;
  pointer-events: none;
}
.gw-tile:hover::after,
.gw-tile:focus-visible::after {
  opacity: 1;
  transform: translateX(520%) skewX(-12deg);
  transition: transform .7s ease, opacity .15s ease;
}

/* eticheta — o bandă „lipită" pe placă */
.gw-band {
  position: relative; z-index: 1;
  width: 100%;
  padding: 16px 0 14px;
  text-align: center;
  background: linear-gradient(#ffffff 0%, #f4f9fc 60%, #e6f0f7 100%);
  border-top: 3px solid var(--gw-accent);
  border-bottom: 3px solid var(--gw-accent);
  box-shadow:
    inset 0 3px 6px rgba(0,0,0,.08),
    0 4px 10px rgba(0, 60, 100, .22);
  font-family: var(--font-serif);
  font-style: italic; font-weight: 700;
  font-size: 46px; line-height: 1;
  letter-spacing: .01em;
  text-shadow: 0 2px 0 rgba(0,0,0,.08), 0 1px 0 #fff;
  transition: transform .18s cubic-bezier(.3,.7,.4,1);
}
.gw-eic   { --gw-accent: var(--gw-blue); }
.gw-study { --gw-accent: var(--gw-red); }
.gw-eic .gw-band   { color: var(--gw-blue); }
.gw-study .gw-band { color: var(--gw-red); }

/* hover — placa se ridică și se înclină ușor */
.gw-tile:hover {
  transform: translateY(-8px) rotate(-1deg);
  filter: brightness(1.06) saturate(1.05);
  box-shadow:
    0 18px 0 var(--gw-edge),
    0 36px 44px rgba(0, 95, 142, .40),
    inset 0 0 0 3px rgba(255, 255, 255, .28),
    inset 0 3px 0 rgba(255, 255, 255, .6),
    inset 0 -14px 24px rgba(0, 60, 100, .2);
}
.gw-study:hover { transform: translateY(-8px) rotate(1deg); }
.gw-tile:hover .gw-band { transform: scale(1.08); }

/* apăsare — placa se lasă în jos, „grosimea" aproape dispare */
.gw-tile:active {
  transform: translateY(8px) rotate(0);
  filter: brightness(.96);
  box-shadow:
    0 2px 0 var(--gw-edge),
    0 5px 9px rgba(0, 95, 142, .32),
    inset 0 0 0 3px rgba(255, 255, 255, .18),
    inset 0 3px 0 rgba(255, 255, 255, .35),
    inset 0 -10px 18px rgba(0, 60, 100, .26);
  transition-duration: .06s;
}
.gw-tile:active .gw-band { transform: scale(.96); }

/* tastatură */
.gw-tile:focus-visible { outline: 4px solid #ffb300; outline-offset: 10px; }

@keyframes gw-pop {
  from { opacity: 0; transform: translateY(20px) scale(.9); }
  to   { opacity: 1; transform: none; }
}

@media (max-width: 554px) {
  .gw-eic-wrap { margin-bottom: 90px; }
}
@media (max-width: 560px) {
  .gw-page { gap: 52px; }
}
@media (prefers-reduced-motion: reduce) {
  .gw-tile, .gw-band { transition: none; animation: none; }
  .gw-tile::after { display: none; }
  .gw-tile:hover, .gw-study:hover { transform: none; }
}

/* ── EiC blocat (până se termină etapele din „study") ── */
.gw-eic-wrap { position: relative; display: flex; }
button.gw-tile { border: 0; padding: 0; font: inherit; cursor: not-allowed; }
.gw-locked {
  filter: grayscale(.85) brightness(.97);
  --gw-accent: #8a9aa5;
}
.gw-locked .gw-band { color: #8a9aa5; }
.gw-locked:hover, .gw-locked:active {
  transform: none; filter: grayscale(.85) brightness(.97);
}
.gw-locked:hover .gw-band, .gw-locked:active .gw-band { transform: none; }
.gw-locked::after { display: none; }
.gw-lock {
  position: absolute; top: 14px; right: 16px; z-index: 2;
  display: grid; place-items: center;
  width: 44px; height: 44px; border-radius: 50%;
  color: #5b6a74; background: rgba(255,255,255,.85);
  box-shadow: 0 2px 6px rgba(0, 40, 70, .25);
}
.gw-nudge { animation: gw-shake .45s ease both; }
.gw-hint {
  /* scos din flux: placa rămâne pe aceeași orizontală cu „study" */
  position: absolute; top: calc(100% + 28px); left: 50%;
  width: 260px; transform: translateX(-50%);
  margin: 0; text-align: center;
  font-size: 14px; line-height: 1.4; color: #4a5b66;
}
.gw-hint a { color: var(--gw-red); font-weight: 700; text-decoration: none; }
.gw-hint a:hover { text-decoration: underline; }
.gw-meter {
  display: block; margin: 10px auto 0; width: 160px; height: 8px;
  border-radius: 99px; background: #d5e3ec; overflow: hidden;
}
.gw-meter-fill {
  display: block; height: 100%; border-radius: 99px;
  background: linear-gradient(90deg, var(--gw-blue-light), var(--gw-blue));
  transition: width .4s ease;
}
@keyframes gw-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-9px) rotate(-1deg); }
  40% { transform: translateX(8px) rotate(1deg); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(3px); }
}
`
