import { NextRequest, NextResponse } from 'next/server'
import { getBestNodesMany } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body  = await req.json()
    const words: string[] = body?.words

    if (!Array.isArray(words) || words.length === 0)
      return NextResponse.json({ results: {} })

    const unique = [...new Set(
      words.map(w => w.toLowerCase().trim()).filter(Boolean)
    )]

    const map = getBestNodesMany(unique)

    const results: Record<string, object[]> = {}
    for (const [word, result] of map.entries())
      results[word] = result.nodes

    return NextResponse.json({ results }, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' }
    })
  } catch (err) {
    console.error('/api/words error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
