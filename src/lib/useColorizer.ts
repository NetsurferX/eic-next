'use client'
import { useState, useCallback, useRef } from 'react'
import type { RenderNode } from './renderNode'
import { COLOR_SILENT, COLOR_CONSONANT } from './renderNode'

export interface TextToken {
  raw:          string
  key:          string
  isWord:       boolean
  isWhitespace: boolean
  isPunct:      boolean
  nodes:        RenderNode[] | null
}

export interface Stats {
  wordCount:    number
  knownCount:   number
  topColor:     string
  topLabel:     string
  topCount:     number
  distribution: { color: string; count: number }[]
  distSummary:  string
  difficulty:   string
  diffLabel:    string
}

const DEBOUNCE_MS = 350
const nodeCache = new Map<string, RenderNode[]>()

function tokenize(text: string): Omit<TextToken, 'nodes'>[] {
  const tokens: Omit<TextToken, 'nodes'>[] = []
  let i = 0, seq = 0
  while (i < text.length) {
    const c = text[i]
    if (/[a-zA-Z]/.test(c)) {
      const start = i
      while (i < text.length && /[a-zA-Z'-]/.test(text[i])) i++
      const raw = text.slice(start, i)
      tokens.push({ raw, key: `w-${raw.toLowerCase()}-${seq++}`, isWord: true, isWhitespace: false, isPunct: false })
    } else if (/\s/.test(c)) {
      const start = i
      while (i < text.length && /\s/.test(text[i])) i++
      tokens.push({ raw: text.slice(start, i), key: `ws-${seq++}`, isWord: false, isWhitespace: true, isPunct: false })
    } else {
      const start = i
      while (i < text.length && !/[a-zA-Z\s]/.test(text[i])) i++
      tokens.push({ raw: text.slice(start, i), key: `p-${seq++}`, isWord: false, isWhitespace: false, isPunct: true })
    }
  }
  return tokens
}

function colorToLabel(c: string): string {
  const m: Record<string, string> = {
    '#00b0f0': 'æ', '#008E40': 'ɑ/ʌ', '#888888': 'ə',
    '#EE5B00': 'e/ɛ', '#CC0000': 'i/ɪ', '#FF3399': 'ɒ/ɔ',
    '#7030A0': 'u/ʊ', '#4472C4': 'aɪ/aʊ', '#E57373': 'j/w',
  }
  return m[c] ?? c
}

function computeStats(tokens: TextToken[]): Stats {
  const wordTokens = tokens.filter(t => t.isWord)
  const wordCount  = wordTokens.length
  const knownCount = wordTokens.filter(t => t.nodes !== null).length

  if (wordCount === 0) return {
    wordCount: 0, knownCount: 0, topColor: '', topLabel: '—',
    topCount: 0, distribution: [], distSummary: '', difficulty: '—', diffLabel: 'type something'
  }

  const allNodes = wordTokens
    .flatMap(t => t.nodes ?? [])
    .filter(n => n.c !== COLOR_SILENT && n.c !== COLOR_CONSONANT && n.t.length > 0)

  const groups = new Map<string, number>()
  for (const n of allNodes)
    groups.set(n.c, (groups.get(n.c) ?? 0) + n.t.length)

  const distribution = [...groups.entries()]
    .map(([color, count]) => ({ color, count }))
    .sort((a, b) => b.count - a.count)

  const total = distribution.reduce((s, d) => s + d.count, 0)
  const top   = distribution[0]

  const distSummary = distribution.slice(0, 2)
    .map(d => `${Math.round(d.count * 100 / total)}% ${colorToLabel(d.color)}`)
    .join(' · ')

  const avgLen = wordCount > 0
    ? wordTokens.reduce((s, t) => s + t.raw.length, 0) / wordCount : 0

  const [difficulty, diffLabel] =
    avgLen < 4 ? ['A1','beginner'] :
    avgLen < 5 ? ['A2','elementary'] :
    avgLen < 6 ? ['B1','intermediate'] :
    avgLen < 7 ? ['B2','upper intermediate'] :
                 ['C1+','advanced']

  return {
    wordCount, knownCount,
    topColor: top?.color ?? '',
    topLabel: top ? colorToLabel(top.color) : '—',
    topCount: top?.count ?? 0,
    distribution, distSummary, difficulty, diffLabel,
  }
}

export function useColorizer() {
  const [tokens, setTokens]       = useState<TextToken[]>([])
  const [stats, setStats]         = useState<Stats | null>(null)
  const [inputText, setInputText] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const processText = useCallback(async (text: string) => {
    if (!text.trim()) { setTokens([]); setStats(null); return }

    const raw = tokenize(text)

    const unresolved = raw
      .filter(t => t.isWord && !nodeCache.has(t.raw.toLowerCase()))
      .map(t => t.raw.toLowerCase())
      .filter((w, i, a) => a.indexOf(w) === i)

    if (unresolved.length > 0) {
      try {
        const res  = await fetch('/api/words', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ words: unresolved }),
        })
        const data = await res.json() as { results?: Record<string, RenderNode[]> }
        if (data.results) {
          for (const [word, nodes] of Object.entries(data.results))
            nodeCache.set(word, nodes)
        }
      } catch (e) { console.error('Fetch error:', e) }
    }

    const updated: TextToken[] = raw.map(t => ({
      ...t,
      nodes: t.isWord ? (nodeCache.get(t.raw.toLowerCase()) ?? null) : null
    }))

    setTokens(updated)
    setStats(computeStats(updated))
  }, [])

  const onInput = useCallback((text: string) => {
    setInputText(text)

    // Render instant cu cache existent
    const raw = tokenize(text)
    const fast: TextToken[] = raw.map(t => ({
      ...t,
      nodes: t.isWord ? (nodeCache.get(t.raw.toLowerCase()) ?? null) : null
    }))
    setTokens(fast)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => processText(text), DEBOUNCE_MS)
  }, [processText])

  return { tokens, stats, inputText, onInput, setInputText }
}
