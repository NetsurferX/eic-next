// engine/score.ts
// Word-level properties derived from a finished RenderNode[] — used to pick
// UK vs US variant and to populate cache.db's summary columns. Pure
// functions, no dependency on align.ts/segment.ts internals.

import type { RenderNode, WordProps } from './types'
import { COLOR_SILENT, COLOR_CONSONANT } from '../rules/colors'
import { isGraphicCons } from './align'

export function scoreNodes(nodes: RenderNode[]): number {
  return nodes
    .filter(n => n.t && n.c !== COLOR_SILENT && n.c !== COLOR_CONSONANT)
    .reduce((sum, n) => sum + n.t.length, 0)
}

export function extractProps(nodes: RenderNode[]): WordProps {
  const colorCounts: Record<string, number> = {}
  let hasSilent = false
  let hasStress = false
  let syllableCount = 0

  for (const n of nodes) {
    if (n.c === COLOR_SILENT && n.t && isGraphicCons(n.t)) hasSilent = true
    if (n.u) hasStress = true

    if (n.c !== COLOR_SILENT && n.c !== COLOR_CONSONANT && n.t) {
      syllableCount++
      const c = colorCounts[n.c] ?? 0
      colorCounts[n.c] = c + n.t.length
    }
  }

  const entries = Object.entries(colorCounts)
  const dominantColor = entries.length > 0
    ? entries.sort((a, b) => b[1] - a[1])[0][0]
    : null

  return {
    dominantColor,
    hasSilent,
    hasStress,
    syllableCount: Math.max(1, syllableCount),
  }
}
