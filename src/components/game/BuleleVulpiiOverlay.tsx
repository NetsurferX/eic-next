'use client'

import { useState } from 'react'
import type { Lesson } from '@/lib/levels'
import { BuleleVulpiiGame, type BuleleVulpiiLevel, type BuleleVulpiiResult } from './BuleleVulpiiGame'

// ─────────────────────────────────────────────────────────────────────────
// Overlay full-screen deschis din /learn imediat după ce o coloană e
// completată — înlănțuie cele 3 sub-niveluri ale jocului (literă → fără
// literă → cuvânt) dacă fiecare e trecut, și lasă un "Sari peste" dacă
// copilul e blocat sub pragul de 80%, ca să nu rămână agățat aici la
// nesfârșit.
//
// Vizual, refolosește rețeta lui .level-overlay din globals.css (fundal
// întunecat + blur, aceleași @keyframes de intrare) prin clasele noi
// .bulele-overlay* — nu mai e un modal cu stiluri proprii, izolate. ──
// NECONFIRMAT ÎNCĂ: dacă chiar vrei toate 3 nivelurile de fiecare dată,
// sau doar nivelul 1 cu progresie globală prin parcurs — ușor de schimbat
// aici (doar logica din handleContinue). ──
//
// Actualizare (2026-09-24): `onExit` din joc (butonul „Ieși" + confirmare)
// închide overlay-ul exact ca „Sari peste" (onDone) — coloana e oricum deja
// completată, deci ieșirea nu pierde progres. Cât timp overlay-ul e montat,
// dock-ul FoxHelper (position: fixed, z-index 70 — deasupra overlay-ului) e
// ascuns, ca pe ecran să fie o singură vulpe: cea din joc. ──
// ─────────────────────────────────────────────────────────────────────────

export interface BuleleVulpiiOverlayConfig {
  lesson: Lesson
  distractorLessons: Lesson[]
  nextLesson: Lesson | null
}

export function BuleleVulpiiOverlay({
  config,
  onDone,
}: {
  config: BuleleVulpiiOverlayConfig
  onDone: () => void
}) {
  const [level, setLevel] = useState<BuleleVulpiiLevel>(1)
  const [result, setResult] = useState<BuleleVulpiiResult | null>(null)

  function handleContinue() {
    if (result?.passed && level < 3) {
      setLevel((level + 1) as BuleleVulpiiLevel)
      setResult(null)
      return
    }
    onDone()
  }

  return (
    <div className="bulele-overlay" role="dialog" aria-modal="true" aria-label="Bulele Vulpii">
      {/* dock-ul FoxHelper stă deasupra overlay-ului — îl ascundem cât joacă */}
      <style>{`.fox-helper { display: none !important; }`}</style>
      <div className="bulele-overlay-card">
        <p className="bulele-overlay-title">🎈 Bulele Vulpii</p>
        <p className="bulele-overlay-sub">
          Ai terminat coloana {config.lesson.tabLabel.toLowerCase()} — hai să exersăm sunetul!
        </p>

        <BuleleVulpiiGame
          key={`${config.lesson.id}-${level}`}
          lesson={config.lesson}
          distractorLessons={config.distractorLessons}
          nextLesson={config.nextLesson}
          level={level}
          onFinish={setResult}
          onExit={onDone}
        />

        {result && (
          <div className="bulele-overlay-actions">
            <button
              className="bulele-overlay-btn"
              onClick={handleContinue}
              style={{ background: config.lesson.color }}
            >
              {result.passed && level < 3 ? `Nivel ${level + 1} →` : 'Continuă lecția →'}
            </button>
            {!result.passed && (
              <button className="bulele-overlay-skip" onClick={onDone}>
                Sari peste
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
