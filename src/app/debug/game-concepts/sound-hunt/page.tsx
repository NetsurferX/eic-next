'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT: Vânătoare de Sunete (Sound Hunt)
// Schematic wireframe only. Hardcoded rounds, no lexicon/engine coupling,
// no gameTypes.ts integration. Purely to validate the feel of the mechanic.
// ─────────────────────────────────────────────────────────────────────────

interface Round {
  word: string
  target: string // hex
  options: string[] // 4 hex values, one equals target
}

const ROUNDS: Round[] = [
  { word: 'cat', target: '#00A2E0', options: ['#00A2E0', '#008E40', '#EE5B00', '#FF3399'] },
  { word: 'car', target: '#008E40', options: ['#FF3399', '#008E40', '#00A2E0', '#7048E8'] },
  { word: 'bee', target: '#E64980', options: ['#00A2E0', '#7048E8', '#E64980', '#008E40'] },
  { word: 'boy', target: '#F08C00', options: ['#F08C00', '#00A2E0', '#E64980', '#008E40'] },
  { word: 'cow', target: '#7048E8', options: ['#008E40', '#7048E8', '#00A2E0', '#F08C00'] },
]

const ROUND_MS = 4000

export default function SoundHuntConcept() {
  const [roundIdx, setRoundIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [msLeft, setMsLeft] = useState(ROUND_MS)

  const round = ROUNDS[roundIdx % ROUNDS.length]

  const shuffledOptions = useMemo(() => round.options, [round])

  useEffect(() => {
    setPicked(null)
    setMsLeft(ROUND_MS)
    const start = Date.now()
    const id = setInterval(() => {
      const left = ROUND_MS - (Date.now() - start)
      setMsLeft(Math.max(0, left))
      if (left <= 0) clearInterval(id)
    }, 50)
    return () => clearInterval(id)
  }, [roundIdx])

  function pick(i: number) {
    if (picked !== null) return
    setPicked(i)
    if (shuffledOptions[i] === round.target) setScore(s => s + 1)
    setTimeout(() => setRoundIdx(r => r + 1), 700)
  }

  return (
    <div className={styles.wrap}>
      <Link href="/debug/game-concepts" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🦊 Vânătoare de Sunete</h1>
        <p className={styles.sub}>Atinge tufișul cu culoarea sunetului dominant din cuvânt.</p>

        <div className={styles.promptRow}>
          <img src="/mascot/fox-pointing.png" alt="" className={styles.fox} />
          <span className={styles.targetLabel}>caută culoarea:</span>
          <div className={styles.targetSwatch} style={{ background: round.target }} />
        </div>

        <div className={styles.word}>{round.word}</div>

        <div className={styles.timerTrack}>
          <div className={styles.timerFill} style={{ width: `${(msLeft / ROUND_MS) * 100}%` }} />
        </div>

        <div className={styles.bushes}>
          {shuffledOptions.map((hex, i) => {
            const isPicked = picked === i
            const isCorrect = hex === round.target
            const cls = [
              styles.bush,
              picked !== null && isPicked && isCorrect ? styles.correct : '',
              picked !== null && isPicked && !isCorrect ? styles.wrong : '',
            ].filter(Boolean).join(' ')
            return (
              <button
                key={i}
                className={cls}
                style={{ background: hex }}
                onClick={() => pick(i)}
                aria-label={`tufiș ${i + 1}`}
              >
                🌳
              </button>
            )
          })}
        </div>

        <div className={styles.statusRow}>
          <span>Runda {(roundIdx % ROUNDS.length) + 1} / {ROUNDS.length}</span>
          <span className={styles.score}>Scor: {score}</span>
          <button className={styles.replay} onClick={() => { setRoundIdx(0); setScore(0) }}>
            Reia
          </button>
        </div>
      </div>

      <p className={styles.note}>
        Schiță funcțională minimă — cuvinte, culori și logica de scor sunt
        hardcodate doar pentru a testa senzația mecanicii. Integrarea reală
        ar folosi cuvinte din LEVELS + culoarea dominantă calculată de motor.
      </p>
    </div>
  )
}
