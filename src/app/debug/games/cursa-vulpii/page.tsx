'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import WordRenderer from '@/components/WordRenderer'
import { Mascot } from '@/components/game/Mascot'
import { DEMO_WORDS } from '../_demoWords'
import styles from '../_gameShell.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT: Cursa Vulpii (Fox Race)
// Vulpea aleargă pe o pistă de 10 căsuțe. Fiecare răspuns corect o mișcă
// un pas înainte (folosind Mascot.tsx real, stare 'cheering'/'idle');
// o greșeală o oprește o rundă (nu dă înapoi, doar sare runda).
// Schiță — pistă fixă de 10 pași, GameSession.streak imitat local.
// ─────────────────────────────────────────────────────────────────────────

const TRACK_LEN = 10

function randomOptions(correctColor: string): string[] {
  const others = DEMO_WORDS.map(w => w.dominantColor).filter(c => c !== correctColor)
  const shuffledOthers = others.sort(() => Math.random() - 0.5).slice(0, 2)
  return [correctColor, ...shuffledOthers].sort(() => Math.random() - 0.5)
}

export default function CursaVulpiiConcept() {
  const [pos, setPos] = useState(0)
  const [wIdx, setWIdx] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [skipped, setSkipped] = useState(false)
  const [mood, setMood] = useState<'idle' | 'cheering' | 'clapping'>('idle')

  const word = DEMO_WORDS[wIdx]
  const options = useMemo(() => randomOptions(word.dominantColor), [wIdx])
  const finished = pos >= TRACK_LEN

  function pick(color: string) {
    if (finished) return
    if (skipped) { setSkipped(false); nextWord(); return }

    if (color === word.dominantColor) {
      setPos(p => Math.min(TRACK_LEN, p + 1))
      setStreak(s => { const n = s + 1; setMaxStreak(m => Math.max(m, n)); return n })
      setMood(streak + 1 >= 3 ? 'cheering' : 'clapping')
      setTimeout(() => setMood('idle'), 500)
      nextWord()
    } else {
      setStreak(0)
      setSkipped(true) // o rundă săltată — următorul tap doar trece mai departe
      setTimeout(() => { setSkipped(false); nextWord() }, 500)
    }
  }

  function nextWord() {
    setWIdx(i => (i + 1) % DEMO_WORDS.length)
  }

  function reset() {
    setPos(0); setWIdx(0); setStreak(0); setMaxStreak(0); setSkipped(false); setMood('idle')
  }

  return (
    <div className={styles.wrap}>
      <Link href="/debug/games" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🏃 Cursa Vulpii</h1>
        <p className={styles.sub}>
          Alege culoarea sunetului dominant din cuvânt ca să miști vulpea un pas înainte.
        </p>

        <div style={{ position: 'relative', height: 60, marginBottom: 18 }}>
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 30, height: 6,
            background: 'var(--color-surface-2, #f1f0ec)', borderRadius: 999,
          }} />
          <div style={{
            position: 'absolute', top: 0, transition: 'left .4s ease',
            left: `calc(${(pos / TRACK_LEN) * 100}% - 23px)`,
          }}>
            <Mascot state={mood === 'idle' ? 'idle' : mood} size={60} />
          </div>
          <div style={{ position: 'absolute', right: 0, top: 20, fontSize: 20 }}>🏁</div>
        </div>

        {!finished ? (
          <>
            <div className={styles.wordBig}>
              <WordRenderer nodes={word.nodes} wordStr={word.word} />
            </div>
            <div className={styles.rowCenter} style={{ gap: 16, marginTop: 12 }}>
              {options.map((c, i) => (
                <button
                  key={i}
                  className={styles.card}
                  onClick={() => pick(c)}
                  style={{ padding: '10px 18px' }}
                  aria-label={`culoare ${i + 1}`}
                >
                  <span className={styles.swatch} style={{ background: c }} />
                </button>
              ))}
            </div>
            {skipped && <p style={{ textAlign: 'center', color: '#e03131', fontSize: 13, marginTop: 10 }}>Greșit — vulpea sare runda asta 🙈</p>}
          </>
        ) : (
          <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>🎉 Vulpea a ajuns la linia de sosire!</p>
        )}

        <div className={styles.statusRow}>
          <span>Poziție: {pos} / {TRACK_LEN}</span>
          <span className={styles.score}>Serie curentă: {streak} (max {maxStreak})</span>
          <button className={styles.replay} onClick={reset}>Reia</button>
        </div>
      </div>

      <p className={styles.note}>
        Schiță — pistă fixă de {TRACK_LEN} pași, cuvintele demo se reciclează în buclă.
        Integrarea reală ar mapa pos la GameSession.streak/roundsDone real și ar
        folosi ilustrația de cursă a Mascot.tsx (poze fox-run, nu doar idle/cheering).
      </p>
    </div>
  )
}
