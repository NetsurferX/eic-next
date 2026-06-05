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
// ── Grapheme classification ───────────────────────────────────────────────────
const GRAPHIC_VOWELS = new Set([
    ...'aeiouAEIOU'
]);
const SEMIVOWEL_DISPLAY = new Set([
    'j',
    'w',
    'ỷ'
]);
function isGraphicVowel(c) {
    return GRAPHIC_VOWELS.has(c);
}
function isGraphicCons(c) {
    return !GRAPHIC_VOWELS.has(c);
}
// ── mapToWord v4 — strict left-to-right vowel/consonant matching ──────────────
//
// Algorithm:
//   Walk IPA segments and word characters strictly left-to-right.
//   - Consonant IPA  → consume 1 consonant grapheme (2 for IPA digraph)
//   - Vowel IPA      → consume entire consecutive vowel grapheme run
//   - Semivowel IPA  → consume 1 consonant grapheme if available, else empty
//   - Empty display  → latent phoneme, no grapheme consumed
//   - Remaining word letters after all segs → silent
function mapToWord(word, segs) {
    if (segs.length === 0) return [
        {
            t: word,
            s: '',
            c: COLOR_SILENT,
            u: false,
            x: false
        }
    ];
    const nodes = [];
    let pos = 0;
    const wLen = word.length;
    for (const seg of segs){
        const { ipa, display, isVowel, accented } = seg;
        // Latent phoneme or syllabic marker — no grapheme consumed
        if (!display || display === '\u200d') {
            nodes.push({
                t: '',
                s: display ?? '',
                c: COLOR_CONSONANT,
                u: false,
                x: true
            });
            continue;
        }
        let consumed = '';
        if (SEMIVOWEL_DISPLAY.has(display)) {
            // Semivowel: take 1 consonant grapheme if current position is consonant
            if (pos < wLen && isGraphicCons(word[pos])) {
                consumed = word[pos++];
            }
        // else: latent semivowel — no grapheme shown
        } else if (isVowel) {
            // Vowel: consume the entire consecutive vowel grapheme run
            const start = pos;
            while(pos < wLen && isGraphicVowel(word[pos]))pos++;
            consumed = word.slice(start, pos);
        } else {
            // Consonant: take 1 consonant grapheme (2 for IPA digraphs)
            if (pos < wLen && isGraphicCons(word[pos])) {
                consumed = word[pos++];
                // IPA digraph → try to take a second adjacent consonant
                if (ipa.length >= 2 && pos < wLen && isGraphicCons(word[pos])) consumed += word[pos++];
            }
        }
        const color = getColor(display);
        const isStressed = accented && isVowel;
        const isSilent = !color && !isVowel;
        const isCons = !color && !isVowel;
        nodes.push({
            t: consumed,
            s: display,
            c: color ?? (isSilent ? COLOR_SILENT : COLOR_CONSONANT),
            u: isStressed,
            x: isCons || color === COLOR_CONSONANT
        });
    }
    // Remaining word letters → silent
    if (pos < wLen) nodes.push({
        t: word.slice(pos),
        s: '',
        c: COLOR_SILENT,
        u: false,
        x: false
    });
    return nodes;
}
function scoreNodes(nodes) {
    return nodes.filter((n)=>n.t && n.c !== COLOR_SILENT && n.c !== COLOR_CONSONANT).reduce((sum, n)=>sum + n.t.length, 0);
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
// Returns n words for the given game level, using cache.db first then lexicon.db
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
;
;
const SILENT = '#cccccc';
const CONSONANT = '#000000';
const GRAPHIC_CONS = new Set('bcdfghjklmnpqrstvxz');
function isGraphicCons(t) {
    return !!t && [
        ...t.toLowerCase()
    ].every((c)=>GRAPHIC_CONS.has(c));
}
function dominantColor(nodes) {
    const cc = {};
    for (const n of nodes)if (n.c !== SILENT && n.c !== CONSONANT && n.t && !isGraphicCons(n.t)) cc[n.c] = (cc[n.c] ?? 0) + n.t.length;
    const entries = Object.entries(cc);
    return entries.length ? entries.sort((a, b)=>b[1] - a[1])[0][0] : null;
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
    const maxLen = level === 1 ? 6 : level === 2 ? 8 : 10;
    const minLen = level === 1 ? 3 : 4;
    // Get candidate words — from cache if populated, else from lexicon
    let candidates = [];
    try {
        const cache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCache"])();
        const cacheCount = cache.prepare('SELECT COUNT(*) as c FROM words').get().c;
        if (cacheCount > 50) {
            let q = `SELECT word FROM words WHERE word_length BETWEEN ? AND ?`;
            if (level === 2) q += ` AND has_silent = 1`;
            if (level === 3) q += ` AND has_stress = 1 AND word_length >= 5`;
            q += ` ORDER BY RANDOM() LIMIT ${n * 6}`;
            candidates = cache.prepare(q).all(minLen, maxLen).map((r)=>r.word);
        }
    } catch  {}
    // Supplement from lexicon if needed
    if (candidates.length < n * 3) {
        try {
            const lex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLexicon"])();
            const rows = lex.prepare(`SELECT word FROM uk WHERE length(word) BETWEEN ? AND ? ORDER BY RANDOM() LIMIT 400`).all(minLen, maxLen);
            const extra = rows.map((r)=>r.word).filter((w)=>!candidates.includes(w));
            candidates = [
                ...candidates,
                ...extra
            ];
        } catch  {}
    }
    // Process and filter
    const filtered = [];
    for (const word of shuffle(candidates)){
        if (filtered.length >= n * 3) break;
        try {
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBestNodes"])(word);
            if (!result) continue;
            const nodes = result.nodes;
            const dom = dominantColor(nodes);
            if (!dom) continue;
            const ok = level === 1 ? true : level === 2 ? hasSilentLetters(nodes) : hasStress(nodes) && word.length >= 5;
            if (ok) filtered.push({
                word,
                nodes,
                dominantColor: dom
            });
        } catch  {
            continue;
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        words: shuffle(filtered).slice(0, n)
    }, {
        headers: {
            'Cache-Control': 'no-store'
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__11jupo7._.js.map