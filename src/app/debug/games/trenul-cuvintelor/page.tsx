'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import WordRenderer from '@/components/WordRenderer'
import { DEMO_WORDS } from '../_demoWords'
import styles from '../_gameShell.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT NOU 1/7: Trenul Cuvintelor (Word Train)
// Un singur vagon derulează de la dreapta la stânga peste o linie de tren.
// Copilul apasă STOP doar când vagonul curent are culoarea-țintă afișată
// sus. Mecanică de reflex "single-lane", diferită de Vânătoare de culoare
// (grilă statică) — aici ținta se mișcă și trebuie oprită la momentul just.
// ─────────────────────────────────────────────────────────────────────────

const TICK_MS = 40
const SPEED = 1.4 // % din traseu pe tick

export default function TrenulCuvintelorConcept() {
  const [targetIdx] = useState(0)
  const [target, setTarget] = useState(DEMO_WORDS[0])
  const [wagonIdx, setWagonIdx] = useState(1)
  const [progress, setProgress] = useState(100) // 100 = dreapta, 0 = stânga (stație)
  const [running, setRunning] = useState(true)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<'ok' | 'bad' | null>(null)

  const wagon = DEMO_WORDS[wagonIdx]

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setProgress(p => {
        if (p <= 0) {
          // a trecut de stație nefolosit — se ia ca ratare doar dacă era țintă
          nextWagon()
          return 100
        }
        return p - SPEED
      })
    }, TICK_MS)
    return () => clearInterval(id)
  }, [running, wagonIdx])

  function nextWagon() {
    setWagonIdx(i => {
      const next = (i + 1) % DEMO_WORDS.length
      return next === targetIdx ? (next + 1) % DEMO_WORDS.length : next
    })
    setProgress(100)
  }

  function stop() {
    if (!running) return
    const hit = progress > 15 && progress < 45 // fereastră "la stație"
    const isTarget = wagon.dominantColor === target.dominantColor
    if (hit && isTarget) {
      setScore(s => s + 1)
      setFeedback('ok')
    } else {
      setFeedback('bad')
    }
    setRunning(false)
    setTimeout(() => {
      setFeedback(null)
      nextWagon()
      setRunning(true)
    }, 500)
  }

  function reset() {
    setScore(0); setWagonIdx(1); setProgress(100); setRunning(true); setFeedback(null)
    setTarget(DEMO_WORDS[Math.floor(Math.random() * DEMO_WORDS.length)])
  }

  return (
    <div className={styles.wrap}>
      <Link href="/debug/games" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🚂 Trenul Cuvintelor</h1>
        <p className={styles.sub}>
          Apasă STOP doar când vagonul cu culoarea-țintă ajunge în stație — nici prea devreme, nici prea târziu.
        </p>

        <div className={styles.rowCenter} style={{ marginBottom: 14 }}>
          <span className={styles.badge}>Țintă:</span>
          <span className={styles.swatch} style={{ background: target.dominantColor }} />
        </div>

        <div style={{ position: 'relative', height: 70, background: 'var(--color-surface-2, #f1f0ec)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: '15%', width: '30%', top: 0, bottom: 0, background: 'rgba(47,158,68,0.12)', borderLeft: '2px dashed #2f9e44', borderRight: '2px dashed #2f9e44' }} />
          <div style={{
            position: 'absolute', top: 12, left: `${progress}%`, transform: 'translateX(-50%)',
            padding: '6px 10px', background: '#fff', border: `2px solid ${wagon.dominantColor}`, borderRadius: 8,
            transition: running ? 'none' : 'opacity .3s',
          }}>
            <WordRenderer nodes={wagon.nodes} wordStr={wagon.word} />
          </div>
          <div style={{ position: 'absolute', left: '28%', bottom: 6, fontSize: 11, color: '#888' }}>🚉 stație</div>
        </div>

        <div className={styles.rowCenter} style={{ marginTop: 16 }}>
          <button className={styles.card} onClick={stop} style={{ padding: '10px 28px', fontWeight: 700, fontSize: 15 }}>
            STOP
          </button>
        </div>

        {feedback && (
          <p style={{ textAlign: 'center', marginTop: 10, color: feedback === 'ok' ? '#2f9e44' : '#e03131', fontSize: 13 }}>
            {feedback === 'ok' ? '✅ Vagon corect, la timp!' : '❌ Greșit sau prea devreme/târziu.'}
          </p>
        )}

        <div className={styles.statusRow}>
          <span className={styles.score}>Scor: {score}</span>
          <button className={styles.replay} onClick={reset}>Reia</button>
        </div>
      </div>

      <p className={styles.note}>
        Schiță — un singur vagon în buclă, fereastră de „stație" fixă (15%–45%).
        Integrarea reală ar varia viteza cu Difficulty și ar folosi cuvinte
        reale din LEVELS, nu doar cele 8 din _demoWords.ts.
      </p>
    </div>
  )
}
