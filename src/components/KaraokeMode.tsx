'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import WordRenderer from './WordRenderer'
import type { TextToken } from '@/lib/useColorizer'

interface Props {
  tokens: TextToken[]
}

const SPEEDS = { slow: 2000, normal: 1000, fast: 500 }

// Audio cache — avoid re-fetching the same word
const audioCache = new Map<string, string>()  // word → object URL

// Prefetch-only: synthesizes and caches a word's audio without playing it.
// Fire-and-forget by design — callers don't await this.
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
  } catch {
    // ignore — a failed prefetch just means speak() will fetch it later
  }
}

// Resolves once playback has actually STARTED (not when it ends) — that's
// the moment advance()'s pacing timer is allowed to start counting.
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

export default function KaraokeMode({ tokens }: Props) {
  const wordTokens = tokens.filter(t => t.isWord && t.nodes)
  const [current, setCurrent]         = useState(-1)
  const [playing, setPlaying]         = useState(false)
  const [speed, setSpeed]             = useState<keyof typeof SPEEDS>('normal')
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const speedRef   = useRef(speed)
  const stoppedRef = useRef(false)
  speedRef.current = speed

  const stop = useCallback(() => {
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

    // Prefetch the next couple of words in the background so their audio
    // is already cached by the time we get there — hides the ~1-2s Piper
    // model-load latency behind however long the current word takes.
    if (wordTokens[next + 1]) prefetch(wordTokens[next + 1].raw)
    if (wordTokens[next + 2]) prefetch(wordTokens[next + 2].raw)

    speak(wordTokens[next].raw).finally(() => {
      if (stoppedRef.current) return
      timerRef.current = setTimeout(() => advance(next), SPEEDS[speedRef.current])
    })
  }, [wordTokens])

  const play = useCallback(() => {
    if (wordTokens.length === 0) return
    const startIdx = current >= wordTokens.length - 1 ? 0 : Math.max(0, current)
    stoppedRef.current = false
    setPlaying(true)
    setCurrent(startIdx)

    // Warm the cache for the first couple of words too.
    if (wordTokens[startIdx + 1]) prefetch(wordTokens[startIdx + 1].raw)
    if (wordTokens[startIdx + 2]) prefetch(wordTokens[startIdx + 2].raw)

    speak(wordTokens[startIdx].raw).finally(() => {
      if (stoppedRef.current) return
      timerRef.current = setTimeout(() => advance(startIdx), SPEEDS[speedRef.current])
    })
  }, [advance, current, wordTokens])

  // Stop when tokens change
  useEffect(() => { stop(); setCurrent(-1) }, [tokens, stop])
  useEffect(() => () => stop(), [stop])

  const rendered = tokens.map((tok, i) => {
    if (tok.isWhitespace) return <span key={i}>{tok.raw}</span>
    if (tok.isPunct)      return <span key={i} className="k-punct">{tok.raw}</span>

    const wordIdx   = wordTokens.indexOf(tok)
    const isPast    = wordIdx !== -1 && wordIdx < current
    const isCurrent = wordIdx !== -1 && wordIdx === current
    const isFuture  = wordIdx !== -1 && wordIdx > current || wordIdx === -1

    if (!tok.nodes) {
      return <span key={i} className={`k-word ${isFuture ? 'k-future' : ''}`}>{tok.raw}</span>
    }

    return (
      <span
        key={i}
        className={[
          'k-word',
          isPast    ? 'k-past'    : '',
          isCurrent ? 'k-current' : '',
          isFuture  ? 'k-future'  : '',
        ].filter(Boolean).join(' ')}
      >
        <WordRenderer nodes={tok.nodes} wordStr={tok.raw} />
      </span>
    )
  })

  return (
    <div className="karaoke-wrap">

      {/* Controls */}
      <div className="k-controls">
        <div className="k-speed-tabs">
          {(Object.keys(SPEEDS) as (keyof typeof SPEEDS)[]).map(s => (
            <button
              key={s}
              className={`k-speed-btn ${speed === s ? 'active' : ''}`}
              onClick={() => setSpeed(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="k-actions">
          {!playing ? (
            <button className="k-play-btn" onClick={play}>
              {current <= 0 || current >= wordTokens.length - 1 ? '▶ play' : '▶ resume'}
            </button>
          ) : (
            <button className="k-play-btn k-stop" onClick={stop}>■ stop</button>
          )}
          <button className="k-reset-btn" title="restart" onClick={() => { stop(); setCurrent(-1) }}>↺</button>
        </div>

      </div>

      {/* Progress */}
      <div className="k-progress-wrap">
        <div
          className="k-progress-fill"
          style={{
            width: wordTokens.length > 0
              ? `${Math.max(0, (current + 1) / wordTokens.length * 100)}%`
              : '0%'
          }}
        />
      </div>

      {/* Text */}
      <div className="k-text" aria-live="polite">
        {tokens.length === 0
          ? <span className="k-empty">Paste text above to begin reading.</span>
          : rendered
        }
      </div>

      {/* Big word callout */}
      {current >= 0 && current < wordTokens.length && wordTokens[current]?.nodes && (
        <div className="k-callout" key={current}>
          <WordRenderer
            nodes={wordTokens[current].nodes!}
            wordStr={wordTokens[current].raw}
          />
        </div>
      )}

    </div>
  )
}
