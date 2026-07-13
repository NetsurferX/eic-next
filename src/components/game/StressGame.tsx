'use client'

import { useState, useEffect, useMemo } from 'react'
import type { GameWord } from '@/lib/gameTypes'

interface Props {
  word:        GameWord
  phase:       'playing' | 'feedback' | 'intro' | 'done'
  lastCorrect: boolean | null
  onAnswer:    (correct: boolean) => void
}

const SILENT   = '#000000'
const CONSONANT = '#000000'
// Kept in sync with engine/display.ts's GRAPHIC_CONSONANT_LETTERS — this
// used to omit 'w' and 'y', which could misclassify vowel-group boundaries
// for words where w/y sit in a graphic-consonant position (e.g. the 'w' in
// silent-consonant contexts), giving this game different groupings than the
// actual colorizer for the same word.
const GRAPHIC_CONS = new Set('bcdfghjklmnpqrstvwxyz')
const SYLLABIC_MARKER = '\u200d'

function isVowelNode(n: { t: string; c: string; s: string; x: boolean }) {
  if (!n.t) return false
  if (n.c === SILENT || n.c === CONSONANT) return false
  if (n.x) return false
  if ([...n.t.toLowerCase()].every(c => GRAPHIC_CONS.has(c))) return false
  return true
}

interface StressGroup {
  indices: number[]
  label:   string
}

export default function StressGame({ word, phase, lastCorrect, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => { setSelected(null) }, [word.word])

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

  // Build vowel groups (consecutive vowel nodes) as clickable units
  const groups = useMemo<StressGroup[]>(() => {
    const result: StressGroup[] = []
    let i = 0
    const nodes = word.nodes

    while (i < nodes.length) {
      const n = nodes[i]
      if (isVowelNode(n) || n.s === SYLLABIC_MARKER) {
        const indices = [i]
        let j = i + 1
        while (j < nodes.length && (isVowelNode(nodes[j]) || nodes[j].s === SYLLABIC_MARKER)) {
          indices.push(j)
          j++
        }
        const label = indices.map(k => nodes[k].t).join('')
        if (label) result.push({ indices, label })
        i = j
      } else {
        i++
      }
    }
    return result
  }, [word.nodes])

  // Correct group = the one containing a stressed (u=true) node
  const correctGroup = useMemo(() => {
    return groups.findIndex(g =>
      g.indices.some(i => word.nodes[i].u === true)
    )
  }, [groups, word.nodes])

  const isPlaying  = phase === 'playing'
  const isFeedback = phase === 'feedback'

  function handleSelect(groupIdx: number) {
    if (!isPlaying) return
    setSelected(groupIdx)
    onAnswer(groupIdx === correctGroup)
  }

  // Render word with group boundaries visible
  const rendered: React.ReactNode[] = []
  let nodeIdx = 0
  let groupIdx = 0

  while (nodeIdx < word.nodes.length) {
    const n = word.nodes[nodeIdx]
    const group = groups[groupIdx]

    if (group && group.indices[0] === nodeIdx) {
      // Render as a clickable group
      const gIdx = groupIdx
      const isSelected = selected === gIdx
      const isCorrect  = gIdx === correctGroup
      const btnClass   = [
        'stress-group',
        isSelected ? 'sg-selected' : '',
        isFeedback && isCorrect   ? 'sg-correct-group'   : '',
        isFeedback && isSelected && !isCorrect ? 'sg-wrong-group' : '',
      ].filter(Boolean).join(' ')

      rendered.push(
        <button
          key={`g-${gIdx}`}
          className={btnClass}
          disabled={!isPlaying}
          onClick={() => handleSelect(gIdx)}
          style={{ color: n.c !== SILENT ? n.c : undefined }}
        >
          {group.label}
        </button>
      )

      nodeIdx = group.indices[group.indices.length - 1] + 1
      groupIdx++
    } else {
      // Non-vowel node — render as plain span
      if (n.t) {
        rendered.push(
          <span
            key={`n-${nodeIdx}`}
            className="stress-cons"
            style={{ color: n.c === SILENT ? '#000000' : n.c || '#000' }}
          >
            {n.t}
          </span>
        )
      }
      nodeIdx++
    }
  }

  return (
    <div className="stg-wrap">
      <p className="game-instruction">
        Tap the <strong>stressed vowel group</strong> — the underlined part when you read it.
      </p>

      <div className="stg-word">
        {rendered}
      </div>

      <p className="stg-hint-text">
        Listen again:
        <button className="stg-listen" onClick={() => {
          fetch('/api/speak', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word: word.word }),
          }).then(r => r.blob()).then(b => new Audio(URL.createObjectURL(b)).play()).catch(()=>{})
        }}>🔊 {word.word}</button>
      </p>

      {isFeedback && (
        <div className={`cg-feedback ${lastCorrect ? 'fb-correct' : 'fb-wrong'}`}>
          {lastCorrect
            ? `✓ Correct! The stress falls on "${groups[correctGroup]?.label}".`
            : `The stressed syllable is "${groups[correctGroup]?.label}" — listen for the longer, louder vowel.`
          }
        </div>
      )}
    </div>
  )
}
