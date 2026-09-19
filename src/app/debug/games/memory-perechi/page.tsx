'use client'

import { useState } from 'react'
import Link from 'next/link'
import WordRenderer from '@/components/WordRenderer'
import { DEMO_WORDS } from '../_demoWords'
import styles from '../_gameShell.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT: Memorie de perechi (Matching Memory)
// Cărți întoarse: 6 cuvinte (randate real prin WordRenderer) + 6 etichete
// de culoare/sunet corespunzătoare. Potrivești cuvântul cu eticheta lui.
// Schiță — subset fix de 6 din cele 8 cuvinte demo.
// ─────────────────────────────────────────────────────────────────────────

type Card =
  | { kind: 'word'; pairId: number; word: (typeof DEMO_WORDS)[number] }
  | { kind: 'label'; pairId: number; color: string; label: string }

function buildDeck(): Card[] {
  const picks = DEMO_WORDS.slice(0, 6)
  const cards: Card[] = picks.flatMap((w, i) => [
    { kind: 'word', pairId: i, word: w },
    { kind: 'label', pairId: i, color: w.dominantColor, label: w.dominantLabel },
  ])
  return cards.sort(() => Math.random() - 0.5)
}

export default function MemoryPerechiConcept() {
  const [deck, setDeck] = useState<Card[]>(() => buildDeck())
  const [open, setOpen] = useState<number[]>([])
  const [solved, setSolved] = useState<Set<number>>(new Set())
  const [moves, setMoves] = useState(0)
  const [busy, setBusy] = useState(false)

  const done = solved.size === DEMO_WORDS.slice(0, 6).length

  function flip(i: number) {
    if (busy || open.includes(i) || solved.has(deck[i].pairId)) return
    const next = [...open, i]
    setOpen(next)
    if (next.length === 2) {
      setMoves(m => m + 1)
      const [a, b] = next
      const match = deck[a].pairId === deck[b].pairId && deck[a].kind !== deck[b].kind
      setBusy(true)
      setTimeout(() => {
        if (match) setSolved(s => new Set(s).add(deck[a].pairId))
        setOpen([])
        setBusy(false)
      }, match ? 450 : 700)
    }
  }

  function reset() {
    setDeck(buildDeck())
    setOpen([])
    setSolved(new Set())
    setMoves(0)
  }

  return (
    <div className={styles.wrap}>
      <Link href="/debug/games" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🃏 Memorie de perechi</h1>
        <p className={styles.sub}>
          Întoarce câte 2 cărți; potrivește cuvântul scris cu eticheta lui de culoare/sunet.
        </p>

        <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {deck.map((c, i) => {
            const isOpen = open.includes(i) || solved.has(c.pairId)
            return (
              <button
                key={i}
                className={[styles.card, solved.has(c.pairId) ? styles.correct : ''].join(' ')}
                disabled={solved.has(c.pairId)}
                onClick={() => flip(i)}
                style={{ minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.05rem' }}
              >
                {!isOpen ? (
                  <span style={{ fontSize: '1.4rem', opacity: 0.4 }}>🦊</span>
                ) : c.kind === 'word' ? (
                  <WordRenderer nodes={c.word.nodes} wordStr={c.word.word} />
                ) : (
                  <span className={styles.rowCenter}>
                    <span className={styles.swatch} style={{ background: c.color }} />
                    <strong style={{ fontFamily: 'monospace' }}>/{c.label}/</strong>
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className={styles.statusRow}>
          <span>Mutări: {moves}</span>
          <span className={styles.score}>{done ? '🎉 Toate perechile găsite!' : `Perechi: ${solved.size} / 6`}</span>
          <button className={styles.replay} onClick={reset}>Reia</button>
        </div>
      </div>

      <p className={styles.note}>
        Schiță — 6 din cele 8 cuvinte demo, ordine amestecată la fiecare reia.
        Integrarea reală ar folosi un lot de cuvinte din LEVELS/lexicon.db,
        cu dificultate variabilă (nr. de perechi) legată de Difficulty din gameTypes.ts.
      </p>
    </div>
  )
}
