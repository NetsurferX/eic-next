'use client'

import { useState } from 'react'
import Link from 'next/link'
import WordRenderer from '@/components/WordRenderer'
import { speakWord } from '@/lib/speak'
import { DEMO_WORDS, type DemoWord } from '../_demoWords'
import styles from '../_gameShell.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT: Dictare colorată (Colored Dictation)
// Ascultă cuvântul (Web Speech API prin speakWord), apoi alege varianta
// randată CORECT dintre 3, unde 2 au culoarea diacriticelor sabotată.
// Schiță — sabotajul e o simplă recolorare a nodului dominant, nu o
// simulare reală de greșeală fonetică.
// ─────────────────────────────────────────────────────────────────────────

const SABOTAGE_COLORS = ['#e03131', '#7048E8', '#f08c00', '#0ca678']

function sabotage(w: DemoWord): DemoWord {
  const fakeColor = SABOTAGE_COLORS.filter(c => c !== w.dominantColor)[Math.floor(Math.random() * 3)]
  return {
    ...w,
    dominantColor: fakeColor,
    nodes: w.nodes.map(n => (n.c === w.dominantColor ? { ...n, c: fakeColor } : n)),
  }
}

function buildRound(word: DemoWord) {
  const choices = [word, sabotage(word), sabotage(word)]
  return choices.sort(() => Math.random() - 0.5)
}

export default function DictareColorataConcept() {
  const [wIdx, setWIdx] = useState(0)
  const [choices, setChoices] = useState(() => buildRound(DEMO_WORDS[0]))
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)

  const target = DEMO_WORDS[wIdx]

  function play() {
    speakWord(target.word)
  }

  function pick(i: number) {
    if (picked !== null) return
    setPicked(i)
    if (choices[i].word === target.word && choices[i].dominantColor === target.dominantColor) {
      setScore(s => s + 1)
    }
    setTimeout(() => {
      const next = (wIdx + 1) % DEMO_WORDS.length
      setWIdx(next)
      setChoices(buildRound(DEMO_WORDS[next]))
      setPicked(null)
      setRound(r => r + 1)
    }, 900)
  }

  return (
    <div className={styles.wrap}>
      <Link href="/debug/games" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🔊 Dictare colorată</h1>
        <p className={styles.sub}>
          Ascultă cuvântul, apoi alege varianta scrisă cu culorile corecte.
        </p>

        <div className={styles.rowCenter} style={{ marginBottom: 18 }}>
          <button className={styles.replay} onClick={play}>🔊 Ascultă cuvântul</button>
        </div>

        <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {choices.map((c, i) => {
            const isRight = c.word === target.word && c.dominantColor === target.dominantColor
            const cls = [
              styles.card,
              picked !== null && i === picked && isRight ? styles.correct : '',
              picked !== null && i === picked && !isRight ? styles.wrong : '',
            ].join(' ')
            return (
              <button key={i} className={cls} disabled={picked !== null} onClick={() => pick(i)} style={{ textAlign: 'center', fontSize: '1.15rem' }}>
                <WordRenderer nodes={c.nodes} wordStr={c.word} />
              </button>
            )
          })}
        </div>

        <div className={styles.statusRow}>
          <span>Runda {round}</span>
          <span className={styles.score}>Scor: {score}</span>
          <button className={styles.replay} onClick={() => { setScore(0); setRound(1) }}>Reia</button>
        </div>
      </div>

      <p className={styles.note}>
        Schiță — sabotajul recolorează doar nodul dominant (nu diacritice reale
        greșite ca în B_tehnic). Integrarea reală ar genera distractori din
        graphemeToPhoneme.ts (culoare/diacritic greșit plauzibil), nu o
        recolorare arbitrară dintr-o listă fixă.
      </p>
    </div>
  )
}
