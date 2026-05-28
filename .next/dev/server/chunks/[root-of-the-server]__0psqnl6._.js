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
"[project]/src/lib/renderNode.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getBestNodes",
    ()=>getBestNodes,
    "getBestNodesMany",
    ()=>getBestNodesMany,
    "getDb",
    ()=>getDb,
    "searchPrefix",
    ()=>searchPrefix
]);
// Server-side only — Next.js API routes
var __TURBOPACK__imported__module__$5b$externals$5d2f$better$2d$sqlite3__$5b$external$5d$__$28$better$2d$sqlite3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$better$2d$sqlite3$29$__ = __turbopack_context__.i("[externals]/better-sqlite3 [external] (better-sqlite3, cjs, [project]/node_modules/better-sqlite3)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/renderNode.ts [app-route] (ecmascript)");
;
;
;
const DB_PATH = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'data', 'words.db');
// ── Color index table (words_clean.db array format) ───────────────────────────
const COLOR_INDEX = {
    0: '#008E40',
    1: '#00b0f0',
    2: '#7030A0',
    3: '#888888',
    4: '#CC0000',
    5: '#E57373',
    6: '#EE5B00',
    7: '#FF3399'
};
// ── DB singleton ──────────────────────────────────────────────────────────────
let _db = null;
function getDb() {
    if (!_db) {
        _db = new __TURBOPACK__imported__module__$5b$externals$5d2f$better$2d$sqlite3__$5b$external$5d$__$28$better$2d$sqlite3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$better$2d$sqlite3$29$__["default"](DB_PATH, {
            readonly: true,
            fileMustExist: true
        });
        _db.pragma('cache_size = -32000');
        _db.pragma('temp_store = memory');
    }
    return _db;
}
let _stmtUk = null;
let _stmtUs = null;
let _stmtPrefix = null;
function stmtUk() {
    if (!_stmtUk) _stmtUk = getDb().prepare('SELECT RenderJson FROM uk WHERE Word = ? LIMIT 1');
    return _stmtUk;
}
function stmtUs() {
    if (!_stmtUs) _stmtUs = getDb().prepare('SELECT RenderJson FROM us WHERE Word = ? LIMIT 1');
    return _stmtUs;
}
// ── Parse array format: ["grapheme","sound",colorIdx,isStressed,isConsonant] ──
function parseNode(raw) {
    if (!Array.isArray(raw) || raw.length < 5) return null;
    const [t, s, colorIdx, u, x] = raw;
    // Determine color
    let c;
    if (colorIdx === 8) {
        // Consonant slot — silent if no grapheme or sound is empty/syllabic
        const isSyllabic = s === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SYLLABIC_MARKER"];
        const isEmpty = !t && !s;
        c = isEmpty || !s && !isSyllabic ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_SILENT"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"];
    } else {
        c = COLOR_INDEX[colorIdx] ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_SILENT"];
    }
    return {
        t: t ?? '',
        s: s ?? '',
        c,
        u: u === 1,
        x: x === 1
    };
}
function parseNodes(raw) {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) return null;
        const nodes = [];
        for (const item of parsed){
            const node = parseNode(item);
            if (node) nodes.push(node);
        }
        return nodes.length > 0 ? nodes : null;
    } catch  {
        return null;
    }
}
function score(nodes) {
    return nodes.filter((n)=>n.t && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_SILENT"] && n.c !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$renderNode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COLOR_CONSONANT"]).reduce((sum, n)=>sum + n.t.length, 0);
}
// ── SelectBest ────────────────────────────────────────────────────────────────
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
    const ukScore = score(uk);
    const usScore = score(us);
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
function getBestNodes(word) {
    word = word.toLowerCase().trim();
    if (!word) return null;
    const ukRow = stmtUk().get(word);
    const usRow = stmtUs().get(word);
    return selectBest(parseNodes(ukRow?.RenderJson ?? null), parseNodes(usRow?.RenderJson ?? null));
}
function getBestNodesMany(words) {
    const result = new Map();
    for (const w of words){
        const r = getBestNodes(w);
        if (r) result.set(w, r);
    }
    return result;
}
function searchPrefix(prefix, limit = 10) {
    if (!prefix || prefix.length < 2) return [];
    if (!_stmtPrefix) _stmtPrefix = getDb().prepare('SELECT Word FROM uk WHERE Word LIKE ? ORDER BY length(Word), Word LIMIT ?');
    const rows = _stmtPrefix.all(prefix.toLowerCase() + '%', limit);
    return rows.map((r)=>r.Word);
}
}),
"[project]/src/app/api/game/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
// GET /api/game?level=1&n=10
// Returns n words appropriate for the given game level
// Level 1: colour recognition (simple 3-5 letter words, clear dominant vowel)
// Level 2: silent letter detection (words with mute letters)
// Level 3: stress/accent recognition (polysyllabic words with clear stress)
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
;
;
const SILENT = '#cccccc';
const GRAPHIC_CONS = new Set('bcdfghjklmnpqrstvxz');
function isGraphicCons(t) {
    return !!t && [
        ...t.toLowerCase()
    ].every((c)=>GRAPHIC_CONS.has(c));
}
function parseNodes(rj) {
    try {
        const p = JSON.parse(rj);
        if (!Array.isArray(p) || p.length === 0) return null;
        // Handle both object format (v2) and array format (words_clean)
        if (typeof p[0] === 'object' && !Array.isArray(p[0])) return p;
        // Array format: [t, s, colorIdx, isStressed, isConsonant]
        const COLOR_INDEX = {
            0: '#008E40',
            1: '#00b0f0',
            2: '#7030A0',
            3: '#888888',
            4: '#CC0000',
            5: '#E57373',
            6: '#EE5B00',
            7: '#FF3399'
        };
        return p.map((n)=>({
                t: n[0] ?? '',
                s: n[1] ?? '',
                c: n[2] === 8 ? SILENT : COLOR_INDEX[n[2]] ?? SILENT,
                u: n[3] === 1,
                x: n[4] === 1
            }));
    } catch  {
        return null;
    }
}
function dominantColor(nodes) {
    const cc = {};
    for (const n of nodes){
        if (n.c && n.c !== SILENT && n.t && !isGraphicCons(n.t)) cc[n.c] = (cc[n.c] ?? 0) + n.t.length;
    }
    const entries = Object.entries(cc);
    if (!entries.length) return null;
    return entries.sort((a, b)=>b[1] - a[1])[0][0];
}
function hasSilentLetters(nodes) {
    return nodes.some((n)=>n.c === SILENT && n.t && isGraphicCons(n.t));
}
function hasStress(nodes) {
    return nodes.some((n)=>n.u && n.c !== SILENT);
}
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
async function GET(req) {
    const level = parseInt(req.nextUrl.searchParams.get('level') ?? '1');
    const n = Math.min(parseInt(req.nextUrl.searchParams.get('n') ?? '10'), 20);
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])();
    // Fetch candidate words
    const maxLen = level === 1 ? 6 : level === 2 ? 8 : 10;
    const minLen = level === 1 ? 3 : 4;
    const rows = db.prepare(`
    SELECT Word, RenderJson FROM uk
    WHERE RenderJson IS NOT NULL AND RenderJson != '[]'
    AND length(Word) BETWEEN ? AND ?
    ORDER BY RANDOM()
    LIMIT 2000
  `).all(minLen, maxLen);
    const filtered = [];
    for (const row of rows){
        const nodes = parseNodes(row.RenderJson);
        if (!nodes) continue;
        const dom = dominantColor(nodes);
        if (!dom) continue;
        if (level === 1) {
            // Simple words with clear single dominant vowel colour
            filtered.push({
                word: row.Word,
                nodes,
                dominantColor: dom
            });
        } else if (level === 2) {
            // Must have silent letters
            if (hasSilentLetters(nodes)) filtered.push({
                word: row.Word,
                nodes,
                dominantColor: dom
            });
        } else if (level === 3) {
            // Must have stress marking
            if (hasStress(nodes) && row.Word.length >= 5) filtered.push({
                word: row.Word,
                nodes,
                dominantColor: dom
            });
        }
        if (filtered.length >= n * 5) break;
    }
    const selected = shuffle(filtered).slice(0, n);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        words: selected
    }, {
        headers: {
            'Cache-Control': 'no-store'
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0psqnl6._.js.map