// engine/index.ts
// PUBLIC API — the only file other modules should import from.
// `import { processIpa, scoreNodes, extractProps } from './engine'`
// `import type { RenderNode } from './engine'`
//
// Signature-compatible with the old pipeline.ts on purpose: db.ts only needs
// its import path changed, nothing else.

import { segment } from './segment'
import { align } from './align'
import { COLOR_SILENT } from './colorMap'
import type { RenderNode } from './types'

export function processIpa(word: string, rawIpa: string): RenderNode[] {
  if (!rawIpa?.trim()) {
    return [{ t: word, s: '', c: COLOR_SILENT, u: false, x: false }]
  }
  const segs = segment(rawIpa)
  return align(word, segs)
}

export { scoreNodes, extractProps } from './score'
export { COLOR_SILENT, COLOR_CONSONANT, COLOR_MAP, getColor } from './colorMap'
export { GRAPHIC_VOWELS, isGraphicVowel, isGraphicCons } from './align'
export type { RenderNode, Seg, WordProps } from './types'
