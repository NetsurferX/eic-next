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
"[project]/src/lib/pipeline.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Exact port of PhoneticPipeline.cs + ColorMap.cs
// Used server-side only — processes IPA strings from lexicon.db
__turbopack_context__.s([
    "COLOR_CONSONANT",
    ()=>COLOR_CONSONANT,
    "COLOR_SILENT",
    ()=>COLOR_SILENT,
    "extractProps",
    ()=>extractProps,
    "processIpa",
    ()=>processIpa,
    "scoreNodes",
    ()=>scoreNodes
]);
const COLOR_SILENT = '#cccccc';
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
    ...'aeioujæɑɔəwɛɪʊʌyøœɒɝɚɜỷ'
]);
function isVowelSound(s) {
    return s.length > 0 && VOWEL_CHARS.has(s[0]);
}
// ── Transforms (priority order — longest first) ───────────────────────────────
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
    // Semivowels
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
    // Simple vowels
    [
        'æ',
        'æ'
    ],
    [
        'ɪ',
        'ɪ'
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
    ...'aeioujæɑɔəwɛɪʊʌyøœɒỷ'
]);
function processIpa(word, rawIpa) {
    if (!rawIpa?.trim()) {
        return [
            {
                t: word,
                s: '',
                c: COLOR_SILENT,
                u: false,
                x: false
            }
        ];
    }
    // 1. Strip noise characters
    const ipa = [
        ...rawIpa
    ].filter((c)=>!STRIP.has(c)).join('').trim();
    // 2. Find primary stress position
    const stressAt = ipa.indexOf('ˈ');
    const clean = ipa.replace(/ˈ/g, '');
    const stressPos = stressAt > 0 ? stressAt - 1 : stressAt === 0 ? 0 : -1;
    // 3. Segment IPA into phonemes
    const segs = segment(clean, stressPos);
    // 4. Map segments onto word letters
    return mapToWord(word, segs);
}
function segment(clean, stressPos) {
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
                isVowel: isVowelSound(rep),
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
function mapToWord(word, segs) {
    const nodes = [];
    let wPos = 0;
    const n = segs.length;
    const wLen = word.length;
    if (n === 0) {
        return [
            {
                t: word,
                s: '',
                c: COLOR_SILENT,
                u: false,
                x: false
            }
        ];
    }
    // Distribute letters: each segment gets at least 1
    // IPA digraphs (ipa.length >= 2) get priority for extra letters
    const gl = new Array(n).fill(1);
    let extra = wLen - n;
    for(let pass = 0; pass < 2 && extra > 0; pass++){
        for(let i = 0; i < n && extra > 0; i++){
            if (pass === 0 && segs[i].ipa.length < 2) continue;
            gl[i]++;
            extra--;
        }
    }
    if (extra > 0) gl[n - 1] += extra;
    for(let i = 0; i < n; i++){
        const take = Math.max(0, Math.min(gl[i], wLen - wPos));
        const text = take > 0 ? word.slice(wPos, wPos + take) : '';
        wPos += take;
        const color = getColor(segs[i].display);
        const isStressed = segs[i].accented && segs[i].isVowel;
        const isSilent = color === null && !segs[i].isVowel;
        const isCons = color === null && segs[i].isVowel === false;
        nodes.push({
            t: text,
            s: segs[i].display,
            c: color ?? (isSilent ? COLOR_SILENT : COLOR_CONSONANT),
            u: isStressed,
            x: isCons || color === COLOR_CONSONANT
        });
    }
    // Remaining letters → silent
    if (wPos < wLen) {
        nodes.push({
            t: word.slice(wPos),
            s: '',
            c: COLOR_SILENT,
            u: false,
            x: false
        });
    }
    return nodes;
}
function scoreNodes(nodes) {
    return nodes.filter((n)=>n.t && n.c !== COLOR_SILENT && n.c !== COLOR_CONSONANT).reduce((sum, n)=>sum + n.t.length, 0);
}
// ── Word properties for cache.db columns ─────────────────────────────────────
const GRAPHIC_CONS = new Set('bcdfghjklmnpqrstvxz');
function isGraphicCons(t) {
    return !!t && [
        ...t.toLowerCase()
    ].every((c)=>GRAPHIC_CONS.has(c));
}
function extractProps(nodes) {
    const colorCounts = {};
    let hasSilent = false;
    let hasStress = false;
    let syllableCount = 0;
    for (const n of nodes){
        // Silent: grey AND graphic consonant grapheme
        if (n.c === COLOR_SILENT && n.t && isGraphicCons(n.t)) hasSilent = true;
        // Stress
        if (n.u) hasStress = true;
        // Syllable count — each stressed or schwa vowel = 1 syllable (approximation)
        if (n.c !== COLOR_SILENT && n.c !== COLOR_CONSONANT && n.t) {
            syllableCount++;
            const c = colorCounts[n.c] ?? 0;
            colorCounts[n.c] = c + n.t.length;
        }
    }
    // Dominant colour
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pipeline$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/pipeline.ts [app-route] (ecmascript)");
;
;
;
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
        _cache = new __TURBOPACK__imported__module__$5b$externals$5d2f$better$2d$sqlite3__$5b$external$5d$__$28$better$2d$sqlite3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$better$2d$sqlite3$29$__["default"](CACHE_PATH, {
            fileMustExist: true
        });
        _cache.pragma('journal_mode = WAL');
        _cache.pragma('cache_size = -8000');
        _cache.pragma('temp_store = memory');
        _cache.pragma('synchronous = NORMAL');
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
    if (!ukRow && !usRow) return null;
    // 3. Process through pipeline
    const ukNodes = ukRow ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pipeline$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["processIpa"])(word, ukRow.ipa) : null;
    const usNodes = usRow ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pipeline$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["processIpa"])(word, usRow.ipa) : null;
    // 4. Select best variant
    const result = selectBest(ukNodes, usNodes);
    if (!result) return null;
    // 5. Extract properties
    const props = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pipeline$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractProps"])(result.nodes);
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
    const ukScore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pipeline$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scoreNodes"])(uk);
    const usScore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pipeline$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scoreNodes"])(us);
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

//# sourceMappingURL=%5Broot-of-the-server%5D__11jupo7._.js.map