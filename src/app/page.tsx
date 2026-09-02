'use client'

import { useRef, useState, useEffect } from 'react'
import WordRenderer from '@/components/WordRenderer'
import { useColorizer } from '@/lib/useColorizer'
import LevelTeaser from '@/components/game/LevelTeaser'

// ── Salut inițial, o singură dată la prima vizită a paginii principale ──
// Aceeași convenție ca vulpea din /learn (localStorage eic-*-seen): apare
// scurt deasupra editorului, apoi se închide singură sau la primul input.
const HOME_GREETING_SEEN_KEY = 'eic-home-seen'
const HOME_GREETING_TEXT = 'Salut! Scrie un cuvânt sau o propoziție mai jos ca să vezi fiecare sunet colorat 🎨'
const HOME_GREETING_SHOW_DELAY_MS = 400
const HOME_GREETING_HIDE_MS = 6000

export default function Home() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { tokens, inputText, onInput } = useColorizer()
  const [showGreeting, setShowGreeting] = useState(false)

  useEffect(() => {
    let seen = false
    try { seen = localStorage.getItem(HOME_GREETING_SEEN_KEY) === '1' } catch { /* ignore */ }
    if (seen) return
    const show = setTimeout(() => setShowGreeting(true), HOME_GREETING_SHOW_DELAY_MS)
    const hide = setTimeout(() => dismissGreeting(), HOME_GREETING_SHOW_DELAY_MS + HOME_GREETING_HIDE_MS)
    return () => { clearTimeout(show); clearTimeout(hide) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dismissGreeting = () => {
    setShowGreeting(false)
    try { localStorage.setItem(HOME_GREETING_SEEN_KEY, '1') } catch { /* ignore */ }
  }

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
      <div className="eic-editor-wrap">
        {showGreeting && (
          <div className="eic-greeting-toast" role="status">
            <span>{HOME_GREETING_TEXT}</span>
            <button
              type="button"
              className="eic-greeting-close"
              onClick={dismissGreeting}
              aria-label="Închide"
            >
              ×
            </button>
          </div>
        )}
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
            onChange={e => {
              onInput(e.target.value)
              if (showGreeting) dismissGreeting()
            }}
            placeholder=" "
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            rows={18}
            aria-label="Text input"
          />
        </div>
      </div>

    </main>
  )
}
