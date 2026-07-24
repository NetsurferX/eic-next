// scripts/accent-test.ts
//
// Debug harness for checking stress/underline placement on a handful of
// words, run standalone via ts-node (not imported by the app).
//
// This used to be a hand-maintained COPY of engine/colorMap.ts +
// engine/segment.ts + engine/align.ts + a simplified underline function —
// four algorithms re-typed from scratch, with a comment warning that if you
// changed the real ones you had to remember to update this file too. It had
// already drifted (missing the CONSONANT_SPELLINGS table, the r-controlled
// vowel rule, syllabic-r handling — see engine/align.ts) and would have
// given misleading output for any word touching those paths.
//
// It now imports the REAL engine modules directly, so it is always testing
// exactly what production runs — nothing to keep in sync, ever.

import { segment } from '../lib/engine/segment'
import { align } from '../lib/engine/align'
import { resolveDisplay } from '../lib/engine/display'

function show(word: string, ipa: string) {
  const segs = segment(ipa)
  const nodes = align(word, segs)
  const display = resolveDisplay(nodes)

  console.log('WORD:', word, 'IPA:', ipa)
  console.table(nodes.map((n, i) => ({ i, t: n.t, s: n.s, c: n.c, u: n.u, x: n.x })))
  console.table(display.map((d, i) => ({
    i, t: d.t, color: d.color, underline: d.underline, mute: d.mute, syllabic: d.syllabic,
  })))
  console.log('---')
  console.log(nodes)
}

const cases: [string, string][] = [
  ['place', 'plˈe‍ɪs'],
]

for (const [w, ipa] of cases) show(w, ipa)
