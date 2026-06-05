'use client'

import { useMemo, useRef, useState } from 'react'
import type { TextToken } from '@/lib/useColorizer'
import { COLOR_SILENT, COLOR_CONSONANT } from '@/lib/renderNode'

interface Props {
  tokens: TextToken[]
}

interface WordPeak {
  word:       string
  height:     number  // 0-1 normalised complexity
  color:      string  // dominant vowel colour
  silent:     number  // count of silent letters
  stressed:   boolean
}

function wordComplexity(tok: TextToken): WordPeak {
  if (!tok.nodes) return { word: tok.raw, height: 0.1, color: '#000000', silent: 0, stressed: false }

  const nodes    = tok.nodes
  const total    = nodes.filter(n => n.t.length > 0).length
  const silent   = nodes.filter(n => n.c === COLOR_SILENT && n.t.length > 0).length
  const stressed = nodes.some(n => n.u)
  const vowels   = nodes.filter(n => n.c !== COLOR_SILENT && n.c !== COLOR_CONSONANT && n.t.length > 0)

  // Dominant colour
  const colorCounts = new Map<string, number>()
  for (const n of vowels) colorCounts.set(n.c, (colorCounts.get(n.c) ?? 0) + n.t.length)
  const dominant = [...colorCounts.entries()].sort((a, b) => b[1] - a[1])[0]

  // Complexity = ratio of silent + unusual mappings
  const silentRatio  = total > 0 ? silent / total : 0
  const lengthFactor = Math.min(tok.raw.length / 12, 1)
  const vowelFactor  = total > 0 ? 1 - (vowels.length / total) : 0.5

  const height = Math.max(0.08, Math.min(1,
    silentRatio * 0.5 + lengthFactor * 0.3 + vowelFactor * 0.2
  ))

  return {
    word:     tok.raw,
    height,
    color:    dominant?.[0] ?? '#000000',
    silent,
    stressed,
  }
}

export default function TerrainView({ tokens }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hovered, setHovered] = useState<WordPeak | null>(null)
  const [hoveredX, setHoveredX] = useState(0)

  const peaks = useMemo<WordPeak[]>(() =>
    tokens.filter(t => t.isWord).map(wordComplexity),
  [tokens])

  const W = 800
  const H = 200
  const PAD = 20

  const points = useMemo(() => {
    if (peaks.length === 0) return ''
    const step = (W - PAD * 2) / Math.max(peaks.length - 1, 1)
    const pts = peaks.map((p, i) => {
      const x = PAD + i * step
      const y = H - PAD - p.height * (H - PAD * 2)
      return { x, y, peak: p }
    })

    // Build smooth SVG path (catmull-rom approximation)
    if (pts.length === 1) {
      return { path: `M ${PAD},${H} L ${pts[0].x},${pts[0].y} L ${W - PAD},${H} Z`, pts }
    }

    let d = `M ${PAD},${H} L ${pts[0].x},${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const cp1x = pts[i].x + (pts[i + 1].x - pts[i].x) / 3
      const cp1y = pts[i].y
      const cp2x = pts[i].x + 2 * (pts[i + 1].x - pts[i].x) / 3
      const cp2y = pts[i + 1].y
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pts[i + 1].x},${pts[i + 1].y}`
    }
    d += ` L ${W - PAD},${H} Z`
    return { path: d, pts }
  }, [peaks])

  if (typeof points === 'string') return null

  return (
    <div className="terrain-wrap">
      <div className="terrain-header">
        <span className="terrain-title">Phonetic Landscape</span>
        <span className="terrain-sub">
          Higher peaks = more complex phonetic patterns
        </span>
      </div>

      {peaks.length === 0 ? (
        <div className="terrain-empty">Paste text above to see the landscape.</div>
      ) : (
        <div className="terrain-svg-wrap">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="terrain-svg"
            onMouseLeave={() => setHovered(null)}
          >
            <defs>
              <linearGradient id="terrain-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#4472C4" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#00b0f0" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Filled terrain */}
            <path d={points.path} fill="url(#terrain-grad)" />

            {/* Outline */}
            <path
              d={points.path.replace(/ L [^ ]+ [^ ]+ Z/, '').replace('M 20 200 ', '')}
              fill="none"
              stroke="#4472C4"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Word markers */}
            {points.pts.map(({ x, y, peak }, i) => (
              <g key={i}>
                <circle
                  cx={x} cy={y} r={peak.stressed ? 5 : 3}
                  fill={peak.color}
                  stroke="#fff"
                  strokeWidth="1.5"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={e => {
                    setHovered(peak)
                    setHoveredX(x)
                  }}
                />
                {peak.silent > 0 && (
                  <circle cx={x} cy={y} r={8} fill="none"
                    stroke="#" strokeWidth="1" strokeDasharray="2,2" />
                )}
              </g>
            ))}

            {/* Hover label */}
            {hovered && (
              <g>
                <rect
                  x={Math.min(hoveredX - 40, W - 100)} y={H - 180}
                  width={Math.max(hovered.word.length * 9, 60)} height={36}
                  rx={6} fill="#1a1917" opacity={0.9}
                />
                <text
                  x={Math.min(hoveredX - 40, W - 100) + Math.max(hovered.word.length * 9, 60) / 2}
                  y={H - 158}
                  fill="#fff"
                  fontSize={13}
                  textAnchor="middle"
                  fontFamily="Inter, sans-serif"
                >
                  {hovered.word}
                </text>
                <text
                  x={Math.min(hoveredX - 40, W - 100) + Math.max(hovered.word.length * 9, 60) / 2}
                  y={H - 144}
                  fill={hovered.color}
                  fontSize={10}
                  textAnchor="middle"
                  fontFamily="Inter, sans-serif"
                >
                  {hovered.silent > 0 ? `${hovered.silent} silent` : ''}
                  {hovered.stressed ? ' · stressed' : ''}
                </text>
              </g>
            )}
          </svg>
        </div>
      )}
    </div>
  )
}
