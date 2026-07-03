// engine/display.ts
// The ONLY place that decides what a node looks like on screen.
// WordRenderer calls resolveDisplay() and just renders the result —
// no classification logic should live in the component at all.
//
// Input:  RenderNode[] after applyRegexOverrides() has run
// Output: DisplayNode[] — one entry per node, all display decisions made

import type { RenderNode } from './types'

export const COLOR_SILENT    = '#000000'
export const COLOR_CONSONANT = '#000000'
export const SYLLABIC_MARKER = '\u200d'   // must match renderNode.ts

const DIPHTHONG_START = '#FF3399'
const DIPHTHONG_END   = '#CC0000'

const SCHWA = '#888888'

// Letters that are graphically consonants — used to detect the
// "silent consonant in vowel position" case (e.g. the 'k' in 'knight'
// gets a vowel color from the engine but its letters are all consonants,
// meaning it is mute, not a vowel).
// w/y included: they can appear as graphic letters inside consonant
// positions and should not be mistaken for real vowel runs there.
const GRAPHIC_CONSONANT_LETTERS = new Set('bcdfghjklmnpqrstvwxyz')

function isGraphicConsonant(t: string): boolean {
  return t.length > 0 && [...t.toLowerCase()].every(c => GRAPHIC_CONSONANT_LETTERS.has(c))
}

function isMute(n: RenderNode): boolean {
  if (n.c === COLOR_SILENT) return true
  if (!n.t || n.t.length === 0) return false
  // A node is mute when the engine gave it a vowel color (meaning it carries
  // a vowel phoneme) but its letters are all graphic consonants — classic
  // "silent consonant" case, e.g. 'k' in 'knight'.
  const hasVowelColor = n.c !== COLOR_CONSONANT && n.c !== '' && n.c !== undefined
  if (hasVowelColor && isGraphicConsonant(n.t)) return true
  return false
}

function isVowelNode(n: RenderNode): boolean {
  if (!n.t || n.t.length === 0) return false
  if (isMute(n)) return false
  if (n.c === COLOR_CONSONANT || n.x || n.c === '') return false
  return true
}

// ── Syllabic / diphthong glide classification ─────────────────────────────────
// Nodes with SYLLABIC_MARKER as their sound are either:
//   trueSyllabic  — a syllabic consonant (preceded by schwa colour)
//   diphthongGlide — the glide part of a diphthong

function classifySyllabic(nodes: RenderNode[]): {
  trueSyllabic: Set<number>
  diphthongGlide: Set<number>
} {
  const trueSyllabic   = new Set<number>()
  const diphthongGlide = new Set<number>()
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].s !== SYLLABIC_MARKER) continue
    const prev = i > 0 ? nodes[i - 1] : null
    if (prev && prev.c === SCHWA) trueSyllabic.add(i)
    else diphthongGlide.add(i)
  }
  return { trueSyllabic, diphthongGlide }
}

// ── Diphthong gradient ────────────────────────────────────────────────────────
// A diphthong glide and the vowel immediately before it both get the gradient.

function buildDiphthongSet(nodes: RenderNode[], diphthongGlide: Set<number>): Set<number> {
  const result = new Set<number>()
  for (let i = 0; i < nodes.length; i++) {
    if (!diphthongGlide.has(i)) continue
    if (i > 0 && isVowelNode(nodes[i - 1]) && nodes[i].t.length > 0) {
      result.add(i - 1)
      result.add(i)
    }
  }
  return result
}

// ── Underline run ─────────────────────────────────────────────────────────────
// Starts at a stressed vowel node (n.u === true) and extends rightward
// through consecutive vowels, glides, and diphthong glides.
// Monosyllabic words never have n.u === true from the engine, so they
// naturally produce no underline here — no explicit monosyllabic check needed.

function buildUnderlineSet(
  nodes: RenderNode[],
  diphthongGlide: Set<number>
): Set<number> {
  const result = new Set<number>()

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i]
    if (n.underlineOverride === 'deny') continue

    // Manual force override (from regex rules) — still never underline consonants
    if (n.underlineOverride === 'force' && !n.x) {
      result.add(i)
      continue
    }

    // DOGMA: only a stressed vowel node anchors the underline.
    // Consonants (n.x === true) are never underlined, period.
    if (!n.u || n.x || !isVowelNode(n) || isMute(n)) continue

    result.add(i)

    // Extend ONLY through immediately following diphthong glide nodes.
    // Do NOT extend into the next syllable's vowel — that would be a
    // different phoneme, different syllable, wrong underline span.
    let j = i + 1
    while (j < nodes.length) {
      const next = nodes[j]
      if (next.underlineOverride === 'deny') break
      if (diphthongGlide.has(j) && !next.x) {
        result.add(j)
        j++
      } else {
        break
      }
    }
  }

  return result
}

// ── Public output type ────────────────────────────────────────────────────────

export interface DisplayNode {
  t:          string   // letters to render
  color:      string   // final text color
  underline:  boolean  // draw underline?
  gradient:   boolean  // draw pink→red diphthong gradient?
  mute:       boolean  // is silent (black)?
  syllabic:   boolean  // is syllabic consonant (white border)?
  underlineColor: string  // color for the underline decoration
  sound:      string   // tooltip (IPA sound)
}

// ── Main export ───────────────────────────────────────────────────────────────

export function resolveDisplay(nodes: RenderNode[]): DisplayNode[] {
  const { trueSyllabic, diphthongGlide } = classifySyllabic(nodes)
  const diphthongSet  = buildDiphthongSet(nodes, diphthongGlide)
  const underlineSet  = buildUnderlineSet(nodes, diphthongGlide)

  // Build per-run underline color: anchor to first real vowel in the run.
  const underlineColorMap = new Map<number, string>()
  let runStart: number | null = null
  for (let i = 0; i <= nodes.length; i++) {
    const hit = i < nodes.length && underlineSet.has(i)
    if (hit && runStart === null) runStart = i
    if ((!hit || i === nodes.length) && runStart !== null) {
      let anchorColor: string | undefined
      for (let k = runStart; k < i; k++) {
        const rn = nodes[k]
        if (isVowelNode(rn) && !isMute(rn)) { anchorColor = rn.c; break }
      }
      if (!anchorColor) {
        const rn = nodes[runStart]
        anchorColor = rn.c && rn.c !== '' ? rn.c : COLOR_CONSONANT
      }
      for (let j = runStart; j < i; j++) underlineColorMap.set(j, anchorColor)
      runStart = null
    }
  }

  return nodes.map((n, i) => {
    const isTrueSyl  = trueSyllabic.has(i)
    const isGlide    = diphthongGlide.has(i)
    const isDiph     = diphthongSet.has(i)
    const isUnder    = underlineSet.has(i)
    const mute       = isMute(n) || (isGlide && !isDiph)

    const runAnchor  = underlineColorMap.get(i) ?? COLOR_CONSONANT

    // Final color decision — one place, one pass, explicit priority:
    let color: string
    if (isTrueSyl)      color = COLOR_CONSONANT         // syllabic consonant
    else if (isDiph)    color = isUnder && !mute        // diphthong with underline → solid
                          ? runAnchor
                          : 'transparent'               // gradient handled via gradient flag
    else if (mute)      color = COLOR_SILENT
    else                color = n.c && n.c !== '' ? n.c : COLOR_CONSONANT

    if (isUnder && !isTrueSyl && !mute) color = runAnchor

    return {
      t:              n.t ?? '',
      color,
      underline:      isUnder && !isTrueSyl && !mute,
      gradient:       isDiph && !(isUnder && !mute),
      mute,
      syllabic:       isTrueSyl,
      underlineColor: runAnchor,
      sound:          n.s && n.s !== SYLLABIC_MARKER ? n.s : '',
    }
  })
}

export { DIPHTHONG_START, DIPHTHONG_END }
