// src/lib/rules/overrides/apply.ts
//
// Runs the enabled RegexRules (in ascending `priority` order) against a word
// and applies each match's action to the overlapping RenderNode(s).
//
// Generic over any node shape that has `t` (grapheme text) and optionally
// `c` (colour), `u` (stressed flag) and `underlineOverride`. Works directly
// on the pipeline's RenderNode[] (WordRenderer.tsx) and on the /rules
// editor's adapted preview nodes without import coupling.

import type { RegexRule } from './types'

const SILENT_HEX = '#000000'

export function applyRegexOverrides<
  T extends {
    t: string; c?: string; u?: boolean
    underlineOverride?: 'force' | 'deny'
    syllabicOverride?: boolean
    superscriptOverride?: string
    glyphOverride?: string
    colorOverride?: boolean
  }
>(word: string, nodes: T[], rules: RegexRule[]): T[] {
  if (!rules?.length) return nodes

  // Character range [start, end) covered by each node's grapheme text
  const ranges: [number, number][] = []
  let pos = 0
  for (const n of nodes) {
    const len = n.t?.length ?? 0
    ranges.push([pos, pos + len])
    pos += len
  }

  const out = nodes.map(n => ({ ...n }))

  const active = rules
    .filter(r => r.enabled && r.pattern)
    .sort((a, b) => a.priority - b.priority)

  for (const rule of active) {
    // Ensure the 'd' flag (match.indices) is present, no duplicate flags
    const flags = Array.from(new Set([...(rule.flags ?? ''), 'd'])).join('')

    let re: RegExp
    try {
      re = new RegExp(rule.pattern, flags)
    } catch {
      continue // invalid regex — skip rather than crash rendering
    }

    const m = re.exec(word)
    if (!m?.indices) continue

    const groupIdx = rule.group ?? 0
    const span = m.indices[groupIdx]
    if (!span) continue

    const [gStart, gEnd] = span
    if (gStart === gEnd) continue // empty match — nothing to target

    for (let i = 0; i < out.length; i++) {
      const [nStart, nEnd] = ranges[i]
      if (nEnd <= gStart || nStart >= gEnd) continue // no overlap

      if (rule.action.color)       { out[i].c = rule.action.color; out[i].colorOverride = true }
      if (rule.action.silent)      out[i].c = SILENT_HEX
      if (rule.action.underline)   out[i].underlineOverride = rule.action.underline
      if (rule.action.syllabicR)   out[i].syllabicOverride = true
      if (rule.action.superscript) out[i].superscriptOverride = rule.action.superscript
      if (rule.action.glyph)       out[i].glyphOverride = rule.action.glyph
    }
  }

  return out
}
