'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LEVELS, STORAGE_KEY, REPS_PER_LESSON, type SavedProgress } from '@/lib/levels'
import { Cup } from './Cup'

// ── Teaser-ul de pe pagina principală — un mic rezumat al progresului
//    curent din EiC (nivel + cupă), ca să tragă înapoi în lecție pe cineva
//    care are deja progres salvat. Dacă nu există progres (prima vizită),
//    cade înapoi pe simplul buton "Learn EiC". ──
export default function LevelTeaser() {
  const [progress, setProgress] = useState<SavedProgress | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setProgress(JSON.parse(raw) as SavedProgress)
    } catch { /* ignore */ }
    setLoaded(true)
  }, [])

  // Nimic vizibil în primul randare server-side / înainte de citirea din
  // localStorage — evită un flash de conținut greșit.
  if (!loaded) return <span className="eic-learn-btn eic-learn-btn-ghost" aria-hidden="true" />

  if (!progress) {
    return <Link href="/learn" className="eic-learn-btn">Learn EiC</Link>
  }

  const level = LEVELS[progress.levelIndex] ?? LEVELS[0]
  const stars = progress.starsEarned[progress.levelIndex] ?? level.lessons.map(() => 0)
  const total = stars.reduce((a, b) => a + b, 0)
  const max = level.lessons.length * REPS_PER_LESSON
  const pct = Math.round((total / max) * 100)

  return (
    <Link href="/learn" className="eic-level-teaser">
      <Cup progressPct={pct} size={34} color="#FFB300" allFull={total >= max} idSuffix="landing-teaser" />
      <span className="eic-level-teaser-text">
        <strong>{progress.allDone ? 'Toate nivelurile finalizate 🎉' : level.name}</strong>
        {!progress.allDone && <em>{total}/{max} — continuă →</em>}
      </span>
    </Link>
  )
}
