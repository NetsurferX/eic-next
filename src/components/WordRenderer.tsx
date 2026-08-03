import type { CSSProperties } from 'react'
import type { RenderNode } from '@/lib/renderNode'
import { DEFAULT_CONFIG, applyRegexOverrides } from '@/lib/ruleConfig'
import { resolveDisplay, DIPHTHONG_START, DIPHTHONG_END } from '@/lib/engine'

interface Props {
  nodes:   RenderNode[]
  wordStr: string
}

export default function WordRenderer({ nodes, wordStr }: Props) {
  const renderNodes  = applyRegexOverrides(wordStr, nodes, DEFAULT_CONFIG.regexRules)
  const displayNodes = resolveDisplay(renderNodes)

  return (
    <span className="eic-word">
      {displayNodes.map((d, i) => {
        if (!d.t) return null

        const style: CSSProperties = d.gradient
          ? {
              background:           d.gradientCss ?? `linear-gradient(to right, ${DIPHTHONG_START}, ${DIPHTHONG_END})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor:  'transparent',
              backgroundClip:       'text',
              color:                'transparent',
            }
          : { color: d.color }

        if (d.underline) {
          style.textDecoration          = 'underline'
          style.textDecorationColor     = d.underlineColor
          style.textUnderlineOffset     = '6px'
          style.textDecorationThickness = '2.5px'
        }

        const classes = [
          'eic-seg',
          d.syllabic   ? 'eic-syllabic'    : '',
          d.syllabicVR ? 'eic-syllabic-vr' : '',
          d.underline  ? 'eic-stressed'    : '',
          d.mute       ? 'eic-silent'      : '',
        ].filter(Boolean).join(' ')

        return (
          <span key={i} style={style} className={classes} title={d.sound || undefined}>
            {d.glyph ?? d.t}
            {d.superscript && <sup className="eic-superscript">{d.superscript}</sup>}
          </span>
        )
      })}
    </span>
  )
}
