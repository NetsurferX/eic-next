// src/lib/rules/overrides/vr-lexical-sets.ts
//
// B_tehnic §6.2 — V-R forced-schwa lexical sets (near/bear/cure/poor/our/
// tower-flower/fire). Whole-span colour overrides for the vowel-run, plus
// (§6.1) "alb cu chenar negru" (white fill / black border) styling for the
// syllabic 'r' itself in a few representative spelling shapes.
//
// Splitting the vowel run from the syllabic-r glyph properly still needs
// align.ts/display.ts work — see EiC-tehnic-spec.md §10.5.

import type { RegexRule } from './types'

export const VR_LEXICAL_SET_RULES: RegexRule[] = [
  {
    id: 'vr-near', label: 'Near set (iər → i + ər)', enabled: true,
    pattern: '(near|interfere|ideal)', flags: 'i', group: 0,
    action: { color: '#CC0000' }, priority: 200,
    notes: 'Roșu (#CC0000) — Near lexical set, §6.2.',
    testWords: ['near', 'interfere'],
  },
  {
    id: 'vr-care', label: 'Care/bare/aire set (eər → e + ər)', enabled: true,
    pattern: '(bear|hair|care|bare|aire|stare)', flags: 'i', group: 0,
    action: { color: '#EE5B00' }, priority: 200,
    notes: 'Portocaliu (#EE5B00) — Care/bare/aire lexical set, §6.2.',
    testWords: ['bear', 'hair'],
  },
  {
    id: 'vr-cure', label: 'Cure set (jʊər → ỷu + ər)', enabled: true,
    pattern: '(cure|lure)', flags: 'i', group: 0,
    action: { color: '#833C0B' }, priority: 200,
    notes: 'Maro (#833C0B) — Cure lexical set, §6.2.',
    testWords: ['cure', 'lure'],
  },
  {
    id: 'vr-poor', label: 'Poor set (ʊər → ʊ + ər)', enabled: true,
    pattern: '(poor|tour)', flags: 'i', group: 0,
    action: { color: '#7030A0' }, priority: 200,
    notes: 'Violet (#7030A0) — Poor lexical set, §6.2.',
    testWords: ['poor', 'tour'],
  },
  {
    id: 'vr-our', label: 'Our set (aʊər → aw + ər, forced schwa)', enabled: true,
    pattern: '^(hour|our|sour|dour)s?$', flags: 'i', group: 0,
    action: { color: '#23D300' }, priority: 200,
    notes: 'Verde neon (#23D300) — "our" lexical set (aw+ər fused). NOT the same handling as tower/flower — see vr-tower-flower.',
    testWords: ['hour', 'our', 'sour', 'dour'],
  },
  {
    id: 'vr-tower-flower', label: 'Tower/flower (aʊ + ə + r, NOT the our set)', enabled: true,
    pattern: '(tower|flower)', flags: 'i', group: 0,
    action: { color: '#23D300' }, priority: 200,
    notes: 'Verde neon + negru + negru — has its own vowel grapheme (e) for /ə/ before r, unlike "our". Distinct per §6.2 note.',
    testWords: ['tower', 'flower'],
  },
  {
    id: 'vr-fire-tyre', label: 'Fire/tyre set (aɪər → aỷ + ər)', enabled: true,
    pattern: '(fire|tyre|ire)', flags: 'i', group: 0,
    action: { color: '#4472C4' }, priority: 200,
    notes: 'Albastru mediu (#4472C4) — fire/tyre/ire, §6.2.',
    testWords: ['fire', 'tyre', 'ire'],
  },

  // ── §6.1 — "alb cu chenar negru" styling for the syllabic 'r' itself
  // (as opposed to the vowel-run colour above). Wired up for 3
  // representative words to demonstrate each spelling shape (plain -r,
  // -re, single-letter stem); the remaining V-R words follow the same
  // pattern — see EiC-spec-integration-CHANGELOG.md for the full list.
  {
    id: 'vr-near-r', label: "Near — syllabic 'r' (alb/chenar negru)", enabled: true,
    pattern: '^(nea)(r)$', flags: 'i', group: 2,
    action: { syllabicR: true }, priority: 205,
    notes: '§6.1 Tabelul 3 — /ər/ grapheme, white fill + black border.',
    testWords: ['near'],
  },
  {
    id: 'vr-poor-r', label: "Poor — syllabic 'r' (alb/chenar negru)", enabled: true,
    pattern: '^(poo)(r)$', flags: 'i', group: 2,
    action: { syllabicR: true }, priority: 205,
    notes: '§6.1 Tabelul 3 — /ər/ grapheme, white fill + black border.',
    testWords: ['poor'],
  },
  {
    id: 'vr-fire-r', label: "Fire — syllabic 'r' (alb/chenar negru)", enabled: true,
    pattern: '^(fi)(r)(e)$', flags: 'i', group: 2,
    action: { syllabicR: true }, priority: 205,
    notes: '§6.1 Tabelul 3 — /ər/ grapheme, white fill + black border.',
    testWords: ['fire'],
  },
]
