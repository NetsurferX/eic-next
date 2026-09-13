'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT: Harta Sunetelor (Sound World Map)
// Schematic wireframe only. Hardcoded islands mimicking LEVELS shape,
// no lexicon/engine coupling, no levels.ts / STORAGE_KEY integration.
// ─────────────────────────────────────────────────────────────────────────

interface Island {
  id: string
  label: string
  color: string
  x: number
  y: number
  status: 'done' | 'current' | 'locked'
}

const ISLANDS: Island[] = [
  { id: 'p',  label: '/p/',  color: '#495057', x: 8,  y: 70, status: 'done' },
  { id: 'b',  label: '/b/',  color: '#1c7ed6', x: 20, y: 50, status: 'done' },
  { id: 'ae', label: '/æ/',  color: '#e8590c', x: 34, y: 66, status: 'done' },
  { id: 'i',  label: '/ɪ/',  color: '#2f9e44', x: 47, y: 42, status: 'current' },
  { id: 'ii', label: '/iː/', color: '#0ca678', x: 58, y: 58, status: 'locked' },
  { id: 'th', label: '/θ/',  color: '#ae3ec9', x: 70, y: 36, status: 'locked' },
  { id: 'ou', label: '/əʊ/', color: '#f08c00', x: 82, y: 52, status: 'locked' },
  { id: 'ai', label: '/aɪ/', color: '#e64980', x: 92, y: 30, status: 'locked' },
]

export default function HartaSunetelorConcept() {
  const [selected, setSelected] = useState<Island>(
    ISLANDS.find(i => i.status === 'current') ?? ISLANDS[0]
  )

  const doneCount = ISLANDS.filter(i => i.status === 'done').length

  return (
    <div className={styles.wrap}>
      <Link href="/debug/gamification" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🗺️ Harta Sunetelor</h1>
        <p className={styles.sub}>
          Fiecare insulă e un nivel din LEVELS. Vulpița traversează harta;
          ceața se ridică pe insulele terminate.
        </p>

        <div className={styles.mapFrame}>
          <svg viewBox="0 0 100 100" className={styles.mapSvg} preserveAspectRatio="none">
            <path
              d={ISLANDS.map((isl, i) => `${i === 0 ? 'M' : 'L'} ${isl.x} ${isl.y}`).join(' ')}
              className={styles.pathLine}
            />
          </svg>

          {ISLANDS.map(isl => (
            <button
              key={isl.id}
              className={[
                styles.island,
                styles[isl.status],
                selected.id === isl.id ? styles.selected : '',
              ].join(' ')}
              style={{ left: `${isl.x}%`, top: `${isl.y}%`, borderColor: isl.color }}
              onClick={() => setSelected(isl)}
              title={isl.label}
            >
              <span style={{ color: isl.status === 'locked' ? '#bbb' : isl.color }}>
                {isl.status === 'locked' ? '☁' : isl.label}
              </span>
              {isl.status === 'current' && <span className={styles.foxMarker}>🦊</span>}
              {isl.status === 'done' && <span className={styles.checkMarker}>✓</span>}
            </button>
          ))}
        </div>

        <div className={styles.infoRow}>
          <div className={styles.infoCard}>
            <strong>{selected.label}</strong>
            <span className={styles.statusLabel}>
              {selected.status === 'done' && 'Insulă cucerită'}
              {selected.status === 'current' && 'Vulpița e aici acum'}
              {selected.status === 'locked' && 'Ceață — se deblochează după insula curentă'}
            </span>
          </div>
          <div className={styles.progressCard}>
            <span>Insule cucerite</span>
            <strong>{doneCount} / {ISLANDS.length}</strong>
          </div>
        </div>
      </div>

      <p className={styles.note}>
        Schiță — poziții x/y și stările insulelor sunt hardcodate. Integrarea
        reală ar deriva ordinea din LEVELS și starea done/current/locked din
        progresul salvat sub eic-lesson-progress-v7.
      </p>
    </div>
  )
}
