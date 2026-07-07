# Graph Report - eic-next  (2026-07-03)

## Corpus Check
- 40 files · ~26,381 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 238 nodes · 371 edges · 17 communities (11 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7a4137f6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_UI & Rendering|UI & Rendering]]
- [[_COMMUNITY_API & Database|API & Database]]
- [[_COMMUNITY_Game  Learning|Game / Learning]]
- [[_COMMUNITY_Package  Dependencies|Package / Dependencies]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Rules & Config|Rules & Config]]
- [[_COMMUNITY_Phonetic Pipeline|Phonetic Pipeline]]
- [[_COMMUNITY_WordRenderer|WordRenderer]]
- [[_COMMUNITY_Layout & Metadata|Layout & Metadata]]
- [[_COMMUNITY_Speech API|Speech API]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_Project Context|Project Context]]
- [[_COMMUNITY_README  Setup|README / Setup]]
- [[_COMMUNITY_Line-by-Line Guide|Line-by-Line Guide]]
- [[_COMMUNITY_Rules Guide|Rules Guide]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `getBestNodes()` - 11 edges
3. `TextToken` - 10 edges
4. `resolveDisplay()` - 9 edges
5. `GET()` - 8 edges
6. `getCache()` - 8 edges
7. `GameWord` - 8 edges
8. `align()` - 7 edges
9. `getLexicon()` - 7 edges
10. `isMute()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `processIpa()` --calls--> `align()`  [EXTRACTED]
  src/lib/engine/index.ts → src/lib/engine/align.ts
- `WordRenderer()` --calls--> `resolveDisplay()`  [EXTRACTED]
  src/components/WordRenderer.tsx → src/lib/engine/display.ts
- `Props` --references--> `RenderNode`  [EXTRACTED]
  src/components/WordRenderer.tsx → src/lib/renderNode.ts
- `GET()` --calls--> `searchPrefix()`  [EXTRACTED]
  src/app/api/search/route.ts → src/lib/db.ts
- `Props` --references--> `TextToken`  [EXTRACTED]
  src/components/ConstellationView.tsx → src/lib/useColorizer.ts

## Import Cycles
- None detected.

## Communities (17 total, 6 thin omitted)

### Community 0 - "UI & Rendering"
Cohesion: 0.07
Nodes (25): ConstellationView, Home(), SAMPLES, TABS, ViewMode, Props, WordNode, audioCache (+17 more)

### Community 1 - "API & Database"
Cohesion: 0.12
Nodes (30): dominantColor(), GameNode, GET(), GRAPHIC_CONS, hasSilentLetters(), hasStress(), isGraphicCons(), shuffle() (+22 more)

### Community 2 - "Game / Learning"
Cohesion: 0.12
Nodes (14): Props, Props, GRAPHIC_CONS, Props, GRAPHIC_CONS, Props, StressGame(), StressGroup (+6 more)

### Community 3 - "Package / Dependencies"
Cohesion: 0.10
Nodes (20): dependencies, better-sqlite3, d3, next, react, react-dom, devDependencies, @types/better-sqlite3 (+12 more)

### Community 4 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 5 - "Rules & Config"
Cohesion: 0.15
Nodes (19): Props, WordRenderer(), RenderNode, applyRegexOverrides(), ColorEntry, DEFAULT_CONFIG, diffConfigs(), generatePrompt() (+11 more)

### Community 6 - "Phonetic Pipeline"
Cohesion: 0.16
Nodes (15): COLOR_MAP, getColor(), GRAPHIC_VOWELS, isGraphicCons(), isGraphicVowel(), isVowelSound(), mapToWord(), Seg (+7 more)

### Community 7 - "WordRenderer"
Cohesion: 0.14
Nodes (21): align(), CONSONANT_SPELLINGS, consumeVowel(), GLIDE_DISPLAYS, GRAPHIC_VOWELS, isGraphicCons(), isGraphicVowel(), isVowelDisplay() (+13 more)

### Community 8 - "Layout & Metadata"
Cohesion: 0.40
Nodes (3): inter, lora, metadata

### Community 16 - "Community 16"
Cohesion: 0.42
Nodes (9): buildDiphthongSet(), buildUnderlineSet(), classifySyllabic(), DisplayNode, GRAPHIC_CONSONANT_LETTERS, isGraphicConsonant(), isMute(), isVowelNode() (+1 more)

## Knowledge Gaps
- **81 isolated node(s):** `GLIDE_DISPLAYS`, `VOWEL_DISPLAY_STARTS`, `CONSONANT_SPELLINGS`, `GRAPHIC_CONSONANT_LETTERS`, `TRANSFORMS` (+76 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `resolveDisplay()` connect `Community 16` to `Rules & Config`, `WordRenderer`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `GLIDE_DISPLAYS`, `VOWEL_DISPLAY_STARTS`, `CONSONANT_SPELLINGS` to the rest of the system?**
  _81 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI & Rendering` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `API & Database` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._
- **Should `Game / Learning` be split into smaller, more focused modules?**
  _Cohesion score 0.12169312169312169 - nodes in this community are weakly interconnected._
- **Should `Package / Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._