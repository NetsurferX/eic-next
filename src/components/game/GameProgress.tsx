'use client'

import type { GameState } from '@/lib/gameTypes'
import { LEVEL_INFO } from '@/lib/gameTypes'

interface Props {
  game:   GameState
  onExit: () => void
}

export default function GameProgress({ game, onExit }: Props) {
  const progress = game.totalRounds > 0
    ? (game.roundsDone / game.totalRounds) * 100
    : 0

  return (
    <div className="gp-wrap">
      <div className="gp-top">
        <button className="gp-exit" onClick={onExit} title="Exit">←</button>
        <div className="gp-level-badge">
          {LEVEL_INFO[game.level].icon} {LEVEL_INFO[game.level].name}
        </div>
        <div className="gp-stats">
          {game.streak >= 2 && (
            <span className="gp-streak">🔥 {game.streak}</span>
          )}
          <span className="gp-score">{game.score}/{game.roundsDone}</span>
          <span className="gp-xp">+{game.xp} XP</span>
        </div>
      </div>

      <div className="gp-bar-wrap">
        <div className="gp-bar-fill" style={{ width: `${progress}%` }} />
        <div className="gp-bar-dots">
          {Array.from({ length: game.totalRounds }).map((_, i) => (
            <div
              key={i}
              className={[
                'gp-dot',
                i < game.roundsDone
                  ? (game.words[i] ? 'done' : 'done')
                  : i === game.current ? 'current' : ''
              ].filter(Boolean).join(' ')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
