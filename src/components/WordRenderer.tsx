import type { RenderNode } from '@/lib/renderNode'
import { COLOR_SILENT, COLOR_CONSONANT, SYLLABIC_MARKER } from '@/lib/renderNode'

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

    // Doar un nucleu vocalic sau semivocalic real poate ancora accentul/sublinierea
    const isStressedVowel = n.u && isVowel(n) && !shouldBeMute(n)
    const isStressedSemi  = n.u && isSemivowel(n) && n.t.length > 0

    if (isStressedVowel || isStressedSemi) {
      result.add(i)
      let j = i + 1
      while (j < nodes.length) {
        const next = nodes[j]
        if ((isVowel(next) && !shouldBeMute(next))
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

export default function WordRenderer({ nodes }: Props) {
  const { trueSyllabic, diphthongGlide } = classifyNodes(nodes)
  const diphthongNodes = buildDiphthongGradients(nodes, diphthongGlide)

  const mono   = isMonosyllabic(nodes)
  const hasSyl = hasTrueSyllabic(trueSyllabic)
  
  // Permitem randarea liniei dacă există stări de accent precalculate valid
  const allow  = !mono && !hasSyl

  const underlined = buildUnderlined(nodes, allow, diphthongGlide)

  return (
    <span className="eic-word">
      {nodes.map((n, i) => {
        if (!n.t) return null

        const isTrueSyl     = trueSyllabic.has(i)
        const isGlide       = diphthongGlide.has(i)
        const isDiphNode    = diphthongNodes.has(i)
        const isUnderlined  = underlined.has(i)
        const mute          = shouldBeMute(n) || (isGlide && !isDiphNode)
        const semi          = isSemivowel(n) && n.t.length > 0 && !isGlide

        let color: string
        let style: React.CSSProperties = {}

        if (isTrueSyl) {
          color = COLOR_CONSONANT
        } else if (isDiphNode) {
          style = {
            background:          `linear-gradient(to right, ${DIPHTHONG_START}, ${DIPHTHONG_END})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip:      'text',
          }
          color = 'transparent'
        } else if (mute) {
          color = COLOR_SILENT
        } else if (semi) {
          color = COLOR_CONSONANT
        } else {
          // Soluția pentru fallback: dacă culoarea din DB este goală sau invalidă, aplicăm negru implicit (consoană)
          color = n.c && n.c !== '' ? n.c : COLOR_CONSONANT
        }

        const classes = [
          'eic-seg',
          isTrueSyl                  ? 'eic-syllabic' : '',
          isUnderlined && !isTrueSyl ? 'eic-stressed' : '',
          mute && !isTrueSyl         ? 'eic-silent'   : '',
          semi                       ? 'eic-semivowel' : '',
        ].filter(Boolean).join(' ')

        return (
          <span
            key={i}
            style={isDiphNode ? style : { color }}
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