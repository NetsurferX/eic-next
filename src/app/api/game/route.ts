// GET /api/game?level=1&n=10
// Returns n words for the given game level, using cache.db first then lexicon.db

import { NextRequest, NextResponse } from 'next/server'
import { getCache, getLexicon, getBestNodes } from '@/lib/db'
import { resolveDisplay } from '@/lib/engine/display'

const SILENT    = '#000000'
const CONSONANT = '#000000'
// SYNCED with engine/display.ts's GRAPHIC_CONSONANT_LETTERS (includes w/y).
// This used to be missing w/y here — same drift StressGame.tsx already
// fixed on its side, but SilentGame.tsx and this route hadn't caught up.
// Worth pulling into one shared constant (e.g. lib/engine/index.ts) instead
// of three separate copies that can silently diverge again.
const GRAPHIC_CONS = new Set('bcdfghjklmnpqrstvwxyz')

interface GameNode { t: string; s: string; c: string; u: boolean; x: boolean }

function isGraphicCons(t: string) {
  return !!t && [...t.toLowerCase()].every(c => GRAPHIC_CONS.has(c))
}
function dominantColor(nodes: GameNode[]): string | null {
  const cc: Record<string, number> = {}
  for (const n of nodes)
    if (n.c !== SILENT && n.c !== CONSONANT && n.t && !isGraphicCons(n.t))
      cc[n.c] = (cc[n.c] ?? 0) + n.t.length
  const entries = Object.entries(cc)
  return entries.length ? entries.sort((a,b) => b[1]-a[1])[0][0] : null
}
function hasSilentLetters(nodes: GameNode[]) {
  return nodes.some(n => n.c === SILENT && n.t && isGraphicCons(n.t))
}
function hasStress(nodes: GameNode[]) {
  return nodes.some(n => n.u && n.c !== SILENT)
}
// Level 4 (Gradient) — no has_gradient column in cache.db to filter on at
// the SQL layer, so this runs the real resolveDisplay() per candidate and
// keeps only words where at least one node actually gets .gradient. Uses
// the real engine function rather than a fourth local reimplementation.
function hasGradient(nodes: GameNode[]) {
  return resolveDisplay(nodes).some(n => n.gradient)
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]]
  }
  return a
}

export async function GET(req: NextRequest) {
  const level  = parseInt(req.nextUrl.searchParams.get('level') ?? '1')
  const n      = Math.min(parseInt(req.nextUrl.searchParams.get('n') ?? '10'), 20)
  const maxLen = level === 1 ? 6 : level === 2 ? 8 : 10
  const minLen = level === 1 ? 3 : level === 4 ? 4 : 4

  // Level 4 has no dedicated cache column to pre-filter on, so pull a much
  // bigger candidate pool up front — gradient-bearing words (unstressed
  // ʌ/ɪ/ɒ/ʊ, or an ɔɪ glide) are less common than has_silent/has_stress
  // hits, and we only find out after running resolveDisplay() below.
  const poolMultiplier = level === 4 ? 12 : 6

  // Get candidate words — from cache if populated, else from lexicon
  let candidates: string[] = []

  try {
    const cache = getCache()
    const cacheCount = (cache.prepare('SELECT COUNT(*) as c FROM words').get() as {c:number}).c

    if (cacheCount > 50) {
      let q = `SELECT word FROM words WHERE word_length BETWEEN ? AND ?`
      if (level === 2) q += ` AND has_silent = 1`
      if (level === 3) q += ` AND has_stress = 1 AND word_length >= 5`
      // level 4: no column to filter on yet — takes the plain length-bounded pool
      q += ` ORDER BY RANDOM() LIMIT ${n * poolMultiplier}`
      candidates = (cache.prepare(q).all(minLen, maxLen) as {word:string}[]).map(r => r.word)
    }
  } catch { /* cache not ready yet */ }

  // Supplement from lexicon if needed
  if (candidates.length < n * (level === 4 ? 6 : 3)) {
    try {
      const lex = getLexicon()
      const rows = lex.prepare(
        `SELECT word FROM uk WHERE length(word) BETWEEN ? AND ? ORDER BY RANDOM() LIMIT ${level === 4 ? 800 : 400}`
      ).all(minLen, maxLen) as {word:string}[]
      const extra = rows.map(r => r.word).filter(w => !candidates.includes(w))
      candidates = [...candidates, ...extra]
    } catch { /* lexicon not ready */ }
  }

  // Process and filter
  const filtered: { word: string; nodes: GameNode[]; dominantColor: string }[] = []

  for (const word of shuffle(candidates)) {
    if (filtered.length >= n * 3) break
    try {
      const result = getBestNodes(word)
      if (!result) continue
      const nodes = result.nodes as GameNode[]
      const dom   = dominantColor(nodes)
      if (!dom) continue

      const ok =
        level === 1 ? true :
        level === 2 ? hasSilentLetters(nodes) :
        level === 3 ? hasStress(nodes) && word.length >= 5 :
        level === 4 ? hasGradient(nodes) :
        true

      if (ok) filtered.push({ word, nodes, dominantColor: dom })
    } catch { continue }
  }

  return NextResponse.json(
    { words: shuffle(filtered).slice(0, n) },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
