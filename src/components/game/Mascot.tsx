'use client'

import { type CSSProperties } from 'react'

// ── Mascota EiC — vulpița din poveste, care participă la joc: se apleacă
//    invitator spre buton când te așteaptă să apeși (`pointing`), bate din
//    lăbuțe când câștigi o stea (`clapping`), sare de bucurie când termini
//    o coloană sau un nivel (`cheering`), sau doar respiră liniștit cât
//    timp asculți cuvântul (`idle`). Ilustrația de bază (decupată din
//    desenul original, fundal eliminat) rămâne neschimbată în toate
//    stările — dinamismul vine din transform-uri CSS (bob/tilt/jump) +
//    elemente mici suprapuse (lăbuțe care aplaudă, scântei), la fel ca la
//    vechea mascotă-bufniță: nicio poziționare pe bază de
//    `getBoundingClientRect`, poate fi plasată oriunde (dock fix pe
//    /learn, sau ancorată în interiorul overlay-ului de nivel). ──

export type MascotState = 'idle' | 'pointing' | 'clapping' | 'cheering'

export function Mascot({
  state = 'idle',
  message = null,
  size = 96,
  className = '',
}: {
  state?: MascotState
  message?: string | null
  size?: number
  className?: string
}) {
  return (
    <div
      className={`mascot state-${state} ${className}`}
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
        <div className="mascot-shadow" />

        <div className="mascot-fox-anchor">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot/fox.png"
            alt=""
            className="mascot-fox-img"
            draggable={false}
          />
        </div>

        {/* lăbuțe — vizibile doar în starea "clapping", aplaudă una spre cealaltă */}
        <svg className="mascot-paw mascot-paw-left" viewBox="0 0 40 40" aria-hidden="true">
          <ellipse cx="20" cy="24" rx="12" ry="10" />
          <circle cx="10" cy="12" r="5" />
          <circle cx="20" cy="7" r="5.2" />
          <circle cx="30" cy="12" r="5" />
        </svg>
        <svg className="mascot-paw mascot-paw-right" viewBox="0 0 40 40" aria-hidden="true">
          <ellipse cx="20" cy="24" rx="12" ry="10" />
          <circle cx="10" cy="12" r="5" />
          <circle cx="20" cy="7" r="5.2" />
          <circle cx="30" cy="12" r="5" />
        </svg>

        {/* indiciu vizual — vizibil doar în starea "pointing", invită la apăsat */}
        <svg className="mascot-point-hint" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M4,16 L22,16 M22,16 L14,8 M22,16 L14,24" />
        </svg>

        {/* scântei — vizibile doar în starea "cheering" */}
        <div className="mascot-sparkles" aria-hidden="true">
          <span className="mascot-sparkle s1">✦</span>
          <span className="mascot-sparkle s2">✦</span>
          <span className="mascot-sparkle s3">✦</span>
        </div>
      </div>
    </div>
  )
}
