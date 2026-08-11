import { NextRequest, NextResponse } from 'next/server'
import { getRawVariants } from '@/lib/db'

// GET /api/words/variants?word=generator
// → { word, uk: { ipa, nodes } | null, us: { ipa, nodes } | null }
//
// Debug endpoint for /culise — unlike POST /api/words, it never collapses
// to a single "best" accent. Both lexicon rows come back raw so the page
// can show them side by side (same data accent-test.ts prints to a
// terminal, just served over HTTP for the browser).
export async function GET(req: NextRequest) {
  try {
    const word = req.nextUrl.searchParams.get('word')?.toLowerCase().trim()
    if (!word) return NextResponse.json({ error: 'missing ?word=' }, { status: 400 })

    const { uk, us } = getRawVariants(word)
    return NextResponse.json({ word, uk, us })
  } catch (err) {
    console.error('/api/words/variants error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
