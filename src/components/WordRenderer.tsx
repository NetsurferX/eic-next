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
              // The editor sets line-height:2.1 on its container. background-
              // clip:text paints across the FULL line box, not just the glyph's
              // ink — on x-height letters (o, w — no ascender) most of that
              // extra 1.1× height is empty space above the letter, so a top
              // band (e.g. blue in the əʊ tricolor) can land entirely outside
              // the visible glyph and never show. Tightening to line-height:1
              // here makes the box hug the glyph instead of the paragraph's
              // leading. Verified missing otherwise on 'o'/'w' — see EiC notes.
              lineHeight:           1,
            }
          : { color: d.color }

        // Verified against the print reference: /əʊ/'s tricolor cycles on
        // EACH letter independently (e.g. "oa" in croak — both o and a get
        // the full blue/yellow/red band set, not one gradient split across
        // both). Only split when there's more than one letter and no glyph
        // override is swapping in a different single character.
        const splitPerLetter = d.gradient && d.perLetterGradient && !d.glyph && d.t.length > 1

        const outerStyle: CSSProperties = splitPerLetter
          ? (d.underline
              ? { textDecoration: 'underline', textDecorationColor: d.underlineColor, textUnderlineOffset: '6px', textDecorationThickness: '2.5px' }
              : {})
          : style

        if (!splitPerLetter && d.underline) {
          outerStyle.textDecoration          = 'underline'
          outerStyle.textDecorationColor     = d.underlineColor
          outerStyle.textUnderlineOffset     = '6px'
          outerStyle.textDecorationThickness = '2.5px'
        }

        const classes = [
          'eic-seg',
          d.syllabic   ? 'eic-syllabic'    : '',
          d.syllabicVR ? 'eic-syllabic-vr' : '',
          d.underline  ? 'eic-stressed'    : '',
          d.mute       ? 'eic-silent'      : '',
        ].filter(Boolean).join(' ')

        return (
          <span key={i} style={outerStyle} className={classes} title={d.sound || undefined}>
            {splitPerLetter
              ? [...d.t].map((ch, ci) => <span key={ci} style={style}>{ch}</span>)
              : (d.glyph ?? d.t)}
            {d.superscript && <sup className="eic-superscript">{d.superscript}</sup>}
          </span>
        )
      })}
    </span>
  )
}
