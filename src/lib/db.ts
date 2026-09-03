// Server-side only — Next.js API routes
// Two-database architecture:
//   lexicon.db  (A) — read-only, IPA source of truth
//   cache.db    (B) — read-write, processed results cache

import Database from 'better-sqlite3'
import path from 'path'
import { processIpa, extractProps, COLOR_CONSONANT } from './engine'
import type { RenderNode } from './engine'
import { EiCSuffixVoicingPipeline } from './engine/suffixVoicing'
import { getColor } from './rules/colors'

const suffixPipeline = new EiCSuffixVoicingPipeline()

import { existsSync, copyFileSync } from 'fs'
import os from 'os'

const LEXICON_PATH = path.join(process.cwd(), 'data', 'lexicon.db')

// cache.db trebuie să fie scriptabil; pe serverless (Vercel) doar /tmp e writable.
const isServerless = !!process.env.VERCEL
const CACHE_PATH = isServerless
  ? path.join(os.tmpdir(), 'cache.db')
  : path.join(process.cwd(), 'data', 'cache.db')

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
    // Pe serverless, /tmp e efemer (gol la fiecare cold start) —
    // copiem seed-ul existent dacă există, ca să nu pornim mereu de la zero.
    if (isServerless && !existsSync(CACHE_PATH)) {
      const seed = path.join(process.cwd(), 'data', 'cache.db')
      if (existsSync(seed)) copyFileSync(seed, CACHE_PATH)
    }
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

// ── IPA cleanup ────────────────────────────────────────────────────────────────
// lexicon.db's `us` table lists MULTIPLE pronunciations for ~7.5k words as one
// comma-separated string, e.g. "/ˈeɪ/, /ə/" or "/ˈɫɔɪɝ/, /ˈɫɔjɝ/" (the `uk`
// table never does this). Until this fix, that whole string — slashes, comma,
// space, second pronunciation and all — was passed straight into segment(),
// which happily "segmented" it as if it were one word's IPA: it matches
// TRANSFORMS across the boundary, then the leftover comma/space/second-variant
// characters fall through as bogus consonant-fallback segments that align.ts
// then matches against the WORD's real letters — silently misconsuming them.
// ("lawyer" is a concrete case: /ˈɫɔɪɝ/, /ˈɫɔjɝ/ → 8 segments instead of 3-4
// for a 6-letter word — the trailing "y" ends up consumed by the FIRST
// variant's /ɝ/ segment instead of getting its own /j/ colour, and "er" is
// left as an unclassified silent tail.)
//
// Fix: only the FIRST slash-delimited pronunciation is ever used — dictionary
// convention lists the primary/most common one first. Strip the ZWJ artifact
// at the same step (existing behaviour, unchanged).
//
// BUG FIX (found while testing Tabelul T1 diacritics): some comma-separated
// rows (e.g. "does" → "ˈdəz, dɪz", "is" → "ˈɪz, ɪz", "this", "them") have NO
// slashes at all — just a bare comma list. The old regex only matched
// slash-delimited variants, so these words' WHOLE string (comma, space,
// second pronunciation and all) fell through untouched into segment(),
// same corruption class as the "lawyer" bug described above, just via a
// different lexicon formatting quirk. Splitting on the comma FIRST, before
// trying to also strip slashes, handles both formats uniformly.
function firstIpaVariant(raw: string): string {
  const noZwj = raw.replace(/\u200d/g, '')
  const firstPart = noZwj.split(',')[0].trim()
  const m = firstPart.match(/\/([^/]+)\//)
  return m ? m[1] : firstPart.replace(/^\/|\/$/g, '')
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WordResult {
  nodes:   RenderNode[]
  variant: 'uk' | 'us' | 'coin' | 'derived'
}

export interface VariantResult {
  ipa:   string
  nodes: RenderNode[]
}

// ── Dual-accent raw lookup (debug/culise page) ─────────────────────────────────
// Unlike getBestNodes(), this never picks a "winner" — it returns both the uk
// and us rows straight from lexicon.db (A), each run through the same
// processIpa()/firstIpaVariant() pipeline as the real lookup, so a debug view
// can show exactly what each accent resolves to, side by side. No cache (B)
// involvement — always fresh off the lexicon, mirroring what accent-test.ts
// already does for its own two example cases.
export function getRawVariants(word: string): { uk: VariantResult | null; us: VariantResult | null } {
  word = word.toLowerCase().trim()
  if (!word || !/^[a-z'-]+$/.test(word)) return { uk: null, us: null }

  const ukRow = stmtUk().get(word) as { ipa: string } | undefined
  const usRow = stmtUs().get(word) as { ipa: string } | undefined

  const uk = ukRow
    ? { ipa: firstIpaVariant(ukRow.ipa), nodes: processIpa(word, firstIpaVariant(ukRow.ipa)) }
    : null
  const us = usRow
    ? { ipa: firstIpaVariant(usRow.ipa), nodes: processIpa(word, firstIpaVariant(usRow.ipa)) }
    : null

  return { uk, us }
}

// ── -s suffix fallback ────────────────────────────────────────────────────────
// Cuvântul cerut nu e în lexicon (ex: "cats" nu are rând propriu), dar dacă
// e "bază + s" (sau "bază + es", pt. sibilante — vezi Regula 12 §2.2) și baza
// există în lexicon, sintetizăm nodul/nodurile de sufix în loc să întoarcem
// null.
//
// Se încearcă ÎNTÂI baza "-es" (dacă e aplicabilă), pentru că e mai
// specifică: "watches" trebuie citit ca bază "watch" + sufix "es", nu ca
// bază "watche" (care n-ar exista în lexicon oricum, dar dacă ar exista din
// greșeală, "-s" simplu ar da un rezultat fonetic greșit).
function tryPluralFallback(word: string): WordResult | null {
  const candidates: { base: string; spelling: 'es' | 's' }[] = []
  if (word.endsWith('es') && word.length > 2) candidates.push({ base: word.slice(0, -2), spelling: 'es' })
  if (word.endsWith('s') && word.length > 1) candidates.push({ base: word.slice(0, -1), spelling: 's' })

  for (const { base } of candidates) {
    const ukRow = stmtUk().get(base) as { ipa: string } | undefined
    const usRow = stmtUs().get(base) as { ipa: string } | undefined
    if (!ukRow && !usRow) continue

    function build(ipa: string): RenderNode[] {
      const baseNodes = processIpa(base, firstIpaVariant(ipa))
      const soundNodes = baseNodes.filter(n => n.s !== '')
      const lastPhoneme = soundNodes.length
        ? soundNodes[soundNodes.length - 1].s
        : base[base.length - 1]

      const { phonetic, eicSpelling } = suffixPipeline.process_suffix_s(base, lastPhoneme)
      const extra = eicSpelling.slice(base.length) // literele chiar adăugate față de bază: "s", "es"

      if (phonetic === '/ɪz/' && extra.length === 2) {
        // Sibilantă cu epenteză vizibilă ortografic ("watch"+"es"): 'e' e
        // vocala epentetică reală /ɪ/ (nu literă mută — vezi §3.1 T2, culoarea
        // fonemului /ɪ/), 's' rămâne consoană neagră standard (T1).
        const eNode: RenderNode = { t: extra[0], s: 'ɪ', c: getColor('ɪ') ?? COLOR_CONSONANT, u: false, x: false }
        const sNode: RenderNode = { t: extra[1], s: 'z', c: COLOR_CONSONANT, u: false, x: true }
        return [...baseNodes, eNode, sNode]
      }

      // Restul cazurilor (/s/, /z/, sau /ɪz/ cu bază terminată deja în 'e'
      // mut — vezi heuristica din suffixVoicing.ts) — un singur nod sufix.
      const suffixNode: RenderNode = { t: extra || 's', s: phonetic, c: COLOR_CONSONANT, u: false, x: true }
      return [...baseNodes, suffixNode]
    }

    const ukNodes = ukRow ? build(ukRow.ipa) : null
    const usNodes = usRow ? build(usRow.ipa) : null
    const nodes = ukNodes ?? usNodes
    if (nodes) return { nodes, variant: 'derived' }
  }
  return null
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

  if (!ukRow && !usRow) {
    const derived = tryPluralFallback(word)
    if (!derived) return null

    try {
      stmtCacheSet().run(
        word, derived.variant, JSON.stringify(derived.nodes),
        null, null,
        extractProps(derived.nodes).dominantColor,
        extractProps(derived.nodes).hasSilent  ? 1 : 0,
        extractProps(derived.nodes).hasStress  ? 1 : 0,
        extractProps(derived.nodes).syllableCount,
        word.length, new Date().toISOString(),
      )
    } catch (e) {
      console.warn('cache write failed:', e)
    }
    return derived
  }

  // 3. Process through pipeline
  // firstIpaVariant() does two things at this data boundary: strips the UK
  // source's U+200D (zero-width joiner) diphthong-export artifact (e‍ɪ, ə‍ʊ...
  // verified: 0 legitimate syllabic-consonant uses in either table), AND
  // takes only the FIRST pronunciation when the `us` row lists several
  // comma-separated ones (~7.5k words — see firstIpaVariant's own comment).
  const ukNodes = ukRow ? processIpa(word, firstIpaVariant(ukRow.ipa)) : null
  const usNodes = usRow ? processIpa(word, firstIpaVariant(usRow.ipa)) : null

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

// ── Suprascriere explicită de accent (pt. cuvinte de lecție unde varianta
// implicită US ascunde fonemul-țintă — ex. STRUT: 'cup'/'son' au ʌ în uk,
// dar ə în us, o convenție de transcriere americană pentru acest sunet,
// nefiind deloc despre rhotic — regula 1/selectBest de mai jos rămâne
// corectă și neatinsă pentru toate celelalte cazuri). NU folosește cache-ul
// (B) — cache-ul e cheiat doar pe cuvânt, nu pe cuvânt+accent, deci un
// rezultat forțat aici nu trebuie să polueze lookup-ul implicit ulterior
// al aceluiași cuvânt. Cost: aceste lookup-uri punctuale nu se
// cache-uiesc — acceptabil, sunt un subset mic de cuvinte de lecție, nu
// trafic de volum.
export function getBestNodesWithAccent(word: string, accent?: 'uk' | 'us'): WordResult | null {
  if (!accent) return getBestNodes(word)

  const { uk, us } = getRawVariants(word)
  const preferred = accent === 'uk' ? uk : us
  const fallback = accent === 'uk' ? us : uk
  const chosen = preferred ?? fallback
  if (!chosen) return null

  return { nodes: chosen.nodes, variant: preferred ? accent : (accent === 'uk' ? 'us' : 'uk') }
}

export function getBestNodesManyWithAccents(
  entries: { word: string; accent?: 'uk' | 'us' }[]
): Map<string, WordResult> {
  const result = new Map<string, WordResult>()
  for (const { word, accent } of entries) {
    const r = getBestNodesWithAccent(word, accent)
    if (r) result.set(word, r)
  }
  return result
}

// ── Selection algorithm ───────────────────────────────────────────────────────
// RULE 1 (spec 2026-08-13): "If /V/∼/Vr/ ⇒ EiC=/Vr/" — when RP (`uk`, non-
// rhotic: bare vowel, no /r/) and GA (`us`, rhotic: vowel+/r/) attest the
// same word, EiC prefers the rhotic form. Verified this is a SYSTEMIC split
// between the two tables, not per-word noise: uk "near"=/nˈi‌ə/, us "near"=
// /ˈnɪɹ/ — no /r/ sound at all in uk's transcription, same for fire/poor/
// lawyer. So "prefer /Vr/" in practice means "prefer `us`", full stop —
// there's no per-phoneme comparison to do here, and no scoring needed.
//
// This REPLACES the old scoreNodes()-based selection (which compared how
// many letters each render coloured, with a Math.random() coin-flip on
// ties — non-deterministic: ~half the shared uk/us vocabulary could render
// with either accent's phonetics on any given lookup). Rule 1 makes the
// choice a fixed, explainable default instead: `us` unless the word simply
// isn't in `us` at all, in which case `uk` is the only option anyway.
//
// Colouring itself needs no separate handling here — `processIpa()` already
// produces fully-coloured RenderNode[] for BOTH ukNodes and usNodes before
// this function ever runs (colors.ts's getColor() applies identically
// regardless of source table). This function only decides WHICH already-
// coloured render wins; it was never responsible for colouring itself.
//
// scoreNodes()/score.ts is no longer called from here. Left in place (still
// exported from engine/index.ts) in case another caller needs a rough
// "how much got coloured" signal — but it's not a linguistic rule and
// should not come back into the uk/us decision.
//
// CACHE NOTE: existing cache.db rows may still carry variant:'coin' from
// before this fix — the old coin-flip choice is now permanently frozen in
// cache for those words rather than reconsidered under Rule 1, same class
// of staleness bug as the earlier lawyer/cache.db issue. Re-processing (or
// a targeted `DELETE FROM words WHERE variant='coin'`) is needed to apply
// Rule 1 retroactively to already-cached words.
function selectBest(uk: RenderNode[] | null, us: RenderNode[] | null): WordResult | null {
  if (!uk && !us) return null
  if (us) return { nodes: us, variant: 'us' }
  return { nodes: uk!, variant: 'uk' }
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