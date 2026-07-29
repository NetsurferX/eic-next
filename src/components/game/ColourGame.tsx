'use client'

import { useMemo, useEffect } from 'react'
import WordRenderer from '@/components/WordRenderer'
import type { GameWord, Difficulty } from '@/lib/gameTypes'
import { COLOR_LABELS, NEAR_COLOR_GROUPS } from '@/lib/gameTypes'
import { speakWord } from '@/lib/speak'

interface Props {
  word:        GameWord
  difficulty:  Difficulty
  phase:       'playing' | 'feedback' | 'intro' | 'loading' | 'done'
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

export default function ColourGame({ word, difficulty, phase, lastCorrect, onAnswer }: Props) {
  const correct = word.dominantColor

  // Build 4 options: 1 correct + 3 distractors. On Hard, distractors are
  // pulled from NEAR_COLOR_GROUPS first — phonetically neighbouring sounds,
  // so telling them apart takes real recognition, not just "not that hue".
  const options = useMemo(() => {
    const all = Object.keys(COLOR_LABELS).filter(c => c !== correct)

    if (difficulty === 'hard') {
      const neighbours = shuffle((NEAR_COLOR_GROUPS[correct] ?? []).filter(c => c !== correct))
      const rest = shuffle(all.filter(c => !neighbours.includes(c)))
      const distractors = [...neighbours, ...rest].slice(0, 3)
      return shuffle([correct, ...distractors])
    }

    const distractors = shuffle(all).slice(0, 3)
    return shuffle([correct, ...distractors])
  }, [correct, difficulty])

  // Auto-speak word
  useEffect(() => {
    if (phase !== 'playing') return
    const { stop } = speakWord(word.word)
    return () => stop() // oprește dacă utilizatorul schimbă cuvântul/faza înainte să termine
  }, [word.word, phase])

  const isPlaying  = phase === 'playing'
  const isFeedback = phase === 'feedback'

  return (
    <div className="cg-wrap">
      <p className="game-instruction">
        What sound does the <strong>highlighted colour</strong> represent?
      </p>

      <div className="cg-word-display">
        <WordRenderer nodes={word.nodes} wordStr={word.word} />
      </div>

      <div className="cg-swatch-row">
        <div className="cg-swatch" style={{ background: correct }} />
        <span className="cg-swatch-label">dominant sound</span>
      </div>

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