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
export function tricolorLetterStyle(): CSSProperties {
  return {
    background:           TRICOLOR_CSS,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor:  'transparent',
    backgroundClip:       'text',
    color:                'transparent',
    backgroundSize:       `100% ${TRICOLOR_BG_SIZE_Y}`,
    backgroundPosition:   `0% ${TRICOLOR_BG_POSITION_Y}`,
    backgroundRepeat:     'no-repeat',
  }
}
