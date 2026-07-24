// src/lib/rules/overrides/mute-e.ts
//
// B_tehnic §2.b/§2.c — expressly-mute 'e' cases the general silent-letter
// handling in engine/display.ts (isMute()) doesn't catch, because these e's
// have a genuine vowel-adjacent spelling shape rather than looking like a
// plain "silent consonant".

import type { RegexRule } from './types'

export const MUTE_E_RULES: RegexRule[] = [
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
]
