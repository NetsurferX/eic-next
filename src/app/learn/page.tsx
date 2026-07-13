'use client'

import { useState, useCallback } from 'react'
import type { GameWord, GameSession, Difficulty } from '@/lib/gameTypes'
import ColourGame   from '@/components/game/ColourGame'
import GameProgress from '@/components/game/GameProgress'
import IntroCard    from '@/components/game/IntroCard'

const ROUNDS = 10

async function fetchWords(difficulty: Difficulty): Promise<GameWord[]> {
  const res  = await fetch(`/api/game?n=${ROUNDS}&difficulty=${difficulty}`)
  const data = await res.json() as { words: GameWord[] }
  return data.words ?? []
}

const EMPTY_SESSION: GameSession = {
  difficulty: 'medium', words: [], current: 0, score: 0, streak: 0, maxStreak: 0,
  xp: 0, roundsDone: 0, totalRounds: 0, phase: 'intro', lastCorrect: null,
}

export default function LearnPage() {
  const [session, setSession] = useState<GameSession>(EMPTY_SESSION)

  const begin = useCallback(async (difficulty: Difficulty) => {
    setSession(s => ({ ...s, difficulty, phase: 'loading' }))
    const words = await fetchWords(difficulty)
    if (!words.length) {
      setSession(s => ({ ...s, phase: 'intro' }))
      return
    }
    setSession({
      difficulty, words, current: 0, score: 0, streak: 0, maxStreak: 0,
      xp: 0, roundsDone: 0, totalRounds: words.length,
      phase: 'playing', lastCorrect: null,
    })
  }, [])

  const onAnswer = useCallback((correct: boolean) => {
    setSession(prev => {
      const streak     = correct ? prev.streak + 1 : 0
      const xpGain     = correct ? 10 + streak * 2 : 0
      const roundsDone = prev.roundsDone + 1
      return {
        ...prev,
        score:       prev.score + (correct ? 1 : 0),
        streak,
        maxStreak:   Math.max(prev.maxStreak, streak),
        xp:          prev.xp + xpGain,
        roundsDone,
        phase:       'feedback',
        lastCorrect: correct,
      }
    })

    setTimeout(() => {
      setSession(prev => {
        const isLast = prev.current >= prev.words.length - 1
        return {
          ...prev,
          current: isLast ? prev.current : prev.current + 1,
          phase:   isLast ? 'done' : 'playing',
        }
      })
    }, 1200)
  }, [])

  const currentWord = session.words[session.current] ?? null

  if (session.phase === 'intro') {
    return (
      <main className="game-home">
        <IntroCard onStart={begin} />
      </main>
    )
  }

  if (session.phase === 'loading') {
    return (
      <main className="game-home">
        <div className="game-loading">Loading words…</div>
      </main>
    )
  }

  if (session.phase === 'done') {
    const pct = Math.round((session.score / session.totalRounds) * 100)
    return (
      <main className="game-home">
        <div className="game-done">
          <div className="game-done-emoji">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
          <h2 className="game-done-title">
            {pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good work!' : 'Keep practising!'}
          </h2>
          <div className="game-done-stats">
            <div className="game-done-stat">
              <span className="game-done-num">{session.score}/{session.totalRounds}</span>
              <span className="game-done-lbl">correct</span>
            </div>
            <div className="game-done-stat">
              <span className="game-done-num">{session.maxStreak}</span>
              <span className="game-done-lbl">best streak</span>
            </div>
            <div className="game-done-stat">
              <span className="game-done-num">+{session.xp}</span>
              <span className="game-done-lbl">XP earned</span>
            </div>
          </div>
          <div className="game-done-actions">
            <button className="game-play-again" onClick={() => begin(session.difficulty)}>
              Play again
            </button>
            <button className="game-change-level" onClick={() => setSession(EMPTY_SESSION)}>
              Change difficulty
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (!currentWord) return null

  return (
    <main className="game-home">
      <GameProgress session={session} onExit={() => setSession(EMPTY_SESSION)} />

      <div className="game-arena">
        <ColourGame
          word={currentWord}
          difficulty={session.difficulty}
          phase={session.phase}
          lastCorrect={session.lastCorrect}
          onAnswer={onAnswer}
        />
      </div>
    </main>
  )
}
