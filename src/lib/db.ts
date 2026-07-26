// Server-side only — Next.js API routes
// Two-database architecture:
//   lexicon.db  (A) — read-only, IPA source of truth
//   cache.db    (B) — read-write, processed results cache

import Database from 'better-sqlite3'
import path from 'path'
import { processIpa, scoreNodes, extractProps } from './engine'
import type { RenderNode } from './engine'

const LEXICON_PATH = path.join(process.cwd(), 'data', 'lexicon.db')
const CACHE_PATH   = path.join(process.cwd(), 'data', 'cache.db')

// ── Singletons ────────────────────────────────────────────────────────────────

let _lexicon: Database.Database | null = null
let _cache:   Database.Database | null = null

export function getLexicon(): Database.Database {
  if (!_lexicon) {
    _lexicon = new Database(LEXICON_PATH, { readonly: true, fileMustExist: true })
    _lexicon.pragma('cache_size = -16000')
    _lexicon.pragma('temp_store = memory')
  }
  return _lexicon
}

export function getCache(): Database.Database {
  if (!_cache) {
    // Create if not exists — do NOT use fileMustExist
    _cache = new Database(CACHE_PATH)
    _cache.pragma('journal_mode = WAL')
    _cache.pragma('cache_size = -8000')
    _cache.pragma('temp_store = memory')
    _cache.pragma('synchronous = NORMAL')
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
    `)
  }
  return _cache
}

// Alias for backward compat (game route uses getDb)
export function getDb(): Database.Database { return getLexicon() }

// ── Prepared statements ───────────────────────────────────────────────────────

// Cache (B) reads
let _stmtCacheGet: Database.Statement | null = null
function stmtCacheGet() {
  if (!_stmtCacheGet)
    _stmtCacheGet = getCache().prepare(
      'SELECT nodes_json, variant FROM words WHERE word = ? LIMIT 1'
    )
  return _stmtCacheGet
}

// Cache (B) write
let _stmtCacheSet: Database.Statement | null = null
function stmtCacheSet() {
  if (!_stmtCacheSet)
    _stmtCacheSet = getCache().prepare(`
      INSERT INTO words
        (word, variant, nodes_json, ipa_uk, ipa_us,
         dominant_color, has_silent, has_stress, syllable_count,
         word_length, processed_at, hit_count)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,1)
      ON CONFLICT(word) DO UPDATE SET
        hit_count    = hit_count + 1,
        processed_at = excluded.processed_at
    `)
  return _stmtCacheSet
}

// Lexicon (A) reads
let _stmtUk: Database.Statement | null = null
let _stmtUs: Database.Statement | null = null
function stmtUk() {
  if (!_stmtUk)
    _stmtUk = getLexicon().prepare('SELECT ipa FROM uk WHERE word = ? LIMIT 1')
  return _stmtUk
}
function stmtUs() {
  if (!_stmtUs)
    _stmtUs = getLexicon().prepare('SELECT ipa FROM us WHERE word = ? LIMIT 1')
  return _stmtUs
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WordResult {
  nodes:   RenderNode[]
  variant: 'uk' | 'us' | 'coin'
}

// ── Core lookup — cache-first ─────────────────────────────────────────────────

export function getBestNodes(word: string): WordResult | null {
  word = word.toLowerCase().trim()
  if (!word || !/^[a-z'-]+$/.test(word)) return null

  // 1. Check cache (B)
  const cached = stmtCacheGet().get(word) as { nodes_json: string; variant: string } | undefined
  if (cached) {
    try {
      return {
        nodes:   JSON.parse(cached.nodes_json) as RenderNode[],
        variant: cached.variant as 'uk' | 'us' | 'coin',
      }
    } catch { /* fall through to reprocess */ }
  }

  // 2. Look up IPA in lexicon (A)
  const ukRow = stmtUk().get(word) as { ipa: string } | undefined
  const usRow = stmtUs().get(word) as { ipa: string } | undefined

  if (!ukRow && !usRow) return null

  // 3. Process through pipeline
  const ukNodes = ukRow ? processIpa(word, stripIpaArtifacts(ukRow.ipa)) : null
  const usNodes = usRow ? processIpa(word, stripIpaArtifacts(usRow.ipa)) : null

  // UK lexicon source inserts U+200D (zero-width joiner) between the two
  // characters of a diphthong (e‍ɪ, ə‍ʊ...) — an export artifact, not a
  // phonetic marker (verified: 0 legitimate syllabic-consonant uses found in
  // either table). Strip it here, at the data boundary, so segment.ts's
  // TRANSFORMS can match diphthongs normally. Do NOT strip inside segment.ts
  // itself — SYLLABIC_MARKER there is a distinct, internal mechanism.
  function stripIpaArtifacts(ipa: string): string {
    return ipa.replace(/\u200d/g, '')
  }

  // 4. Select best variant
  const result = selectBest(ukNodes, usNodes)
  if (!result) return null

  // 5. Extract properties
  const props = extractProps(result.nodes)

  // 6. Save to cache (B)
  try {
    stmtCacheSet().run(
      word,
      result.variant,
      JSON.stringify(result.nodes),
      ukRow?.ipa ?? null,
      usRow?.ipa ?? null,
      props.dominantColor,
      props.hasSilent  ? 1 : 0,
      props.hasStress  ? 1 : 0,
      props.syllableCount,
      word.length,
      new Date().toISOString(),
    )
  } catch (e) {
    // Cache write failure is non-fatal — log and continue
    console.warn('cache write failed:', e)
  }

  return result
}

export function getBestNodesMany(words: string[]): Map<string, WordResult> {
  const result = new Map<string, WordResult>()
  for (const w of words) {
    const r = getBestNodes(w)
    if (r) result.set(w, r)
  }
  return result
}

// ── Selection algorithm ───────────────────────────────────────────────────────

function selectBest(uk: RenderNode[] | null, us: RenderNode[] | null): WordResult | null {
  if (!uk && !us) return null
  if (!uk) return { nodes: us!, variant: 'us' }
  if (!us) return { nodes: uk,  variant: 'uk' }

  const ukScore = scoreNodes(uk)
  const usScore = scoreNodes(us)

  if (ukScore > usScore) return { nodes: uk, variant: 'uk' }
  if (usScore > ukScore) return { nodes: us, variant: 'us' }

  const winner = Math.random() < 0.5 ? 'uk' : 'us'
  return { nodes: winner === 'uk' ? uk : us, variant: 'coin' }
}

// ── Prefix search (from cache first, fallback to lexicon) ─────────────────────

let _stmtPrefixCache:   Database.Statement | null = null
let _stmtPrefixLexicon: Database.Statement | null = null

export function searchPrefix(prefix: string, limit = 10): string[] {
  if (!prefix || prefix.length < 2) return []
  const p = prefix.toLowerCase() + '%'

  // Search cache first — these are known-good words
  if (!_stmtPrefixCache)
    _stmtPrefixCache = getCache().prepare(
      'SELECT word FROM words WHERE word LIKE ? ORDER BY hit_count DESC, length(word), word LIMIT ?'
    )
  const cached = (_stmtPrefixCache.all(p, limit) as { word: string }[]).map(r => r.word)
  if (cached.length >= limit) return cached

  // Fill from lexicon
  if (!_stmtPrefixLexicon)
    _stmtPrefixLexicon = getLexicon().prepare(
      'SELECT word FROM uk WHERE word LIKE ? ORDER BY length(word), word LIMIT ?'
    )
  const fromLexicon = (_stmtPrefixLexicon.all(p, limit) as { word: string }[]).map(r => r.word)

  // Merge, deduplicate, limit
  const seen = new Set(cached)
  const merged = [...cached]
  for (const w of fromLexicon) {
    if (!seen.has(w)) merged.push(w)
    if (merged.length >= limit) break
  }
  return merged
}

// ── Cache stats (for admin/debug) ────────────────────────────────────────────

export function getCacheStats(): { total: number; byVariant: Record<string, number> } {
  const total = (getCache().prepare('SELECT COUNT(*) as n FROM words').get() as { n: number }).n
  const byVariant = Object.fromEntries(
    (getCache().prepare('SELECT variant, COUNT(*) as n FROM words GROUP BY variant').all() as
      { variant: string; n: number }[]).map(r => [r.variant, r.n])
  )
  return { total, byVariant }
}