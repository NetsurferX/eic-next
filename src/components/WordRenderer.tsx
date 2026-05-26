// WordRenderer — aplică regulile vizuale peste RenderNode[] din DB
// Reguli implementate:
//   1. Consoană cu fonem → neagră; fără fonem → gri
//   2. Vocale grupate → un segment colorat
//   3. Consoană silabică (s=SYLLABIC_MARKER) → negru cu chenar alb
//   4. Subliniere → întreaga secvență vocalică din silaba accentuată
//   5. Monosilabice și bisilabice cu consoană silabică → fără subliniere

import type { RenderNode } from '@/lib/renderNode'
import { SYLLABIC_MARKER, COLOR_SILENT } from '@/lib/renderNode'

interface Props {
  nodes:     RenderNode[]
  wordStr:   string   // cuvântul original — pentru detectare monosilabice
}

// Detectează dacă un cuvânt e monosilabic (nu are silabă accentuată în DB)
function isMonosyllabic(nodes: RenderNode[]): boolean {
  return !nodes.some(n => n.u === true)
}

// Detectează dacă cuvântul are consoană silabică → nu subliniezi
function hasSyllabicConsonant(nodes: RenderNode[]): boolean {
  return nodes.some(n => n.s === SYLLABIC_MARKER && n.t.length > 0)
}

// Grupează nodurile consecutive vocale accentuate pentru subliniere
function buildUnderlineGroups(nodes: RenderNode[], allowUnderline: boolean): Set<number> {
  const underlined = new Set<number>()
  if (!allowUnderline) return underlined

  let i = 0
  while (i < nodes.length) {
    if (nodes[i].u && !nodes[i].x && nodes[i].t.length > 0) {
      // Start grup vocal accentuat
      const start = i
      let end = i
      // Extinde grupul cu vocale consecutive (accentuate sau nu, dar fără consoane)
      let j = i + 1
      while (j < nodes.length && !nodes[j].x && nodes[j].t.length > 0) {
        end = j
        j++
      }
      for (let k = start; k <= end; k++) underlined.add(k)
      i = end + 1
    } else {
      i++
    }
  }
  return underlined
}

export default function WordRenderer({ nodes }: Props) {
  const mono      = isMonosyllabic(nodes)
  const syllabic  = hasSyllabicConsonant(nodes)
  const allowUnderline = !mono && !syllabic
  const underlined = buildUnderlineGroups(nodes, allowUnderline)

  return (
    <span className="eic-word">
      {nodes.map((n, i) => {
        if (!n.t) return null  // grafem gol — fonem fără literă, ignorăm vizual

        const isSyllabic = n.s === SYLLABIC_MARKER
        const isUnderlined = underlined.has(i)
        const isMute = n.c === COLOR_SILENT

        const style: React.CSSProperties = {
          color: isSyllabic ? '#000000' : n.c,
        }

        const classes = [
          'eic-seg',
          isSyllabic  ? 'eic-syllabic'  : '',
          isUnderlined ? 'eic-stressed'  : '',
          isMute && !isSyllabic ? 'eic-silent' : '',
        ].filter(Boolean).join(' ')

        return (
          <span
            key={i}
            style={style}
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
