import { NextRequest, NextResponse } from 'next/server'
import { getBestNodesMany, getBestNodesManyWithAccents } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body  = await req.json()
    const words: string[] = body?.words
    // Opțional: mapare cuvânt(lowercase) -> accent preferat ('uk'/'us'),
    // pentru cazuri unde varianta implicită (regula 1, vezi db.ts) ascunde
    // fonemul pe care o lecție vrea explicit să-l predea (ex. STRUT).
    // Retro-compatibil: dacă `accents` lipsește, comportamentul e identic
    // cu înainte (getBestNodesMany, fără nicio suprascriere).
    const accents: Record<string, 'uk' | 'us'> | undefined = body?.accents

    if (!Array.isArray(words) || words.length === 0)
      return NextResponse.json({ results: {} })

    const unique = [...new Set(
      words.map(w => w.toLowerCase().trim()).filter(Boolean)
    )]

    const map = accents && Object.keys(accents).length > 0
      ? getBestNodesManyWithAccents(unique.map(w => ({ word: w, accent: accents[w] })))
      : getBestNodesMany(unique)

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

// DELETE /api/words — clear cache (admin use)
export async function DELETE() {
  try {
    const { getCache } = await import('@/lib/db')
    getCache().prepare('DELETE FROM words').run()
    return NextResponse.json({ ok: true, message: 'Cache cleared' })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
