'use client'

import { useState, useEffect } from 'react'
import type { GameWord } from '@/lib/gameTypes'
import { resolveDisplay } from '@/lib/engine/display'

interface Props {
  word:        GameWord
  phase:       'playing' | 'feedback' | 'intro' | 'done'
  lastCorrect: boolean | null
  onAnswer:    (correct: boolean) => void
}

// Unlike SilentGame/StressGame, this one does NOT reimplement a slice of
// display.ts's rules locally — it calls the real resolveDisplay() and reads
// .gradient/.gradientCss straight off the result. StressGame's own comment
// already flagged what happens when a local copy drifts from
// engine/display.ts (the w/y GRAPHIC_CONSONANT_LETTERS mismatch); importing
// the real function removes that failure mode for this game entirely.
export default function GradientGame({ word, phase, lastCorrect, onAnswer }: Props) {
  const [tapped, setTapped] = useState<Set<number>>(new Set())

  useEffect(() => { setTapped(new Set()) }, [word.word])

  useEffect(() => {
    if (phase !== 'playing') return
    fetch('/api/speak', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ word: word.word }),
    })
      .then(r => r.blob())
      .then(blob => new Audio(URL.createObjectURL(blob)).play())
      .catch(() => {})
  }, [word.word, phase])

  const resolved = resolveDisplay(word.nodes)
  const gradientIndices = resolved
    .map((n, i) => (n.gradient ? i : null))
    .filter((i): i is number => i !== null)

  const isPlaying  = phase === 'playing'
  const isFeedback = phase === 'feedback'

  function handleTap(i: number) {
    if (!isPlaying) return
    setTapped(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function handleSubmit() {
    if (!isPlaying) return
    const correct = gradientIndices.length > 0
      && gradientIndices.every(i => tapped.has(i))
      && [...tapped].every(i => gradientIndices.includes(i))
    onAnswer(correct)
  }

  return (
    <div className="gg-wrap">
      <p className="game-instruction">
        Tap the part of the word that gets a <strong>colour gradient</strong> —
        an unstressed short vowel fading to black, or a two-tone diphthong.
      </p>

      <div className="gg-letters">
        {resolved.map((n, i) => {
          if (!n.t) return null
          const isGrad     = gradientIndices.includes(i)
          const isTapped   = tapped.has(i)
          const isClickable = isPlaying

          let feedbackClass = ''
          if (isFeedback) {
            if (isGrad && isTapped)   feedbackClass = 'sg-reveal-correct'
            if (isGrad && !isTapped)  feedbackClass = 'sg-reveal-missed'
            if (!isGrad && isTapped)  feedbackClass = 'sg-reveal-wrong'
          }

          const style: React.CSSProperties = {}
          if (isFeedback && isGrad) {
            style.backgroundImage = n.gradientCss || 'linear-gradient(to right, #FF3399, #CC0000)'
            style.WebkitBackgroundClip = 'text'
            ;(style as any).backgroundClip = 'text'
            style.color = 'transparent'
          } else {
            style.color = isTapped ? '#000000' : (n.color !== 'transparent' ? n.color : '#000000')
          }

          return (
            <button
              key={i}
              className={[
                'gg-letter',
                isTapped ? 'gg-tapped' : '',
                !isClickable ? 'sg-noclick' : '',
                feedbackClass,
              ].filter(Boolean).join(' ')}
              style={style}
              onClick={() => handleTap(i)}
              disabled={!isClickable || isFeedback}
            >
              {n.t}
            </button>
          )
        })}
      </div>

      {isPlaying && gradientIndices.length > 0 && (
        <button className="gg-submit" onClick={handleSubmit}>Check →</button>
      )}

      {isPlaying && gradientIndices.length === 0 && (
        <div className="sg-hint">
          This word has no gradient parts — tap Check!
          <button className="gg-submit" onClick={() => onAnswer(tapped.size === 0)}>
            Check →
          </button>
        </div>
      )}

      {isFeedback && (
        <div className={`cg-feedback ${lastCorrect ? 'fb-correct' : 'fb-wrong'}`}>
          {lastCorrect
            ? `✓ Correct! That part fades or blends — the engine renders it as a gradient.`
            : `Not quite. Gradients mark unstressed short vowels or two-tone diphthongs.`}
        </div>
      )}
    </div>
  )
}
