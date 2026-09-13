'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT: Cursa Vocalelor (Vowel Race)
// Schematic wireframe only. Hardcoded rounds, no lexicon/engine coupling,
// no gameTypes.ts integration.
// ─────────────────────────────────────────────────────────────────────────

interface Round {
  word: string
  target: string
  gates: string[]
}

const ROUNDS: Round[] = [
  { word: 'bike', target: '#7048E8', gates: ['#00A2E0', '#7048E8', '#008E40'] },
  { word: 'cup', target: '#008E40', gates: ['#008E40', '#F08C00', '#E64980'] },
  { word: 'boat', target: '#F08C00', gates: ['#E64980', '#00A2E0', '#F08C00'] },
  { word: 'sea', target: '#E64980', gates: ['#E64980', '#7048E8', '#008E40'] },
  { word: 'toy', target: '#F08C00', gates: ['#00A2E0', '#F08C00', '#008E40'] },
]

export default function VowelRaceConcept() {
  const [roundIdx, setRoundIdx] = useState(0)
  const [progress, setProgress] = useState(6)
  const [streak, setStreak] = useState(0)
  const [score, setScore] = useState(0)
  const [flash, setFlash] = useState<{ i: number; correct: boolean } | null>(null)

  const round = ROUNDS[roundIdx % ROUNDS.length]

  function choose(i: number) {
    if (flash) return
    const correct = round.gates[i] === round.target
    setFlash({ i, correct })

    if (correct) {
      const gain = 12 + streak * 3
      setProgress(p => Math.min(96, p + gain))
      setStreak(s => s + 1)
      setScore(s => s + 1)
    } else {
      setProgress(p => Math.max(4, p - 6))
      setStreak(0)
    }

    setTimeout(() => {
      setFlash(null)
      setRoundIdx(r => r + 1)
      if (progress >= 90) {
        setProgress(6)
      }
    }, 500)
  }

  return (
    <div className={styles.wrap}>
      <Link href="/debug/game-concepts" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🏁 Cursa Vocalelor</h1>
        <p className={styles.sub}>Alege poarta cu culoarea vocalei dominante înainte să ajungă vulpița.</p>

        <div className={styles.word}>{round.word}</div>

        <div className={styles.track}>
          <img
            src="/mascot/fox-jump.png"
            alt=""
            className={styles.fox}
            style={{ left: `calc(${progress}% - 23px)` }}
          />
          <div className={styles.finish} />
        </div>

        <div className={styles.gates}>
          {round.gates.map((hex, i) => {
            const cls = [
              styles.gate,
              flash && flash.i === i && flash.correct ? styles.correct : '',
              flash && flash.i === i && !flash.correct ? styles.wrong : '',
            ].filter(Boolean).join(' ')
            return (
              <button key={i} className={cls} style={{ background: hex }} onClick={() => choose(i)} />
            )
          })}
        </div>

        <div className={styles.statusRow}>
          <span className={styles.streak}>Serie: {streak}</span>
          <span className={styles.score}>Scor: {score}</span>
          <button
            className={styles.replay}
            onClick={() => { setRoundIdx(0); setProgress(6); setStreak(0); setScore(0) }}
          >
            Reia
          </button>
        </div>
      </div>

      <p className={styles.note}>
        Schiță funcțională minimă — cuvinte, culori și viteza sunt hardcodate
        doar pentru senzația mecanicii de reflex. O greșeală încetinește
        vulpița, nu termină jocul. Integrarea reală ar folosi cuvinte reale
        din LEVELS și culoarea dominantă calculată de motor.
      </p>
    </div>
  )
}
