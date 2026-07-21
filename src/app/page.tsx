'use client'

import { useRef, useMemo, useState, useCallback, useEffect } from 'react'
import WordRenderer from '@/components/WordRenderer'
import StatsBar from '@/components/StatsBar'
import SoundSpectrum from '@/components/SoundSpectrum'
import ColourGame   from '@/components/game/ColourGame'
import GameProgress from '@/components/game/GameProgress'
import { useColorizer } from '@/lib/useColorizer'
import { COLOR_SILENT, COLOR_CONSONANT } from '@/lib/renderNode'
import type { GameWord, GameSession } from '@/lib/gameTypes'

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

// ── Reading / voice sync — single fixed pace, no speed selector ────────────
const READ_PACE_MS = 1000

const audioCache = new Map<string, string>()  // word → object URL

async function prefetch(word: string): Promise<void> {
  if (typeof window === 'undefined' || audioCache.has(word)) return
  try {
    const res = await fetch('/api/speak', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ word }),
    })
    if (!res.ok) return
    const blob = await res.blob()
    audioCache.set(word, URL.createObjectURL(blob))
  } catch { /* ignore — speak() will just fetch it later */ }
}

async function speak(word: string): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    let url = audioCache.get(word)
    if (!url) {
      const res = await fetch('/api/speak', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ word }),
      })
      if (!res.ok) return
      const blob = await res.blob()
      url = URL.createObjectURL(blob)
      audioCache.set(word, url)
    }
    const audio = new Audio(url)
    await audio.play()
  } catch (e) {
    console.warn('speak error:', e)
  }
}

// ── Game — no difficulty picker, starts itself, single fixed difficulty ────
const ROUNDS = 10
const GAME_DIFFICULTY = 'medium' as const

async function fetchWords(): Promise<GameWord[]> {
  const res  = await fetch(`/api/game?n=${ROUNDS}&difficulty=${GAME_DIFFICULTY}`)
  const data = await res.json() as { words: GameWord[] }
  return data.words ?? []
}

const EMPTY_SESSION: GameSession = {
  difficulty: GAME_DIFFICULTY, words: [], current: 0, score: 0, streak: 0, maxStreak: 0,
  xp: 0, roundsDone: 0, totalRounds: 0, phase: 'loading', lastCorrect: null,
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

  // ── Reading / voice sync state ────────────────────────────────────────────
  const wordTokens = tokens.filter(t => t.isWord && t.nodes)
  const [current, setCurrent] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stoppedRef = useRef(false)

  const stopReading = useCallback(() => {
    stoppedRef.current = true
    setPlaying(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const advance = useCallback((idx: number) => {
    const next = idx + 1
    if (next >= wordTokens.length) {
      setPlaying(false)
      return
    }
    stoppedRef.current = false
    setCurrent(next)

    if (wordTokens[next + 1]) prefetch(wordTokens[next + 1].raw)
    if (wordTokens[next + 2]) prefetch(wordTokens[next + 2].raw)

    speak(wordTokens[next].raw).finally(() => {
      if (stoppedRef.current) return
      timerRef.current = setTimeout(() => advance(next), READ_PACE_MS)
    })
  }, [wordTokens])

  const playReading = useCallback(() => {
    if (wordTokens.length === 0) return
    const startIdx = current >= wordTokens.length - 1 ? 0 : Math.max(0, current)
    stoppedRef.current = false
    setPlaying(true)
    setCurrent(startIdx)

    if (wordTokens[startIdx + 1]) prefetch(wordTokens[startIdx + 1].raw)
    if (wordTokens[startIdx + 2]) prefetch(wordTokens[startIdx + 2].raw)

    speak(wordTokens[startIdx].raw).finally(() => {
      if (stoppedRef.current) return
      timerRef.current = setTimeout(() => advance(startIdx), READ_PACE_MS)
    })
  }, [advance, current, wordTokens])

  // Reset reading position when the text itself changes
  useEffect(() => { stopReading(); setCurrent(-1) }, [tokens, stopReading])
  useEffect(() => () => stopReading(), [stopReading])

  // ── Game state — auto-starts on mount, no difficulty choice ──────────────
  const [session, setSession] = useState<GameSession>(EMPTY_SESSION)

  const begin = useCallback(async () => {
    setSession(s => ({ ...s, phase: 'loading' }))
    const words = await fetchWords()
    if (!words.length) return
    setSession({
      difficulty: GAME_DIFFICULTY, words, current: 0, score: 0, streak: 0, maxStreak: 0,
      xp: 0, roundsDone: 0, totalRounds: words.length,
      phase: 'playing', lastCorrect: null,
    })
  }, [])

  useEffect(() => { begin() }, [begin])

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

  // ── Editor + inline reading highlight ─────────────────────────────────────
  const rendered = tokens.map((tok, i) => {
    if (tok.isWhitespace) return <span key={i}>{tok.raw}</span>
    if (tok.isPunct)      return <span key={i} className="eic-punct">{tok.raw}</span>

    const wordIdx   = wordTokens.indexOf(tok)
    const isPast    = wordIdx !== -1 && wordIdx < current
    const isCurrent = wordIdx !== -1 && wordIdx === current
    const isFuture  = wordIdx !== -1 && wordIdx > current || wordIdx === -1

    const cls = [
      'k-word',
      isPast    ? 'k-past'    : '',
      isCurrent ? 'k-current' : '',
      isFuture  ? 'k-future'  : '',
    ].filter(Boolean).join(' ')

    if (!tok.nodes) return <span key={i} className={`eic-plain ${cls}`}>{tok.raw}</span>

    return (
      <span key={i} className={cls}>
        <WordRenderer nodes={tok.nodes} wordStr={tok.raw} />
      </span>
    )
  })

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

      {/* ── Two-column layout: editor+reading left, game right ── */}
      <div className="eic-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* Left column — editor with inline reading sync */}
        <div className="eic-col-editor">
          <div className="eic-toolbar-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '0.5rem' }}>
            <button className="eic-action-btn" onClick={loadSample}>try a sample</button>
            <button className="eic-action-btn" onClick={clearAll}>clear</button>
          </div>

          <div className="eic-editor" onClick={() => textareaRef.current?.focus()}>
            <div className="eic-highlight" aria-hidden="true">
              {tokens.length === 0
                ? <span className="eic-placeholder">Type or paste English text here…</span>
                : rendered
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

          {/* Play button — directly under the input field, single pace */}
          <div className="k-actions" style={{ marginTop: '0.75rem' }}>
            {!playing ? (
              <button className="k-play-btn" onClick={playReading} disabled={wordTokens.length === 0}>
                {current <= 0 || current >= wordTokens.length - 1 ? '▶ play' : '▶ resume'}
              </button>
            ) : (
              <button className="k-play-btn k-stop" onClick={stopReading}>■ stop</button>
            )}
          </div>

          {/* Big current-word callout, right below the play button */}
          {current >= 0 && current < wordTokens.length && wordTokens[current]?.nodes && (
            <div className="k-callout" key={current}>
              <WordRenderer
                nodes={wordTokens[current].nodes!}
                wordStr={wordTokens[current].raw}
              />
            </div>
          )}
        </div>

        {/* Right column — game, auto-started, no difficulty picker */}
        <div className="eic-col-game">
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
                <button className="game-play-again" onClick={() => begin()}>
                  Play again
                </button>
              </div>
            </div>
          )}

          {(session.phase === 'playing' || session.phase === 'feedback') && currentWord && (
            <>
              <GameProgress session={session} onExit={() => begin()} />
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
        </div>

      </div>

      {/* ── Colour graph — moved to bottom, above stats ── */}
      <SoundSpectrum tokens={tokens} />

      {/* ── Statistics — bottom of page ── */}
      {stats && <StatsBar stats={stats} usedColors={usedColors} />}

    </main>
  )
}
