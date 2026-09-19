'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Mascot } from '@/components/game/Mascot'
import { speakWord } from '@/lib/speak'
import { DEMO_WORDS } from '../_demoWords'
import styles from '../_gameShell.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT NOU 2/7: Bulele Vulpii (Fox Bubbles)
// Vulpea ROSTEȘTE un cuvânt-țintă (speakWord, fără text vizibil). Bule cu
// cuvinte scrise plutesc în sus; copilul sparge DOAR bulele al căror
// cuvânt scris se potrivește cu ce a auzit. Testează asocierea sunet→scris
// fără sprijin vizual al culorii — diferit de toate conceptele existente,
// care arată mereu cuvântul colorat pe ecran.
// ─────────────────────────────────────────────────────────────────────────

interface Bubble { id: number; word: string; x: number; born: number }

let nextId = 0

export default function BuleleVulpiiConcept() {
  const [targetWord, setTargetWord] = useState(DEMO_WORDS[0].word)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)

  function newTarget() {
    const w = DEMO_WORDS[Math.floor(Math.random() * DEMO_WORDS.length)].word
    setTargetWord(w)
    speakWord(w)
  }

  useEffect(() => { newTarget() }, [])

  useEffect(() => {
    const spawn = setInterval(() => {
      setBubbles(bs => {
        if (bs.length >= 6) return bs
        const useTarget = Math.random() < 0.35
        const w = useTarget ? targetWord : DEMO_WORDS[Math.floor(Math.random() * DEMO_WORDS.length)].word
        return [...bs, { id: nextId++, word: w, x: 10 + Math.random() * 75, born: Date.now() }]
      })
    }, 900)
    const tick = setInterval(() => {
      setBubbles(bs => bs.filter(b => Date.now() - b.born < 4200))
    }, 200)
    return () => { clearInterval(spawn); clearInterval(tick) }
  }, [targetWord])

  function pop(b: Bubble) {
    setBubbles(bs => bs.filter(x => x.id !== b.id))
    if (b.word === targetWord) {
      setScore(s => {
        const n = s + 1
        if (n % 3 === 0) setTimeout(newTarget, 300)
        return n
      })
    } else {
      setMisses(m => m + 1)
    }
  }

  function reset() { setScore(0); setMisses(0); setBubbles([]); newTarget() }

  return (
    <div className={styles.wrap}>
      <Link href="/debug/games" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🫧 Bulele Vulpii</h1>
        <p className={styles.sub}>
          Ascultă ce spune vulpea, apoi sparge doar bulele cu ACEL cuvânt scris.
        </p>

        <div className={styles.rowCenter} style={{ marginBottom: 10 }}>
          <Mascot state="talking" size={56} />
          <button className={styles.replay} onClick={() => speakWord(targetWord)}>🔊 Repetă</button>
        </div>

        <div style={{ position: 'relative', height: 220, background: 'linear-gradient(#eaf4fb, #f7fbfd)', borderRadius: 14, overflow: 'hidden' }}>
          {bubbles.map(b => (
            <button
              key={b.id}
              onClick={() => pop(b)}
              style={{
                position: 'absolute', left: `${b.x}%`, bottom: 6,
                animation: 'floatUp 4.2s linear forwards',
                background: 'rgba(255,255,255,0.85)', border: '1.5px solid #90c9e8',
                borderRadius: 999, padding: '6px 12px', fontSize: 13, cursor: 'pointer',
              }}
            >
              {b.word}
            </button>
          ))}
        </div>
        <style>{`@keyframes floatUp { from { bottom: 6px; opacity: 1 } to { bottom: 210px; opacity: 0 } }`}</style>

        <div className={styles.statusRow}>
          <span className={styles.score}>Scor: {score}</span>
          <span>Greșeli: {misses}</span>
          <button className={styles.replay} onClick={reset}>Reia</button>
        </div>
      </div>

      <p className={styles.note}>
        Schiță — apariția bulelor e aleatorie (35% șansă să fie cuvântul-țintă),
        fără fizică reală de plutire (doar animație CSS liniară). Integrarea
        reală ar controla densitatea/viteza cu Difficulty și ar roti ținta
        din lotul de cuvinte al lecției curente.
      </p>
    </div>
  )
}
