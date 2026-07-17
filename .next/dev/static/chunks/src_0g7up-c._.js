(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/ruleConfig.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
        // ── B_tehnic §6.1 — "alb cu chenar negru" styling for the syllabic 'r'
        // itself (as opposed to the vowel-run colour above). Wired up for 3
        // representative words to demonstrate each spelling shape (plain -r,
        // -re, single-letter stem); the remaining V-R words follow the same
        // pattern — see EiC-spec-integration-CHANGELOG.md for the full list of
        // patterns to add via /rules.
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
        },
        // ── B_tehnic §2.f — letterless-phoneme superscript mechanism demo.
        // Disabled: the spec's own example ("kethib") isn't in the lexicon;
        // enable/adapt once a real word needing this comes up.
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
            if (rule.action.syllabicR) out[i].syllabicOverride = true;
            if (rule.action.superscript) out[i].superscriptOverride = rule.action.superscript;
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/engine/colorMap.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
    // SPEC CORRECTION (B_tehnic §9 Tabel 2): schwa is negru, not grey.
    'ə': '#000000',
    'ɜ': '#000000',
    'ər': '#000000',
    'er': '#000000',
    'ɐ': '#000000',
    'e': '#EE5B00',
    'ɛ': '#EE5B00',
    'ɪ': '#CC0000',
    'i': '#CC0000',
    'iː': '#CC0000',
    'ɒ': '#FF3399',
    'ɔ': '#FF3399',
    'o': '#FF3399',
    'ʊ': '#7030A0',
    'u': '#7030A0',
    'uː': '#7030A0',
    // SPEC CORRECTION (§9): /əʊ/ is its own tricolor-gradient sound
    // (#002B7F→#FCD116→#CE1126). No gradient-by-sound support yet (see
    // EiC-tehnic-spec.md §10.4) — using the gradient's midpoint colour as a
    // single-hue placeholder until that support exists.
    'oʊ': '#FCD116',
    'əw': '#FCD116',
    // SPEC CORRECTION (§9): /eɪ/ (name, day) is its own dark blue, not a
    // variant of /e/-/ɛ/.
    'eɪ': '#00246C',
    'eỷ': '#00246C',
    // SPEC CORRECTION (§9): /juː/ (cute, beauty) — wasn't mapped before.
    'ju': '#833C0B',
    'ỷu': '#833C0B',
    'juː': '#833C0B',
    'aɪ': '#4472C4',
    'aỷ': '#4472C4',
    // SPEC CORRECTION (§9): /aʊ/ (tower, flower) is verde neon, split out of
    // the aɪ blue group it was previously lumped into.
    'aw': '#23D300',
    'aʊ': '#23D300',
    // SPEC CORRECTION (§9): /ɔɪ/ (boy, coin) is bicolor roz→roșu, not the aɪ
    // blue. True two-tone gradient needs seg-splitting (see spec §10.3/10.4);
    // using the roz start-colour as a single-hue placeholder for now.
    'oɪ': '#FF3399',
    'oỷ': '#FF3399',
    'ɔɪ': '#FF3399',
    // SPEC CORRECTION (Tabelul 5/6): /j/,/ỷ/ take the same red as i/ɪ; /w/ is
    // negru like any other consonant. Neither is a distinct "semivowel" hue —
    // the old #E57373 bucket is gone.
    'j': '#CC0000',
    'ỷ': '#CC0000',
    'w': '#000000'
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/colorMap.ts [app-client] (ecmascript)");
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
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VOWEL_CHARS"]
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
                isVowel: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isVowelSound"])(rep),
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/colorMap.ts [app-client] (ecmascript)");
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
            c: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"],
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
                c: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"],
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
        const color = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getColor"])(display);
        const isCons = !color;
        const isStressed = accented && isVowel;
        nodes.push({
            t: consumed,
            s: display,
            c: color ?? (isCons ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"]),
            u: isStressed,
            x: isCons
        });
    }
    // Remaining letters → silent tail
    if (pos < wLen) nodes.push({
        t: word.slice(pos),
        s: '',
        c: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"],
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/colorMap.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$align$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/align.ts [app-client] (ecmascript)");
;
;
function scoreNodes(nodes) {
    return nodes.filter((n)=>n.t && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"]).reduce((sum, n)=>sum + n.t.length, 0);
}
function extractProps(nodes) {
    const colorCounts = {};
    let hasSilent = false;
    let hasStress = false;
    let syllableCount = 0;
    for (const n of nodes){
        if (n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.t && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$align$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isGraphicCons"])(n.t)) hasSilent = true;
        if (n.u) hasStress = true;
        if (n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] && n.t) {
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
"[project]/src/lib/engine/display.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/colorMap.ts [app-client] (ecmascript)");
;
const COLOR_SILENT = '#000000';
const COLOR_CONSONANT = '#000000';
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
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_MAP"][sound] ?? null;
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
        const isSylVR = !!n.syllabicOverride // B_tehnic §6.1 — alb cu chenar negru
        ;
        const mute = isMute(n) || isGlide && !isDiph;
        const simpleHex = !isDiph && !isTrueSyl && !isSylVR && !mute ? simpleGradientHex(n.s) : null;
        const runAnchor = underlineColorMap.get(i) ?? COLOR_CONSONANT;
        // Final color decision — one place, one pass, explicit priority:
        let color;
        let gradientCss;
        if (isSylVR) color = '#FFFFFF'; // forced V-R syllabic (white fill)
        else if (isTrueSyl) color = COLOR_CONSONANT; // syllabic consonant
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
        } else if (mute) color = COLOR_SILENT;
        else color = n.c && n.c !== '' ? n.c : COLOR_CONSONANT;
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/colorMap.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$score$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/score.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/display.ts [app-client] (ecmascript)");
;
;
;
function processIpa(word, rawIpa) {
    if (!rawIpa?.trim()) {
        return [
            {
                t: word,
                s: '',
                c: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$colorMap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"],
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ruleConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ruleConfig.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/engine/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/display.ts [app-client] (ecmascript)");
;
;
;
function WordRenderer({ nodes, wordStr }) {
    const renderNodes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ruleConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["applyRegexOverrides"])(wordStr, nodes, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ruleConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"].regexRules);
    const displayNodes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveDisplay"])(renderNodes);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "eic-word",
        children: displayNodes.map((d, i)=>{
            if (!d.t) return null;
            const style = d.gradient ? {
                background: d.gradientCss ?? `linear-gradient(to right, ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DIPHTHONG_START"]}, ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DIPHTHONG_END"]})`,
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
"[project]/src/components/StatsBar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatsBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
const LEGEND = [
    {
        color: '#00b0f0',
        label: 'æ — cat'
    },
    {
        color: '#008E40',
        label: 'ɑ/ʌ — car, cup'
    },
    {
        color: '#888888',
        label: 'ə — schwa'
    },
    {
        color: '#EE5B00',
        label: 'e/ɛ — bed'
    },
    {
        color: '#CC0000',
        label: 'i/ɪ — see, sit'
    },
    {
        color: '#FF3399',
        label: 'ɒ/ɔ — hot, or'
    },
    {
        color: '#7030A0',
        label: 'u/ʊ — moon, book'
    },
    {
        color: '#4472C4',
        label: 'aɪ/aʊ — my, now'
    },
    {
        color: '#E57373',
        label: 'j/w — yes, we'
    }
];
function StatsBar({ stats, usedColors }) {
    const total = stats.distribution.reduce((s, d)=>s + d.count, 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "eic-stats-wrap",
        children: [
            usedColors.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "eic-legend",
                role: "list",
                children: LEGEND.filter((e)=>usedColors.has(e.color)).map((e)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "eic-leg-item",
                        role: "listitem",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-leg-dot",
                                style: {
                                    background: e.color
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 31,
                                columnNumber: 15
                            }, this),
                            e.label
                        ]
                    }, e.color, true, {
                        fileName: "[project]/src/components/StatsBar.tsx",
                        lineNumber: 30,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/StatsBar.tsx",
                lineNumber: 28,
                columnNumber: 9
            }, this),
            stats.wordCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "eic-stats",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eic-stat",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-stat-label",
                                children: "Words"
                            }, void 0, false, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 43,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-stat-value",
                                children: stats.wordCount
                            }, void 0, false, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 44,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-stat-sub",
                                children: [
                                    stats.knownCount,
                                    " known"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 45,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/StatsBar.tsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eic-stat",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-stat-label",
                                children: "Top sound"
                            }, void 0, false, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 49,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-stat-value eic-stat-sound",
                                style: {
                                    color: stats.topColor
                                },
                                children: stats.topLabel || '—'
                            }, void 0, false, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 50,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-stat-sub",
                                children: [
                                    stats.topCount,
                                    " segments"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 53,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/StatsBar.tsx",
                        lineNumber: 48,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eic-stat eic-stat-wide",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-stat-label",
                                children: "Colour mix"
                            }, void 0, false, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 57,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "eic-dist-bar",
                                role: "img",
                                "aria-label": "Colour distribution",
                                children: total === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "eic-dist-seg",
                                    style: {
                                        background: '#ebebeb',
                                        flex: 1
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/StatsBar.tsx",
                                    lineNumber: 60,
                                    columnNumber: 19
                                }, this) : stats.distribution.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "eic-dist-seg",
                                        style: {
                                            background: d.color,
                                            flex: d.count
                                        }
                                    }, d.color, false, {
                                        fileName: "[project]/src/components/StatsBar.tsx",
                                        lineNumber: 62,
                                        columnNumber: 21
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 58,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-stat-sub",
                                children: stats.distSummary || 'type to see'
                            }, void 0, false, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 70,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/StatsBar.tsx",
                        lineNumber: 56,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eic-stat",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-stat-label",
                                children: "Difficulty"
                            }, void 0, false, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 74,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-stat-value",
                                children: stats.difficulty
                            }, void 0, false, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 75,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-stat-sub",
                                children: stats.diffLabel
                            }, void 0, false, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 76,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/StatsBar.tsx",
                        lineNumber: 73,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/StatsBar.tsx",
                lineNumber: 40,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/StatsBar.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_c = StatsBar;
var _c;
__turbopack_context__.k.register(_c, "StatsBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/renderNode.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

// Backward-compat shim — re-exports the canonical types/constants from
// engine/. This file used to keep its own separate `RenderNode` interface
// and its own copies of isMute/isVowelNode/isGraphicConsonantString with a
// GRAPHIC_CONSONANTS set that had drifted from engine/display.ts's (missing
// 'w' and 'y'). Those functions were never actually imported anywhere in the
// app — every real consumer (SoundSpectrum, ConstellationView, TerrainView,
// page.tsx, useColorizer.ts, WordRenderer.tsx) only ever used the RenderNode
// type plus the SYLLABIC_MARKER/COLOR_SILENT/COLOR_CONSONANT constants — so
// the divergent copies have been removed rather than kept in sync by hand.
// If you need isMute/isVowelNode/isGraphicConsonant logic, use the ones in
// engine/display.ts (currently module-private; export them from there if an
// outside consumer needs them, rather than re-forking a copy here).
__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/display.ts [app-client] (ecmascript)");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/SoundSpectrum.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SoundSpectrum
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/renderNode.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/display.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const VOWEL_COLORS = [
    '#008E40',
    '#00b0f0',
    '#7030A0',
    '#888888',
    '#CC0000',
    '#E57373',
    '#EE5B00',
    '#FF3399'
];
const LABELS = {
    '#008E40': 'ɑ/ʌ',
    '#00b0f0': 'æ',
    '#7030A0': 'u/ʊ',
    '#888888': 'ə',
    '#CC0000': 'i/ɪ',
    '#E57373': 'j/w',
    '#EE5B00': 'e/ɛ',
    '#FF3399': 'ɒ/ɔ'
};
function SoundSpectrum({ tokens }) {
    _s();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const animRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const barsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(VOWEL_COLORS.map({
        "SoundSpectrum.useRef[barsRef]": ()=>0
    }["SoundSpectrum.useRef[barsRef]"]));
    const targetRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(VOWEL_COLORS.map({
        "SoundSpectrum.useRef[targetRef]": ()=>0
    }["SoundSpectrum.useRef[targetRef]"]));
    // Compute target bar heights from tokens
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SoundSpectrum.useEffect": ()=>{
            const counts = new Map();
            let total = 0;
            for (const tok of tokens){
                if (!tok.nodes) continue;
                for (const n of tok.nodes){
                    if (n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"] || n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] || !n.t) continue;
                    counts.set(n.c, (counts.get(n.c) ?? 0) + n.t.length);
                    total += n.t.length;
                }
            }
            targetRef.current = VOWEL_COLORS.map({
                "SoundSpectrum.useEffect": (c)=>total > 0 ? (counts.get(c) ?? 0) / total : 0
            }["SoundSpectrum.useEffect"]);
        }
    }["SoundSpectrum.useEffect"], [
        tokens
    ]);
    // Animation loop — smooth lerp toward targets
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SoundSpectrum.useEffect": ()=>{
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            const n = VOWEL_COLORS.length;
            const barW = W / n;
            const maxH = H * 0.85;
            const baseY = H;
            function draw() {
                if (!ctx) return;
                ctx.clearRect(0, 0, W, H);
                // Background subtle grid
                ctx.strokeStyle = 'rgba(0,0,0,0.04)';
                ctx.lineWidth = 1;
                for(let i = 1; i < 4; i++){
                    const y = H - maxH * i / 3;
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(W, y);
                    ctx.stroke();
                }
                barsRef.current = barsRef.current.map({
                    "SoundSpectrum.useEffect.draw": (cur, i)=>{
                        const target = targetRef.current[i];
                        return cur + (target - cur) * 0.08 // lerp speed
                        ;
                    }
                }["SoundSpectrum.useEffect.draw"]);
                barsRef.current.forEach({
                    "SoundSpectrum.useEffect.draw": (val, i)=>{
                        const x = i * barW;
                        const h = val * maxH;
                        const y = baseY - h;
                        // Bar gradient
                        const grad = ctx.createLinearGradient(x, y, x, baseY);
                        grad.addColorStop(0, VOWEL_COLORS[i] + 'ff');
                        grad.addColorStop(0.7, VOWEL_COLORS[i] + 'cc');
                        grad.addColorStop(1, VOWEL_COLORS[i] + '44');
                        const radius = Math.min(6, barW * 0.3);
                        ctx.beginPath();
                        ctx.roundRect(x + 3, y, barW - 6, h, [
                            radius,
                            radius,
                            0,
                            0
                        ]);
                        ctx.fillStyle = grad;
                        ctx.fill();
                        // Label
                        if (val > 0.02) {
                            ctx.fillStyle = VOWEL_COLORS[i];
                            ctx.font = `${Math.round(10 * window.devicePixelRatio)}px Inter, sans-serif`;
                            ctx.textAlign = 'center';
                            ctx.fillText(LABELS[VOWEL_COLORS[i]] ?? '', x + barW / 2, baseY - 4);
                        }
                    }
                }["SoundSpectrum.useEffect.draw"]);
                animRef.current = requestAnimationFrame(draw);
            }
            draw();
            return ({
                "SoundSpectrum.useEffect": ()=>cancelAnimationFrame(animRef.current)
            })["SoundSpectrum.useEffect"];
        }
    }["SoundSpectrum.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "spectrum-wrap",
        "aria-label": "Sound spectrum visualiser",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
            ref: canvasRef,
            className: "spectrum-canvas"
        }, void 0, false, {
            fileName: "[project]/src/components/SoundSpectrum.tsx",
            lineNumber: 116,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/SoundSpectrum.tsx",
        lineNumber: 115,
        columnNumber: 5
    }, this);
}
_s(SoundSpectrum, "0NTsSurB1zZkZNAv0826mZqR804=");
_c = SoundSpectrum;
var _c;
__turbopack_context__.k.register(_c, "SoundSpectrum");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/KaraokeMode.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>KaraokeMode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordRenderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/WordRenderer.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const SPEEDS = {
    slow: 2000,
    normal: 1000,
    fast: 500
};
// Audio cache — avoid re-fetching the same word
const audioCache = new Map() // word → object URL
;
async function speak(word) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        let url = audioCache.get(word);
        if (!url) {
            const res = await fetch('/api/speak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    word
                })
            });
            if (!res.ok) return;
            const blob = await res.blob();
            url = URL.createObjectURL(blob);
            audioCache.set(word, url);
        }
        const audio = new Audio(url);
        audio.play().catch(()=>{});
    } catch (e) {
        console.warn('speak error:', e);
    }
}
function KaraokeMode({ tokens }) {
    _s();
    const wordTokens = tokens.filter((t)=>t.isWord && t.nodes);
    const [current, setCurrent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(-1);
    const [playing, setPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [speed, setSpeed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('normal');
    const timerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const speedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(speed);
    speedRef.current = speed;
    const stop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "KaraokeMode.useCallback[stop]": ()=>{
            setPlaying(false);
            if (timerRef.current) clearTimeout(timerRef.current);
        }
    }["KaraokeMode.useCallback[stop]"], []);
    const advance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "KaraokeMode.useCallback[advance]": (idx)=>{
            const next = idx + 1;
            if (next >= wordTokens.length) {
                setPlaying(false);
                return;
            }
            setCurrent(next);
            speak(wordTokens[next].raw);
            timerRef.current = setTimeout({
                "KaraokeMode.useCallback[advance]": ()=>advance(next)
            }["KaraokeMode.useCallback[advance]"], SPEEDS[speedRef.current]);
        }
    }["KaraokeMode.useCallback[advance]"], [
        wordTokens
    ]);
    const play = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "KaraokeMode.useCallback[play]": ()=>{
            if (wordTokens.length === 0) return;
            const startIdx = current >= wordTokens.length - 1 ? 0 : Math.max(0, current);
            setPlaying(true);
            setCurrent(startIdx);
            speak(wordTokens[startIdx].raw);
            timerRef.current = setTimeout({
                "KaraokeMode.useCallback[play]": ()=>advance(startIdx)
            }["KaraokeMode.useCallback[play]"], SPEEDS[speedRef.current]);
        }
    }["KaraokeMode.useCallback[play]"], [
        advance,
        current,
        wordTokens
    ]);
    // Stop when tokens change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "KaraokeMode.useEffect": ()=>{
            stop();
            setCurrent(-1);
        }
    }["KaraokeMode.useEffect"], [
        tokens,
        stop
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "KaraokeMode.useEffect": ()=>({
                "KaraokeMode.useEffect": ()=>stop()
            })["KaraokeMode.useEffect"]
    }["KaraokeMode.useEffect"], [
        stop
    ]);
    const rendered = tokens.map((tok, i)=>{
        if (tok.isWhitespace) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            children: tok.raw
        }, i, false, {
            fileName: "[project]/src/components/KaraokeMode.tsx",
            lineNumber: 77,
            columnNumber: 34
        }, this);
        if (tok.isPunct) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "k-punct",
            children: tok.raw
        }, i, false, {
            fileName: "[project]/src/components/KaraokeMode.tsx",
            lineNumber: 78,
            columnNumber: 34
        }, this);
        const wordIdx = wordTokens.indexOf(tok);
        const isPast = wordIdx !== -1 && wordIdx < current;
        const isCurrent = wordIdx !== -1 && wordIdx === current;
        const isFuture = wordIdx !== -1 && wordIdx > current || wordIdx === -1;
        if (!tok.nodes) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `k-word ${isFuture ? 'k-future' : ''}`,
                children: tok.raw
            }, i, false, {
                fileName: "[project]/src/components/KaraokeMode.tsx",
                lineNumber: 86,
                columnNumber: 14
            }, this);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: [
                'k-word',
                isPast ? 'k-past' : '',
                isCurrent ? 'k-current' : '',
                isFuture ? 'k-future' : ''
            ].filter(Boolean).join(' '),
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordRenderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                nodes: tok.nodes,
                wordStr: tok.raw
            }, void 0, false, {
                fileName: "[project]/src/components/KaraokeMode.tsx",
                lineNumber: 99,
                columnNumber: 9
            }, this)
        }, i, false, {
            fileName: "[project]/src/components/KaraokeMode.tsx",
            lineNumber: 90,
            columnNumber: 7
        }, this);
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "karaoke-wrap",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "k-controls",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "k-speed-tabs",
                        children: Object.keys(SPEEDS).map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: `k-speed-btn ${speed === s ? 'active' : ''}`,
                                onClick: ()=>setSpeed(s),
                                children: s
                            }, s, false, {
                                fileName: "[project]/src/components/KaraokeMode.tsx",
                                lineNumber: 111,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/KaraokeMode.tsx",
                        lineNumber: 109,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "k-actions",
                        children: [
                            !playing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "k-play-btn",
                                onClick: play,
                                children: current <= 0 || current >= wordTokens.length - 1 ? '▶ play' : '▶ resume'
                            }, void 0, false, {
                                fileName: "[project]/src/components/KaraokeMode.tsx",
                                lineNumber: 123,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "k-play-btn k-stop",
                                onClick: stop,
                                children: "■ stop"
                            }, void 0, false, {
                                fileName: "[project]/src/components/KaraokeMode.tsx",
                                lineNumber: 127,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "k-reset-btn",
                                title: "restart",
                                onClick: ()=>{
                                    stop();
                                    setCurrent(-1);
                                },
                                children: "↺"
                            }, void 0, false, {
                                fileName: "[project]/src/components/KaraokeMode.tsx",
                                lineNumber: 129,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/KaraokeMode.tsx",
                        lineNumber: 121,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/KaraokeMode.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "k-progress-wrap",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "k-progress-fill",
                    style: {
                        width: wordTokens.length > 0 ? `${Math.max(0, (current + 1) / wordTokens.length * 100)}%` : '0%'
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/KaraokeMode.tsx",
                    lineNumber: 136,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/KaraokeMode.tsx",
                lineNumber: 135,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "k-text",
                "aria-live": "polite",
                children: tokens.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "k-empty",
                    children: "Paste text above to begin reading."
                }, void 0, false, {
                    fileName: "[project]/src/components/KaraokeMode.tsx",
                    lineNumber: 149,
                    columnNumber: 13
                }, this) : rendered
            }, void 0, false, {
                fileName: "[project]/src/components/KaraokeMode.tsx",
                lineNumber: 147,
                columnNumber: 7
            }, this),
            current >= 0 && current < wordTokens.length && wordTokens[current]?.nodes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "k-callout",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordRenderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    nodes: wordTokens[current].nodes,
                    wordStr: wordTokens[current].raw
                }, void 0, false, {
                    fileName: "[project]/src/components/KaraokeMode.tsx",
                    lineNumber: 157,
                    columnNumber: 11
                }, this)
            }, current, false, {
                fileName: "[project]/src/components/KaraokeMode.tsx",
                lineNumber: 156,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/KaraokeMode.tsx",
        lineNumber: 105,
        columnNumber: 5
    }, this);
}
_s(KaraokeMode, "OC+qPI/YDVUrg2s6gGim1ipTAaY=");
_c = KaraokeMode;
var _c;
__turbopack_context__.k.register(_c, "KaraokeMode");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/TerrainView.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TerrainView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/renderNode.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/display.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function wordComplexity(tok) {
    if (!tok.nodes) return {
        word: tok.raw,
        height: 0.1,
        color: '#000000',
        silent: 0,
        stressed: false
    };
    const nodes = tok.nodes;
    const total = nodes.filter((n)=>n.t.length > 0).length;
    const silent = nodes.filter((n)=>n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.t.length > 0).length;
    const stressed = nodes.some((n)=>n.u);
    const vowels = nodes.filter((n)=>n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] && n.t.length > 0);
    // Dominant colour
    const colorCounts = new Map();
    for (const n of vowels)colorCounts.set(n.c, (colorCounts.get(n.c) ?? 0) + n.t.length);
    const dominant = [
        ...colorCounts.entries()
    ].sort((a, b)=>b[1] - a[1])[0];
    // Complexity = ratio of silent + unusual mappings
    const silentRatio = total > 0 ? silent / total : 0;
    const lengthFactor = Math.min(tok.raw.length / 12, 1);
    const vowelFactor = total > 0 ? 1 - vowels.length / total : 0.5;
    const height = Math.max(0.08, Math.min(1, silentRatio * 0.5 + lengthFactor * 0.3 + vowelFactor * 0.2));
    return {
        word: tok.raw,
        height,
        color: dominant?.[0] ?? '#000000',
        silent,
        stressed
    };
}
function TerrainView({ tokens }) {
    _s();
    const svgRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [hovered, setHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [hoveredX, setHoveredX] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const peaks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TerrainView.useMemo[peaks]": ()=>tokens.filter({
                "TerrainView.useMemo[peaks]": (t)=>t.isWord
            }["TerrainView.useMemo[peaks]"]).map(wordComplexity)
    }["TerrainView.useMemo[peaks]"], [
        tokens
    ]);
    const W = 800;
    const H = 200;
    const PAD = 20;
    const points = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TerrainView.useMemo[points]": ()=>{
            if (peaks.length === 0) return '';
            const step = (W - PAD * 2) / Math.max(peaks.length - 1, 1);
            const pts = peaks.map({
                "TerrainView.useMemo[points].pts": (p, i)=>{
                    const x = PAD + i * step;
                    const y = H - PAD - p.height * (H - PAD * 2);
                    return {
                        x,
                        y,
                        peak: p
                    };
                }
            }["TerrainView.useMemo[points].pts"]);
            // Build smooth SVG path (catmull-rom approximation)
            if (pts.length === 1) {
                return {
                    path: `M ${PAD},${H} L ${pts[0].x},${pts[0].y} L ${W - PAD},${H} Z`,
                    pts
                };
            }
            let d = `M ${PAD},${H} L ${pts[0].x},${pts[0].y}`;
            for(let i = 0; i < pts.length - 1; i++){
                const cp1x = pts[i].x + (pts[i + 1].x - pts[i].x) / 3;
                const cp1y = pts[i].y;
                const cp2x = pts[i].x + 2 * (pts[i + 1].x - pts[i].x) / 3;
                const cp2y = pts[i + 1].y;
                d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pts[i + 1].x},${pts[i + 1].y}`;
            }
            d += ` L ${W - PAD},${H} Z`;
            return {
                path: d,
                pts
            };
        }
    }["TerrainView.useMemo[points]"], [
        peaks
    ]);
    if (typeof points === 'string') return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "terrain-wrap",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "terrain-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "terrain-title",
                        children: "Phonetic Landscape"
                    }, void 0, false, {
                        fileName: "[project]/src/components/TerrainView.tsx",
                        lineNumber: 95,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "terrain-sub",
                        children: "Higher peaks = more complex phonetic patterns"
                    }, void 0, false, {
                        fileName: "[project]/src/components/TerrainView.tsx",
                        lineNumber: 96,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/TerrainView.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this),
            peaks.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "terrain-empty",
                children: "Paste text above to see the landscape."
            }, void 0, false, {
                fileName: "[project]/src/components/TerrainView.tsx",
                lineNumber: 102,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "terrain-svg-wrap",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    ref: svgRef,
                    viewBox: `0 0 ${W} ${H}`,
                    className: "terrain-svg",
                    onMouseLeave: ()=>setHovered(null),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                id: "terrain-grad",
                                x1: "0",
                                y1: "0",
                                x2: "0",
                                y2: "1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                        offset: "0%",
                                        stopColor: "#4472C4",
                                        stopOpacity: "0.7"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TerrainView.tsx",
                                        lineNumber: 113,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                        offset: "100%",
                                        stopColor: "#00b0f0",
                                        stopOpacity: "0.15"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TerrainView.tsx",
                                        lineNumber: 114,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/TerrainView.tsx",
                                lineNumber: 112,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/TerrainView.tsx",
                            lineNumber: 111,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: points.path,
                            fill: "url(#terrain-grad)"
                        }, void 0, false, {
                            fileName: "[project]/src/components/TerrainView.tsx",
                            lineNumber: 119,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: points.path.replace(/ L [^ ]+ [^ ]+ Z/, '').replace('M 20 200 ', ''),
                            fill: "none",
                            stroke: "#4472C4",
                            strokeWidth: "2",
                            strokeLinejoin: "round"
                        }, void 0, false, {
                            fileName: "[project]/src/components/TerrainView.tsx",
                            lineNumber: 122,
                            columnNumber: 13
                        }, this),
                        points.pts.map(({ x, y, peak }, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                        cx: x,
                                        cy: y,
                                        r: peak.stressed ? 5 : 3,
                                        fill: peak.color,
                                        stroke: "#fff",
                                        strokeWidth: "1.5",
                                        style: {
                                            cursor: 'pointer'
                                        },
                                        onMouseEnter: (e)=>{
                                            setHovered(peak);
                                            setHoveredX(x);
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TerrainView.tsx",
                                        lineNumber: 133,
                                        columnNumber: 17
                                    }, this),
                                    peak.silent > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                        cx: x,
                                        cy: y,
                                        r: 8,
                                        fill: "none",
                                        stroke: "#",
                                        strokeWidth: "1",
                                        strokeDasharray: "2,2"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TerrainView.tsx",
                                        lineNumber: 145,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/src/components/TerrainView.tsx",
                                lineNumber: 132,
                                columnNumber: 15
                            }, this)),
                        hovered && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                    x: Math.min(hoveredX - 40, W - 100),
                                    y: H - 180,
                                    width: Math.max(hovered.word.length * 9, 60),
                                    height: 36,
                                    rx: 6,
                                    fill: "#1a1917",
                                    opacity: 0.9
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TerrainView.tsx",
                                    lineNumber: 154,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                    x: Math.min(hoveredX - 40, W - 100) + Math.max(hovered.word.length * 9, 60) / 2,
                                    y: H - 158,
                                    fill: "#fff",
                                    fontSize: 13,
                                    textAnchor: "middle",
                                    fontFamily: "Inter, sans-serif",
                                    children: hovered.word
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TerrainView.tsx",
                                    lineNumber: 159,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                    x: Math.min(hoveredX - 40, W - 100) + Math.max(hovered.word.length * 9, 60) / 2,
                                    y: H - 144,
                                    fill: hovered.color,
                                    fontSize: 10,
                                    textAnchor: "middle",
                                    fontFamily: "Inter, sans-serif",
                                    children: [
                                        hovered.silent > 0 ? `${hovered.silent} silent` : '',
                                        hovered.stressed ? ' · stressed' : ''
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/TerrainView.tsx",
                                    lineNumber: 169,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/TerrainView.tsx",
                            lineNumber: 153,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/TerrainView.tsx",
                    lineNumber: 105,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/TerrainView.tsx",
                lineNumber: 104,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/TerrainView.tsx",
        lineNumber: 93,
        columnNumber: 5
    }, this);
}
_s(TerrainView, "2xa05IsOHjlJaMeSc4z8/7n7oL0=");
_c = TerrainView;
var _c;
__turbopack_context__.k.register(_c, "TerrainView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/useColorizer.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useColorizer",
    ()=>useColorizer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/renderNode.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/display.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const DEBOUNCE_MS = 350;
const nodeCache = new Map();
function tokenize(text) {
    const tokens = [];
    let i = 0, seq = 0;
    while(i < text.length){
        const c = text[i];
        if (/[a-zA-Z]/.test(c)) {
            const start = i;
            while(i < text.length && /[a-zA-Z'-]/.test(text[i]))i++;
            const raw = text.slice(start, i);
            tokens.push({
                raw,
                key: `w-${raw.toLowerCase()}-${seq++}`,
                isWord: true,
                isWhitespace: false,
                isPunct: false
            });
        } else if (/\s/.test(c)) {
            const start = i;
            while(i < text.length && /\s/.test(text[i]))i++;
            tokens.push({
                raw: text.slice(start, i),
                key: `ws-${seq++}`,
                isWord: false,
                isWhitespace: true,
                isPunct: false
            });
        } else {
            const start = i;
            while(i < text.length && !/[a-zA-Z\s]/.test(text[i]))i++;
            tokens.push({
                raw: text.slice(start, i),
                key: `p-${seq++}`,
                isWord: false,
                isWhitespace: false,
                isPunct: true
            });
        }
    }
    return tokens;
}
function colorToLabel(c) {
    const m = {
        '#00b0f0': 'æ',
        '#008E40': 'ɑ/ʌ',
        '#888888': 'ə',
        '#EE5B00': 'e/ɛ',
        '#CC0000': 'i/ɪ',
        '#FF3399': 'ɒ/ɔ',
        '#7030A0': 'u/ʊ',
        '#4472C4': 'aɪ/aʊ',
        '#E57373': 'j/w'
    };
    return m[c] ?? c;
}
function computeStats(tokens) {
    const wordTokens = tokens.filter((t)=>t.isWord);
    const wordCount = wordTokens.length;
    const knownCount = wordTokens.filter((t)=>t.nodes !== null).length;
    if (wordCount === 0) return {
        wordCount: 0,
        knownCount: 0,
        topColor: '',
        topLabel: '—',
        topCount: 0,
        distribution: [],
        distSummary: '',
        difficulty: '—',
        diffLabel: 'type something'
    };
    const allNodes = wordTokens.flatMap((t)=>t.nodes ?? []).filter((n)=>n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] && n.t.length > 0);
    const groups = new Map();
    for (const n of allNodes)groups.set(n.c, (groups.get(n.c) ?? 0) + n.t.length);
    const distribution = [
        ...groups.entries()
    ].map(([color, count])=>({
            color,
            count
        })).sort((a, b)=>b.count - a.count);
    const total = distribution.reduce((s, d)=>s + d.count, 0);
    const top = distribution[0];
    const distSummary = distribution.slice(0, 2).map((d)=>`${Math.round(d.count * 100 / total)}% ${colorToLabel(d.color)}`).join(' · ');
    const avgLen = wordCount > 0 ? wordTokens.reduce((s, t)=>s + t.raw.length, 0) / wordCount : 0;
    const [difficulty, diffLabel] = avgLen < 4 ? [
        'A1',
        'beginner'
    ] : avgLen < 5 ? [
        'A2',
        'elementary'
    ] : avgLen < 6 ? [
        'B1',
        'intermediate'
    ] : avgLen < 7 ? [
        'B2',
        'upper intermediate'
    ] : [
        'C1+',
        'advanced'
    ];
    return {
        wordCount,
        knownCount,
        topColor: top?.color ?? '',
        topLabel: top ? colorToLabel(top.color) : '—',
        topCount: top?.count ?? 0,
        distribution,
        distSummary,
        difficulty,
        diffLabel
    };
}
// Restore original casing from user input onto pipeline nodes.
// Pipeline returns lowercase graphemes — we match them back to the
// original word character by character to preserve capitals.
function restoreCasing(nodes, originalWord) {
    let pos = 0;
    return nodes.map((n)=>{
        if (!n.t) return n;
        const original = originalWord.slice(pos, pos + n.t.length);
        pos += n.t.length;
        return original ? {
            ...n,
            t: original
        } : n;
    });
}
function useColorizer() {
    _s();
    const [tokens, setTokens] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [stats, setStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [inputText, setInputText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const debounceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const processText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useColorizer.useCallback[processText]": async (text)=>{
            if (!text.trim()) {
                setTokens([]);
                setStats(null);
                return;
            }
            const raw = tokenize(text);
            const unresolved = raw.filter({
                "useColorizer.useCallback[processText].unresolved": (t)=>t.isWord && !nodeCache.has(t.raw.toLowerCase())
            }["useColorizer.useCallback[processText].unresolved"]).map({
                "useColorizer.useCallback[processText].unresolved": (t)=>t.raw.toLowerCase()
            }["useColorizer.useCallback[processText].unresolved"]).filter({
                "useColorizer.useCallback[processText].unresolved": (w, i, a)=>a.indexOf(w) === i
            }["useColorizer.useCallback[processText].unresolved"]);
            if (unresolved.length > 0) {
                try {
                    const res = await fetch('/api/words', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            words: unresolved
                        })
                    });
                    const data = await res.json();
                    if (data.results) {
                        for (const [word, nodes] of Object.entries(data.results))nodeCache.set(word, nodes);
                    }
                } catch (e) {
                    console.error('Fetch error:', e);
                }
            }
            const updated = raw.map({
                "useColorizer.useCallback[processText].updated": (t)=>{
                    const cached = t.isWord ? nodeCache.get(t.raw.toLowerCase()) ?? null : null;
                    return {
                        ...t,
                        // Restore original casing (e.g. Christ → C preserved)
                        nodes: cached ? restoreCasing(cached, t.raw) : null
                    };
                }
            }["useColorizer.useCallback[processText].updated"]);
            setTokens(updated);
            setStats(computeStats(updated));
        }
    }["useColorizer.useCallback[processText]"], []);
    const onInput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useColorizer.useCallback[onInput]": (text)=>{
            setInputText(text);
            const raw = tokenize(text);
            const fast = raw.map({
                "useColorizer.useCallback[onInput].fast": (t)=>{
                    const cached = t.isWord ? nodeCache.get(t.raw.toLowerCase()) ?? null : null;
                    return {
                        ...t,
                        nodes: cached ? restoreCasing(cached, t.raw) : null
                    };
                }
            }["useColorizer.useCallback[onInput].fast"]);
            setTokens(fast);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout({
                "useColorizer.useCallback[onInput]": ()=>processText(text)
            }["useColorizer.useCallback[onInput]"], DEBOUNCE_MS);
        }
    }["useColorizer.useCallback[onInput]"], [
        processText
    ]);
    return {
        tokens,
        stats,
        inputText,
        onInput,
        setInputText
    };
}
_s(useColorizer, "10s2CEY9fsErHJAdwHqjyDg+VxE=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordRenderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/WordRenderer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$StatsBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/StatsBar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SoundSpectrum$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/SoundSpectrum.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$KaraokeMode$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/KaraokeMode.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TerrainView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/TerrainView.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$useColorizer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/useColorizer.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/renderNode.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engine/display.ts [app-client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
// D3 component — disable SSR entirely
const ConstellationView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/src/components/ConstellationView.tsx [app-client] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/src/components/ConstellationView.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false,
    loading: ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "terrain-empty",
            children: "Loading constellation…"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 17,
            columnNumber: 32
        }, ("TURBOPACK compile-time value", void 0))
});
_c = ConstellationView;
const SAMPLES = [
    'The quick brown fox jumps over the lazy dog.',
    'She sells seashells by the seashore.',
    'How much wood would a woodchuck chuck if a woodchuck could chuck wood?',
    'Peter Piper picked a peck of pickled peppers.',
    'To be or not to be, that is the question.',
    'Beauty is in the eye of the beholder.',
    'Knight and power through the silent night.'
];
let sampleIdx = 0;
const TABS = [
    {
        id: 'editor',
        label: 'Editor',
        icon: '✏️'
    },
    {
        id: 'read',
        label: 'Read',
        icon: '▶'
    },
    {
        id: 'landscape',
        label: 'Landscape',
        icon: '⛰'
    },
    {
        id: 'map',
        label: 'Constellation',
        icon: '✦'
    }
];
function Home() {
    _s();
    const textareaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { tokens, stats, inputText, onInput, setInputText } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$useColorizer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useColorizer"])();
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('editor');
    const usedColors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Home.useMemo[usedColors]": ()=>{
            const s = new Set();
            for (const t of tokens){
                if (!t.nodes) continue;
                for (const n of t.nodes)if (n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engine$2f$display$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] && n.t.length > 0) s.add(n.c);
            }
            return s;
        }
    }["Home.useMemo[usedColors]"], [
        tokens
    ]);
    function loadSample() {
        const text = SAMPLES[sampleIdx % SAMPLES.length];
        sampleIdx++;
        setInputText(text);
        onInput(text);
        if (textareaRef.current) textareaRef.current.value = text;
    }
    function clearAll() {
        setInputText('');
        onInput('');
        if (textareaRef.current) textareaRef.current.value = '';
    }
    const hasText = tokens.some((t)=>t.isWord);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "eic-home",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "eic-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eic-dots",
                        "aria-hidden": "true",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-dot",
                                style: {
                                    background: '#CC0000'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 79,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-dot",
                                style: {
                                    background: '#00b0f0'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 80,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-dot",
                                style: {
                                    background: '#008E40'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 81,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-dot",
                                style: {
                                    background: '#7030A0'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 82,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 78,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "eic-headline",
                        children: "See English as it sounds."
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 84,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "eic-subline",
                        children: "Type or paste text — every grapheme colours in place."
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 85,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: '1rem'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/learn",
                                className: "eic-nav-link",
                                children: "🎮 Learn with games"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 87,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/rules",
                                className: "eic-nav-link",
                                style: {
                                    fontSize: '12px',
                                    opacity: 0.7
                                },
                                children: "⚙ Rule editor"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 88,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 86,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SoundSpectrum$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                tokens: tokens
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "view-tabs",
                children: [
                    TABS.map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: [
                                'view-tab',
                                view === tab.id ? 'active' : '',
                                tab.id !== 'editor' && !hasText ? 'disabled' : ''
                            ].filter(Boolean).join(' '),
                            onClick: ()=>(tab.id === 'editor' || hasText) && setView(tab.id),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "view-tab-icon",
                                    children: tab.icon
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 107,
                                    columnNumber: 13
                                }, this),
                                tab.label
                            ]
                        }, tab.id, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 98,
                            columnNumber: 11
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "view-tab-spacer"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this),
                    view === 'editor' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eic-toolbar-actions",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "eic-action-btn",
                                onClick: loadSample,
                                children: "try a sample"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 116,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "eic-action-btn",
                                onClick: clearAll,
                                children: "clear"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 117,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 115,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this),
            view === 'editor' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eic-editor",
                        onClick: ()=>textareaRef.current?.focus(),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "eic-highlight",
                                "aria-hidden": "true",
                                children: tokens.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "eic-placeholder",
                                    children: "Type or paste English text here…"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 128,
                                    columnNumber: 19
                                }, this) : tokens.map((tok)=>{
                                    if (tok.isWhitespace) return tok.raw;
                                    if (tok.isPunct) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "eic-punct",
                                        children: tok.raw
                                    }, tok.key, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 131,
                                        columnNumber: 46
                                    }, this);
                                    if (!tok.nodes) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "eic-plain",
                                        children: tok.raw
                                    }, tok.key, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 132,
                                        columnNumber: 46
                                    }, this);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordRenderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        nodes: tok.nodes,
                                        wordStr: tok.raw
                                    }, tok.key, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 133,
                                        columnNumber: 28
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 126,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                ref: textareaRef,
                                className: "eic-textarea",
                                defaultValue: inputText,
                                onChange: (e)=>onInput(e.target.value),
                                placeholder: " ",
                                spellCheck: false,
                                autoComplete: "off",
                                autoCorrect: "off",
                                autoCapitalize: "off",
                                rows: 6,
                                "aria-label": "Text input"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 137,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 125,
                        columnNumber: 11
                    }, this),
                    stats && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$StatsBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        stats: stats,
                        usedColors: usedColors
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 151,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true),
            view === 'read' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$KaraokeMode$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                tokens: tokens
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 155,
                columnNumber: 32
            }, this),
            view === 'landscape' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TerrainView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                tokens: tokens
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 156,
                columnNumber: 32
            }, this),
            view === 'map' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ConstellationView, {
                tokens: tokens
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 157,
                columnNumber: 32
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
_s(Home, "JVl0nC1l2gyM53i1rIddUYl6L78=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$useColorizer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useColorizer"]
    ];
});
_c1 = Home;
var _c, _c1;
__turbopack_context__.k.register(_c, "ConstellationView");
__turbopack_context__.k.register(_c1, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0g7up-c._.js.map