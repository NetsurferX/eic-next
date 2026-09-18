'use client'

import { useMemo, useRef } from 'react'
import Link from 'next/link'
import Mascot, { type MascotState } from '@/components/game/Mascot'
import { useCursorVector } from '../_useCursorVector'
import styles from './page.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT: Reacție de Proximitate
// Wireframe izolat — nu atinge Mascot.tsx. Spre deosebire de celelalte
// două concepte (transform CSS/JS peste o mascotă mereu "idle"), aici
// distanța cursor→mascotă selectează STAREA REALĂ a componentei — idle,
// pointing sau talking+face — plus un tilt discret suprapus (din
// "Priviri și Tilt") la orice distanță. Pragurile sunt în pixeli, măsurați
// față de fereastra browserului, deci depind de mărimea zonei de joc.
// ─────────────────────────────────────────────────────────────────────────

const FAR_THRESHOLD = 260 // > asta: idle, nu observă cursorul
const NEAR_THRESHOLD = 120 // sub asta: talking + zâmbet mare

const MAX_ROTATE_DEG = 6
const MAX_TRANSLATE_PX = 8

type Zone = 'departe' | 'apropiere' | 'aproape'

function zoneFor(distance: number): Zone {
  if (distance > FAR_THRESHOLD) return 'departe'
  if (distance > NEAR_THRESHOLD) return 'apropiere'
  return 'aproape'
}

const ZONE_STATE: Record<Zone, MascotState> = {
  departe: 'idle',
  apropiere: 'pointing',
  aproape: 'talking',
}

const ZONE_LABEL: Record<Zone, string> = {
  departe: `idle — cursorul e la > ${FAR_THRESHOLD}px`,
  apropiere: `pointing — între ${NEAR_THRESHOLD} și ${FAR_THRESHOLD}px`,
  aproape: `talking + zâmbet — sub ${NEAR_THRESHOLD}px`,
}

export default function ReactieDeProximitateConcept() {
  const anchorRef = useRef<HTMLDivElement>(null)
  const vector = useCursorVector(anchorRef)

  const zone = useMemo(() => zoneFor(vector.distance), [vector.distance])
  const state = ZONE_STATE[zone]

  const rotate = vector.dx * MAX_ROTATE_DEG
  const tx = vector.dx * MAX_TRANSLATE_PX
  const ty = vector.dy * MAX_TRANSLATE_PX * 0.6

  return (
    <div className={styles.wrap}>
      <Link href="/debug/mascot-rive" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🦊 Reacție de Proximitate</h1>
        <p className={styles.sub}>
          Apropie sau depărtează cursorul de mascotă. La distanță, stă
          liniștită (idle). Când te apropii, „te observă&rdquo; (pointing).
          Foarte aproape, îți vorbește și zâmbește (talking + portret).
        </p>

        <div className={styles.playground}>
          <div
            ref={anchorRef}
            className={styles.anchor}
            style={{
              transform: `translate(${tx}px, ${ty}px) rotate(${rotate}deg)`,
            }}
          >
            <Mascot
              state={state}
              face={zone === 'aproape' ? 'laugh' : undefined}
              message={zone === 'aproape' ? 'Bună!' : null}
              size={140}
            />
          </div>
          {!vector.active && (
            <p className={styles.hint}>mișcă mouse-ul spre / departe de vulpiță</p>
          )}
        </div>

        <div className={styles.zoneIndicator}>
          <span className={`${styles.dot} ${styles[zone]}`} />
          {ZONE_LABEL[zone]}
        </div>

        <div className={styles.specs}>
          <h2>Parametri actuali</h2>
          <ul>
            <li>Prag „apropiere&rdquo;: <b>{FAR_THRESHOLD}px</b> · prag „aproape&rdquo;: <b>{NEAR_THRESHOLD}px</b> (arbitrare, de reglat)</li>
            <li>Fiecare zonă → o stare reală din <code>MascotState</code>, nu doar un stil</li>
            <li>Tilt discret (ca în Priviri și Tilt) suprapus peste orice stare</li>
          </ul>
          <p className={styles.note}>
            De folosit cu măsură — un moment de surpriză (ex. la finalul unei
            lecții, când copilul mișcă mouse-ul spre mascotă), nu ca reacție
            continuă în timpul exercițiului, ca să nu distragă atenția.
          </p>
        </div>
      </div>
    </div>
  )
}
