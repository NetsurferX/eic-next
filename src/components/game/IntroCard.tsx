'use client'

import WordRenderer from '@/components/WordRenderer'
import type { GameLevel } from '@/lib/gameTypes'
import { LEVEL_INFO, INTRO_EXAMPLES } from '@/lib/gameTypes'

interface Props {
  level:   GameLevel
  onStart: () => void
}

// The step every one of the four games was missing: explain the rule with
// a real (non-interactive) rendered example BEFORE asking the user to
// guess. Wire this in wherever the parent flow currently jumps straight
// from phase 'intro' to 'playing' — this component IS the 'intro' phase.
export default function IntroCard({ level, onStart }: Props) {
  const info = LEVEL_INFO[level]
  const example = INTRO_EXAMPLES[level]

  return (
    <div className="ic-wrap">
      <div className="ic-icon">{info.icon}</div>
      <h2 className="ic-title">{info.name}</h2>
      <p className="ic-rule">{info.rule}</p>

      <div className="ic-example">
        <WordRenderer nodes={example.nodes} wordStr={example.word} />
      </div>

      <button className="ic-start" onClick={onStart}>
        Got it — let's try →
      </button>
    </div>
  )
}
