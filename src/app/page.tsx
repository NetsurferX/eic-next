'use client'

import { useRef, useMemo, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import WordRenderer from '@/components/WordRenderer'
import StatsBar from '@/components/StatsBar'
import SoundSpectrum from '@/components/SoundSpectrum'
import KaraokeMode from '@/components/KaraokeMode'
import TerrainView from '@/components/TerrainView'
import { useColorizer } from '@/lib/useColorizer'
import { COLOR_SILENT, COLOR_CONSONANT } from '@/lib/renderNode'

// D3 component — disable SSR entirely
const ConstellationView = dynamic(
  () => import('@/components/ConstellationView'),
  { ssr: false, loading: () => <div className="terrain-empty">Loading constellation…</div> }
)

const SAMPLES = [
  'The quick brown fox jumps over the lazy dog.',
  'She sells seashells by the seashore.',
  'How much wood would a woodchuck chuck if a woodchuck could chuck wood?',
  'Peter Piper picked a peck of pickled peppers.',
  'To be or not to be, that is the question.',
  'Beauty is in the eye of the beholder.',
  'Knight and power through the silent night.',
]

let sampleIdx = 0

type ViewMode = 'editor' | 'read' | 'landscape' | 'map'

const TABS: { id: ViewMode; label: string; icon: string }[] = [
  { id: 'editor',    label: 'Editor',        icon: '✏️' },
  { id: 'read',      label: 'Read',          icon: '▶'  },
  { id: 'landscape', label: 'Landscape',     icon: '⛰'  },
  { id: 'map',       label: 'Constellation', icon: '✦'  },
]

export default function Home() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { tokens, stats, inputText, onInput, setInputText } = useColorizer()
  const [view, setView] = useState<ViewMode>('editor')

  const usedColors = useMemo(() => {
    const s = new Set<string>()
    for (const t of tokens) {
      if (!t.nodes) continue
      for (const n of t.nodes)
        if (n.c !== COLOR_SILENT && n.c !== COLOR_CONSONANT && n.t.length > 0)
          s.add(n.c)
    }
    return s
  }, [tokens])

  function loadSample() {
    const text = SAMPLES[sampleIdx % SAMPLES.length]
    sampleIdx++
    setInputText(text)
    onInput(text)
    if (textareaRef.current) textareaRef.current.value = text
  }

  function clearAll() {
    setInputText('')
    onInput('')
    if (textareaRef.current) textareaRef.current.value = ''
  }

  const hasText = tokens.some(t => t.isWord)

  return (
    <main className="eic-home">

      {/* Hero */}
      <header className="eic-header">
        <div className="eic-dots" aria-hidden="true">
          <span className="eic-dot" style={{ background: '#CC0000' }} />
          <span className="eic-dot" style={{ background: '#00b0f0' }} />
          <span className="eic-dot" style={{ background: '#008E40' }} />
          <span className="eic-dot" style={{ background: '#7030A0' }} />
        </div>
        <h1 className="eic-headline">See English as it sounds.</h1>
        <p className="eic-subline">Type or paste text — every grapheme colours in place.</p>
        <div style={{ marginTop: '1rem' }}>
          <Link href="/learn" className="eic-nav-link">🎮 Learn with games</Link>
        </div>
      </header>

      {/* Sound Spectrum — always visible */}
      <SoundSpectrum tokens={tokens} />

      {/* View tabs */}
      <div className="view-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={[
              'view-tab',
              view === tab.id ? 'active' : '',
              tab.id !== 'editor' && !hasText ? 'disabled' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => (tab.id === 'editor' || hasText) && setView(tab.id)}
          >
            <span className="view-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}

        <div className="view-tab-spacer" />

        {view === 'editor' && (
          <div className="eic-toolbar-actions">
            <button className="eic-action-btn" onClick={loadSample}>try a sample</button>
            <button className="eic-action-btn" onClick={clearAll}>clear</button>
          </div>
        )}
      </div>

      {/* Editor */}
      {view === 'editor' && (
        <>
          <div className="eic-editor" onClick={() => textareaRef.current?.focus()}>
            <div className="eic-highlight" aria-hidden="true">
              {tokens.length === 0
                ? <span className="eic-placeholder">Type or paste English text here…</span>
                : tokens.map(tok => {
                    if (tok.isWhitespace) return tok.raw
                    if (tok.isPunct)  return <span key={tok.key} className="eic-punct">{tok.raw}</span>
                    if (!tok.nodes)   return <span key={tok.key} className="eic-plain">{tok.raw}</span>
                    return <WordRenderer key={tok.key} nodes={tok.nodes} wordStr={tok.raw} />
                  })
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
              rows={6}
              aria-label="Text input"
            />
          </div>
          {stats && <StatsBar stats={stats} usedColors={usedColors} />}
        </>
      )}

      {view === 'read'      && <KaraokeMode tokens={tokens} />}
      {view === 'landscape' && <TerrainView tokens={tokens} />}
      {view === 'map'       && <ConstellationView tokens={tokens} />}

    </main>
  )
}
