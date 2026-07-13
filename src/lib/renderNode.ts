// Backward-compat shim — re-exports the canonical types/constants from
// engine/. This file used to keep its own separate `RenderNode` interface
// and its own copies of isMute/isVowelNode/isGraphicConsonantString with a
// GRAPHIC_CONSONANTS set that had drifted from engine/display.ts's (missing
// 'w' and 'y'). Those functions were never actually imported anywhere in the
// app — every real consumer (SoundSpectrum, ConstellationView, TerrainView,
// page.tsx, useColorizer.ts, WordRenderer.tsx) only ever used the RenderNode
// type plus the SYLLABIC_MARKER/COLOR_SILENT/COLOR_CONSONANT constants — so
// the divergent copies have been removed rather than kept in sync by hand.
// If you need isMute/isVowelNode/isGraphicConsonant logic, use the ones in
// engine/display.ts (currently module-private; export them from there if an
// outside consumer needs them, rather than re-forking a copy here).
export type { RenderNode } from './engine/types'
export { SYLLABIC_MARKER, COLOR_SILENT, COLOR_CONSONANT } from './engine/display'
