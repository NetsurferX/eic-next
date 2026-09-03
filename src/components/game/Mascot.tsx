'use client'

import { type CSSProperties } from 'react'

// ── Mascota EiC — vulpița din poveste, care participă la joc: se apleacă
//    invitator spre buton când te așteaptă să apeși (`pointing`), bate din
//    lăbuțe când câștigi o stea (`clapping`), sare de bucurie când termini
//    o coloană sau un nivel (`cheering`), sau doar respiră liniștit cât
//    timp asculți cuvântul (`idle`). Ilustrația de bază (decupată din
//    desenul original, fundal eliminat) rămâne neschimbată — dinamismul și
//    senzația de "bogăție" vin din straturile din jurul ei: glow radial pe
//    două nivele, umbră de contact pe sol, inel de impact la aterizare,
//    particule ambientale de praf/lumină, un luciu periodic mascat exact pe
//    silueta vulpii, lăbuțe cu gradient plușat și chevroane animate pentru
//    indiciul de "apasă aici" — plus transform-uri CSS (bob/tilt/squash-
//    -stretch) pe fiecare stare, la fel ca la vechea mascotă-bufniță:
//    nicio poziționare pe bază de `getBoundingClientRect`, poate fi plasată
//    oriunde (dock fix pe /learn, sau ancorată în interiorul overlay-ului
//    de nivel). ──

export type MascotState = 'idle' | 'pointing' | 'clapping' | 'cheering'

// ── Stări de recompensă (folosite doar de overlay-ul MascotReward — vulpea
//    "detașată" care merge la stea/cupă, o apucă și o cară). Complet
//    independente de `MascotState`/`state` de mai sus, ca să nu strice
//    niciun apel existent (`Mascot state="cheering"` etc.): când `action`
//    e prezent, se adaugă DOAR o clasă suplimentară `mascot-${action}` pe
//    wrapper, restul markup-ului (glow, praf, lăbuțe) rămâne identic. ──
export type MascotAction =
  | 'idle'
  | 'walking'
  | 'grabbing'
  | 'holding-star'
  | 'holding-cup'
  | 'pouring'
  | 'celebrating'

export function Mascot({
  state = 'idle',
  action,
  message = null,
  size = 96,
  className = '',
}: {
  state?: MascotState
  action?: MascotAction
  message?: string | null
  size?: number
  className?: string
}) {
  return (
    <div
      className={`mascot state-${state} ${action ? `mascot-${action}` : ''} ${className}`}
      style={{ '--mascot-size': `${size}px` } as CSSProperties}
      aria-hidden="true"
    >
      {/* `key={message}` forțează remontarea span-ului la fiecare mesaj nou,
          ca animația de apariție a bulei să repornească de fiecare dată,
          chiar dacă starea rămâne aceeași (ex. două "Bravo!" la rând). */}
      {message && (
        <div key={message} className="mascot-bubble">{message}</div>
      )}

      <div className="mascot-stage">
        {/* glow pe două straturi — un inel exterior auriu, difuz, și unul
            interior portocaliu, mai concentrat — dă senzație de lumină reală,
            nu un simplu cerc plat */}
        <div className="mascot-glow mascot-glow-outer" />
        <div className="mascot-glow mascot-glow-inner" />

        {/* inel de impact — pulsează spre exterior la fiecare aterizare din "cheering" */}
        <div className="mascot-impact-ring" />

        {/* umbră de contact pe sol, se turtește/lărgește odată cu săriturile */}
        <div className="mascot-shadow" />

        {/* particule ambientale — praf/lumină plutind lin, vizibile în idle
            și pointing, pentru senzație de "viață" constantă a scenei, nu
            doar la evenimente (stea/nivel) */}
        <div className="mascot-dust" aria-hidden="true">
          <span className="mascot-dust-mote d1" />
          <span className="mascot-dust-mote d2" />
          <span className="mascot-dust-mote d3" />
        </div>

        <div className="mascot-fox-anchor">
          <div className="mascot-fox-visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascot/fox.png"
              alt=""
              className="mascot-fox-img"
              draggable={false}
            />
            {/* luciu periodic, mascat pe silueta exactă a vulpii (mask-image
                pe același PNG) — traversează diagonal, ca pe o iconiță
                "glossy" modernă, fără să iasă din contur */}
            <div className="mascot-shine" />
          </div>
        </div>

        {/* lăbuțe — formă reală de labă de vulpe (pernuță ascuțită + 3 degete
            înclinate în evantai + vârfuri de gheare), vizibile doar în
            starea "clapping", aplaudă una spre cealaltă */}
        <svg className="mascot-paw mascot-paw-left mascot-arm-left" viewBox="0 0 40 40" aria-hidden="true">
          <defs>
            <linearGradient id="mascotPawPad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF9A3C" />
              <stop offset="100%" stopColor="#D85F12" />
            </linearGradient>
            <linearGradient id="mascotPawToe" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE3C2" />
              <stop offset="100%" stopColor="#FFB067" />
            </linearGradient>
          </defs>
          {/* pernuța principală, ușor conică spre bază, ca o labă reală */}
          <path d="M20,34 C11,34 7,27 8,20 C9,13 14,9 20,9 C26,9 31,13 32,20 C33,27 29,34 20,34 Z"
                fill="url(#mascotPawPad)" stroke="#8A3E0B" strokeWidth="1.3" />
          {/* trei degete în evantai, fiecare cu vârf de gheară */}
          <g transform="rotate(-16 12 9)">
            <ellipse cx="12" cy="9" rx="4.6" ry="6.2" fill="url(#mascotPawToe)" stroke="#8A3E0B" strokeWidth="1" />
            <path d="M12,3.2 L10.6,0.4 L13.6,1.6 Z" fill="#5C2C0C" />
          </g>
          <g>
            <ellipse cx="20" cy="6.5" rx="4.8" ry="6.6" fill="url(#mascotPawToe)" stroke="#8A3E0B" strokeWidth="1" />
            <path d="M20,0 L18.5,-2.8 L21.5,-1.6 Z" fill="#5C2C0C" />
          </g>
          <g transform="rotate(16 28 9)">
            <ellipse cx="28" cy="9" rx="4.6" ry="6.2" fill="url(#mascotPawToe)" stroke="#8A3E0B" strokeWidth="1" />
            <path d="M28,3.2 L26.6,0.4 L29.6,1.6 Z" fill="#5C2C0C" />
          </g>
        </svg>
        <svg className="mascot-paw mascot-paw-right mascot-arm-right" viewBox="0 0 40 40" aria-hidden="true">
          <path d="M20,34 C11,34 7,27 8,20 C9,13 14,9 20,9 C26,9 31,13 32,20 C33,27 29,34 20,34 Z"
                fill="url(#mascotPawPad)" stroke="#8A3E0B" strokeWidth="1.3" />
          <g transform="rotate(-16 12 9)">
            <ellipse cx="12" cy="9" rx="4.6" ry="6.2" fill="url(#mascotPawToe)" stroke="#8A3E0B" strokeWidth="1" />
            <path d="M12,3.2 L10.6,0.4 L13.6,1.6 Z" fill="#5C2C0C" />
          </g>
          <g>
            <ellipse cx="20" cy="6.5" rx="4.8" ry="6.6" fill="url(#mascotPawToe)" stroke="#8A3E0B" strokeWidth="1" />
            <path d="M20,0 L18.5,-2.8 L21.5,-1.6 Z" fill="#5C2C0C" />
          </g>
          <g transform="rotate(16 28 9)">
            <ellipse cx="28" cy="9" rx="4.6" ry="6.2" fill="url(#mascotPawToe)" stroke="#8A3E0B" strokeWidth="1" />
            <path d="M28,3.2 L26.6,0.4 L29.6,1.6 Z" fill="#5C2C0C" />
          </g>
        </svg>

        {/* indiciu vizual — vizibil doar în starea "pointing": trei chevroane
            care "curg" spre buton, ca un hint modern de swipe, nu o săgeată
            statică */}
        <svg className="mascot-point-hint" viewBox="0 0 44 32" aria-hidden="true">
          <defs>
            <linearGradient id="mascotPointGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>
          <path className="mascot-chevron c1" d="M4,8 L14,16 L4,24" stroke="url(#mascotPointGrad)" />
          <path className="mascot-chevron c2" d="M16,8 L26,16 L16,24" stroke="url(#mascotPointGrad)" />
          <path className="mascot-chevron c3" d="M28,8 L38,16 L28,24" stroke="url(#mascotPointGrad)" />
        </svg>

        {/* scântei — vizibile doar în starea "cheering" */}
        <div className="mascot-sparkles" aria-hidden="true">
          <span className="mascot-sparkle s1">✦</span>
          <span className="mascot-sparkle s2">✧</span>
          <span className="mascot-sparkle s3">✦</span>
          <span className="mascot-sparkle s4">✧</span>
        </div>
      </div>
    </div>
  )
}

export default Mascot
