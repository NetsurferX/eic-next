'use client'

import { useState, useEffect } from 'react'
import type { GameWord } from '@/lib/gameTypes'

interface Props {
  word:        GameWord
  phase:       'playing' | 'feedback' | 'intro' | 'done'
  lastCorrect: boolean | null
  onAnswer:    (correct: boolean) => void
}

const SILENT     = '#cccccc'
const GRAPHIC_CONS = new Set('bcdfghjklmnpqrstvxz')

function isGraphicCons(t: string) {
  return !!t && [...t.toLowerCase()].every(c => GRAPHIC_CONS.has(c))
}

export default function SilentGame({ word, phase, lastCorrect, onAnswer }: Props) {
  const [tapped, setTapped] = useState<Set<number>>(new Set())

  useEffect(() => {
    setTapped(new Set())
  }, [word.word])

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

  // Silent nodes: c==SILENT AND grapheme is a graphic consonant
  const silentIndices = word.nodes
    .map((n, i) => ({ n, i }))
    .filter(({ n }) => n.c === SILENT && n.t && isGraphicCons(n.t))
    .map(({ i }) => i)

  const isPlaying  = phase === 'playing'
  const isFeedback = phase === 'feedback'

  function handleTap(idx: number) {
    if (!isPlaying) return
    setTapped(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  function handleSubmit() {
    if (!isPlaying) return
    // Correct if tapped set matches silent set exactly
    const correct = silentIndices.length > 0
      && silentIndices.every(i => tapped.has(i))
      && [...tapped].every(i => silentIndices.includes(i))
    onAnswer(correct)
  }

  return (
    <div className="sg-wrap">
      <p className="game-instruction">
        Tap all the <strong>silent letters</strong> — the ones that make no sound.
      </p>

      {/* Interactive letter tiles */}
      <div className="sg-letters">
        {word.nodes.map((n, i) => {
          if (!n.t) return null
          const isSilent   = silentIndices.includes(i)
          const isTapped   = tapped.has(i)
          const isClickable = isPlaying && isGraphicCons(n.t)

          // Feedback colouring
          let feedbackClass = ''
          if (isFeedback) {
            if (isSilent && isTapped)   feedbackClass = 'sg-reveal-correct'
            if (isSilent && !isTapped)  feedbackClass = 'sg-reveal-missed'
            if (!isSilent && isTapped)  feedbackClass = 'sg-reveal-wrong'
          }

          return (
            <button
              key={i}
              className={[
                'sg-letter',
                isTapped   ? 'sg-tapped'    : '',
                !isClickable ? 'sg-noclick' : '',
                feedbackClass,
              ].filter(Boolean).join(' ')}
              style={{
                color: isFeedback
                  ? (isSilent ? '#cccccc' : n.c || '#000')
                  : (isTapped ? '#cccccc' : n.c || '#000'),
              }}
              onClick={() => handleTap(i)}
              disabled={!isClickable || isFeedback}
            >
              {n.t}
            </button>
          )
        })}
      </div>

      {isPlaying && silentIndices.length > 0 && (
        <button className="sg-submit" onClick={handleSubmit}>
          Check →
        </button>
      )}

      {isPlaying && silentIndices.length === 0 && (
        <div className="sg-hint">
          This word has no silent letters — tap Check!
          <button className="sg-submit" onClick={() => onAnswer(tapped.size === 0)}>
            Check →
          </button>
        </div>
      )}

      {isFeedback && (
        <div className={`cg-feedback ${lastCorrect ? 'fb-correct' : 'fb-wrong'}`}>
          {lastCorrect
            ? `✓ Correct! Grey letters are always silent.`
            : `Not quite. Silent letters are shown in grey — they have no sound.`
          }
        </div>
      )}
    </div>
  )
}
