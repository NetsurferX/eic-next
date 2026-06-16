'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import type { RuleConfig, TestCase, RuleDiff, RegexRule, RegexRuleAction } from '@/lib/ruleConfig'
import { DEFAULT_CONFIG, diffConfigs, generatePrompt, applyRegexOverrides } from '@/lib/ruleConfig'

// Deep clone
function clone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)) }

interface NodePreview {
  t: string; s: string; isStressed: boolean; isSilent: boolean
  c?: string                              // set by applyRegexOverrides() when a colour rule matches
  underlineOverride?: 'force' | 'deny'    // set by applyRegexOverrides() when an underline rule matches
}

// Mini word renderer using config colours — respects regex-rule overrides
// already baked into the node (c / isSilent / underlineOverride) from
// applyRegexOverrides(), falling back to the normal colour-map lookup.
function renderWord(word: string, nodes: NodePreview[], config: RuleConfig) {
  return nodes.map((n, i) => {
    const color = n.c ?? resolveColor(n.s, config)
    const isSilent = n.isSilent || !color
    const underlined =
      n.underlineOverride === 'deny'  ? false :
      n.underlineOverride === 'force' ? true  :
      n.isStressed
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

function resolveColor(sound: string, config: RuleConfig): string | null {
  for (const entry of config.colors) {
    if (entry.sounds.includes(sound)) return entry.hex
    if (entry.sounds.some(s => s[0] === sound[0] && s.length === 1)) return entry.hex
  }
  return null
}

export default function RulesPage() {
  const [config, setConfig]         = useState<RuleConfig>(() => clone(DEFAULT_CONFIG))
  const [testWord, setTestWord]     = useState('')
  const [testNodes, setTestNodes]   = useState<{ word: string; nodes: NodePreview[] } | null>(null)
  const [testCases, setTestCases]   = useState<TestCase[]>([])
  const [copied, setCopied]         = useState(false)
  const [activeTab, setActiveTab]   = useState<'colors'|'underline'|'silent'|'vowels'|'regex'|'test'>('colors')
  const [loadingTest, setLoading]   = useState(false)
  const [newPattern, setNewPattern] = useState('')
  const [tcNote, setTcNote]         = useState('')
  const [tcDesired, setTcDesired]   = useState('')
  const [ruleTestWords, setRuleTestWords] = useState<Record<string, string>>({})

  const diffs: RuleDiff[] = diffConfigs(DEFAULT_CONFIG, config)

  // ── Test word lookup ──────────────────────────────────────────────────────
  const lookupWord = useCallback(async (w: string) => {
    if (!w.trim()) return
    setLoading(true)
    const wl = w.toLowerCase().trim()
    try {
      const res  = await fetch('/api/words', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ words: [wl] }),
      })
      const data = await res.json() as { results: Record<string, NodePreview[]> }
      const nodes = data.results?.[wl]
      if (nodes) {
        const withOverrides = applyRegexOverrides(wl, nodes, config.regexRules)
        setTestNodes({ word: w, nodes: withOverrides })
      } else setTestNodes(null)
    } catch { setTestNodes(null) }
    setLoading(false)
  }, [config.regexRules])

  // ── Prompt generation ─────────────────────────────────────────────────────
  const prompt = generatePrompt(diffs, testCases, config)

  function copyPrompt() {
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function addTestCase() {
    if (!testWord.trim()) return
    const nodeStr = testNodes
      ? testNodes.nodes.map(n => `[${n.t}:${n.s}:${n.isSilent?'silent':''}]`).join(' ')
      : '(not found)'
    setTestCases(prev => [...prev, {
      word:    testWord.trim(),
      current: nodeStr,
      desired: tcDesired,
      note:    tcNote,
    }])
    setTcNote('')
    setTcDesired('')
  }

  function removeTestCase(i: number) {
    setTestCases(prev => prev.filter((_, idx) => idx !== i))
  }

  // ── Color entry helpers ───────────────────────────────────────────────────
  function updateHex(idx: number, hex: string) {
    setConfig(prev => {
      const next = clone(prev)
      next.colors[idx].hex = hex
      return next
    })
  }

  function updateCategory(idx: number, cat: 'vowel' | 'semivowel' | 'consonant' | 'silent') {
    setConfig(prev => {
      const next = clone(prev)
      next.colors[idx].category = cat
      return next
    })
  }

  function updateSounds(idx: number, value: string) {
    setConfig(prev => {
      const next = clone(prev)
      next.colors[idx].sounds = value.split(',').map(s => s.trim()).filter(Boolean)
      return next
    })
  }

  function toggleUnderline(key: keyof typeof config.underline) {
    setConfig(prev => {
      const next = clone(prev)
      next.underline[key] = !next.underline[key]
      return next
    })
  }

  function addSilentPattern() {
    if (!newPattern.trim()) return
    setConfig(prev => {
      const next = clone(prev)
      if (!next.silent.alwaysSilentPatterns.includes(newPattern.trim()))
        next.silent.alwaysSilentPatterns.push(newPattern.trim())
      return next
    })
    setNewPattern('')
  }

  function removeSilentPattern(p: string) {
    setConfig(prev => {
      const next = clone(prev)
      next.silent.alwaysSilentPatterns = next.silent.alwaysSilentPatterns.filter(x => x !== p)
      return next
    })
  }

  function toggleVowelChar(char: string, from: 'vowels'|'semivowels', to: 'vowels'|'semivowels') {
    setConfig(prev => {
      const next = clone(prev)
      next.vowelChars[from] = next.vowelChars[from].filter(c => c !== char)
      if (!next.vowelChars[to].includes(char))
        next.vowelChars[to].push(char)
      return next
    })
  }

  // ── Regex rule helpers ────────────────────────────────────────────────────
  function reindexPriorities(rules: RegexRule[]) {
    rules.forEach((r, i) => { r.priority = i })
  }

  function addRegexRule() {
    setConfig(prev => {
      const next = clone(prev)
      next.regexRules.push({
        id:       `rule-${Date.now()}`,
        label:    'New rule',
        enabled:  true,
        pattern:  '',
        flags:    'i',
        group:    0,
        action:   {},
        priority: next.regexRules.length,
        notes:    '',
        testWords: [],
      })
      return next
    })
  }

  function updateRegexRule(idx: number, patch: Partial<RegexRule>) {
    setConfig(prev => {
      const next = clone(prev)
      next.regexRules[idx] = { ...next.regexRules[idx], ...patch }
      return next
    })
  }

  function updateRegexAction(idx: number, patch: Partial<RegexRuleAction>) {
    setConfig(prev => {
      const next = clone(prev)
      const action = { ...next.regexRules[idx].action, ...patch }
      // Drop keys explicitly cleared (set to undefined) so JSON/diffs stay clean
      for (const k of Object.keys(action) as (keyof RegexRuleAction)[]) {
        if (action[k] === undefined) delete action[k]
      }
      next.regexRules[idx].action = action
      return next
    })
  }

  function removeRegexRule(idx: number) {
    setConfig(prev => {
      const next = clone(prev)
      next.regexRules.splice(idx, 1)
      reindexPriorities(next.regexRules)
      return next
    })
  }

  function moveRegexRule(idx: number, dir: -1 | 1) {
    setConfig(prev => {
      const next = clone(prev)
      const j = idx + dir
      if (j < 0 || j >= next.regexRules.length) return prev
      const tmp = next.regexRules[idx]
      next.regexRules[idx] = next.regexRules[j]
      next.regexRules[j] = tmp
      reindexPriorities(next.regexRules)
      return next
    })
  }

  // Pure client-side preview of what a rule would target — same matching
  // semantics as applyRegexOverrides() in ruleConfig.ts, no DB lookup needed.
  function testRulePattern(rule: RegexRule, word: string): {
    matched: boolean; before: string; target: string; after: string; error?: string
  } {
    if (!word) return { matched: false, before: '', target: '', after: '' }
    if (!rule.pattern) return { matched: false, before: word, target: '', after: '' }
    try {
      const flags = Array.from(new Set([...(rule.flags ?? ''), 'd'])).join('')
      const re = new RegExp(rule.pattern, flags)
      const m = re.exec(word) as (RegExpExecArray & { indices?: Array<[number, number] | undefined> }) | null
      if (!m?.indices) return { matched: false, before: word, target: '', after: '' }
      const g = rule.group ?? 0
      const span = m.indices[g]
      if (!span) return { matched: false, before: word, target: '', after: '' }
      const [s, e] = span
      return { matched: true, before: word.slice(0, s), target: word.slice(s, e), after: word.slice(e) }
    } catch {
      return { matched: false, before: word, target: '', after: '', error: 'Invalid regex' }
    }
  }

  const TABS = [
    { id: 'colors'   as const, label: '🎨 Colours' },
    { id: 'underline'as const, label: '_ Underline' },
    { id: 'silent'   as const, label: '○ Silent'   },
    { id: 'vowels'   as const, label: 'V Vowels'   },
    { id: 'regex'    as const, label: '⚡ Regex'    },
    { id: 'test'     as const, label: '⚗ Test'     },
  ]

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

      {/* Tabs */}
      <div className="rules-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`rules-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rules-body">

        {/* ── COLOURS ── */}
        {activeTab === 'colors' && (
          <section className="rules-section">
            <h2 className="rules-section-title">Colour Map</h2>
            <p className="rules-section-desc">
              Each row maps IPA sounds to a hex colour. Edit the hex, sounds list, or category.
            </p>
            <div className="color-table">
              {config.colors.map((entry, i) => {
                const changed = JSON.stringify(entry) !== JSON.stringify(DEFAULT_CONFIG.colors[i])
                return (
                  <div key={i} className={`color-row ${changed ? 'changed' : ''}`}>
                    <input
                      type="color"
                      value={entry.hex}
                      onChange={e => updateHex(i, e.target.value)}
                      className="color-picker"
                      title="Pick colour"
                    />
                    <span className="color-hex">{entry.hex}</span>
                    <div className="color-swatch" style={{ background: entry.hex }} />
                    <div className="color-sounds-wrap">
                      <label className="color-label">{entry.label}</label>
                      <input
                        className="color-sounds-input"
                        value={entry.sounds.join(', ')}
                        onChange={e => updateSounds(i, e.target.value)}
                        title="IPA sounds (comma separated)"
                      />
                    </div>
                    <select
                      className="color-cat-select"
                      value={entry.category}
                      onChange={e => updateCategory(i, e.target.value as 'vowel'|'semivowel'|'consonant'|'silent')}
                    >
                      <option value="vowel">vowel</option>
                      <option value="semivowel">semivowel</option>
                      <option value="consonant">consonant</option>
                      <option value="silent">silent</option>
                    </select>
                    {changed && <span className="changed-badge">✎</span>}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── UNDERLINE ── */}
        {activeTab === 'underline' && (
          <section className="rules-section">
            <h2 className="rules-section-title">Underline Rules</h2>
            <p className="rules-section-desc">
              Controls when and how the stress underline is drawn on vowel groups.
            </p>
            {([
              ['monosyllabic',       'Underline in monosyllabic words',               'Default: OFF — monosilabicele nu se subliniază'],
              ['withSyllabicCons',   'Underline when true syllabic consonant present', 'Default: OFF — apple, button nu se subliniază'],
              ['extendThroughSemi',  'Extend underline through semivowels (j/w)',       'Default: ON — yesterday → ỷe subliniat'],
              ['extendThroughGlide', 'Extend through diphthong glides (‍)',             'Default: ON — town → ow subliniat'],
            ] as [keyof typeof config.underline, string, string][]).map(([key, label, note]) => {
              const val     = config.underline[key]
              const changed = val !== DEFAULT_CONFIG.underline[key]
              return (
                <div key={key} className={`toggle-row ${changed ? 'changed' : ''}`}>
                  <button
                    className={`toggle-btn ${val ? 'on' : 'off'}`}
                    onClick={() => toggleUnderline(key)}
                  >
                    {val ? 'ON' : 'OFF'}
                  </button>
                  <div className="toggle-info">
                    <span className="toggle-label">{label}</span>
                    <span className="toggle-note">{note}</span>
                  </div>
                  {changed && <span className="changed-badge">✎</span>}
                </div>
              )
            })}
          </section>
        )}

        {/* ── SILENT ── */}
        {activeTab === 'silent' && (
          <section className="rules-section">
            <h2 className="rules-section-title">Silent Letter Rules</h2>

            <div className="rules-subsection">
              <h3 className="rules-sub-title">Always-silent grapheme patterns</h3>
              <p className="rules-section-desc">
                These multi-letter patterns are always rendered grey regardless of DB data.
              </p>
              <div className="silent-patterns">
                {config.silent.alwaysSilentPatterns.map(p => (
                  <div key={p} className="silent-pill">
                    <code>{p}</code>
                    <button onClick={() => removeSilentPattern(p)} className="pill-remove">×</button>
                  </div>
                ))}
              </div>
              <div className="silent-add">
                <input
                  className="silent-input"
                  placeholder="add pattern e.g. wh"
                  value={newPattern}
                  onChange={e => setNewPattern(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSilentPattern()}
                />
                <button className="silent-add-btn" onClick={addSilentPattern}>Add</button>
              </div>
            </div>

            <div className="rules-subsection">
              <h3 className="rules-sub-title">Graphic consonant override</h3>
              <div className={`toggle-row ${config.silent.graphicConsonantOverride !== DEFAULT_CONFIG.silent.graphicConsonantOverride ? 'changed' : ''}`}>
                <button
                  className={`toggle-btn ${config.silent.graphicConsonantOverride ? 'on' : 'off'}`}
                  onClick={() => setConfig(prev => {
                    const next = clone(prev)
                    next.silent.graphicConsonantOverride = !next.silent.graphicConsonantOverride
                    return next
                  })}
                >
                  {config.silent.graphicConsonantOverride ? 'ON' : 'OFF'}
                </button>
                <div className="toggle-info">
                  <span className="toggle-label">
                    Force-grey graphemes that are pure consonant letters but DB assigns vowel colour
                  </span>
                  <span className="toggle-note">
                    Example: "h" in "sigh" gets idx=4 (red) in DB — override forces it grey
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── VOWELS ── */}
        {activeTab === 'vowels' && (
          <section className="rules-section">
            <h2 className="rules-section-title">Vowel / Semivowel Classification</h2>
            <p className="rules-section-desc">
              Click a character to move it between vowel and semivowel categories.
              This affects underline logic and colour assignment.
            </p>

            {(['vowels', 'semivowels'] as const).map(cat => (
              <div key={cat} className="vowel-group">
                <h3 className="vowel-group-title">
                  {cat === 'vowels' ? '🔵 Vowels' : '🟡 Semivowels'}
                </h3>
                <div className="vowel-chips">
                  {config.vowelChars[cat].map(ch => (
                    <button
                      key={ch}
                      className="vowel-chip"
                      title={`Move to ${cat === 'vowels' ? 'semivowels' : 'vowels'}`}
                      onClick={() => toggleVowelChar(
                        ch, cat,
                        cat === 'vowels' ? 'semivowels' : 'vowels'
                      )}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ── REGEX ── */}
        {activeTab === 'regex' && (
          <section className="rules-section">
            <h2 className="rules-section-title">Regex Override Rules</h2>
            <p className="rules-section-desc">
              Punctual, per-word overrides. Each rule is a regex matched against the word's
              letters — the matched span (or a capture group within it) gets the action
              applied (colour / force-silent / force-or-deny underline), bypassing the
              general rules above for that grapheme only. Type a test word under any rule
              to see exactly what it targets, no lookup needed.
            </p>

            <button className="silent-add-btn" onClick={addRegexRule} style={{ marginBottom: '12px' }}>
              + Add rule
            </button>

            {config.regexRules.length === 0 && (
              <p className="rules-section-desc" style={{ opacity: 0.6 }}>
                No regex rules yet — click "+ Add rule" to define one.
              </p>
            )}

            <div className="regex-rule-list">
              {config.regexRules.map((rule, idx) => {
                const orig    = DEFAULT_CONFIG.regexRules.find(r => r.id === rule.id)
                const changed = !orig || JSON.stringify(orig) !== JSON.stringify(rule)
                const tw      = ruleTestWords[rule.id] ?? (rule.testWords?.[0] ?? '')
                const result  = testRulePattern(rule, tw)

                return (
                  <div key={rule.id} className={`regex-rule-card ${changed ? 'changed' : ''}`}>

                    <div className="regex-rule-head">
                      <button
                        className={`toggle-btn ${rule.enabled ? 'on' : 'off'}`}
                        onClick={() => updateRegexRule(idx, { enabled: !rule.enabled })}
                      >
                        {rule.enabled ? 'ON' : 'OFF'}
                      </button>
                      <input
                        className="color-sounds-input"
                        style={{ flex: 1 }}
                        value={rule.label}
                        onChange={e => updateRegexRule(idx, { label: e.target.value })}
                        placeholder="Rule label"
                      />
                      <button className="pill-remove" title="Move up"
                        onClick={() => moveRegexRule(idx, -1)} disabled={idx === 0}>↑</button>
                      <button className="pill-remove" title="Move down"
                        onClick={() => moveRegexRule(idx, 1)} disabled={idx === config.regexRules.length - 1}>↓</button>
                      <button className="pill-remove" title="Delete rule"
                        onClick={() => removeRegexRule(idx)}>×</button>
                      {changed && <span className="changed-badge">✎</span>}
                    </div>

                    <div className="regex-rule-pattern-row">
                      <code className="regex-rule-slash">/</code>
                      <input
                        className="silent-input"
                        style={{ fontFamily: 'monospace', flex: 1 }}
                        value={rule.pattern}
                        onChange={e => updateRegexRule(idx, { pattern: e.target.value })}
                        placeholder="e.g. ^i(s)land$"
                      />
                      <code className="regex-rule-slash">/</code>
                      <input
                        className="silent-input"
                        style={{ width: '50px', fontFamily: 'monospace' }}
                        value={rule.flags ?? ''}
                        onChange={e => updateRegexRule(idx, { flags: e.target.value })}
                        placeholder="flags"
                        title="Regex flags, e.g. i for case-insensitive"
                      />
                      <label className="toggle-label" style={{ marginLeft: '8px' }}>group</label>
                      <input
                        type="number"
                        className="silent-input"
                        style={{ width: '50px' }}
                        value={rule.group ?? 0}
                        min={0}
                        onChange={e => updateRegexRule(idx, { group: Math.max(0, parseInt(e.target.value) || 0) })}
                      />
                    </div>

                    <div className="regex-rule-action-row">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={rule.action.color !== undefined}
                          onChange={e => updateRegexAction(idx, { color: e.target.checked ? '#000000' : undefined })}
                        />
                        {' '}Colour
                      </label>
                      {rule.action.color !== undefined && (
                        <>
                          <input
                            type="color"
                            className="color-picker"
                            value={rule.action.color}
                            onChange={e => updateRegexAction(idx, { color: e.target.value })}
                          />
                          <span className="color-hex">{rule.action.color}</span>
                        </>
                      )}

                      <label className="toggle-label" style={{ marginLeft: '16px' }}>
                        <input
                          type="checkbox"
                          checked={!!rule.action.silent}
                          onChange={e => updateRegexAction(idx, { silent: e.target.checked ? true : undefined })}
                        />
                        {' '}Silent
                      </label>

                      <label className="toggle-label" style={{ marginLeft: '16px' }}>Underline</label>
                      <select
                        className="color-cat-select"
                        value={rule.action.underline ?? ''}
                        onChange={e => updateRegexAction(idx, {
                          underline: e.target.value === '' ? undefined : (e.target.value as 'force' | 'deny'),
                        })}
                      >
                        <option value="">— no override —</option>
                        <option value="force">force</option>
                        <option value="deny">deny</option>
                      </select>
                    </div>

                    <textarea
                      className="silent-input"
                      style={{ width: '100%', minHeight: '40px', marginTop: '6px', fontFamily: 'inherit', resize: 'vertical' }}
                      value={rule.notes ?? ''}
                      onChange={e => updateRegexRule(idx, { notes: e.target.value })}
                      placeholder="Notes (why this rule exists, what it fixes)…"
                    />

                    <div className="regex-rule-test">
                      <input
                        className="test-word-input"
                        placeholder="Type a word to test this pattern…"
                        value={tw}
                        onChange={e => setRuleTestWords(prev => ({ ...prev, [rule.id]: e.target.value }))}
                      />
                      <div className="regex-test-preview">
                        {tw === '' ? (
                          <span style={{ opacity: 0.5 }}>—</span>
                        ) : result.error ? (
                          <span style={{ color: '#c44' }}>{result.error}</span>
                        ) : result.matched ? (
                          <span>
                            {result.before}
                            <mark style={{ background: '#4E79A7', color: '#fff', borderRadius: '3px', padding: '0 2px' }}>
                              {result.target || '∅'}
                            </mark>
                            {result.after}
                          </span>
                        ) : (
                          <span style={{ opacity: 0.5 }}>no match</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── TEST ── */}
        {activeTab === 'test' && (
          <section className="rules-section">
            <h2 className="rules-section-title">Test Words</h2>
            <p className="rules-section-desc">
              Look up a word from the database. See its current render, note issues, and add test cases to the prompt.
            </p>

            <div className="test-input-row">
              <input
                className="test-word-input"
                placeholder="Type a word…"
                value={testWord}
                onChange={e => setTestWord(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && lookupWord(testWord)}
              />
              <button className="test-lookup-btn" onClick={() => lookupWord(testWord)}>
                {loadingTest ? '…' : 'Look up'}
              </button>
            </div>

            {testNodes && (
              <div className="test-result">
                <div className="test-word-render">
                  {renderWord(testNodes.word, testNodes.nodes, config)}
                </div>
                <div className="test-node-table">
                  {testNodes.nodes.map((n, i) => (
                    <div key={i} className="test-node-row">
                      <span className="tn-grapheme">{n.t || '∅'}</span>
                      <span className="tn-arrow">→</span>
                      <span className="tn-sound">{n.s || '∅'}</span>
                      <span className="tn-dot" style={{ background: resolveColor(n.s, config) ?? (n.isSilent ? '#ccc' : '#000') }} />
                      <span className="tn-flags">
                        {n.isStressed && <span className="tn-flag stress">stress</span>}
                        {n.isSilent   && <span className="tn-flag silent">silent</span>}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="test-add-case">
                  <input
                    className="tc-input"
                    placeholder="What should it look like? e.g. 'h' should be grey"
                    value={tcDesired}
                    onChange={e => setTcDesired(e.target.value)}
                  />
                  <input
                    className="tc-input"
                    placeholder="Additional note (optional)"
                    value={tcNote}
                    onChange={e => setTcNote(e.target.value)}
                  />
                  <button className="tc-add-btn" onClick={addTestCase}>
                    + Add to prompt
                  </button>
                </div>
              </div>
            )}

            {testCases.length > 0 && (
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
            )}
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
