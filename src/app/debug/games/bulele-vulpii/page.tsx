'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { LEVELS, type Lesson } from '@/lib/levels'
import { BuleleVulpiiGame, type BuleleVulpiiLevel, type BuleleVulpiiResult } from '@/components/game/BuleleVulpiiGame'
import styles from '../_gameShell.module.css'

// ─────────────────────────────────────────────────────────────────────────
// Previzualizare izolată: rulează BuleleVulpiiGame cu date REALE din LEVELS,
// nu cu grupurile demo din /debug/games/bulele-vulpii. Nu atinge learn/
// page.tsx — servește doar la verificat componenta cu coloane adevărate
// înainte de a decide cum se leagă de fluxul /learn.
//
// Distractorii ("sunete anterioare problematice") și sunetul următor sunt
// calculați aici, simplu, din ordinea coloanelor în LEVELS (ultimele 2
// coloane deja parcurse / următoarea din parcurs) — NU după gravitatea
// reală a greșelilor (nimic din aplicație nu urmărește asta încă). Doar
// pentru previzualizare; regula reală de ales distractori rămâne de stabilit.
// ─────────────────────────────────────────────────────────────────────────

const FLAT: { lesson: Lesson; levelName: string }[] = LEVELS.flatMap(lvl =>
  lvl.lessons.map(lesson => ({ lesson, levelName: lvl.name }))
)

export default function BuleleVulpiiIntegratPreview() {
  const [idx, setIdx] = useState(0)
  const [level, setLevel] = useState<BuleleVulpiiLevel>(1)
  const [lastResult, setLastResult] = useState<BuleleVulpiiResult | null>(null)

  const current = FLAT[idx]
  const distractorLessons = useMemo(
    () => FLAT.slice(Math.max(0, idx - 2), idx).map(f => f.lesson).reverse(),
    [idx]
  )
  const nextLesson = FLAT[idx + 1]?.lesson ?? null

  return (
    <div className={styles.wrap}>
      <Link href="/debug/games" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🎈 Bulele Vulpii — date reale</h1>
        <p className={styles.sub}>
          Aceeași mecanică din schiță, dar cu sunetul/culorile/cuvintele coloanei alese mai jos, exact
          cum ar veni din <code>levels.ts</code> după ce copilul termină acea coloană în /learn.
        </p>

        <div className={styles.rowCenter} style={{ marginBottom: 8, gap: 10, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13 }}>
            Coloană (sunet antrenat):{' '}
            <select
              value={idx}
              onChange={e => { setIdx(Number(e.target.value)); setLastResult(null) }}
            >
              {FLAT.map((f, i) => (
                <option key={f.lesson.id} value={i}>
                  {f.levelName} · {f.lesson.tabLabel} ({f.lesson.letter})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.rowCenter} style={{ marginBottom: 18, gap: 8 }}>
          {([1, 2, 3] as BuleleVulpiiLevel[]).map(lv => (
            <button
              key={lv}
              onClick={() => { setLevel(lv); setLastResult(null) }}
              className={styles.replay}
              style={lv === level ? { background: '#1a1917', color: '#fff', borderColor: '#1a1917' } : undefined}
            >
              Nivel {lv} {lv === 1 ? '· literă' : lv === 2 ? '· fără literă' : '· cuvânt'}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: -8, marginBottom: 14 }}>
          Distractori: {distractorLessons.length ? distractorLessons.map(l => l.tabLabel).join(', ') : '(niciunul — prima coloană din parcurs)'}
          {' · '}Sunet următor: {nextLesson ? nextLesson.tabLabel : '(ultima coloană din tot parcursul)'}
        </p>

        <BuleleVulpiiGame
          key={`${current.lesson.id}-${level}`}
          lesson={current.lesson}
          distractorLessons={distractorLessons}
          nextLesson={nextLesson}
          level={level}
          onFinish={setLastResult}
        />

        {lastResult && (
          <p className={styles.note} style={{ textAlign: 'center' }}>
            Ultimul rezultat: nivel {lastResult.level}, {Math.round(lastResult.rate * 100)}%,{' '}
            {lastResult.passed ? 'trecut ✅' : 'sub prag ❌'}
          </p>
        )}
      </div>
    </div>
  )
}
