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

export interface RuleConfig {
  colors:     ColorEntry[]
  underline:  UnderlineRules
  silent:     SilentRules
  vowelChars: VowelChars
}

// ── DEFAULT CONFIG — matches current implementation ───────────────────────────

export const DEFAULT_CONFIG: RuleConfig = {
  colors: [
    { sounds: ['æ'],              hex: '#00b0f0', label: 'æ — cat',      category: 'vowel' },
    { sounds: ['ʌ','a','ɑ'],      hex: '#008E40', label: 'ɑ/ʌ — car/cup', category: 'vowel' },
    { sounds: ['ə','ɜ','ər','er'],hex: '#888888', label: 'ə — schwa',    category: 'vowel' },
    { sounds: ['e','ɛ','eɪ','eỷ'],hex: '#EE5B00', label: 'e/ɛ — bed',    category: 'vowel' },
    { sounds: ['ɪ','i','iː'],     hex: '#CC0000', label: 'i/ɪ — see/sit', category: 'vowel' },
    { sounds: ['ɒ','ɔ','o','oʊ','əw'], hex: '#FF3399', label: 'ɒ/ɔ — hot/or', category: 'vowel' },
    { sounds: ['ʊ','u','uː'],     hex: '#7030A0', label: 'u/ʊ — moon/book', category: 'vowel' },
    { sounds: ['aɪ','aỷ','aw','aʊ','oɪ','oỷ','ɔɪ'], hex: '#4472C4', label: 'aɪ/aʊ — my/now', category: 'vowel' },
    { sounds: ['j','w','ỷ'],      hex: '#E57373', label: 'j/w — yes/we', category: 'semivowel' },
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
