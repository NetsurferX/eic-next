'use client'

import { useState } from 'react'
import Link from 'next/link'
import WordRenderer from '@/components/WordRenderer'
import { Mascot } from '@/components/game/Mascot'
import { DEMO_WORDS } from '../_demoWords'
import styles from '../_gameShell.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT NOU 5/7: Detectivul de Cuvinte (Word Detective)
// Singurul concept de DEDUCȚIE, nu de reflex: vulpea-detectiv "a ales"
// un cuvânt-mister din cele 8. Copilul pune întrebări de tip da/nu despre
// culoarea sunetului dominant ("e verde?") ca să elimine candidați, apoi
// ghicește cuvântul. Testează asocierea culoare↔sunet prin raționament,
// nu prin viteză.
// ─────────────────────────────────────────────────────────────────────────

function pickMystery() {
  return DEMO_WORDS[Math.floor(Math.random() * DEMO_WORDS.length)]
}

export default function DetectivulDeCuvinteConcept() {
  const [mystery, setMystery] = useState(() => pickMystery())
  const [eliminated, setEliminated] = useState<Set<string>>(new Set())
  const [asked, setAsked] = useState<string[]>([])
  const [guess, setGuess] = useState<string | null>(null)
  const [wins, setWins] = useState(0)

  const remaining = DEMO_WORDS.filter(w => !eliminated.has(w.word))
  const colorsAsked = Array.from(new Set(DEMO_WORDS.map(w => w.dominantColor)))

  function askColor(color: string) {
    if (asked.includes(color)) return
    setAsked(a => [...a, color])
    const isMysteryColor = mystery.dominantColor === color
    setEliminated(e => {
      const next = new Set(e)
      DEMO_WORDS.forEach(w => {
        if (isMysteryColor ? w.dominantColor !== color : w.dominantColor === color) next.add(w.word)
      })
      return next
    })
  }

  function makeGuess(word: string) {
    setGuess(word)
    if (word === mystery.word) setWins(w => w + 1)
  }

  function reset() {
    setMystery(pickMystery())
    setEliminated(new Set())
    setAsked([])
    setGuess(null)
  }

  const solved = guess !== null

  return (
    <div className={styles.wrap}>
      <Link href="/debug/games" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🕵️ Detectivul de Cuvinte</h1>
        <p className={styles.sub}>
          Vulpea s-a gândit la un cuvânt. Întreabă despre culori ca să elimini restul, apoi ghicește.
        </p>

        <div className={styles.rowCenter} style={{ marginBottom: 16 }}>
          <Mascot state={solved && guess === mystery.word ? 'cheering' : 'talking'} face="thinking" size={56} />
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#777', marginBottom: 8 }}>
          Întreabă: „E culoarea asta cea a sunetului dominant?"
        </p>
        <div className={styles.rowCenter} style={{ gap: 10, flexWrap: 'wrap' }}>
          {colorsAsked.map(c => (
            <button
              key={c}
              className={styles.card}
              disabled={asked.includes(c) || solved}
              onClick={() => askColor(c)}
              style={{ padding: 8, opacity: asked.includes(c) ? 0.35 : 1 }}
            >
              <span className={styles.swatch} style={{ background: c }} />
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#777', margin: '18px 0 8px' }}>
          Candidați rămași: {remaining.length}
        </p>
        <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {DEMO_WORDS.map(w => {
            const isOut = eliminated.has(w.word)
            const isGuess = guess === w.word
            return (
              <button
                key={w.word}
                className={[styles.card, isGuess ? (w.word === mystery.word ? styles.correct : styles.wrong) : ''].join(' ')}
                disabled={isOut || solved}
                onClick={() => makeGuess(w.word)}
                style={{ opacity: isOut ? 0.25 : 1, textDecoration: isOut ? 'line-through' : 'none', fontSize: '0.95rem' }}
              >
                <WordRenderer nodes={w.nodes} wordStr={w.word} />
              </button>
            )
          })}
        </div>

        {solved && (
          <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: guess === mystery.word ? '#2f9e44' : '#e03131' }}>
            {guess === mystery.word ? '✅ Corect! Vulpea e impresionată.' : `❌ Nu — misterul era „${mystery.word}".`}
          </p>
        )}

        <div className={styles.statusRow}>
          <span className={styles.score}>Ghicite corect: {wins}</span>
          <button className={styles.replay} onClick={reset}>Cuvânt nou</button>
        </div>
      </div>

      <p className={styles.note}>
        Schiță — 8 candidați fixați, întrebările sunt doar despre culoarea
        dominantă (nu despre lungime, literă inițială etc.). Integrarea
        reală ar extinde tipurile de întrebări și ar trage misterul dintr-un
        lot mai mare din LEVELS.
      </p>
    </div>
  )
}
