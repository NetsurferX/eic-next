// engine/display.ts
// The ONLY place that decides what a node looks like on screen.
// WordRenderer calls resolveDisplay() and just renders the result —
// no classification logic should live in the component at all.
//
// Input:  RenderNode[] after applyRegexOverrides() has run
// Output: DisplayNode[] — one entry per node, all display decisions made

import type { RenderNode } from './types'
import { COLOR_MAP, COLOR_SILENT, COLOR_CONSONANT } from '../rules/colors'

export { COLOR_SILENT, COLOR_CONSONANT } // re-exported for renderNode.ts's existing import path
export const SYLLABIC_MARKER = '\u200d'   // must match renderNode.ts

const DIPHTHONG_START = '#FF3399'
const DIPHTHONG_END   = '#CC0000'

const SCHWA = '#888888'

// B_tehnic §9 Tabel 2 — four short/lax simple vowels get a 70%→30% gradient
// into black instead of a flat fill: /ʌ/, /ɪ/, /ɒ,ɔ/ (LOT/CLOTH-THOUGHT
// merger, §5.3 — both symbols may appear depending on the lexicon source),
// /ʊ/. Their long/tense counterparts (ɑ, i, o "door/force", u) stay solid —
// they're already distinct display keys post-TRANSFORMS, so no ambiguity.
const SIMPLE_GRADIENT_SOUNDS = new Set(['ʌ', 'ɪ', 'ɒ', 'ɔ', 'ʊ'])
function simpleGradientHex(sound: string): string | null {
  if (!SIMPLE_GRADIENT_SOUNDS.has(sound)) return null
  return COLOR_MAP[sound] ?? null
}
// 70/30 split, not a smooth 0→100 blend: solid colour through 70% of the
// grapheme's width, then a quick fade to black in the last 30%.
function simpleGradientCss(hex: string): string {
  return `linear-gradient(to right, ${hex} 0%, ${hex} 70%, #000000 100%)`
}

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

// ── Word-final 's' → ṡ (ULS rule) ───────────────────────────────────────────
// Deterministic SPELLING rule (not IPA-driven) — ported 1:1 from the
// reference implementation. Only ever touches the word's last character.
//   1. -kes (cakes, bikes)               → unchanged (silent e hides the
//      voiceless consonant from check #2)
//   2. voiceless consonant directly       → unchanged (stops, cats, books,
//      before 's' (p, t, k, f)             laughs... except digraph spellings,
//                                           see note below)
//   3. -ths: C+ths (months) / V+ths       → unchanged (/θs/)
//      (maths) stay plain; VV+ths
//      (mouths, oaths) get the dot        → dotted (/ðz/)
//   4. everything else (vowels, -es,
//      voiced consonants: dogs, flies,
//      buses)                             → dotted
const ULS_VOICELESS_BEFORE = new Set(['p', 't', 'k', 'f'])
const ULS_VOWELS = new Set([...'aeiouy'])

function applyEicSSuffixRule(word: string): string {
  if (!word || word.length < 2) return word
  const lastChar = word[word.length - 1]
  if (lastChar !== 's' && lastChar !== 'S') return word

  const lower = word.toLowerCase()
  const sDot = lastChar === 'S' ? 'Ṡ' : 'ṡ'

  // 1. Graphic protection for -kes (cakes, bikes)
  if (lower.endsWith('kes')) return word

  // 2. Direct voiceless consonant right before 's' (p, t, k, f)
  if (ULS_VOICELESS_BEFORE.has(lower[lower.length - 2])) return word

  // 3. Deterministic -ths rule
  if (lower.endsWith('ths')) {
    const stem = lower.slice(0, -3)
    if (!stem) return word
    if (!ULS_VOWELS.has(stem[stem.length - 1])) return word // C+ths (months)
    if (stem.length >= 2 && ULS_VOWELS.has(stem[stem.length - 2])) {
      return word.slice(0, -1) + sDot                        // VV+ths (mouths)
    }
    return word                                              // V+ths (maths)
  }

  // 4. Default — vowels, -es, voiced consonants (dogs, flies, buses)
  return word.slice(0, -1) + sDot
}

// Applies applyEicSSuffixRule() at the word level, then writes the result
// back onto whichever RenderNode holds the word's final character (grapheme
// nodes can be more than one letter long, e.g. mute-e cases) — only that
// node's last character is ever replaced.
function applyVoicedFinalS(nodes: RenderNode[]): RenderNode[] {
  const word = nodes.map(n => n.t ?? '').join('')
  const result = applyEicSSuffixRule(word)
  if (result === word) return nodes

  let lastIdx = -1
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (nodes[i].t && nodes[i].t.length > 0) { lastIdx = i; break }
  }
  if (lastIdx < 0) return nodes

  const out = nodes.map(n => ({ ...n }))
  const t = out[lastIdx].t
  out[lastIdx] = { ...out[lastIdx], t: t.slice(0, -1) + result[result.length - 1] }
  return out
}

// ── Public output type ────────────────────────────────────────────────────────

export interface DisplayNode {
  t:          string   // letters to render
  color:      string   // final text color
  underline:  boolean  // draw underline?
  gradient:   boolean  // draw a gradient fill (diphthong OR simple-vowel)?
  gradientCss?: string // explicit gradient background when set (simple-vowel
                       // 70/30 split); falls back to the DIPHTHONG_START/END
                       // 2-stop blend in WordRenderer when absent
  mute:       boolean  // is silent (black)?
  syllabic:   boolean  // is syllabic consonant (black fill/border)?
  syllabicVR: boolean  // B_tehnic §6.1 forced V-R schwa+consonant (white fill/border)
  superscript: string  // B_tehnic §2.f letterless-phoneme glyph, rendered raised
  underlineColor: string  // color for the underline decoration
  sound:      string   // tooltip (IPA sound)
}

// ── Main export ───────────────────────────────────────────────────────────────

export function resolveDisplay(rawNodes: RenderNode[]): DisplayNode[] {
  const nodes = applyVoicedFinalS(rawNodes)
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
    const isSylVR    = !!n.syllabicOverride   // B_tehnic §6.1 — alb cu chenar negru
    const mute       = isMute(n) || (isGlide && !isDiph)
    const simpleHex  = !isDiph && !isTrueSyl && !isSylVR && !mute ? simpleGradientHex(n.s) : null

    const runAnchor  = underlineColorMap.get(i) ?? COLOR_CONSONANT

    // Final color decision — one place, one pass, explicit priority:
    let color: string
    let gradientCss: string | undefined
    if (isSylVR)        color = '#FFFFFF'               // forced V-R syllabic (white fill)
    else if (isTrueSyl) color = COLOR_CONSONANT         // syllabic consonant
    else if (isDiph)    color = isUnder && !mute        // diphthong with underline → solid
                          ? runAnchor
                          : 'transparent'               // gradient handled via gradient flag
    else if (simpleHex) {
      // B_tehnic §9 — stressed occurrence renders solid (matches the
      // existing diphthong stressed-underline behaviour); unstressed
      // occurrences get the 70/30 gradient into black.
      if (isUnder && !mute) {
        color = runAnchor
      } else {
        color = 'transparent'
        gradientCss = simpleGradientCss(simpleHex)
      }
    }
    else if (mute)      color = COLOR_SILENT
    else                color = n.c && n.c !== '' ? n.c : COLOR_CONSONANT

    if (isUnder && !isTrueSyl && !isSylVR && !mute) color = runAnchor

    return {
      t:              n.t ?? '',
      color,
      underline:      isUnder && !isTrueSyl && !isSylVR && !mute,
      gradient:       (isDiph && !(isUnder && !mute)) || !!gradientCss,
      gradientCss,
      mute,
      syllabic:       isTrueSyl,
      syllabicVR:     isSylVR,
      superscript:    n.superscriptOverride ?? '',
      underlineColor: runAnchor,
      sound:          n.s && n.s !== SYLLABIC_MARKER ? n.s : '',
    }
  })
}

export { DIPHTHONG_START, DIPHTHONG_END }