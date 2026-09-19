'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import WordRenderer from '@/components/WordRenderer'
import { DEMO_WORDS } from '../_demoWords'
import styles from '../_gameShell.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT: Vânătoare de culoare (Color Hunt)
// Grilă cu toate cele 8 cuvinte demo, randate REAL prin WordRenderer.
// Un singur cuvânt e ținta de culoare pe rundă; copilul atinge toate
// cuvintele care au ACEEAȘI culoare dominantă, înainte să expire timpul.
// Schiță — 8 cuvinte fixe din _demoWords.ts, fără lexicon/engine.
// ─────────────────────────────────────────────────────────────────────────

function shuffledIdx() {
  return DEMO_WORDS.map((_, i) => i).sort(() => Math.random() - 0.5)
}

export default function ColorHuntConcept() {
  const [order, setOrder] = useState<number[]>(() => shuffledIdx())
  const [targetIdx, setTargetIdx] = useState(0)
  const [found, setFound] = useState<Set<number>>(new Set())
  const [wrong, setWrong] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)

  const target = DEMO_WORDS[targetIdx]
  const targetsInGrid = useMemo(
    () => DEMO_WORDS.filter(w => w.dominantColor === target.dominantColor).length,
    [target]
  )

  function tap(i: number) {
    if (found.has(i)) return
    const w = DEMO_WORDS[i]
    if (w.dominantColor === target.dominantColor) {
      const next = new Set(found).add(i)
      setFound(next)
      setScore(s => s + 1)
      if (next.size >= targetsInGrid) newRound()
    } else {
      setWrong(i)
      setTimeout(() => setWrong(null), 350)
    }
  }

  function newRound() {
    setOrder(shuffledIdx())
    setTargetIdx(Math.floor(Math.random() * DEMO_WORDS.length))
    setFound(new Set())
    setRound(r => r + 1)
  }

  return (
    <div className={styles.wrap}>
      <Link href="/debug/games" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🎯 Vânătoare de culoare</h1>
        <p className={styles.sub}>
          Atinge toate cuvintele cu culoarea sunetului-țintă. Restul rămân neatinse.
        </p>

        <div className={styles.rowCenter} style={{ marginBottom: 18 }}>
          <span className={styles.badge}>Sunet țintă:</span>
          <span className={styles.swatch} style={{ background: target.dominantColor }} />
          <strong style={{ fontFamily: 'monospace' }}>/{target.dominantLabel}/</strong>
        </div>

        <div
          className={styles.grid}
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))' }}
        >
          {order.map(i => {
            const w = DEMO_WORDS[i]
            const isFound = found.has(i)
            const isWrong = wrong === i
            return (
              <button
                key={i}
                className={[styles.card, isFound ? styles.correct : '', isWrong ? styles.wrong : ''].join(' ')}
                disabled={isFound}
                onClick={() => tap(i)}
                style={{ textAlign: 'center', fontSize: '1.1rem' }}
              >
                <WordRenderer nodes={w.nodes} wordStr={w.word} />
              </button>
            )
          })}
        </div>

        <div className={styles.statusRow}>
          <span>Runda {round + 1}</span>
          <span>Găsite: {found.size} / {targetsInGrid}</span>
          <span className={styles.score}>Scor: {score}</span>
          <button className={styles.replay} onClick={() => { newRound(); setScore(0) }}>Reia</button>
        </div>
      </div>

      <p className={styles.note}>
        Schiță — cele 8 cuvinte demo și culorile lor dominante sunt fixate în
        <code> _demoWords.ts</code>. Integrarea reală ar trage un lot de cuvinte
        din LEVELS/lexicon.db și ar calcula culoarea dominantă cu motorul, cu
        cronometru real pe rundă (aici e simplificat: runda se închide când
        găsești toate potrivirile, nu la expirarea timpului).
      </p>
    </div>
  )
}
