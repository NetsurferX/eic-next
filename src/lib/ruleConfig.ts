// ruleConfig.ts
// Bridges the canonical rule data (src/lib/rules/) with the /rules editor
// UI: builds the editable RuleConfig snapshot, diffs an edited copy against
// the original, and turns that diff into a change-request prompt.
//
// This file does NOT define colours or regex rules itself any more — it
// imports them from src/lib/rules/. See that folder's README for the map of
// "I want to change X, where do I go".
//
// NOT HERE: underline and silent-letter behaviour. Earlier versions of this
// file had `UnderlineRules`/`SilentRules` config objects (monosyllabic,
// alwaysSilentPatterns, etc.) that LOOKED editable here but were never
// actually read by the rendering engine — editing them in the UI did
// nothing to the live site. They've been removed rather than left as a
// trap. That logic is genuine algorithm, not independent toggles (see the
// "DOGMA" comments in engine/align.ts and engine/display.ts) — if you want
// to change how underlining or silent-letter detection works, that's where
// to go, and if you want a NEW independent toggle for one of them, ask for
// it to be added properly rather than assuming one already exists.

import { SOUND_COLORS, type SoundColor } from './rules/colors'
import { REGEX_RULES, applyRegexOverrides } from './rules/overrides'
import type { RegexRule } from './rules/overrides'

export type { RegexRule, RegexRuleAction } from './rules/overrides'
export { applyRegexOverrides }

export interface RuleConfig {
  colors: SoundColor[]
  regexRules: RegexRule[]
}

export const DEFAULT_CONFIG: RuleConfig = {
  colors: SOUND_COLORS,
  regexRules: REGEX_RULES,
}

// ── Diff generator ────────────────────────────────────────────────────────────

export interface RuleDiff {
  section: string
  field: string
  old: string
  new: string
}

export function diffConfigs(base: RuleConfig, modified: RuleConfig): RuleDiff[] {
  const diffs: RuleDiff[] = []

  // Colors
  base.colors.forEach((entry, i) => {
    const mod = modified.colors[i]
    if (!mod) return
    if (entry.hex !== mod.hex)
      diffs.push({ section: 'ColorMap', field: entry.label, old: entry.hex, new: mod.hex })
    if (entry.category !== mod.category)
      diffs.push({ section: 'ColorMap', field: `${entry.label} category`, old: entry.category, new: mod.category })
    const oldSounds = entry.sounds.join(', ')
    const newSounds = mod.sounds.join(', ')
    if (oldSounds !== newSounds)
      diffs.push({ section: 'ColorMap', field: `${entry.label} sounds`, old: oldSounds, new: newSounds })
  })

  // Regex rules — diff by id so additions/edits/removals are all visible
  const baseRules = base.regexRules ?? []
  const modRules  = modified.regexRules ?? []
  const baseById  = new Map(baseRules.map(r => [r.id, r]))
  const modById   = new Map(modRules.map(r => [r.id, r]))

  for (const [id, mod] of modById) {
    const orig = baseById.get(id)
    if (!orig) {
      diffs.push({ section: 'RegexRules', field: `${id} (new)`, old: '—', new: `${mod.pattern} → ${JSON.stringify(mod.action)}` })
    } else if (JSON.stringify(orig) !== JSON.stringify(mod)) {
      diffs.push({
        section: 'RegexRules', field: id,
        old: `${orig.pattern} → ${JSON.stringify(orig.action)}${orig.enabled ? '' : ' (disabled)'}`,
        new: `${mod.pattern} → ${JSON.stringify(mod.action)}${mod.enabled ? '' : ' (disabled)'}`,
      })
    }
  }
  for (const [id, orig] of baseById) {
    if (!modById.has(id))
      diffs.push({ section: 'RegexRules', field: `${id} (removed)`, old: `${orig.pattern} → ${JSON.stringify(orig.action)}`, new: '—' })
  }

  return diffs
}

// ── Prompt generator ──────────────────────────────────────────────────────────

export interface TestCase {
  word: string
  current: string  // what it shows now
  desired: string  // what it should show
  note: string
}

export function generatePrompt(
  diffs: RuleDiff[],
  testCases: TestCase[],
  config: RuleConfig
): string {
  const date = new Date().toISOString().split('T')[0]
  const lines: string[] = []

  lines.push(`## EiC Rule Change Request — ${date}`)
  lines.push('')

  if (diffs.length > 0) {
    lines.push('### Rule Changes')
    const bySection: Record<string, RuleDiff[]> = {}
    for (const d of diffs) {
      if (!bySection[d.section]) bySection[d.section] = []
      bySection[d.section].push(d)
    }
    for (const [section, ds] of Object.entries(bySection)) {
      lines.push(`\n**${section}:**`)
      for (const d of ds)
        lines.push(`- ${d.field}: \`${d.old}\` → \`${d.new}\``)
    }
    lines.push('')
  }

  if (testCases.length > 0) {
    lines.push('### Test Cases')
    for (const tc of testCases) {
      lines.push(`\n**"${tc.word}"**`)
      if (tc.current) lines.push(`- Current render: ${tc.current}`)
      if (tc.desired) lines.push(`- Should render:  ${tc.desired}`)
      if (tc.note)    lines.push(`- Note: ${tc.note}`)
    }
    lines.push('')
  }

  lines.push('### Full Config Snapshot')
  lines.push('```json')
  lines.push(JSON.stringify(config, null, 2))
  lines.push('```')

  return lines.join('\n')
}
