'use client'

import { useState, useEffect, useCallback } from 'react'
import type { GameState, GameWord, GameLevel } from '@/lib/gameTypes'
import { LEVEL_INFO } from '@/lib/gameTypes'
import ColourGame   from '@/components/game/ColourGame'
import SilentGame   from '@/components/game/SilentGame'
import StressGame   from '@/components/game/StressGame'
import GameProgress from '@/components/game/GameProgress'

const ROUNDS = 10

async function fetchWords(level: GameLevel): Promise<GameWord[]> {
  const res  = await fetch(`/api/game?level=${level}&n=${ROUNDS}`)
  const data = await res.json() as { words: GameWord[] }
  return data.words ?? []
}

export default function LearnPage() {
  const [game, setGame] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(false)

  const startGame = useCallback(async (level: GameLevel) => {
    setLoading(true)
    const words = await fetchWords(level)
    setLoading(false)

    if (!words.length) return

    setGame({
      level,
      words,
      current:     0,
      score:       0,
      streak:      0,
      maxStreak:   0,
      xp:          0,
      roundsDone:  0,
      totalRounds: words.length,
      phase:       'playing',
      lastCorrect: null,
    })
  }, [])

  const onAnswer = useCallback((correct: boolean) => {
    setGame(prev => {
      if (!prev) return prev
      const streak    = correct ? prev.streak + 1 : 0
      const xpGain    = correct ? (10 + streak * 2) : 0
      const roundsDone = prev.roundsDone + 1
      const isLast    = prev.current >= prev.words.length - 1

      return {
        ...prev,
        score:      prev.score + (correct ? 1 : 0),
        streak,
        maxStreak:  Math.max(prev.maxStreak, streak),
        xp:         prev.xp + xpGain,
        roundsDone,
        phase:      'feedback',
        lastCorrect: correct,
        current:    isLast ? prev.current : prev.current,
      }
    })

    // After feedback delay, advance or end
    setTimeout(() => {
      setGame(prev => {
        if (!prev) return prev
        const isLast = prev.current >= prev.words.length - 1
        return {
          ...prev,
          current: isLast ? prev.current : prev.current + 1,
          phase:   isLast ? 'done' : 'playing',
        }
      })
    }, 1200)
  }, [])

  const currentWord = game?.words[game.current] ?? null

  // Intro screen
  if (!game && !loading) {
    return (
      <main className="game-home">
        <div className="game-hero">
          <div className="game-logo">
            <span style={{ color: '#CC0000' }}>E</span>
            <span style={{ color: '#00b0f0' }}>i</span>
            <span style={{ color: '#008E40' }}>C</span>
          </div>
          <h1 className="game-title">Learn English in Colours</h1>
          <p className="game-subtitle">
            Master the colour system — read any word by its sound.
          </p>
        </div>

        <div className="game-levels">
          {([1, 2, 3] as GameLevel[]).map(level => (
            <button
              key={level}
              className="game-level-card"
              onClick={() => startGame(level)}
            >
              <span className="game-level-icon">{LEVEL_INFO[level].icon}</span>
              <span className="game-level-name">{LEVEL_INFO[level].name}</span>
              <span className="game-level-desc">{LEVEL_INFO[level].desc}</span>
              <span className="game-level-start">Start →</span>
            </button>
          ))}
        </div>

        <div className="game-colour-guide">
          <h2 className="game-guide-title">The EiC Colour System</h2>
          <div className="game-colour-grid">
            {[
              { c: '#00b0f0', label: 'æ',     ex: 'cat, hat, black' },
              { c: '#008E40', label: 'ɑ / ʌ', ex: 'car, cup, love' },
              { c: '#888888', label: 'ə',     ex: 'about, sofa' },
              { c: '#EE5B00', label: 'e / ɛ', ex: 'bed, say, they' },
              { c: '#CC0000', label: 'i / ɪ', ex: 'see, sit, been' },
              { c: '#FF3399', label: 'ɒ / ɔ', ex: 'hot, or, more' },
              { c: '#7030A0', label: 'u / ʊ', ex: 'moon, book, true' },
              { c: '#4472C4', label: 'aɪ/aʊ', ex: 'my, now, eye' },
              { c: '#E57373', label: 'j / w', ex: 'yes, we, you' },
              { c: '#000000', label: '∅',     ex: 'consonants' },
              { c: '#cccccc', label: '—',     ex: 'silent letters' },
            ].map(({ c, label, ex }) => (
              <div key={c} className="game-colour-item">
                <div className="game-colour-swatch" style={{ background: c }} />
                <div className="game-colour-info">
                  <span className="game-colour-label">{label}</span>
                  <span className="game-colour-ex">{ex}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="game-home">
        <div className="game-loading">Loading words…</div>
      </main>
    )
  }

  if (!game || !currentWord) return null

  // Done screen
  if (game.phase === 'done') {
    const pct = Math.round(game.score / game.totalRounds * 100)
    return (
      <main className="game-home">
        <div className="game-done">
          <div className="game-done-emoji">
            {pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
          </div>
          <h2 className="game-done-title">
            {pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good work!' : 'Keep practising!'}
          </h2>
          <div className="game-done-stats">
            <div className="game-done-stat">
              <span className="game-done-num">{game.score}/{game.totalRounds}</span>
              <span className="game-done-lbl">correct</span>
            </div>
            <div className="game-done-stat">
              <span className="game-done-num">{game.maxStreak}</span>
              <span className="game-done-lbl">best streak</span>
            </div>
            <div className="game-done-stat">
              <span className="game-done-num">+{game.xp}</span>
              <span className="game-done-lbl">XP earned</span>
            </div>
          </div>
          <div className="game-done-actions">
            <button className="game-play-again" onClick={() => startGame(game.level)}>
              Play again
            </button>
            <button className="game-change-level" onClick={() => setGame(null)}>
              Change level
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="game-home">
      <GameProgress game={game} onExit={() => setGame(null)} />

      <div className="game-arena">
        {game.level === 1 && (
          <ColourGame
            word={currentWord}
            phase={game.phase}
            lastCorrect={game.lastCorrect}
            onAnswer={onAnswer}
          />
        )}
        {game.level === 2 && (
          <SilentGame
            word={currentWord}
            phase={game.phase}
            lastCorrect={game.lastCorrect}
            onAnswer={onAnswer}
          />
        )}
        {game.level === 3 && (
          <StressGame
            word={currentWord}
            phase={game.phase}
            lastCorrect={game.lastCorrect}
            onAnswer={onAnswer}
          />
        )}
      </div>
    </main>
  )
}
