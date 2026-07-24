// src/lib/rules/overrides/yw-exceptions.ts
//
// B_tehnic Tabelul 5 — manual exceptions for words where the y/w/j semivowel
// grapheme falls on an unexpected letter and the general alignment rules in
// engine/align.ts pick the wrong one.

import type { RegexRule } from './types'

export const YW_EXCEPTION_RULES: RegexRule[] = [
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
]
