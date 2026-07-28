module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/lib/rules/colors.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
const COLOR_MAP = Object.fromEntries(SOUND_COLORS.flatMap((entry)=>entry.sounds.map((sound)=>[
            sound,
            entry.hex
        ])));
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
const NEAR_COLOR_GROUPS = Object.fromEntries(SOUND_COLORS.filter((e)=>e.neighbors?.length).map((e)=>[
        e.hex,
        e.neighbors
    ]));
}),
"[project]/src/lib/engine/segment.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/colors.ts [app-route] (ecmascript)");
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
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["VOWEL_CHARS"]
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
                isVowel: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isVowelSound"])(rep),
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
}),
"[project]/src/lib/engine/align.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/colors.ts [app-route] (ecmascript)");
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
            c: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_SILENT"],
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
                c: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"],
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
        const color = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getColor"])(display);
        const isCons = !color;
        const isStressed = accented && isVowel;
        nodes.push({
            t: consumed,
            s: display,
            c: color ?? (isCons ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_SILENT"]),
            u: isStressed,
            x: isCons
        });
    }
    // Remaining letters → silent tail
    if (pos < wLen) nodes.push({
        t: word.slice(pos),
        s: '',
        c: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_SILENT"],
        u: false,
        x: false
    });
    return nodes;
}
}),
"[project]/src/lib/engine/score.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/colors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$align$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/align.ts [app-route] (ecmascript)");
;
;
function scoreNodes(nodes) {
    return nodes.filter((n)=>n.t && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"]).reduce((sum, n)=>sum + n.t.length, 0);
}
function extractProps(nodes) {
    const colorCounts = {};
    let hasSilent = false;
    let hasStress = false;
    let syllableCount = 0;
    for (const n of nodes){
        if (n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.t && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$align$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isGraphicCons"])(n.t)) hasSilent = true;
        if (n.u) hasStress = true;
        if (n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] && n.t) {
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
}),
"[project]/src/lib/engine/display.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/colors.ts [app-route] (ecmascript)");
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
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_MAP"][sound] ?? null;
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
    if (n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_SILENT"]) return true;
    if (!n.t || n.t.length === 0) return false;
    // A node is mute when the engine gave it a vowel color (meaning it carries
    // a vowel phoneme) but its letters are all graphic consonants — classic
    // "silent consonant" case, e.g. 'k' in 'knight'.
    const hasVowelColor = n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] && n.c !== '' && n.c !== undefined;
    if (hasVowelColor && isGraphicConsonant(n.t)) return true;
    return false;
}
function isVowelNode(n) {
    if (!n.t || n.t.length === 0) return false;
    if (isMute(n)) return false;
    if (n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] || n.x || n.c === '') return false;
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
                anchorColor = rn.c && rn.c !== '' ? rn.c : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"];
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
        const runAnchor = underlineColorMap.get(i) ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"];
        // Final color decision — one place, one pass, explicit priority:
        let color;
        let gradientCss;
        if (isSylVR) color = '#FFFFFF'; // forced V-R syllabic (white fill)
        else if (isTrueSyl) color = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"]; // syllabic consonant
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
        } else if (mute) color = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_SILENT"];
        else color = n.c && n.c !== '' ? n.c : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"];
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
}),
"[project]/src/lib/engine/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$segment$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/segment.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$align$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/align.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/colors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$score$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/score.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/engine/display.ts [app-route] (ecmascript) <locals>");
;
;
;
function processIpa(word, rawIpa) {
    if (!rawIpa?.trim()) {
        return [
            {
                t: word,
                s: '',
                c: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_SILENT"],
                u: false,
                x: false
            }
        ];
    }
    const segs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$segment$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["segment"])(rawIpa);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$align$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["align"])(word, segs);
}
;
;
;
;
}),
"[project]/src/lib/engine/suffixVoicing.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// engine/suffixVoicing.ts
// Determină alofonul sufixului -s (plural / persoana a III-a / posesiv) pe
// baza ultimului fonem al cuvântului de bază:
//   /s/ după consoane surde (voiceless)
//   /z/ după vocale și consoane sonore (voiced)
//
// Fonemele sunt scrise în forma lor de AFIȘARE (post-TRANSFORMS din
// segment.ts, vezi tabelul de acolo), nu în IPA brut — 'ch' pentru /tʃ/,
// 'th' pentru /θ/, 'sh' pentru /ʃ/ etc. Astfel se poate apela direct cu
// Seg.display sau cu ultimul RenderNode.s produs de pipeline.
__turbopack_context__.s([
    "EiCSuffixVoicingPipeline",
    ()=>EiCSuffixVoicingPipeline,
    "VOICELESS_CONSONANTS",
    ()=>VOICELESS_CONSONANTS
]);
const VOICELESS_CONSONANTS = new Set([
    'p',
    't',
    'k',
    'f',
    'th'
]);
class EiCSuffixVoicingPipeline {
    process_suffix_s(base_word, last_phoneme) {
        const clean_phoneme = last_phoneme.trim().toLowerCase();
        if (VOICELESS_CONSONANTS.has(clean_phoneme)) {
            return {
                base: base_word,
                lastPhoneme: last_phoneme,
                phonetic: '/s/',
                eicSpelling: `${base_word}s`,
                environment: 'consoană surdă'
            };
        }
        return {
            base: base_word,
            lastPhoneme: last_phoneme,
            phonetic: '/z/',
            eicSpelling: `${base_word}ṡ`,
            environment: 'vocală / consoană sonoră'
        };
    }
} /*
LIMITARE CUNOSCUTĂ (nu am corectat-o fără să întreb, doar semnalez):

Regula reală -s din engleză are 3 alofoane, nu 2:
  /s/   după consoane surde non-sibilante   (p, t, k, f, th)
  /ɪz/  după sibilante                       (s, z, sh, zh, ch, j/dʒ)
  /z/   după tot restul (vocale + consoane sonore non-sibilante)

Clasa Python originală pune sibilantele surde (s, sh, ch) implicit în ramura
/z/ (pentru că nu sunt în voiceless_consonants), ceea ce dă rezultate greșite:
  "kiss" -> ar trebui "kisses" /ɪz/, nu "kissṡ" /z/
  "bush" -> ar trebui "bushes" /ɪz/, nu "bushṡ" /z/
  "watch" -> ar trebui "watches" /ɪz/, nu "watchṡ" /z/

De asemenea pʰ/tʰ/kʰ (aspirate) din setul original nu apar niciodată ca
"ultim fonem" — aspirația e un alofon de atac de silabă, nu de coda finală
de cuvânt — deci acele 3 intrări sunt moarte în practică. Nu le-am mai pus.

Portul de mai sus e fidel 1:1 cu clasa cerută. Spune dacă vrei să adaug
ramura /ɪz/ (sibilante) — e un `if` în plus, dar schimbă rezultatul pentru
orice cuvânt terminat în s/z/sh/zh/ch/j.
*/ 
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getBestNodes",
    ()=>getBestNodes,
    "getBestNodesMany",
    ()=>getBestNodesMany,
    "getCache",
    ()=>getCache,
    "getCacheStats",
    ()=>getCacheStats,
    "getDb",
    ()=>getDb,
    "getLexicon",
    ()=>getLexicon,
    "searchPrefix",
    ()=>searchPrefix
]);
// Server-side only — Next.js API routes
// Two-database architecture:
//   lexicon.db  (A) — read-only, IPA source of truth
//   cache.db    (B) — read-write, processed results cache
var __TURBOPACK__imported__module__$5b$externals$5d2f$better$2d$sqlite3__$5b$external$5d$__$28$better$2d$sqlite3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$better$2d$sqlite3$29$__ = __turbopack_context__.i("[externals]/better-sqlite3 [external] (better-sqlite3, cjs, [project]/node_modules/better-sqlite3)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/engine/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$score$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/score.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rules/colors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$suffixVoicing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/suffixVoicing.ts [app-route] (ecmascript)");
;
;
;
;
const suffixPipeline = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$suffixVoicing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EiCSuffixVoicingPipeline"]();
const LEXICON_PATH = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'data', 'lexicon.db');
const CACHE_PATH = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'data', 'cache.db');
// ── Singletons ────────────────────────────────────────────────────────────────
let _lexicon = null;
let _cache = null;
function getLexicon() {
    if (!_lexicon) {
        _lexicon = new __TURBOPACK__imported__module__$5b$externals$5d2f$better$2d$sqlite3__$5b$external$5d$__$28$better$2d$sqlite3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$better$2d$sqlite3$29$__["default"](LEXICON_PATH, {
            readonly: true,
            fileMustExist: true
        });
        _lexicon.pragma('cache_size = -16000');
        _lexicon.pragma('temp_store = memory');
    }
    return _lexicon;
}
function getCache() {
    if (!_cache) {
        // Create if not exists — do NOT use fileMustExist
        _cache = new __TURBOPACK__imported__module__$5b$externals$5d2f$better$2d$sqlite3__$5b$external$5d$__$28$better$2d$sqlite3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$better$2d$sqlite3$29$__["default"](CACHE_PATH);
        _cache.pragma('journal_mode = WAL');
        _cache.pragma('cache_size = -8000');
        _cache.pragma('temp_store = memory');
        _cache.pragma('synchronous = NORMAL');
        // Ensure schema exists
        _cache.exec(`
      CREATE TABLE IF NOT EXISTS words (
        word           TEXT PRIMARY KEY,
        variant        TEXT NOT NULL,
        nodes_json     TEXT NOT NULL,
        ipa_uk         TEXT,
        ipa_us         TEXT,
        dominant_color TEXT,
        has_silent     INTEGER DEFAULT 0,
        has_stress     INTEGER DEFAULT 0,
        syllable_count INTEGER DEFAULT 1,
        word_length    INTEGER NOT NULL,
        processed_at   TEXT,
        hit_count      INTEGER DEFAULT 1
      );
      CREATE INDEX IF NOT EXISTS idx_dominant_color ON words(dominant_color);
      CREATE INDEX IF NOT EXISTS idx_has_silent     ON words(has_silent);
      CREATE INDEX IF NOT EXISTS idx_has_stress     ON words(has_stress);
      CREATE INDEX IF NOT EXISTS idx_syllable_count ON words(syllable_count);
      CREATE INDEX IF NOT EXISTS idx_word_length    ON words(word_length);
    `);
    }
    return _cache;
}
function getDb() {
    return getLexicon();
}
// ── Prepared statements ───────────────────────────────────────────────────────
// Cache (B) reads
let _stmtCacheGet = null;
function stmtCacheGet() {
    if (!_stmtCacheGet) _stmtCacheGet = getCache().prepare('SELECT nodes_json, variant FROM words WHERE word = ? LIMIT 1');
    return _stmtCacheGet;
}
// Cache (B) write
let _stmtCacheSet = null;
function stmtCacheSet() {
    if (!_stmtCacheSet) _stmtCacheSet = getCache().prepare(`
      INSERT INTO words
        (word, variant, nodes_json, ipa_uk, ipa_us,
         dominant_color, has_silent, has_stress, syllable_count,
         word_length, processed_at, hit_count)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,1)
      ON CONFLICT(word) DO UPDATE SET
        hit_count    = hit_count + 1,
        processed_at = excluded.processed_at
    `);
    return _stmtCacheSet;
}
// Lexicon (A) reads
let _stmtUk = null;
let _stmtUs = null;
function stmtUk() {
    if (!_stmtUk) _stmtUk = getLexicon().prepare('SELECT ipa FROM uk WHERE word = ? LIMIT 1');
    return _stmtUk;
}
function stmtUs() {
    if (!_stmtUs) _stmtUs = getLexicon().prepare('SELECT ipa FROM us WHERE word = ? LIMIT 1');
    return _stmtUs;
}
// ── -s suffix fallback ────────────────────────────────────────────────────────
// Cuvântul cerut nu e în lexicon (ex: "cats" nu are rând propriu), dar dacă
// e "bază + s" și baza există în lexicon, sintetizăm nodul de sufix în loc
// să întoarcem null. Nu acoperă -es/-ies (plural cu epenteză) — doar -s simplu.
function tryPluralFallback(word) {
    if (!word.endsWith('s') || word.length < 2) return null;
    const base = word.slice(0, -1);
    const ukRow = stmtUk().get(base);
    const usRow = stmtUs().get(base);
    if (!ukRow && !usRow) return null;
    function build(ipa) {
        const baseNodes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["processIpa"])(base, ipa.replace(/\u200d/g, ''));
        const soundNodes = baseNodes.filter((n)=>n.s !== '');
        const lastPhoneme = soundNodes.length ? soundNodes[soundNodes.length - 1].s : base[base.length - 1];
        const { phonetic } = suffixPipeline.process_suffix_s(base, lastPhoneme);
        const suffixNode = {
            t: 's',
            s: phonetic,
            c: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rules$2f$colors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"],
            u: false,
            x: true
        };
        return [
            ...baseNodes,
            suffixNode
        ];
    }
    const ukNodes = ukRow ? build(ukRow.ipa) : null;
    const usNodes = usRow ? build(usRow.ipa) : null;
    const nodes = ukNodes ?? usNodes;
    if (!nodes) return null;
    return {
        nodes,
        variant: 'derived'
    };
}
function getBestNodes(word) {
    word = word.toLowerCase().trim();
    if (!word || !/^[a-z'-]+$/.test(word)) return null;
    // 1. Check cache (B)
    const cached = stmtCacheGet().get(word);
    if (cached) {
        try {
            return {
                nodes: JSON.parse(cached.nodes_json),
                variant: cached.variant
            };
        } catch  {}
    }
    // 2. Look up IPA in lexicon (A)
    const ukRow = stmtUk().get(word);
    const usRow = stmtUs().get(word);
    if (!ukRow && !usRow) {
        const derived = tryPluralFallback(word);
        if (!derived) return null;
        try {
            stmtCacheSet().run(word, derived.variant, JSON.stringify(derived.nodes), null, null, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$score$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractProps"])(derived.nodes).dominantColor, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$score$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractProps"])(derived.nodes).hasSilent ? 1 : 0, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$score$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractProps"])(derived.nodes).hasStress ? 1 : 0, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$score$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractProps"])(derived.nodes).syllableCount, word.length, new Date().toISOString());
        } catch (e) {
            console.warn('cache write failed:', e);
        }
        return derived;
    }
    // 3. Process through pipeline
    const ukNodes = ukRow ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["processIpa"])(word, stripIpaArtifacts(ukRow.ipa)) : null;
    const usNodes = usRow ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["processIpa"])(word, stripIpaArtifacts(usRow.ipa)) : null;
    // UK lexicon source inserts U+200D (zero-width joiner) between the two
    // characters of a diphthong (e‍ɪ, ə‍ʊ...) — an export artifact, not a
    // phonetic marker (verified: 0 legitimate syllabic-consonant uses found in
    // either table). Strip it here, at the data boundary, so segment.ts's
    // TRANSFORMS can match diphthongs normally. Do NOT strip inside segment.ts
    // itself — SYLLABIC_MARKER there is a distinct, internal mechanism.
    function stripIpaArtifacts(ipa) {
        return ipa.replace(/\u200d/g, '');
    }
    // 4. Select best variant
    const result = selectBest(ukNodes, usNodes);
    if (!result) return null;
    // 5. Extract properties
    const props = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$score$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractProps"])(result.nodes);
    // 6. Save to cache (B)
    try {
        stmtCacheSet().run(word, result.variant, JSON.stringify(result.nodes), ukRow?.ipa ?? null, usRow?.ipa ?? null, props.dominantColor, props.hasSilent ? 1 : 0, props.hasStress ? 1 : 0, props.syllableCount, word.length, new Date().toISOString());
    } catch (e) {
        // Cache write failure is non-fatal — log and continue
        console.warn('cache write failed:', e);
    }
    return result;
}
function getBestNodesMany(words) {
    const result = new Map();
    for (const w of words){
        const r = getBestNodes(w);
        if (r) result.set(w, r);
    }
    return result;
}
// ── Selection algorithm ───────────────────────────────────────────────────────
function selectBest(uk, us) {
    if (!uk && !us) return null;
    if (!uk) return {
        nodes: us,
        variant: 'us'
    };
    if (!us) return {
        nodes: uk,
        variant: 'uk'
    };
    const ukScore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$score$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scoreNodes"])(uk);
    const usScore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$score$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scoreNodes"])(us);
    if (ukScore > usScore) return {
        nodes: uk,
        variant: 'uk'
    };
    if (usScore > ukScore) return {
        nodes: us,
        variant: 'us'
    };
    const winner = Math.random() < 0.5 ? 'uk' : 'us';
    return {
        nodes: winner === 'uk' ? uk : us,
        variant: 'coin'
    };
}
// ── Prefix search (from cache first, fallback to lexicon) ─────────────────────
let _stmtPrefixCache = null;
let _stmtPrefixLexicon = null;
function searchPrefix(prefix, limit = 10) {
    if (!prefix || prefix.length < 2) return [];
    const p = prefix.toLowerCase() + '%';
    // Search cache first — these are known-good words
    if (!_stmtPrefixCache) _stmtPrefixCache = getCache().prepare('SELECT word FROM words WHERE word LIKE ? ORDER BY hit_count DESC, length(word), word LIMIT ?');
    const cached = _stmtPrefixCache.all(p, limit).map((r)=>r.word);
    if (cached.length >= limit) return cached;
    // Fill from lexicon
    if (!_stmtPrefixLexicon) _stmtPrefixLexicon = getLexicon().prepare('SELECT word FROM uk WHERE word LIKE ? ORDER BY length(word), word LIMIT ?');
    const fromLexicon = _stmtPrefixLexicon.all(p, limit).map((r)=>r.word);
    // Merge, deduplicate, limit
    const seen = new Set(cached);
    const merged = [
        ...cached
    ];
    for (const w of fromLexicon){
        if (!seen.has(w)) merged.push(w);
        if (merged.length >= limit) break;
    }
    return merged;
}
function getCacheStats() {
    const total = getCache().prepare('SELECT COUNT(*) as n FROM words').get().n;
    const byVariant = Object.fromEntries(getCache().prepare('SELECT variant, COUNT(*) as n FROM words GROUP BY variant').all().map((r)=>[
            r.variant,
            r.n
        ]));
    return {
        total,
        byVariant
    };
}
}),
"[project]/src/app/api/words/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
;
;
async function POST(req) {
    try {
        const body = await req.json();
        const words = body?.words;
        if (!Array.isArray(words) || words.length === 0) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            results: {}
        });
        const unique = [
            ...new Set(words.map((w)=>w.toLowerCase().trim()).filter(Boolean))
        ];
        const map = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBestNodesMany"])(unique);
        const results = {};
        for (const [word, result] of map.entries())results[word] = result.nodes;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            results
        }, {
            headers: {
                'Cache-Control': 'public, max-age=3600, s-maxage=3600'
            }
        });
    } catch (err) {
        console.error('/api/words error:', err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal error'
        }, {
            status: 500
        });
    }
}
async function DELETE() {
    try {
        const { getCache } = await __turbopack_context__.A("[project]/src/lib/db.ts [app-route] (ecmascript, async loader)");
        getCache().prepare('DELETE FROM words').run();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            message: 'Cache cleared'
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: String(err)
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1xy_ake._.js.map