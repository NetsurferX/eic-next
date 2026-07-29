(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/rules/colors.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/rules/colors.ts
//
// ── SINGLE SOURCE OF TRUTH for every sound → colour mapping in EiC. ──────────
//
// Before this file existed, the same colour data was hand-copied in FOUR
// places (engine/colorMap.ts, ruleConfig.ts's DEFAULT_CONFIG.colors,
// gameTypes.ts's COLOR_LABELS, and scripts/accent-test.ts), with no link
// between them — editing one did not update the others, and nothing warned
// you when they drifted apart. All four now import from here.
//
// TO CHANGE A COLOUR: edit one line in SOUND_COLORS below. That's it.
// Every consumer (the real rendering engine, the /rules editor, the game's
// colour quiz, and the standalone accent-test script) reads this file
// directly, so there is nothing else to keep in sync.
//
// TO ADD A NEW SOUND: add a new SoundColor entry. `sounds` lists every IPA
// display form (as produced by engine/segment.ts's TRANSFORMS table) that
// should take this colour.
__turbopack_context__.s([
    "COLOR_CONSONANT",
    ()=>COLOR_CONSONANT,
    "COLOR_LABELS",
    ()=>COLOR_LABELS,
    "COLOR_MAP",
    ()=>COLOR_MAP,
    "COLOR_SILENT",
    ()=>COLOR_SILENT,
    "NEAR_COLOR_GROUPS",
    ()=>NEAR_COLOR_GROUPS,
    "SOUND_COLORS",
    ()=>SOUND_COLORS,
    "VOWEL_CHARS",
    ()=>VOWEL_CHARS,
    "getColor",
    ()=>getColor,
    "isVowelSound",
    ()=>isVowelSound
]);
const SOUND_COLORS = [
    {
        sounds: [
            'æ'
        ],
        hex: '#00b0f0',
        label: 'æ',
        example: 'cat, hat',
        category: 'vowel',
        neighbors: [
            '#EE5B00'
        ]
    },
    {
        sounds: [
            'ʌ',
            'a',
            'ɑ'
        ],
        hex: '#008E40',
        label: 'ɑ / ʌ',
        example: 'car, cup',
        category: 'vowel',
        neighbors: [
            '#FF3399'
        ]
    },
    {
        sounds: [
            'ə',
            'ɜ',
            'ər',
            'er',
            'ɐ'
        ],
        hex: '#000000',
        label: 'ə — schwa',
        category: 'vowel',
        note: 'SPEC CORRECTION (B_tehnic §9 Tabel 2): schwa is negru (black), not grey.'
    },
    {
        sounds: [
            'e',
            'ɛ'
        ],
        hex: '#EE5B00',
        label: 'e / ɛ',
        example: 'bed, say',
        category: 'vowel',
        neighbors: [
            '#00b0f0',
            '#CC0000'
        ]
    },
    {
        sounds: [
            'ɪ',
            'i',
            'iː'
        ],
        hex: '#CC0000',
        label: 'i / ɪ',
        example: 'see, sit',
        category: 'vowel',
        neighbors: [
            '#EE5B00'
        ]
    },
    {
        sounds: [
            'ɒ',
            'ɔ',
            'o'
        ],
        hex: '#FF3399',
        label: 'ɒ / ɔ',
        example: 'hot, or',
        category: 'vowel',
        neighbors: [
            '#008E40',
            '#7030A0'
        ]
    },
    {
        sounds: [
            'ʊ',
            'u',
            'uː'
        ],
        hex: '#7030A0',
        label: 'u / ʊ',
        example: 'moon, book',
        category: 'vowel',
        neighbors: [
            '#FF3399',
            '#FCD116'
        ]
    },
    {
        sounds: [
            'oʊ',
            'əw'
        ],
        hex: '#FCD116',
        label: 'əʊ',
        example: 'go, boat',
        category: 'vowel',
        neighbors: [
            '#7030A0',
            '#23D300'
        ],
        note: 'SPEC CORRECTION (§9): true form is a tricolor gradient ' + '(#002B7F→#FCD116→#CE1126); no per-sound gradient support yet ' + '(see EiC-tehnic-spec.md §10.4) — using the midpoint colour as a ' + 'placeholder until that lands.'
    },
    {
        sounds: [
            'eɪ',
            'eỷ'
        ],
        hex: '#00246C',
        label: 'eɪ',
        example: 'day, name',
        category: 'vowel',
        neighbors: [
            '#4472C4'
        ],
        note: 'SPEC CORRECTION (§9): own dark blue, not a variant of e/ɛ.'
    },
    {
        sounds: [
            'ju',
            'ỷu',
            'juː'
        ],
        hex: '#833C0B',
        label: 'juː',
        example: 'cute, beauty',
        category: 'vowel',
        neighbors: [
            '#7030A0'
        ],
        note: 'SPEC ADDITION (§9): was previously unmapped.'
    },
    {
        sounds: [
            'aɪ',
            'aỷ'
        ],
        hex: '#4472C4',
        label: 'aɪ',
        example: 'night, my',
        category: 'vowel',
        neighbors: [
            '#00246C'
        ]
    },
    {
        sounds: [
            'aw',
            'aʊ'
        ],
        hex: '#23D300',
        label: 'aʊ',
        example: 'loud, cow',
        category: 'vowel',
        neighbors: [
            '#FCD116'
        ],
        note: 'SPEC CORRECTION (§9): split out of the aɪ blue group it used to share.'
    },
    {
        sounds: [
            'oɪ',
            'oỷ',
            'ɔɪ'
        ],
        hex: '#FF3399',
        label: 'ɔɪ',
        example: 'boy, coin',
        category: 'vowel',
        note: 'SPEC CORRECTION (§9): true form is a bicolor roz→roșu gradient; ' + 'needs seg-splitting support (spec §10.3/10.4) — using the roz ' + 'start-colour as a placeholder for now.'
    },
    {
        sounds: [
            'j',
            'ỷ'
        ],
        hex: '#CC0000',
        label: 'j / ỷ',
        example: 'yes',
        category: 'semivowel',
        note: 'SPEC CORRECTION (Tabelul 5/6): same red as i/ɪ, not its own hue.'
    },
    {
        sounds: [
            'w'
        ],
        hex: '#000000',
        label: 'w',
        example: 'we',
        category: 'semivowel',
        note: 'SPEC CORRECTION (Tabelul 5/6): negru like any consonant, not its own hue.'
    }
];
const COLOR_SILENT = '#000000';
const COLOR_CONSONANT = '#000000';
const COLOR_MAP = Object.fromEntries(_c1 = SOUND_COLORS.flatMap(_c = (entry)=>entry.sounds.map((sound)=>[
            sound,
            entry.hex
        ])));
_c2 = COLOR_MAP;
function getColor(sound) {
    if (!sound) return null;
    const k = sound.toLowerCase();
    if (COLOR_MAP[k]) return COLOR_MAP[k];
    if (k.length > 1 && COLOR_MAP[k[0]]) return COLOR_MAP[k[0]];
    return null;
}
const VOWEL_CHARS = new Set([
    ...'aeioujæɑɔəwɛɪʊʌyøœɒɝɚɜỷɐ'
]);
function isVowelSound(s) {
    return s.length > 0 && VOWEL_CHARS.has(s[0]);
}
const COLOR_LABELS = {};
for (const entry of SOUND_COLORS){
    if (!entry.example) continue;
    if (COLOR_LABELS[entry.hex]) continue; // first entry with an example wins a shared hex — see i/ɪ vs j/ỷ
    COLOR_LABELS[entry.hex] = {
        label: entry.label,
        example: entry.example
    };
}
const NEAR_COLOR_GROUPS = Object.fromEntries(_c4 = SOUND_COLORS.filter((e)=>e.neighbors?.length).map(_c3 = (e)=>[
        e.hex,
        e.neighbors
    ]));
_c5 = NEAR_COLOR_GROUPS;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "COLOR_MAP$Object.fromEntries$SOUND_COLORS.flatMap");
__turbopack_context__.k.register(_c1, "COLOR_MAP$Object.fromEntries");
__turbopack_context__.k.register(_c2, "COLOR_MAP");
__turbopack_context__.k.register(_c3, "NEAR_COLOR_GROUPS$Object.fromEntries$SOUND_COLORS.filter(e => e.neighbors?.length).map");
__turbopack_context__.k.register(_c4, "NEAR_COLOR_GROUPS$Object.fromEntries");
__turbopack_context__.k.register(_c5, "NEAR_COLOR_GROUPS");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/rules/overrides/vr-lexical-sets.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/rules/overrides/vr-lexical-sets.ts
//
// B_tehnic §6.2 — V-R forced-schwa lexical sets (near/bear/cure/poor/our/
// tower-flower/fire). Whole-span colour overrides for the vowel-run, plus
// (§6.1) "alb cu chenar negru" (white fill / black border) styling for the
// syllabic 'r' itself in a few representative spelling shapes.
//
// Splitting the vowel run from the syllabic-r glyph properly still needs
// align.ts/display.ts work — see EiC-tehnic-spec.md §10.5.
__turbopack_context__.s([
    "VR_LEXICAL_SET_RULES",
    ()=>VR_LEXICAL_SET_RULES
]);
const VR_LEXICAL_SET_RULES = [
    {
        id: 'vr-near',
        label: 'Near set (iər → i + ər)',
        enabled: true,
        pattern: '(near|interfere|ideal)',
        flags: 'i',
        group: 0,
        action: {
            color: '#CC0000'
        },
        priority: 200,
        notes: 'Roșu (#CC0000) — Near lexical set, §6.2.',
        testWords: [
            'near',
            'interfere'
        ]
    },
    {
        id: 'vr-care',
        label: 'Care/bare/aire set (eər → e + ər)',
        enabled: true,
        pattern: '(bear|hair|care|bare|aire|stare)',
        flags: 'i',
        group: 0,
        action: {
            color: '#EE5B00'
        },
        priority: 200,
        notes: 'Portocaliu (#EE5B00) — Care/bare/aire lexical set, §6.2.',
        testWords: [
            'bear',
            'hair'
        ]
    },
    {
        id: 'vr-cure',
        label: 'Cure set (jʊər → ỷu + ər)',
        enabled: true,
        pattern: '(cure|lure)',
        flags: 'i',
        group: 0,
        action: {
            color: '#833C0B'
        },
        priority: 200,
        notes: 'Maro (#833C0B) — Cure lexical set, §6.2.',
        testWords: [
            'cure',
            'lure'
        ]
    },
    {
        id: 'vr-poor',
        label: 'Poor set (ʊər → ʊ + ər)',
        enabled: true,
        pattern: '(poor|tour)',
        flags: 'i',
        group: 0,
        action: {
            color: '#7030A0'
        },
        priority: 200,
        notes: 'Violet (#7030A0) — Poor lexical set, §6.2.',
        testWords: [
            'poor',
            'tour'
        ]
    },
    {
        id: 'vr-our',
        label: 'Our set (aʊər → aw + ər, forced schwa)',
        enabled: true,
        pattern: '^(hour|our|sour|dour)s?$',
        flags: 'i',
        group: 0,
        action: {
            color: '#23D300'
        },
        priority: 200,
        notes: 'Verde neon (#23D300) — "our" lexical set (aw+ər fused). NOT the same handling as tower/flower — see vr-tower-flower.',
        testWords: [
            'hour',
            'our',
            'sour',
            'dour'
        ]
    },
    {
        id: 'vr-tower-flower',
        label: 'Tower/flower (aʊ + ə + r, NOT the our set)',
        enabled: true,
        pattern: '(tower|flower)',
        flags: 'i',
        group: 0,
        action: {
            color: '#23D300'
        },
        priority: 200,
        notes: 'Verde neon + negru + negru — has its own vowel grapheme (e) for /ə/ before r, unlike "our". Distinct per §6.2 note.',
        testWords: [
            'tower',
            'flower'
        ]
    },
    {
        id: 'vr-fire-tyre',
        label: 'Fire/tyre set (aɪər → aỷ + ər)',
        enabled: true,
        pattern: '(fire|tyre|ire)',
        flags: 'i',
        group: 0,
        action: {
            color: '#4472C4'
        },
        priority: 200,
        notes: 'Albastru mediu (#4472C4) — fire/tyre/ire, §6.2.',
        testWords: [
            'fire',
            'tyre',
            'ire'
        ]
    },
    // ── §6.1 — "alb cu chenar negru" styling for the syllabic 'r' itself
    // (as opposed to the vowel-run colour above). Wired up for 3
    // representative words to demonstrate each spelling shape (plain -r,
    // -re, single-letter stem); the remaining V-R words follow the same
    // pattern — see EiC-spec-integration-CHANGELOG.md for the full list.
    {
        id: 'vr-near-r',
        label: "Near — syllabic 'r' (alb/chenar negru)",
        enabled: true,
        pattern: '^(nea)(r)$',
        flags: 'i',
        group: 2,
        action: {
            syllabicR: true
        },
        priority: 205,
        notes: '§6.1 Tabelul 3 — /ər/ grapheme, white fill + black border.',
        testWords: [
            'near'
        ]
    },
    {
        id: 'vr-poor-r',
        label: "Poor — syllabic 'r' (alb/chenar negru)",
        enabled: true,
        pattern: '^(poo)(r)$',
        flags: 'i',
        group: 2,
        action: {
            syllabicR: true
        },
        priority: 205,
        notes: '§6.1 Tabelul 3 — /ər/ grapheme, white fill + black border.',
        testWords: [
            'poor'
        ]
    },
    {
        id: 'vr-fire-r',
        label: "Fire — syllabic 'r' (alb/chenar negru)",
        enabled: true,
        pattern: '^(fi)(r)(e)$',
        flags: 'i',
        group: 2,
        action: {
            syllabicR: true
        },
        priority: 205,
        notes: '§6.1 Tabelul 3 — /ər/ grapheme, white fill + black border.',
        testWords: [
            'fire'
        ]
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/rules/overrides/yw-exceptions.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/rules/overrides/yw-exceptions.ts
//
// B_tehnic Tabelul 5 — manual exceptions for words where the y/w/j semivowel
// grapheme falls on an unexpected letter and the general alignment rules in
// engine/align.ts pick the wrong one.
__turbopack_context__.s([
    "YW_EXCEPTION_RULES",
    ()=>YW_EXCEPTION_RULES
]);
const YW_EXCEPTION_RULES = [
    {
        id: 'oy-lawyer',
        label: 'lawyer — ỷ grapheme on w',
        enabled: true,
        pattern: '^lawyer$',
        flags: 'i',
        group: 0,
        action: {
            color: '#CC0000'
        },
        priority: 210,
        notes: 'Manual exception from Tabelul 5 — /ɔɪ/ = o+ỷ, grapheme falls on the "w".',
        testWords: [
            'lawyer'
        ]
    },
    {
        id: 'oy-freudian',
        label: 'Freudian — ủ grapheme',
        enabled: true,
        pattern: '^freudian$',
        flags: 'i',
        group: 0,
        action: {
            color: '#CC0000'
        },
        priority: 210,
        notes: 'Manual exception from Tabelul 5.',
        testWords: [
            'Freudian'
        ]
    },
    {
        id: 'oy-rooibos',
        label: 'rooibos — ủ grapheme',
        enabled: true,
        pattern: '^rooibos$',
        flags: 'i',
        group: 0,
        action: {
            color: '#CC0000'
        },
        priority: 210,
        notes: 'Manual exception from Tabelul 5.',
        testWords: [
            'rooibos'
        ]
    },
    {
        id: 'oy-buoyant-buoyed',
        label: 'buoyant/buoyed — ủ grapheme',
        enabled: true,
        pattern: '^(buoyant|buoyed)$',
        flags: 'i',
        group: 0,
        action: {
            color: '#CC0000'
        },
        priority: 210,
        notes: 'Manual exception from Tabelul 5.',
        testWords: [
            'buoyant',
            'buoyed'
        ]
    },
    {
        id: 'j-fjord',
        label: 'fjord — j̉ grapheme on j',
        enabled: true,
        pattern: '^fjord$',
        flags: 'i',
        group: 0,
        action: {
            color: '#CC0000'
        },
        priority: 210,
        notes: 'Only word in the spec where the semivowel grapheme itself is "j".',
        testWords: [
            'fjord'
        ]
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/rules/overrides/mute-e.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/rules/overrides/mute-e.ts
//
// B_tehnic §2.b/§2.c — expressly-mute 'e' cases the general silent-letter
// handling in engine/display.ts (isMute()) doesn't catch, because these e's
// have a genuine vowel-adjacent spelling shape rather than looking like a
// plain "silent consonant".
__turbopack_context__.s([
    "MUTE_E_RULES",
    ()=>MUTE_E_RULES
]);
const MUTE_E_RULES = [
    {
        id: 'mute-e-ed',
        label: 'Mute e in -ed when absent from IPA (e.g. cooed)',
        enabled: false,
        pattern: '([aeiou])(e)d$',
        flags: 'i',
        group: 2,
        action: {
            silent: true
        },
        priority: 150,
        notes: '§2.b "E mut prevăzut expres 1" — left disabled: fires on every -ed word ending in a vowel+e, including ones where this e IS pronounced. Needs a per-word IPA check upstream before enabling broadly.',
        testWords: [
            'cooed'
        ]
    },
    {
        id: 'mute-e-after-ow',
        label: 'Mute final e after ow (e.g. stowe)',
        enabled: true,
        pattern: '(ow)(e)$',
        flags: 'i',
        group: 2,
        action: {
            silent: true
        },
        priority: 150,
        notes: '§2.c "E mut prevăzut expres 2".',
        testWords: [
            'stowe'
        ]
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/rules/overrides/misc.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/rules/overrides/misc.ts
//
// One-off exceptions and mechanism demos that don't belong to a named
// category yet. If a group of 2+ related rules accumulates here, give it
// its own file the way vr-lexical-sets.ts / yw-exceptions.ts / mute-e.ts
// were split out.
__turbopack_context__.s([
    "MISC_RULES",
    ()=>MISC_RULES
]);
const MISC_RULES = [
    // Worked example (disabled): "island" — the 's' is silent. Targets capture
    // group 1 (the 's') and forces it grey, leaving the rest of the word
    // untouched. Kept here as a reference for writing your own rule.
    {
        id: 'island-s',
        label: "Silence the 's' in island",
        enabled: false,
        pattern: '^i(s)land$',
        flags: 'i',
        group: 1,
        action: {
            silent: true
        },
        priority: 100,
        notes: "General silent-pattern rules don't cover positional cases like this.",
        testWords: [
            'island'
        ]
    },
    // §2.f letterless-phoneme superscript mechanism demo. Disabled: the
    // spec's own example ("kethib") isn't in the lexicon; enable/adapt once a
    // real word needing this comes up.
    {
        id: 'superscript-example',
        label: 'Superscript for a letterless phoneme (mechanism demo)',
        enabled: false,
        pattern: '^kethib$',
        flags: 'i',
        group: 0,
        action: {
            superscript: 'v'
        },
        priority: 220,
        notes: '§2.f — /keˈti:v/ → kethi^v^bh: the /v/ has no letter of its own, spec shows it raised. Demonstrates the mechanism; not a general rule.',
        testWords: [
            'kethib'
        ]
    },
    {
        id: 'vr-goer',
        label: 'Goer (əʊər → əw + ə + r)',
        enabled: false,
        pattern: '^goer$',
        flags: 'i',
        group: 0,
        action: {
            color: '#FCD116'
        },
        priority: 200,
        notes: 'Left disabled — spec wants gradient tricolor + negru, not a flat colour; needs §10.4 gradient support before this is accurate. Placeholder colour only.',
        testWords: [
            'goer'
        ]
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/rules/overrides/apply.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/rules/overrides/apply.ts
//
// Runs the enabled RegexRules (in ascending `priority` order) against a word
// and applies each match's action to the overlapping RenderNode(s).
//
// Generic over any node shape that has `t` (grapheme text) and optionally
// `c` (colour), `u` (stressed flag) and `underlineOverride`. Works directly
// on the pipeline's RenderNode[] (WordRenderer.tsx) and on the /rules
// editor's adapted preview nodes without import coupling.
__turbopack_context__.s([
    "applyRegexOverrides",
    ()=>applyRegexOverrides
]);
const SILENT_HEX = '#000000';
function applyRegexOverrides(word, nodes, rules) {
    if (!rules?.length) return nodes;
    // Character range [start, end) covered by each node's grapheme text
    const ranges = [];
    let pos = 0;
    for (const n of nodes){
        const len = n.t?.length ?? 0;
        ranges.push([
            pos,
            pos + len
        ]);
        pos += len;
    }
    const out = nodes.map((n)=>({
            ...n
        }));
    const active = rules.filter((r)=>r.enabled && r.pattern).sort((a, b)=>a.priority - b.priority);
    for (const rule of active){
        // Ensure the 'd' flag (match.indices) is present, no duplicate flags
        const flags = Array.from(new Set([
            ...rule.flags ?? '',
            'd'
        ])).join('');
        let re;
        try {
            re = new RegExp(rule.pattern, flags);
        } catch  {
            continue; // invalid regex — skip rather than crash rendering
        }
        const m = re.exec(word);
        if (!m?.indices) continue;
        const groupIdx = rule.group ?? 0;
        const span = m.indices[groupIdx];
        if (!span) continue;
        const [gStart, gEnd] = span;
        if (gStart === gEnd) continue; // empty match — nothing to target
        for(let i = 0; i < out.length; i++){
            const [nStart, nEnd] = ranges[i];
            if (nEnd <= gStart || nStart >= gEnd) continue; // no overlap
            if (rule.action.color) out[i].c = rule.action.color;
            if (rule.action.silent) out[i].c = SILENT_HEX;
            if (rule.action.underline) out[i].underlineOverride = rule.action.underline;
            if (rule.action.syllabicR) out[i].syllabicOverride = true;
            if (rule.action.superscript) out[i].superscriptOverride = rule.action.superscript;
        }
    }
    return out;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/rules/overrides/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "REGEX_RULES",
    ()=>REGEX_RULES
]);
// src/lib/rules/overrides/index.ts
//
// Combines every per-word regex override into one REGEX_RULES list (order
// doesn't matter — each rule carries its own `priority`) and re-exports the
// types + applyRegexOverrides() so consumers only need one import.
//
// TO ADD A RULE: put it in the file for its category (vr-lexical-sets.ts,
// yw-exceptions.ts, mute-e.ts), or misc.ts if it's a genuine one-off. Then
// it shows up here automatically.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$overrides$2f$vr$2d$lexical$2d$sets$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/overrides/vr-lexical-sets.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$overrides$2f$yw$2d$exceptions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/overrides/yw-exceptions.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$overrides$2f$mute$2d$e$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/overrides/mute-e.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$overrides$2f$misc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/overrides/misc.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$overrides$2f$apply$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/overrides/apply.ts [app-client] (ecmascript)");
;
;
;
;
const REGEX_RULES = [
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$overrides$2f$vr$2d$lexical$2d$sets$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VR_LEXICAL_SET_RULES"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$overrides$2f$yw$2d$exceptions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YW_EXCEPTION_RULES"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$overrides$2f$mute$2d$e$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MUTE_E_RULES"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$overrides$2f$misc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MISC_RULES"]
];
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/ruleConfig.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_CONFIG",
    ()=>DEFAULT_CONFIG,
    "diffConfigs",
    ()=>diffConfigs,
    "generatePrompt",
    ()=>generatePrompt
]);
// ruleConfig.ts
// Bridges the canonical rule data (src/lib/rules/) with the /rules editor
// UI: builds the editable RuleConfig snapshot, diffs an edited copy against
// the original, and turns that diff into a change-request prompt.
//
// This file does NOT define colours or regex rules itself any more — it
// imports them from src/lib/rules/. See that folder's README for the map of
// "I want to change X, where do I go".
//
// NOT HERE: underline and silent-letter behaviour. Earlier versions of this
// file had `UnderlineRules`/`SilentRules` config objects (monosyllabic,
// alwaysSilentPatterns, etc.) that LOOKED editable here but were never
// actually read by the rendering engine — editing them in the UI did
// nothing to the live site. They've been removed rather than left as a
// trap. That logic is genuine algorithm, not independent toggles (see the
// "DOGMA" comments in engine/align.ts and engine/display.ts) — if you want
// to change how underlining or silent-letter detection works, that's where
// to go, and if you want a NEW independent toggle for one of them, ask for
// it to be added properly rather than assuming one already exists.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/colors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$overrides$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/rules/overrides/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$overrides$2f$apply$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/overrides/apply.ts [app-client] (ecmascript)");
;
;
;
const DEFAULT_CONFIG = {
    colors: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SOUND_COLORS"],
    regexRules: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$overrides$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["REGEX_RULES"]
};
function diffConfigs(base, modified) {
    const diffs = [];
    // Colors
    base.colors.forEach((entry, i)=>{
        const mod = modified.colors[i];
        if (!mod) return;
        if (entry.hex !== mod.hex) diffs.push({
            section: 'ColorMap',
            field: entry.label,
            old: entry.hex,
            new: mod.hex
        });
        if (entry.category !== mod.category) diffs.push({
            section: 'ColorMap',
            field: `${entry.label} category`,
            old: entry.category,
            new: mod.category
        });
        const oldSounds = entry.sounds.join(', ');
        const newSounds = mod.sounds.join(', ');
        if (oldSounds !== newSounds) diffs.push({
            section: 'ColorMap',
            field: `${entry.label} sounds`,
            old: oldSounds,
            new: newSounds
        });
    });
    // Regex rules — diff by id so additions/edits/removals are all visible
    const baseRules = base.regexRules ?? [];
    const modRules = modified.regexRules ?? [];
    const baseById = new Map(baseRules.map((r)=>[
            r.id,
            r
        ]));
    const modById = new Map(modRules.map((r)=>[
            r.id,
            r
        ]));
    for (const [id, mod] of modById){
        const orig = baseById.get(id);
        if (!orig) {
            diffs.push({
                section: 'RegexRules',
                field: `${id} (new)`,
                old: '—',
                new: `${mod.pattern} → ${JSON.stringify(mod.action)}`
            });
        } else if (JSON.stringify(orig) !== JSON.stringify(mod)) {
            diffs.push({
                section: 'RegexRules',
                field: id,
                old: `${orig.pattern} → ${JSON.stringify(orig.action)}${orig.enabled ? '' : ' (disabled)'}`,
                new: `${mod.pattern} → ${JSON.stringify(mod.action)}${mod.enabled ? '' : ' (disabled)'}`
            });
        }
    }
    for (const [id, orig] of baseById){
        if (!modById.has(id)) diffs.push({
            section: 'RegexRules',
            field: `${id} (removed)`,
            old: `${orig.pattern} → ${JSON.stringify(orig.action)}`,
            new: '—'
        });
    }
    return diffs;
}
function generatePrompt(diffs, testCases, config) {
    const date = new Date().toISOString().split('T')[0];
    const lines = [];
    lines.push(`## EiC Rule Change Request — ${date}`);
    lines.push('');
    if (diffs.length > 0) {
        lines.push('### Rule Changes');
        const bySection = {};
        for (const d of diffs){
            if (!bySection[d.section]) bySection[d.section] = [];
            bySection[d.section].push(d);
        }
        for (const [section, ds] of Object.entries(bySection)){
            lines.push(`\n**${section}:**`);
            for (const d of ds)lines.push(`- ${d.field}: \`${d.old}\` → \`${d.new}\``);
        }
        lines.push('');
    }
    if (testCases.length > 0) {
        lines.push('### Test Cases');
        for (const tc of testCases){
            lines.push(`\n**"${tc.word}"**`);
            if (tc.current) lines.push(`- Current render: ${tc.current}`);
            if (tc.desired) lines.push(`- Should render:  ${tc.desired}`);
            if (tc.note) lines.push(`- Note: ${tc.note}`);
        }
        lines.push('');
    }
    lines.push('### Full Config Snapshot');
    lines.push('```json');
    lines.push(JSON.stringify(config, null, 2));
    lines.push('```');
    return lines.join('\n');
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/engine/segment.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// engine/segment.ts
// Turns a raw IPA string into Seg[] — phoneme-sized chunks with a display
// form, vowel flag, and whether the chunk carries primary stress.
//
// TRANSFORMS is intentionally a flat priority list, longest-pattern-first:
// to change how a sound is displayed, edit one line here. Nothing else in
// the engine needs to change.
__turbopack_context__.s([
    "segment",
    ()=>segment
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/colors.ts [app-client] (ecmascript)");
;
const TRANSFORMS = [
    // Schwa+R
    [
        'ɜːr',
        'ər'
    ],
    [
        'ɝːr',
        'ər'
    ],
    [
        'ɚːr',
        'ər'
    ],
    [
        'ɜr',
        'ər'
    ],
    [
        'ɝr',
        'ər'
    ],
    [
        'ɚr',
        'ər'
    ],
    [
        'ɜː',
        'ər'
    ],
    [
        'ɝː',
        'ər'
    ],
    [
        'ɚː',
        'ər'
    ],
    [
        'ɜ',
        'ər'
    ],
    [
        'ɝ',
        'ər'
    ],
    [
        'ɚ',
        'ər'
    ],
    // OR
    [
        'ɔːr',
        'or'
    ],
    [
        'ɔr',
        'or'
    ],
    [
        'ɔɹ',
        'or'
    ],
    // Diphthongs
    [
        'ɔɪ',
        'oỷ'
    ],
    [
        'oɪ',
        'oỷ'
    ],
    [
        'aɪ',
        'aỷ'
    ],
    [
        'eɪ',
        'eỷ'
    ],
    [
        'aʊ',
        'aw'
    ],
    [
        'əʊ',
        'əw'
    ],
    [
        'oʊ',
        'əw'
    ],
    // ER
    [
        'ɛːr',
        'er'
    ],
    [
        'ɛr',
        'er'
    ],
    [
        'ɛɹ',
        'er'
    ],
    // Long vowels
    [
        'iː',
        'i'
    ],
    [
        'uː',
        'u'
    ],
    [
        'ɑː',
        'ɑ'
    ],
    [
        'ɔː',
        'ɔ'
    ],
    [
        'æː',
        'æ'
    ],
    [
        'eː',
        'e'
    ],
    // Consonant digraphs
    [
        'tʃ',
        'ch'
    ],
    [
        'dʒ',
        'j'
    ],
    [
        'ŋɡ',
        'ng'
    ],
    [
        'ŋg',
        'ng'
    ],
    [
        'ŋ',
        'ng'
    ],
    [
        'θ',
        'th'
    ],
    [
        'ð',
        'dh'
    ],
    [
        'ʃ',
        'sh'
    ],
    [
        'ɹ',
        'r'
    ],
    // SPEC ADDITIONS (B_tehnic §8 Tabel 1): /gz/ ("example"), /kʃ/ ("sexual").
    // Must come before any single-char consonant fallback below.
    [
        'ɡz',
        'gz'
    ],
    [
        'gz',
        'gz'
    ],
    [
        'kʃ',
        'kʃ'
    ],
    // SPEC ADDITION (§9 Tabel 2): /juː/ ("cute, beauty") — must come before
    // the plain 'j' identity mapping below or it will never be reached.
    [
        'juː',
        'ỷu'
    ],
    [
        'jʊ',
        'ỷu'
    ],
    [
        'ju',
        'ỷu'
    ],
    // j/w/ỷ — vowel-adjacent sounds, no special "semivowel" category.
    // isVowelSound() already returns true for these (see rules/colors.ts);
    // align.ts treats them exactly like any other vowel sound.
    [
        'j',
        'j'
    ],
    [
        'w',
        'w'
    ],
    [
        'ỷ',
        'ỷ'
    ],
    [
        'ɐ',
        'ə'
    ],
    [
        'ɑ',
        'ɑ'
    ],
    [
        'ɒ',
        'ɒ'
    ],
    [
        'ɛ',
        'ɛ'
    ],
    [
        'ʌ',
        'ʌ'
    ],
    [
        'ʊ',
        'ʊ'
    ],
    [
        'ə',
        'ə'
    ]
];
const STRIP = new Set([
    ...'/,.ˌːˑ'
]);
const VOWEL_FALLBACK = new Set([
    ...'aeioujæɑɔəwɛɪʊʌyøœɒỷɐ'
]);
/**
 * Stress anchoring needs a DIFFERENT notion of "vowel" than sound
 * classification does. VOWEL_CHARS (rules/colors.ts) correctly includes j/w/ỷ —
 * they're vowel-adjacent sounds for coloring purposes. But a glide can never
 * itself carry primary stress; only a true syllable nucleus can. Using
 * VOWEL_CHARS here caused stress to land on a glide instead of skipping past
 * it to the real vowel (e.g. "question" /ˈkwɛstʃən/ — stress marker before
 * "kw" should skip both consonant 'k' AND glide 'w' to land on 'ɛ', but
 * VOWEL_CHARS treats 'w' as a stop-here vowel and the scan halted early).
 */ const STRESS_ANCHOR_CHARS = new Set([
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VOWEL_CHARS"]
].filter((c)=>c !== 'j' && c !== 'w' && c !== 'ỷ' && c !== 'y'));
function findStressPos(rawIpa) {
    const ipa = [
        ...rawIpa
    ].filter((c)=>!STRIP.has(c)).join('').trim();
    const stressAt = ipa.indexOf('ˈ');
    const clean = ipa.replace(/ˈ/g, '');
    if (stressAt < 0) return {
        clean,
        stressPos: -1
    };
    // If the char right after the marker is a true vowel, anchor there.
    // Otherwise scan forward (skipping consonants AND glides) to the first
    // true vowel.
    let j = stressAt + 1;
    if (j >= ipa.length) return {
        clean,
        stressPos: -1
    };
    const isAnchorChar = (ch)=>ch && STRESS_ANCHOR_CHARS.has(ch);
    if (isAnchorChar(ipa[j])) return {
        clean,
        stressPos: j - 1
    };
    let k = j;
    while(k < ipa.length && !isAnchorChar(ipa[k]))k++;
    return {
        clean,
        stressPos: k < ipa.length ? k - 1 : -1
    };
}
function segment(rawIpa) {
    const { clean, stressPos } = findStressPos(rawIpa);
    const result = [];
    let i = 0;
    while(i < clean.length){
        let matched = false;
        for (const [pat, rep] of TRANSFORMS){
            if (i + pat.length > clean.length) continue;
            if (clean.slice(i, i + pat.length) !== pat) continue;
            const accented = stressPos >= 0 && stressPos >= i && stressPos < i + pat.length;
            result.push({
                ipa: pat,
                display: rep,
                isVowel: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isVowelSound"])(rep),
                accented
            });
            i += pat.length;
            matched = true;
            break;
        }
        if (!matched) {
            const c = clean[i];
            const accented = stressPos === i;
            const isVowel = VOWEL_FALLBACK.has(c.toLowerCase());
            result.push({
                ipa: c,
                display: c,
                isVowel,
                accented
            });
            i++;
        }
    }
    // Fallback: accent first vowel if nothing caught the stress marker
    if (stressPos >= 0 && result.every((s)=>!s.accented)) {
        let cum = 0;
        for(let k = 0; k < result.length; k++){
            if (cum >= stressPos && result[k].isVowel) {
                result[k] = {
                    ...result[k],
                    accented: true
                };
                break;
            }
            cum += result[k].ipa.length;
        }
    }
    return result;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/engine/align.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// engine/align.ts
// Maps Seg[] (IPA phonemes after transforms) onto the word's letters.
//
// TWO RULES drive this, not a dictionary:
//
// 1. CONSONANT_SPELLINGS table: each IPA display (e.g. 'sh', 'k', 'r') lists
//    every letter sequence that can spell it in English, longest first.
//    Handles: ti/ci→sh ("nation"), ch→k ("school"), rr/ll/nn/tt ("current",
//    "better"), ph/gh→f ("phone","enough"), kn/gn→n ("knight"), tch→ch, etc.
//
// 2. R-CONTROLLED VOWEL rule: after consuming vowel letters, if the next
//    letter is 'r' AND the next phoneme is NOT /r/, absorb the 'r' into this
//    vowel node. Handles: er/ir/or/ur/ar as single phoneme ("inter-", "her").
//
// With these two rules almost all English spelling irregularities are covered
// without touching a word list.
__turbopack_context__.s([
    "GRAPHIC_VOWELS",
    ()=>GRAPHIC_VOWELS,
    "align",
    ()=>align,
    "isGraphicCons",
    ()=>isGraphicCons,
    "isGraphicVowel",
    ()=>isGraphicVowel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/colors.ts [app-client] (ecmascript)");
;
const GRAPHIC_VOWELS = new Set([
    ...'aeiou',
    ...'AEIOU'
]);
function isGraphicVowel(c) {
    return GRAPHIC_VOWELS.has(c);
}
function isGraphicCons(c) {
    return !GRAPHIC_VOWELS.has(c);
}
// ── Glide sounds ──────────────────────────────────────────────────────────────
const GLIDE_DISPLAYS = new Set([
    'j',
    'w',
    'ỷ'
]);
// IPA displays that are vowel sounds (used to decide vowel-run width)
const VOWEL_DISPLAY_STARTS = new Set([
    ...'aeiouæɑɔəɛɪʊʌỷyw'
]);
function isVowelDisplay(d) {
    return d.length > 0 && VOWEL_DISPLAY_STARTS.has(d[0]);
}
// ── Consonant spelling table ──────────────────────────────────────────────────
// Key   = IPA display string (after TRANSFORMS in segment.ts)
// Value = letter sequences that spell it, LONGEST FIRST (greedy match wins)
//
// Adding a new rule: just add a line here. No other file needs to change.
const CONSONANT_SPELLINGS = new Map([
    // Affricates & fricatives
    [
        'sh',
        [
            'tsch',
            'sch',
            'ssh',
            'sh',
            'ti',
            'ci',
            'si'
        ]
    ],
    [
        'ch',
        [
            'tch',
            'ch'
        ]
    ],
    [
        'j',
        [
            'dge',
            'dg',
            'j'
        ]
    ],
    [
        'zh',
        [
            'si',
            'zi',
            'z'
        ]
    ],
    [
        'ng',
        [
            'ngg',
            'ng'
        ]
    ],
    [
        'th',
        [
            'th'
        ]
    ],
    [
        'dh',
        [
            'th'
        ]
    ],
    // Stops
    [
        'k',
        [
            'ck',
            'kk',
            'ch',
            'kh',
            'k',
            'c',
            'q'
        ]
    ],
    [
        'g',
        [
            'gg',
            'gh',
            'g'
        ]
    ],
    [
        'ɡ',
        [
            'gg',
            'g'
        ]
    ],
    [
        't',
        [
            'tt',
            't'
        ]
    ],
    [
        'd',
        [
            'dd',
            'd'
        ]
    ],
    [
        'p',
        [
            'pp',
            'p'
        ]
    ],
    [
        'b',
        [
            'bb',
            'b'
        ]
    ],
    // Fricatives
    [
        'f',
        [
            'ph',
            'gh',
            'ff',
            'f'
        ]
    ],
    [
        'v',
        [
            'vv',
            'v'
        ]
    ],
    [
        's',
        [
            'ss',
            's'
        ]
    ],
    [
        'z',
        [
            'zz',
            'z',
            's'
        ]
    ],
    [
        'h',
        [
            'wh',
            'h'
        ]
    ],
    // Nasals & liquids
    [
        'n',
        [
            'kn',
            'gn',
            'nn',
            'n'
        ]
    ],
    [
        'm',
        [
            'mm',
            'm'
        ]
    ],
    [
        'l',
        [
            'll',
            'l'
        ]
    ],
    [
        'r',
        [
            'rr',
            'wr',
            'rh',
            'r'
        ]
    ],
    // Glides (as graphic consonants — position-based edge cases)
    [
        'w',
        [
            'wh',
            'w'
        ]
    ],
    // SPEC ADDITIONS (B_tehnic §8 Tabel 1) — not previously in this table.
    [
        'x',
        [
            'h'
        ]
    ],
    [
        'gz',
        [
            'x'
        ]
    ],
    [
        'kʃ',
        [
            'x'
        ]
    ]
]);
function tryConsSpellings(display, word, pos) {
    const spellings = CONSONANT_SPELLINGS.get(display);
    if (!spellings) return '';
    const wLow = word.toLowerCase();
    for (const sp of spellings){
        if (wLow.startsWith(sp, pos)) return word.slice(pos, pos + sp.length);
    }
    return '';
}
// ── Vowel consumption ─────────────────────────────────────────────────────────
function consumeVowel(display, word, pos, nextDisplay) {
    const wLen = word.length;
    // Glide sound: consume exactly 1 letter (it may be a consonant-looking letter
    // like 'u' in "queen" or 'o' in "one") — never extend into the adjacent vowel run
    if (GLIDE_DISPLAYS.has(display)) {
        const consumed = pos < wLen ? word[pos] : '';
        return {
            consumed,
            newPos: pos + (consumed ? 1 : 0)
        };
    }
    // True vowel: consume the consecutive vowel-letter run.
    //
    // CONSECUTIVE-VOWEL RULE: if the next phoneme is also a plain vowel
    // (not r-colored like 'ər'), take only 1 letter — the rest belong to
    // that next phoneme ("ia" in "association" = i + eɪ, not one run).
    // R-colored vowels like 'ər' are excluded because they follow a diphthong
    // without competing for the same letters ("power": aw→'ow', ər→'er').
    const R_COLORED = new Set([
        'ər',
        'er',
        'ar',
        'or',
        'ur',
        'ɪr',
        'ɛr'
    ]);
    const isPlainVowelDisplay = (d)=>d.length > 0 && VOWEL_DISPLAY_STARTS.has(d[0]) && !R_COLORED.has(d);
    const start = pos;
    if (nextDisplay && isPlainVowelDisplay(nextDisplay)) {
        // Consecutive plain vowels: 1 letter each, no extensions.
        if (pos < wLen && isGraphicVowel(word[pos])) pos++;
        else if (pos < wLen && 'ywYW'.includes(word[pos])) pos++;
    } else {
        // Full vowel run
        while(pos < wLen && isGraphicVowel(word[pos]))pos++;
        // Track graphic vowels consumed BEFORE extensions — used by r-guard below.
        const graphicVowelCount = pos - start;
        // Y/W fallback: if the run consumed nothing (no a/e/i/o/u at this position),
        // try consuming one 'y' or 'w'. Handles vowel phonemes whose only available
        // letter is y/w: "type"→aɪ at 'y', "happy"→i at 'y', "few"→u at 'w'.
        if (graphicVowelCount === 0 && pos < wLen && 'ywYW'.includes(word[pos])) {
            pos++;
        }
        // Trailing w/y digraph (ow/aw/ay/oy/ey) — only when run had a real vowel start
        if (graphicVowelCount > 0 && pos < wLen && 'wyWY'.includes(word[pos])) pos++;
        // Silent 'gh' after vowel run (night, high, caught, though).
        if (pos > start && pos + 1 < wLen && (word[pos] === 'g' || word[pos] === 'G') && (word[pos + 1] === 'h' || word[pos + 1] === 'H') && nextDisplay !== 'f' && nextDisplay !== 'g') {
            pos += 2;
        }
        // R-controlled absorption:
        // a) Display IS r-colored (ər, er…): always absorb the 'r' letter.
        // b) Medial 'r' before a consonant: absorb ONLY when the vowel consumed
        //    ≤1 graphic vowel letter. This handles "inter-" (1 letter 'e' → absorb 'r')
        //    but NOT "colours" (2 letters 'ou' → 'r' stays mute/silent).
        const nextIsConsonant = nextDisplay !== undefined && !isPlainVowelDisplay(nextDisplay) && !R_COLORED.has(nextDisplay) && nextDisplay !== 'r';
        if (pos < wLen && (word[pos] === 'r' || word[pos] === 'R') && nextDisplay !== 'r') {
            if (R_COLORED.has(display) || nextIsConsonant && graphicVowelCount <= 1) pos++;
        }
    }
    return {
        consumed: word.slice(start, pos),
        newPos: pos
    };
}
function align(word, segs) {
    if (segs.length === 0) return [
        {
            t: word,
            s: '',
            c: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"],
            u: false,
            x: false
        }
    ];
    const nodes = [];
    let pos = 0;
    const wLen = word.length;
    for(let si = 0; si < segs.length; si++){
        const { ipa, display, isVowel, accented } = segs[si];
        const nextDisplay = si + 1 < segs.length ? segs[si + 1].display : undefined;
        // Latent phoneme — no letters consumed (syllabic marker, zero-width joiner)
        if (!display || display === '\u200d') {
            nodes.push({
                t: '',
                s: display ?? '',
                c: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"],
                u: false,
                x: true
            });
            continue;
        }
        let consumed = '';
        if (isVowel) {
            const r = consumeVowel(display, word, pos, nextDisplay);
            consumed = r.consumed;
            pos = r.newPos;
        } else {
            // 1. Try spelling table (handles ti→sh, rr→r, ch→k, ph→f, kn→n, etc.)
            const fromTable = tryConsSpellings(display, word, pos);
            if (fromTable) {
                consumed = fromTable;
                pos += fromTable.length;
            } else if (pos < wLen && isGraphicCons(word[pos])) {
                // 2. Generic fallback: 1 letter (2 for IPA digraphs like th, ng)
                consumed = word[pos++];
                if (ipa.length >= 2 && pos < wLen && isGraphicCons(word[pos])) consumed += word[pos++];
            }
        // 3. Nothing matched → consumed stays '' (truly latent phoneme)
        }
        const color = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getColor"])(display);
        const isCons = !color;
        const isStressed = accented && isVowel;
        nodes.push({
            t: consumed,
            s: display,
            c: color ?? (isCons ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"]),
            u: isStressed,
            x: isCons
        });
    }
    // Remaining letters → silent tail
    if (pos < wLen) nodes.push({
        t: word.slice(pos),
        s: '',
        c: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"],
        u: false,
        x: false
    });
    return nodes;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/engine/score.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// engine/score.ts
// Word-level properties derived from a finished RenderNode[] — used to pick
// UK vs US variant and to populate cache.db's summary columns. Pure
// functions, no dependency on align.ts/segment.ts internals.
__turbopack_context__.s([
    "extractProps",
    ()=>extractProps,
    "scoreNodes",
    ()=>scoreNodes
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/colors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$align$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/align.ts [app-client] (ecmascript)");
;
;
function scoreNodes(nodes) {
    return nodes.filter((n)=>n.t && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"]).reduce((sum, n)=>sum + n.t.length, 0);
}
function extractProps(nodes) {
    const colorCounts = {};
    let hasSilent = false;
    let hasStress = false;
    let syllableCount = 0;
    for (const n of nodes){
        if (n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.t && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$align$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isGraphicCons"])(n.t)) hasSilent = true;
        if (n.u) hasStress = true;
        if (n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] && n.t) {
            syllableCount++;
            const c = colorCounts[n.c] ?? 0;
            colorCounts[n.c] = c + n.t.length;
        }
    }
    const entries = Object.entries(colorCounts);
    const dominantColor = entries.length > 0 ? entries.sort((a, b)=>b[1] - a[1])[0][0] : null;
    return {
        dominantColor,
        hasSilent,
        hasStress,
        syllableCount: Math.max(1, syllableCount)
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/engine/display.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

// engine/display.ts
// The ONLY place that decides what a node looks like on screen.
// WordRenderer calls resolveDisplay() and just renders the result —
// no classification logic should live in the component at all.
//
// Input:  RenderNode[] after applyRegexOverrides() has run
// Output: DisplayNode[] — one entry per node, all display decisions made
__turbopack_context__.s([
    "DIPHTHONG_END",
    ()=>DIPHTHONG_END,
    "DIPHTHONG_START",
    ()=>DIPHTHONG_START,
    "SYLLABIC_MARKER",
    ()=>SYLLABIC_MARKER,
    "resolveDisplay",
    ()=>resolveDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/colors.ts [app-client] (ecmascript)");
;
;
const SYLLABIC_MARKER = '\u200d' // must match renderNode.ts
;
const DIPHTHONG_START = '#FF3399';
const DIPHTHONG_END = '#CC0000';
const SCHWA = '#888888';
// B_tehnic §9 Tabel 2 — four short/lax simple vowels get a 70%→30% gradient
// into black instead of a flat fill: /ʌ/, /ɪ/, /ɒ,ɔ/ (LOT/CLOTH-THOUGHT
// merger, §5.3 — both symbols may appear depending on the lexicon source),
// /ʊ/. Their long/tense counterparts (ɑ, i, o "door/force", u) stay solid —
// they're already distinct display keys post-TRANSFORMS, so no ambiguity.
const SIMPLE_GRADIENT_SOUNDS = new Set([
    'ʌ',
    'ɪ',
    'ɒ',
    'ɔ',
    'ʊ'
]);
function simpleGradientHex(sound) {
    if (!SIMPLE_GRADIENT_SOUNDS.has(sound)) return null;
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_MAP"][sound] ?? null;
}
// 70/30 split, not a smooth 0→100 blend: solid colour through 70% of the
// grapheme's width, then a quick fade to black in the last 30%.
function simpleGradientCss(hex) {
    return `linear-gradient(to right, ${hex} 0%, ${hex} 70%, #000000 100%)`;
}
// Letters that are graphically consonants — used to detect the
// "silent consonant in vowel position" case (e.g. the 'k' in 'knight'
// gets a vowel color from the engine but its letters are all consonants,
// meaning it is mute, not a vowel).
// w/y included: they can appear as graphic letters inside consonant
// positions and should not be mistaken for real vowel runs there.
const GRAPHIC_CONSONANT_LETTERS = new Set('bcdfghjklmnpqrstvwxyz');
function isGraphicConsonant(t) {
    return t.length > 0 && [
        ...t.toLowerCase()
    ].every((c)=>GRAPHIC_CONSONANT_LETTERS.has(c));
}
function isMute(n) {
    if (n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"]) return true;
    if (!n.t || n.t.length === 0) return false;
    // A node is mute when the engine gave it a vowel color (meaning it carries
    // a vowel phoneme) but its letters are all graphic consonants — classic
    // "silent consonant" case, e.g. 'k' in 'knight'.
    const hasVowelColor = n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] && n.c !== '' && n.c !== undefined;
    if (hasVowelColor && isGraphicConsonant(n.t)) return true;
    return false;
}
function isVowelNode(n) {
    if (!n.t || n.t.length === 0) return false;
    if (isMute(n)) return false;
    if (n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] || n.x || n.c === '') return false;
    return true;
}
// ── Syllabic / diphthong glide classification ─────────────────────────────────
// Nodes with SYLLABIC_MARKER as their sound are either:
//   trueSyllabic  — a syllabic consonant (preceded by schwa colour)
//   diphthongGlide — the glide part of a diphthong
function classifySyllabic(nodes) {
    const trueSyllabic = new Set();
    const diphthongGlide = new Set();
    for(let i = 0; i < nodes.length; i++){
        if (nodes[i].s !== SYLLABIC_MARKER) continue;
        const prev = i > 0 ? nodes[i - 1] : null;
        if (prev && prev.c === SCHWA) trueSyllabic.add(i);
        else diphthongGlide.add(i);
    }
    return {
        trueSyllabic,
        diphthongGlide
    };
}
// ── Diphthong gradient ────────────────────────────────────────────────────────
// A diphthong glide and the vowel immediately before it both get the gradient.
function buildDiphthongSet(nodes, diphthongGlide) {
    const result = new Set();
    for(let i = 0; i < nodes.length; i++){
        if (!diphthongGlide.has(i)) continue;
        if (i > 0 && isVowelNode(nodes[i - 1]) && nodes[i].t.length > 0) {
            result.add(i - 1);
            result.add(i);
        }
    }
    return result;
}
// ── Underline run ─────────────────────────────────────────────────────────────
// Starts at a stressed vowel node (n.u === true) and extends rightward
// through consecutive vowels, glides, and diphthong glides.
// Monosyllabic words never have n.u === true from the engine, so they
// naturally produce no underline here — no explicit monosyllabic check needed.
function buildUnderlineSet(nodes, diphthongGlide) {
    const result = new Set();
    for(let i = 0; i < nodes.length; i++){
        const n = nodes[i];
        if (n.underlineOverride === 'deny') continue;
        // Manual force override (from regex rules) — still never underline consonants
        if (n.underlineOverride === 'force' && !n.x) {
            result.add(i);
            continue;
        }
        // DOGMA: only a stressed vowel node anchors the underline.
        // Consonants (n.x === true) are never underlined, period.
        if (!n.u || n.x || !isVowelNode(n) || isMute(n)) continue;
        result.add(i);
        // Extend ONLY through immediately following diphthong glide nodes.
        // Do NOT extend into the next syllable's vowel — that would be a
        // different phoneme, different syllable, wrong underline span.
        let j = i + 1;
        while(j < nodes.length){
            const next = nodes[j];
            if (next.underlineOverride === 'deny') break;
            if (diphthongGlide.has(j) && !next.x) {
                result.add(j);
                j++;
            } else {
                break;
            }
        }
    }
    return result;
}
function resolveDisplay(nodes) {
    const { trueSyllabic, diphthongGlide } = classifySyllabic(nodes);
    const diphthongSet = buildDiphthongSet(nodes, diphthongGlide);
    const underlineSet = buildUnderlineSet(nodes, diphthongGlide);
    // Build per-run underline color: anchor to first real vowel in the run.
    const underlineColorMap = new Map();
    let runStart = null;
    for(let i = 0; i <= nodes.length; i++){
        const hit = i < nodes.length && underlineSet.has(i);
        if (hit && runStart === null) runStart = i;
        if ((!hit || i === nodes.length) && runStart !== null) {
            let anchorColor;
            for(let k = runStart; k < i; k++){
                const rn = nodes[k];
                if (isVowelNode(rn) && !isMute(rn)) {
                    anchorColor = rn.c;
                    break;
                }
            }
            if (!anchorColor) {
                const rn = nodes[runStart];
                anchorColor = rn.c && rn.c !== '' ? rn.c : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"];
            }
            for(let j = runStart; j < i; j++)underlineColorMap.set(j, anchorColor);
            runStart = null;
        }
    }
    return nodes.map((n, i)=>{
        const isTrueSyl = trueSyllabic.has(i);
        const isGlide = diphthongGlide.has(i);
        const isDiph = diphthongSet.has(i);
        const isUnder = underlineSet.has(i);
        const isSylVR = !!n.syllabicOverride // B_tehnic §6.1 — alb cu chenar negru
        ;
        const mute = isMute(n) || isGlide && !isDiph;
        const simpleHex = !isDiph && !isTrueSyl && !isSylVR && !mute ? simpleGradientHex(n.s) : null;
        const runAnchor = underlineColorMap.get(i) ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"];
        // Final color decision — one place, one pass, explicit priority:
        let color;
        let gradientCss;
        if (isSylVR) color = '#FFFFFF'; // forced V-R syllabic (white fill)
        else if (isTrueSyl) color = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"]; // syllabic consonant
        else if (isDiph) color = isUnder && !mute // diphthong with underline → solid
         ? runAnchor : 'transparent'; // gradient handled via gradient flag
        else if (simpleHex) {
            // B_tehnic §9 — stressed occurrence renders solid (matches the
            // existing diphthong stressed-underline behaviour); unstressed
            // occurrences get the 70/30 gradient into black.
            if (isUnder && !mute) {
                color = runAnchor;
            } else {
                color = 'transparent';
                gradientCss = simpleGradientCss(simpleHex);
            }
        } else if (mute) color = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"];
        else color = n.c && n.c !== '' ? n.c : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"];
        if (isUnder && !isTrueSyl && !isSylVR && !mute) color = runAnchor;
        return {
            t: n.t ?? '',
            color,
            underline: isUnder && !isTrueSyl && !isSylVR && !mute,
            gradient: isDiph && !(isUnder && !mute) || !!gradientCss,
            gradientCss,
            mute,
            syllabic: isTrueSyl,
            syllabicVR: isSylVR,
            superscript: n.superscriptOverride ?? '',
            underlineColor: runAnchor,
            sound: n.s && n.s !== SYLLABIC_MARKER ? n.s : ''
        };
    });
}
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/engine/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "processIpa",
    ()=>processIpa
]);
// engine/index.ts
// PUBLIC API — the only file other modules should import from.
// `import { processIpa, scoreNodes, extractProps } from './engine'`
// `import type { RenderNode } from './engine'`
//
// Signature-compatible with the old pipeline.ts on purpose: db.ts only needs
// its import path changed, nothing else.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$segment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/segment.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$align$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/align.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/colors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$score$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/score.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/engine/display.ts [app-client] (ecmascript) <locals>");
;
;
;
function processIpa(word, rawIpa) {
    if (!rawIpa?.trim()) {
        return [
            {
                t: word,
                s: '',
                c: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"],
                u: false,
                x: false
            }
        ];
    }
    const segs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$segment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["segment"])(rawIpa);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$align$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["align"])(word, segs);
}
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/WordRenderer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WordRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ruleConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/ruleConfig.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$overrides$2f$apply$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/overrides/apply.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/engine/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/engine/display.ts [app-client] (ecmascript) <locals>");
;
;
;
function WordRenderer({ nodes, wordStr }) {
    const renderNodes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$overrides$2f$apply$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["applyRegexOverrides"])(wordStr, nodes, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ruleConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_CONFIG"].regexRules);
    const displayNodes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveDisplay"])(renderNodes);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "eic-word",
        children: displayNodes.map((d, i)=>{
            if (!d.t) return null;
            const style = d.gradient ? {
                background: d.gradientCss ?? `linear-gradient(to right, ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DIPHTHONG_START"]}, ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DIPHTHONG_END"]})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent'
            } : {
                color: d.color
            };
            if (d.underline) {
                style.textDecoration = 'underline';
                style.textDecorationColor = d.underlineColor;
                style.textUnderlineOffset = '6px';
                style.textDecorationThickness = '2.5px';
            }
            const classes = [
                'eic-seg',
                d.syllabic ? 'eic-syllabic' : '',
                d.syllabicVR ? 'eic-syllabic-vr' : '',
                d.underline ? 'eic-stressed' : '',
                d.mute ? 'eic-silent' : ''
            ].filter(Boolean).join(' ');
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: style,
                className: classes,
                title: d.sound || undefined,
                children: [
                    d.t,
                    d.superscript && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sup", {
                        className: "eic-superscript",
                        children: d.superscript
                    }, void 0, false, {
                        fileName: "[project]/src/components/WordRenderer.tsx",
                        lineNumber: 48,
                        columnNumber: 31
                    }, this)
                ]
            }, i, true, {
                fileName: "[project]/src/components/WordRenderer.tsx",
                lineNumber: 46,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/src/components/WordRenderer.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
_c = WordRenderer;
var _c;
__turbopack_context__.k.register(_c, "WordRenderer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/gameTypes.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DIFFICULTY_INFO",
    ()=>DIFFICULTY_INFO,
    "GAME_RULE",
    ()=>GAME_RULE,
    "INTRO_EXAMPLE",
    ()=>INTRO_EXAMPLE
]);
// Colour legend and "hard mode" distractor groups both come from the single
// canonical source (src/lib/rules/colors.ts) — this used to be a hand-copied
// 4th mirror of the engine's colour map that could silently drift out of
// sync. Edit a colour or its neighbours there; this file just re-exports it.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/colors.ts [app-client] (ecmascript)");
const DIFFICULTY_INFO = {
    easy: {
        label: 'Easy',
        icon: '🌱',
        desc: 'Short words, clearly different colours'
    },
    medium: {
        label: 'Medium',
        icon: '🌿',
        desc: 'Longer words, mixed sounds'
    },
    hard: {
        label: 'Hard',
        icon: '🌳',
        desc: 'Long words, similar-sounding colours'
    }
};
;
const GAME_RULE = 'Every vowel sound has its own colour. Learn to read the colour before you read the letter — the shape of the word tells you how it sounds.';
const INTRO_EXAMPLE = {
    word: 'understand',
    nodes: [
        {
            t: 'u',
            s: 'ʌ',
            c: '#008E40',
            u: false,
            x: false
        },
        {
            t: 'n',
            s: 'n',
            c: '',
            u: false,
            x: true
        },
        {
            t: 'd',
            s: 'd',
            c: '',
            u: false,
            x: true
        },
        {
            t: 'er',
            s: 'ər',
            c: '#000000',
            u: false,
            x: false
        },
        {
            t: 's',
            s: 's',
            c: '',
            u: false,
            x: true
        },
        {
            t: 't',
            s: 't',
            c: '',
            u: false,
            x: true
        },
        {
            t: 'a',
            s: 'æ',
            c: '#00b0f0',
            u: true,
            x: false
        },
        {
            t: 'n',
            s: 'n',
            c: '',
            u: false,
            x: true
        },
        {
            t: 'd',
            s: 'd',
            c: '',
            u: false,
            x: true
        }
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/game/ColourGame.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ColourGame
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordRenderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/WordRenderer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/gameTypes.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/colors.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function shuffle(arr) {
    const a = [
        ...arr
    ];
    for(let i = a.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [
            a[j],
            a[i]
        ];
    }
    return a;
}
function ColourGame({ word, difficulty, phase, lastCorrect, onAnswer }) {
    _s();
    const correct = word.dominantColor;
    // Build 4 options: 1 correct + 3 distractors. On Hard, distractors are
    // pulled from NEAR_COLOR_GROUPS first — phonetically neighbouring sounds,
    // so telling them apart takes real recognition, not just "not that hue".
    const options = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ColourGame.useMemo[options]": ()=>{
            const all = Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_LABELS"]).filter({
                "ColourGame.useMemo[options].all": (c)=>c !== correct
            }["ColourGame.useMemo[options].all"]);
            if (difficulty === 'hard') {
                const neighbours = shuffle((__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NEAR_COLOR_GROUPS"][correct] ?? []).filter({
                    "ColourGame.useMemo[options].neighbours": (c)=>c !== correct
                }["ColourGame.useMemo[options].neighbours"]));
                const rest = shuffle(all.filter({
                    "ColourGame.useMemo[options].rest": (c)=>!neighbours.includes(c)
                }["ColourGame.useMemo[options].rest"]));
                const distractors = [
                    ...neighbours,
                    ...rest
                ].slice(0, 3);
                return shuffle([
                    correct,
                    ...distractors
                ]);
            }
            const distractors = shuffle(all).slice(0, 3);
            return shuffle([
                correct,
                ...distractors
            ]);
        }
    }["ColourGame.useMemo[options]"], [
        correct,
        difficulty
    ]);
    // Auto-speak word
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ColourGame.useEffect": ()=>{
            if (phase !== 'playing') return;
            fetch('/api/speak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    word: word.word
                })
            }).then({
                "ColourGame.useEffect": (r)=>r.blob()
            }["ColourGame.useEffect"]).then({
                "ColourGame.useEffect": (blob)=>new Audio(URL.createObjectURL(blob)).play()
            }["ColourGame.useEffect"]).catch({
                "ColourGame.useEffect": ()=>{}
            }["ColourGame.useEffect"]);
        }
    }["ColourGame.useEffect"], [
        word.word,
        phase
    ]);
    const isPlaying = phase === 'playing';
    const isFeedback = phase === 'feedback';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "cg-wrap",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "game-instruction",
                children: [
                    "What sound does the ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "highlighted colour"
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/ColourGame.tsx",
                        lineNumber: 64,
                        columnNumber: 29
                    }, this),
                    " represent?"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/ColourGame.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "cg-word-display",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordRenderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    nodes: word.nodes,
                    wordStr: word.word
                }, void 0, false, {
                    fileName: "[project]/src/components/game/ColourGame.tsx",
                    lineNumber: 68,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/game/ColourGame.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "cg-swatch-row",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "cg-swatch",
                        style: {
                            background: correct
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/ColourGame.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "cg-swatch-label",
                        children: "dominant sound"
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/ColourGame.tsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/ColourGame.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "cg-options",
                children: options.map((color)=>{
                    const info = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_LABELS"][color];
                    const isCorrect = color === correct;
                    const btnClass = [
                        'cg-option',
                        isFeedback && isCorrect ? 'correct' : '',
                        isFeedback && !isCorrect ? 'incorrect' : ''
                    ].filter(Boolean).join(' ');
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: btnClass,
                        disabled: !isPlaying,
                        onClick: ()=>onAnswer(isCorrect),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "cg-opt-dot",
                                style: {
                                    background: color
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/game/ColourGame.tsx",
                                lineNumber: 93,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "cg-opt-text",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "cg-opt-label",
                                        children: info?.label ?? color
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/game/ColourGame.tsx",
                                        lineNumber: 95,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "cg-opt-ex",
                                        children: info?.example ?? ''
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/game/ColourGame.tsx",
                                        lineNumber: 96,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/game/ColourGame.tsx",
                                lineNumber: 94,
                                columnNumber: 15
                            }, this),
                            isFeedback && isCorrect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "cg-tick",
                                children: "✓"
                            }, void 0, false, {
                                fileName: "[project]/src/components/game/ColourGame.tsx",
                                lineNumber: 98,
                                columnNumber: 43
                            }, this)
                        ]
                    }, color, true, {
                        fileName: "[project]/src/components/game/ColourGame.tsx",
                        lineNumber: 87,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/game/ColourGame.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            isFeedback && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `cg-feedback ${lastCorrect ? 'fb-correct' : 'fb-wrong'}`,
                children: lastCorrect ? `✓ Yes! "${word.word}" has the ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_LABELS"][correct]?.label} sound.` : `The correct answer is ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_LABELS"][correct]?.label} — as in ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_LABELS"][correct]?.example}.`
            }, void 0, false, {
                fileName: "[project]/src/components/game/ColourGame.tsx",
                lineNumber: 105,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/game/ColourGame.tsx",
        lineNumber: 62,
        columnNumber: 5
    }, this);
}
_s(ColourGame, "il5Tvgj2Zg9cW1B7oZP06HNz/Ic=");
_c = ColourGame;
var _c;
__turbopack_context__.k.register(_c, "ColourGame");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/game/GameProgress.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GameProgress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/gameTypes.ts [app-client] (ecmascript) <locals>");
'use client';
;
;
function GameProgress({ session, onExit }) {
    const progress = session.totalRounds > 0 ? session.roundsDone / session.totalRounds * 100 : 0;
    const diff = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DIFFICULTY_INFO"][session.difficulty];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "gp-wrap",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "gp-top",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "gp-exit",
                        onClick: onExit,
                        title: "Exit",
                        children: "←"
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/GameProgress.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "gp-level-badge",
                        children: [
                            diff.icon,
                            " ",
                            diff.label
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/game/GameProgress.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "gp-stats",
                        children: [
                            session.streak >= 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "gp-streak",
                                children: [
                                    "🔥 ",
                                    session.streak
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/game/GameProgress.tsx",
                                lineNumber: 23,
                                columnNumber: 35
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "gp-score",
                                children: [
                                    session.score,
                                    "/",
                                    session.roundsDone
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/game/GameProgress.tsx",
                                lineNumber: 24,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "gp-xp",
                                children: [
                                    "+",
                                    session.xp,
                                    " XP"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/game/GameProgress.tsx",
                                lineNumber: 25,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/game/GameProgress.tsx",
                        lineNumber: 22,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/GameProgress.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "gp-bar-wrap",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "gp-bar-fill",
                        style: {
                            width: `${progress}%`
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/GameProgress.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "gp-bar-dots",
                        children: Array.from({
                            length: session.totalRounds
                        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: [
                                    'gp-dot',
                                    i < session.roundsDone ? 'done' : i === session.current ? 'current' : ''
                                ].filter(Boolean).join(' ')
                            }, i, false, {
                                fileName: "[project]/src/components/game/GameProgress.tsx",
                                lineNumber: 33,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/GameProgress.tsx",
                        lineNumber: 31,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/GameProgress.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/game/GameProgress.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_c = GameProgress;
var _c;
__turbopack_context__.k.register(_c, "GameProgress");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/game/IntroCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>IntroCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordRenderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/WordRenderer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/gameTypes.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/colors.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const DIFFICULTIES = [
    'easy',
    'medium',
    'hard'
];
function IntroCard({ onStart }) {
    _s();
    const [difficulty, setDifficulty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('medium');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "ic-wrap",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "game-logo",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: '#CC0000'
                        },
                        children: "E"
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/IntroCard.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: '#00b0f0'
                        },
                        children: "i"
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/IntroCard.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: '#008E40'
                        },
                        children: "C"
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/IntroCard.tsx",
                        lineNumber: 22,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/IntroCard.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "ic-title",
                children: "Learn English in Colours"
            }, void 0, false, {
                fileName: "[project]/src/components/game/IntroCard.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "ic-rule",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GAME_RULE"]
            }, void 0, false, {
                fileName: "[project]/src/components/game/IntroCard.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ic-example",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordRenderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    nodes: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["INTRO_EXAMPLE"].nodes,
                    wordStr: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["INTRO_EXAMPLE"].word
                }, void 0, false, {
                    fileName: "[project]/src/components/game/IntroCard.tsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/game/IntroCard.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ic-diff-row",
                children: DIFFICULTIES.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: `ic-diff-btn ${difficulty === d ? 'selected' : ''}`,
                        onClick: ()=>setDifficulty(d),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ic-diff-icon",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DIFFICULTY_INFO"][d].icon
                            }, void 0, false, {
                                fileName: "[project]/src/components/game/IntroCard.tsx",
                                lineNumber: 38,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ic-diff-label",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DIFFICULTY_INFO"][d].label
                            }, void 0, false, {
                                fileName: "[project]/src/components/game/IntroCard.tsx",
                                lineNumber: 39,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ic-diff-desc",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DIFFICULTY_INFO"][d].desc
                            }, void 0, false, {
                                fileName: "[project]/src/components/game/IntroCard.tsx",
                                lineNumber: 40,
                                columnNumber: 13
                            }, this)
                        ]
                    }, d, true, {
                        fileName: "[project]/src/components/game/IntroCard.tsx",
                        lineNumber: 33,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/game/IntroCard.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "game-colour-guide",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "game-guide-title",
                        children: "The EiC Colour System"
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/IntroCard.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "game-colour-grid",
                        children: [
                            Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_LABELS"]).map(([c, { label, example }])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "game-colour-item",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "game-colour-swatch",
                                            style: {
                                                background: c
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/game/IntroCard.tsx",
                                            lineNumber: 50,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "game-colour-info",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "game-colour-label",
                                                    children: label
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/game/IntroCard.tsx",
                                                    lineNumber: 52,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "game-colour-ex",
                                                    children: example
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/game/IntroCard.tsx",
                                                    lineNumber: 53,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/game/IntroCard.tsx",
                                            lineNumber: 51,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, c, true, {
                                    fileName: "[project]/src/components/game/IntroCard.tsx",
                                    lineNumber: 49,
                                    columnNumber: 13
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "game-colour-item",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "game-colour-swatch",
                                        style: {
                                            background: '#000000'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/game/IntroCard.tsx",
                                        lineNumber: 58,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "game-colour-info",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "game-colour-label",
                                                children: "∅ / —"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/game/IntroCard.tsx",
                                                lineNumber: 60,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "game-colour-ex",
                                                children: "consonants & silent letters"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/game/IntroCard.tsx",
                                                lineNumber: 61,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/game/IntroCard.tsx",
                                        lineNumber: 59,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/game/IntroCard.tsx",
                                lineNumber: 57,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/game/IntroCard.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/IntroCard.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "ic-start",
                onClick: ()=>onStart(difficulty),
                children: "Start →"
            }, void 0, false, {
                fileName: "[project]/src/components/game/IntroCard.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/game/IntroCard.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_s(IntroCard, "zSGRxTLckyQYiKDPCw4dw7l6Csg=");
_c = IntroCard;
var _c;
__turbopack_context__.k.register(_c, "IntroCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/learn/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LearnPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$ColourGame$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/game/ColourGame.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$GameProgress$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/game/GameProgress.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$IntroCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/game/IntroCard.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const ROUNDS = 10;
async function fetchWords(difficulty) {
    const res = await fetch(`/api/game?n=${ROUNDS}&difficulty=${difficulty}`);
    const data = await res.json();
    return data.words ?? [];
}
const EMPTY_SESSION = {
    difficulty: 'medium',
    words: [],
    current: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    xp: 0,
    roundsDone: 0,
    totalRounds: 0,
    phase: 'intro',
    lastCorrect: null
};
function LearnPage() {
    _s();
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(EMPTY_SESSION);
    const begin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LearnPage.useCallback[begin]": async (difficulty)=>{
            setSession({
                "LearnPage.useCallback[begin]": (s)=>({
                        ...s,
                        difficulty,
                        phase: 'loading'
                    })
            }["LearnPage.useCallback[begin]"]);
            const words = await fetchWords(difficulty);
            if (!words.length) {
                setSession({
                    "LearnPage.useCallback[begin]": (s)=>({
                            ...s,
                            phase: 'intro'
                        })
                }["LearnPage.useCallback[begin]"]);
                return;
            }
            setSession({
                difficulty,
                words,
                current: 0,
                score: 0,
                streak: 0,
                maxStreak: 0,
                xp: 0,
                roundsDone: 0,
                totalRounds: words.length,
                phase: 'playing',
                lastCorrect: null
            });
        }
    }["LearnPage.useCallback[begin]"], []);
    const onAnswer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LearnPage.useCallback[onAnswer]": (correct)=>{
            setSession({
                "LearnPage.useCallback[onAnswer]": (prev)=>{
                    const streak = correct ? prev.streak + 1 : 0;
                    const xpGain = correct ? 10 + streak * 2 : 0;
                    const roundsDone = prev.roundsDone + 1;
                    return {
                        ...prev,
                        score: prev.score + (correct ? 1 : 0),
                        streak,
                        maxStreak: Math.max(prev.maxStreak, streak),
                        xp: prev.xp + xpGain,
                        roundsDone,
                        phase: 'feedback',
                        lastCorrect: correct
                    };
                }
            }["LearnPage.useCallback[onAnswer]"]);
            setTimeout({
                "LearnPage.useCallback[onAnswer]": ()=>{
                    setSession({
                        "LearnPage.useCallback[onAnswer]": (prev)=>{
                            const isLast = prev.current >= prev.words.length - 1;
                            return {
                                ...prev,
                                current: isLast ? prev.current : prev.current + 1,
                                phase: isLast ? 'done' : 'playing'
                            };
                        }
                    }["LearnPage.useCallback[onAnswer]"]);
                }
            }["LearnPage.useCallback[onAnswer]"], 1200);
        }
    }["LearnPage.useCallback[onAnswer]"], []);
    const currentWord = session.words[session.current] ?? null;
    if (session.phase === 'intro') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "game-home",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$IntroCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                onStart: begin
            }, void 0, false, {
                fileName: "[project]/src/app/learn/page.tsx",
                lineNumber: 73,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/learn/page.tsx",
            lineNumber: 72,
            columnNumber: 7
        }, this);
    }
    if (session.phase === 'loading') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "game-home",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "game-loading",
                children: "Loading words…"
            }, void 0, false, {
                fileName: "[project]/src/app/learn/page.tsx",
                lineNumber: 81,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/learn/page.tsx",
            lineNumber: 80,
            columnNumber: 7
        }, this);
    }
    if (session.phase === 'done') {
        const pct = Math.round(session.score / session.totalRounds * 100);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "game-home",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "game-done",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "game-done-emoji",
                        children: pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 91,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "game-done-title",
                        children: pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good work!' : 'Keep practising!'
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 92,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "game-done-stats",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "game-done-stat",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "game-done-num",
                                        children: [
                                            session.score,
                                            "/",
                                            session.totalRounds
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 97,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "game-done-lbl",
                                        children: "correct"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 98,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/learn/page.tsx",
                                lineNumber: 96,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "game-done-stat",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "game-done-num",
                                        children: session.maxStreak
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 101,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "game-done-lbl",
                                        children: "best streak"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 102,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/learn/page.tsx",
                                lineNumber: 100,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "game-done-stat",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "game-done-num",
                                        children: [
                                            "+",
                                            session.xp
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 105,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "game-done-lbl",
                                        children: "XP earned"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 106,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/learn/page.tsx",
                                lineNumber: 104,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 95,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "game-done-actions",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "game-play-again",
                                onClick: ()=>begin(session.difficulty),
                                children: "Play again"
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/page.tsx",
                                lineNumber: 110,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "game-change-level",
                                onClick: ()=>setSession(EMPTY_SESSION),
                                children: "Change difficulty"
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/page.tsx",
                                lineNumber: 113,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 109,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/learn/page.tsx",
                lineNumber: 90,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/learn/page.tsx",
            lineNumber: 89,
            columnNumber: 7
        }, this);
    }
    if (!currentWord) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "game-home",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$GameProgress$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                session: session,
                onExit: ()=>setSession(EMPTY_SESSION)
            }, void 0, false, {
                fileName: "[project]/src/app/learn/page.tsx",
                lineNumber: 126,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "game-arena",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$ColourGame$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    word: currentWord,
                    difficulty: session.difficulty,
                    phase: session.phase,
                    lastCorrect: session.lastCorrect,
                    onAnswer: onAnswer
                }, void 0, false, {
                    fileName: "[project]/src/app/learn/page.tsx",
                    lineNumber: 129,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/learn/page.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/learn/page.tsx",
        lineNumber: 125,
        columnNumber: 5
    }, this);
}
_s(LearnPage, "049KODoTSmlRRJjDsftiimGRl+4=");
_c = LearnPage;
var _c;
__turbopack_context__.k.register(_c, "LearnPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_1qm40fy._.js.map