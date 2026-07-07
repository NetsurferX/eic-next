module.exports = [
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
            hex: '#000000',
            label: 'ə — schwa (SPEC: negru)',
            category: 'vowel'
        },
        {
            sounds: [
                'e',
                'ɛ'
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
                'o'
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
                'oʊ',
                'əw'
            ],
            hex: '#FCD116',
            label: 'əʊ — go/snow (SPEC: tricolor gradient, placeholder hue)',
            category: 'vowel'
        },
        {
            sounds: [
                'eɪ',
                'eỷ'
            ],
            hex: '#00246C',
            label: 'eɪ — name/day (SPEC: split from e/ɛ)',
            category: 'vowel'
        },
        {
            sounds: [
                'ju',
                'ỷu',
                'juː'
            ],
            hex: '#833C0B',
            label: 'juː — cute/beauty (SPEC: new)',
            category: 'vowel'
        },
        {
            sounds: [
                'aɪ',
                'aỷ'
            ],
            hex: '#4472C4',
            label: 'aɪ — my/time',
            category: 'vowel'
        },
        {
            sounds: [
                'aw',
                'aʊ'
            ],
            hex: '#23D300',
            label: 'aʊ — tower/flower (SPEC: split from aɪ)',
            category: 'vowel'
        },
        {
            sounds: [
                'oɪ',
                'oỷ',
                'ɔɪ'
            ],
            hex: '#FF3399',
            label: 'ɔɪ — boy/coin (SPEC: bicolor roz→roșu, placeholder hue)',
            category: 'vowel'
        },
        {
            sounds: [
                'j',
                'ỷ'
            ],
            hex: '#CC0000',
            label: 'j/ỷ — yes (SPEC: red, same as i/ɪ)',
            category: 'semivowel'
        },
        {
            sounds: [
                'w'
            ],
            hex: '#000000',
            label: 'w — we (SPEC: negru, same as consonants)',
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
        },
        // ── B_tehnic §6.2 — V-R forced-schwa lexical sets ──────────────────────
        // Whole-span colour override for each set. Splitting the vowel run from
        // the syllabic-r glyph (white-fill/black-border per §6.1) still needs
        // align.ts/display.ts work — see EiC-tehnic-spec.md §10.5.
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
        },
        // ── B_tehnic Tabelul 5 — manual y/w exceptions ─────────────────────────
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
        },
        // ── B_tehnic §2.b/§2.c — expressly-mute e cases ────────────────────────
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
"[project]/src/app/rules/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RulesPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ruleConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ruleConfig.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
// Deep clone
function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
// Resolves a node's actual display colour/silent/underline state — shared by
// renderWord() and the Rule Bridge tab's clickable stage so they never drift.
function nodeVisual(n, config) {
    const color = n.c ?? resolveColor(n.s, config);
    const isSilent = n.isSilent || !color;
    const underlined = n.underlineOverride === 'deny' ? false : n.underlineOverride === 'force' ? true : n.isStressed;
    return {
        color,
        isSilent,
        underlined
    };
}
// Mini word renderer using config colours — respects regex-rule overrides
// already baked into the node (c / isSilent / underlineOverride) from
// applyRegexOverrides(), falling back to the normal colour-map lookup.
function renderWord(word, nodes, config) {
    return nodes.map((n, i)=>{
        const { color, isSilent, underlined } = nodeVisual(n, config);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                color: isSilent ? '#000000' : color ?? '#000',
                textDecoration: underlined && !isSilent ? 'underline' : 'none',
                textUnderlineOffset: '6px',
                textDecorationThickness: '2.5px',
                fontWeight: 600
            },
            title: n.s,
            children: n.t
        }, i, false, {
            fileName: "[project]/src/app/rules/page.tsx",
            lineNumber: 36,
            columnNumber: 7
        }, this);
    });
}
// Same "current state" string format used in the Test tab's test cases, so
// entries created from the Bridge tab read identically in the generated prompt.
function nodeToStr(n) {
    return `[${n.t}:${n.s}:${n.isSilent ? 'silent' : ''}]`;
}
function resolveColor(sound, config) {
    for (const entry of config.colors){
        if (entry.sounds.includes(sound)) return entry.hex;
        if (entry.sounds.some((s)=>s[0] === sound[0] && s.length === 1)) return entry.hex;
    }
    return null;
}
// Tied to the real modules in the codebase, so a flagged fix in the Bridge
// tab routes to the right layer instead of guessing.
const BRIDGE_LOCATIONS = {
    '': 'Not sure — find the right layer',
    colormap: 'Sound → colour mapping (pipeline.ts COLOR_MAP, ruleConfig.ts colors[])',
    alignment: 'Grapheme/phoneme alignment (pipeline.ts mapToWord / segment / GRAPHIC_VOWELS)',
    underline: 'Stress underline logic (WordRenderer.tsx buildUnderlined, ruleConfig.ts underline rules)',
    regex: 'Needs a pattern override (ruleConfig.ts RegexRule)'
};
// The governing system, distilled from English_in_Colours.docx (Dorel's source
// spec). Every Bridge flag should be traceable back to one of these — a fix
// that can't be justified by a named principle is a guess, not a rule.
const PRINCIPLES = {
    '': '— none selected —',
    phonemeMute: 'Cu Fonem vs. Fără Fonem (Mută): a grapheme is coloured only if it expresses ' + 'a phoneme (e.g. "top"); a letter with no phoneme is mute and renders grey ' + '(e.g. the "b" in "crumb"). Silent ≠ wrong colour — it\'s "no phoneme assigned".',
    schwaFusion: 'Legea priorității schwa (forced fusion): /ək, əl, əm, ən, ər/ before c/l/m/n/r ' + 'force-fuse into a single white-with-black-border node — schwa never gets its ' + 'own colour when followed by one of these consonants.',
    vrPriority: 'V+R artificial priority (poor/cure/near/bear/fire/hour sets): the vowel ' + 'phoneme immediately preceding a schwa+r takes priority and dictates the ' + 'colour for the whole V+R unit, not the schwa.',
    diphthongGradient: 'Diphthong gradient rule: a true diphthong (aỷ, eỷ, aw, etc.) is a 2-colour ' + 'gradient between its component vowel colours, not a flat single hue — ' + 'flat colour on a diphthong node is itself a bug.',
    syllabicConsonant: 'Syllabic consonant rule: a consonant carrying its own syllable (the l in ' + '"bottle", the n in "button") renders black with a white border — distinct ' + 'from both a normal consonant and from schwa-fusion white.'
};
function RulesPage() {
    const [config, setConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>clone(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ruleConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"]));
    const [testCases, setTestCases] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [activeTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('bridge');
    // ── Rule Bridge tab state ─────────────────────────────────────────────────
    const [bridgeWordInput, setBridgeWordInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('knight');
    const [bridgeWord, setBridgeWord] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [bridgeNodes, setBridgeNodes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [bridgeLoading, setBridgeLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [bridgeError, setBridgeError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [bridgeSelected, setBridgeSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [bridgeColorIdx, setBridgeColorIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [bridgeSilent, setBridgeSilent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [bridgeUnderline, setBridgeUnderline] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [bridgeLocation, setBridgeLocation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [bridgePrinciple, setBridgePrinciple] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [bridgeHypothesis, setBridgeHypothesis] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [bridgeCounter, setBridgeCounter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const diffs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ruleConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["diffConfigs"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ruleConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"], config);
    // Seed the open items from the 2026-06-19 rule-change request so they live
    // in the same Generated Prompt pipeline as anything flagged through Bridge.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setTestCases((prev)=>prev.length > 0 ? prev : [
                {
                    word: 'knight',
                    current: '"k" — [k:n:]',
                    desired: 'silent (grey)',
                    note: 'LIKELY LOCATION: Not sure — find the right layer | SCOPE: general rule only — no per-word branch or lookup entry | LIKELY PRINCIPLE: Cu Fonem vs. Fără Fonem — "k" before "n" expresses no phoneme'
                },
                {
                    word: 'length',
                    current: '"e" — [e:ɛ:]',
                    desired: 'underline: force',
                    note: 'LIKELY LOCATION: Not sure — find the right layer | SCOPE: general rule only — no per-word branch or lookup entry'
                }
            ]);
    }, []);
    // ── Prompt generation ─────────────────────────────────────────────────────
    const prompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ruleConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generatePrompt"])(diffs, testCases, config);
    function copyPrompt() {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(()=>setCopied(false), 2000);
    }
    function removeTestCase(i) {
        setTestCases((prev)=>prev.filter((_, idx)=>idx !== i));
    }
    // ── Rule Bridge: pull real current state for a word, no guessing ─────────
    const loadBridgeWord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (w)=>{
        const wl = w.toLowerCase().trim();
        if (!wl) return;
        setBridgeLoading(true);
        setBridgeError(null);
        setBridgeSelected([]);
        setBridgeColorIdx(null);
        setBridgeSilent(false);
        setBridgeUnderline('');
        setBridgeHypothesis('');
        setBridgeCounter('');
        setBridgeLocation('');
        setBridgePrinciple('');
        try {
            const res = await fetch('/api/words', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    words: [
                        wl
                    ]
                })
            });
            const data = await res.json();
            const nodes = data.results?.[wl];
            setBridgeWord(wl);
            if (nodes) {
                setBridgeNodes((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ruleConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyRegexOverrides"])(wl, nodes, config.regexRules));
            } else {
                setBridgeNodes(null);
                setBridgeError('not in lexicon.db');
            }
        } catch  {
            setBridgeNodes(null);
            setBridgeError('lookup failed');
        }
        setBridgeLoading(false);
    }, [
        config.regexRules
    ]);
    const toggleBridgeSelect = (i)=>setBridgeSelected((prev)=>prev.includes(i) ? prev.filter((x)=>x !== i) : [
                ...prev,
                i
            ]);
    const cancelBridgeDraft = ()=>{
        setBridgeSelected([]);
        setBridgeColorIdx(null);
        setBridgeSilent(false);
        setBridgeUnderline('');
    };
    // Pushes a TestCase built from real current state — same shape, same
    // generatePrompt() pipeline as the Test tab. Never writes a regex rule
    // itself: generalising the pattern is a judgment call for whoever actions
    // the prompt, not something to guess from a single clicked example.
    function flagBridgeFix() {
        if (!bridgeNodes || bridgeSelected.length === 0) return;
        const sorted = [
            ...bridgeSelected
        ].sort((a, b)=>a - b);
        const chars = sorted.map((i)=>bridgeNodes[i].t || '∅').join('');
        const before = sorted.map((i)=>nodeToStr(bridgeNodes[i])).join(' ');
        const wanted = [];
        if (bridgeSilent) {
            wanted.push('silent (grey)');
        } else if (bridgeColorIdx !== null) {
            const c = config.colors[bridgeColorIdx];
            wanted.push(`${c.label} (${c.hex})`);
        }
        if (bridgeUnderline) wanted.push(`underline: ${bridgeUnderline}`);
        if (wanted.length === 0) return;
        const noteParts = [
            bridgeHypothesis ? `WHY: ${bridgeHypothesis}` : null,
            bridgeCounter ? `COUNTER-EXAMPLE: ${bridgeCounter}` : null,
            bridgePrinciple ? `GOVERNING PRINCIPLE (English in Colours spec): ${PRINCIPLES[bridgePrinciple]}` : null,
            `LIKELY LOCATION: ${BRIDGE_LOCATIONS[bridgeLocation]}`,
            'SCOPE: general rule only — no per-word branch or lookup entry'
        ].filter((p)=>p !== null);
        setTestCases((prev)=>[
                ...prev,
                {
                    word: bridgeWord,
                    current: `"${chars}" — ${before}`,
                    desired: wanted.join(' + '),
                    note: noteParts.join(' | ')
                }
            ]);
        cancelBridgeDraft();
        setBridgeHypothesis('');
        setBridgeCounter('');
        setBridgeLocation('');
        setBridgePrinciple('');
    }
    const testCasesList = testCases.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "test-cases-list",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "tc-list-title",
                children: [
                    "Added test cases (",
                    testCases.length,
                    ")"
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/rules/page.tsx",
                lineNumber: 249,
                columnNumber: 7
            }, this),
            testCases.map((tc, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "tc-item",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: [
                                '"',
                                tc.word,
                                '"'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/rules/page.tsx",
                            lineNumber: 252,
                            columnNumber: 11
                        }, this),
                        tc.desired && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "tc-desired",
                            children: [
                                " → ",
                                tc.desired
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/rules/page.tsx",
                            lineNumber: 253,
                            columnNumber: 26
                        }, this),
                        tc.note && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "tc-note",
                            children: [
                                " (",
                                tc.note,
                                ")"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/rules/page.tsx",
                            lineNumber: 254,
                            columnNumber: 26
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "tc-remove",
                            onClick: ()=>removeTestCase(i),
                            children: "×"
                        }, void 0, false, {
                            fileName: "[project]/src/app/rules/page.tsx",
                            lineNumber: 255,
                            columnNumber: 11
                        }, this)
                    ]
                }, i, true, {
                    fileName: "[project]/src/app/rules/page.tsx",
                    lineNumber: 251,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/rules/page.tsx",
        lineNumber: 248,
        columnNumber: 5
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rules-page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rules-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        className: "rules-back",
                        children: "← back"
                    }, void 0, false, {
                        fileName: "[project]/src/app/rules/page.tsx",
                        lineNumber: 266,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "rules-title",
                        children: "EiC Rule Editor"
                    }, void 0, false, {
                        fileName: "[project]/src/app/rules/page.tsx",
                        lineNumber: 267,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rules-diff-badge",
                        children: diffs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "diff-none",
                            children: "no changes"
                        }, void 0, false, {
                            fileName: "[project]/src/app/rules/page.tsx",
                            lineNumber: 270,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "diff-count",
                            children: [
                                diffs.length,
                                " change",
                                diffs.length > 1 ? 's' : ''
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/rules/page.tsx",
                            lineNumber: 271,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/rules/page.tsx",
                        lineNumber: 268,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/rules/page.tsx",
                lineNumber: 265,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rules-body",
                children: activeTab === 'bridge' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "rules-section",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "rules-section-title",
                            children: "Rule Bridge"
                        }, void 0, false, {
                            fileName: "[project]/src/app/rules/page.tsx",
                            lineNumber: 282,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "rules-section-desc",
                            children: "Load a real word, click the grapheme(s) that are wrong, say what they should be. Current state comes straight from lexicon.db via /api/words — nothing here is guessed. Flagging a fix adds it to the test cases below, which feed the Generated Prompt at the bottom of the page."
                        }, void 0, false, {
                            fileName: "[project]/src/app/rules/page.tsx",
                            lineNumber: 283,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                            style: {
                                marginBottom: '16px',
                                border: '1px solid #e7e5e4',
                                borderRadius: '10px',
                                padding: '10px 14px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                    style: {
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 600
                                    },
                                    children: "📖 Governing principles (English in Colours spec)"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 291,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    style: {
                                        fontSize: '0.8rem',
                                        color: '#57534e',
                                        lineHeight: 1.5,
                                        marginTop: '8px',
                                        paddingLeft: '18px'
                                    },
                                    children: Object.entries(PRINCIPLES).filter(([k])=>k).map(([key, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            style: {
                                                marginBottom: '6px'
                                            },
                                            children: label
                                        }, key, false, {
                                            fileName: "[project]/src/app/rules/page.tsx",
                                            lineNumber: 296,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 294,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/rules/page.tsx",
                            lineNumber: 290,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "test-input-row",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "test-word-input",
                                    placeholder: "Type a word…",
                                    value: bridgeWordInput,
                                    onChange: (e)=>setBridgeWordInput(e.target.value),
                                    onKeyDown: (e)=>e.key === 'Enter' && loadBridgeWord(bridgeWordInput)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 302,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "test-lookup-btn",
                                    onClick: ()=>loadBridgeWord(bridgeWordInput),
                                    children: bridgeLoading ? '…' : 'Load'
                                }, void 0, false, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 309,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        gap: '6px',
                                        marginLeft: '10px'
                                    },
                                    children: [
                                        'island',
                                        'gnome',
                                        'colonel'
                                    ].map((w)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>loadBridgeWord(w),
                                            style: {
                                                padding: '4px 12px',
                                                borderRadius: '999px',
                                                border: '1px solid #d6d3d1',
                                                background: '#fff',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                color: '#57534e'
                                            },
                                            children: w
                                        }, w, false, {
                                            fileName: "[project]/src/app/rules/page.tsx",
                                            lineNumber: 314,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 312,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/rules/page.tsx",
                            lineNumber: 301,
                            columnNumber: 13
                        }, this),
                        bridgeError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "rules-section-desc",
                            style: {
                                color: '#c44'
                            },
                            children: bridgeError
                        }, void 0, false, {
                            fileName: "[project]/src/app/rules/page.tsx",
                            lineNumber: 329,
                            columnNumber: 15
                        }, this),
                        bridgeNodes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '2px',
                                        alignItems: 'flex-end',
                                        fontFamily: 'serif',
                                        fontSize: '2.25rem',
                                        padding: '24px',
                                        background: '#fafaf9',
                                        border: '1px solid #e7e5e4',
                                        borderRadius: '12px',
                                        marginBottom: '8px'
                                    },
                                    children: bridgeNodes.map((n, i)=>{
                                        const { color, isSilent, underlined } = nodeVisual(n, config);
                                        const isSel = bridgeSelected.includes(i);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>toggleBridgeSelect(i),
                                            title: n.s || '(latent)',
                                            style: {
                                                padding: '2px 4px 6px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                background: isSel ? '#fef3c7' : 'transparent',
                                                outline: isSel ? '2px solid #fbbf24' : 'none',
                                                outlineOffset: '2px',
                                                cursor: 'pointer',
                                                color: isSilent ? '#000' : color ?? '#000',
                                                opacity: isSilent ? 0.45 : 1,
                                                fontStyle: isSilent ? 'italic' : 'normal',
                                                borderBottom: underlined && !isSilent ? '3px solid #3b82f6' : '3px solid transparent',
                                                fontWeight: 600
                                            },
                                            children: n.t || '·'
                                        }, i, false, {
                                            fileName: "[project]/src/app/rules/page.tsx",
                                            lineNumber: 346,
                                            columnNumber: 23
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 334,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "rules-section-desc",
                                    style: {
                                        marginTop: 0
                                    },
                                    children: "click the node(s) involved — each button is one grapheme node as the pipeline actually segmented it, not a raw letter"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 367,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true),
                        bridgeSelected.length > 0 && bridgeNodes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                border: '1px solid #e7e5e4',
                                borderRadius: '10px',
                                padding: '16px',
                                marginBottom: '20px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "rules-section-desc",
                                    style: {
                                        marginTop: 0
                                    },
                                    children: [
                                        '"',
                                        [
                                            ...bridgeSelected
                                        ].sort((a, b)=>a - b).map((i)=>bridgeNodes[i].t || '∅').join(''),
                                        '" should be —'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 376,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '6px',
                                        marginBottom: '10px'
                                    },
                                    children: [
                                        config.colors.map((c, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    setBridgeColorIdx(idx);
                                                    setBridgeSilent(false);
                                                },
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    border: bridgeColorIdx === idx ? '2px solid #111' : '1px solid #ccc',
                                                    background: '#fff',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            width: '12px',
                                                            height: '12px',
                                                            borderRadius: '50%',
                                                            background: c.hex,
                                                            display: 'inline-block'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/rules/page.tsx",
                                                        lineNumber: 392,
                                                        columnNumber: 23
                                                    }, this),
                                                    c.label
                                                ]
                                            }, idx, true, {
                                                fileName: "[project]/src/app/rules/page.tsx",
                                                lineNumber: 382,
                                                columnNumber: 21
                                            }, this)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setBridgeSilent((s)=>!s);
                                                setBridgeColorIdx(null);
                                            },
                                            style: {
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                border: bridgeSilent ? '2px solid #111' : '1px solid #ccc',
                                                background: bridgeSilent ? '#eee' : '#fff',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontStyle: 'italic'
                                            },
                                            children: "Silent (grey)"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/rules/page.tsx",
                                            lineNumber: 396,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 380,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginBottom: '10px',
                                        fontSize: '0.85rem'
                                    },
                                    children: [
                                        "Underline",
                                        ' ',
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            className: "color-cat-select",
                                            value: bridgeUnderline,
                                            onChange: (e)=>setBridgeUnderline(e.target.value),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "",
                                                    children: "— no override —"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/rules/page.tsx",
                                                    lineNumber: 416,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "force",
                                                    children: "force"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/rules/page.tsx",
                                                    lineNumber: 417,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "deny",
                                                    children: "deny"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/rules/page.tsx",
                                                    lineNumber: 418,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/rules/page.tsx",
                                            lineNumber: 411,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 409,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    className: "silent-input",
                                    style: {
                                        width: '100%',
                                        minHeight: '40px',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    },
                                    value: bridgeHypothesis,
                                    onChange: (e)=>setBridgeHypothesis(e.target.value),
                                    placeholder: "why, in your own words — e.g. this digraph is silent after a stressed vowel"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 422,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "silent-input",
                                    style: {
                                        width: '100%',
                                        marginTop: '6px'
                                    },
                                    value: bridgeCounter,
                                    onChange: (e)=>setBridgeCounter(e.target.value),
                                    placeholder: "optional — a word where this is NOT true"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 429,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    className: "color-cat-select",
                                    style: {
                                        width: '100%',
                                        marginTop: '6px'
                                    },
                                    value: bridgePrinciple,
                                    onChange: (e)=>setBridgePrinciple(e.target.value),
                                    title: "Which rule from English_in_Colours.docx justifies this fix",
                                    children: Object.entries(PRINCIPLES).map(([key, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: key,
                                            children: key ? `Principle: ${label.slice(0, 60)}…` : label
                                        }, key, false, {
                                            fileName: "[project]/src/app/rules/page.tsx",
                                            lineNumber: 444,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 436,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    className: "color-cat-select",
                                    style: {
                                        width: '100%',
                                        marginTop: '6px'
                                    },
                                    value: bridgeLocation,
                                    onChange: (e)=>setBridgeLocation(e.target.value),
                                    children: Object.entries(BRIDGE_LOCATIONS).map(([key, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: key,
                                            children: label
                                        }, key, false, {
                                            fileName: "[project]/src/app/rules/page.tsx",
                                            lineNumber: 454,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 447,
                                    columnNumber: 17
                                }, this),
                                bridgePrinciple && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "rules-section-desc",
                                    style: {
                                        marginTop: '6px',
                                        fontSize: '0.8rem'
                                    },
                                    children: PRINCIPLES[bridgePrinciple]
                                }, void 0, false, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 458,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginTop: '12px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: cancelBridgeDraft,
                                            style: {
                                                background: 'none',
                                                border: 'none',
                                                color: '#888',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            },
                                            children: "cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/rules/page.tsx",
                                            lineNumber: 464,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "silent-add-btn",
                                            disabled: !bridgeSilent && bridgeColorIdx === null && !bridgeUnderline,
                                            onClick: flagBridgeFix,
                                            children: "+ Flag this fix"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/rules/page.tsx",
                                            lineNumber: 470,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 463,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/rules/page.tsx",
                            lineNumber: 375,
                            columnNumber: 15
                        }, this),
                        testCasesList
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/rules/page.tsx",
                    lineNumber: 281,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/rules/page.tsx",
                lineNumber: 277,
                columnNumber: 7
            }, this),
            diffs.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rules-diffs",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "diffs-title",
                        children: "Changes from default"
                    }, void 0, false, {
                        fileName: "[project]/src/app/rules/page.tsx",
                        lineNumber: 490,
                        columnNumber: 11
                    }, this),
                    diffs.map((d, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "diff-row",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "diff-section",
                                    children: d.section
                                }, void 0, false, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 493,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "diff-field",
                                    children: d.field
                                }, void 0, false, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 494,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                    className: "diff-old",
                                    children: d.old
                                }, void 0, false, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 495,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "diff-arrow",
                                    children: "→"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 496,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                    className: "diff-new",
                                    children: d.new
                                }, void 0, false, {
                                    fileName: "[project]/src/app/rules/page.tsx",
                                    lineNumber: 497,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/src/app/rules/page.tsx",
                            lineNumber: 492,
                            columnNumber: 13
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/rules/page.tsx",
                lineNumber: 489,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rules-prompt",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "prompt-header",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "prompt-title",
                                children: "Generated Prompt"
                            }, void 0, false, {
                                fileName: "[project]/src/app/rules/page.tsx",
                                lineNumber: 506,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "prompt-actions",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "prompt-reset",
                                        onClick: ()=>{
                                            setConfig(clone(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ruleConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"]));
                                            setTestCases([]);
                                        },
                                        children: "Reset all"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/rules/page.tsx",
                                        lineNumber: 508,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "prompt-copy",
                                        onClick: copyPrompt,
                                        children: copied ? '✓ Copied!' : '📋 Copy prompt'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/rules/page.tsx",
                                        lineNumber: 511,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/rules/page.tsx",
                                lineNumber: 507,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/rules/page.tsx",
                        lineNumber: 505,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                        className: "prompt-text",
                        children: prompt
                    }, void 0, false, {
                        fileName: "[project]/src/app/rules/page.tsx",
                        lineNumber: 516,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/rules/page.tsx",
                lineNumber: 504,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/rules/page.tsx",
        lineNumber: 262,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_12~druh._.js.map