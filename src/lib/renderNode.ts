// Schema exactă din words.db RenderJson
export interface RenderNode {
  t: string   // grafemul (literele din cuvânt, poate fi '' pentru foneme fără grafem)
  s: string   // fonemul display
  c: string   // culoare hex
  u: boolean  // isStressed — silabă accentuată
  x: boolean  // isConsonant
}

// Zero-width joiner — marker pentru consoana silabică în DB
export const SYLLABIC_MARKER = '\u200d'

export const COLOR_SILENT    = '#cccccc'
export const COLOR_CONSONANT = '#000000'

export function isSyllabicConsonant(node: RenderNode): boolean {
  return node.s === SYLLABIC_MARKER
}

export function isMute(node: RenderNode): boolean {
  return node.c === COLOR_SILENT
}

export function isVowelNode(node: RenderNode): boolean {
  return !node.x && node.c !== COLOR_SILENT && node.t.length > 0
}
