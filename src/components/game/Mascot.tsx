'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'

// ── Mascota EiC — vulpița din poveste, care participă la joc: se apleacă
//    invitator spre buton când te așteaptă să apeși (`pointing`), bate din
//    lăbuțe când câștigi o stea (`clapping`), sare de bucurie când termini
//    o coloană sau un nivel (`cheering`), sau doar respiră liniștit cât
//    timp asculți cuvântul (`idle`). ──
//
// ── OVERHAUL: ilustrația veche (o singură acuarelă statică + lăbuțe SVG
//    desenate manual) a fost înlocuită cu un set real de cadre desenate —
//    fiecare stare/acțiune are propriul pose (idle/blink/pointing/run/jump/
//    clap/cheer, vezi /public/mascot/). Dinamismul nu mai vine doar din
//    transform-uri CSS pe o imagine fixă, ci și din SCHIMBAREA reală a
//    cadrului: clipire periodică în idle (2 cadre), fade încrucișat lin
//    între poziții la orice tranziție de stare. Peste asta rămân toate
//    straturile vechi — glow pe două nivele, umbră de contact, inel de
//    impact, particule ambientale, luciu mascat exact pe silueta curentă,
//    chevroane animate pentru indiciul de „apasă aici" — plus transform-uri
//    CSS (bob/tilt/squash-stretch) potrivite fiecărui cadru nou. Lăbuțele
//    SVG desenate manual au fost eliminate: noile ilustrații de „clapping"/
//    „holding-star"/„holding-cup"/„pouring" au deja lăbuțele împreunate în
//    desen, deci nu mai e nevoie de un strat separat peste ele. ──

export type MascotState = 'idle' | 'pointing' | 'clapping' | 'cheering'

// ── Stări de recompensă (folosite doar de overlay-ul MascotReward — vulpea
//    "detașată" care merge la stea/cupă, o apucă și o cară). Complet
//    independente de `MascotState`/`state` de mai sus, ca să nu strice
//    niciun apel existent (`Mascot state="cheering"` etc.): când `action`
//    e prezent, se adaugă DOAR o clasă suplimentară `mascot-${action}` pe
//    wrapper, și `action` are prioritate față de `state` la alegerea
//    cadrului desenat (vezi `resolvePose`). ──
export type MascotAction =
  | 'idle'
  | 'walking'
  | 'grabbing'
  | 'holding-star'
  | 'holding-cup'
  | 'pouring'
  | 'celebrating'

// ── fiecare stare/acțiune → cadrul ei desenat. `resolvePose` alege în
//    funcție de `action` (dacă există) sau altfel de `state`. ──
const STATE_POSE: Record<MascotState, string> = {
  idle: '/mascot/fox-idle.png',
  pointing: '/mascot/fox-pointing.png',
  clapping: '/mascot/fox-clap.png',
  cheering: '/mascot/fox-cheer.png',
}

const ACTION_POSE: Record<MascotAction, string> = {
  idle: '/mascot/fox-idle.png',
  // nu există o poză de "alergare" utilizabilă (`fox-run.png` a fost
  // retrasă din `public/mascot/`, la fel ca `fox.png` — nu se mai
  // folosesc nicăieri) — poza de salt (`fox-jump.png`) e cea mai
  // apropiată ca senzație de mișcare pentru "walking"
  walking: '/mascot/fox-jump.png',
  grabbing: '/mascot/fox-pointing.png',
  // ambele „duce" recompensa cu lăbuțele împreunate în față — desenul e
  // identic, doar obiectul cărat (steaua/cupa) e adăugat separat, ca overlay
  'holding-star': '/mascot/fox-clap.png',
  'holding-cup': '/mascot/fox-clap.png',
  pouring: '/mascot/fox-clap.png',
  // finalul recompensei (după ce cupa mare e umplută) — poza de bucurie
  // "mare", diferită de starea "cheering" (fox-cheer.png) folosită la
  // finalul unei singure coloane/nivel
  celebrating: '/mascot/fox-cheer-big.png',
}

const BLINK_POSE = '/mascot/fox-blink.png'

function resolvePose(state: MascotState, action: MascotAction | undefined, blinking: boolean) {
  if (action) return ACTION_POSE[action]
  if (state === 'idle' && blinking) return BLINK_POSE
  return STATE_POSE[state]
}

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

  const pose = resolvePose(state, action, blinking)

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
      const updated = [...prev, { src: pose, id }]
      // păstrăm cel mult ultimele 2 cadre — cel ieșit e curățat după fade
      return updated.slice(-2)
    })
  }, [pose])
  useEffect(() => {
    if (layers.length < 2) return
    const timer = window.setTimeout(() => {
      setLayers((prev) => (prev.length < 2 ? prev : prev.slice(-1)))
    }, 190)
    return () => window.clearTimeout(timer)
  }, [layers])

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

export default Mascot
