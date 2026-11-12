'use client'

import { useEffect, useState, type CSSProperties } from 'react'

export type ReelFrame = { src: string; ms: number }

// Rulează o rolă de poze existente. `frames === null` oprește rola
// (apelantul ține poza de stare). Reduced-motion rămâne pe primul cadru.
export function useFrameCycle(frames: ReelFrame[] | null): string | null {
  const [i, setI] = useState(0)
  const key = frames?.map(f => f.src + f.ms).join('|') ?? ''
  useEffect(() => {
    if (!frames || frames.length < 2) return
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let n = 0
    let timer = 0
    const step = () => {
      timer = window.setTimeout(() => {
        n = (n + 1) % frames.length
        setI(n)
        step()
      }, frames[n].ms)
    }
    setI(0)
    step()
    return () => window.clearTimeout(timer)
    // key stabilește identitatea rolei; `frames` e constantă de modul
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  if (!frames || frames.length === 0) return null
  return frames[Math.min(i, frames.length - 1)].src
}

export const FACE_IDLE_REEL: ReelFrame[] = [
  { src: '/mascot/face-smile.png', ms: 1400 },
  { src: '/mascot/face-wink.png', ms: 200 },
  { src: '/mascot/face-smile.png', ms: 780 },
  { src: '/mascot/face-thinking.png', ms: 480 },
  { src: '/mascot/face-smile.png', ms: 640 },
  { src: '/mascot/face-surprised.png', ms: 260 },
  { src: '/mascot/face-laugh.png', ms: 340 },
]

export const FACE_SPEAK_REEL: ReelFrame[] = [
  { src: '/mascot/face-laugh.png', ms: 260 },
  { src: '/mascot/face-smile.png', ms: 140 },
  { src: '/mascot/face-surprised.png', ms: 180 },
  { src: '/mascot/face-laugh.png', ms: 220 },
]

export function FoxReel({
  frames,
  className,
  style,
}: {
  frames: ReelFrame[]
  className?: string
  style?: CSSProperties
}) {
  const src = useFrameCycle(frames) ?? frames[0]?.src
  if (!src) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={className} style={style} draggable={false} />
  )
}
