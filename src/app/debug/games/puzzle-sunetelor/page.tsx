'use client'

import { useState } from 'react'
import Link from 'next/link'
import WordRenderer from '@/components/WordRenderer'
import { DEMO_WORDS } from '../_demoWords'
import styles from '../_gameShell.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT NOU 3/7: Puzzle-ul Sunetelor (Sound Puzzle)
// Grafemele unui cuvânt (nodurile din GameNode, nu literele brute) apar
// amestecate ca piese; copilul le atinge în ordine ca să reconstruiască
// cuvântul. La finalizare corectă, cuvântul întreg se randează colorat
// prin WordRenderer ca recompensă. Diferit de Turnul Silabelor (care
// lucrează la nivel de silabă) — aici piesele sunt grafeme individuale
// și click-to-place, nu drag fizic.
// ─────────────────────────────────────────────────────────────────────────

function shuffledPieces(nodes: (typeof DEMO_WORDS)[number]['nodes']) {
  return nodes.map((n, i) => ({ ...n, origIdx: i })).sort(() => Math.random() - 0.5)
}

export default function PuzzleSunetelorConcept() {
  const [wIdx, setWIdx] = useState(0)
  const word = DEMO_WORDS[wIdx]
  const [pieces, setPieces] = useState(() => shuffledPieces(word.nodes))
  const [placed, setPlaced] = useState<number[]>([]) // origIdx în ordinea plasării
  const [mistake, setMistake] = useState(false)
  const [solvedCount, setSolvedCount] = useState(0)

  const nextExpected = placed.length
  const isDone = placed.length === word.nodes.length

  function tapPiece(origIdx: number) {
    if (isDone) return
    if (origIdx === nextExpected) {
      setPlaced(p => [...p, origIdx])
    } else {
      setMistake(true)
      setTimeout(() => setMistake(false), 350)
    }
  }

  function nextWord() {
    const next = (wIdx + 1) % DEMO_WORDS.length
    setWIdx(next)
    setPieces(shuffledPieces(DEMO_WORDS[next].nodes))
    setPlaced([])
    setSolvedCount(c => c + (isDone ? 1 : 0))
  }

  function reset() {
    setPieces(shuffledPieces(word.nodes))
    setPlaced([])
  }

  return (
    <div className={styles.wrap}>
      <Link href="/debug/games" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🧩 Puzzle-ul Sunetelor</h1>
        <p className={styles.sub}>
          Atinge piesele în ordinea corectă ca să reconstruiești cuvântul, grafem cu grafem.
        </p>

        <div className={styles.rowCenter} style={{ minHeight: 40, marginBottom: 16, flexWrap: 'wrap' }}>
          {isDone ? (
            <WordRenderer nodes={word.nodes} wordStr={word.word} />
          ) : (
            placed.map(idx => (
              <span key={idx} style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 6, background: '#fafafa' }}>
                {word.nodes[idx].t || '·'}
              </span>
            ))
          )}
        </div>

        <div className={[styles.rowCenter, mistake ? styles.wrong : ''].join(' ')} style={{ flexWrap: 'wrap', gap: 8 }}>
          {pieces.map(p => {
            const used = placed.includes(p.origIdx)
            return (
              <button
                key={p.origIdx}
                className={styles.card}
                disabled={used || isDone}
                onClick={() => tapPiece(p.origIdx)}
                style={{ padding: '8px 14px', fontSize: '1rem', opacity: used ? 0.25 : 1 }}
              >
                {p.t || '·'}
              </button>
            )
          })}
        </div>

        {isDone && (
          <p style={{ textAlign: 'center', color: '#2f9e44', marginTop: 12, fontSize: 13 }}>
            ✅ Reconstruit corect! Apasă „Următorul cuvânt".
          </p>
        )}

        <div className={styles.statusRow}>
          <span>Cuvinte rezolvate: {solvedCount}</span>
          <button className={styles.replay} onClick={reset}>Reia cuvântul</button>
          <button className={styles.replay} onClick={nextWord}>Următorul cuvânt →</button>
        </div>
      </div>

      <p className={styles.note}>
        Schiță — click-to-place în ordine strictă (fără drag fizic real, fără
        toleranță la reordonare parțială). Integrarea reală ar permite drag
        &amp; drop cu react-dnd/pointer events și ar valida doar poziția finală,
        nu fiecare pas intermediar.
      </p>
    </div>
  )
}
