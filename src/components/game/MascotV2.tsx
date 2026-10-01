'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'

// ── MascotV2 — copie PARALELĂ a lui Mascot.tsx, pe noul set de 12 vulpi
//    (public/mascot/v2/). Mascot.tsx nu e modificat și rămâne folosit de
//    joc. Același API (state / action / message / size / className) +
//    trei stări noi: `waving`, `sitting`, `sleeping`. Stratul vizual
//    (glow, umbră, particule, luciu, chevroane, scântei) e cel din
//    Mascot.tsx — folosește aceleași clase din globals.css. `face` e
//    acceptat doar pentru compatibilitate de semnătură și ignorat
//    (`talking` are acum poză de corp proprie, deci nu mai are portret). ──

export type MascotStateV2 =
  | 'idle' | 'pointing' | 'clapping' | 'cheering' | 'talking'
  | 'waving' | 'sitting' | 'sleeping'

export type MascotFaceV2 = 'smile' | 'laugh' | 'surprised' | 'thinking' | 'wink'

export type MascotActionV2 =
  | 'idle' | 'walking' | 'grabbing'
  | 'holding-star' | 'holding-cup' | 'pouring' | 'celebrating'

const P = '/mascot/v2/'
const POSE = {
  idleSide: P + '01_idle_side.png',
  blink: P + '02_idle_blink.png',
  idleFront: P + '03_idle_front.png',
  sit: P + '04_idle_sit.png',
  point: P + '05_point.png',
  wave: P + '06_wave.png',
  clap: P + '07_clap.png',
  cheer: P + '08_cheer_stars.png',
  runA: P + '09_run_left.png',
  runB: P + '10_run_right.png',
  celebrate: P + '11_celebrate_stars.png',
  sleep: P + '12_sleep.png',
}

const STATE_POSE: Record<MascotStateV2, string> = {
  idle: POSE.idleSide,
  pointing: POSE.point,
  clapping: POSE.clap,
  cheering: POSE.cheer,
  talking: POSE.idleFront,
  waving: POSE.wave,
  sitting: POSE.sit,
  sleeping: POSE.sleep,
}

// `walking` alternă cadrele runA/runB (vezi `runFrame` în componentă);
// aici e doar valoarea implicită.
const ACTION_POSE: Record<Exclude<MascotActionV2, 'walking'>, string> = {
  idle: POSE.idleSide,
  grabbing: POSE.point,
  'holding-star': POSE.clap,
  'holding-cup': POSE.clap,
  pouring: POSE.clap,
  celebrating: POSE.celebrate,
}

// starea CSS moștenită din globals.css (animații bob/tilt/squash) — stările
// noi, fără reguli proprii, folosesc animația lui `idle`.
const CSS_STATE: Record<MascotStateV2, string> = {
  idle: 'idle', pointing: 'pointing', clapping: 'clapping', cheering: 'cheering',
  talking: 'talking', waving: 'idle', sitting: 'idle', sleeping: 'idle',
}

export function MascotV2({
  state = 'idle',
  action,
  face: _face,
  message = null,
  size = 96,
  className = '',
}: {
  state?: MascotStateV2
  action?: MascotActionV2
  face?: MascotFaceV2
  message?: string | null
  size?: number
  className?: string
}) {
  // ── clipire periodică — doar în idle „pur" (fără action), la intervale
  //    ușor aleatorii (2.6s–4.8s), ca vulpea să nu pară înghețată când
  //    stă și așteaptă. Complet oprită dacă tab-ul e ascuns sau utilizatorul
  //    preferă mișcare redusă. ──
  const [blinking, setBlinking] = useState(false)
  useEffect(() => {
    if (state !== 'idle' || action) {
      setBlinking(false)
      return
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    let openTimer: number
    let closeTimer: number
    const scheduleBlink = () => {
      const delay = 2600 + Math.random() * 2200
      openTimer = window.setTimeout(() => {
        setBlinking(true)
        closeTimer = window.setTimeout(() => {
          setBlinking(false)
          scheduleBlink()
        }, 140)
      }, delay)
    }
    scheduleBlink()
    return () => {
      window.clearTimeout(openTimer)
      window.clearTimeout(closeTimer)
    }
  }, [state, action])

  // alergare: alternează cadrele A/B cât timp action === 'walking'
  const [runFrame, setRunFrame] = useState(0)
  useEffect(() => {
    if (action !== 'walking') return
    const t = window.setInterval(() => setRunFrame((n) => 1 - n), 150)
    return () => window.clearInterval(t)
  }, [action])

  const pose =
    action === 'walking'
      ? runFrame ? POSE.runB : POSE.runA
      : action
        ? ACTION_POSE[action]
        : state === 'idle' && blinking
          ? POSE.blink
          : STATE_POSE[state]

  // ── fade încrucișat între cadre — două straturi <img> suprapuse, cel nou
  //    intră cu opacitate crescândă peste cel vechi, care rămâne dedesubt
  //    până se termină tranziția; evită „pop"-ul unei schimbări brute de
  //    `src`, la orice trecere de stare/acțiune sau la clipit. ──
  const [layers, setLayers] = useState<{ src: string; id: number }[]>([{ src: pose, id: 0 }])
  const nextId = useRef(1)
  useEffect(() => {
    setLayers((prev) => {
      if (prev[prev.length - 1]?.src === pose) return prev
      const id = nextId.current++
      // alergare: schimbare bruscă de cadru, fără fade (altfel apar două vulpi suprapuse)
      if (action === 'walking') return [{ src: pose, id }]
      const updated = [...prev, { src: pose, id }]
      // păstrăm cel mult ultimele 2 cadre — cel ieșit e curățat după fade
      return updated.slice(-2)
    })
  }, [pose, action])
  useEffect(() => {
    if (layers.length < 2) return
    const timer = window.setTimeout(() => {
      setLayers((prev) => (prev.length < 2 ? prev : prev.slice(-1)))
    }, 190)
    return () => window.clearTimeout(timer)
  }, [layers])

  return (
    <div
      className={`mascot state-${CSS_STATE[state]} ${action ? `mascot-${action}` : ''} ${className}`}
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
            {layers.map((layer, i) => {
              const isOutgoing = i === 0 && layers.length > 1
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={layer.id}
                  src={layer.src}
                  alt=""
                  className="mascot-fox-img"
                  style={
                    isOutgoing
                      ? {
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          transition: 'opacity 180ms ease-out',
                        }
                      : { opacity: 1, transition: 'opacity 180ms ease-out' }
                  }
                  draggable={false}
                />
              )
            })}
            {/* luciu periodic, mascat pe silueta exactă a cadrului curent
                (mask-image dinamic, legat de PNG-ul activ) — traversează
                diagonal, ca pe o iconiță "glossy" modernă, fără să iasă
                din contur, indiferent de cadru */}
            <div
              className="mascot-shine"
              style={{
                WebkitMaskImage: `url(${pose})`,
                maskImage: `url(${pose})`,
              }}
            />
          </div>
        </div>

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

        {/* scântei — vizibile în starea "cheering" și în acțiunea "celebrating" */}
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

export default MascotV2
