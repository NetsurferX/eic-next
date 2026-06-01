import type { RenderNode } from '@/lib/renderNode'
import { SYLLABIC_MARKER, COLOR_SILENT, COLOR_CONSONANT } from '@/lib/renderNode'

interface Props {
  nodes:   RenderNode[]
  wordStr: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Purely graphic consonant letters — y/w excluded (can be semivowels)

const GRAPHIC_CONSONANTS = new Set('bcdfghjklmnpqrstvxz')


// Semivowel sounds in DB
const SEMIVOWEL_SOUNDS = new Set(['j', 'w', 'ỷ'])

// Diphthong descent colour: #FF3399 (ɔ/pink) → #CC0000 (i/red)
const DIPHTHONG_START = '#FF3399'
const DIPHTHONG_END   = '#CC0000'

// ── Node classification helpers ───────────────────────────────────────────────

function isGraphicConsonant(t: string): boolean {
  return t.length > 0 && [...t.toLowerCase()].every(c => GRAPHIC_CONSONANTS.has(c))
}

// Node has vowel colour but grapheme is purely consonantic → DB error → mute
function shouldBeMute(n: RenderNode): boolean {
  if (n.c === COLOR_SILENT) return true
  if (!n.t || n.t.length === 0) return false
  if (n.c !== COLOR_CONSONANT && isGraphicConsonant(n.t)) return true
  return false
}

// True vowel: has vowel colour, not consonant, not mute, grapheme not pure-consonant
function isVowel(n: RenderNode): boolean {
  if (!n.t || n.t.length === 0) return false
  if (n.c === COLOR_SILENT || n.c === COLOR_CONSONANT) return false
  if (n.x) return false
  if (isGraphicConsonant(n.t)) return false
  return true
}

// Semivowel node: idx=5 (s='j'|'w'|'ỷ')
function isSemivowel(n: RenderNode): boolean {
  return SEMIVOWEL_SOUNDS.has(n.s) && n.c === '#E57373'
}

// ── Syllabic consonant classification ─────────────────────────────────────────
// TRUE syllabic = \u200d AND previous node is schwa (#888888)
// FALSE (diphthong glide) = \u200d after non-schwa vowel → render grey

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
// Descending diphthong: vowel node followed immediately by semivowel (idx=5)
// → gradient from vowel-colour → #CC0000 (red)
// e.g. boy: o(ɔ,#FF3399) + y(\u200d glide after non-schwa) — but y is diphthongGlide
// Actually in DB: royal → o="ɔ"(7) + y=\u200d glide + a="ɪ"(4)
// Pattern for gradient: stressed vowel + diphthongGlide immediately after
// → both nodes get gradient treatment

function buildDiphthongGradients(
  nodes: RenderNode[],
  diphthongGlide: Set<number>
): Set<number> {
  const result = new Set<number>()
  for (let i = 0; i < nodes.length; i++) {
    if (!diphthongGlide.has(i)) continue
    // The preceding vowel node is part of the diphthong
    if (i > 0 && isVowel(nodes[i - 1]) && nodes[i].t.length > 0) {
      result.add(i - 1)  // vowel part
      result.add(i)      // glide part
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
// Rules:
//   - No underline in monosyllabic words
//   - No underline in words with true syllabic consonant (apple, button)
//   - Stressed vowel node anchors the group
//   - Group extends through consecutive vowels and diphthong glides
//   - Semivowels (idx=5 with grapheme) included in group
//   - Never underlines consonants or mute nodes

function buildUnderlined(
  nodes: RenderNode[],
  allow: boolean,
  diphthongGlide: Set<number>
): Set<number> {
  const result = new Set<number>()
  if (!allow) return result

  let i = 0
  while (i < nodes.length) {
    const n = nodes[i]

    // Anchor: stressed vowel or stressed semivowel with grapheme
    const isStressedVowel = n.u && isVowel(n) && !shouldBeMute(n)
    const isStressedSemi  = n.u && isSemivowel(n) && n.t.length > 0

    if (isStressedVowel || isStressedSemi) {
      result.add(i)
      // Extend through consecutive vowels, semivowels, diphthong glides
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

        // ── Colour resolution ──
        let color: string
        let style: React.CSSProperties = {}

        if (isTrueSyl) {
          // Syllabic consonant — black
          color = COLOR_CONSONANT
        } else if (isDiphNode) {
          // Diphthong gradient: roz → roșu via CSS gradient on text
          style = {
            background:        `linear-gradient(to right, ${DIPHTHONG_START}, ${DIPHTHONG_END})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip:    'text',
          }
          color = 'transparent'
        } else if (mute) {
          color = COLOR_SILENT
        } else if (semi) {
          // Semivowel with grapheme — black (consonantal display)
          color = COLOR_CONSONANT
        } else {
          color = n.c
        }

        const classes = [
          'eic-seg',
          isTrueSyl                        ? 'eic-syllabic' : '',
          isUnderlined && !isTrueSyl       ? 'eic-stressed'  : '',
          mute && !isTrueSyl               ? 'eic-silent'    : '',
          semi                             ? 'eic-semivowel' : '',
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
