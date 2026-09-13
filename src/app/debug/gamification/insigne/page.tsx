'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT: Colecția de Insigne (Badge Album)
// Schematic wireframe only. Hardcoded badges mimicking sound categories,
// no lexicon/engine coupling, no colors.ts integration.
// ─────────────────────────────────────────────────────────────────────────

interface Badge {
  id: string
  label: string
  color: string
  unlocked: boolean
}

const BADGES: Badge[] = [
  { id: 'p',  label: '/p/',  color: '#495057', unlocked: true },
  { id: 'b',  label: '/b/',  color: '#1c7ed6', unlocked: true },
  { id: 't',  label: '/t/',  color: '#e8590c', unlocked: true },
  { id: 'd',  label: '/d/',  color: '#2f9e44', unlocked: true },
  { id: 'ae', label: '/æ/',  color: '#ae3ec9', unlocked: true },
  { id: 'i',  label: '/ɪ/',  color: '#0ca678', unlocked: false },
  { id: 'ii', label: '/iː/', color: '#0c8599', unlocked: false },
  { id: 'th', label: '/θ/',  color: '#f08c00', unlocked: false },
  { id: 'dh', label: '/ð/',  color: '#e64980', unlocked: false },
  { id: 'ou', label: '/əʊ/', color: '#5c940d', unlocked: false },
  { id: 'ai', label: '/aɪ/', color: '#7048e8', unlocked: false },
  { id: 'u',  label: '/ʊ/',  color: '#087f5b', unlocked: false },
]

export default function InsigneConcept() {
  const [selected, setSelected] = useState<Badge | null>(null)
  const unlockedCount = BADGES.filter(b => b.unlocked).length

  return (
    <div className={styles.wrap}>
      <Link href="/debug/gamification" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🎖️ Colecția de Insigne</h1>
        <p className={styles.sub}>
          O insignă colorată pentru fiecare sunet stăpânit. Cele nedeblocate
          apar ca siluete gri, cu forma vizibilă dar culoarea ascunsă.
        </p>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(unlockedCount / BADGES.length) * 100}%` }}
          />
        </div>
        <p className={styles.progressText}>{unlockedCount} din {BADGES.length} insigne deblocate</p>

        <div className={styles.grid}>
          {BADGES.map(b => (
            <button
              key={b.id}
              className={[styles.badge, b.unlocked ? styles.unlocked : styles.locked].join(' ')}
              style={b.unlocked ? { background: b.color } : undefined}
              onClick={() => setSelected(b)}
            >
              <span className={styles.badgeGlyph}>{b.unlocked ? b.label : '🔒'}</span>
            </button>
          ))}
        </div>

        {selected && (
          <div className={styles.detail}>
            <strong style={{ color: selected.unlocked ? selected.color : '#999' }}>
              {selected.label}
            </strong>
            <span>
              {selected.unlocked
                ? 'Stăpânit — repetiții suficiente cu acuratețe bună.'
                : 'Încă neexersat suficient. Continuă lecțiile pentru a o debloca.'}
            </span>
          </div>
        )}
      </div>

      <p className={styles.note}>
        Schiță — stările unlocked/locked sunt hardcodate. Integrarea reală ar
        deriva starea din statisticile per-sunet ale progresului salvat
        (repetiții + acuratețe per sunet din REPS_PER_LESSON), nu doar din
        finalizarea nivelului.
      </p>
    </div>
  )
}
