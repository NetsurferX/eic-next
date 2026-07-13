'use client'

import { useState } from 'react'
import WordRenderer from '@/components/WordRenderer'
import type { Difficulty } from '@/lib/gameTypes'
import { COLOR_LABELS, DIFFICULTY_INFO, GAME_RULE, INTRO_EXAMPLE } from '@/lib/gameTypes'

interface Props {
  onStart: (difficulty: Difficulty) => void
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

export default function IntroCard({ onStart }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')

  return (
    <div className="ic-wrap">
      <div className="game-logo">
        <span style={{ color: '#CC0000' }}>E</span>
        <span style={{ color: '#00b0f0' }}>i</span>
        <span style={{ color: '#008E40' }}>C</span>
      </div>
      <h1 className="ic-title">Learn English in Colours</h1>
      <p className="ic-rule">{GAME_RULE}</p>

      <div className="ic-example">
        <WordRenderer nodes={INTRO_EXAMPLE.nodes} wordStr={INTRO_EXAMPLE.word} />
      </div>

      <div className="ic-diff-row">
        {DIFFICULTIES.map(d => (
          <button
            key={d}
            className={`ic-diff-btn ${difficulty === d ? 'selected' : ''}`}
            onClick={() => setDifficulty(d)}
          >
            <span className="ic-diff-icon">{DIFFICULTY_INFO[d].icon}</span>
            <span className="ic-diff-label">{DIFFICULTY_INFO[d].label}</span>
            <span className="ic-diff-desc">{DIFFICULTY_INFO[d].desc}</span>
          </button>
        ))}
      </div>

      <div className="game-colour-guide">
        <h2 className="game-guide-title">The EiC Colour System</h2>
        <div className="game-colour-grid">
          {Object.entries(COLOR_LABELS).map(([c, { label, example }]) => (
            <div key={c} className="game-colour-item">
              <div className="game-colour-swatch" style={{ background: c }} />
              <div className="game-colour-info">
                <span className="game-colour-label">{label}</span>
                <span className="game-colour-ex">{example}</span>
              </div>
            </div>
          ))}
          <div className="game-colour-item">
            <div className="game-colour-swatch" style={{ background: '#000000' }} />
            <div className="game-colour-info">
              <span className="game-colour-label">∅ / —</span>
              <span className="game-colour-ex">consonants &amp; silent letters</span>
            </div>
          </div>
        </div>
      </div>

      <button className="ic-start" onClick={() => onStart(difficulty)}>Start →</button>
    </div>
  )
}
