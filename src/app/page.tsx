'use client'

// src/app/page.tsx — pagina principală (poarta de intrare).
// Două plăci 3D, apăsabile:
//   „EiC"   → /eic    (editorul, fostă pagină principală)
//   „study" → /learn  (lecțiile / jocul)
// Stilurile sunt locale (prefix .gw-) — nu ating globals.css.

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { STORAGE_KEY, type SavedProgress } from '@/lib/levels'

export default function Gateway() {
  const router = useRouter()
  const [done, setDone] = useState<boolean | null>(null)
  const [fading, setFading] = useState(false)
  const [disappeared, setDisappeared] = useState(false)
  const [playIn, setPlayIn] = useState(false)      // gw-pop s-a terminat
  const [vibrate, setVibrate] = useState(false)    // Play vibrează înainte de redirect

  // Declanșat când utilizatorul apasă butonul EiC
  function handleEiCPress(e: React.MouseEvent) {
    e.preventDefault()
    if (fading || disappeared) return
    setFading(true)
    setTimeout(() => setDisappeared(true), 3000)
  }

  // După ce EiC a dispărut: Play vibrează 2s, apoi intră automat în /learn
  useEffect(() => {
    if (!disappeared) return
    setVibrate(true)
    const t = setTimeout(() => router.push('/learn'), 3000)
    return () => clearTimeout(t)
  }, [disappeared, router])

  useEffect(() => {
    let finished = false
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SavedProgress>
        finished = saved.allDone === true
      }
    } catch { /* ignore */ }
    setDone(finished)
  }, [])

  const unlocked = done === true

  return (
    <main className="gw-page">
      <style>{CSS}</style>

      {/* Când cele 3 secunde s-au scurs, păstrăm spațiul gol fără să sară layout-ul */}
      {disappeared ? (
        <div className="gw-tile gw-eic" style={{ visibility: 'hidden', pointerEvents: 'none' }} />
      ) : unlocked ? (
        <Link
          href="/eic"
          className={`gw-tile gw-eic${fading ? ' gw-special-vanish' : ''}`}
          aria-label="EiC — editorul"
          onClick={handleEiCPress}
        >
          <span className="gw-band">EiC</span>
          {fading && <span className="gw-fx-burst" aria-hidden="true" />}
        </Link>
      ) : (
        <div className="gw-eic-wrap">
          <button
            type="button"
            className={`gw-tile gw-eic gw-locked${fading ? ' gw-special-vanish' : ''}`}
            aria-disabled="true"
            aria-label="EiC — blocat până termini toate etapele din study"
            onClick={handleEiCPress}
          >
            <span className="gw-band">EiC</span>
            <span className="gw-lock" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="9" rx="2.2" fill="currentColor" stroke="none" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
            {fading && <span className="gw-fx-burst" aria-hidden="true" />}
          </button>
        </div>
      )}

      <Link
        href="/learn"
        className={`gw-tile gw-study${playIn ? ' gw-in' : ''}${vibrate ? ' gw-vibrate' : ''}`}
        aria-label="study — lecțiile"
        onAnimationEnd={e => { if (e.animationName === 'gw-pop') setPlayIn(true) }}
      >
        <span className="gw-band">Play</span>
      </Link>
    </main>
  )
}

const CSS = `
.gw-page {
  --gw-blue: #0098ea;
  --gw-blue-light: #5fd4ff;
  --gw-blue-dark: #0068c9;
  --gw-edge: #004d8a;
  --gw-red: #e53935;

  min-height: 100vh;
  display: flex; flex-wrap: wrap;
  align-items: center; justify-content: center;
  gap: 160px;
  padding: 24px 24px 48px;
  background: #ffffff;
  overflow-x: hidden;
}

.gw-tile {
  position: relative;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  width: 225px; height: 218px;
  border-radius: 32px;
  text-decoration: none;
  background:
    radial-gradient(120% 90% at 30% 0%, rgba(255,255,255,.32) 0%, rgba(255,255,255,0) 55%),
    radial-gradient(90% 60% at 100% 100%, rgba(120, 90, 255, .28) 0%, rgba(120, 90, 255, 0) 70%),
    linear-gradient(160deg, var(--gw-blue-light) 0%, var(--gw-blue) 52%, var(--gw-blue-dark) 100%);
  box-shadow:
    0 0 0 4px var(--gw-edge),
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
.gw-study { animation-delay: .09s; }

.gw-in { animation: none; }

.gw-vibrate {
  animation: gw-vibrate .35s linear infinite;
  animation-delay: 0s;
}

@keyframes gw-vibrate {
  0%, 100% { transform: translate(0, 0) rotate(0); }
  20% { transform: translate(-4px, 1px) rotate(-1deg); }
  40% { transform: translate(4px, -1px) rotate(1deg); }
  60% { transform: translate(-3px, -1px) rotate(-.6deg); }
  80% { transform: translate(3px, 1px) rotate(.6deg); }
}

.gw-tile::before {
  content: ''; position: absolute; inset: 0 0 50% 0;
  border-radius: 32px 32px 70% 70% / 32px 32px 22% 22%;
  background: linear-gradient(rgba(255,255,255,.34), rgba(255,255,255,0));
  pointer-events: none;
}

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

.gw-band {
  position: relative; z-index: 1;
  width: calc(100% - 44px);
  padding: 16px 0 14px;
  text-align: center;
  background: linear-gradient(#e4f0f8 0%, #f8fcfe 45%, #dcebf5 100%);
  border: 3px solid #fff;
  border-radius: 16px;
  box-shadow:
    inset 0 3px 6px rgba(0,60,100,.10),
    0 0 14px rgba(255, 255, 255, .75),
    0 6px 14px rgba(0, 50, 100, .28);
  font-family: var(--font-serif);
  font-style: italic; font-weight: 700;
  font-size: 46px; line-height: 1;
  letter-spacing: .01em;
  text-shadow: 0 2px 0 rgba(0,0,0,.08), 0 1px 0 #fff;
  transition: transform .18s cubic-bezier(.3,.7,.4,1);
}

.gw-study {
  --gw-blue: #2fb344;
  --gw-blue-light: #7be08a;
  --gw-blue-dark: #1d8a31;
  --gw-edge: #146b24;
}
.gw-study .gw-band { color: #1fa037; }

.gw-eic {
  --gw-blue: #ffc400;
  --gw-blue-light: #ffe566;
  --gw-blue-dark: #f5a300;
  --gw-edge: #b87400;
}
.gw-eic .gw-band { color: #0098ea; }

.gw-tile:hover {
  transform: translateY(-8px) rotate(-1deg);
  filter: brightness(1.06) saturate(1.05);
  box-shadow:
    0 0 0 4px var(--gw-edge),
    0 18px 0 var(--gw-edge),
    0 36px 44px rgba(0, 95, 142, .40),
    inset 0 0 0 3px rgba(255, 255, 255, .28),
    inset 0 3px 0 rgba(255, 255, 255, .6),
    inset 0 -14px 24px rgba(0, 60, 100, .2);
}
.gw-study:hover { transform: translateY(-8px) rotate(1deg); }
.gw-tile:hover .gw-band { transform: scale(1.08); }

.gw-tile:active {
  transform: translateY(8px) rotate(0);
  filter: brightness(.96);
  box-shadow:
    0 0 0 4px var(--gw-edge),
    0 2px 0 var(--gw-edge),
    0 5px 9px rgba(0, 95, 142, .32),
    inset 0 0 0 3px rgba(255, 255, 255, .18),
    inset 0 3px 0 rgba(255, 255, 255, .35),
    inset 0 -10px 18px rgba(0, 60, 100, .26);
  transition-duration: .06s;
}
.gw-tile:active .gw-band { transform: scale(.96); }

.gw-tile:focus-visible { outline: 4px solid #ffb300; outline-offset: 10px; }

@keyframes gw-pop {
  from { opacity: 0; transform: translateY(20px) scale(.9); }
  to   { opacity: 1; transform: none; }
}

.gw-eic-wrap { position: relative; display: flex; }
button.gw-tile { border: 0; padding: 0; font: inherit; cursor: pointer; }

.gw-locked:hover, .gw-locked:active {
  transform: none; filter: none;
}
.gw-locked:hover .gw-band, .gw-locked:active .gw-band { transform: none; }
.gw-locked::after { display: none; }
.gw-lock {
  position: absolute; top: 14px; right: 16px; z-index: 2;
  display: grid; place-items: center;
  width: 48px; height: 48px; border-radius: 50%;
  color: #3d4a53;
  background:
    radial-gradient(90% 90% at 30% 20%, rgba(255,255,255,.65) 0%, rgba(255,255,255,0) 60%),
    linear-gradient(160deg, #d3dadf 0%, #9aa6ae 55%, #78858e 100%);
  box-shadow:
    0 3px 8px rgba(0, 40, 70, .35),
    inset 0 0 0 2px rgba(255,255,255,.55),
    inset 0 -3px 5px rgba(0,0,0,.18);
  transition: opacity .3s ease;
}

/* ========================================================
   EFECT SPECIAL VIZUAL DE DISPARIȚIE (DUREAZĂ 3 SECUNDE)
   ======================================================== */
.gw-tile.gw-special-vanish,
.gw-tile.gw-special-vanish:hover,
.gw-tile.gw-special-vanish:active {
  overflow: visible !important;
  pointer-events: none !important;
  animation: gw-disintegrate 3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards !important;
}

.gw-special-vanish::before,
.gw-special-vanish::after {
  display: none !important;
}

.gw-special-vanish .gw-band {
  animation: gw-band-disintegrate 3s ease-in-out forwards !important;
}

.gw-special-vanish .gw-lock {
  animation: gw-lock-burn 3s ease-in-out forwards !important;
}

/* Undă de șoc și particule de energie */
.gw-fx-burst {
  position: absolute;
  inset: -20px;
  border-radius: 46px;
  pointer-events: none;
  z-index: 10;
}

.gw-fx-burst::before {
  content: '';
  position: absolute;
  inset: -15px;
  border-radius: 56px;
  background: radial-gradient(circle, rgba(255, 235, 130, 0.95) 0%, rgba(255, 170, 0, 0.6) 40%, rgba(0, 152, 234, 0) 75%);
  animation: gw-fx-flash 3s ease-out forwards;
}

.gw-fx-burst::after {
  content: '';
  position: absolute;
  inset: -4px;
  border: 3px solid rgba(255, 240, 160, 0.9);
  border-radius: 42px;
  box-shadow:
    0 0 35px rgba(255, 200, 0, 0.95),
    0 0 65px rgba(255, 120, 0, 0.75),
    inset 0 0 30px rgba(255, 240, 100, 0.85);
  animation: gw-fx-shockwave 3s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
}

@keyframes gw-disintegrate {
  0% {
    transform: scale(1) translateY(0) rotate(0deg);
    filter: brightness(1) drop-shadow(0 0 0 rgba(255, 196, 0, 0));
    opacity: 1;
  }
  15% {
    transform: scale(1.06) translateY(-6px) rotate(1.2deg);
    filter: brightness(1.4) saturate(1.4) drop-shadow(0 0 25px rgba(255, 196, 0, 0.85));
    opacity: 1;
  }
  30% {
    transform: scale(1.1) translateY(-8px) rotate(-1.5deg);
    filter: brightness(1.9) saturate(1.8) drop-shadow(0 0 45px rgba(255, 220, 50, 1));
  }
  48% {
    transform: scale(1.14) translateY(-10px) rotate(1deg);
    filter: brightness(2.5) contrast(1.3) drop-shadow(0 0 70px rgba(255, 180, 0, 1));
    opacity: 0.98;
  }
  65% {
    transform: scale(1.02) translateY(-4px) rotate(-3deg);
    filter: brightness(3) blur(5px) drop-shadow(0 0 85px rgba(255, 230, 120, 1));
    opacity: 0.82;
  }
  78% {
    transform: scale(0.75) translateY(12px) rotate(5deg);
    filter: brightness(3.5) blur(12px) drop-shadow(0 0 70px rgba(255, 140, 0, 0.8));
    opacity: 0.5;
  }
  90% {
    transform: scale(0.35) translateY(-15px) rotate(-14deg);
    filter: brightness(4.2) blur(22px);
    opacity: 0.2;
  }
  100% {
    transform: scale(0) translateY(-45px) rotate(25deg);
    filter: brightness(5) blur(36px);
    opacity: 0;
  }
}

@keyframes gw-band-disintegrate {
  0% {
    letter-spacing: .01em;
    filter: none;
    transform: scale(1);
  }
  25% {
    letter-spacing: .06em;
    filter: drop-shadow(0 0 8px #ffffff);
    transform: scale(1.08);
  }
  50% {
    letter-spacing: .2em;
    filter: drop-shadow(0 0 25px #ffffff) blur(2px);
    transform: scale(1.2);
  }
  75% {
    letter-spacing: .38em;
    filter: drop-shadow(0 0 40px #ffe566) blur(6px);
    opacity: 0.4;
  }
  100% {
    letter-spacing: .55em;
    filter: blur(16px);
    opacity: 0;
    transform: scale(1.4);
  }
}

@keyframes gw-lock-burn {
  0% { opacity: 1; transform: scale(1); filter: none; }
  40% { opacity: 0.8; transform: scale(1.2) rotate(10deg); filter: brightness(2); }
  80% { opacity: 0.3; transform: scale(0.4) rotate(40deg); filter: blur(8px); }
  100% { opacity: 0; transform: scale(0); filter: blur(16px); }
}

@keyframes gw-fx-flash {
  0% { opacity: 0; transform: scale(0.7); }
  25% { opacity: 0.9; transform: scale(1.1); }
  55% { opacity: 1; transform: scale(1.35); }
  80% { opacity: 0.4; transform: scale(1.7); }
  100% { opacity: 0; transform: scale(2.2); }
}

@keyframes gw-fx-shockwave {
  0% { opacity: 0; transform: scale(0.8); border-width: 4px; }
  25% { opacity: 1; transform: scale(1.05); }
  60% { opacity: 0.8; transform: scale(1.35); border-width: 2px; }
  100% { opacity: 0; transform: scale(2); border-width: 0px; }
}

@media (prefers-reduced-motion: reduce) {
  .gw-tile, .gw-band { transition: none; animation: none; }
  .gw-tile::after { display: none; }
  .gw-tile:hover, .gw-study:hover { transform: none; }
  .gw-tile.gw-special-vanish {
    animation: none !important;
    opacity: 0 !important;
    transition: opacity .3s ease !important;
  }
}
`
