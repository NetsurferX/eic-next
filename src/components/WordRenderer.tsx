import type { CSSProperties } from 'react'
import type { RenderNode } from '@/lib/renderNode'
import { COLOR_SILENT, COLOR_CONSONANT, SYLLABIC_MARKER } from '@/lib/renderNode'
import { DEFAULT_CONFIG, applyRegexOverrides } from '@/lib/ruleConfig'

interface Props {
  nodes:   RenderNode[]
  wordStr: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const GRAPHIC_CONSONANTS = new Set('bcdfghjklmnpqrstvxz')
const SEMIVOWEL_SOUNDS = new Set(['j', 'w', 'ỷ'])

const DIPHTHONG_START = '#FF3399'
const DIPHTHONG_END   = '#CC0000'

// ── Node classification helpers ───────────────────────────────────────────────

function isGraphicConsonant(t: string): boolean {
  return t.length > 0 && [...t.toLowerCase()].every(c => GRAPHIC_CONSONANTS.has(c))
}

function shouldBeMute(n: RenderNode): boolean {
  if (n.c === COLOR_SILENT) return true
  if (!n.t || n.t.length === 0) return false
  
  // Modificare critică: O consoană este mută doar dacă are o culoare explicită de vocală (nu goală, nu neagră)
  const hasActiveVowelColor = n.c !== COLOR_CONSONANT && n.c !== '' && n.c !== undefined
  if (hasActiveVowelColor && isGraphicConsonant(n.t)) return true
  
  return false
}

function isVowel(n: RenderNode): boolean {
  if (!n.t || n.t.length === 0) return false
  if (shouldBeMute(n)) return false
  if (n.c === COLOR_CONSONANT || n.x || n.c === '') return false
  return true
}

function isSemivowel(n: RenderNode): boolean {
  return SEMIVOWEL_SOUNDS.has(n.s) && n.c === '#E57373'
}

// ── Syllabic consonant classification ─────────────────────────────────────────

interface Classification {
  trueSyllabic: Set<number>
  diphthongGlide: Set<number>
}

function classifyNodes(nodes: RenderNode[]): Classification {
  const SCHWA = '#888888'
  const trueSyllabic  = new Set<number>()
  const diphthongGlide = new Set<number>()

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].s !== SYLLABIC_MARKER) continue
    const prev = i > 0 ? nodes[i - 1] : null
    if (prev && prev.c === SCHWA) trueSyllabic.add(i)
    else diphthongGlide.add(i)
  }
  return { trueSyllabic, diphthongGlide }
}

// ── Diphthong gradient detection ──────────────────────────────────────────────

function buildDiphthongGradients(
  nodes: RenderNode[],
  diphthongGlide: Set<number>
): Set<number> {
  const result = new Set<number>()
  for (let i = 0; i < nodes.length; i++) {
    if (!diphthongGlide.has(i)) continue
    if (i > 0 && isVowel(nodes[i - 1]) && nodes[i].t.length > 0) {
      result.add(i - 1)
      result.add(i)
    }
  }
  return result
}

// ── Monosyllabic / syllabic consonant detection ───────────────────────────────

function isMonosyllabic(nodes: RenderNode[]): boolean {
  return !nodes.some(n => n.u === true)
}

function hasTrueSyllabic(trueSyllabic: Set<number>): boolean {
  return trueSyllabic.size > 0
}

// ── Underline: stressed vowel + consecutive vowel run ─────────────────────────

function buildUnderlined(
  nodes: RenderNode[],
  allow: boolean,
  diphthongGlide: Set<number>
): Set<number> {
  const result = new Set<number>()
  
  // Heuristic Override: Dacă baza de date nu trimite accente (cuvinte scurte/monosilabice),
  // dar vrem să corectăm randarea vizuală unde o consoană a primit accent din greșeală.
  let i = 0
  while (i < nodes.length) {
    const n = nodes[i]
    const denied = n.underlineOverride === 'deny'
    const forced = n.underlineOverride === 'force'

    // Doar un nucleu vocalic sau semivocalic real poate ancora accentul/sublinierea —
    // cu excepția unui rule regex 'force', care poate ancora pe orice grafem.
    const isStressedVowel = !denied && n.u && isVowel(n) && !shouldBeMute(n)

    // Anchor only on a real vowel (or a forced override). Semivowel anchors
    // can cause the underline to pick the semivowel colour instead of the
    // vowel colour; avoid that to match the standardised rule set.
    if (forced || isStressedVowel) {
      if (!denied) result.add(i)
      let j = i + 1
      while (j < nodes.length) {
        const next = nodes[j]
        if (next.underlineOverride === 'deny') break
        if (next.underlineOverride === 'force'
          || (isVowel(next) && !shouldBeMute(next))
          || (isSemivowel(next) && next.t.length > 0)
          || diphthongGlide.has(j)) {
          result.add(j)
          j++
        } else {
          break
        }
      }
      i = j
    } else {
      i++
    }
  }
  return result
}

// ── Render ────────────────────────────────────────────────────────────────────

export default function WordRenderer({ nodes, wordStr }: Props) {
  const renderNodes = applyRegexOverrides(wordStr, nodes, DEFAULT_CONFIG.regexRules)

  const { trueSyllabic, diphthongGlide } = classifyNodes(renderNodes)
  const diphthongNodes = buildDiphthongGradients(renderNodes, diphthongGlide)

  const mono   = isMonosyllabic(renderNodes)
  const hasSyl = hasTrueSyllabic(trueSyllabic)
  
  // Permitem randarea liniei dacă există stări de accent precalculate valid
  const allow  = !mono && !hasSyl

  const underlined = buildUnderlined(renderNodes, allow, diphthongGlide)

  // Build a per-node underline color map: each contiguous underline run
  // is anchored to its first underlined node's visual colour.
  const underlineColor = new Map<number, string>()
  let runStart: number | null = null
  for (let i = 0; i <= renderNodes.length; i++) {
    const hit = i < renderNodes.length && underlined.has(i)
    if (hit && runStart === null) runStart = i
    if ((!hit || i === renderNodes.length) && runStart !== null) {
      const anchor = runStart
      // Prefer the first real vowel in the run as the colour anchor. Fall back
      // to the run start's colour if no vowel found.
      let anchorColor: string | undefined = undefined
      for (let k = runStart; k < i; k++) {
        const rn = renderNodes[k]
        if (isVowel(rn) && !shouldBeMute(rn)) { anchorColor = rn.c; break }
      }
      if (!anchorColor) anchorColor = renderNodes[anchor].c && renderNodes[anchor].c !== '' ? renderNodes[anchor].c : COLOR_CONSONANT
      for (let j = runStart; j < i; j++) underlineColor.set(j, anchorColor)
      runStart = null
    }
  }

  return (
    <span className="eic-word">
      {renderNodes.map((n, i) => {
        if (!n.t) return null

        const isTrueSyl     = trueSyllabic.has(i)
        const isGlide       = diphthongGlide.has(i)
        const isDiphNode    = diphthongNodes.has(i)
        const isUnderlined  = underlined.has(i)
        const mute          = shouldBeMute(n) || (isGlide && !isDiphNode)
        const semi          = isSemivowel(n) && n.t.length > 0 && !isGlide

        let color: string
        let style: CSSProperties = {}

        // anchor colour for this node's underline run (if any)
        const runAnchor = underlineColor.get(i)

        if (isTrueSyl) {
          color = COLOR_CONSONANT
        } else if (isDiphNode) {
          // If this diphthong node is underlined, prefer a solid anchor colour
          // for both the glyph and the underline so the run looks unified.
          if (isUnderlined && !isTrueSyl && !mute) {
            color = runAnchor ?? (n.c && n.c !== '' ? n.c : COLOR_CONSONANT)
          } else {
            style = {
              background:          `linear-gradient(to right, ${DIPHTHONG_START}, ${DIPHTHONG_END})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor:  'transparent',
              backgroundClip:      'text',
            }
            color = 'transparent'
          }
        } else if (mute) {
          color = COLOR_SILENT
        } else if (semi) {
          color = COLOR_CONSONANT
        } else {
          // Fallback: if DB colour is empty/invalid, use consonant colour
          color = n.c && n.c !== '' ? n.c : COLOR_CONSONANT
        }

        // If underlined, set a unified colour for both text and the underline
        if (isUnderlined && !isTrueSyl && !mute) {
          const finalCol = runAnchor ?? color
          style = { ...style, textDecoration: 'underline', textDecorationColor: finalCol, textUnderlineOffset: '6px', textDecorationThickness: '2.5px' }
          color = finalCol
        }

        const classes = [
          'eic-seg',
          isTrueSyl                  ? 'eic-syllabic' : '',
          isUnderlined && !isTrueSyl ? 'eic-stressed' : '',
          mute && !isTrueSyl         ? 'eic-silent'   : '',
          semi                       ? 'eic-semivowel' : '',
        ].filter(Boolean).join(' ')

        const spanStyle = { ...style, color }

        return (
          <span
            key={i}
            style={spanStyle}
            className={classes}
            title={n.s && n.s !== SYLLABIC_MARKER ? n.s : undefined}
          >
            {n.t}
          </span>
        )
      })}
    </span>
  )
}