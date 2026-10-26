'use client'

// src/app/page.tsx — pagina principală (poarta de intrare).
// Două plăci 3D, apăsabile:
//   „EiC"   → /eic    (editorul, fostă pagină principală)
//   „study" → /learn  (lecțiile / jocul)
// Stilurile sunt locale (prefix .gw-) — nu ating globals.css.
//
// Rute, aria-label și structura DOM sunt neschimbate; s-a schimbat doar CSS-ul.

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

@media (max-width: 560px) {
  .gw-page { gap: 52px; }
}
@media (prefers-reduced-motion: reduce) {
  .gw-tile, .gw-band { transition: none; animation: none; }
  .gw-tile::after { display: none; }
  .gw-tile:hover, .gw-study:hover { transform: none; }
}
`
