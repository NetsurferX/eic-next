// src/lib/rules/overrides/index.ts
//
// Combines every per-word regex override into one REGEX_RULES list (order
// doesn't matter — each rule carries its own `priority`) and re-exports the
// types + applyRegexOverrides() so consumers only need one import.
//
// TO ADD A RULE: put it in the file for its category (vr-lexical-sets.ts,
// yw-exceptions.ts, mute-e.ts), or misc.ts if it's a genuine one-off. Then
// it shows up here automatically.

import { VR_LEXICAL_SET_RULES } from './vr-lexical-sets'
import { YW_EXCEPTION_RULES } from './yw-exceptions'
import { MUTE_E_RULES } from './mute-e'
import { MISC_RULES } from './misc'

export const REGEX_RULES = [
  ...VR_LEXICAL_SET_RULES,
  ...YW_EXCEPTION_RULES,
  ...MUTE_E_RULES,
  ...MISC_RULES,
]

export type { RegexRule, RegexRuleAction } from './types'
export { applyRegexOverrides } from './apply'
