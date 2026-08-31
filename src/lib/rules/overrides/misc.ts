// src/lib/rules/overrides/misc.ts
//
// One-off exceptions and mechanism demos that don't belong to a named
// category yet. If a group of 2+ related rules accumulates here, give it
// its own file the way vr-lexical-sets.ts / yw-exceptions.ts / mute-e.ts
// were split out.

import type { RegexRule } from './types'

export const MISC_RULES: RegexRule[] = [
  // Worked example (disabled): "island" — the 's' is silent. Targets capture
  // group 1 (the 's') and forces it grey, leaving the rest of the word
  // untouched. Kept here as a reference for writing your own rule.
  {
    id: 'island-s', label: "Silence the 's' in island", enabled: false,
    pattern: '^i(s)land$', flags: 'i', group: 1,
    action: { silent: true }, priority: 100,
    notes: "General silent-pattern rules don't cover positional cases like this.",
    testWords: ['island'],
  },

  // §2.f letterless-phoneme superscript mechanism demo. Disabled: the
  // spec's own example ("kethib") isn't in the lexicon; enable/adapt once a
  // real word needing this comes up.
  {
    id: 'superscript-example', label: 'Superscript for a letterless phoneme (mechanism demo)', enabled: false,
    pattern: '^kethib$', flags: 'i', group: 0,
    action: { superscript: 'v' }, priority: 220,
    notes: '§2.f — /keˈti:v/ → kethi^v^bh: the /v/ has no letter of its own, spec shows it raised. Demonstrates the mechanism; not a general rule.',
    testWords: ['kethib'],
  },
  // 'vr-goer' (əʊər → əw + ə + r) — REMOVED 2026-08-30. This used to be a
  // disabled placeholder waiting on §10.4 tricolor-gradient support, which
  // has since landed in engine/display.ts (TRICOLOR_GRADIENT_SOUNDS). No
  // override is needed at all any more: the general engine now renders
  // "goer" correctly on its own — 'g' black, 'o' gets the full tricolor
  // gradient automatically (any word with the 'əw' sound does), 'e' and
  // 'r' both plain black consonants (schwa + r, NOT fused/white-bordered —
  // "goer" isn't in a V-R lexical set the way hour/fire are; it's just
  // ordinary "go" + agentive "-er"). Verified via src/scripts/vr-test.ts.
]
