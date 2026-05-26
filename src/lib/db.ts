// Server-side only — Next.js API routes
import Database from 'better-sqlite3'
import path from 'path'
import type { RenderNode } from './renderNode'
import { COLOR_SILENT, COLOR_CONSONANT, SYLLABIC_MARKER } from './renderNode'

const DB_PATH = path.join(process.cwd(), 'data', 'words.db')

// ── Color index table (words_clean.db array format) ───────────────────────────
const COLOR_INDEX: Record<number, string> = {
  0: '#008E40',  // ɑ/ʌ
  1: '#00b0f0',  // æ
  2: '#7030A0',  // u/ʊ
  3: '#888888',  // ə
  4: '#CC0000',  // i/ɪ
  5: '#E57373',  // j/w semivowel
  6: '#EE5B00',  // e/ɛ
  7: '#FF3399',  // ɒ/ɔ
}

// ── DB singleton ──────────────────────────────────────────────────────────────
let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true })
    _db.pragma('cache_size = -32000')
    _db.pragma('temp_store = memory')
  }
  return _db
}

let _stmtUk: Database.Statement | null = null
let _stmtUs: Database.Statement | null = null
let _stmtPrefix: Database.Statement | null = null

function stmtUk() {
  if (!_stmtUk) _stmtUk = getDb().prepare('SELECT RenderJson FROM uk WHERE Word = ? LIMIT 1')
  return _stmtUk
}
function stmtUs() {
  if (!_stmtUs) _stmtUs = getDb().prepare('SELECT RenderJson FROM us WHERE Word = ? LIMIT 1')
  return _stmtUs
}

// ── Parse array format: ["grapheme","sound",colorIdx,isStressed,isConsonant] ──

function parseNode(raw: unknown[]): RenderNode | null {
  if (!Array.isArray(raw) || raw.length < 5) return null
  const [t, s, colorIdx, u, x] = raw as [string, string, number, number, number]

  // Determine color
  let c: string
  if (colorIdx === 8) {
    // Consonant slot — silent if no grapheme or sound is empty/syllabic
    const isSyllabic = s === SYLLABIC_MARKER
    const isEmpty    = !t && !s
    c = (isEmpty || (!s && !isSyllabic)) ? COLOR_SILENT : COLOR_CONSONANT
  } else {
    c = COLOR_INDEX[colorIdx] ?? COLOR_SILENT
  }

  return {
    t: t ?? '',
    s: s ?? '',
    c,
    u: u === 1,
    x: x === 1,
  }
}

function parseNodes(raw: string | null): RenderNode[] | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return null

    const nodes: RenderNode[] = []
    for (const item of parsed) {
      const node = parseNode(item)
      if (node) nodes.push(node)
    }
    return nodes.length > 0 ? nodes : null
  } catch {
    return null
  }
}

// ── Score — letters covered by vowel colour rules ─────────────────────────────

export interface WordResult {
  nodes:   RenderNode[]
  variant: 'uk' | 'us' | 'coin'
}

function score(nodes: RenderNode[]): number {
  return nodes
    .filter(n => n.t && n.c !== COLOR_SILENT && n.c !== COLOR_CONSONANT)
    .reduce((sum, n) => sum + n.t.length, 0)
}

// ── SelectBest ────────────────────────────────────────────────────────────────

function selectBest(uk: RenderNode[] | null, us: RenderNode[] | null): WordResult | null {
  if (!uk && !us) return null
  if (!uk) return { nodes: us!, variant: 'us' }
  if (!us) return { nodes: uk,  variant: 'uk' }

  const ukScore = score(uk)
  const usScore = score(us)

  if (ukScore > usScore) return { nodes: uk, variant: 'uk' }
  if (usScore > ukScore) return { nodes: us, variant: 'us' }

  const winner = Math.random() < 0.5 ? 'uk' : 'us'
  return { nodes: winner === 'uk' ? uk : us, variant: 'coin' }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getBestNodes(word: string): WordResult | null {
  word = word.toLowerCase().trim()
  if (!word) return null

  const ukRow = stmtUk().get(word) as { RenderJson: string } | undefined
  const usRow = stmtUs().get(word) as { RenderJson: string } | undefined

  return selectBest(
    parseNodes(ukRow?.RenderJson ?? null),
    parseNodes(usRow?.RenderJson ?? null)
  )
}

export function getBestNodesMany(words: string[]): Map<string, WordResult> {
  const result = new Map<string, WordResult>()
  for (const w of words) {
    const r = getBestNodes(w)
    if (r) result.set(w, r)
  }
  return result
}

export function searchPrefix(prefix: string, limit = 10): string[] {
  if (!prefix || prefix.length < 2) return []
  if (!_stmtPrefix)
    _stmtPrefix = getDb().prepare(
      'SELECT Word FROM uk WHERE Word LIKE ? ORDER BY length(Word), Word LIMIT ?'
    )
  const rows = _stmtPrefix.all(prefix.toLowerCase() + '%', limit) as { Word: string }[]
  return rows.map(r => r.Word)
}