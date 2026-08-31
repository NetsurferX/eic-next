// engine/types.ts
// Public output shape. MUST stay identical to the old pipeline.ts RenderNode —
// db.ts, ruleConfig.ts, WordRenderer.tsx, useColorizer.ts all depend on this
// exact field layout. Do not rename fields here without updating those.

export interface RenderNode {
  t: string    // grapheme (letters consumed from the word; '' for latent phonemes)
  s: string    // sound display form (post-TRANSFORMS IPA)
  c: string    // hex colour
  u: boolean   // isStressed
  x: boolean   // isConsonant
  underlineOverride?: 'force' | 'deny'  // set later by ruleConfig.ts's applyRegexOverrides()
  // B_tehnic §6.1 — forced V-R schwa+consonant styling ("alb cu chenar
  // negru"). Distinct from the existing SYLLABIC_MARKER-driven `syllabic`
  // case in display.ts (which is black-fill) — this one is white-fill.
  syllabicOverride?: boolean
  // B_tehnic §2.f — a phoneme with no corresponding letter at all is shown
  // as a superscript glyph attached to the previous/next grapheme instead
  // of being silently dropped. Set via ruleConfig.ts regex rules.
  superscriptOverride?: string
  glyphOverride?: string   // set by ruleConfig.ts's applyRegexOverrides() — Tabelul 5 manual exceptions
  // Set whenever a regex override rule's `action.color` fires (see
  // rules/overrides/apply.ts). Distinct from a merely-non-empty `c`: this
  // means the colour was DELIBERATELY forced by a lexical-set exception
  // rule (hour/near/cure/...), so display.ts must paint it flat/solid and
  // skip the general unstressed-vowel gradient treatment (simpleHex /
  // tricolor / diphthong-transparent) that would otherwise silently
  // discard the override colour for monosyllabic words whose vowel sound
  // happens to be one of the "gradient" sounds (ɪ, ʌ, ɒ, ɔ, ʊ) — found
  // while wiring up near/lure/tour, which never get the stress-underline
  // that normally makes those sounds render solid (§4.2 excludes
  // monosyllabic words from underlining).
  colorOverride?: boolean
}

/** One IPA phoneme after transform + stress detection, before grapheme mapping. */
export interface Seg {
  ipa:      string
  display:  string
  isVowel:  boolean
  accented: boolean
}

export interface WordProps {
  dominantColor: string | null
  hasSilent:     boolean
  hasStress:     boolean
  syllableCount: number
}
