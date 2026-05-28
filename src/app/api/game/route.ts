// GET /api/game?level=1&n=10
// Returns n words appropriate for the given game level
// Level 1: colour recognition (simple 3-5 letter words, clear dominant vowel)
// Level 2: silent letter detection (words with mute letters)
// Level 3: stress/accent recognition (polysyllabic words with clear stress)

import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

const SILENT  = '#cccccc'
const GRAPHIC_CONS = new Set('bcdfghjklmnpqrstvxz')

function isGraphicCons(t: string): boolean {
  return !!t && [...t.toLowerCase()].every(c => GRAPHIC_CONS.has(c))
}

interface DbWord { Word: string; RenderJson: string }

interface GameNode {
  t: string; s: string; c: string; u: boolean; x: boolean
}

function parseNodes(rj: string): GameNode[] | null {
  try {
    const p = JSON.parse(rj)
    if (!Array.isArray(p) || p.length === 0) return null
    // Handle both object format (v2) and array format (words_clean)
    if (typeof p[0] === 'object' && !Array.isArray(p[0])) return p as GameNode[]
    // Array format: [t, s, colorIdx, isStressed, isConsonant]
    const COLOR_INDEX: Record<number, string> = {
      0:'#008E40',1:'#00b0f0',2:'#7030A0',3:'#888888',
      4:'#CC0000',5:'#E57373',6:'#EE5B00',7:'#FF3399',
    }
    return p.map((n: unknown[]) => ({
      t: n[0] as string ?? '',
      s: n[1] as string ?? '',
      c: n[2] === 8 ? SILENT : (COLOR_INDEX[n[2] as number] ?? SILENT),
      u: n[3] === 1,
      x: n[4] === 1,
    }))
  } catch { return null }
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

  const db = getDb()

  // Fetch candidate words
  const maxLen = level === 1 ? 6 : level === 2 ? 8 : 10
  const minLen = level === 1 ? 3 : 4

  const rows = db.prepare(`
    SELECT Word, RenderJson FROM uk
    WHERE RenderJson IS NOT NULL AND RenderJson != '[]'
    AND length(Word) BETWEEN ? AND ?
    ORDER BY RANDOM()
    LIMIT 2000
  `).all(minLen, maxLen) as DbWord[]

  const filtered: { word: string; nodes: GameNode[]; dominantColor: string }[] = []

  for (const row of rows) {
    const nodes = parseNodes(row.RenderJson)
    if (!nodes) continue

    const dom = dominantColor(nodes)
    if (!dom) continue

    if (level === 1) {
      // Simple words with clear single dominant vowel colour
      filtered.push({ word: row.Word, nodes, dominantColor: dom })
    } else if (level === 2) {
      // Must have silent letters
      if (hasSilentLetters(nodes))
        filtered.push({ word: row.Word, nodes, dominantColor: dom })
    } else if (level === 3) {
      // Must have stress marking
      if (hasStress(nodes) && row.Word.length >= 5)
        filtered.push({ word: row.Word, nodes, dominantColor: dom })
    }

    if (filtered.length >= n * 5) break
  }

  const selected = shuffle(filtered).slice(0, n)

  return NextResponse.json({ words: selected }, {
    headers: { 'Cache-Control': 'no-store' }
  })
}
