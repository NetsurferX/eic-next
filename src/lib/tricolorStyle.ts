// lib/tricolorStyle.ts
// Single source of truth for the /əʊ/ Romanian-tricolor gradient's CSS,
// shared between WordRenderer.tsx (live engine output, driven by
// resolveDisplay()) and the /learn page's hand-curated "ou" lesson column
// (lib/levels.ts's 'ou' lesson, letter əʊ) — both must paint the EXACT
// same gradient, so neither is allowed to re-derive its own copy.
//
// ── Calibration (moved here from WordRenderer.tsx) ─────────────────────
// `background-clip: text` paints its background over the FONT's natural
// "content area" (ascent + descent), not just the visible ink. For a
// lowercase, ascender-less letter (o, a, w, e — the letters that actually
// carry /əʊ/), the ink only occupies the x-height-to-baseline slice of
// that box. A gradient split into 3 even thirds top→bottom would mostly
// land on empty font padding at the top instead of on the ink.
//
// FIX: measured (not guessed) from Inter's own OpenType tables via
// fonttools: unitsPerEm = 2048, ascent = 1984, descent = 494,
// xHeight = 1118. That gives an ink window of [34.947%, 80.065%] of the
// content-area box — a 45.118%-tall slice starting 34.947% down from the
// top. `background-size`/`background-position` "zoom into" exactly that
// slice (plus a small overshoot margin for round letters like o/a, which
// type designers draw slightly past the x-height line), so the gradient's
// own three even thirds map onto the real ink instead of the whole font
// box. This is Inter-specific — re-derive with fonttools if the site font
// ever changes.
import type { CSSProperties } from 'react'
import { TRICOLOR_CSS, TRICOLOR_UNDERLINE_COLOR } from './engine'

export { TRICOLOR_CSS, TRICOLOR_UNDERLINE_COLOR }

export const TRICOLOR_BG_SIZE_Y     = '49.118%'
export const TRICOLOR_BG_POSITION_Y = '64.763%'

// Base ink-window metrics (Inter, see derivation above), BEFORE the
// overshoot-margin padding is added — kept as raw numbers (not the two
// exported constants above) so different call sites can choose their own
// margin. TRICOLOR_BG_SIZE_Y/POSITION_Y above use a 2%-per-side margin,
// tuned against the plain lowercase Latin letters (o, a, w) that carry
// /əʊ/ in the word list, at body text size.
const INK_TOP_PCT    = 34.947
const INK_HEIGHT_PCT = 45.118

// size/position for a given overshoot margin (percent of the box, each
// side) — see TRICOLOR_BG_SIZE_Y's comment for the derivation this
// generalises: size = inkHeight + 2×pad; position = (inkTop − pad) /
// (1 − size/100) × 100.
function inkWindow(padPct: number): { sizeY: string; positionY: string } {
  const sizeY = INK_HEIGHT_PCT + 2 * padPct
  const windowTop = INK_TOP_PCT - padPct
  const positionY = (windowTop / (1 - sizeY / 100)) * 1
  return { sizeY: `${sizeY.toFixed(3)}%`, positionY: `${positionY.toFixed(3)}%` }
}

// The three flat band colours, in the SAME order as TRICOLOR_CSS's stops
// (top→bottom: blue, yellow, red). Anything that can't take a CSS gradient
// value directly (e.g. Cup.tsx's SVG <linearGradient> stops, built from a
// JS array rather than a background shorthand) should read the bands from
// here instead of re-typing the three hex codes.
export const TRICOLOR_BANDS: [string, string, string] = ['#002B7F', '#FCD116', '#CE1126']

// Horizontal variant of TRICOLOR_CSS, three equal vertical stripes
// left→right in the same blue/yellow/red order — matches the actual
// Romanian flag's orientation. Used for UI chrome (buttons, letter-header
// chips) where a rectangular shape reads better as vertical stripes than
// as TRICOLOR_CSS's horizontal bands (which exist for individual glyphs,
// not whole-column chrome).
export const TRICOLOR_CSS_HORIZONTAL =
  `linear-gradient(to right, ${TRICOLOR_BANDS[0]} 0%, ${TRICOLOR_BANDS[0]} 33%, ${TRICOLOR_BANDS[1]} 33%, ${TRICOLOR_BANDS[1]} 66%, ${TRICOLOR_BANDS[2]} 66%, ${TRICOLOR_BANDS[2]} 100%)`

// Inline style for ONE letter of an /əʊ/ grapheme. Per the print reference
// (Vulpea șireată), the tricolor cycles on EACH letter independently
// (e.g. "oa" in "boat" — both o and a get their own full 3-band cycle),
// so callers should apply this per-character, not once across a whole
// multi-letter spelling.
//
// `marginPct` widens the overshoot margin from the default 2% (tuned for
// plain lowercase Latin word letters). Use a larger value for glyphs the
// 2% margin wasn't tuned against — e.g. the column header's italic IPA
// symbols ə/ʊ at a bigger font size, which sit in a slightly different
// vertical window and were getting clipped top/bottom at the tight margin.
export function tricolorLetterStyle(marginPct: number = 2): CSSProperties {
  const { sizeY, positionY } = inkWindow(marginPct)
  return {
    background:           TRICOLOR_CSS,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor:  'transparent',
    backgroundClip:       'text',
    color:                'transparent',
    backgroundSize:       `100% ${sizeY}`,
    backgroundPosition:   `0% ${positionY}`,
    backgroundRepeat:     'no-repeat',
  }
}
