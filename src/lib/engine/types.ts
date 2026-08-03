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
