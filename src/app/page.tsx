'use client'

import { useRef } from 'react'
import WordRenderer from '@/components/WordRenderer'
import { useColorizer } from '@/lib/useColorizer'
import LevelTeaser from '@/components/game/LevelTeaser'

export default function Home() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { tokens, inputText, onInput } = useColorizer()

  const rendered = tokens.map((tok, i) => {
    if (tok.isWhitespace) return <span key={i}>{tok.raw}</span>
    if (tok.isPunct)      return <span key={i} className="eic-punct">{tok.raw}</span>
    if (!tok.nodes)       return <span key={i} className="eic-plain">{tok.raw}</span>

    return (
      <span key={i}>
        <WordRenderer nodes={tok.nodes} wordStr={tok.raw} />
      </span>
    )
  })

  return (
    <main className="eic-home">

      {/* Minimal top bar — brand + entry point into the game, nothing else */}
      <div className="eic-topbar">
        <span className="eic-brand">English in Colours</span>
        <LevelTeaser />
      </div>

      {/* The tool itself: one generous input, nothing competing for attention */}
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
          rows={18}
          aria-label="Text input"
        />
      </div>

    </main>
  )
}
