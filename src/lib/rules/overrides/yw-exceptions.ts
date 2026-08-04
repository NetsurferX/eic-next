// src/lib/rules/overrides/yw-exceptions.ts
//
// B_tehnic Tabelul 5 — manual exceptions for words where the y/w/j semivowel
// grapheme falls on an unexpected letter and the general alignment rules in
// engine/align.ts pick the wrong one.

import type { RegexRule } from './types'

export const YW_EXCEPTION_RULES: RegexRule[] = [
  {
    id: 'oy-lawyer', label: 'lawyer — ỷ grapheme on y', enabled: true,
    pattern: '^law(y)er$', flags: 'i', group: 1,
    action: { color: '#CC0000', glyph: 'ỷ' }, priority: 210,
    notes: 'Manual exception from Tabelul 5 — /ɔɪ/ = o+ỷ, glyph falls on the "y" (not the whole word).',
    testWords: ['lawyer'],
  },
  {
    id: 'oy-freudian', label: 'Freudian — ủ grapheme on u', enabled: true,
    pattern: '^fre(u)dian$', flags: 'i', group: 1,
    action: { color: '#CC0000', glyph: 'ủ' }, priority: 210,
    notes: 'Manual exception from Tabelul 5 — glyph falls on the "u".',
    testWords: ['Freudian'],
  },
  {
    id: 'oy-rooibos', label: 'rooibos — ỉ grapheme on i', enabled: true,
    pattern: '^roo(i)bos$', flags: 'i', group: 1,
    action: { color: '#CC0000', glyph: 'ỉ' }, priority: 210,
    notes: 'Manual exception from Tabelul 5 — glyph falls on the "i".',
    testWords: ['rooibos'],
  },
  {
    id: 'oy-buoyant-buoyed', label: 'buoyant/buoyed — ỷ grapheme on y', enabled: true,
    pattern: '^buo(y)(?:ant|ed)$', flags: 'i', group: 1,
    action: { color: '#CC0000', glyph: 'ỷ' }, priority: 210,
    notes: 'Manual exception from Tabelul 5 — glyph falls on the "y".',
    testWords: ['buoyant', 'buoyed'],
  },
  {
    id: 'j-fjord', label: 'fjord — j̉ grapheme on j', enabled: true,
    pattern: '^f(j)ord$', flags: 'i', group: 1,
    action: { color: '#CC0000', glyph: 'j̉' }, priority: 210,
    notes: 'Only word in the spec where the semivowel grapheme itself is "j".',
    testWords: ['fjord'],
  },
]