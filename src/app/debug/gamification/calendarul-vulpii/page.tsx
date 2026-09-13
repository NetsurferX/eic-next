'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT: Calendarul Vulpii (Streak Calendar)
// Schematic wireframe only. Hardcoded month grid, no localStorage/date
// integration.
// ─────────────────────────────────────────────────────────────────────────

const DAYS_IN_MONTH = 30
// Hardcoded set of "practiced" days for the demo.
const PRACTICED = new Set([1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 16, 17, 18])
const TODAY = 18

function currentStreak(): number {
  let streak = 0
  for (let d = TODAY; d >= 1; d--) {
    if (PRACTICED.has(d)) streak++
    else break
  }
  return streak
}

const FOX_STAGES = [
  { min: 0,  emoji: '🥚', label: 'Ou de vulpe' },
  { min: 3,  emoji: '🦊', label: 'Pui de vulpe' },
  { min: 7,  emoji: '🦊✨', label: 'Vulpe zveltă' },
  { min: 14, emoji: '🦊👑', label: 'Vulpe regală' },
]

export default function CalendarulVulpiiConcept() {
  const streak = currentStreak()
  const [hovered, setHovered] = useState<number | null>(null)
  const stage = [...FOX_STAGES].reverse().find(s => streak >= s.min) ?? FOX_STAGES[0]

  return (
    <div className={styles.wrap}>
      <Link href="/debug/gamification" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🔥 Calendarul Vulpii</h1>
        <p className={styles.sub}>
          O amprentă de vulpe pentru fiecare zi de exercițiu. Vulpița crește
          pe măsură ce seria de zile consecutive se lungește.
        </p>

        <div className={styles.streakBanner}>
          <span className={styles.foxEmoji}>{stage.emoji}</span>
          <div>
            <strong>{streak} {streak === 1 ? 'zi' : 'zile'} la rând</strong>
            <span className={styles.stageLabel}>{stage.label}</span>
          </div>
        </div>

        <div className={styles.calendarGrid}>
          {Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1).map(day => {
            const practiced = PRACTICED.has(day)
            const isToday = day === TODAY
            return (
              <div
                key={day}
                className={[
                  styles.dayCell,
                  practiced ? styles.practiced : '',
                  isToday ? styles.today : '',
                ].join(' ')}
                onMouseEnter={() => setHovered(day)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className={styles.dayNumber}>{day}</span>
                {practiced && <span className={styles.paw}>🐾</span>}
                {hovered === day && (
                  <div className={styles.tooltip}>
                    {practiced ? 'Exersat' : 'Fără exercițiu'}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className={styles.stagesRow}>
          {FOX_STAGES.map(s => (
            <div key={s.min} className={[styles.stagePill, streak >= s.min ? styles.stageReached : ''].join(' ')}>
              <span>{s.emoji}</span>
              <span>{s.min}+ zile</span>
            </div>
          ))}
        </div>
      </div>

      <p className={styles.note}>
        Schiță — zilele "exersate" și streak-ul sunt hardcodate pentru
        demonstrație. Integrarea reală ar citi datele de finalizare a
        lecțiilor per zi calendaristică; un streak pierdut ar trebui gestionat
        blând (ex. "streak freeze" o dată pe săptămână), fără mesaje punitive
        pentru copii mici.
      </p>
    </div>
  )
}
