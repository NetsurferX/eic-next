// ruleConfig.ts
// Single source of truth for all EiC rendering rules.
// Editable in /rules page — changes generate a structured prompt.

export interface ColorEntry {
  sounds:   string[]   // IPA display forms that map to this colour
  hex:      string
  label:    string
  category: 'vowel' | 'semivowel' | 'consonant' | 'silent'
}

export interface UnderlineRules {
  monosyllabic:      boolean  // underline in monosyllabic words?
  withSyllabicCons:  boolean  // underline when true syllabic consonant present?
  extendThroughSemi: boolean  // extend underline group through semivowels?
  extendThroughGlide:boolean  // extend through diphthong glides?
}

export interface SilentRules {
  // Grapheme patterns always treated as silent regardless of DB
  alwaysSilentPatterns: string[]
  // If a grapheme is purely graphic-consonant but DB gives vowel colour → mute
  graphicConsonantOverride: boolean
}

export interface VowelChars {
  vowels:     string[]  // IPA chars classified as vowels
  semivowels: string[]  // IPA chars classified as semivowels
  consonants: string[]  // IPA chars classified as consonants (for reference)
}

// ── Regex override rules ───────────────────────────────────────────────────────
// "Punctual" per-word/per-grapheme overrides. Each rule is a regex matched
// against the WORD's letters (not the IPA). The matched span (or a capture
// group within it) is mapped onto the RenderNode(s) covering that span, and
// the action is applied — bypassing the general heuristics for that grapheme.
//
// Use these for irregular words where the general rules in pipeline.ts /
// WordRenderer.tsx get the colour, silence, or stress-underline wrong.

export interface RegexRuleAction {
  color?:       string             // hex override for the matched grapheme(s)
  silent?:      boolean            // force matched grapheme(s) to render silent/grey
  underline?:   'force' | 'deny'   // force-anchor or forbid stress underline here
  // B_tehnic §6.1 — mark matched grapheme(s) as the "alb cu chenar negru"
  // forced-schwa consonant (V-R lexical set: bear/near/cure/poor/fire/hour).
  syllabicR?:   boolean
  // B_tehnic §2.f — render this string as a superscript glyph on the
  // matched grapheme(s) instead of hiding a letterless phoneme.
  superscript?: string
}

export interface RegexRule {
  id:       string    // stable id, e.g. 'island-s'
  label:    string    // human description shown in the editor
  enabled:  boolean
  pattern:  string    // regex source (no slashes), matched against the word
  flags?:   string    // regex flags, default '' (case-sensitive; add 'i' for case-insensitive)
  group?:   number    // capture group to target; 0 = whole match (default 0)
  action:   RegexRuleAction
  priority: number    // lower runs first; later rules can overwrite earlier results
  notes?:   string
  testWords?: string[]  // example words this rule is meant to affect
}

export interface RuleConfig {
  colors:     ColorEntry[]
  underline:  UnderlineRules
  silent:     SilentRules
  vowelChars: VowelChars
  regexRules: RegexRule[]
}

// ── DEFAULT CONFIG — matches current implementation ───────────────────────────

export const DEFAULT_CONFIG: RuleConfig = {
  colors: [
    { sounds: ['æ'],              hex: '#00b0f0', label: 'æ — cat',      category: 'vowel' },
    { sounds: ['ʌ','a','ɑ'],      hex: '#008E40', label: 'ɑ/ʌ — car/cup', category: 'vowel' },
    { sounds: ['ə','ɜ','ər','er'],hex: '#000000', label: 'ə — schwa (SPEC: negru)', category: 'vowel' },
    { sounds: ['e','ɛ'],          hex: '#EE5B00', label: 'e/ɛ — bed',    category: 'vowel' },
    { sounds: ['ɪ','i','iː'],     hex: '#CC0000', label: 'i/ɪ — see/sit', category: 'vowel' },
    { sounds: ['ɒ','ɔ','o'],      hex: '#FF3399', label: 'ɒ/ɔ — hot/or', category: 'vowel' },
    { sounds: ['ʊ','u','uː'],     hex: '#7030A0', label: 'u/ʊ — moon/book', category: 'vowel' },
    { sounds: ['oʊ','əw'],        hex: '#FCD116', label: 'əʊ — go/snow (SPEC: tricolor gradient, placeholder hue)', category: 'vowel' },
    { sounds: ['eɪ','eỷ'],        hex: '#00246C', label: 'eɪ — name/day (SPEC: split from e/ɛ)', category: 'vowel' },
    { sounds: ['ju','ỷu','juː'],  hex: '#833C0B', label: 'juː — cute/beauty (SPEC: new)', category: 'vowel' },
    { sounds: ['aɪ','aỷ'],        hex: '#4472C4', label: 'aɪ — my/time',  category: 'vowel' },
    { sounds: ['aw','aʊ'],        hex: '#23D300', label: 'aʊ — tower/flower (SPEC: split from aɪ)', category: 'vowel' },
    { sounds: ['oɪ','oỷ','ɔɪ'],   hex: '#FF3399', label: 'ɔɪ — boy/coin (SPEC: bicolor roz→roșu, placeholder hue)', category: 'vowel' },
    { sounds: ['j','ỷ'],          hex: '#CC0000', label: 'j/ỷ — yes (SPEC: red, same as i/ɪ)', category: 'semivowel' },
    { sounds: ['w'],              hex: '#000000', label: 'w — we (SPEC: negru, same as consonants)', category: 'semivowel' },
  ],

  underline: {
    monosyllabic:       false,
    withSyllabicCons:   false,
    extendThroughSemi:  true,
    extendThroughGlide: true,
  },

  silent: {
    alwaysSilentPatterns:      ['kn','wr','mb','gh','ght','gn'],
    graphicConsonantOverride:  true,
  },

  vowelChars: {
    vowels:     ['a','e','i','o','u','æ','ɑ','ɒ','ɔ','ə','ɜ','ɝ','ɚ','ɛ','ɪ','ʊ','ʌ','ø','œ'],
    semivowels: ['j','w','ỷ','y'],
    consonants: ['b','d','f','g','h','k','l','m','n','p','r','s','t','v','x','z',
                 'θ','ð','ʃ','ʒ','tʃ','dʒ','ŋ','ɹ'],
  },

  regexRules: [
    // Example (disabled): "island" — the 's' is silent. Targets capture group 1
    // (the 's') and forces it grey, leaving the rest of the word untouched.
    {
      id:       'island-s',
      label:    "Silence the 's' in island",
      enabled:  false,
      pattern:  '^i(s)land$',
      flags:    'i',
      group:    1,
      action:   { silent: true },
      priority: 100,
      notes:    "General silent-pattern rules don't cover positional cases like this.",
      testWords: ['island'],
    },

    // ── B_tehnic §6.2 — V-R forced-schwa lexical sets ──────────────────────
    // Whole-span colour override for each set. Splitting the vowel run from
    // the syllabic-r glyph (white-fill/black-border per §6.1) still needs
    // align.ts/display.ts work — see EiC-tehnic-spec.md §10.5.
    {
      id: 'vr-near', label: 'Near set (iər → i + ər)', enabled: true,
      pattern: '(near|interfere|ideal)', flags: 'i', group: 0,
      action: { color: '#CC0000' }, priority: 200,
      notes: 'Roșu (#CC0000) — Near lexical set, §6.2.',
      testWords: ['near', 'interfere'],
    },
    {
      id: 'vr-care', label: 'Care/bare/aire set (eər → e + ər)', enabled: true,
      pattern: '(bear|hair|care|bare|aire|stare)', flags: 'i', group: 0,
      action: { color: '#EE5B00' }, priority: 200,
      notes: 'Portocaliu (#EE5B00) — Care/bare/aire lexical set, §6.2.',
      testWords: ['bear', 'hair'],
    },
    {
      id: 'vr-cure', label: 'Cure set (jʊər → ỷu + ər)', enabled: true,
      pattern: '(cure|lure)', flags: 'i', group: 0,
      action: { color: '#833C0B' }, priority: 200,
      notes: 'Maro (#833C0B) — Cure lexical set, §6.2.',
      testWords: ['cure', 'lure'],
    },
    {
      id: 'vr-poor', label: 'Poor set (ʊər → ʊ + ər)', enabled: true,
      pattern: '(poor|tour)', flags: 'i', group: 0,
      action: { color: '#7030A0' }, priority: 200,
      notes: 'Violet (#7030A0) — Poor lexical set, §6.2.',
      testWords: ['poor', 'tour'],
    },
    {
      id: 'vr-our', label: 'Our set (aʊər → aw + ər, forced schwa)', enabled: true,
      pattern: '^(hour|our|sour|dour)s?$', flags: 'i', group: 0,
      action: { color: '#23D300' }, priority: 200,
      notes: 'Verde neon (#23D300) — "our" lexical set (aw+ər fused). NOT the same handling as tower/flower — see vr-tower-flower.',
      testWords: ['hour', 'our', 'sour', 'dour'],
    },
    {
      id: 'vr-tower-flower', label: 'Tower/flower (aʊ + ə + r, NOT the our set)', enabled: true,
      pattern: '(tower|flower)', flags: 'i', group: 0,
      action: { color: '#23D300' }, priority: 200,
      notes: 'Verde neon + negru + negru — has its own vowel grapheme (e) for /ə/ before r, unlike "our". Distinct per §6.2 note.',
      testWords: ['tower', 'flower'],
    },
    {
      id: 'vr-fire-tyre', label: 'Fire/tyre set (aɪər → aỷ + ər)', enabled: true,
      pattern: '(fire|tyre|ire)', flags: 'i', group: 0,
      action: { color: '#4472C4' }, priority: 200,
      notes: 'Albastru mediu (#4472C4) — fire/tyre/ire, §6.2.',
      testWords: ['fire', 'tyre', 'ire'],
    },

    // ── B_tehnic §6.1 — "alb cu chenar negru" styling for the syllabic 'r'
    // itself (as opposed to the vowel-run colour above). Wired up for 3
    // representative words to demonstrate each spelling shape (plain -r,
    // -re, single-letter stem); the remaining V-R words follow the same
    // pattern — see EiC-spec-integration-CHANGELOG.md for the full list of
    // patterns to add via /rules.
    {
      id: 'vr-near-r', label: "Near — syllabic 'r' (alb/chenar negru)", enabled: true,
      pattern: '^(nea)(r)$', flags: 'i', group: 2,
      action: { syllabicR: true }, priority: 205,
      notes: '§6.1 Tabelul 3 — /ər/ grapheme, white fill + black border.',
      testWords: ['near'],
    },
    {
      id: 'vr-poor-r', label: "Poor — syllabic 'r' (alb/chenar negru)", enabled: true,
      pattern: '^(poo)(r)$', flags: 'i', group: 2,
      action: { syllabicR: true }, priority: 205,
      notes: '§6.1 Tabelul 3 — /ər/ grapheme, white fill + black border.',
      testWords: ['poor'],
    },
    {
      id: 'vr-fire-r', label: "Fire — syllabic 'r' (alb/chenar negru)", enabled: true,
      pattern: '^(fi)(r)(e)$', flags: 'i', group: 2,
      action: { syllabicR: true }, priority: 205,
      notes: '§6.1 Tabelul 3 — /ər/ grapheme, white fill + black border.',
      testWords: ['fire'],
    },

    // ── B_tehnic §2.f — letterless-phoneme superscript mechanism demo.
    // Disabled: the spec's own example ("kethib") isn't in the lexicon;
    // enable/adapt once a real word needing this comes up.
    {
      id: 'superscript-example', label: 'Superscript for a letterless phoneme (mechanism demo)', enabled: false,
      pattern: '^kethib$', flags: 'i', group: 0,
      action: { superscript: 'v' }, priority: 220,
      notes: '§2.f — /keˈti:v/ → kethi^v^bh: the /v/ has no letter of its own, spec shows it raised. Demonstrates the mechanism; not a general rule.',
      testWords: ['kethib'],
    },
    {
      id: 'vr-goer', label: 'Goer (əʊər → əw + ə + r)', enabled: false,
      pattern: '^goer$', flags: 'i', group: 0,
      action: { color: '#FCD116' }, priority: 200,
      notes: 'Left disabled — spec wants gradient tricolor + negru, not a flat colour; needs §10.4 gradient support before this is accurate. Placeholder colour only.',
      testWords: ['goer'],
    },

    // ── B_tehnic Tabelul 5 — manual y/w exceptions ─────────────────────────
    {
      id: 'oy-lawyer', label: 'lawyer — ỷ grapheme on w', enabled: true,
      pattern: '^lawyer$', flags: 'i', group: 0,
      action: { color: '#CC0000' }, priority: 210,
      notes: 'Manual exception from Tabelul 5 — /ɔɪ/ = o+ỷ, grapheme falls on the "w".',
      testWords: ['lawyer'],
    },
    {
      id: 'oy-freudian', label: 'Freudian — ủ grapheme', enabled: true,
      pattern: '^freudian$', flags: 'i', group: 0,
      action: { color: '#CC0000' }, priority: 210,
      notes: 'Manual exception from Tabelul 5.',
      testWords: ['Freudian'],
    },
    {
      id: 'oy-rooibos', label: 'rooibos — ủ grapheme', enabled: true,
      pattern: '^rooibos$', flags: 'i', group: 0,
      action: { color: '#CC0000' }, priority: 210,
      notes: 'Manual exception from Tabelul 5.',
      testWords: ['rooibos'],
    },
    {
      id: 'oy-buoyant-buoyed', label: 'buoyant/buoyed — ủ grapheme', enabled: true,
      pattern: '^(buoyant|buoyed)$', flags: 'i', group: 0,
      action: { color: '#CC0000' }, priority: 210,
      notes: 'Manual exception from Tabelul 5.',
      testWords: ['buoyant', 'buoyed'],
    },
    {
      id: 'j-fjord', label: 'fjord — j̉ grapheme on j', enabled: true,
      pattern: '^fjord$', flags: 'i', group: 0,
      action: { color: '#CC0000' }, priority: 210,
      notes: 'Only word in the spec where the semivowel grapheme itself is "j".',
      testWords: ['fjord'],
    },

    // ── B_tehnic §2.b/§2.c — expressly-mute e cases ────────────────────────
    {
      id: 'mute-e-ed', label: 'Mute e in -ed when absent from IPA (e.g. cooed)', enabled: false,
      pattern: '([aeiou])(e)d$', flags: 'i', group: 2,
      action: { silent: true }, priority: 150,
      notes: '§2.b "E mut prevăzut expres 1" — left disabled: fires on every -ed word ending in a vowel+e, including ones where this e IS pronounced. Needs a per-word IPA check upstream before enabling broadly.',
      testWords: ['cooed'],
    },
    {
      id: 'mute-e-after-ow', label: 'Mute final e after ow (e.g. stowe)', enabled: true,
      pattern: '(ow)(e)$', flags: 'i', group: 2,
      action: { silent: true }, priority: 150,
      notes: '§2.c "E mut prevăzut expres 2".',
      testWords: ['stowe'],
    },
  ],
}

// ── Apply regex override rules ─────────────────────────────────────────────────
//
// Generic over any node shape that has `t` (grapheme text) and optionally
// `c` (colour), `u` (stressed flag) and `underlineOverride`. Works directly
// on pipeline RenderNode[] (in WordRenderer.tsx) and on adapted preview
// nodes (in the /rules Test/Regex tabs) without import coupling.
//
// Matching: each enabled rule's regex is run once against `word`. The span of
// the targeted group (default group 0 = whole match) is mapped onto every
// node whose grapheme range overlaps that span, and the rule's action is
// applied to those nodes. Rules run in ascending `priority` order, so a
// later rule can overwrite an earlier one.

const SILENT_HEX = '#000000'

export function applyRegexOverrides<
  T extends {
    t: string; c?: string; u?: boolean
    underlineOverride?: 'force' | 'deny'
    syllabicOverride?: boolean
    superscriptOverride?: string
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

      if (rule.action.color)       out[i].c = rule.action.color
      if (rule.action.silent)      out[i].c = SILENT_HEX
      if (rule.action.underline)   out[i].underlineOverride = rule.action.underline
      if (rule.action.syllabicR)   out[i].syllabicOverride = true
      if (rule.action.superscript) out[i].superscriptOverride = rule.action.superscript
    }
  }

  return out
}

// ── Diff generator ────────────────────────────────────────────────────────────

export interface RuleDiff {
  section: string
  field:   string
  old:     string
  new:     string
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

  // Underline rules
  const ul = modified.underline
  const ulb = base.underline
  if (ulb.monosyllabic !== ul.monosyllabic)
    diffs.push({ section: 'Underline', field: 'monosyllabic', old: String(ulb.monosyllabic), new: String(ul.monosyllabic) })
  if (ulb.withSyllabicCons !== ul.withSyllabicCons)
    diffs.push({ section: 'Underline', field: 'withSyllabicConsonant', old: String(ulb.withSyllabicCons), new: String(ul.withSyllabicCons) })
  if (ulb.extendThroughSemi !== ul.extendThroughSemi)
    diffs.push({ section: 'Underline', field: 'extendThroughSemivowels', old: String(ulb.extendThroughSemi), new: String(ul.extendThroughSemi) })
  if (ulb.extendThroughGlide !== ul.extendThroughGlide)
    diffs.push({ section: 'Underline', field: 'extendThroughDiphthongGlide', old: String(ulb.extendThroughGlide), new: String(ul.extendThroughGlide) })

  // Silent rules
  const oldPat = base.silent.alwaysSilentPatterns.join(', ')
  const newPat = modified.silent.alwaysSilentPatterns.join(', ')
  if (oldPat !== newPat)
    diffs.push({ section: 'Silent', field: 'alwaysSilentPatterns', old: oldPat, new: newPat })
  if (base.silent.graphicConsonantOverride !== modified.silent.graphicConsonantOverride)
    diffs.push({ section: 'Silent', field: 'graphicConsonantOverride', old: String(base.silent.graphicConsonantOverride), new: String(modified.silent.graphicConsonantOverride) })

  // Vowel chars
  if (base.vowelChars.vowels.join(',') !== modified.vowelChars.vowels.join(','))
    diffs.push({ section: 'VowelChars', field: 'vowels', old: base.vowelChars.vowels.join(', '), new: modified.vowelChars.vowels.join(', ') })
  if (base.vowelChars.semivowels.join(',') !== modified.vowelChars.semivowels.join(','))
    diffs.push({ section: 'VowelChars', field: 'semivowels', old: base.vowelChars.semivowels.join(', '), new: modified.vowelChars.semivowels.join(', ') })

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
  word:    string
  current: string  // what it shows now
  desired: string  // what it should show
  note:    string
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
