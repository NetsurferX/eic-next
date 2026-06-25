# Graph Report - /home/doruciocanu/EiC/eic-next  (2026-06-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 215 nodes · 325 edges · 16 communities (10 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ddc4cf5e`
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

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `getBestNodes()` - 11 edges
3. `TextToken` - 10 edges
4. `GET()` - 8 edges
5. `getCache()` - 8 edges
6. `GameWord` - 8 edges
7. `WordRenderer()` - 7 edges
8. `getLexicon()` - 7 edges
9. `buildUnderlined()` - 5 edges
10. `searchPrefix()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `searchPrefix()`  [EXTRACTED]
  src/app/api/search/route.ts → src/lib/db.ts
- `renderWord()` --calls--> `applyRegexOverrides()`  [EXTRACTED]
  src/app/rules/page.tsx → src/lib/ruleConfig.ts
- `Props` --references--> `TextToken`  [EXTRACTED]
  src/components/ConstellationView.tsx → src/lib/useColorizer.ts
- `Props` --references--> `TextToken`  [EXTRACTED]
  src/components/KaraokeMode.tsx → src/lib/useColorizer.ts
- `Props` --references--> `TextToken`  [EXTRACTED]
  src/components/SoundSpectrum.tsx → src/lib/useColorizer.ts

## Import Cycles
- None detected.

## Communities (16 total, 6 thin omitted)

### Community 0 - "UI & Rendering"
Cohesion: 0.06
Nodes (27): ConstellationView, Home(), SAMPLES, TABS, ViewMode, Props, WordNode, audioCache (+19 more)

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
Cohesion: 0.18
Nodes (15): ColorEntry, DEFAULT_CONFIG, diffConfigs(), generatePrompt(), RegexRule, RegexRuleAction, RuleConfig, RuleDiff (+7 more)

### Community 6 - "Phonetic Pipeline"
Cohesion: 0.16
Nodes (15): COLOR_MAP, getColor(), GRAPHIC_VOWELS, isGraphicCons(), isGraphicVowel(), isVowelSound(), mapToWord(), Seg (+7 more)

### Community 7 - "WordRenderer"
Cohesion: 0.25
Nodes (14): buildDiphthongGradients(), buildUnderlined(), Classification, classifyNodes(), GRAPHIC_CONSONANTS, hasTrueSyllabic(), isGraphicConsonant(), isMonosyllabic() (+6 more)

### Community 8 - "Layout & Metadata"
Cohesion: 0.40
Nodes (3): inter, lora, metadata

## Knowledge Gaps
- **76 isolated node(s):** `config`, `name`, `version`, `private`, `dev` (+71 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `applyRegexOverrides()` connect `WordRenderer` to `Rules & Config`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `config`, `name`, `version` to the rest of the system?**
  _76 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI & Rendering` be split into smaller, more focused modules?**
  _Cohesion score 0.06475485661424607 - nodes in this community are weakly interconnected._
- **Should `API & Database` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._
- **Should `Game / Learning` be split into smaller, more focused modules?**
  _Cohesion score 0.12169312169312169 - nodes in this community are weakly interconnected._
- **Should `Package / Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._