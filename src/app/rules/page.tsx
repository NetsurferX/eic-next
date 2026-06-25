'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import type { RuleConfig, TestCase, RuleDiff } from '@/lib/ruleConfig'
import { DEFAULT_CONFIG, diffConfigs, generatePrompt, applyRegexOverrides } from '@/lib/ruleConfig'

// Deep clone
function clone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)) }

interface NodePreview {
  t: string; s: string; isStressed: boolean; isSilent: boolean
  c?: string                              // set by applyRegexOverrides() when a colour rule matches
  underlineOverride?: 'force' | 'deny'    // set by applyRegexOverrides() when an underline rule matches
}

// Resolves a node's actual display colour/silent/underline state — shared by
// renderWord() and the Rule Bridge tab's clickable stage so they never drift.
function nodeVisual(n: NodePreview, config: RuleConfig) {
  const color = n.c ?? resolveColor(n.s, config)
  const isSilent = n.isSilent || !color
  const underlined =
    n.underlineOverride === 'deny'  ? false :
    n.underlineOverride === 'force' ? true  :
    n.isStressed
  return { color, isSilent, underlined }
}

// Mini word renderer using config colours — respects regex-rule overrides
// already baked into the node (c / isSilent / underlineOverride) from
// applyRegexOverrides(), falling back to the normal colour-map lookup.
function renderWord(word: string, nodes: NodePreview[], config: RuleConfig) {
  return nodes.map((n, i) => {
    const { color, isSilent, underlined } = nodeVisual(n, config)
    return (
      <span
        key={i}
        style={{
          color:           isSilent ? '#000000' : color ?? '#000',
          textDecoration:  underlined && !isSilent ? 'underline' : 'none',
          textUnderlineOffset: '6px',
          textDecorationThickness: '2.5px',
          fontWeight: 600,
        }}
        title={n.s}
      >
        {n.t}
      </span>
    )
  })
}

// Same "current state" string format used in the Test tab's test cases, so
// entries created from the Bridge tab read identically in the generated prompt.
function nodeToStr(n: NodePreview): string {
  return `[${n.t}:${n.s}:${n.isSilent ? 'silent' : ''}]`
}

function resolveColor(sound: string, config: RuleConfig): string | null {
  for (const entry of config.colors) {
    if (entry.sounds.includes(sound)) return entry.hex
    if (entry.sounds.some(s => s[0] === sound[0] && s.length === 1)) return entry.hex
  }
  return null
}

// Tied to the real modules in the codebase, so a flagged fix in the Bridge
// tab routes to the right layer instead of guessing.
const BRIDGE_LOCATIONS: Record<string, string> = {
  '':         'Not sure — find the right layer',
  colormap:   'Sound → colour mapping (pipeline.ts COLOR_MAP, ruleConfig.ts colors[])',
  alignment:  'Grapheme/phoneme alignment (pipeline.ts mapToWord / segment / GRAPHIC_VOWELS)',
  underline:  'Stress underline logic (WordRenderer.tsx buildUnderlined, ruleConfig.ts underline rules)',
  regex:      'Needs a pattern override (ruleConfig.ts RegexRule)',
}

// The governing system, distilled from English_in_Colours.docx (Dorel's source
// spec). Every Bridge flag should be traceable back to one of these — a fix
// that can't be justified by a named principle is a guess, not a rule.
const PRINCIPLES: Record<string, string> = {
  '':        '— none selected —',
  phonemeMute:
    'Cu Fonem vs. Fără Fonem (Mută): a grapheme is coloured only if it expresses ' +
    'a phoneme (e.g. "top"); a letter with no phoneme is mute and renders grey ' +
    '(e.g. the "b" in "crumb"). Silent ≠ wrong colour — it\'s "no phoneme assigned".',
  schwaFusion:
    'Legea priorității schwa (forced fusion): /ək, əl, əm, ən, ər/ before c/l/m/n/r ' +
    'force-fuse into a single white-with-black-border node — schwa never gets its ' +
    'own colour when followed by one of these consonants.',
  vrPriority:
    'V+R artificial priority (poor/cure/near/bear/fire/hour sets): the vowel ' +
    'phoneme immediately preceding a schwa+r takes priority and dictates the ' +
    'colour for the whole V+R unit, not the schwa.',
  diphthongGradient:
    'Diphthong gradient rule: a true diphthong (aỷ, eỷ, aw, etc.) is a 2-colour ' +
    'gradient between its component vowel colours, not a flat single hue — ' +
    'flat colour on a diphthong node is itself a bug.',
  syllabicConsonant:
    'Syllabic consonant rule: a consonant carrying its own syllable (the l in ' +
    '"bottle", the n in "button") renders black with a white border — distinct ' +
    'from both a normal consonant and from schwa-fusion white.',
}

export default function RulesPage() {
  const [config, setConfig]         = useState<RuleConfig>(() => clone(DEFAULT_CONFIG))
  const [testCases, setTestCases]   = useState<TestCase[]>([])
  const [copied, setCopied]         = useState(false)
  const [activeTab]                 = useState<'bridge'>('bridge')

  // ── Rule Bridge tab state ─────────────────────────────────────────────────
  const [bridgeWordInput, setBridgeWordInput]   = useState('knight')
  const [bridgeWord, setBridgeWord]             = useState('')
  const [bridgeNodes, setBridgeNodes]           = useState<NodePreview[] | null>(null)
  const [bridgeLoading, setBridgeLoading]       = useState(false)
  const [bridgeError, setBridgeError]           = useState<string | null>(null)
  const [bridgeSelected, setBridgeSelected]     = useState<number[]>([])
  const [bridgeColorIdx, setBridgeColorIdx]     = useState<number | null>(null)
  const [bridgeSilent, setBridgeSilent]         = useState(false)
  const [bridgeUnderline, setBridgeUnderline]   = useState<'' | 'force' | 'deny'>('')
  const [bridgeLocation, setBridgeLocation]     = useState('')
  const [bridgePrinciple, setBridgePrinciple]   = useState('')
  const [bridgeHypothesis, setBridgeHypothesis] = useState('')
  const [bridgeCounter, setBridgeCounter]       = useState('')

  const diffs: RuleDiff[] = diffConfigs(DEFAULT_CONFIG, config)

  // Seed the open items from the 2026-06-19 rule-change request so they live
  // in the same Generated Prompt pipeline as anything flagged through Bridge.
  useEffect(() => {
    setTestCases(prev => prev.length > 0 ? prev : [
      {
        word:    'knight',
        current: '"k" — [k:n:]',
        desired: 'silent (grey)',
        note:    'LIKELY LOCATION: Not sure — find the right layer | SCOPE: general rule only — no per-word branch or lookup entry | LIKELY PRINCIPLE: Cu Fonem vs. Fără Fonem — "k" before "n" expresses no phoneme',
      },
      {
        word:    'length',
        current: '"e" — [e:ɛ:]',
        desired: 'underline: force',
        note:    'LIKELY LOCATION: Not sure — find the right layer | SCOPE: general rule only — no per-word branch or lookup entry',
      },
    ])
  }, [])


  // ── Prompt generation ─────────────────────────────────────────────────────
  const prompt = generatePrompt(diffs, testCases, config)

  function copyPrompt() {
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function removeTestCase(i: number) {
    setTestCases(prev => prev.filter((_, idx) => idx !== i))
  }

  // ── Rule Bridge: pull real current state for a word, no guessing ─────────
  const loadBridgeWord = useCallback(async (w: string) => {
    const wl = w.toLowerCase().trim()
    if (!wl) return
    setBridgeLoading(true)
    setBridgeError(null)
    setBridgeSelected([])
    setBridgeColorIdx(null)
    setBridgeSilent(false)
    setBridgeUnderline('')
    setBridgeHypothesis('')
    setBridgeCounter('')
    setBridgeLocation('')
    setBridgePrinciple('')
    try {
      const res  = await fetch('/api/words', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ words: [wl] }),
      })
      const data = await res.json() as { results: Record<string, NodePreview[]> }
      const nodes = data.results?.[wl]
      setBridgeWord(wl)
      if (nodes) {
        setBridgeNodes(applyRegexOverrides(wl, nodes, config.regexRules))
      } else {
        setBridgeNodes(null)
        setBridgeError('not in lexicon.db')
      }
    } catch {
      setBridgeNodes(null)
      setBridgeError('lookup failed')
    }
    setBridgeLoading(false)
  }, [config.regexRules])

  const toggleBridgeSelect = (i: number) =>
    setBridgeSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])

  const cancelBridgeDraft = () => {
    setBridgeSelected([])
    setBridgeColorIdx(null)
    setBridgeSilent(false)
    setBridgeUnderline('')
  }

  // Pushes a TestCase built from real current state — same shape, same
  // generatePrompt() pipeline as the Test tab. Never writes a regex rule
  // itself: generalising the pattern is a judgment call for whoever actions
  // the prompt, not something to guess from a single clicked example.
  function flagBridgeFix() {
    if (!bridgeNodes || bridgeSelected.length === 0) return
    const sorted = [...bridgeSelected].sort((a, b) => a - b)
    const chars  = sorted.map(i => bridgeNodes[i].t || '∅').join('')
    const before = sorted.map(i => nodeToStr(bridgeNodes[i])).join(' ')

    const wanted: string[] = []
    if (bridgeSilent) {
      wanted.push('silent (grey)')
    } else if (bridgeColorIdx !== null) {
      const c = config.colors[bridgeColorIdx]
      wanted.push(`${c.label} (${c.hex})`)
    }
    if (bridgeUnderline) wanted.push(`underline: ${bridgeUnderline}`)
    if (wanted.length === 0) return

    const noteParts = [
      bridgeHypothesis ? `WHY: ${bridgeHypothesis}` : null,
      bridgeCounter    ? `COUNTER-EXAMPLE: ${bridgeCounter}` : null,
      bridgePrinciple  ? `GOVERNING PRINCIPLE (English in Colours spec): ${PRINCIPLES[bridgePrinciple]}` : null,
      `LIKELY LOCATION: ${BRIDGE_LOCATIONS[bridgeLocation]}`,
      'SCOPE: general rule only — no per-word branch or lookup entry',
    ].filter((p): p is string => p !== null)

    setTestCases(prev => [...prev, {
      word:    bridgeWord,
      current: `"${chars}" — ${before}`,
      desired: wanted.join(' + '),
      note:    noteParts.join(' | '),
    }])
    cancelBridgeDraft()
    setBridgeHypothesis('')
    setBridgeCounter('')
    setBridgeLocation('')
    setBridgePrinciple('')
  }

  const testCasesList = testCases.length > 0 && (
    <div className="test-cases-list">
      <h3 className="tc-list-title">Added test cases ({testCases.length})</h3>
      {testCases.map((tc, i) => (
        <div key={i} className="tc-item">
          <strong>"{tc.word}"</strong>
          {tc.desired && <span className="tc-desired"> → {tc.desired}</span>}
          {tc.note    && <span className="tc-note"> ({tc.note})</span>}
          <button className="tc-remove" onClick={() => removeTestCase(i)}>×</button>
        </div>
      ))}
    </div>
  )

  return (
    <div className="rules-page">

      {/* Header */}
      <div className="rules-header">
        <Link href="/" className="rules-back">← back</Link>
        <h1 className="rules-title">EiC Rule Editor</h1>
        <div className="rules-diff-badge">
          {diffs.length === 0
            ? <span className="diff-none">no changes</span>
            : <span className="diff-count">{diffs.length} change{diffs.length > 1 ? 's' : ''}</span>
          }
        </div>
      </div>


      <div className="rules-body">

        {/* ── RULE BRIDGE ── */}
        {activeTab === 'bridge' && (
          <section className="rules-section">
            <h2 className="rules-section-title">Rule Bridge</h2>
            <p className="rules-section-desc">
              Load a real word, click the grapheme(s) that are wrong, say what they should be.
              Current state comes straight from lexicon.db via /api/words — nothing here is
              guessed. Flagging a fix adds it to the test cases below, which feed the Generated
              Prompt at the bottom of the page.
            </p>

            <details style={{ marginBottom: '16px', border: '1px solid #e7e5e4', borderRadius: '10px', padding: '10px 14px' }}>
              <summary style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                📖 Governing principles (English in Colours spec)
              </summary>
              <ul style={{ fontSize: '0.8rem', color: '#57534e', lineHeight: 1.5, marginTop: '8px', paddingLeft: '18px' }}>
                {Object.entries(PRINCIPLES).filter(([k]) => k).map(([key, label]) => (
                  <li key={key} style={{ marginBottom: '6px' }}>{label}</li>
                ))}
              </ul>
            </details>

            <div className="test-input-row">
              <input
                className="test-word-input"
                placeholder="Type a word…"
                value={bridgeWordInput}
                onChange={e => setBridgeWordInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadBridgeWord(bridgeWordInput)}
              />
              <button className="test-lookup-btn" onClick={() => loadBridgeWord(bridgeWordInput)}>
                {bridgeLoading ? '…' : 'Load'}
              </button>
              <div style={{ display: 'flex', gap: '6px', marginLeft: '10px' }}>
                {['island', 'gnome', 'colonel'].map(w => (
                  <button
                    key={w}
                    onClick={() => loadBridgeWord(w)}
                    style={{
                      padding: '4px 12px', borderRadius: '999px', border: '1px solid #d6d3d1',
                      background: '#fff', fontSize: '0.75rem', cursor: 'pointer', color: '#57534e',
                    }}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {bridgeError && (
              <p className="rules-section-desc" style={{ color: '#c44' }}>{bridgeError}</p>
            )}

            {bridgeNodes && (
              <>
                <div
                  style={{
                    display: 'flex', flexWrap: 'wrap', gap: '2px', alignItems: 'flex-end',
                    fontFamily: 'serif', fontSize: '2.25rem', padding: '24px',
                    background: '#fafaf9', border: '1px solid #e7e5e4',
                    borderRadius: '12px', marginBottom: '8px',
                  }}
                >
                  {bridgeNodes.map((n, i) => {
                    const { color, isSilent, underlined } = nodeVisual(n, config)
                    const isSel = bridgeSelected.includes(i)
                    return (
                      <button
                        key={i}
                        onClick={() => toggleBridgeSelect(i)}
                        title={n.s || '(latent)'}
                        style={{
                          padding: '2px 4px 6px', borderRadius: '4px', border: 'none',
                          background: isSel ? '#fef3c7' : 'transparent',
                          outline: isSel ? '2px solid #fbbf24' : 'none',
                          outlineOffset: '2px', cursor: 'pointer',
                          color: isSilent ? '#000' : (color ?? '#000'),
                          opacity: isSilent ? 0.45 : 1,
                          fontStyle: isSilent ? 'italic' : 'normal',
                          borderBottom: underlined && !isSilent ? '3px solid #3b82f6' : '3px solid transparent',
                          fontWeight: 600,
                        }}
                      >
                        {n.t || '·'}
                      </button>
                    )
                  })}
                </div>
                <p className="rules-section-desc" style={{ marginTop: 0 }}>
                  click the node(s) involved — each button is one grapheme node as the pipeline
                  actually segmented it, not a raw letter
                </p>
              </>
            )}

            {bridgeSelected.length > 0 && bridgeNodes && (
              <div style={{ border: '1px solid #e7e5e4', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                <p className="rules-section-desc" style={{ marginTop: 0 }}>
                  "{[...bridgeSelected].sort((a, b) => a - b).map(i => bridgeNodes[i].t || '∅').join('')}" should be —
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  {config.colors.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setBridgeColorIdx(idx); setBridgeSilent(false) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '4px 10px', borderRadius: '6px',
                        border: bridgeColorIdx === idx ? '2px solid #111' : '1px solid #ccc',
                        background: '#fff', cursor: 'pointer', fontSize: '0.85rem',
                      }}
                    >
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: c.hex, display: 'inline-block' }} />
                      {c.label}
                    </button>
                  ))}
                  <button
                    onClick={() => { setBridgeSilent(s => !s); setBridgeColorIdx(null) }}
                    style={{
                      padding: '4px 10px', borderRadius: '6px',
                      border: bridgeSilent ? '2px solid #111' : '1px solid #ccc',
                      background: bridgeSilent ? '#eee' : '#fff', cursor: 'pointer',
                      fontSize: '0.85rem', fontStyle: 'italic',
                    }}
                  >
                    Silent (grey)
                  </button>
                </div>

                <div style={{ marginBottom: '10px', fontSize: '0.85rem' }}>
                  Underline{' '}
                  <select
                    className="color-cat-select"
                    value={bridgeUnderline}
                    onChange={e => setBridgeUnderline(e.target.value as '' | 'force' | 'deny')}
                  >
                    <option value="">— no override —</option>
                    <option value="force">force</option>
                    <option value="deny">deny</option>
                  </select>
                </div>

                <textarea
                  className="silent-input"
                  style={{ width: '100%', minHeight: '40px', fontFamily: 'inherit', resize: 'vertical' }}
                  value={bridgeHypothesis}
                  onChange={e => setBridgeHypothesis(e.target.value)}
                  placeholder="why, in your own words — e.g. this digraph is silent after a stressed vowel"
                />
                <input
                  className="silent-input"
                  style={{ width: '100%', marginTop: '6px' }}
                  value={bridgeCounter}
                  onChange={e => setBridgeCounter(e.target.value)}
                  placeholder="optional — a word where this is NOT true"
                />
                <select
                  className="color-cat-select"
                  style={{ width: '100%', marginTop: '6px' }}
                  value={bridgePrinciple}
                  onChange={e => setBridgePrinciple(e.target.value)}
                  title="Which rule from English_in_Colours.docx justifies this fix"
                >
                  {Object.entries(PRINCIPLES).map(([key, label]) => (
                    <option key={key} value={key}>{key ? `Principle: ${label.slice(0, 60)}…` : label}</option>
                  ))}
                </select>
                <select
                  className="color-cat-select"
                  style={{ width: '100%', marginTop: '6px' }}
                  value={bridgeLocation}
                  onChange={e => setBridgeLocation(e.target.value)}
                >
                  {Object.entries(BRIDGE_LOCATIONS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                {bridgePrinciple && (
                  <p className="rules-section-desc" style={{ marginTop: '6px', fontSize: '0.8rem' }}>
                    {PRINCIPLES[bridgePrinciple]}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                  <button
                    onClick={cancelBridgeDraft}
                    style={{ background: 'none', border: 'none', color: '#888', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    cancel
                  </button>
                  <button
                    className="silent-add-btn"
                    disabled={!bridgeSilent && bridgeColorIdx === null && !bridgeUnderline}
                    onClick={flagBridgeFix}
                  >
                    + Flag this fix
                  </button>
                </div>
              </div>
            )}

            {testCasesList}
          </section>
        )}

      </div>

      {/* ── Diff summary ── */}
      {diffs.length > 0 && (
        <div className="rules-diffs">
          <h3 className="diffs-title">Changes from default</h3>
          {diffs.map((d, i) => (
            <div key={i} className="diff-row">
              <span className="diff-section">{d.section}</span>
              <span className="diff-field">{d.field}</span>
              <code className="diff-old">{d.old}</code>
              <span className="diff-arrow">→</span>
              <code className="diff-new">{d.new}</code>
            </div>
          ))}
        </div>
      )}

      {/* ── Prompt output ── */}
      <div className="rules-prompt">
        <div className="prompt-header">
          <h3 className="prompt-title">Generated Prompt</h3>
          <div className="prompt-actions">
            <button className="prompt-reset" onClick={() => { setConfig(clone(DEFAULT_CONFIG)); setTestCases([]) }}>
              Reset all
            </button>
            <button className="prompt-copy" onClick={copyPrompt}>
              {copied ? '✓ Copied!' : '📋 Copy prompt'}
            </button>
          </div>
        </div>
        <pre className="prompt-text">{prompt}</pre>
      </div>

    </div>
  )
}
