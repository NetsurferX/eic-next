// src/lib/rules/overrides/types.ts
//
// "Punctual" per-word/per-grapheme override rules. Each rule is a regex
// matched against the WORD's letters (not the IPA). The matched span (or a
// capture group within it) is mapped onto the RenderNode(s) covering that
// span, and the rule's action is applied — bypassing the general engine
// heuristics (engine/align.ts, engine/display.ts) for that grapheme only.
//
// Use these for irregular words where the general rules get the colour,
// silence, or stress-underline wrong. If you're fixing a rule for ONE
// specific word, this is almost always the right place — not the engine.

export interface RegexRuleAction {
  color?: string            // hex override for the matched grapheme(s)
  silent?: boolean          // force matched grapheme(s) to render silent/grey
  underline?: 'force' | 'deny'  // force-anchor or forbid stress underline here
  // B_tehnic §6.1 — mark matched grapheme(s) as the "alb cu chenar negru"
  // forced-schwa consonant (V-R lexical set: bear/near/cure/poor/fire/hour).
  syllabicR?: boolean
  // B_tehnic §2.f — render this string as a superscript glyph on the
  // matched grapheme(s) instead of hiding a letterless phoneme.
  superscript?: string
  // B_tehnic Tabelul 5 — force this diacritic glyph (e.g. 'ỷ', 'ủ', 'ỉ') to
  // render instead of the matched grapheme's plain letter. For the manual
  // exception words where the /j/ semivowel falls on an unexpected letter
  // (lawyer→w̶... actually on 'y'; Freudian→'u'; rooibos→'i'; buoyant/buoyed
  // →'y') — the general table in engine/display.ts only covers the regular
  // y/j case.
  glyph?: string
}

export interface RegexRule {
  id: string          // stable id, e.g. 'island-s'
  label: string       // human description shown in the /rules editor
  enabled: boolean
  pattern: string      // regex source (no slashes), matched against the word
  flags?: string       // regex flags, default '' (case-sensitive; add 'i' for case-insensitive)
  group?: number       // capture group to target; 0 = whole match (default 0)
  action: RegexRuleAction
  priority: number     // lower runs first; later rules can overwrite earlier results
  notes?: string
  testWords?: string[]  // example words this rule is meant to affect
}
