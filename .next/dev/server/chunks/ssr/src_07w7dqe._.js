module.exports = [
"[project]/src/lib/gameTypes.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "COLOR_LABELS",
    ()=>COLOR_LABELS,
    "LEVEL_INFO",
    ()=>LEVEL_INFO
]);
const COLOR_LABELS = {
    '#008E40': {
        label: 'ɑ / ʌ',
        example: 'car, cup'
    },
    '#00b0f0': {
        label: 'æ',
        example: 'cat, hat'
    },
    '#7030A0': {
        label: 'u / ʊ',
        example: 'moon, book'
    },
    '#888888': {
        label: 'ə',
        example: 'about, the'
    },
    '#CC0000': {
        label: 'i / ɪ',
        example: 'see, sit'
    },
    '#E57373': {
        label: 'j / w',
        example: 'yes, we'
    },
    '#EE5B00': {
        label: 'e / ɛ',
        example: 'bed, say'
    },
    '#FF3399': {
        label: 'ɒ / ɔ',
        example: 'hot, or'
    }
};
const LEVEL_INFO = {
    1: {
        name: 'Colours',
        desc: 'What sound does this colour represent?',
        icon: '🎨'
    },
    2: {
        name: 'Silent Hunt',
        desc: 'Tap the letters that make no sound.',
        icon: '🔇'
    },
    3: {
        name: 'Stress Mark',
        desc: 'Tap the stressed vowel group.',
        icon: '💡'
    }
};
}),
"[project]/src/lib/ruleConfig.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ruleConfig.ts
// Single source of truth for all EiC rendering rules.
// Editable in /rules page — changes generate a structured prompt.
__turbopack_context__.s([
    "DEFAULT_CONFIG",
    ()=>DEFAULT_CONFIG,
    "applyRegexOverrides",
    ()=>applyRegexOverrides,
    "diffConfigs",
    ()=>diffConfigs,
    "generatePrompt",
    ()=>generatePrompt
]);
const DEFAULT_CONFIG = {
    colors: [
        {
            sounds: [
                'æ'
            ],
            hex: '#00b0f0',
            label: 'æ — cat',
            category: 'vowel'
        },
        {
            sounds: [
                'ʌ',
                'a',
                'ɑ'
            ],
            hex: '#008E40',
            label: 'ɑ/ʌ — car/cup',
            category: 'vowel'
        },
        {
            sounds: [
                'ə',
                'ɜ',
                'ər',
                'er'
            ],
            hex: '#888888',
            label: 'ə — schwa',
            category: 'vowel'
        },
        {
            sounds: [
                'e',
                'ɛ',
                'eɪ',
                'eỷ'
            ],
            hex: '#EE5B00',
            label: 'e/ɛ — bed',
            category: 'vowel'
        },
        {
            sounds: [
                'ɪ',
                'i',
                'iː'
            ],
            hex: '#CC0000',
            label: 'i/ɪ — see/sit',
            category: 'vowel'
        },
        {
            sounds: [
                'ɒ',
                'ɔ',
                'o',
                'oʊ',
                'əw'
            ],
            hex: '#FF3399',
            label: 'ɒ/ɔ — hot/or',
            category: 'vowel'
        },
        {
            sounds: [
                'ʊ',
                'u',
                'uː'
            ],
            hex: '#7030A0',
            label: 'u/ʊ — moon/book',
            category: 'vowel'
        },
        {
            sounds: [
                'aɪ',
                'aỷ',
                'aw',
                'aʊ',
                'oɪ',
                'oỷ',
                'ɔɪ'
            ],
            hex: '#4472C4',
            label: 'aɪ/aʊ — my/now',
            category: 'vowel'
        },
        {
            sounds: [
                'j',
                'w',
                'ỷ'
            ],
            hex: '#E57373',
            label: 'j/w — yes/we',
            category: 'semivowel'
        }
    ],
    underline: {
        monosyllabic: false,
        withSyllabicCons: false,
        extendThroughSemi: true,
        extendThroughGlide: true
    },
    silent: {
        alwaysSilentPatterns: [
            'kn',
            'wr',
            'mb',
            'gh',
            'ght',
            'gn'
        ],
        graphicConsonantOverride: true
    },
    vowelChars: {
        vowels: [
            'a',
            'e',
            'i',
            'o',
            'u',
            'æ',
            'ɑ',
            'ɒ',
            'ɔ',
            'ə',
            'ɜ',
            'ɝ',
            'ɚ',
            'ɛ',
            'ɪ',
            'ʊ',
            'ʌ',
            'ø',
            'œ'
        ],
        semivowels: [
            'j',
            'w',
            'ỷ',
            'y'
        ],
        consonants: [
            'b',
            'd',
            'f',
            'g',
            'h',
            'k',
            'l',
            'm',
            'n',
            'p',
            'r',
            's',
            't',
            'v',
            'x',
            'z',
            'θ',
            'ð',
            'ʃ',
            'ʒ',
            'tʃ',
            'dʒ',
            'ŋ',
            'ɹ'
        ]
    },
    regexRules: [
        // Example (disabled): "island" — the 's' is silent. Targets capture group 1
        // (the 's') and forces it grey, leaving the rest of the word untouched.
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
        }
    ]
};
// ── Apply regex override rules ─────────────────────────────────────────────────
//
// Generic over any node shape that has `t` (grapheme text) and optionally
// `c` (colour), `u` (stressed flag) and `underlineOverride`. Works directly
// on pipeline RenderNode[] (in WordRenderer.tsx) and on adapted preview
// nodes (in the /rules Test/Regex tabs) without import coupling.
//
// Matching: each enabled rule's regex is run once against `word`. The span of
// the targeted group (default group 0 = whole match) is mapped onto every
// node whose grapheme range overlaps that span, and the rule's action is
// applied to those nodes. Rules run in ascending `priority` order, so a
// later rule can overwrite an earlier one.
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
        }
    }
    return out;
}
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
    // Underline rules
    const ul = modified.underline;
    const ulb = base.underline;
    if (ulb.monosyllabic !== ul.monosyllabic) diffs.push({
        section: 'Underline',
        field: 'monosyllabic',
        old: String(ulb.monosyllabic),
        new: String(ul.monosyllabic)
    });
    if (ulb.withSyllabicCons !== ul.withSyllabicCons) diffs.push({
        section: 'Underline',
        field: 'withSyllabicConsonant',
        old: String(ulb.withSyllabicCons),
        new: String(ul.withSyllabicCons)
    });
    if (ulb.extendThroughSemi !== ul.extendThroughSemi) diffs.push({
        section: 'Underline',
        field: 'extendThroughSemivowels',
        old: String(ulb.extendThroughSemi),
        new: String(ul.extendThroughSemi)
    });
    if (ulb.extendThroughGlide !== ul.extendThroughGlide) diffs.push({
        section: 'Underline',
        field: 'extendThroughDiphthongGlide',
        old: String(ulb.extendThroughGlide),
        new: String(ul.extendThroughGlide)
    });
    // Silent rules
    const oldPat = base.silent.alwaysSilentPatterns.join(', ');
    const newPat = modified.silent.alwaysSilentPatterns.join(', ');
    if (oldPat !== newPat) diffs.push({
        section: 'Silent',
        field: 'alwaysSilentPatterns',
        old: oldPat,
        new: newPat
    });
    if (base.silent.graphicConsonantOverride !== modified.silent.graphicConsonantOverride) diffs.push({
        section: 'Silent',
        field: 'graphicConsonantOverride',
        old: String(base.silent.graphicConsonantOverride),
        new: String(modified.silent.graphicConsonantOverride)
    });
    // Vowel chars
    if (base.vowelChars.vowels.join(',') !== modified.vowelChars.vowels.join(',')) diffs.push({
        section: 'VowelChars',
        field: 'vowels',
        old: base.vowelChars.vowels.join(', '),
        new: modified.vowelChars.vowels.join(', ')
    });
    if (base.vowelChars.semivowels.join(',') !== modified.vowelChars.semivowels.join(',')) diffs.push({
        section: 'VowelChars',
        field: 'semivowels',
        old: base.vowelChars.semivowels.join(', '),
        new: modified.vowelChars.semivowels.join(', ')
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
}),
"[project]/src/lib/engine/colorMap.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// engine/colorMap.ts
// Sound → colour. Nothing in this file knows about graphemes/letters — it
// only ever looks at IPA display strings. Edit COLOR_MAP to change a colour;
// you never need to touch align.ts to do that.
__turbopack_context__.s([
    "COLOR_CONSONANT",
    ()=>COLOR_CONSONANT,
    "COLOR_MAP",
    ()=>COLOR_MAP,
    "COLOR_SILENT",
    ()=>COLOR_SILENT,
    "VOWEL_CHARS",
    ()=>VOWEL_CHARS,
    "getColor",
    ()=>getColor,
    "isVowelSound",
    ()=>isVowelSound
]);
const COLOR_SILENT = '#000000';
const COLOR_CONSONANT = '#000000';
const COLOR_MAP = {
    'æ': '#00b0f0',
    'ʌ': '#008E40',
    'a': '#008E40',
    'ɑ': '#008E40',
    'ə': '#888888',
    'ɜ': '#888888',
    'ər': '#888888',
    'er': '#888888',
    'ɐ': '#888888',
    'e': '#EE5B00',
    'ɛ': '#EE5B00',
    'eɪ': '#EE5B00',
    'eỷ': '#EE5B00',
    'ɪ': '#CC0000',
    'i': '#CC0000',
    'iː': '#CC0000',
    'ɒ': '#FF3399',
    'ɔ': '#FF3399',
    'o': '#FF3399',
    'oʊ': '#FF3399',
    'əw': '#FF3399',
    'ʊ': '#7030A0',
    'u': '#7030A0',
    'uː': '#7030A0',
    'aɪ': '#4472C4',
    'aỷ': '#4472C4',
    'aw': '#4472C4',
    'aʊ': '#4472C4',
    'oɪ': '#4472C4',
    'oỷ': '#4472C4',
    'ɔɪ': '#4472C4',
    'j': '#E57373',
    'w': '#E57373',
    'ỷ': '#E57373'
};
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
}),
"[project]/src/lib/engine/segment.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/colorMap.ts [app-ssr] (ecmascript)");
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
    // j/w/ỷ — vowel-adjacent sounds, no special "semivowel" category.
    // isVowelSound() already returns true for these (see colorMap.ts);
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
 * classification does. VOWEL_CHARS (colorMap.ts) correctly includes j/w/ỷ —
 * they're vowel-adjacent sounds for coloring purposes. But a glide can never
 * itself carry primary stress; only a true syllable nucleus can. Using
 * VOWEL_CHARS here caused stress to land on a glide instead of skipping past
 * it to the real vowel (e.g. "question" /ˈkwɛstʃən/ — stress marker before
 * "kw" should skip both consonant 'k' AND glide 'w' to land on 'ɛ', but
 * VOWEL_CHARS treats 'w' as a stop-here vowel and the scan halted early).
 */ const STRESS_ANCHOR_CHARS = new Set([
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VOWEL_CHARS"]
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
                isVowel: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isVowelSound"])(rep),
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
"[project]/src/lib/engine/align.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/colorMap.ts [app-ssr] (ecmascript)");
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
        // Consecutive plain vowel phonemes: 1 letter each
        if (pos < wLen && isGraphicVowel(word[pos])) pos++;
    // No trailing extensions here — they'd grab letters belonging to next phoneme
    } else {
        // Full vowel run + extensions
        while(pos < wLen && isGraphicVowel(word[pos]))pos++;
        // Trailing w/y that completes a digraph (ow/aw/ay/oy/ey)
        if (pos > start && pos < wLen && 'wyWY'.includes(word[pos])) pos++;
        // Silent 'gh' after vowel run (night, high, caught, though).
        // Guard: don't absorb if next phoneme could itself be spelled by gh.
        if (pos > start && pos + 1 < wLen && (word[pos] === 'g' || word[pos] === 'G') && (word[pos + 1] === 'h' || word[pos + 1] === 'H') && nextDisplay !== 'f' && nextDisplay !== 'g') {
            pos += 2;
        }
        // R-controlled absorption: absorb a trailing 'r' when:
        // a) Display IS r-colored (ər, er…) — the 'r' is part of the phoneme, or
        // b) Plain vowel followed by a consonant phoneme (medial r — "inter-",
        //    "current" if rr wasn't in CONSONANT_SPELLINGS).
        // Does NOT fire at end-of-word for plain vowels → UK "power","mother",'r' stays mute.
        const nextIsConsonant = nextDisplay !== undefined && !isPlainVowelDisplay(nextDisplay) && !R_COLORED.has(nextDisplay) && nextDisplay !== 'r';
        if (pos < wLen && (word[pos] === 'r' || word[pos] === 'R') && nextDisplay !== 'r') {
            if (R_COLORED.has(display) || nextIsConsonant) pos++;
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
            c: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_SILENT"],
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
                c: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"],
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
        const color = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getColor"])(display);
        const isCons = !color;
        const isStressed = accented && isVowel;
        nodes.push({
            t: consumed,
            s: display,
            c: color ?? (isCons ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_SILENT"]),
            u: isStressed,
            x: isCons
        });
    }
    // Remaining letters → silent tail
    if (pos < wLen) nodes.push({
        t: word.slice(pos),
        s: '',
        c: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_SILENT"],
        u: false,
        x: false
    });
    return nodes;
}
}),
"[project]/src/lib/engine/score.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/colorMap.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$align$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/align.ts [app-ssr] (ecmascript)");
;
;
function scoreNodes(nodes) {
    return nodes.filter((n)=>n.t && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"]).reduce((sum, n)=>sum + n.t.length, 0);
}
function extractProps(nodes) {
    const colorCounts = {};
    let hasSilent = false;
    let hasStress = false;
    let syllableCount = 0;
    for (const n of nodes){
        if (n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.t && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$align$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isGraphicCons"])(n.t)) hasSilent = true;
        if (n.u) hasStress = true;
        if (n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] && n.t) {
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
"[project]/src/lib/engine/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$segment$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/segment.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$align$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/align.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/colorMap.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$score$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/score.ts [app-ssr] (ecmascript)");
;
;
;
function processIpa(word, rawIpa) {
    if (!rawIpa?.trim()) {
        return [
            {
                t: word,
                s: '',
                c: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_SILENT"],
                u: false,
                x: false
            }
        ];
    }
    const segs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$segment$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["segment"])(rawIpa);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$align$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["align"])(word, segs);
}
;
;
;
;
}),
"[project]/src/lib/engine/display.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// engine/display.ts
// The ONLY place that decides what a node looks like on screen.
// WordRenderer calls resolveDisplay() and just renders the result —
// no classification logic should live in the component at all.
//
// Input:  RenderNode[] after applyRegexOverrides() has run
// Output: DisplayNode[] — one entry per node, all display decisions made
__turbopack_context__.s([
    "COLOR_CONSONANT",
    ()=>COLOR_CONSONANT,
    "COLOR_SILENT",
    ()=>COLOR_SILENT,
    "DIPHTHONG_END",
    ()=>DIPHTHONG_END,
    "DIPHTHONG_START",
    ()=>DIPHTHONG_START,
    "SYLLABIC_MARKER",
    ()=>SYLLABIC_MARKER,
    "resolveDisplay",
    ()=>resolveDisplay
]);
const COLOR_SILENT = '#000000';
const COLOR_CONSONANT = '#000000';
const SYLLABIC_MARKER = '\u200d' // must match renderNode.ts
;
const DIPHTHONG_START = '#FF3399';
const DIPHTHONG_END = '#CC0000';
const SCHWA = '#888888';
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
    if (n.c === COLOR_SILENT) return true;
    if (!n.t || n.t.length === 0) return false;
    // A node is mute when the engine gave it a vowel color (meaning it carries
    // a vowel phoneme) but its letters are all graphic consonants — classic
    // "silent consonant" case, e.g. 'k' in 'knight'.
    const hasVowelColor = n.c !== COLOR_CONSONANT && n.c !== '' && n.c !== undefined;
    if (hasVowelColor && isGraphicConsonant(n.t)) return true;
    return false;
}
function isVowelNode(n) {
    if (!n.t || n.t.length === 0) return false;
    if (isMute(n)) return false;
    if (n.c === COLOR_CONSONANT || n.x || n.c === '') return false;
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
                anchorColor = rn.c && rn.c !== '' ? rn.c : COLOR_CONSONANT;
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
        const mute = isMute(n) || isGlide && !isDiph;
        const runAnchor = underlineColorMap.get(i) ?? COLOR_CONSONANT;
        // Final color decision — one place, one pass, explicit priority:
        let color;
        if (isTrueSyl) color = COLOR_CONSONANT; // syllabic consonant
        else if (isDiph) color = isUnder && !mute // diphthong with underline → solid
         ? runAnchor : 'transparent'; // gradient handled via gradient flag
        else if (mute) color = COLOR_SILENT;
        else color = n.c && n.c !== '' ? n.c : COLOR_CONSONANT;
        if (isUnder && !isTrueSyl && !mute) color = runAnchor;
        return {
            t: n.t ?? '',
            color,
            underline: isUnder && !isTrueSyl && !mute,
            gradient: isDiph && !(isUnder && !mute),
            mute,
            syllabic: isTrueSyl,
            underlineColor: runAnchor,
            sound: n.s && n.s !== SYLLABIC_MARKER ? n.s : ''
        };
    });
}
;
}),
"[project]/src/components/WordRenderer.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WordRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ruleConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ruleConfig.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/engine/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/display.ts [app-ssr] (ecmascript)");
;
;
;
function WordRenderer({ nodes, wordStr }) {
    const renderNodes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ruleConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyRegexOverrides"])(wordStr, nodes, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ruleConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"].regexRules);
    const displayNodes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveDisplay"])(renderNodes);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "eic-word",
        children: displayNodes.map((d, i)=>{
            if (!d.t) return null;
            const style = d.gradient ? {
                background: `linear-gradient(to right, ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DIPHTHONG_START"]}, ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DIPHTHONG_END"]})`,
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
                d.underline ? 'eic-stressed' : '',
                d.mute ? 'eic-silent' : ''
            ].filter(Boolean).join(' ');
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: style,
                className: classes,
                title: d.sound || undefined,
                children: d.t
            }, i, false, {
                fileName: "[project]/src/components/WordRenderer.tsx",
                lineNumber: 45,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/src/components/WordRenderer.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/game/ColourGame.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ColourGame
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordRenderer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/WordRenderer.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/gameTypes.ts [app-ssr] (ecmascript)");
'use client';
;
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
function ColourGame({ word, phase, lastCorrect, onAnswer }) {
    const correct = word.dominantColor;
    // Build 4 options: 1 correct + 3 random distractors
    const options = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const all = Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_LABELS"]).filter((c)=>c !== correct);
        const distractors = shuffle(all).slice(0, 3);
        return shuffle([
            correct,
            ...distractors
        ]);
    }, [
        correct
    ]);
    // Auto-speak word
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (phase !== 'playing') return;
        fetch('/api/speak', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                word: word.word
            })
        }).then((r)=>r.blob()).then((blob)=>new Audio(URL.createObjectURL(blob)).play()).catch(()=>{});
    }, [
        word.word,
        phase
    ]);
    const isPlaying = phase === 'playing';
    const isFeedback = phase === 'feedback';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "cg-wrap",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "game-instruction",
                children: [
                    "What sound does the ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "highlighted colour"
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/ColourGame.tsx",
                        lineNumber: 55,
                        columnNumber: 29
                    }, this),
                    " represent?"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/ColourGame.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "cg-word-display",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordRenderer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    nodes: word.nodes,
                    wordStr: word.word
                }, void 0, false, {
                    fileName: "[project]/src/components/game/ColourGame.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/game/ColourGame.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "cg-swatch-row",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "cg-swatch",
                        style: {
                            background: correct
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/ColourGame.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "cg-swatch-label",
                        children: "dominant sound"
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/ColourGame.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/ColourGame.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "cg-options",
                children: options.map((color)=>{
                    const info = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_LABELS"][color];
                    const isCorrect = color === correct;
                    const btnClass = [
                        'cg-option',
                        isFeedback && isCorrect ? 'correct' : '',
                        isFeedback && !isCorrect ? 'incorrect' : ''
                    ].filter(Boolean).join(' ');
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: btnClass,
                        disabled: !isPlaying,
                        onClick: ()=>onAnswer(isCorrect),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "cg-opt-dot",
                                style: {
                                    background: color
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/game/ColourGame.tsx",
                                lineNumber: 87,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "cg-opt-text",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "cg-opt-label",
                                        children: info?.label ?? color
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/game/ColourGame.tsx",
                                        lineNumber: 89,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "cg-opt-ex",
                                        children: info?.example ?? ''
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/game/ColourGame.tsx",
                                        lineNumber: 90,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/game/ColourGame.tsx",
                                lineNumber: 88,
                                columnNumber: 15
                            }, this),
                            isFeedback && isCorrect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "cg-tick",
                                children: "✓"
                            }, void 0, false, {
                                fileName: "[project]/src/components/game/ColourGame.tsx",
                                lineNumber: 92,
                                columnNumber: 43
                            }, this)
                        ]
                    }, color, true, {
                        fileName: "[project]/src/components/game/ColourGame.tsx",
                        lineNumber: 81,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/game/ColourGame.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            isFeedback && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `cg-feedback ${lastCorrect ? 'fb-correct' : 'fb-wrong'}`,
                children: lastCorrect ? `✓ Yes! "${word.word}" has the ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_LABELS"][correct]?.label} sound.` : `The correct answer is ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_LABELS"][correct]?.label} — as in ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_LABELS"][correct]?.example}.`
            }, void 0, false, {
                fileName: "[project]/src/components/game/ColourGame.tsx",
                lineNumber: 100,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/game/ColourGame.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/game/SilentGame.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SilentGame
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
const SILENT = '#000000';
const GRAPHIC_CONS = new Set('bcdfghjklmnpqrstvxz');
function isGraphicCons(t) {
    return !!t && [
        ...t.toLowerCase()
    ].every((c)=>GRAPHIC_CONS.has(c));
}
function SilentGame({ word, phase, lastCorrect, onAnswer }) {
    const [tapped, setTapped] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setTapped(new Set());
    }, [
        word.word
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (phase !== 'playing') return;
        fetch('/api/speak', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                word: word.word
            })
        }).then((r)=>r.blob()).then((blob)=>new Audio(URL.createObjectURL(blob)).play()).catch(()=>{});
    }, [
        word.word,
        phase
    ]);
    // Silent nodes: c==SILENT AND grapheme is a graphic consonant
    const silentIndices = word.nodes.map((n, i)=>({
            n,
            i
        })).filter(({ n })=>n.c === SILENT && n.t && isGraphicCons(n.t)).map(({ i })=>i);
    const isPlaying = phase === 'playing';
    const isFeedback = phase === 'feedback';
    function handleTap(idx) {
        if (!isPlaying) return;
        setTapped((prev)=>{
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    }
    function handleSubmit() {
        if (!isPlaying) return;
        // Correct if tapped set matches silent set exactly
        const correct = silentIndices.length > 0 && silentIndices.every((i)=>tapped.has(i)) && [
            ...tapped
        ].every((i)=>silentIndices.includes(i));
        onAnswer(correct);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "sg-wrap",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "game-instruction",
                children: [
                    "Tap all the ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "silent letters"
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/SilentGame.tsx",
                        lineNumber: 70,
                        columnNumber: 21
                    }, this),
                    " — the ones that make no sound."
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/SilentGame.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sg-letters",
                children: word.nodes.map((n, i)=>{
                    if (!n.t) return null;
                    const isSilent = silentIndices.includes(i);
                    const isTapped = tapped.has(i);
                    const isClickable = isPlaying && isGraphicCons(n.t);
                    // Feedback colouring
                    let feedbackClass = '';
                    if (isFeedback) {
                        if (isSilent && isTapped) feedbackClass = 'sg-reveal-correct';
                        if (isSilent && !isTapped) feedbackClass = 'sg-reveal-missed';
                        if (!isSilent && isTapped) feedbackClass = 'sg-reveal-wrong';
                    }
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: [
                            'sg-letter',
                            isTapped ? 'sg-tapped' : '',
                            !isClickable ? 'sg-noclick' : '',
                            feedbackClass
                        ].filter(Boolean).join(' '),
                        style: {
                            color: isFeedback ? isSilent ? '#000000' : n.c || '#000' : isTapped ? '#000000' : n.c || '#000'
                        },
                        onClick: ()=>handleTap(i),
                        disabled: !isClickable || isFeedback,
                        children: n.t
                    }, i, false, {
                        fileName: "[project]/src/components/game/SilentGame.tsx",
                        lineNumber: 90,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/game/SilentGame.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this),
            isPlaying && silentIndices.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "sg-submit",
                onClick: handleSubmit,
                children: "Check →"
            }, void 0, false, {
                fileName: "[project]/src/components/game/SilentGame.tsx",
                lineNumber: 113,
                columnNumber: 9
            }, this),
            isPlaying && silentIndices.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sg-hint",
                children: [
                    "This word has no silent letters — tap Check!",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "sg-submit",
                        onClick: ()=>onAnswer(tapped.size === 0),
                        children: "Check →"
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/SilentGame.tsx",
                        lineNumber: 121,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/SilentGame.tsx",
                lineNumber: 119,
                columnNumber: 9
            }, this),
            isFeedback && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `cg-feedback ${lastCorrect ? 'fb-correct' : 'fb-wrong'}`,
                children: lastCorrect ? `✓ Correct! Grey letters are always silent.` : `Not quite. Silent letters are shown in grey — they have no sound.`
            }, void 0, false, {
                fileName: "[project]/src/components/game/SilentGame.tsx",
                lineNumber: 128,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/game/SilentGame.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/game/StressGame.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StressGame
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
const SILENT = '#000000';
const CONSONANT = '#000000';
const GRAPHIC_CONS = new Set('bcdfghjklmnpqrstvxz');
const SYLLABIC_MARKER = '\u200d';
function isVowelNode(n) {
    if (!n.t) return false;
    if (n.c === SILENT || n.c === CONSONANT) return false;
    if (n.x) return false;
    if ([
        ...n.t.toLowerCase()
    ].every((c)=>GRAPHIC_CONS.has(c))) return false;
    return true;
}
function StressGame({ word, phase, lastCorrect, onAnswer }) {
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setSelected(null);
    }, [
        word.word
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (phase !== 'playing') return;
        fetch('/api/speak', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                word: word.word
            })
        }).then((r)=>r.blob()).then((blob)=>new Audio(URL.createObjectURL(blob)).play()).catch(()=>{});
    }, [
        word.word,
        phase
    ]);
    // Build vowel groups (consecutive vowel nodes) as clickable units
    const groups = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const result = [];
        let i = 0;
        const nodes = word.nodes;
        while(i < nodes.length){
            const n = nodes[i];
            if (isVowelNode(n) || n.s === SYLLABIC_MARKER) {
                const indices = [
                    i
                ];
                let j = i + 1;
                while(j < nodes.length && (isVowelNode(nodes[j]) || nodes[j].s === SYLLABIC_MARKER)){
                    indices.push(j);
                    j++;
                }
                const label = indices.map((k)=>nodes[k].t).join('');
                if (label) result.push({
                    indices,
                    label
                });
                i = j;
            } else {
                i++;
            }
        }
        return result;
    }, [
        word.nodes
    ]);
    // Correct group = the one containing a stressed (u=true) node
    const correctGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return groups.findIndex((g)=>g.indices.some((i)=>word.nodes[i].u === true));
    }, [
        groups,
        word.nodes
    ]);
    const isPlaying = phase === 'playing';
    const isFeedback = phase === 'feedback';
    function handleSelect(groupIdx) {
        if (!isPlaying) return;
        setSelected(groupIdx);
        onAnswer(groupIdx === correctGroup);
    }
    // Render word with group boundaries visible
    const rendered = [];
    let nodeIdx = 0;
    let groupIdx = 0;
    while(nodeIdx < word.nodes.length){
        const n = word.nodes[nodeIdx];
        const group = groups[groupIdx];
        if (group && group.indices[0] === nodeIdx) {
            // Render as a clickable group
            const gIdx = groupIdx;
            const isSelected = selected === gIdx;
            const isCorrect = gIdx === correctGroup;
            const btnClass = [
                'stress-group',
                isSelected ? 'sg-selected' : '',
                isFeedback && isCorrect ? 'sg-correct-group' : '',
                isFeedback && isSelected && !isCorrect ? 'sg-wrong-group' : ''
            ].filter(Boolean).join(' ');
            rendered.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: btnClass,
                disabled: !isPlaying,
                onClick: ()=>handleSelect(gIdx),
                style: {
                    color: n.c !== SILENT ? n.c : undefined
                },
                children: group.label
            }, `g-${gIdx}`, false, {
                fileName: "[project]/src/components/game/StressGame.tsx",
                lineNumber: 111,
                columnNumber: 9
            }, this));
            nodeIdx = group.indices[group.indices.length - 1] + 1;
            groupIdx++;
        } else {
            // Non-vowel node — render as plain span
            if (n.t) {
                rendered.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "stress-cons",
                    style: {
                        color: n.c === SILENT ? '#000000' : n.c || '#000'
                    },
                    children: n.t
                }, `n-${nodeIdx}`, false, {
                    fileName: "[project]/src/components/game/StressGame.tsx",
                    lineNumber: 128,
                    columnNumber: 11
                }, this));
            }
            nodeIdx++;
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "stg-wrap",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "game-instruction",
                children: [
                    "Tap the ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "stressed vowel group"
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/StressGame.tsx",
                        lineNumber: 144,
                        columnNumber: 17
                    }, this),
                    " — the underlined part when you read it."
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/StressGame.tsx",
                lineNumber: 143,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "stg-word",
                children: rendered
            }, void 0, false, {
                fileName: "[project]/src/components/game/StressGame.tsx",
                lineNumber: 147,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "stg-hint-text",
                children: [
                    "Listen again:",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "stg-listen",
                        onClick: ()=>{
                            fetch('/api/speak', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    word: word.word
                                })
                            }).then((r)=>r.blob()).then((b)=>new Audio(URL.createObjectURL(b)).play()).catch(()=>{});
                        },
                        children: [
                            "🔊 ",
                            word.word
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/game/StressGame.tsx",
                        lineNumber: 153,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/StressGame.tsx",
                lineNumber: 151,
                columnNumber: 7
            }, this),
            isFeedback && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `cg-feedback ${lastCorrect ? 'fb-correct' : 'fb-wrong'}`,
                children: lastCorrect ? `✓ Correct! The stress falls on "${groups[correctGroup]?.label}".` : `The stressed syllable is "${groups[correctGroup]?.label}" — listen for the longer, louder vowel.`
            }, void 0, false, {
                fileName: "[project]/src/components/game/StressGame.tsx",
                lineNumber: 162,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/game/StressGame.tsx",
        lineNumber: 142,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/game/GameProgress.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GameProgress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/gameTypes.ts [app-ssr] (ecmascript)");
'use client';
;
;
function GameProgress({ game, onExit }) {
    const progress = game.totalRounds > 0 ? game.roundsDone / game.totalRounds * 100 : 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "gp-wrap",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "gp-top",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "gp-exit",
                        onClick: onExit,
                        title: "Exit",
                        children: "←"
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/GameProgress.tsx",
                        lineNumber: 19,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "gp-level-badge",
                        children: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LEVEL_INFO"][game.level].icon,
                            " ",
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LEVEL_INFO"][game.level].name
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/game/GameProgress.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "gp-stats",
                        children: [
                            game.streak >= 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "gp-streak",
                                children: [
                                    "🔥 ",
                                    game.streak
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/game/GameProgress.tsx",
                                lineNumber: 25,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "gp-score",
                                children: [
                                    game.score,
                                    "/",
                                    game.roundsDone
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/game/GameProgress.tsx",
                                lineNumber: 27,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "gp-xp",
                                children: [
                                    "+",
                                    game.xp,
                                    " XP"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/game/GameProgress.tsx",
                                lineNumber: 28,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/game/GameProgress.tsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/GameProgress.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "gp-bar-wrap",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "gp-bar-fill",
                        style: {
                            width: `${progress}%`
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/GameProgress.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "gp-bar-dots",
                        children: Array.from({
                            length: game.totalRounds
                        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: [
                                    'gp-dot',
                                    i < game.roundsDone ? game.words[i] ? 'done' : 'done' : i === game.current ? 'current' : ''
                                ].filter(Boolean).join(' ')
                            }, i, false, {
                                fileName: "[project]/src/components/game/GameProgress.tsx",
                                lineNumber: 36,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/GameProgress.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/GameProgress.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/game/GameProgress.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/learn/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LearnPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/gameTypes.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$ColourGame$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/game/ColourGame.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$SilentGame$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/game/SilentGame.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$StressGame$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/game/StressGame.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$GameProgress$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/game/GameProgress.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
const ROUNDS = 10;
async function fetchWords(level) {
    const res = await fetch(`/api/game?level=${level}&n=${ROUNDS}`);
    const data = await res.json();
    return data.words ?? [];
}
function LearnPage() {
    const [game, setGame] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const startGame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (level)=>{
        setLoading(true);
        const words = await fetchWords(level);
        setLoading(false);
        if (!words.length) return;
        setGame({
            level,
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
    }, []);
    const onAnswer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((correct)=>{
        setGame((prev)=>{
            if (!prev) return prev;
            const streak = correct ? prev.streak + 1 : 0;
            const xpGain = correct ? 10 + streak * 2 : 0;
            const roundsDone = prev.roundsDone + 1;
            const isLast = prev.current >= prev.words.length - 1;
            return {
                ...prev,
                score: prev.score + (correct ? 1 : 0),
                streak,
                maxStreak: Math.max(prev.maxStreak, streak),
                xp: prev.xp + xpGain,
                roundsDone,
                phase: 'feedback',
                lastCorrect: correct,
                current: isLast ? prev.current : prev.current
            };
        });
        // After feedback delay, advance or end
        setTimeout(()=>{
            setGame((prev)=>{
                if (!prev) return prev;
                const isLast = prev.current >= prev.words.length - 1;
                return {
                    ...prev,
                    current: isLast ? prev.current : prev.current + 1,
                    phase: isLast ? 'done' : 'playing'
                };
            });
        }, 1200);
    }, []);
    const currentWord = game?.words[game.current] ?? null;
    // Intro screen
    if (!game && !loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "game-home",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "game-hero",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "game-logo",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        color: '#CC0000'
                                    },
                                    children: "E"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/learn/page.tsx",
                                    lineNumber: 88,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        color: '#00b0f0'
                                    },
                                    children: "i"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/learn/page.tsx",
                                    lineNumber: 89,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        color: '#008E40'
                                    },
                                    children: "C"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/learn/page.tsx",
                                    lineNumber: 90,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/learn/page.tsx",
                            lineNumber: 87,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "game-title",
                            children: "Learn English in Colours"
                        }, void 0, false, {
                            fileName: "[project]/src/app/learn/page.tsx",
                            lineNumber: 92,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "game-subtitle",
                            children: "Master the colour system — read any word by its sound."
                        }, void 0, false, {
                            fileName: "[project]/src/app/learn/page.tsx",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/learn/page.tsx",
                    lineNumber: 86,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "game-levels",
                    children: [
                        1,
                        2,
                        3
                    ].map((level)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "game-level-card",
                            onClick: ()=>startGame(level),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "game-level-icon",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LEVEL_INFO"][level].icon
                                }, void 0, false, {
                                    fileName: "[project]/src/app/learn/page.tsx",
                                    lineNumber: 105,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "game-level-name",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LEVEL_INFO"][level].name
                                }, void 0, false, {
                                    fileName: "[project]/src/app/learn/page.tsx",
                                    lineNumber: 106,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "game-level-desc",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameTypes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LEVEL_INFO"][level].desc
                                }, void 0, false, {
                                    fileName: "[project]/src/app/learn/page.tsx",
                                    lineNumber: 107,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "game-level-start",
                                    children: "Start →"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/learn/page.tsx",
                                    lineNumber: 108,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, level, true, {
                            fileName: "[project]/src/app/learn/page.tsx",
                            lineNumber: 100,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/app/learn/page.tsx",
                    lineNumber: 98,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "game-colour-guide",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "game-guide-title",
                            children: "The EiC Colour System"
                        }, void 0, false, {
                            fileName: "[project]/src/app/learn/page.tsx",
                            lineNumber: 114,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "game-colour-grid",
                            children: [
                                {
                                    c: '#00b0f0',
                                    label: 'æ',
                                    ex: 'cat, hat, black'
                                },
                                {
                                    c: '#008E40',
                                    label: 'ɑ / ʌ',
                                    ex: 'car, cup, love'
                                },
                                {
                                    c: '#888888',
                                    label: 'ə',
                                    ex: 'about, sofa'
                                },
                                {
                                    c: '#EE5B00',
                                    label: 'e / ɛ',
                                    ex: 'bed, say, they'
                                },
                                {
                                    c: '#CC0000',
                                    label: 'i / ɪ',
                                    ex: 'see, sit, been'
                                },
                                {
                                    c: '#FF3399',
                                    label: 'ɒ / ɔ',
                                    ex: 'hot, or, more'
                                },
                                {
                                    c: '#7030A0',
                                    label: 'u / ʊ',
                                    ex: 'moon, book, true'
                                },
                                {
                                    c: '#4472C4',
                                    label: 'aɪ/aʊ',
                                    ex: 'my, now, eye'
                                },
                                {
                                    c: '#E57373',
                                    label: 'j / w',
                                    ex: 'yes, we, you'
                                },
                                {
                                    c: '#000000',
                                    label: '∅',
                                    ex: 'consonants'
                                },
                                {
                                    c: '#000000',
                                    label: '—',
                                    ex: 'silent letters'
                                }
                            ].map(({ c, label, ex })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "game-colour-item",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "game-colour-swatch",
                                            style: {
                                                background: c
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/learn/page.tsx",
                                            lineNumber: 130,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "game-colour-info",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "game-colour-label",
                                                    children: label
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/learn/page.tsx",
                                                    lineNumber: 132,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "game-colour-ex",
                                                    children: ex
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/learn/page.tsx",
                                                    lineNumber: 133,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/learn/page.tsx",
                                            lineNumber: 131,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, c, true, {
                                    fileName: "[project]/src/app/learn/page.tsx",
                                    lineNumber: 129,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/learn/page.tsx",
                            lineNumber: 115,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/learn/page.tsx",
                    lineNumber: 113,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/learn/page.tsx",
            lineNumber: 85,
            columnNumber: 7
        }, this);
    }
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "game-home",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "game-loading",
                children: "Loading words…"
            }, void 0, false, {
                fileName: "[project]/src/app/learn/page.tsx",
                lineNumber: 146,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/learn/page.tsx",
            lineNumber: 145,
            columnNumber: 7
        }, this);
    }
    if (!game || !currentWord) return null;
    // Done screen
    if (game.phase === 'done') {
        const pct = Math.round(game.score / game.totalRounds * 100);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "game-home",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "game-done",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "game-done-emoji",
                        children: pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 159,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "game-done-title",
                        children: pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good work!' : 'Keep practising!'
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 162,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "game-done-stats",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "game-done-stat",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "game-done-num",
                                        children: [
                                            game.score,
                                            "/",
                                            game.totalRounds
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 167,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "game-done-lbl",
                                        children: "correct"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 168,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/learn/page.tsx",
                                lineNumber: 166,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "game-done-stat",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "game-done-num",
                                        children: game.maxStreak
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 171,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "game-done-lbl",
                                        children: "best streak"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 172,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/learn/page.tsx",
                                lineNumber: 170,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "game-done-stat",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "game-done-num",
                                        children: [
                                            "+",
                                            game.xp
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 175,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "game-done-lbl",
                                        children: "XP earned"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/learn/page.tsx",
                                        lineNumber: 176,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/learn/page.tsx",
                                lineNumber: 174,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 165,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "game-done-actions",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "game-play-again",
                                onClick: ()=>startGame(game.level),
                                children: "Play again"
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/page.tsx",
                                lineNumber: 180,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "game-change-level",
                                onClick: ()=>setGame(null),
                                children: "Change level"
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/page.tsx",
                                lineNumber: 183,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 179,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/learn/page.tsx",
                lineNumber: 158,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/learn/page.tsx",
            lineNumber: 157,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "game-home",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$GameProgress$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                game: game,
                onExit: ()=>setGame(null)
            }, void 0, false, {
                fileName: "[project]/src/app/learn/page.tsx",
                lineNumber: 194,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "game-arena",
                children: [
                    game.level === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$ColourGame$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        word: currentWord,
                        phase: game.phase,
                        lastCorrect: game.lastCorrect,
                        onAnswer: onAnswer
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 198,
                        columnNumber: 11
                    }, this),
                    game.level === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$SilentGame$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        word: currentWord,
                        phase: game.phase,
                        lastCorrect: game.lastCorrect,
                        onAnswer: onAnswer
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 206,
                        columnNumber: 11
                    }, this),
                    game.level === 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$game$2f$StressGame$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        word: currentWord,
                        phase: game.phase,
                        lastCorrect: game.lastCorrect,
                        onAnswer: onAnswer
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/page.tsx",
                        lineNumber: 214,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/learn/page.tsx",
                lineNumber: 196,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/learn/page.tsx",
        lineNumber: 193,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_07w7dqe._.js.map