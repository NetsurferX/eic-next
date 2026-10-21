'use client'

// src/app/page.tsx — pagina principală (poarta de intrare).
// Două plăci 3D, apăsabile:
//   „EiC"   → /eic    (editorul, fostă pagină principală)
//   „study" → /learn  (lecțiile / jocul)
// Stilurile sunt locale (prefix .gw-) — nu ating globals.css.

import Link from 'next/link'

export default function Gateway() {
  return (
    <main className="gw-page">
      <style>{CSS}</style>

      <Link href="/eic" className="gw-tile gw-eic" aria-label="EiC — editorul">
        <span className="gw-band">EiC</span>
      </Link>

      <Link href="/learn" className="gw-tile gw-study" aria-label="study — lecțiile">
        <span className="gw-band">study</span>
      </Link>
    </main>
  )
}

const CSS = `
.gw-page {
  --gw-blue: #00a2e8;
  --gw-blue-light: #3cc0f7;
  --gw-blue-dark: #0087c4;
  --gw-edge: #006a9c;
  --gw-red: #e53935;

  min-height: 100vh;
  display: flex; flex-wrap: wrap;
  align-items: center; justify-content: center;
  gap: 64px;
  padding: 24px 24px 40px;
  background: radial-gradient(ellipse at 50% 35%, #ffffff 0%, #eef6fb 100%);
}

.gw-tile {
  position: relative;
  display: flex; align-items: center; justify-content: center;
  width: 225px; height: 218px;
  border-radius: 24px;
  text-decoration: none;
  background: linear-gradient(160deg, var(--gw-blue-light) 0%, var(--gw-blue) 55%, var(--gw-blue-dark) 100%);
  /* „grosimea" plăcii (marginea de jos) + umbra de pe podea + luciul de sus */
  box-shadow:
    0 10px 0 var(--gw-edge),
    0 20px 28px rgba(0, 106, 156, .35),
    inset 0 2px 0 rgba(255, 255, 255, .5);
  transition: transform .16s cubic-bezier(.3,.7,.4,1), box-shadow .16s cubic-bezier(.3,.7,.4,1), filter .16s;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  animation: gw-pop .5s cubic-bezier(.2,.9,.3,1.2) both;
}
.gw-study { width: 210px; height: 202px; animation-delay: .08s; }

/* luciu pe jumătatea de sus */
.gw-tile::before {
  content: ''; position: absolute; inset: 0 0 52% 0;
  border-radius: 24px 24px 60% 60% / 24px 24px 18% 18%;
  background: linear-gradient(rgba(255,255,255,.30), rgba(255,255,255,0));
  pointer-events: none;
}

.gw-band {
  position: relative; z-index: 1;
  width: 100%;
  padding: 14px 0;
  text-align: center;
  background: linear-gradient(#ffffff, #f1f7fb);
  box-shadow: inset 0 3px 6px rgba(0,0,0,.10), 0 2px 0 rgba(255,255,255,.35);
  font-family: var(--font-serif);
  font-style: italic; font-weight: 700;
  font-size: 44px; line-height: 1;
  text-shadow: 0 2px 0 rgba(0,0,0,.10);
  transition: transform .16s cubic-bezier(.3,.7,.4,1);
}
.gw-eic .gw-band   { color: var(--gw-blue); }
.gw-study .gw-band { color: var(--gw-red); }

/* hover — placa se ridică */
.gw-tile:hover {
  transform: translateY(-6px);
  filter: brightness(1.05);
  box-shadow:
    0 16px 0 var(--gw-edge),
    0 32px 38px rgba(0, 106, 156, .38),
    inset 0 2px 0 rgba(255, 255, 255, .55);
}
.gw-tile:hover .gw-band { transform: scale(1.07); }

/* apăsare — placa se lasă în jos, „grosimea" aproape dispare */
.gw-tile:active {
  transform: translateY(8px);
  filter: brightness(.97);
  box-shadow:
    0 2px 0 var(--gw-edge),
    0 5px 8px rgba(0, 106, 156, .30),
    inset 0 2px 0 rgba(255, 255, 255, .35);
  transition-duration: .06s;
}
.gw-tile:active .gw-band { transform: scale(.97); }

/* tastatură */
.gw-tile:focus-visible { outline: 4px solid #ffb300; outline-offset: 8px; }

@keyframes gw-pop {
  from { opacity: 0; transform: translateY(18px) scale(.92); }
  to   { opacity: 1; transform: none; }
}

@media (max-width: 560px) {
  .gw-page { gap: 48px; }
}
@media (prefers-reduced-motion: reduce) {
  .gw-tile, .gw-band { transition: none; animation: none; }
}
`
