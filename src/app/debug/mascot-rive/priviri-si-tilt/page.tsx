'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Mascot from '@/components/game/Mascot'
import { useCursorVector } from '../_useCursorVector'
import styles from './page.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT: Priviri și Tilt
// Wireframe izolat — nu atinge Mascot.tsx. Mascota rămâne 100% cea reală
// (aceleași stări/blink/glow), doar wrapper-ul din jurul ei primește un
// transform mic, continuu, legat de poziția cursorului pe pagină.
// ─────────────────────────────────────────────────────────────────────────

const MAX_ROTATE_DEG = 7
const MAX_TRANSLATE_PX = 9

export default function PriviriSiTiltConcept() {
  const anchorRef = useRef<HTMLDivElement>(null)
  const vector = useCursorVector(anchorRef)

  const rotate = vector.dx * MAX_ROTATE_DEG
  const tx = vector.dx * MAX_TRANSLATE_PX
  const ty = vector.dy * MAX_TRANSLATE_PX * 0.6

  return (
    <div className={styles.wrap}>
      <Link href="/debug/mascot-rive" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>👀 Priviri și Tilt</h1>
        <p className={styles.sub}>
          Mișcă mouse-ul oriunde pe pagină. Mascota se apleacă foarte discret
          spre cursor — câteva grade de rotație, câțiva pixeli de translație —
          ca un tilt de parallax, nu ca o urmărire literală.
        </p>

        <div className={styles.playground}>
          <div
            ref={anchorRef}
            className={styles.anchor}
            style={{
              transform: `translate(${tx}px, ${ty}px) rotate(${rotate}deg)`,
            }}
          >
            <Mascot state="idle" size={140} />
          </div>
          {!vector.active && (
            <p className={styles.hint}>mișcă mouse-ul ↕ pentru a vedea efectul</p>
          )}
        </div>

        <div className={styles.specs}>
          <h2>Parametri actuali</h2>
          <ul>
            <li>Rotație maximă: <b>{MAX_ROTATE_DEG}°</b></li>
            <li>Translație orizontală maximă: <b>{MAX_TRANSLATE_PX}px</b></li>
            <li>Tranziție: <code>220ms cubic-bezier(.22,1,.36,1)</code> — fluid, fără suprasaltare</li>
            <li>Dezactivat automat la <code>prefers-reduced-motion</code></li>
          </ul>
          <p className={styles.note}>
            Candidat pentru starea idle permanentă (ex. colțul din /learn) —
            efectul e suficient de discret încât să nu distragă atenția de la
            exercițiu.
          </p>
        </div>
      </div>
    </div>
  )
}
