'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT: Provocarea Zilei (Daily Challenge)
// Schematic wireframe only. Hardcoded challenge + word list, no
// lexicon/engine coupling, no gameTypes.ts / GameSession integration.
// ─────────────────────────────────────────────────────────────────────────

interface ChallengeWord {
  word: string
  matches: boolean
}

const CHALLENGE = {
  emoji: '🎯',
  title: 'Găsește sunetul roșu',
  description: 'Atinge toate cuvintele care conțin sunetul /æ/ (roșu), înainte să se termine timpul.',
  targetColor: '#e8590c',
  reward: 15,
}

const WORDS: ChallengeWord[] = [
  { word: 'cat', matches: true },
  { word: 'dog', matches: false },
  { word: 'hat', matches: true },
  { word: 'sun', matches: false },
  { word: 'bag', matches: true },
  { word: 'pen', matches: false },
  { word: 'map', matches: true },
  { word: 'red', matches: false },
  { word: 'bat', matches: true },
]

export default function ProvocareaZileiConcept() {
  const [found, setFound] = useState<Set<string>>(new Set())
  const [wrongTap, setWrongTap] = useState<string | null>(null)

  const targetCount = WORDS.filter(w => w.matches).length
  const done = found.size === targetCount

  function tap(w: ChallengeWord) {
    if (found.has(w.word)) return
    if (w.matches) {
      setFound(prev => new Set(prev).add(w.word))
    } else {
      setWrongTap(w.word)
      setTimeout(() => setWrongTap(null), 350)
    }
  }

  return (
    <div className={styles.wrap}>
      <Link href="/debug/gamification" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <div className={styles.challengeCard}>
          <span className={styles.challengeEmoji}>{CHALLENGE.emoji}</span>
          <div>
            <h1 className={styles.title}>{CHALLENGE.title}</h1>
            <p className={styles.desc}>{CHALLENGE.description}</p>
          </div>
        </div>

        <div className={styles.wordGrid}>
          {WORDS.map(w => {
            const isFound = found.has(w.word)
            return (
              <button
                key={w.word}
                className={[
                  styles.wordChip,
                  isFound ? styles.chipFound : '',
                  wrongTap === w.word ? styles.chipWrong : '',
                ].join(' ')}
                style={isFound ? { background: CHALLENGE.targetColor, borderColor: CHALLENGE.targetColor } : undefined}
                onClick={() => tap(w)}
                disabled={isFound}
              >
                {w.word}
              </button>
            )
          })}
        </div>

        <div className={styles.statusRow}>
          <span>Găsite: {found.size} / {targetCount}</span>
          {done ? (
            <span className={styles.rewardBadge}>🐚 +{CHALLENGE.reward} bonus!</span>
          ) : (
            <span className={styles.hint}>Recompensă: 🐚 {CHALLENGE.reward}</span>
          )}
        </div>
      </div>

      <p className={styles.note}>
        Schiță — provocarea și lista de cuvinte sunt hardcodate pentru o
        singură zi. Integrarea reală ar genera provocarea zilnic (rotativ pe
        sunete deja introduse copilului), ar trage cuvinte reale din
        lexicon.db, și ar acorda recompensa prin sistemul de monedă (vezi
        conceptul Cufărul Vulpii).
      </p>
    </div>
  )
}
