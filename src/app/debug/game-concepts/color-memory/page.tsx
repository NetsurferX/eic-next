'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT: Memoria Culorilor (Color Memory)
// Schematic wireframe only. Hardcoded pairs, no lexicon/engine coupling,
// no gameTypes.ts integration.
// ─────────────────────────────────────────────────────────────────────────

interface Card {
  pairId: number
  kind: 'word' | 'color'
  word?: string
  color: string
}

const PAIRS: { word: string; color: string }[] = [
  { word: 'cat', color: '#00A2E0' },
  { word: 'car', color: '#008E40' },
  { word: 'bee', color: '#E64980' },
  { word: 'boy', color: '#F08C00' },
  { word: 'cow', color: '#7048E8' },
  { word: 'sun', color: '#495057' },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck(): Card[] {
  const cards: Card[] = PAIRS.flatMap((p, pairId) => [
    { pairId, kind: 'word', word: p.word, color: p.color },
    { pairId, kind: 'color', color: p.color },
  ])
  return shuffle(cards)
}

export default function ColorMemoryConcept() {
  const [deck, setDeck] = useState<Card[] | null>(null)
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [shakeIdx, setShakeIdx] = useState<number[]>([])
  const [moves, setMoves] = useState(0)

  // Shuffle only on the client to avoid SSR/CSR hydration mismatch.
  useEffect(() => {
    setDeck(buildDeck())
  }, [])

  function reset() {
    setDeck(buildDeck())
    setFlipped([])
    setMatched(new Set())
    setShakeIdx([])
    setMoves(0)
  }

  function flip(i: number) {
    if (!deck || flipped.length === 2 || flipped.includes(i) || matched.has(i)) return
    const next = [...flipped, i]
    setFlipped(next)

    if (next.length === 2) {
      setMoves(m => m + 1)
      const [a, b] = next
      if (deck[a].pairId === deck[b].pairId) {
        setTimeout(() => {
          setMatched(prev => new Set(prev).add(a).add(b))
          setFlipped([])
        }, 400)
      } else {
        setTimeout(() => {
          setShakeIdx(next)
          setTimeout(() => {
            setShakeIdx([])
            setFlipped([])
          }, 300)
        }, 500)
      }
    }
  }

  const done = deck ? matched.size === deck.length : false

  return (
    <div className={styles.wrap}>
      <Link href="/debug/game-concepts" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🃏 Memoria Culorilor</h1>
        <p className={styles.sub}>Potrivește fiecare cuvânt cu culoarea sunetului lui dominant.</p>

        <div className={styles.grid}>
          {deck?.map((card, i) => {
            const isFaceUp = flipped.includes(i) || matched.has(i)
            const cls = [
              styles.card,
              card.kind === 'word' ? styles.wordCard : '',
              isFaceUp ? styles.faceUp : '',
              matched.has(i) ? styles.matched : '',
              shakeIdx.includes(i) ? styles.shake : '',
            ].filter(Boolean).join(' ')
            return (
              <button
                key={i}
                className={cls}
                style={{ background: isFaceUp ? card.color : undefined, color: isFaceUp ? card.color : undefined }}
                onClick={() => flip(i)}
                disabled={matched.has(i)}
              >
                {isFaceUp ? (card.kind === 'word' ? card.word : '') : '?'}
              </button>
            )
          })}
        </div>

        <div className={styles.statusRow}>
          <span>Mutări: {moves}</span>
          <span className={styles.score}>{done ? 'Gata! 🎉' : `Perechi: ${matched.size / 2} / ${PAIRS.length}`}</span>
          <button className={styles.replay} onClick={reset}>Reia</button>
        </div>
      </div>

      <p className={styles.note}>
        Schiță funcțională minimă — perechile cuvânt/culoare sunt hardcodate
        doar pentru senzația mecanicii de memorie. Integrarea reală ar folosi
        cuvinte din LEVELS și culoarea dominantă calculată de motor.
      </p>
    </div>
  )
}
