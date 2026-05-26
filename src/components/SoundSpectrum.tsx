'use client'

import { useEffect, useRef } from 'react'
import type { TextToken } from '@/lib/useColorizer'
import { COLOR_SILENT, COLOR_CONSONANT } from '@/lib/renderNode'

interface Props {
  tokens: TextToken[]
}

const VOWEL_COLORS = [
  '#008E40', '#00b0f0', '#7030A0', '#888888',
  '#CC0000', '#E57373', '#EE5B00', '#FF3399',
]

const LABELS: Record<string, string> = {
  '#008E40': 'ɑ/ʌ', '#00b0f0': 'æ',   '#7030A0': 'u/ʊ',
  '#888888': 'ə',   '#CC0000': 'i/ɪ',  '#E57373': 'j/w',
  '#EE5B00': 'e/ɛ', '#FF3399': 'ɒ/ɔ',
}

export default function SoundSpectrum({ tokens }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef   = useRef<number>(0)
  const barsRef   = useRef<number[]>(VOWEL_COLORS.map(() => 0))
  const targetRef = useRef<number[]>(VOWEL_COLORS.map(() => 0))

  // Compute target bar heights from tokens
  useEffect(() => {
    const counts = new Map<string, number>()
    let total = 0

    for (const tok of tokens) {
      if (!tok.nodes) continue
      for (const n of tok.nodes) {
        if (n.c === COLOR_SILENT || n.c === COLOR_CONSONANT || !n.t) continue
        counts.set(n.c, (counts.get(n.c) ?? 0) + n.t.length)
        total += n.t.length
      }
    }

    targetRef.current = VOWEL_COLORS.map(c =>
      total > 0 ? ((counts.get(c) ?? 0) / total) : 0
    )
  }, [tokens])

  // Animation loop — smooth lerp toward targets
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width  = canvas.offsetWidth  * window.devicePixelRatio
    const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio
    const n = VOWEL_COLORS.length
    const barW   = W / n
    const maxH   = H * 0.85
    const baseY  = H

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, W, H)

      // Background subtle grid
      ctx.strokeStyle = 'rgba(0,0,0,0.04)'
      ctx.lineWidth   = 1
      for (let i = 1; i < 4; i++) {
        const y = H - (maxH * i / 3)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }

      barsRef.current = barsRef.current.map((cur, i) => {
        const target = targetRef.current[i]
        return cur + (target - cur) * 0.08  // lerp speed
      })

      barsRef.current.forEach((val, i) => {
        const x = i * barW
        const h = val * maxH
        const y = baseY - h

        // Bar gradient
        const grad = ctx.createLinearGradient(x, y, x, baseY)
        grad.addColorStop(0,   VOWEL_COLORS[i] + 'ff')
        grad.addColorStop(0.7, VOWEL_COLORS[i] + 'cc')
        grad.addColorStop(1,   VOWEL_COLORS[i] + '44')

        const radius = Math.min(6, barW * 0.3)
        ctx.beginPath()
        ctx.roundRect(x + 3, y, barW - 6, h, [radius, radius, 0, 0])
        ctx.fillStyle = grad
        ctx.fill()

        // Label
        if (val > 0.02) {
          ctx.fillStyle = VOWEL_COLORS[i]
          ctx.font      = `${Math.round(10 * window.devicePixelRatio)}px Inter, sans-serif`
          ctx.textAlign = 'center'
          ctx.fillText(LABELS[VOWEL_COLORS[i]] ?? '', x + barW / 2, baseY - 4)
        }
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <div className="spectrum-wrap" aria-label="Sound spectrum visualiser">
      <canvas ref={canvasRef} className="spectrum-canvas" />
    </div>
  )
}
