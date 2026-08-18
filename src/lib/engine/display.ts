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

// §9 — /əʊ/ (display sound 'əw', fused by segment.ts's TRANSFORMS from both
// UK əʊ and US oʊ spellings) gets the Romanian tricolor instead of the flat
// yellow placeholder colors.ts used to fall back to.
// VERIFIED against the reference print book (Vulpea șireată, Aug 2026):
// the bands run TOP→BOTTOM (blue/yellow/red), not left→right, and EACH
// LETTER of a multi-letter spelling (oa in "croak", ow in "slowly") gets
// its own full 3-band cycle independently — not one gradient stretched
// across the whole grapheme. Also confirmed stressed occurrences ("opened",
// "so", "both") keep the tricolor rather than collapsing to solid — unlike
// simpleHex below, no stressed/unstressed split for this sound.
// The per-letter repeat is handled by WordRenderer.tsx (perLetterGradient
// flag on DisplayNode), NOT here — this file only supplies the CSS pattern.
const TRICOLOR_GRADIENT_SOUNDS = new Set(['əw'])
const TRICOLOR_CSS = 'linear-gradient(to bottom, #002B7F 0%, #002B7F 33%, #FCD116 33%, #FCD116 66%, #CE1126 66%, #CE1126 100%)'
function tricolorGradientHex(sound: string): string | null {
  return TRICOLOR_GRADIENT_SOUNDS.has(sound) ? TRICOLOR_CSS : null
}

// The stressed-underline colour under an /əʊ/ letter must NOT use the flat
// COLOR_MAP['əw'] value (#FCD116, yellow — a leftover placeholder from
// before the tricolor gradient existed, still used elsewhere as the flat
// fallback fill for contexts that don't support gradients). Per Dorel's
// request, the underline should read as the RED band of the tricolor, not
// the yellow one — using #CE1126 here (same red as TRICOLOR_CSS's bottom
// stop) keeps it visually tied to the gradient it's underlining.
const TRICOLOR_UNDERLINE_COLOR = '#CE1126'

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
  if (!n.t || n.t.length === 0) return false
  // A genuine glide (y/w/j) that consumed a letter is never "mute" — it's
  // a real semivowel phoneme, not a silent-consonant accident. MUST come
  // before the COLOR_SILENT check below: COLOR_SILENT and COLOR_CONSONANT
  // share the same hex ('#000000'), so a black-coloured 'w' (§5.2: w is
  // negru by design) would otherwise trip that check and get wrongly
  // marked mute — which is what silently blocked "woman"/"lawyer"/"wet"
  // from ever underlining their leading w (§4.2/§5: y/w are graphic
  // consonant letters too, so isGraphicConsonant() alone can't tell them
  // apart from an actually-silent letter either).
  if (isGlideNode(n)) return false
  if (n.glyphOverride) return false
  if (n.c === COLOR_SILENT) return true
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

// ── Leading semivowel (y/w) — B_tehnic §4.2/§5.1/§5.2 ─────────────────────────
// A glide (`j`, `ỷ`, `w`) that sits immediately BEFORE a stressed vowel
// ("yes", "yesterday", "wet", "woman") is a SEPARATE phoneme from that
// vowel — not a fused diphthong. It shares the underline with the stressed
// vowel (§3: "diftong → se subliniază întregul diftong") but keeps its OWN
// colour, both for the letter and for the underline drawn under it (§5.1:
// "își păstrează culoarea roșie ... a literei și a sublinierei de sub y").
// This is distinct from `diphthongGlide` below (SYLLABIC_MARKER-driven),
// which IS one fused phoneme and correctly shares a single colour.
const GLIDE_SOUNDS = new Set(['j', 'ỷ', 'w'])
function isGlideNode(n: RenderNode): boolean {
  return GLIDE_SOUNDS.has(n.s)
}

// ── Glide grapheme → diacritic glyph (B_tehnic Tabelul 5) ─────────────────────
// The /j/ semivowel (display 'j' or 'ỷ') gets a diacritic mark on whichever
// letter carries it, so the phoneme is visible on the grapheme itself, not
// just via colour: y→ỷ (yes, yesterday, you, yellow — the regular case).
// NOTE: 'w' never gets a diacritic in the spec (stays a plain black letter).
// The irregular cases where /j/ falls on a DIFFERENT letter — lawyer (on the
// 'w'), Freudian/rooibos/buoyant/buoyed (on 'u'), fjord (on the 'j' itself)
// — are Tabelul 5's manual exceptions; they're not covered by this general
// table and need a per-word override (see yw-exceptions.ts) to carry their
// own glyph too. That's a follow-up, not handled here.
const J_GLIDE_SOUNDS = new Set(['j', 'ỷ'])
const GRAPHEME_GLYPH: Record<string, string> = { y: 'ỷ', Y: 'Ỷ', j: 'j̉' }

function glideGlyph(n: RenderNode): string | undefined {
  if (!J_GLIDE_SOUNDS.has(n.s)) return undefined
  return GRAPHEME_GLYPH[n.t] ?? undefined
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
// Starts at a stressed vowel node (n.u === true) and extends:
//   - LEFTWARD by exactly one node, if it's a leading glide (y/w) —
//     tracked separately in `leadingGlideSet` so its colour is never
//     overwritten by the run's anchor colour.
//   - RIGHTWARD through consecutive diphthong glide nodes (fused diphthong,
//     shares the anchor colour — unchanged behaviour).
// Monosyllabic words never have n.u === true from the engine, so they
// naturally produce no underline here — no explicit monosyllabic check needed.

function buildUnderlineSet(
  nodes: RenderNode[],
  diphthongGlide: Set<number>
): { underlineSet: Set<number>; leadingGlideSet: Set<number> } {
  const result = new Set<number>()
  const leadingGlideSet = new Set<number>()

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

    // B_tehnic §3/§5.1/§5.2: a leading semivowel (y/w) immediately before
    // the stressed vowel shares the underline but keeps ITS OWN colour —
    // "yes", "wet", "yesterday", "woman" — distinct from a fused diphthong
    // glide (which shares the anchor colour, handled in the extension below).
    const prev = i > 0 ? nodes[i - 1] : null
    if (prev && isGlideNode(prev) && !prev.x && prev.underlineOverride !== 'deny') {
      result.add(i - 1)
      leadingGlideSet.add(i - 1)
    }

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

  return { underlineSet: result, leadingGlideSet }
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
  perLetterGradient?: boolean // when true AND `t` has >1 letter, WordRenderer
                       // must repeat gradientCss on EACH letter independently
                       // (verified against print reference: /əʊ/'s tricolor
                       // bands cycle per letter, e.g. "oa" in croak, not one
                       // gradient stretched across the whole grapheme)
  mute:       boolean  // is silent (black)?
  syllabic:   boolean  // is syllabic consonant (black fill/border)?
  syllabicVR: boolean  // B_tehnic §6.1 forced V-R schwa+consonant (white fill/border)
  superscript: string  // B_tehnic §2.f letterless-phoneme glyph, rendered raised
  glyph?:      string  // B_tehnic Tabelul 5 diacritic form of this grapheme (e.g. 'y' → 'ỷ'), shown instead of `t` when present
  underlineColor: string  // color for the underline decoration
  sound:      string   // tooltip (IPA sound)
}

// ── Main export ───────────────────────────────────────────────────────────────

export function resolveDisplay(rawNodes: RenderNode[]): DisplayNode[] {
  const nodes = applyVoicedFinalS(rawNodes)
  const { trueSyllabic, diphthongGlide } = classifySyllabic(nodes)
  const diphthongSet  = buildDiphthongSet(nodes, diphthongGlide)
  const { underlineSet, leadingGlideSet } = buildUnderlineSet(nodes, diphthongGlide)

  // Build per-run underline color: anchor to first real vowel in the run,
  // SKIPPING leading-glide nodes (y/w before the vowel) — they must never
  // become the anchor, or the whole run would wrongly take the glide's
  // colour instead of the vowel's (B_tehnic §5.1/§5.2).
  //
  // /əʊ/ ('əw') nodes are special-cased to TRICOLOR_UNDERLINE_COLOR instead
  // of their own n.c (which is the flat yellow COLOR_MAP placeholder) —
  // see the constant's comment above.
  const anchorColorOf = (rn: RenderNode): string =>
    rn.s === 'əw' ? TRICOLOR_UNDERLINE_COLOR : rn.c
  const underlineColorMap = new Map<number, string>()
  let runStart: number | null = null
  for (let i = 0; i <= nodes.length; i++) {
    const hit = i < nodes.length && underlineSet.has(i)
    if (hit && runStart === null) runStart = i
    if ((!hit || i === nodes.length) && runStart !== null) {
      let anchorColor: string | undefined
      for (let k = runStart; k < i; k++) {
        if (leadingGlideSet.has(k)) continue
        const rn = nodes[k]
        if (isVowelNode(rn) && !isMute(rn)) { anchorColor = anchorColorOf(rn); break }
      }
      if (!anchorColor) {
        const rn = nodes[runStart]
        anchorColor = rn.c && rn.c !== '' ? anchorColorOf(rn) : COLOR_CONSONANT
      }
      for (let j = runStart; j < i; j++) {
        // Leading glide nodes keep their OWN colour as their underline
        // colour too (§5.1: "și a sublinierei de sub y").
        underlineColorMap.set(j, leadingGlideSet.has(j) ? nodes[j].c : anchorColor)
      }
      runStart = null
    }
  }

  return nodes.map((n, i) => {
    const isTrueSyl   = trueSyllabic.has(i)
    const isGlide     = diphthongGlide.has(i)
    const isDiph      = diphthongSet.has(i)
    const isUnder     = underlineSet.has(i)
    const isLeadGlide = leadingGlideSet.has(i)
    const isSylVR     = !!n.syllabicOverride   // B_tehnic §6.1 — alb cu chenar negru
    const mute        = isMute(n) || (isGlide && !isDiph)
    const simpleHex   = !isDiph && !isTrueSyl && !isSylVR && !mute ? simpleGradientHex(n.s) : null
    const tricolorCss = !isDiph && !isTrueSyl && !isSylVR && !mute ? tricolorGradientHex(n.s) : null

    const runAnchor   = underlineColorMap.get(i) ?? COLOR_CONSONANT
    const ownColor    = n.c && n.c !== '' ? n.c : COLOR_CONSONANT
    const isGlyphOverride = !!n.glyphOverride  


    // Final color decision — one place, one pass, explicit priority:
    let color: string
    let gradientCss: string | undefined
    if (isSylVR)          color = '#FFFFFF'               // forced V-R syllabic (white fill)
    else if (isTrueSyl)   color = COLOR_CONSONANT         // syllabic consonant
    else if (isLeadGlide) color = ownColor                // §5.1/§5.2: leading y/w keeps its own colour, never the run's
    else if (isGlyphOverride) color = ownColor
    else if (isDiph)      color = isUnder && !mute        // diphthong with underline → solid
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
    else if (tricolorCss) {
      // §9 — /əʊ/ always shows the tricolor, stressed or not (unlike the
      // simpleHex vowels, the spec note for this sound never calls for a
      // solid-on-stress exception).
      color = 'transparent'
      gradientCss = tricolorCss
    }
    else if (mute)      color = COLOR_SILENT
    else                color = ownColor

    if (isUnder && !isTrueSyl && !isSylVR && !mute && !isLeadGlide && !isGlyphOverride && !tricolorCss) color = runAnchor

    return {
      t:              n.t ?? '',
      color,
      underline:      isUnder && !isTrueSyl && !isSylVR && !mute,
      gradient:       !isGlyphOverride && ((isDiph && !(isUnder && !mute)) || !!gradientCss),

      gradientCss,
      perLetterGradient: !!tricolorCss,
      mute,
      syllabic:       isTrueSyl,
      syllabicVR:     isSylVR,
      superscript:    n.superscriptOverride ?? '',
      glyph:          n.glyphOverride ?? glideGlyph(n),
      underlineColor: (isLeadGlide || isGlyphOverride) ? ownColor : runAnchor,
      sound:          n.s && n.s !== SYLLABIC_MARKER ? n.s : '',
    }
  })
}

export { DIPHTHONG_START, DIPHTHONG_END }