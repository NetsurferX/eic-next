// engine/index.ts
// PUBLIC API — the only file other modules should import from.
// `import { processIpa, scoreNodes, extractProps } from './engine'`
// `import type { RenderNode } from './engine'`
//
// Signature-compatible with the old pipeline.ts on purpose: db.ts only needs
// its import path changed, nothing else.

import { segment } from './segment'
import { align } from './align'
import { applyPhonologicalRules } from '../phonologicalRules'
import { COLOR_SILENT } from '../rules/colors'
import type { RenderNode } from './types'

export function processIpa(word: string, rawIpa: string): RenderNode[] {
  if (!rawIpa?.trim()) {
    return [{ t: word, s: '', c: COLOR_SILENT, u: false, x: false }]
  }
  // Regulile 7, 8, 12 din protocolul fonologic — rulează pe IPA-ul brut,
  // înainte de segment(), vezi engine/phonologicalRules.ts pentru ce e
  // portat aici și ce nu (și de ce).
  const ipa = applyPhonologicalRules(word, rawIpa)
  const segs = segment(ipa)
  return align(word, segs)
}

export { scoreNodes, extractProps } from './score'
export { resolveDisplay, DIPHTHONG_START, DIPHTHONG_END, TRICOLOR_CSS, TRICOLOR_UNDERLINE_COLOR } from './display'
export type { DisplayNode } from './display'
export { COLOR_SILENT, COLOR_CONSONANT, COLOR_MAP, getColor } from '../rules/colors'
export { GRAPHIC_VOWELS, isGraphicVowel, isGraphicCons } from './align'
export type { RenderNode, Seg, WordProps } from './types'