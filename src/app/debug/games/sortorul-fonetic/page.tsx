'use client'

import { useState } from 'react'
import Link from 'next/link'
import WordRenderer from '@/components/WordRenderer'
import { DEMO_WORDS } from '../_demoWords'
import styles from '../_gameShell.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT NOU 4/7: Sortorul Fonetic (Phonetic Sorter)
// 3 coșuri de culoare vizibile simultan (nu un singur target ca la
// Vânătoare de culoare). Un cuvânt curent trebuie tras/atins spre coșul
// cu aceeași culoare dominantă; coșurile pline se scutură ca feedback.
// Metaforă de „fabrică de sortare", nu de reflex-pe-timp.
// ─────────────────────────────────────────────────────────────────────────

function pickBinColors(): string[] {
  const uniq = Array.from(new Set(DEMO_WORDS.map(w => w.dominantColor)))
  return uniq.sort(() => Math.random() - 0.5).slice(0, 3)
}

function pickQueue(bins: string[]) {
  return DEMO_WORDS.filter(w => bins.includes(w.dominantColor)).sort(() => Math.random() - 0.5)
}

export default function SortorulFoneticConcept() {
  const [bins, setBins] = useState(() => pickBinColors())
  const [queue, setQueue] = useState(() => pickQueue(bins))
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [shake, setShake] = useState<string | null>(null)
  const [errors, setErrors] = useState(0)

  const current = queue[0]
  const done = queue.length === 0

  function drop(binColor: string) {
    if (!current) return
    if (current.dominantColor === binColor) {
      setCounts(c => ({ ...c, [binColor]: (c[binColor] ?? 0) + 1 }))
      setShake(binColor)
      setTimeout(() => setShake(null), 250)
      setQueue(q => q.slice(1))
    } else {
      setErrors(e => e + 1)
    }
  }

  function reset() {
    const newBins = pickBinColors()
    setBins(newBins)
    setQueue(pickQueue(newBins))
    setCounts({})
    setErrors(0)
  }

  return (
    <div className={styles.wrap}>
      <Link href="/debug/games" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>📦 Sortorul Fonetic</h1>
        <p className={styles.sub}>
          Trimite fiecare cuvânt spre coșul cu aceeași culoare a sunetului dominant.
        </p>

        {!done ? (
          <div className={styles.wordBig}>
            <WordRenderer nodes={current.nodes} wordStr={current.word} />
          </div>
        ) : (
          <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#2f9e44' }}>🎉 Toate cuvintele sortate!</p>
        )}

        <div className={styles.rowCenter} style={{ gap: 18, marginTop: 20 }}>
          {bins.map(b => (
            <button
              key={b}
              onClick={() => drop(b)}
              disabled={done}
              className={styles.card}
              style={{
                width: 90, height: 90, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 6,
                border: `3px solid ${b}`,
                transform: shake === b ? 'scale(1.06)' : 'scale(1)',
              }}
            >
              <span style={{ fontSize: 22 }}>🧺</span>
              <span className={styles.swatch} style={{ background: b }} />
              <span style={{ fontSize: 12, fontWeight: 700 }}>{counts[b] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className={styles.statusRow}>
          <span>Rămase: {queue.length}</span>
          <span>Greșeli: {errors}</span>
          <button className={styles.replay} onClick={reset}>Reia</button>
        </div>
      </div>

      <p className={styles.note}>
        Schiță — 3 coșuri fixate din culorile prezente în cele 8 cuvinte demo;
        „trimiterea" e un simplu click, nu drag &amp; drop real. Integrarea
        reală ar folosi un coș pentru fiecare sunet activ în lecția curentă
        și fizică de drag pentru senzația de „aruncare".
      </p>
    </div>
  )
}
