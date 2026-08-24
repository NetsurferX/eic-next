'use client'

import { type CSSProperties } from 'react'

// ── Mascota EiC — o mică bufniță prietenoasă care participă la joc:
//    arată spre buton când te așteaptă să apeși (`pointing`), bate din
//    palme (aripi) când câștigi o stea (`clapping`), sare de bucurie când
//    termini o coloană sau un nivel (`cheering`), sau doar respiră liniștit
//    cât timp ascultă cuvântul (`idle`). Fiecare stare e o simplă clasă CSS
//    — nicio poziționare pe bază de `getBoundingClientRect`, la fel ca
//    restul animațiilor din joc (stea→cupă, cupă→cupă), ca să rămână
//    robustă la orice layout/breakpoint. ──

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

      <svg viewBox="0 0 120 130" className="mascot-svg">
        <ellipse className="mascot-shadow" cx="60" cy="123" rx="24" ry="4.5" />

        <g className="mascot-body-wrap">
          {/* aripi — animate independent per stare (indicat / aplaudat / ridicat) */}
          <path className="mascot-wing mascot-wing-left"  d="M34,60 C18,64 13,90 30,101 C34,90 34,72 34,60 Z" />
          <path className="mascot-wing mascot-wing-right" d="M86,60 C102,64 107,90 90,101 C86,90 86,72 86,60 Z" />

          {/* moțuri pe cap, semn distinctiv de bufniță */}
          <path className="mascot-tuft mascot-tuft-l" d="M44,22 L37,4 L53,17 Z" />
          <path className="mascot-tuft mascot-tuft-r" d="M76,22 L83,4 L67,17 Z" />

          <ellipse className="mascot-body"  cx="60" cy="72" rx="36" ry="40" />
          <ellipse className="mascot-belly" cx="60" cy="83" rx="21" ry="25" />

          <g className="mascot-eye mascot-eye-l">
            <circle className="mascot-eye-white" cx="46" cy="58" r="12.5" />
            <circle className="mascot-eye-pupil" cx="48" cy="58" r="5.5" />
            {/* pleoapă — de obicei invizibilă (scaleY 0), animată periodic pentru clipit */}
            <rect className="mascot-eyelid" x="33.5" y="46.5" width="25" height="24" rx="12" />
          </g>
          <g className="mascot-eye mascot-eye-r">
            <circle className="mascot-eye-white" cx="74" cy="58" r="12.5" />
            <circle className="mascot-eye-pupil" cx="76" cy="58" r="5.5" />
            <rect className="mascot-eyelid" x="61.5" y="46.5" width="25" height="24" rx="12" />
          </g>

          <circle className="mascot-cheek mascot-cheek-l" cx="38" cy="69" r="5" />
          <circle className="mascot-cheek mascot-cheek-r" cx="82" cy="69" r="5" />

          <path className="mascot-beak"  d="M54,67 L66,67 L60,79 Z" />
          <path className="mascot-smile" d="M49,88 Q60,95 71,88" />

          <ellipse className="mascot-foot mascot-foot-l" cx="47" cy="112" rx="7" ry="3.5" />
          <ellipse className="mascot-foot mascot-foot-r" cx="73" cy="112" rx="7" ry="3.5" />
        </g>

        {/* scântei — vizibile doar în starea "cheering" */}
        <g className="mascot-sparkles" aria-hidden="true">
          <text className="mascot-sparkle s1" x="10" y="28">✦</text>
          <text className="mascot-sparkle s2" x="98" y="20">✦</text>
          <text className="mascot-sparkle s3" x="58" y="4">✦</text>
        </g>
      </svg>
    </div>
  )
}
