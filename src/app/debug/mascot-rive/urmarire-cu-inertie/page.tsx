'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Mascot from '@/components/game/Mascot'
import { useCursorVector } from '../_useCursorVector'
import styles from './page.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT: Urmărire cu Inerție
// Wireframe izolat — nu atinge Mascot.tsx. Spre deosebire de "Priviri și
// Tilt" (tranziție CSS simplă), aici valoarea afișată e interpolată cadru
// cu cadru (requestAnimationFrame + lerp) spre ținta dată de cursor, ceea
// ce dă o senzație de "greutate"/spring — mascota rămâne puțin în urmă și
// "prinde din urmă" cursorul, nu se teleportează la fiecare mișcare.
// O umbră proprie (desenată aici, separat de .mascot-shadow internă) se
// întinde pe direcția mișcării rapide, ca indiciu suplimentar de viteză.
// ─────────────────────────────────────────────────────────────────────────

const LERP_FACTOR = 0.12
const MAX_ROTATE_DEG = 14
const MAX_TRANSLATE_PX = 26

export default function UrmarireCuInertieConcept() {
  const anchorRef = useRef<HTMLDivElement>(null)
  const vector = useCursorVector(anchorRef)

  const target = useRef({ x: 0, y: 0, rot: 0 })
  const current = useRef({ x: 0, y: 0, rot: 0 })
  const [display, setDisplay] = useState({ x: 0, y: 0, rot: 0 })
  const [speed, setSpeed] = useState(0)

  useEffect(() => {
    target.current = {
      x: vector.dx * MAX_TRANSLATE_PX,
      y: vector.dy * MAX_TRANSLATE_PX * 0.6,
      rot: vector.dx * MAX_ROTATE_DEG,
    }
  }, [vector])

  useEffect(() => {
    let raf: number
    const tick = () => {
      const c = current.current
      const t = target.current
      const prevX = c.x
      c.x += (t.x - c.x) * LERP_FACTOR
      c.y += (t.y - c.y) * LERP_FACTOR
      c.rot += (t.rot - c.rot) * LERP_FACTOR
      setSpeed(Math.abs(c.x - prevX))
      setDisplay({ x: c.x, y: c.y, rot: c.rot })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const stretch = Math.min(1 + speed * 0.06, 1.18)

  return (
    <div className={styles.wrap}>
      <Link href="/debug/mascot-rive" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🌀 Urmărire cu Inerție</h1>
        <p className={styles.sub}>
          Mișcă mouse-ul rapid dintr-o parte în alta. Mascota nu se
          teleportează instant — rămâne puțin în urmă, ca și cum ar avea
          greutate reală, iar umbra ei se întinde vizibil la mișcări bruște.
        </p>

        <div className={styles.playground}>
          <div
            className={styles.floorShadow}
            style={{
              transform: `translateX(${display.x * 0.8}px) scaleX(${stretch})`,
            }}
          />
          <div
            ref={anchorRef}
            className={styles.anchor}
            style={{
              transform: `translate(${display.x}px, ${display.y}px) rotate(${display.rot}deg) scale(${1 / stretch}, ${stretch})`,
            }}
          >
            <Mascot state="idle" size={140} />
          </div>
          {!vector.active && (
            <p className={styles.hint}>mișcă mouse-ul rapid ↔ pentru a vedea inerția</p>
          )}
        </div>

        <div className={styles.specs}>
          <h2>Parametri actuali</h2>
          <ul>
            <li>Factor de interpolare (lerp): <b>{LERP_FACTOR}</b> pe cadru (~mai mic = mai "greu")</li>
            <li>Rotație maximă: <b>{MAX_ROTATE_DEG}°</b> · translație maximă: <b>{MAX_TRANSLATE_PX}px</b></li>
            <li>Squash/stretch legat de viteza instantanee, nu de poziție</li>
            <li>Umbra e desenată separat aici, nu modifică <code>.mascot-shadow</code> internă</li>
          </ul>
          <p className={styles.note}>
            Mai potrivit pentru un moment special (ecran de start, recompensă)
            decât ca fundal permanent — senzația e mai jucăușă, dar și mai
            "zgomotoasă" vizual decât Priviri și Tilt.
          </p>
        </div>
      </div>
    </div>
  )
}
