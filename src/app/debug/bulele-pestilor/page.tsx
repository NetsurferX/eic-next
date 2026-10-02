'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LEVELS, type Lesson } from '@/lib/levels'
import { BulelePestilorGame, type BulelePestilorLevel } from '@/components/game/BulelePestilorGame'

const FLAT: { lesson: Lesson; levelName: string }[] = LEVELS.flatMap(lvl =>
  lvl.lessons.map(lesson => ({ lesson, levelName: lvl.name }))
)

export default function BulelePestilorPage() {
  const [idx, setIdx] = useState(0)
  const [level, setLevel] = useState<BulelePestilorLevel>(1)
  const [nonce, setNonce] = useState(0)

  const current = FLAT[idx]
  const distractors = FLAT.slice(Math.max(0, idx - 2), idx).map(f => f.lesson).reverse()
  const next = FLAT[idx + 1]?.lesson ?? null

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 60px' }}>
      <Link href="/debug/gamification" style={{ fontSize: 13, color: '#666' }}>← Gamification</Link>
      <h1 style={{ fontSize: 22, margin: '12px 0 4px', textAlign: 'center' }}>🐟 Bulele Vulpii — pești</h1>
      <p style={{ fontSize: 13, color: '#777', textAlign: 'center', margin: '0 0 16px' }}>
        Propunere izolată. Baloanele devin pești, vulpea pescuiește, iar acvariul are o celulă pentru fiecare pește.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <select value={idx} onChange={e => { setIdx(Number(e.target.value)); setNonce(n => n + 1) }}>
          {FLAT.map((f, i) => (
            <option key={f.lesson.id} value={i}>{f.levelName} · {f.lesson.tabLabel} ({f.lesson.letter})</option>
          ))}
        </select>
        {([1, 2] as BulelePestilorLevel[]).map(lv => (
          <button
            key={lv}
            onClick={() => { setLevel(lv); setNonce(n => n + 1) }}
            style={lv === level ? { ...pillBtn, background: '#1a1917', color: '#fff', borderColor: '#1a1917' } : pillBtn}
          >
            Nivel {lv} {lv === 1 ? '· literă' : '· cuvânt'}
          </button>
        ))}
      </div>

      <BulelePestilorGame
        key={`${current.lesson.id}-${level}-${nonce}`}
        lesson={current.lesson}
        distractorLessons={distractors}
        nextLesson={next}
        level={level}
      />
    </div>
  )
}


const pillBtn: React.CSSProperties = {
  border: '1px solid #e8e6e1', background: '#f8f7f4', borderRadius: 999,
  padding: '6px 14px', fontSize: 12.5, cursor: 'pointer',
}
