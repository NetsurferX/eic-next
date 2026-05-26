import { NextRequest, NextResponse } from 'next/server'
import { searchPrefix } from '@/lib/db'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (q.length < 2) return NextResponse.json({ words: [] })
  const words = searchPrefix(q, 10)
  return NextResponse.json({ words })
}
