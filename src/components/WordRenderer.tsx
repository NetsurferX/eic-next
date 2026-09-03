import type { CSSProperties } from 'react'
import type { RenderNode } from '@/lib/renderNode'
import { DEFAULT_CONFIG, applyRegexOverrides } from '@/lib/ruleConfig'
import { resolveDisplay, DIPHTHONG_START, DIPHTHONG_END, applySyllabicConsonantDetection } from '@/lib/engine'
import { TRICOLOR_BG_SIZE_Y, TRICOLOR_BG_POSITION_Y } from '@/lib/tricolorStyle'

interface Props {
  nodes:   RenderNode[]
  wordStr: string
}

// ── Tricolor (/əʊ/) vertical-gradient calibration ──────────────────────────
// Moved to lib/tricolorStyle.ts (see there for the full derivation) so the
// /learn page's hand-curated "ou" column can share the exact same
// calibration instead of re-deriving its own copy.

export default function WordRenderer({ nodes, wordStr }: Props) {
  const syllabicNodes = applySyllabicConsonantDetection(nodes)
  const renderNodes  = applyRegexOverrides(wordStr, syllabicNodes, DEFAULT_CONFIG.regexRules)
  const displayNodes = resolveDisplay(renderNodes)

  return (
    <span className="eic-word">
      {displayNodes.map((d, i) => {
        if (!d.t) return null

        // Verified against the print reference: /əʊ/'s tricolor cycles on
        // EACH letter independently (e.g. "oa" in croak — both o and a get
        // the full blue/yellow/red band set, not one gradient split across
        // both). Only split when there's more than one letter and no glyph
        // override is swapping in a different single character.
        const splitPerLetter = d.gradient && d.perLetterGradient && !d.glyph && d.t.length > 1

        // /ɔɪ/ off-glide: the diacritic letter ('ỷ'/'ỉ') is its own colour
        // (#CC0000 red) distinct from the rest of the node (#FF3399 magenta
        // on 'o'). Split into two inner spans, same pattern as the gradient
        // per-letter split above — the outer span still carries the shared
        // underline decoration.
        const glyphText = d.glyph ?? d.t
        const splitOffglide = !!d.offglideColor && glyphText.length > 1
        const mainText     = splitOffglide ? glyphText.slice(0, -1) : glyphText
        const offglideText = splitOffglide ? glyphText.slice(-1) : ''

        const style: CSSProperties = d.gradient
          ? {
              background:           d.gradientCss ?? `linear-gradient(to right, ${DIPHTHONG_START}, ${DIPHTHONG_END})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor:  'transparent',
              backgroundClip:       'text',
              color:                'transparent',
              // Only the vertical tricolor gradient needs the ink-window
              // remap (see TRICOLOR_BG_* above) — the horizontal diphthong/
              // simple-vowel gradients run left→right, so the font's extra
              // vertical padding never distorts them; leave those as a
              // plain full-box gradient.
              ...(d.perLetterGradient
                ? {
                    backgroundSize:     `100% ${TRICOLOR_BG_SIZE_Y}`,
                    backgroundPosition: `0% ${TRICOLOR_BG_POSITION_Y}`,
                    backgroundRepeat:   'no-repeat',
                  }
                : {}),
            }
          : { color: d.color }

        const outerStyle: CSSProperties = (splitPerLetter || splitOffglide)
          ? (d.underline
              ? { textDecoration: 'underline', textDecorationColor: d.underlineColor, textUnderlineOffset: '6px', textDecorationThickness: '2.5px' }
              : {})
          : style

        if (!splitPerLetter && !splitOffglide && d.underline) {
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
              : splitOffglide
              ? (
                  <>
                    <span style={{ color: d.color }}>{mainText}</span>
                    <span style={{ color: d.offglideColor }}>{offglideText}</span>
                  </>
                )
              : (d.glyph ?? d.t)}
            {d.superscript && <sup className="eic-superscript">{d.superscript}</sup>}
          </span>
        )
      })}
    </span>
  )
}
