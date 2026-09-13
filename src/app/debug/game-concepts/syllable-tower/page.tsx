'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT: Turnul Silabelor (Syllable Tower)
// Schematic wireframe only. Hardcoded words, no lexicon/engine coupling,
// no gameTypes.ts integration.
// ─────────────────────────────────────────────────────────────────────────

interface Word {
  syllables: string[]
  stress: number // index of stressed syllable
  color: string
}

const WORDS: Word[] = [
  { syllables: ['un', 'der', 'stand'], stress: 2, color: '#008E40' },
  { syllables: ['ba', 'na', 'na'], stress: 1, color: '#F08C00' },
  { syllables: ['pho', 'to', 'graph'], stress: 0, color: '#7048E8' },
  { syllables: ['gui', 'tar'], stress: 1, color: '#E64980' },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function SyllableTowerConcept() {
  const [wordIdx, setWordIdx] = useState(0)
  const [placed, setPlaced] = useState<number[]>([]) // indices into syllables, in placed order
  const [wobbleAt, setWobbleAt] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const word = WORDS[wordIdx % WORDS.length]

  const poolOrder = useMemo(
    () => shuffle(word.syllables.map((_, i) => i)),
    [wordIdx] // eslint-disable-line react-hooks/exhaustive-deps
  )

  function place(i: number) {
    if (i === orderTargetIndex(placed.length)) {
      const newPlaced = [...placed, i]
      setPlaced(newPlaced)
      if (newPlaced.length === word.syllables.length) {
        setScore(s => s + 1)
        setTimeout(() => {
          setWordIdx(w => w + 1)
          setPlaced([])
        }, 700)
      }
    } else {
      setWobbleAt(i)
      setTimeout(() => setWobbleAt(null), 400)
    }
  }

  // the "correct" next syllable is always the one at position `placed.length`
  // in the original (unshuffled) syllables array
  function orderTargetIndex(position: number) {
    return position
  }

  return (
    <div className={styles.wrap}>
      <Link href="/debug/game-concepts" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🧱 Turnul Silabelor</h1>
        <p className={styles.sub}>Așază silabele în ordine — cea accentuată e cărămida aurie, mai mare.</p>

        <div className={styles.layout}>
          <div>
            <div className={styles.tower}>
              {placed.map((i, level) => (
                <div
                  key={level}
                  className={`${styles.brick} ${i === word.stress ? styles.brickStress : ''}`}
                  style={{ background: word.color }}
                >
                  {word.syllables[i]}
                </div>
              ))}
            </div>
            <div className={styles.ground} />
          </div>

          <div className={styles.pool}>
            <div className={styles.poolLabel}>silabe disponibile</div>
            {poolOrder.map(i => (
              <button
                key={i}
                className={`${styles.poolBrick} ${wobbleAt === i ? styles.wobble : ''}`}
                style={{ background: word.color }}
                disabled={placed.includes(i)}
                onClick={() => place(i)}
              >
                {word.syllables[i]}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.statusRow}>
          <span>Cuvânt {(wordIdx % WORDS.length) + 1} / {WORDS.length}</span>
          <span className={styles.score}>Turnuri complete: {score}</span>
          <button className={styles.replay} onClick={() => { setWordIdx(0); setPlaced([]); setScore(0) }}>
            Reia
          </button>
        </div>
      </div>

      <p className={styles.note}>
        Schiță funcțională minimă — silabele, accentul și culoarea sunt
        hardcodate doar pentru mecanica de secvențiere. Integrarea reală ar
        deriva silabele + accentul din pipeline-ul de segmentare existent.
      </p>
    </div>
  )
}
