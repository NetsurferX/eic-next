import type { CSSProperties } from 'react'
import type { RenderNode } from '@/lib/renderNode'
import { DEFAULT_CONFIG, applyRegexOverrides } from '@/lib/ruleConfig'
import { resolveDisplay, DIPHTHONG_START, DIPHTHONG_END, applySyllabicConsonantDetection, applySyllabicRDetection } from '@/lib/engine'
import { TRICOLOR_BG_SIZE_Y, TRICOLOR_BG_POSITION_Y } from '@/lib/tricolorStyle'
import { emitPipelineStage, nodesDiffer } from '@/lib/pipelineTrace'

interface Props {
  nodes:   RenderNode[]
  wordStr: string
  // Opțional, doar pentru /learn și jocul „Vulpea la pescuit” (valori implicite = comportament neschimbat):
  //  flatSimple — vocalele cu gradient 70/30 spre negru (ɒ, ʌ, ɪ, ʊ) se desenează într-o singură culoare plată.
  //  pulseRange — [început, sfârșit) în literele cuvântului: nodurile care ating intervalul se desenează
  //               neutru + clasa `eic-pulse` (animația o definește părintele). Folosit la nivelul 3.
  flatSimple?: boolean
  pulseRange?: [number, number]
}

// ── Tricolor (/əʊ/) vertical-gradient calibration ──────────────────────────
// Moved to lib/tricolorStyle.ts (see there for the full derivation) so the
// /learn page's hand-curated "ou" column can share the exact same
// calibration instead of re-deriving its own copy.

export default function WordRenderer({ nodes, wordStr, flatSimple = false, pulseRange }: Props) {
  // NOTE: split out + traced (each step reports to /debug/graph's live
  // view via pipelineTrace.ts) at Dorel's explicit request. Purely
  // additive — same three calls, same order, same output as before;
  // emitPipelineStage() no-ops outside the browser and never throws.
  const afterSyllabicConsonants = applySyllabicConsonantDetection(nodes)
  emitPipelineStage(wordStr, 'syllabicConsonants', nodesDiffer(nodes, afterSyllabicConsonants))

  const syllabicNodes = applySyllabicRDetection(afterSyllabicConsonants)
  emitPipelineStage(wordStr, 'syllabicR', nodesDiffer(afterSyllabicConsonants, syllabicNodes))

  const renderNodes = applyRegexOverrides(wordStr, syllabicNodes, DEFAULT_CONFIG.regexRules)
  emitPipelineStage(wordStr, 'overrides', nodesDiffer(syllabicNodes, renderNodes))

  const displayNodes = resolveDisplay(renderNodes)
  emitPipelineStage(wordStr, 'resolveDisplay', nodesDiffer(renderNodes, displayNodes))

  // poziția (în litere) la care începe fiecare nod — pentru pulseRange
  let letterOff = 0
  const offsets = displayNodes.map(d => { const o = letterOff; letterOff += (d.t ?? '').length; return o })

  return (
    <span className="eic-word">
      {displayNodes.map((d0, i) => {
        if (!d0.t) return null

        // flatSimple: gradientul 70/30 al vocalelor simple devine culoare plată (prima culoare din gradient)
        const flatHex = flatSimple && d0.gradient && !d0.perLetterGradient && d0.gradientCss
          ? d0.gradientCss.match(/#[0-9A-Fa-f]{6}/)?.[0]
          : undefined
        const inPulse = !!pulseRange && offsets[i] < pulseRange[1] && offsets[i] + d0.t.length > pulseRange[0]
        const d = inPulse
          ? { ...d0, gradient: false, gradientCss: undefined, perLetterGradient: false, color: '#333', underline: false, offglideColor: undefined }
          : flatHex ? { ...d0, gradient: false, gradientCss: undefined, color: flatHex } : d0

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
          inPulse      ? 'eic-pulse'       : '',
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
