import type { CSSProperties } from 'react'
import type { RenderNode } from '@/lib/renderNode'
import { DEFAULT_CONFIG, applyRegexOverrides } from '@/lib/ruleConfig'
import { resolveDisplay, DIPHTHONG_START, DIPHTHONG_END } from '@/lib/engine'

interface Props {
  nodes:   RenderNode[]
  wordStr: string
}

// ── Tricolor (/əʊ/) vertical-gradient calibration ──────────────────────────
//
// `background-clip: text` paints its background over the FONT's natural
// "content area" (ascent + descent), not over the CSS `line-height` value —
// that's a spec quirk: line-height only adds/removes leading around the
// content area for line-stacking purposes, it never resizes the box that
// backgrounds/borders actually paint into for a single inline fragment.
// (Confirmed by testing: forcing `line-height:1` / `height:1em` /
// `display:inline-block` in earlier attempts did NOT fix the banding —
// because none of those actually shrink that painting box.)
//
// So for a lowercase, ascender-less letter (o, a, w, e — the letters that
// actually carry /əʊ/), the visible ink only occupies the x-height-to-
// baseline slice of that box, not the whole box. A gradient split into 3
// even thirds top→bottom therefore lands mostly on EMPTY font padding at
// the top (blue → invisible/thin) and only partly on real ink at the
// bottom (red → thin), while the middle third happens to land squarely on
// the ink (yellow → dominant). That matches exactly what was reported.
//
// FIX: measured (not guessed) from Inter's own OpenType tables — pulled
// the actual @fontsource/inter woff2 used by next/font/google and read its
// OS/2/hhea metrics with fonttools:
//   unitsPerEm = 2048, ascent = 1984, descent = 494, xHeight = 1118
// Content-area height = (ascent+descent)/unitsPerEm = 2478/2048 = 1.20996em
// Baseline from top   = ascent/2478                 = 0.80065  (80.065%)
// Ink top (x-height)  = (ascent-xHeight)/2478        = 0.34947  (34.947%)
// → ink occupies [34.947%, 80.065%] of the content-area box, i.e. a
//   45.118%-tall slice starting 34.947% down from the top.
//
// `background-size`/`background-position` let us "zoom into" exactly that
// slice, so the gradient's own 0%→100% (as authored in TRICOLOR_CSS, three
// even thirds) maps 1:1 onto the real ink instead of the whole font box:
//   size Y   = ink height fraction               = 45.118%
//   position = (inkTop) / (1 - inkHeight) × 100%  = 63.680%
// (derivation: background-position-y P satisfies inkTop = (1-size)×P/100)
//
// This is Inter-specific (vertical metrics are constant across all Inter
// weights, since they live in one shared OS/2/hhea table for the whole
// variable font) — if the site's font ever changes, re-derive these two
// numbers the same way (fonttools ttx on the new font's OS/2/hhea tables)
// rather than eyeballing new ones.
//
// OVERSHOOT MARGIN: the raw x-height/baseline window above is a FLAT
// metric line, but round letters (o, a — exactly the letters that carry
// /əʊ/) are drawn by font designers to overshoot slightly past it on both
// sides — a curved letter that stopped exactly at x-height would look
// visually shorter than a flat-topped one, so type designers nudge round
// shapes a bit past the line to compensate. Because `background-repeat` is
// `no-repeat`, any ink outside the exact window gets NO background at all
// (fully transparent, not just miscoloured) — so the un-padded window was
// clipping that overshoot clean off, top and bottom, looking like the
// letter was "cut". Padding the window by 2% of the box on each side
// (a round, conservative allowance — typical overshoot is ~1-3% for most
// text fonts) absorbs that without visibly unbalancing the three bands.
const TRICOLOR_BG_SIZE_Y     = '49.118%'
const TRICOLOR_BG_POSITION_Y = '64.763%'

export default function WordRenderer({ nodes, wordStr }: Props) {
  const renderNodes  = applyRegexOverrides(wordStr, nodes, DEFAULT_CONFIG.regexRules)
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
