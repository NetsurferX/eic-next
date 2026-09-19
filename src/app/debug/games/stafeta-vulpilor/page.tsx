'use client'

import { useState } from 'react'
import Link from 'next/link'
import WordRenderer from '@/components/WordRenderer'
import { Mascot } from '@/components/game/Mascot'
import { DEMO_WORDS } from '../_demoWords'
import styles from '../_gameShell.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT NOU 7/7: Ștafeta Vulpilor (Fox Relay)
// Cursă pe 5 checkpoint-uri, dar la fiecare checkpoint copilul ALEGE ruta:
// "sigură" (2 opțiuni de culoare, +1 stea) sau "riscantă" (4 opțiuni,
// +3 stele dacă e corect, -1 checkpoint dacă greșești). Element strategic
// de risc/recompensă absent din Cursa Vulpii (care e liniară, fără alegere
// de dificultate pe rundă).
// ─────────────────────────────────────────────────────────────────────────

const CHECKPOINTS = 5

function options(correct: string, n: number) {
  const others = DEMO_WORDS.map(w => w.dominantColor).filter(c => c !== correct)
  const picks = others.sort(() => Math.random() - 0.5).slice(0, n - 1)
  return [correct, ...picks].sort(() => Math.random() - 0.5)
}

export default function StafetaVulpilorConcept() {
  const [checkpoint, setCheckpoint] = useState(0)
  const [stars, setStars] = useState(0)
  const [wIdx, setWIdx] = useState(0)
  const [route, setRoute] = useState<'safe' | 'risky' | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const word = DEMO_WORDS[wIdx]
  const finished = checkpoint >= CHECKPOINTS

  function choose(color: string) {
    if (!route) return
    const correct = color === word.dominantColor
    if (correct) {
      setStars(s => s + (route === 'risky' ? 3 : 1))
      setResult(`✅ Corect! +${route === 'risky' ? 3 : 1} stele`)
      setCheckpoint(c => c + 1)
    } else {
      if (route === 'risky') {
        setCheckpoint(c => Math.max(0, c - 1))
        setResult('❌ Risc pierdut — un checkpoint înapoi.')
      } else {
        setResult('❌ Greșit — mai încerci ruta sigură.')
      }
    }
    setTimeout(() => {
      setResult(null)
      setRoute(null)
      setWIdx(i => (i + 1) % DEMO_WORDS.length)
    }, 700)
  }

  function reset() {
    setCheckpoint(0); setStars(0); setWIdx(0); setRoute(null); setResult(null)
  }

  return (
    <div className={styles.wrap}>
      <Link href="/debug/games" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🏁 Ștafeta Vulpilor</h1>
        <p className={styles.sub}>
          La fiecare checkpoint alegi: rută sigură (câștig mic, sigur) sau rută riscantă (câștig mare, pericol de recul).
        </p>

        <div className={styles.rowCenter} style={{ marginBottom: 14 }}>
          <Mascot state={result?.startsWith('✅') ? 'cheering' : 'pointing'} size={56} />
          <span className={styles.badge}>Checkpoint {Math.min(checkpoint + 1, CHECKPOINTS)} / {CHECKPOINTS}</span>
        </div>

        {!finished ? (
          <>
            <div className={styles.wordBig}>
              <WordRenderer nodes={word.nodes} wordStr={word.word} />
            </div>

            {!route ? (
              <div className={styles.rowCenter} style={{ gap: 14, marginTop: 14 }}>
                <button className={styles.card} onClick={() => setRoute('safe')} style={{ padding: '12px 18px' }}>
                  🟢 Rută sigură<br /><small>2 opțiuni · +1★</small>
                </button>
                <button className={styles.card} onClick={() => setRoute('risky')} style={{ padding: '12px 18px' }}>
                  🔴 Rută riscantă<br /><small>4 opțiuni · +3★ / -1 checkpoint</small>
                </button>
              </div>
            ) : (
              <div className={styles.rowCenter} style={{ gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
                {options(word.dominantColor, route === 'safe' ? 2 : 4).map((c, i) => (
                  <button key={i} className={styles.card} onClick={() => choose(c)} style={{ padding: '10px 16px' }}>
                    <span className={styles.swatch} style={{ background: c }} />
                  </button>
                ))}
              </div>
            )}

            {result && <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13 }}>{result}</p>}
          </>
        ) : (
          <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#2f9e44' }}>🎉 Ștafetă terminată!</p>
        )}

        <div className={styles.statusRow}>
          <span className={styles.score}>Stele: {stars} ⭐</span>
          <button className={styles.replay} onClick={reset}>Reia</button>
        </div>
      </div>

      <p className={styles.note}>
        Schiță — 5 checkpoint-uri fixe, recul limitat la 1 checkpoint pe
        eșec riscant. Integrarea reală ar lega stelele de un sistem de
        recompense persistent (posibil cufărul-vulpii din /debug/gamification).
      </p>
    </div>
  )
}
