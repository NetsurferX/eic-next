// GET /api/game?level=1&n=10
// Returns n words appropriate for the given game level
// Level 1: colour recognition (simple 3-5 letter words, clear dominant vowel)
// Level 2: silent letter detection (words with mute letters)
// Level 3: stress/accent recognition (polysyllabic words with clear stress)

import { NextRequest, NextResponse } from 'next/server'
import { getCache, getBestNodes } from '@/lib/db'

const SILENT  = '#cccccc'
const GRAPHIC_CONS = new Set('bcdfghjklmnpqrstvxz')

function isGraphicCons(t: string): boolean {
  return !!t && [...t.toLowerCase()].every(c => GRAPHIC_CONS.has(c))
}

interface GameNode {
  t: string; s: string; c: string; u: boolean; x: boolean
}

function dominantColor(nodes: GameNode[]): string | null {
  const cc: Record<string, number> = {}
  for (const n of nodes) {
    if (n.c && n.c !== SILENT && n.t && !isGraphicCons(n.t))
      cc[n.c] = (cc[n.c] ?? 0) + n.t.length
  }
  const entries = Object.entries(cc)
  if (!entries.length) return null
  return entries.sort((a, b) => b[1] - a[1])[0][0]
}

function hasSilentLetters(nodes: GameNode[]): boolean {
  return nodes.some(n => n.c === SILENT && n.t && isGraphicCons(n.t))
}

function hasStress(nodes: GameNode[]): boolean {
  return nodes.some(n => n.u && n.c !== SILENT)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function GET(req: NextRequest) {
  const level = parseInt(req.nextUrl.searchParams.get('level') ?? '1')
  const n     = Math.min(parseInt(req.nextUrl.searchParams.get('n') ?? '10'), 20)

  const cache  = getCache()
  const maxLen = level === 1 ? 6 : level === 2 ? 8 : 10
  const minLen = level === 1 ? 3 : 4

  // Try to get words from cache.db first (already processed, has columns)
  const cacheCount = (cache.prepare('SELECT COUNT(*) as c FROM words').get() as {c:number}).c

  let candidateWords: string[] = []

  if (cacheCount > 100) {
    // Cache is populated — use column filters for precision
    let query = `SELECT word FROM words WHERE word_length BETWEEN ? AND ?`
    const params: (string|number)[] = [minLen, maxLen]

    if (level === 2) { query += ` AND has_silent = 1`; }
    if (level === 3) { query += ` AND has_stress = 1 AND word_length >= 5`; }

    query += ` ORDER BY RANDOM() LIMIT ${n * 8}`
    candidateWords = (cache.prepare(query).all(...params) as {word:string}[]).map(r => r.word)
  }

  // If not enough from cache, supplement from lexicon via getBestNodes
  if (candidateWords.length < n * 3) {
    const { getLexicon } = await import('@/lib/db')
    const lex = getLexicon()
    const lexRows = lex.prepare(
      `SELECT word FROM uk WHERE length(word) BETWEEN ? AND ? ORDER BY RANDOM() LIMIT 500`
    ).all(minLen, maxLen) as {word:string}[]
    const extra = lexRows.map(r => r.word).filter(w => !candidateWords.includes(w))
    candidateWords = [...candidateWords, ...extra]
  }

  // Process candidates through pipeline (will cache results)
  const filtered: { word: string; nodes: GameNode[]; dominantColor: string }[] = []

  for (const word of candidateWords) {
    if (filtered.length >= n * 4) break
    const result = getBestNodes(word)
    if (!result) continue

    const nodes = result.nodes as GameNode[]
    const dom   = dominantColor(nodes)
    if (!dom) continue

    if (level === 1) {
      filtered.push({ word, nodes, dominantColor: dom })
    } else if (level === 2) {
      if (hasSilentLetters(nodes)) filtered.push({ word, nodes, dominantColor: dom })
    } else if (level === 3) {
      if (hasStress(nodes) && word.length >= 5) filtered.push({ word, nodes, dominantColor: dom })
    }
  }

  const selected = shuffle(filtered).slice(0, n)
  return NextResponse.json({ words: selected }, { headers: { 'Cache-Control': 'no-store' } })
}
