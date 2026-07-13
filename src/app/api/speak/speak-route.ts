// POST /api/speak  { word: string }
// Uses Piper (local neural TTS) for natural-sounding audio — a real step up
// from espeak-ng's formant synthesis, which is robotic by design and isn't
// something you can tune your way out of.
//
// Falls back to espeak-ng automatically if Piper or its model isn't
// installed yet, so audio never just breaks mid-rollout.
//
// SETUP (one-time, per server):
//   1. Install the Piper binary: https://github.com/rhasspy/piper/releases
//      (or `pip install piper-tts` for the Python CLI variant)
//   2. Download a British English voice model, e.g.:
//        mkdir -p /opt/piper/voices
//        curl -L -o /opt/piper/voices/en_GB-southern_english_female-medium.onnx \
//          https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/southern_english_female/medium/en_GB-southern_english_female-medium.onnx
//        curl -L -o /opt/piper/voices/en_GB-southern_english_female-medium.onnx.json \
//          https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/southern_english_female/medium/en_GB-southern_english_female-medium.onnx.json
//      Browse other en_GB voices (male, different accents) at:
//        https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB
//   3. Optionally override via env vars: PIPER_BIN, PIPER_MODEL
//   Flag names below match current Piper CLI — run `piper --help` on your
//   install to confirm if you're on an older/newer build.

import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { tmpdir } from 'os'
import { join } from 'path'
import { readFile, unlink, mkdir, writeFile } from 'fs/promises'
import { existsSync } from 'fs'

const execAsync = promisify(exec)

const PIPER_BIN   = process.env.PIPER_BIN   ?? 'piper'
const PIPER_MODEL = process.env.PIPER_MODEL ?? '/opt/piper/voices/en_GB-southern_english_female-medium.onnx'

// Same-word requests are extremely common in the colour game (repeat rounds,
// re-listens) — cache the wav on disk so a repeat is an instant read, not
// another ~200-500ms neural synthesis pass.
const CACHE_DIR = join(tmpdir(), 'eic-speech-cache')

async function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) await mkdir(CACHE_DIR, { recursive: true })
}

async function synthesizeWithPiper(safe: string, outFile: string) {
  // length_scale > 1 slows speech down slightly — mirrors the old
  // espeak-ng "-s 130" slow rate, easier to follow for learners.
  await execAsync(
    `echo "${safe}" | "${PIPER_BIN}" --model "${PIPER_MODEL}" --length_scale 1.15 --output_file "${outFile}"`,
    { timeout: 8000 }
  )
}

async function synthesizeWithEspeak(safe: string, outFile: string) {
  await execAsync(
    `espeak-ng -v en-gb -s 130 -w "${outFile}" "${safe}"`,
    { timeout: 3000 }
  )
}

export async function POST(req: NextRequest) {
  try {
    const { word } = await req.json() as { word: string }
    if (!word || typeof word !== 'string') {
      return NextResponse.json({ error: 'No word' }, { status: 400 })
    }

    // Sanitize — only allow letters, hyphens, apostrophes
    const safe = word.replace(/[^a-zA-Z'\-]/g, '').slice(0, 50).toLowerCase()
    if (!safe) return NextResponse.json({ error: 'Invalid word' }, { status: 400 })

    await ensureCacheDir()
    const cachedFile = join(CACHE_DIR, `${safe}.wav`)

    let audio: Buffer

    if (existsSync(cachedFile)) {
      audio = await readFile(cachedFile)
    } else {
      const tmpFile = join(tmpdir(), `eic_${Date.now()}_${Math.random().toString(36).slice(2)}.wav`)

      try {
        await synthesizeWithPiper(safe, tmpFile)
      } catch (piperErr) {
        console.warn('/api/speak: Piper unavailable, falling back to espeak-ng:', piperErr)
        await synthesizeWithEspeak(safe, tmpFile)
      }

      audio = await readFile(tmpFile)
      await unlink(tmpFile).catch(() => {})
      await writeFile(cachedFile, audio).catch(() => {})
    }

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
