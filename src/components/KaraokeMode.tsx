'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import WordRenderer from './WordRenderer'
import type { TextToken } from '@/lib/useColorizer'

interface Props {
  tokens: TextToken[]
}

const SPEEDS = { slow: 900, normal: 550, fast: 280 }

export default function KaraokeMode({ tokens }: Props) {
  const wordTokens = tokens.filter(t => t.isWord && t.nodes)
  const [current, setCurrent]   = useState(-1)
  const [playing, setPlaying]   = useState(false)
  const [speed, setSpeed]       = useState<keyof typeof SPEEDS>('normal')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentRef = useRef(current)
  currentRef.current = current

  const stop = useCallback(() => {
    setPlaying(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const advance = useCallback(() => {
    setCurrent(prev => {
      const next = prev + 1
      if (next >= wordTokens.length) {
        setPlaying(false)
        return prev
      }
      timerRef.current = setTimeout(advance, SPEEDS[speed])
      return next
    })
  }, [wordTokens.length, speed])

  const play = useCallback(() => {
    if (wordTokens.length === 0) return
    if (current >= wordTokens.length - 1) setCurrent(-1)
    setPlaying(true)
    timerRef.current = setTimeout(advance, 100)
  }, [advance, current, wordTokens.length])

  useEffect(() => {
    if (!playing) return
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [playing])

  useEffect(() => {
    stop()
    setCurrent(-1)
  }, [tokens, stop])

  // Build full rendered text with highlights
  const rendered = tokens.map((tok, i) => {
    if (tok.isWhitespace) return <span key={i}>{tok.raw}</span>
    if (tok.isPunct)      return <span key={i} className="k-punct">{tok.raw}</span>

    const wordIdx = wordTokens.indexOf(tok)
    const isPast    = wordIdx < current
    const isCurrent = wordIdx === current
    const isFuture  = wordIdx > current

    if (!tok.nodes) {
      return (
        <span key={i} className={`k-word ${isFuture ? 'k-future' : ''}`}>
          {tok.raw}
        </span>
      )
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
              {current === -1 || current >= wordTokens.length - 1 ? '▶ play' : '▶ resume'}
            </button>
          ) : (
            <button className="k-play-btn k-stop" onClick={stop}>■ stop</button>
          )}
          <button className="k-reset-btn" onClick={() => { stop(); setCurrent(-1) }}>↺</button>
        </div>
      </div>

      {/* Progress bar */}
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

      {/* Text display */}
      <div className="k-text" aria-live="polite">
        {tokens.length === 0
          ? <span className="k-empty">Paste text above to begin reading.</span>
          : rendered
        }
      </div>

      {/* Current word callout */}
      {current >= 0 && current < wordTokens.length && wordTokens[current].nodes && (
        <div className="k-callout">
          <WordRenderer
            nodes={wordTokens[current].nodes!}
            wordStr={wordTokens[current].raw}
          />
        </div>
      )}
    </div>
  )
}
