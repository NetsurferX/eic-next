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
