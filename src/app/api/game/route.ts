// GET /api/game?n=10&difficulty=easy|medium|hard
// Returns n words for the colour game. Difficulty controls word length —
// distractor difficulty (near-colour confusion) is handled client-side in
// ColourGame.tsx via NEAR_COLOR_GROUPS, since that's about which wrong
// options are shown, not which words are picked.

import { NextRequest, NextResponse } from 'next/server'
import { getCache, getLexicon, getBestNodes } from '@/lib/db'

const SILENT    = '#000000'
const CONSONANT = '#000000'
// SYNCED with engine/display.ts's GRAPHIC_CONSONANT_LETTERS (includes w/y).
const GRAPHIC_CONS = new Set('bcdfghjklmnpqrstvwxyz')

interface GameNode { t: string; s: string; c: string; u: boolean; x: boolean }

type Difficulty = 'easy' | 'medium' | 'hard'

const LENGTH_RANGE: Record<Difficulty, [number, number]> = {
  easy:   [3, 5],
  medium: [5, 8],
  hard:   [7, 12],
}

function isGraphicCons(t: string) {
  return !!t && [...t.toLowerCase()].every(c => GRAPHIC_CONS.has(c))
}
function dominantColor(nodes: GameNode[]): string | null {
  const cc: Record<string, number> = {}
  for (const n of nodes)
    if (n.c !== SILENT && n.c !== CONSONANT && n.t && !isGraphicCons(n.t))
      cc[n.c] = (cc[n.c] ?? 0) + n.t.length
  const entries = Object.entries(cc)
  return entries.length ? entries.sort((a, b) => b[1] - a[1])[0][0] : null
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
  const n = Math.min(parseInt(req.nextUrl.searchParams.get('n') ?? '10'), 20)
  const difficultyParam = req.nextUrl.searchParams.get('difficulty')
  const difficulty: Difficulty =
    difficultyParam === 'easy' || difficultyParam === 'medium' || difficultyParam === 'hard'
      ? difficultyParam
      : 'medium'
  const [minLen, maxLen] = LENGTH_RANGE[difficulty]

  let candidates: string[] = []

  try {
    const cache = getCache()
    const cacheCount = (cache.prepare('SELECT COUNT(*) as c FROM words').get() as { c: number }).c
    if (cacheCount > 50) {
      candidates = (cache.prepare(
        `SELECT word FROM words WHERE word_length BETWEEN ? AND ? ORDER BY RANDOM() LIMIT ${n * 6}`
      ).all(minLen, maxLen) as { word: string }[]).map(r => r.word)
    }
  } catch { /* cache not ready yet */ }

  if (candidates.length < n * 3) {
    try {
      const lex = getLexicon()
      const rows = lex.prepare(
        `SELECT word FROM uk WHERE length(word) BETWEEN ? AND ? ORDER BY RANDOM() LIMIT 400`
      ).all(minLen, maxLen) as { word: string }[]
      const extra = rows.map(r => r.word).filter(w => !candidates.includes(w))
      candidates = [...candidates, ...extra]
    } catch { /* lexicon not ready */ }
  }

  const filtered: { word: string; nodes: GameNode[]; dominantColor: string }[] = []

  for (const word of shuffle(candidates)) {
    if (filtered.length >= n * 3) break
    try {
      const result = getBestNodes(word)
      if (!result) continue
      const nodes = result.nodes as GameNode[]
      const dom   = dominantColor(nodes)
      if (!dom) continue
      filtered.push({ word, nodes, dominantColor: dom })
    } catch { continue }
  }

  return NextResponse.json(
    { words: shuffle(filtered).slice(0, n) },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
