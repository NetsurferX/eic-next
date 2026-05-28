'use client'

import { useMemo, useEffect } from 'react'
import WordRenderer from '@/components/WordRenderer'
import type { GameWord } from '@/lib/gameTypes'
import { COLOR_LABELS } from '@/lib/gameTypes'

interface Props {
  word:        GameWord
  phase:       'playing' | 'feedback' | 'intro' | 'done'
  lastCorrect: boolean | null
  onAnswer:    (correct: boolean) => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function ColourGame({ word, phase, lastCorrect, onAnswer }: Props) {
  const correct = word.dominantColor

  // Build 4 options: 1 correct + 3 random distractors
  const options = useMemo(() => {
    const all = Object.keys(COLOR_LABELS).filter(c => c !== correct)
    const distractors = shuffle(all).slice(0, 3)
    return shuffle([correct, ...distractors])
  }, [correct])

  // Auto-speak word
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

  const isPlaying  = phase === 'playing'
  const isFeedback = phase === 'feedback'

  return (
    <div className="cg-wrap">

      {/* Instruction */}
      <p className="game-instruction">
        What sound does the <strong>highlighted colour</strong> represent?
      </p>

      {/* Word display */}
      <div className="cg-word-display">
        <WordRenderer nodes={word.nodes} wordStr={word.word} />
      </div>

      {/* Dominant colour swatch */}
      <div className="cg-swatch-row">
        <div className="cg-swatch" style={{ background: correct }} />
        <span className="cg-swatch-label">dominant sound</span>
      </div>

      {/* Options */}
      <div className="cg-options">
        {options.map(color => {
          const info      = COLOR_LABELS[color]
          const isCorrect = color === correct
          const btnClass  = [
            'cg-option',
            isFeedback && isCorrect  ? 'correct'   : '',
            isFeedback && !isCorrect ? 'incorrect' : '',
          ].filter(Boolean).join(' ')

          return (
            <button
              key={color}
              className={btnClass}
              disabled={!isPlaying}
              onClick={() => onAnswer(isCorrect)}
            >
              <div className="cg-opt-dot" style={{ background: color }} />
              <div className="cg-opt-text">
                <span className="cg-opt-label">{info?.label ?? color}</span>
                <span className="cg-opt-ex">{info?.example ?? ''}</span>
              </div>
              {isFeedback && isCorrect && <span className="cg-tick">✓</span>}
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {isFeedback && (
        <div className={`cg-feedback ${lastCorrect ? 'fb-correct' : 'fb-wrong'}`}>
          {lastCorrect
            ? `✓ Yes! "${word.word}" has the ${COLOR_LABELS[correct]?.label} sound.`
            : `The correct answer is ${COLOR_LABELS[correct]?.label} — as in ${COLOR_LABELS[correct]?.example}.`
          }
        </div>
      )}
    </div>
  )
}
