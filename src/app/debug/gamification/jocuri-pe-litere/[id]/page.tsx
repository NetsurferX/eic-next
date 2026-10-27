'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { LEVELS, type Lesson, type LessonWord } from '@/lib/levels'
import { GAMES } from '../_meta'
import { GAME_COMPONENTS, say } from '../_games'
import styles from '../page.module.css'

const ALL: Lesson[] = LEVELS.flatMap(l => l.lessons)

// Distractori: cuvinte din ALTE coloane, de altă culoare, care NU conțin
// grupul de litere al coloanei curente (conservator — evită cuvinte care
// ar avea sunetul din întâmplare, ex. „fish” pentru /ʃ/).
function buildPool(lesson: Lesson): LessonWord[] {
  const marks = lesson.words.map(w => w.mark.toLowerCase()).filter(Boolean)
  const own = new Set(lesson.words.map(w => w.text.toLowerCase()))
  const seen = new Set<string>()
  const out: LessonWord[] = []
  for (const l of ALL) {
    if (l.color === lesson.color) continue
    for (const w of l.words) {
      const t = w.text.toLowerCase()
      if (own.has(t) || seen.has(t) || marks.some(m => t.includes(m))) continue
      seen.add(t); out.push(w)
    }
  }
  return out
}

export default function JocLitera() {
  const { id } = useParams<{ id: string }>()
  const [run, setRun] = useState(0)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const lesson = ALL.find(l => l.id === id)
  const meta = GAMES.find(g => g.id === id)
  const pool = useMemo(() => (lesson ? buildPool(lesson) : []), [lesson])
  const idx = GAMES.findIndex(g => g.id === id)
  const Game = GAME_COMPONENTS[id]

  if (!lesson || !meta || !Game) {
    return <div className={styles.wrap}><Link href="/debug/gamification/jocuri-pe-litere">← Toate jocurile</Link><p>Joc necunoscut: {id}</p></div>
  }
  const prev = GAMES[(idx + GAMES.length - 1) % GAMES.length]
  const next = GAMES[(idx + 1) % GAMES.length]
  const sym = lesson.letter.replace('\\u200D', '\u200D')

  return (
    <div className={styles.wrap}>
      <div className={styles.shell}>
        <div className={styles.bar}>
          <Link href="/debug/gamification/jocuri-pe-litere">← Toate jocurile</Link>
          <span>
            <Link href={`/debug/gamification/jocuri-pe-litere/${prev.id}`}>‹ {prev.title}</Link>{' · '}
            <Link href={`/debug/gamification/jocuri-pe-litere/${next.id}`}>{next.title} ›</Link>
          </span>
        </div>
        <div className={styles.title}>
          <span className={styles.sym} style={{ background: lesson.color }}>{sym}</span>
          <h1>{meta.emoji} {meta.title}</h1>
          <button className={styles.speak} onClick={() => say(lesson.matchWord ?? lesson.words[0].text, lesson.accent)}>🔊 sunetul</button>
        </div>
        <p className={styles.how}>{meta.mechanic}</p>
        <div className={styles.arena}>
          {mounted && <Game key={run} lesson={lesson} pool={pool} again={() => setRun(r => r + 1)} />}
        </div>
      </div>
    </div>
  )
}
