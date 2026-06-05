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

export const COLOR_SILENT    = '#000000'
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

export const GRAPHIC_CONSONANTS = new Set('bcdfghjklmnpqrstvxz');

export function isGraphicConsonantString(t: string): boolean {
  return t.length > 0 && [...t.toLowerCase()].every(c => GRAPHIC_CONSONANTS.has(c));
}