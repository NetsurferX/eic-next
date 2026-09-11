// src/lib/moduleGraphData.ts
//
// Static snapshot of the real import graph across the EiC engine pipeline
// (src/lib/**) plus its three consumer entry points. Extracted by hand from
// the actual `import`/`export … from` statements in the repo — not inferred,
// not simulated. If the pipeline's file structure changes, this snapshot
// needs to be re-extracted; it is intentionally NOT auto-generated at build
// time to keep /debug/graph fast and dependency-free at runtime.
//
// Used by ModuleGraph.tsx to render a force-directed dependency graph
// (à la Erdős collaboration graph: node size ~ number of connections).

export type ModuleGroup =
  | 'consumer'      // UI / API entry points that kick off the pipeline
  | 'data'          // db.ts — lexicon + cache boundary
  | 'orchestrator'  // engine/index.ts — the public API barrel
  | 'engine-core'   // individual engine/* pipeline stages
  | 'rule-data'     // colors.ts, phonologicalRules.ts — the phonology tables
  | 'overrides'     // per-word regex override system
  | 'support'       // renderNode, ruleConfig, tricolorStyle, useColorizer

export interface ModuleNode {
  id: string
  label: string
  group: ModuleGroup
  note?: string
}

export interface ModuleEdge {
  source: string
  target: string
}

export const MODULE_NODES: ModuleNode[] = [
  // Consumers
  { id: 'app/api/words/route.ts', label: 'api/words/route.ts', group: 'consumer', note: 'HTTP entry point' },
  { id: 'components/WordRenderer.tsx', label: 'WordRenderer.tsx', group: 'consumer', note: 'game rendering entry point' },
  { id: 'components/EicCulise.tsx', label: 'EicCulise.tsx', group: 'consumer', note: '/culise debug entry point' },

  // Data boundary
  { id: 'lib/db.ts', label: 'db.ts', group: 'data', note: 'lexicon.db + cache.db boundary' },

  // Support layer
  { id: 'lib/ruleConfig.ts', label: 'ruleConfig.ts', group: 'support' },
  { id: 'lib/renderNode.ts', label: 'renderNode.ts', group: 'support' },
  { id: 'lib/tricolorStyle.ts', label: 'tricolorStyle.ts', group: 'support', note: '/əʊ/ gradient calibration' },
  { id: 'lib/useColorizer.ts', label: 'useColorizer.ts', group: 'support' },

  // Orchestrator
  { id: 'lib/engine/index.ts', label: 'engine/index.ts', group: 'orchestrator', note: 'public API barrel' },

  // Engine core stages
  { id: 'lib/engine/segment.ts', label: 'engine/segment.ts', group: 'engine-core' },
  { id: 'lib/engine/align.ts', label: 'engine/align.ts', group: 'engine-core', note: 'diacritics' },
  { id: 'lib/engine/display.ts', label: 'engine/display.ts', group: 'engine-core', note: 'resolveDisplay' },
  { id: 'lib/engine/score.ts', label: 'engine/score.ts', group: 'engine-core' },
  { id: 'lib/engine/syllabicConsonants.ts', label: 'engine/syllabicConsonants.ts', group: 'engine-core' },
  { id: 'lib/engine/syllabicR.ts', label: 'engine/syllabicR.ts', group: 'engine-core' },
  { id: 'lib/engine/suffixVoicing.ts', label: 'engine/suffixVoicing.ts', group: 'engine-core' },
  { id: 'lib/engine/graphemeToPhoneme.ts', label: 'engine/graphemeToPhoneme.ts', group: 'engine-core', note: 'guessIpa' },
  { id: 'lib/engine/types.ts', label: 'engine/types.ts', group: 'engine-core', note: 'RenderNode, Seg, WordProps' },

  // Rule data
  { id: 'lib/phonologicalRules.ts', label: 'phonologicalRules.ts', group: 'rule-data', note: 'Rules 7, 8, 12 active' },
  { id: 'lib/rules/colors.ts', label: 'rules/colors.ts', group: 'rule-data', note: 'canonical phoneme→hex map' },

  // Overrides system
  { id: 'lib/rules/overrides/index.ts', label: 'overrides/index.ts', group: 'overrides', note: 'REGEX_RULES barrel' },
  { id: 'lib/rules/overrides/apply.ts', label: 'overrides/apply.ts', group: 'overrides', note: 'applyRegexOverrides' },
  { id: 'lib/rules/overrides/misc.ts', label: 'overrides/misc.ts', group: 'overrides' },
  { id: 'lib/rules/overrides/mute-e.ts', label: 'overrides/mute-e.ts', group: 'overrides' },
  { id: 'lib/rules/overrides/vr-lexical-sets.ts', label: 'overrides/vr-lexical-sets.ts', group: 'overrides', note: 'colorOverride flag' },
  { id: 'lib/rules/overrides/yw-exceptions.ts', label: 'overrides/yw-exceptions.ts', group: 'overrides' },
  { id: 'lib/rules/overrides/types.ts', label: 'overrides/types.ts', group: 'overrides', note: 'RegexRule type' },
]

export const MODULE_EDGES: ModuleEdge[] = [
  // Consumers → pipeline
  { source: 'app/api/words/route.ts', target: 'lib/db.ts' },
  { source: 'components/WordRenderer.tsx', target: 'lib/ruleConfig.ts' },
  { source: 'components/WordRenderer.tsx', target: 'lib/engine/index.ts' },
  { source: 'components/WordRenderer.tsx', target: 'lib/tricolorStyle.ts' },
  { source: 'components/WordRenderer.tsx', target: 'lib/renderNode.ts' },
  { source: 'components/EicCulise.tsx', target: 'lib/ruleConfig.ts' },
  { source: 'components/EicCulise.tsx', target: 'lib/engine/index.ts' },
  { source: 'components/EicCulise.tsx', target: 'lib/renderNode.ts' },

  // Data boundary
  { source: 'lib/db.ts', target: 'lib/engine/index.ts' },
  { source: 'lib/db.ts', target: 'lib/engine/suffixVoicing.ts' },
  { source: 'lib/db.ts', target: 'lib/rules/colors.ts' },

  // Support layer
  { source: 'lib/ruleConfig.ts', target: 'lib/rules/colors.ts' },
  { source: 'lib/ruleConfig.ts', target: 'lib/rules/overrides/index.ts' },
  { source: 'lib/tricolorStyle.ts', target: 'lib/engine/index.ts' },
  { source: 'lib/useColorizer.ts', target: 'lib/renderNode.ts' },

  // Orchestrator re-exports (engine/index.ts is the barrel for all of these)
  { source: 'lib/engine/index.ts', target: 'lib/engine/segment.ts' },
  { source: 'lib/engine/index.ts', target: 'lib/engine/align.ts' },
  { source: 'lib/engine/index.ts', target: 'lib/engine/display.ts' },
  { source: 'lib/engine/index.ts', target: 'lib/engine/score.ts' },
  { source: 'lib/engine/index.ts', target: 'lib/engine/syllabicConsonants.ts' },
  { source: 'lib/engine/index.ts', target: 'lib/engine/syllabicR.ts' },
  { source: 'lib/engine/index.ts', target: 'lib/engine/graphemeToPhoneme.ts' },
  { source: 'lib/engine/index.ts', target: 'lib/phonologicalRules.ts' },
  { source: 'lib/engine/index.ts', target: 'lib/rules/colors.ts' },
  { source: 'lib/engine/index.ts', target: 'lib/engine/types.ts' },

  // Engine core internals
  { source: 'lib/engine/segment.ts', target: 'lib/engine/types.ts' },
  { source: 'lib/engine/segment.ts', target: 'lib/rules/colors.ts' },
  { source: 'lib/engine/align.ts', target: 'lib/engine/types.ts' },
  { source: 'lib/engine/align.ts', target: 'lib/rules/colors.ts' },
  { source: 'lib/engine/display.ts', target: 'lib/engine/types.ts' },
  { source: 'lib/engine/display.ts', target: 'lib/rules/colors.ts' },
  { source: 'lib/engine/score.ts', target: 'lib/engine/types.ts' },
  { source: 'lib/engine/score.ts', target: 'lib/rules/colors.ts' },
  { source: 'lib/engine/score.ts', target: 'lib/engine/align.ts' },
  { source: 'lib/engine/syllabicConsonants.ts', target: 'lib/engine/types.ts' },
  { source: 'lib/engine/syllabicR.ts', target: 'lib/engine/types.ts' },

  // Overrides system
  { source: 'lib/rules/overrides/index.ts', target: 'lib/rules/overrides/vr-lexical-sets.ts' },
  { source: 'lib/rules/overrides/index.ts', target: 'lib/rules/overrides/yw-exceptions.ts' },
  { source: 'lib/rules/overrides/index.ts', target: 'lib/rules/overrides/mute-e.ts' },
  { source: 'lib/rules/overrides/index.ts', target: 'lib/rules/overrides/misc.ts' },
  { source: 'lib/rules/overrides/index.ts', target: 'lib/rules/overrides/apply.ts' },
  { source: 'lib/rules/overrides/misc.ts', target: 'lib/rules/overrides/types.ts' },
  { source: 'lib/rules/overrides/mute-e.ts', target: 'lib/rules/overrides/types.ts' },
  { source: 'lib/rules/overrides/vr-lexical-sets.ts', target: 'lib/rules/overrides/types.ts' },
  { source: 'lib/rules/overrides/yw-exceptions.ts', target: 'lib/rules/overrides/types.ts' },
  { source: 'lib/rules/overrides/apply.ts', target: 'lib/rules/overrides/types.ts' },
]
