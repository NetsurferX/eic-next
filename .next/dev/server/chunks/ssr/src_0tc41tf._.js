module.exports = [
"[project]/src/lib/renderNode.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Schema exactă din words.db RenderJson
__turbopack_context__.s([
    "COLOR_CONSONANT",
    ()=>COLOR_CONSONANT,
    "COLOR_SILENT",
    ()=>COLOR_SILENT,
    "GRAPHIC_CONSONANTS",
    ()=>GRAPHIC_CONSONANTS,
    "SYLLABIC_MARKER",
    ()=>SYLLABIC_MARKER,
    "isGraphicConsonantString",
    ()=>isGraphicConsonantString,
    "isMute",
    ()=>isMute,
    "isSyllabicConsonant",
    ()=>isSyllabicConsonant,
    "isVowelNode",
    ()=>isVowelNode
]);
const SYLLABIC_MARKER = '\u200d';
const COLOR_SILENT = '#000000';
const COLOR_CONSONANT = '#000000';
function isSyllabicConsonant(node) {
    return node.s === SYLLABIC_MARKER;
}
function isMute(node) {
    return node.c === COLOR_SILENT;
}
function isVowelNode(node) {
    return !node.x && node.c !== COLOR_SILENT && node.t.length > 0;
}
const GRAPHIC_CONSONANTS = new Set('bcdfghjklmnpqrstvxz');
function isGraphicConsonantString(t) {
    return t.length > 0 && [
        ...t.toLowerCase()
    ].every((c)=>GRAPHIC_CONSONANTS.has(c));
}
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
"[project]/src/components/WordRenderer.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WordRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/renderNode.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ruleConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ruleConfig.ts [app-ssr] (ecmascript)");
;
;
;
// ── Constants ─────────────────────────────────────────────────────────────────
const GRAPHIC_CONSONANTS = new Set('bcdfghjklmnpqrstvxz');
const SEMIVOWEL_SOUNDS = new Set([
    'j',
    'w',
    'ỷ'
]);
const DIPHTHONG_START = '#FF3399';
const DIPHTHONG_END = '#CC0000';
// ── Node classification helpers ───────────────────────────────────────────────
function isGraphicConsonant(t) {
    return t.length > 0 && [
        ...t.toLowerCase()
    ].every((c)=>GRAPHIC_CONSONANTS.has(c));
}
function shouldBeMute(n) {
    if (n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_SILENT"]) return true;
    if (!n.t || n.t.length === 0) return false;
    // Modificare critică: O consoană este mută doar dacă are o culoare explicită de vocală (nu goală, nu neagră)
    const hasActiveVowelColor = n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] && n.c !== '' && n.c !== undefined;
    if (hasActiveVowelColor && isGraphicConsonant(n.t)) return true;
    return false;
}
function isVowel(n) {
    if (!n.t || n.t.length === 0) return false;
    if (shouldBeMute(n)) return false;
    if (n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] || n.x || n.c === '') return false;
    return true;
}
function isSemivowel(n) {
    return SEMIVOWEL_SOUNDS.has(n.s) && n.c === '#E57373';
}
function classifyNodes(nodes) {
    const SCHWA = '#888888';
    const trueSyllabic = new Set();
    const diphthongGlide = new Set();
    for(let i = 0; i < nodes.length; i++){
        if (nodes[i].s !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SYLLABIC_MARKER"]) continue;
        const prev = i > 0 ? nodes[i - 1] : null;
        if (prev && prev.c === SCHWA) trueSyllabic.add(i);
        else diphthongGlide.add(i);
    }
    return {
        trueSyllabic,
        diphthongGlide
    };
}
// ── Diphthong gradient detection ──────────────────────────────────────────────
function buildDiphthongGradients(nodes, diphthongGlide) {
    const result = new Set();
    for(let i = 0; i < nodes.length; i++){
        if (!diphthongGlide.has(i)) continue;
        if (i > 0 && isVowel(nodes[i - 1]) && nodes[i].t.length > 0) {
            result.add(i - 1);
            result.add(i);
        }
    }
    return result;
}
// ── Monosyllabic / syllabic consonant detection ───────────────────────────────
function isMonosyllabic(nodes) {
    return !nodes.some((n)=>n.u === true);
}
function hasTrueSyllabic(trueSyllabic) {
    return trueSyllabic.size > 0;
}
// ── Underline: stressed vowel + consecutive vowel run ─────────────────────────
function buildUnderlined(nodes, allow, diphthongGlide) {
    const result = new Set();
    // Heuristic Override: Dacă baza de date nu trimite accente (cuvinte scurte/monosilabice),
    // dar vrem să corectăm randarea vizuală unde o consoană a primit accent din greșeală.
    let i = 0;
    while(i < nodes.length){
        const n = nodes[i];
        const denied = n.underlineOverride === 'deny';
        const forced = n.underlineOverride === 'force';
        // Doar un nucleu vocalic sau semivocalic real poate ancora accentul/sublinierea —
        // cu excepția unui rule regex 'force', care poate ancora pe orice grafem.
        const isStressedVowel = !denied && n.u && isVowel(n) && !shouldBeMute(n);
        // Anchor only on a real vowel (or a forced override). Semivowel anchors
        // can cause the underline to pick the semivowel colour instead of the
        // vowel colour; avoid that to match the standardised rule set.
        if (forced || isStressedVowel) {
            if (!denied) result.add(i);
            let j = i + 1;
            while(j < nodes.length){
                const next = nodes[j];
                if (next.underlineOverride === 'deny') break;
                if (next.underlineOverride === 'force' || isVowel(next) && !shouldBeMute(next) || isSemivowel(next) && next.t.length > 0 || diphthongGlide.has(j)) {
                    result.add(j);
                    j++;
                } else {
                    break;
                }
            }
            i = j;
        } else {
            i++;
        }
    }
    return result;
}
function WordRenderer({ nodes, wordStr }) {
    const renderNodes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ruleConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyRegexOverrides"])(wordStr, nodes, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ruleConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"].regexRules);
    const { trueSyllabic, diphthongGlide } = classifyNodes(renderNodes);
    const diphthongNodes = buildDiphthongGradients(renderNodes, diphthongGlide);
    const mono = isMonosyllabic(renderNodes);
    const hasSyl = hasTrueSyllabic(trueSyllabic);
    // Permitem randarea liniei dacă există stări de accent precalculate valid
    const allow = !mono && !hasSyl;
    const underlined = buildUnderlined(renderNodes, allow, diphthongGlide);
    // Build a per-node underline color map: each contiguous underline run
    // is anchored to its first underlined node's visual colour.
    const underlineColor = new Map();
    let runStart = null;
    for(let i = 0; i <= renderNodes.length; i++){
        const hit = i < renderNodes.length && underlined.has(i);
        if (hit && runStart === null) runStart = i;
        if ((!hit || i === renderNodes.length) && runStart !== null) {
            const anchor = runStart;
            // Prefer the first real vowel in the run as the colour anchor. Fall back
            // to the run start's colour if no vowel found.
            let anchorColor = undefined;
            for(let k = runStart; k < i; k++){
                const rn = renderNodes[k];
                if (isVowel(rn) && !shouldBeMute(rn)) {
                    anchorColor = rn.c;
                    break;
                }
            }
            if (!anchorColor) anchorColor = renderNodes[anchor].c && renderNodes[anchor].c !== '' ? renderNodes[anchor].c : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"];
            for(let j = runStart; j < i; j++)underlineColor.set(j, anchorColor);
            runStart = null;
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "eic-word",
        children: renderNodes.map((n, i)=>{
            if (!n.t) return null;
            const isTrueSyl = trueSyllabic.has(i);
            const isGlide = diphthongGlide.has(i);
            const isDiphNode = diphthongNodes.has(i);
            const isUnderlined = underlined.has(i);
            const mute = shouldBeMute(n) || isGlide && !isDiphNode;
            const semi = isSemivowel(n) && n.t.length > 0 && !isGlide;
            let color;
            let style = {};
            // anchor colour for this node's underline run (if any)
            const runAnchor = underlineColor.get(i);
            if (isTrueSyl) {
                color = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"];
            } else if (isDiphNode) {
                // If this diphthong node is underlined, prefer a solid anchor colour
                // for both the glyph and the underline so the run looks unified.
                if (isUnderlined && !isTrueSyl && !mute) {
                    color = runAnchor ?? (n.c && n.c !== '' ? n.c : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"]);
                } else {
                    style = {
                        background: `linear-gradient(to right, ${DIPHTHONG_START}, ${DIPHTHONG_END})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    };
                    color = 'transparent';
                }
            } else if (mute) {
                color = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_SILENT"];
            } else if (semi) {
                color = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"];
            } else {
                // Fallback: if DB colour is empty/invalid, use consonant colour
                color = n.c && n.c !== '' ? n.c : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"];
            }
            // If underlined, set a unified colour for both text and the underline
            if (isUnderlined && !isTrueSyl && !mute) {
                const finalCol = runAnchor ?? color;
                style = {
                    ...style,
                    textDecoration: 'underline',
                    textDecorationColor: finalCol,
                    textUnderlineOffset: '6px',
                    textDecorationThickness: '2.5px'
                };
                color = finalCol;
            }
            const classes = [
                'eic-seg',
                isTrueSyl ? 'eic-syllabic' : '',
                isUnderlined && !isTrueSyl ? 'eic-stressed' : '',
                mute && !isTrueSyl ? 'eic-silent' : '',
                semi ? 'eic-semivowel' : ''
            ].filter(Boolean).join(' ');
            const spanStyle = {
                ...style,
                color
            };
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: spanStyle,
                className: classes,
                title: n.s && n.s !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SYLLABIC_MARKER"] ? n.s : undefined,
                children: n.t
            }, i, false, {
                fileName: "[project]/src/components/WordRenderer.tsx",
                lineNumber: 242,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/src/components/WordRenderer.tsx",
        lineNumber: 182,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/StatsBar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatsBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "eic-stats-wrap",
        children: [
            usedColors.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "eic-legend",
                role: "list",
                children: LEGEND.filter((e)=>usedColors.has(e.color)).map((e)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "eic-leg-item",
                        role: "listitem",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            stats.wordCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "eic-stats",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eic-stat",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-stat-label",
                                children: "Words"
                            }, void 0, false, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 43,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-stat-value",
                                children: stats.wordCount
                            }, void 0, false, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 44,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eic-stat",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-stat-label",
                                children: "Top sound"
                            }, void 0, false, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 49,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eic-stat eic-stat-wide",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-stat-label",
                                children: "Colour mix"
                            }, void 0, false, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 57,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "eic-dist-bar",
                                role: "img",
                                "aria-label": "Colour distribution",
                                children: total === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "eic-dist-seg",
                                    style: {
                                        background: '#ebebeb',
                                        flex: 1
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/StatsBar.tsx",
                                    lineNumber: 60,
                                    columnNumber: 19
                                }, this) : stats.distribution.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eic-stat",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-stat-label",
                                children: "Difficulty"
                            }, void 0, false, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 74,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-stat-value",
                                children: stats.difficulty
                            }, void 0, false, {
                                fileName: "[project]/src/components/StatsBar.tsx",
                                lineNumber: 75,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
}),
"[project]/src/components/SoundSpectrum.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SoundSpectrum
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/renderNode.ts [app-ssr] (ecmascript)");
'use client';
;
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
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const animRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const barsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(VOWEL_COLORS.map(()=>0));
    const targetRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(VOWEL_COLORS.map(()=>0));
    // Compute target bar heights from tokens
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const counts = new Map();
        let total = 0;
        for (const tok of tokens){
            if (!tok.nodes) continue;
            for (const n of tok.nodes){
                if (n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_SILENT"] || n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] || !n.t) continue;
                counts.set(n.c, (counts.get(n.c) ?? 0) + n.t.length);
                total += n.t.length;
            }
        }
        targetRef.current = VOWEL_COLORS.map((c)=>total > 0 ? (counts.get(c) ?? 0) / total : 0);
    }, [
        tokens
    ]);
    // Animation loop — smooth lerp toward targets
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
            barsRef.current = barsRef.current.map((cur, i)=>{
                const target = targetRef.current[i];
                return cur + (target - cur) * 0.08 // lerp speed
                ;
            });
            barsRef.current.forEach((val, i)=>{
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
            });
            animRef.current = requestAnimationFrame(draw);
        }
        draw();
        return ()=>cancelAnimationFrame(animRef.current);
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "spectrum-wrap",
        "aria-label": "Sound spectrum visualiser",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
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
}),
"[project]/src/components/KaraokeMode.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>KaraokeMode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordRenderer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/WordRenderer.tsx [app-ssr] (ecmascript)");
'use client';
;
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
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function KaraokeMode({ tokens }) {
    const wordTokens = tokens.filter((t)=>t.isWord && t.nodes);
    const [current, setCurrent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(-1);
    const [playing, setPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [speed, setSpeed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('normal');
    const timerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const speedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(speed);
    speedRef.current = speed;
    const stop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setPlaying(false);
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);
    const advance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((idx)=>{
        const next = idx + 1;
        if (next >= wordTokens.length) {
            setPlaying(false);
            return;
        }
        setCurrent(next);
        speak(wordTokens[next].raw);
        timerRef.current = setTimeout(()=>advance(next), SPEEDS[speedRef.current]);
    }, [
        wordTokens
    ]);
    const play = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (wordTokens.length === 0) return;
        const startIdx = current >= wordTokens.length - 1 ? 0 : Math.max(0, current);
        setPlaying(true);
        setCurrent(startIdx);
        speak(wordTokens[startIdx].raw);
        timerRef.current = setTimeout(()=>advance(startIdx), SPEEDS[speedRef.current]);
    }, [
        advance,
        current,
        wordTokens
    ]);
    // Stop when tokens change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        stop();
        setCurrent(-1);
    }, [
        tokens,
        stop
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>()=>stop(), [
        stop
    ]);
    const rendered = tokens.map((tok, i)=>{
        if (tok.isWhitespace) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            children: tok.raw
        }, i, false, {
            fileName: "[project]/src/components/KaraokeMode.tsx",
            lineNumber: 77,
            columnNumber: 34
        }, this);
        if (tok.isPunct) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `k-word ${isFuture ? 'k-future' : ''}`,
                children: tok.raw
            }, i, false, {
                fileName: "[project]/src/components/KaraokeMode.tsx",
                lineNumber: 86,
                columnNumber: 14
            }, this);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: [
                'k-word',
                isPast ? 'k-past' : '',
                isCurrent ? 'k-current' : '',
                isFuture ? 'k-future' : ''
            ].filter(Boolean).join(' '),
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordRenderer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "karaoke-wrap",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "k-controls",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "k-speed-tabs",
                        children: Object.keys(SPEEDS).map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "k-actions",
                        children: [
                            !playing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "k-play-btn",
                                onClick: play,
                                children: current <= 0 || current >= wordTokens.length - 1 ? '▶ play' : '▶ resume'
                            }, void 0, false, {
                                fileName: "[project]/src/components/KaraokeMode.tsx",
                                lineNumber: 123,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "k-play-btn k-stop",
                                onClick: stop,
                                children: "■ stop"
                            }, void 0, false, {
                                fileName: "[project]/src/components/KaraokeMode.tsx",
                                lineNumber: 127,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "k-progress-wrap",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "k-text",
                "aria-live": "polite",
                children: tokens.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            current >= 0 && current < wordTokens.length && wordTokens[current]?.nodes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "k-callout",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordRenderer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
}),
"[project]/src/components/TerrainView.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TerrainView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/renderNode.ts [app-ssr] (ecmascript)");
'use client';
;
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
    const silent = nodes.filter((n)=>n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.t.length > 0).length;
    const stressed = nodes.some((n)=>n.u);
    const vowels = nodes.filter((n)=>n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] && n.t.length > 0);
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
    const svgRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [hovered, setHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [hoveredX, setHoveredX] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const peaks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>tokens.filter((t)=>t.isWord).map(wordComplexity), [
        tokens
    ]);
    const W = 800;
    const H = 200;
    const PAD = 20;
    const points = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (peaks.length === 0) return '';
        const step = (W - PAD * 2) / Math.max(peaks.length - 1, 1);
        const pts = peaks.map((p, i)=>{
            const x = PAD + i * step;
            const y = H - PAD - p.height * (H - PAD * 2);
            return {
                x,
                y,
                peak: p
            };
        });
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
    }, [
        peaks
    ]);
    if (typeof points === 'string') return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "terrain-wrap",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "terrain-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "terrain-title",
                        children: "Phonetic Landscape"
                    }, void 0, false, {
                        fileName: "[project]/src/components/TerrainView.tsx",
                        lineNumber: 95,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            peaks.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "terrain-empty",
                children: "Paste text above to see the landscape."
            }, void 0, false, {
                fileName: "[project]/src/components/TerrainView.tsx",
                lineNumber: 102,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "terrain-svg-wrap",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    ref: svgRef,
                    viewBox: `0 0 ${W} ${H}`,
                    className: "terrain-svg",
                    onMouseLeave: ()=>setHovered(null),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                id: "terrain-grad",
                                x1: "0",
                                y1: "0",
                                x2: "0",
                                y2: "1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                        offset: "0%",
                                        stopColor: "#4472C4",
                                        stopOpacity: "0.7"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TerrainView.tsx",
                                        lineNumber: 113,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: points.path,
                            fill: "url(#terrain-grad)"
                        }, void 0, false, {
                            fileName: "[project]/src/components/TerrainView.tsx",
                            lineNumber: 119,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
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
                        points.pts.map(({ x, y, peak }, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
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
                                    peak.silent > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
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
                        hovered && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
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
}),
"[project]/src/lib/useColorizer.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useColorizer",
    ()=>useColorizer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/renderNode.ts [app-ssr] (ecmascript)");
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
    const allNodes = wordTokens.flatMap((t)=>t.nodes ?? []).filter((n)=>n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] && n.t.length > 0);
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
    const [tokens, setTokens] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [stats, setStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [inputText, setInputText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const debounceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const processText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (text)=>{
        if (!text.trim()) {
            setTokens([]);
            setStats(null);
            return;
        }
        const raw = tokenize(text);
        const unresolved = raw.filter((t)=>t.isWord && !nodeCache.has(t.raw.toLowerCase())).map((t)=>t.raw.toLowerCase()).filter((w, i, a)=>a.indexOf(w) === i);
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
        const updated = raw.map((t)=>{
            const cached = t.isWord ? nodeCache.get(t.raw.toLowerCase()) ?? null : null;
            return {
                ...t,
                // Restore original casing (e.g. Christ → C preserved)
                nodes: cached ? restoreCasing(cached, t.raw) : null
            };
        });
        setTokens(updated);
        setStats(computeStats(updated));
    }, []);
    const onInput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((text)=>{
        setInputText(text);
        const raw = tokenize(text);
        const fast = raw.map((t)=>{
            const cached = t.isWord ? nodeCache.get(t.raw.toLowerCase()) ?? null : null;
            return {
                ...t,
                nodes: cached ? restoreCasing(cached, t.raw) : null
            };
        });
        setTokens(fast);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(()=>processText(text), DEBOUNCE_MS);
    }, [
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
}),
"[project]/src/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordRenderer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/WordRenderer.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$StatsBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/StatsBar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SoundSpectrum$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/SoundSpectrum.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$KaraokeMode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/KaraokeMode.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TerrainView$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/TerrainView.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$useColorizer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/useColorizer.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/renderNode.ts [app-ssr] (ecmascript)");
;
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
;
// D3 component — disable SSR entirely
const ConstellationView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/src/components/ConstellationView.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false,
    loading: ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "terrain-empty",
            children: "Loading constellation…"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 17,
            columnNumber: 32
        }, ("TURBOPACK compile-time value", void 0))
});
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
    const textareaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { tokens, stats, inputText, onInput, setInputText } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$useColorizer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useColorizer"])();
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('editor');
    const usedColors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const s = new Set();
        for (const t of tokens){
            if (!t.nodes) continue;
            for (const n of t.nodes)if (n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] && n.t.length > 0) s.add(n.c);
        }
        return s;
    }, [
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "eic-home",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "eic-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eic-dots",
                        "aria-hidden": "true",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-dot",
                                style: {
                                    background: '#CC0000'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 79,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-dot",
                                style: {
                                    background: '#00b0f0'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 80,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "eic-dot",
                                style: {
                                    background: '#008E40'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 81,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "eic-headline",
                        children: "See English as it sounds."
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 84,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "eic-subline",
                        children: "Type or paste text — every grapheme colours in place."
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 85,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: '1rem'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/learn",
                                className: "eic-nav-link",
                                children: "🎮 Learn with games"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 87,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SoundSpectrum$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                tokens: tokens
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "view-tabs",
                children: [
                    TABS.map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: [
                                'view-tab',
                                view === tab.id ? 'active' : '',
                                tab.id !== 'editor' && !hasText ? 'disabled' : ''
                            ].filter(Boolean).join(' '),
                            onClick: ()=>(tab.id === 'editor' || hasText) && setView(tab.id),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "view-tab-spacer"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this),
                    view === 'editor' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eic-toolbar-actions",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "eic-action-btn",
                                onClick: loadSample,
                                children: "try a sample"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 116,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
            view === 'editor' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eic-editor",
                        onClick: ()=>textareaRef.current?.focus(),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "eic-highlight",
                                "aria-hidden": "true",
                                children: tokens.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "eic-placeholder",
                                    children: "Type or paste English text here…"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 128,
                                    columnNumber: 19
                                }, this) : tokens.map((tok)=>{
                                    if (tok.isWhitespace) return tok.raw;
                                    if (tok.isPunct) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "eic-punct",
                                        children: tok.raw
                                    }, tok.key, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 131,
                                        columnNumber: 46
                                    }, this);
                                    if (!tok.nodes) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "eic-plain",
                                        children: tok.raw
                                    }, tok.key, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 132,
                                        columnNumber: 46
                                    }, this);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordRenderer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
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
                    stats && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$StatsBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        stats: stats,
                        usedColors: usedColors
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 151,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true),
            view === 'read' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$KaraokeMode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                tokens: tokens
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 155,
                columnNumber: 32
            }, this),
            view === 'landscape' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TerrainView$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                tokens: tokens
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 156,
                columnNumber: 32
            }, this),
            view === 'map' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ConstellationView, {
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
}),
];

//# sourceMappingURL=src_0tc41tf._.js.map