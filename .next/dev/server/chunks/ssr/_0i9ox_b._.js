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
"[project]/src/lib/renderNode.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Schema exactă din words.db RenderJson
__turbopack_context__.s([
    "COLOR_CONSONANT",
    ()=>COLOR_CONSONANT,
    "COLOR_SILENT",
    ()=>COLOR_SILENT,
    "SYLLABIC_MARKER",
    ()=>SYLLABIC_MARKER,
    "isMute",
    ()=>isMute,
    "isSyllabicConsonant",
    ()=>isSyllabicConsonant,
    "isVowelNode",
    ()=>isVowelNode
]);
const SYLLABIC_MARKER = '\u200d';
const COLOR_SILENT = '#cccccc';
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
}),
"[project]/src/components/WordRenderer.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WordRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/renderNode.ts [app-ssr] (ecmascript)");
;
;
// ── Constants ─────────────────────────────────────────────────────────────────
// Purely graphic consonant letters — y/w excluded (can be semivowels)
const GRAPHIC_CONSONANTS = new Set('bcdfghjklmnpqrstvxz');
// Semivowel sounds in DB
const SEMIVOWEL_SOUNDS = new Set([
    'j',
    'w',
    'ỷ'
]);
// Diphthong descent colour: #FF3399 (ɔ/pink) → #CC0000 (i/red)
const DIPHTHONG_START = '#FF3399';
const DIPHTHONG_END = '#CC0000';
// ── Node classification helpers ───────────────────────────────────────────────
function isGraphicConsonant(t) {
    return t.length > 0 && [
        ...t.toLowerCase()
    ].every((c)=>GRAPHIC_CONSONANTS.has(c));
}
// Node has vowel colour but grapheme is purely consonantic → DB error → mute
function shouldBeMute(n) {
    if (n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_SILENT"]) return true;
    if (!n.t || n.t.length === 0) return false;
    if (n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"] && isGraphicConsonant(n.t)) return true;
    return false;
}
// True vowel: has vowel colour, not consonant, not mute, grapheme not pure-consonant
function isVowel(n) {
    if (!n.t || n.t.length === 0) return false;
    if (n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_SILENT"] || n.c === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"]) return false;
    if (n.x) return false;
    if (isGraphicConsonant(n.t)) return false;
    return true;
}
// Semivowel node: idx=5 (s='j'|'w'|'ỷ')
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
// Descending diphthong: vowel node followed immediately by semivowel (idx=5)
// → gradient from vowel-colour → #CC0000 (red)
// e.g. boy: o(ɔ,#FF3399) + y(\u200d glide after non-schwa) — but y is diphthongGlide
// Actually in DB: royal → o="ɔ"(7) + y=\u200d glide + a="ɪ"(4)
// Pattern for gradient: stressed vowel + diphthongGlide immediately after
// → both nodes get gradient treatment
function buildDiphthongGradients(nodes, diphthongGlide) {
    const result = new Set();
    for(let i = 0; i < nodes.length; i++){
        if (!diphthongGlide.has(i)) continue;
        // The preceding vowel node is part of the diphthong
        if (i > 0 && isVowel(nodes[i - 1]) && nodes[i].t.length > 0) {
            result.add(i - 1); // vowel part
            result.add(i); // glide part
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
// Rules:
//   - No underline in monosyllabic words
//   - No underline in words with true syllabic consonant (apple, button)
//   - Stressed vowel node anchors the group
//   - Group extends through consecutive vowels and diphthong glides
//   - Semivowels (idx=5 with grapheme) included in group
//   - Never underlines consonants or mute nodes
function buildUnderlined(nodes, allow, diphthongGlide) {
    const result = new Set();
    if (!allow) return result;
    let i = 0;
    while(i < nodes.length){
        const n = nodes[i];
        // Anchor: stressed vowel or stressed semivowel with grapheme
        const isStressedVowel = n.u && isVowel(n) && !shouldBeMute(n);
        const isStressedSemi = n.u && isSemivowel(n) && n.t.length > 0;
        if (isStressedVowel || isStressedSemi) {
            result.add(i);
            // Extend through consecutive vowels, semivowels, diphthong glides
            let j = i + 1;
            while(j < nodes.length){
                const next = nodes[j];
                if (isVowel(next) && !shouldBeMute(next) || isSemivowel(next) && next.t.length > 0 || diphthongGlide.has(j)) {
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
function WordRenderer({ nodes }) {
    const { trueSyllabic, diphthongGlide } = classifyNodes(nodes);
    const diphthongNodes = buildDiphthongGradients(nodes, diphthongGlide);
    const mono = isMonosyllabic(nodes);
    const hasSyl = hasTrueSyllabic(trueSyllabic);
    const allow = !mono && !hasSyl;
    const underlined = buildUnderlined(nodes, allow, diphthongGlide);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "eic-word",
        children: nodes.map((n, i)=>{
            if (!n.t) return null;
            const isTrueSyl = trueSyllabic.has(i);
            const isGlide = diphthongGlide.has(i);
            const isDiphNode = diphthongNodes.has(i);
            const isUnderlined = underlined.has(i);
            const mute = shouldBeMute(n) || isGlide && !isDiphNode;
            const semi = isSemivowel(n) && n.t.length > 0 && !isGlide;
            // ── Colour resolution ──
            let color;
            let style = {};
            if (isTrueSyl) {
                // Syllabic consonant — black
                color = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"];
            } else if (isDiphNode) {
                // Diphthong gradient: roz → roșu via CSS gradient on text
                style = {
                    background: `linear-gradient(to right, ${DIPHTHONG_START}, ${DIPHTHONG_END})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                };
                color = 'transparent';
            } else if (mute) {
                color = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_SILENT"];
            } else if (semi) {
                // Semivowel with grapheme — black (consonantal display)
                color = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"];
            } else {
                color = n.c;
            }
            const classes = [
                'eic-seg',
                isTrueSyl ? 'eic-syllabic' : '',
                isUnderlined && !isTrueSyl ? 'eic-stressed' : '',
                mute && !isTrueSyl ? 'eic-silent' : '',
                semi ? 'eic-semivowel' : ''
            ].filter(Boolean).join(' ');
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: isDiphNode ? style : {
                    color
                },
                className: classes,
                title: n.s && n.s !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SYLLABIC_MARKER"] ? n.s : undefined,
                children: n.t
            }, i, false, {
                fileName: "[project]/src/components/WordRenderer.tsx",
                lineNumber: 214,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/src/components/WordRenderer.tsx",
        lineNumber: 169,
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
const SILENT = '#cccccc';
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
                            color: isFeedback ? isSilent ? '#cccccc' : n.c || '#000' : isTapped ? '#cccccc' : n.c || '#000'
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
const SILENT = '#cccccc';
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
                        color: n.c === SILENT ? '#cccccc' : n.c || '#000'
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
                                    c: '#cccccc',
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
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime;
}),
];

//# sourceMappingURL=_0i9ox_b._.js.map