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
  // ── Near set (iər → i + ər) ──────────────────────────────────────────────
  // 2026-08-30 rewrite: same bug family as our/tower/fire below — the old
  // rules coloured the WHOLE WORD (group 0), which via display.ts's
  // isMute() safety net (see engine/display.ts notes) wrongly greyed out
  // the leading consonant ('n' in near, 'interf' in interfere) because it
  // now carried a "vowel" colour on graphic-consonant letters. Narrowed to
  // just the vowel-letter span; the 'r' is handled separately below by
  // vr-near-r / vr-interfere-r ("alb cu chenar negru").
  // Dropped 'ideal' from the old pattern: it has no /r/ at all (aɪˈdil) —
  // it isn't part of this V-R lexical set and the old unanchored pattern
  // would even match it as a bare substring inside any longer word
  // (e.g. "idealism"). Looked like a stray leftover, not removed lightly.
  {
    id: 'vr-near', label: 'Near (iər → i + ər)', enabled: true,
    pattern: '^n(ea)r$', flags: 'i', group: 1,
    action: { color: '#CC0000' }, priority: 200,
    notes: 'Roșu (#CC0000) pe "ea" — Near, §6.2. R-ul separat, vezi vr-near-r.',
    testWords: ['near'],
  },
  {
    id: 'vr-near-r', label: "Near — syllabic 'r' (alb/chenar negru)", enabled: true,
    pattern: '^n(ea)(r)$', flags: 'i', group: 2,
    action: { syllabicR: true }, priority: 205,
    notes: '§6.1 Tabelul 3 — /ər/ grapheme, white fill + black border.',
    testWords: ['near'],
  },
  {
    id: 'vr-interfere', label: 'Interfere (ere → i + ər, §2.2 Regula 8 group)', enabled: true,
    pattern: '^(?:interf)(e)re$', flags: 'i', group: 1,
    action: { color: '#CC0000' }, priority: 200,
    notes: 'Roșu (#CC0000) pe "e" din "-fere" — aceeași familie Near, ortografiată "-ere" (Regula 8, grupul G).',
    testWords: ['interfere'],
  },
  {
    id: 'vr-interfere-r', label: "Interfere — syllabic 'r' (alb/chenar negru)", enabled: true,
    pattern: '^(?:interf)(e)(r)e$', flags: 'i', group: 2,
    action: { syllabicR: true }, priority: 205,
    notes: '§6.1 Tabelul 3 — /ər/ grapheme, white fill + black border.',
    testWords: ['interfere'],
  },

  // ── Care/bare/aire set (eər → e + ər) ────────────────────────────────────
  // Same colour-scope fix. Dropped 'aire' — not an entry in lexicon.db (not
  // a real headword), everything else unified into two shape-patterns:
  // bear/hair (vowel digraph, no trailing e) and care/bare/stare (single
  // 'a' + r + silent trailing e).
  {
    id: 'vr-care-digraph', label: 'Bear/hair (eər → ea/ai + ər)', enabled: true,
    pattern: '^(?:b|h)(ea|ai)r$', flags: 'i', group: 1,
    action: { color: '#EE5B00' }, priority: 200,
    notes: 'Portocaliu (#EE5B00) pe "ea"/"ai" — bear, hair. §6.2.',
    testWords: ['bear', 'hair'],
  },
  {
    id: 'vr-care-digraph-r', label: "Bear/hair — syllabic 'r' (alb/chenar negru)", enabled: true,
    pattern: '^(?:b|h)(ea|ai)(r)$', flags: 'i', group: 2,
    action: { syllabicR: true }, priority: 205,
    notes: '§6.1 Tabelul 3 — /ər/ grapheme, white fill + black border.',
    testWords: ['bear', 'hair'],
  },
  {
    id: 'vr-care-a-e', label: 'Care/bare/stare (eər → a + ər, mute e)', enabled: true,
    pattern: '^(?:c|b|st)(a)re$', flags: 'i', group: 1,
    action: { color: '#EE5B00' }, priority: 200,
    notes: 'Portocaliu (#EE5B00) pe "a" — care, bare, stare. §6.2.',
    testWords: ['care', 'bare', 'stare'],
  },
  {
    id: 'vr-care-a-e-r', label: "Care/bare/stare — syllabic 'r' (alb/chenar negru)", enabled: true,
    pattern: '^(?:c|b|st)(a)(r)e$', flags: 'i', group: 2,
    action: { syllabicR: true }, priority: 205,
    notes: '§6.1 Tabelul 3 — /ər/ grapheme, white fill + black border.',
    testWords: ['care', 'bare', 'stare'],
  },

  // ── Cure/RUR set (jʊər/ʊər → u + ər) — regula a 18-a, mecanică ────────────
  // Rescrisă 2026-09 peste infrastructura phonemicGate (types.ts/apply.ts):
  // înainte, această regulă folosea o listă literală de rădăcini
  // ^(?:c|l)(u)re$ (doar cure/lure) — corectă, dar nescalabilă (nu acoperea
  // ensure/secure/obscure/assure/sure/curable/curing/curate).
  // Acum: captează STRICT nucleul "u"+"r"(+e mut) + lookahead pe cel mai
  // lung sufix transparent (ative/able/ible/ness/ment/ing/est/ate/ly/er/ed/
  // es/s), fără nicio listă de rădăcini — la fel ca protocolul fonologic
  // §4.3. Ortografia SINGURĂ nu poate distinge cure/sure de nature/measure/
  // picture/future (toate se termină grafic în "-ure") — de-asta pattern-ul
  // e obligatoriu combinat cu `phonemicGate`: [uʊ][əɜ]?r verificat pe
  // fonemele REALE ale cuvântului (nodes[].s, nu ortografia) — la
  // nature/measure/picture/future, transformările motorului (tʃ/ʃ etc.)
  // fac ca /u/ să nu ajungă niciodată adiacent lui /r/ în fonemele produse,
  // deci poarta le exclude automat, fără nicio listă de excepții.
  // Exclude corect și rural/curious/urinate (regula 18, "capcane" native
  // plurisilabice): "u"+"r" acolo e urmat de o vocală nativă (rural, curious)
  // sau de altceva decât un sufix transparent, deci pattern-ul de ortografie
  // pur și simplu nu se potrivește — nu are nevoie de gate separat pentru ele.
  // Testat prin pipeline-ul real, 27 de cazuri (10 pozitive, 3 negative,
  // 11 capcane, 3 verificări de ordonare) — toate corecte. Livrat ca
  // eic-next-cure-rur-mechanical.patch.
  {
    id: 'vr-cure', label: 'Cure/RUR (jʊər/ʊər → u + ər, mecanic)', enabled: true,
    pattern: '(u)r(?:e|ative|able|ible|ness|ment|ing|est|ate|ly|er|ed|es|s)?$', flags: 'i', group: 1,
    phonemicGate: '[uʊ][əɜ]?r',
    action: { color: '#833C0B' }, priority: 200,
    notes: 'Maro (#833C0B) pe "u" — cure, lure, sure, ensure, secure, obscure, assure, curable, curing, curate. §4.3/§6.2.',
    testWords: ['cure', 'lure', 'sure', 'ensure', 'secure', 'obscure', 'assure', 'curable', 'curing', 'curate'],
  },
  {
    id: 'vr-cure-r', label: "Cure/RUR — syllabic 'r' (alb/chenar negru)", enabled: true,
    pattern: 'u(r)(?:e|ative|able|ible|ness|ment|ing|est|ate|ly|er|ed|es|s)?$', flags: 'i', group: 1,
    phonemicGate: '[uʊ][əɜ]?r',
    action: { syllabicR: true }, priority: 205,
    notes: '§6.1 Tabelul 3 — /ər/ grapheme, white fill + black border. Extins 2026-09 la tot setul CURE/RUR (nu doar cure/lure) — reutilizează exact poarta + pattern-ul mecanic de mai sus, doar grupul țintă diferă (r, nu nucleul ur/ure). Efect secundar benign observat: "tour" primește și el syllabicR pe această cale (poarta se potrivește și acolo) — culoarea rămâne corectă (violet, de la vr-poor), iar fonetic pare chiar corect (aceeași reducere schwa-r ca poor).',
    testWords: ['cure', 'lure', 'sure', 'ensure', 'secure', 'obscure', 'assure', 'curable', 'curing', 'curate'],
  },

  // ── Poor set (ʊər → ʊ + ər) ───────────────────────────────────────────────
  {
    id: 'vr-poor', label: 'Poor/tour (ʊər → oo/ou + ər)', enabled: true,
    pattern: '^(?:p|t)(oo|ou)r$', flags: 'i', group: 1,
    action: { color: '#7030A0' }, priority: 200,
    notes: 'Violet (#7030A0) pe "oo"/"ou" — poor, tour. §6.2.',
    testWords: ['poor', 'tour'],
  },
  {
    id: 'vr-poor-r', label: "Poor/tour — syllabic 'r' (alb/chenar negru)", enabled: true,
    pattern: '^(?:p|t)(oo|ou)(r)$', flags: 'i', group: 2,
    action: { syllabicR: true }, priority: 205,
    notes: '§6.1 Tabelul 3 — /ər/ grapheme, white fill + black border.',
    testWords: ['poor', 'tour'],
  },
  // ── "our" set (2026-08-30 rewrite) ──────────────────────────────────────
  // Dorel's breakdown: "hour/our/sour/dour" spell /aʊər/ as "Ou" + "r" —
  // the WHOLE "ou" digraph carries /aw/ (green), and the bare final "r"
  // carries the fused syllabic /ər/ (white fill/black border). No separate
  // vowel letter for the schwa exists in these words (contrast tower/
  // flower below, which DO have one — the 'e').
  //
  // Previous version of this rule coloured the WHOLE WORD span (group 0),
  // which — via display.ts's isMute() heuristic ("vowel colour on a graphic
  // consonant letter" ⇒ treat as an accidentally-silent letter) — painted
  // any real leading consonant (the 's' of "sour", the 'd' of "dour", even
  // the already-silent 'h' of "hour") a muddy grey instead of leaving it
  // alone. Narrowing the colour span to ONLY the "ou" letters (group 2)
  // avoids ever touching a consonant node, so the bug can't trigger.
  {
    id: 'vr-our', label: 'Our set — "ou" digraph (aw, green)', enabled: true,
    pattern: '^([hsd]?)(ou)(r)$', flags: 'i', group: 2,
    action: { color: '#23D300' }, priority: 200,
    notes: 'Verde neon (#23D300) on "ou" only — "our" lexical set (hour/our/sour/dour). The final r is handled separately by vr-our-r (white/chenar, fused /ər/).',
    testWords: ['hour', 'our', 'sour', 'dour'],
  },
  {
    id: 'vr-our-r', label: "Our set — syllabic 'r' (alb/chenar negru)", enabled: true,
    pattern: '^([hsd]?)(ou)(r)$', flags: 'i', group: 3,
    action: { syllabicR: true }, priority: 205,
    notes: '§6.1 — fused /ər/ grapheme (no separate schwa letter in this set, unlike tower/flower), white fill + black border. Covers hour/our/sour/dour.',
    testWords: ['hour', 'our', 'sour', 'dour'],
  },

  // ── Tower/power/flower — NOT the "our" set ───────────────────────────────
  // /aʊ/ + /ə/ + /r/ with its OWN vowel grapheme ('e') for the schwa,
  // unlike "our" above — so /ər/ stays two plain black letters, never
  // fused into the white/chenar syllabic-r styling.
  //
  // The general engine gets everything else right without help (colors.ts
  // colours the 'aw'/'aʊ' sound green automatically: 'o' green, 'e' a
  // genuine silent leftover once /ə/ has claimed 'w', 'r' plain black) —
  // EXCEPT 'w' itself, which the general engine renders black (it's the
  // letter that /ə/ happened to consume, and schwa's own colour is black).
  // Confirmed against /culise for "tower" and "power": Dorel wants 'w'
  // sharing the /aw/ digraph's green, not the schwa's black — "ow" reads
  // as one visual unit even though phonemically 'w' carries the /ə/ that
  // follows. This one targeted rule is now safe to add (it wasn't before
  // the 2026-08-30 isMute() fix in engine/display.ts): 'w' here is a
  // genuine VOWEL node (x=false, align.ts found a colour for the schwa),
  // so isMute() no longer misreads a colour override on it as "silent
  // consonant" — that heuristic now only ever fires on real (x=true)
  // consonant nodes.
  {
    id: 'vr-tower-power-flower-w', label: "Tower/power/flower — 'w' shares the /aw/ green + underline", enabled: true,
    pattern: '^(?:t|p|fl)(o)(w)er$', flags: 'i', group: 2,
    action: { color: '#23D300', underline: 'force' }, priority: 200,
    notes: 'Verde neon (#23D300) + subliniere pe \'w\' — "ow" citit ca un singur bloc vizual /aw/, deși /ə/ e fonemul dus de \'w\'. Dogma sistemului: w e vocală aici, deci participă la sublinierea silabei accentuate ca orice altă vocală. §3.3/§4.1/§6.2.',
    testWords: ['tower', 'power', 'flower'],
  },

  // ── Fire/tyre/ire — aɪər → aỷ + ər ────────────────────────────────────────
  // Also needs NO colour override any more: the /aɪ/ ("ay̓") sound is
  // already coloured #4472C4 by colors.ts for every word. The blanket
  // whole-word colour rule that used to live here is retired for the same
  // reason as tower/flower (isMute() bug on 'f'/'t' consonants, and it was
  // also wrongly recolouring the genuinely-silent final 'e' blue instead of
  // leaving it grey). What DOES still need a manual rule is the syllabic
  // 'r' styling — see vr-fire-tyre-ire-r below, which replaces the old
  // fire-only 'vr-fire-r'.
  //
  // (id 'vr-fire-tyre' intentionally retired 2026-08-30 — see above)

  // ── §6.1 — "alb cu chenar negru" styling for the syllabic 'r' itself
  // (as opposed to the vowel-run colour above). near-r and poor-r moved up
  // next to their colour rules in the 2026-08-30 rewrite (were duplicated
  // here under the same ids, which is why they're gone from this spot).
  {
    id: 'vr-fire-tyre-ire-r', label: "Fire/tyre/ire — syllabic 'r' (alb/chenar negru)", enabled: true,
    // Consolidated 2026-08-30 (was 'vr-fire-r', fire-only). All three spell
    // /aɪər/ with an 'i' or 'y' vowel letter + 'r' + a silent final 'e' —
    // same shape, so one pattern covers all three instead of one per word.
    pattern: '^([ft]?)(i|y)(r)e$', flags: 'i', group: 3,
    action: { syllabicR: true }, priority: 205,
    notes: '§6.1 Tabelul 3 — /ər/ grapheme, white fill + black border. Covers fire/tyre/ire.',
    testWords: ['fire', 'tyre', 'ire'],
  },
]
