// POST /api/speak  { word: string }
// Uses espeak-ng on the server to generate audio, streams it back as audio/wav
// Falls back gracefully if espeak-ng is not available

import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { tmpdir } from 'os'
import { join } from 'path'
import { readFile, unlink } from 'fs/promises'

const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  try {
    const { word } = await req.json() as { word: string }
    if (!word || typeof word !== 'string') {
      return NextResponse.json({ error: 'No word' }, { status: 400 })
    }

    // Sanitize — only allow letters, hyphens, apostrophes
    const safe = word.replace(/[^a-zA-Z'\-]/g, '').slice(0, 50)
    if (!safe) return NextResponse.json({ error: 'Invalid word' }, { status: 400 })

    const outFile = join(tmpdir(), `eic_${Date.now()}.wav`)

    // espeak-ng: British English, slightly slower rate
    await execAsync(
      `espeak-ng -v en-gb -s 130 -w "${outFile}" "${safe}"`,
      { timeout: 3000 }
    )

    const audio = await readFile(outFile)
    await unlink(outFile).catch(() => {})

    return new NextResponse(audio, {
      headers: {
        'Content-Type':  'audio/wav',
        'Cache-Control': 'public, max-age=86400',
      }
    })
  } catch (err) {
    console.error('/api/speak error:', err)
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
  }
}
