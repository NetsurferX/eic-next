'use client'

import { useRef, useMemo, useState, useCallback } from 'react'
import WordRenderer from '@/components/WordRenderer'
import StatsBar from '@/components/StatsBar'
import SoundSpectrum from '@/components/SoundSpectrum'
import KaraokeMode from '@/components/KaraokeMode'
import ColourGame   from '@/components/game/ColourGame'
import GameProgress from '@/components/game/GameProgress'
import IntroCard    from '@/components/game/IntroCard'
import { useColorizer } from '@/lib/useColorizer'
import { COLOR_SILENT, COLOR_CONSONANT } from '@/lib/renderNode'
import type { GameWord, GameSession, Difficulty } from '@/lib/gameTypes'

const SAMPLES = [
  'The quick brown fox jumps over the lazy dog.',
  'She sells seashells by the seashore.',
  'How much wood would a woodchuck chuck if a woodchuck could chuck wood?',
  'Peter Piper picked a peck of pickled peppers.',
  'To be or not to be, that is the question.',
  'Beauty is in the eye of the beholder.',
  'Knight and power through the silent night.',
]

let sampleIdx = 0

// ── Game setup — same session machine that used to live in app/learn/page.tsx ──
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

export default function Home() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { tokens, stats, inputText, onInput, setInputText } = useColorizer()

  const usedColors = useMemo(() => {
    const s = new Set<string>()
    for (const t of tokens) {
      if (!t.nodes) continue
      for (const n of t.nodes)
        if (n.c !== COLOR_SILENT && n.c !== COLOR_CONSONANT && n.t.length > 0)
          s.add(n.c)
    }
    return s
  }, [tokens])

  function loadSample() {
    const text = SAMPLES[sampleIdx % SAMPLES.length]
    sampleIdx++
    setInputText(text)
    onInput(text)
    if (textareaRef.current) textareaRef.current.value = text
  }

  function clearAll() {
    setInputText('')
    onInput('')
    if (textareaRef.current) textareaRef.current.value = ''
  }

  // ── Game state ─────────────────────────────────────────────────────────────
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

  return (
    <main className="eic-home">

      {/* Hero */}
      <header className="eic-header">
        <div className="eic-dots" aria-hidden="true">
          <span className="eic-dot" style={{ background: '#CC0000' }} />
          <span className="eic-dot" style={{ background: '#00b0f0' }} />
          <span className="eic-dot" style={{ background: '#008E40' }} />
          <span className="eic-dot" style={{ background: '#7030A0' }} />
        </div>
        <h1 className="eic-headline">See English as it sounds.</h1>
        <p className="eic-subline">Type or paste text — every grapheme colours in place.</p>
      </header>

      {/* Sound Spectrum — always visible */}
      <SoundSpectrum tokens={tokens} />

      {/* ── Editor ── */}
      <div className="eic-toolbar-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', margin: '0.5rem 0' }}>
        <button className="eic-action-btn" onClick={loadSample}>try a sample</button>
        <button className="eic-action-btn" onClick={clearAll}>clear</button>
      </div>

      <div className="eic-editor" onClick={() => textareaRef.current?.focus()}>
        <div className="eic-highlight" aria-hidden="true">
          {tokens.length === 0
            ? <span className="eic-placeholder">Type or paste English text here…</span>
            : tokens.map(tok => {
                if (tok.isWhitespace) return tok.raw
                if (tok.isPunct)  return <span key={tok.key} className="eic-punct">{tok.raw}</span>
                if (!tok.nodes)   return <span key={tok.key} className="eic-plain">{tok.raw}</span>
                return <WordRenderer key={tok.key} nodes={tok.nodes} wordStr={tok.raw} />
              })
          }
        </div>
        <textarea
          ref={textareaRef}
          className="eic-textarea"
          defaultValue={inputText}
          onChange={e => onInput(e.target.value)}
          placeholder=" "
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          rows={6}
          aria-label="Text input"
        />
      </div>

      {stats && <StatsBar stats={stats} usedColors={usedColors} />}

      {/* ── Voice reading — inline by default, no tab ── */}
      <KaraokeMode tokens={tokens} />

      {/* ── Game — inline below, no separate page ── */}
      <section className="game-home" style={{ marginTop: '3rem' }}>
        {session.phase === 'intro' && <IntroCard onStart={begin} />}

        {session.phase === 'loading' && (
          <div className="game-loading">Loading words…</div>
        )}

        {session.phase === 'done' && (
          <div className="game-done">
            <div className="game-done-emoji">
              {Math.round((session.score / session.totalRounds) * 100) >= 80 ? '🎉'
                : Math.round((session.score / session.totalRounds) * 100) >= 50 ? '👍' : '💪'}
            </div>
            <h2 className="game-done-title">
              {Math.round((session.score / session.totalRounds) * 100) >= 80 ? 'Excellent!'
                : Math.round((session.score / session.totalRounds) * 100) >= 50 ? 'Good work!' : 'Keep practising!'}
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
        )}

        {(session.phase === 'playing' || session.phase === 'feedback') && currentWord && (
          <>
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
          </>
        )}
      </section>

    </main>
  )
}
