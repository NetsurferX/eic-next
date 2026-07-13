'use client'

import type { GameSession } from '@/lib/gameTypes'
import { DIFFICULTY_INFO } from '@/lib/gameTypes'

interface Props {
  session: GameSession
  onExit:  () => void
}

export default function GameProgress({ session, onExit }: Props) {
  const progress = session.totalRounds > 0
    ? (session.roundsDone / session.totalRounds) * 100
    : 0
  const diff = DIFFICULTY_INFO[session.difficulty]

  return (
    <div className="gp-wrap">
      <div className="gp-top">
        <button className="gp-exit" onClick={onExit} title="Exit">←</button>
        <div className="gp-level-badge">{diff.icon} {diff.label}</div>
        <div className="gp-stats">
          {session.streak >= 2 && <span className="gp-streak">🔥 {session.streak}</span>}
          <span className="gp-score">{session.score}/{session.roundsDone}</span>
          <span className="gp-xp">+{session.xp} XP</span>
        </div>
      </div>

      <div className="gp-bar-wrap">
        <div className="gp-bar-fill" style={{ width: `${progress}%` }} />
        <div className="gp-bar-dots">
          {Array.from({ length: session.totalRounds }).map((_, i) => (
            <div
              key={i}
              className={[
                'gp-dot',
                i < session.roundsDone ? 'done' : i === session.current ? 'current' : '',
              ].filter(Boolean).join(' ')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
