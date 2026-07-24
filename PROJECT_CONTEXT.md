# Project Analysis for AI Tool

## Project Metadata
```json
{
  "name": "english-in-colours",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "better-sqlite3": "^9.4.3",
    "d3": "^7.9.0",
    "next": "^16.0.0",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.8",
    "@types/d3": "^7.4.3",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5"
  }
}
```

## Project Statistics
- Total TypeScript/TSX files: 24
- Total lines of code: 3485
- Number of components: 10
- Number of API routes: 4

## Directory Structure
```
```

## Documentation Files

### README.md
```markdown
# English in Colours — Next.js

## Setup

```bash
# 1. Instalează dependențe
npm install

# 2. Pune words.db în folderul data/
mkdir -p data
cp /path/to/words.db data/words.db

# 3. Rulează în dev
npm run dev
# → http://localhost:3000

# 4. Build pentru producție
npm run build
npm start
```

## Structură

```
src/
  app/
    page.tsx           ← pagina principală
    layout.tsx         ← root layout (fonturi)
    globals.css        ← design system
    learn/page.tsx     ← modul de învățare
    rules/page.tsx     ← editor de reguli (colours/regex bridge + tester)
    api/
      words/route.ts   ← POST /api/words — batch lookup
      search/route.ts  ← GET /api/search?q= — prefix search
      speak/route.ts   ← TTS
      game/route.ts    ← joc — sesiune/scor
  components/
    WordRenderer.tsx   ← colorează un cuvânt (folosește lib/engine + lib/rules)
    StatsBar.tsx        ← legend + statistici
    ConstellationView.tsx / TerrainView.tsx / SoundSpectrum.tsx ← vizualizări
    game/               ← componente joc (ColourGame, GameProgress, IntroCard)
  lib/
    engine/            ← ALGORITMUL de bază: segment.ts (IPA→foneme), align.ts
                          (foneme→grafeme), display.ts (decizii de afișare
                          finale: culoare/underline/mute), score.ts, index.ts
                          (singurul punct de import public)
    rules/             ← DATELE editabile — vezi rules/README.md pentru harta
                          "unde schimb X". colors.ts (sunet→culoare, sursă
                          unică), overrides/ (excepții per-cuvânt, regex)
    ruleConfig.ts       ← punte între lib/rules/ și editorul /rules (diff +
                          prompt generator)
    db.ts               ← better-sqlite3 singleton
    useColorizer.ts     ← React hook principal
    gameTypes.ts        ← tipuri + date derivate din lib/rules/colors.ts
  scripts/
    accent-test.ts      ← harness de debug standalone (rulează motorul real)
data/
  words.db              ← baza de date (tu o pui aici)
```

Pentru "unde schimb o regulă de culoare / cuvânt / underline" — vezi
[`src/lib/rules/README.md`](src/lib/rules/README.md).

## Deploy pe Railway

```bash
# 1. Creează proiect nou pe railway.app
# 2. Conectează repo GitHub
# 3. Adaugă persistent volume montat la /app/data
# 4. Uploadează words.db pe volume
# 5. Railway detectează Next.js automat și deployează
```
```

### WORDRENDERER_RULES_GUIDE.md
```markdown
# WordRenderer.tsx - Complete Rules Guide for Beginners

## Project Context: "English in Colours"

This is a language-learning app that displays English words with **color-coded phonetics** to help learners understand pronunciation. `WordRenderer.tsx` is the component that takes linguistic data (phonetic breakdowns) and visually displays them with correct colors and styling.

---

## What is a RenderNode?

Before understanding the rules, you need to know what data we're working with:

```typescript
interface RenderNode {
  t: string   // "grapheme" — the actual letters (e.g., "ai" in "rain")
  s: string   // "sound" — IPA phonetic symbol (e.g., "eɪ")
  c: string   // "color" — hex color code (e.g., "#EE5B00")
  u: boolean  // "stressed" — is this syllable stressed? (e.g., true for RAin, false for the)
  x: boolean  // "isConsonant" — is this a consonant sound?
}
```

**Example:** The word "**rainbow**" might break down as:
```
[
  { t: "r",   s: "ɹ",  c: "#000000", u: false, x: true },   // consonant
  { t: "ai",  s: "eɪ", c: "#EE5B00", u: true,  x: false },  // stressed vowel
  { t: "n",   s: "n",  c: "#000000", u: false, x: true },   // consonant
  { t: "b",   s: "b",  c: "#000000", u: false, x: true },   // consonant
  { t: "ow",  s: "oʊ", c: "#FF3399", u: false, x: false },  // unstressed vowel
]
```

---

## Color Reference

The app uses these standard IPA vowel colors:

| Color | Sound | Example | Hex Code |
|-------|-------|---------|----------|
| 🟢 Green | ɑ / ʌ | car, cup | #008E40 |
| 🔵 Blue | æ | cat, hat | #00b0f0 |
| 🟣 Purple | u / ʊ | moon, book | #7030A0 |
| ⚫ Grey | ə (schwa) | about, the | #888888 |
| 🔴 Red | i / ɪ | see, sit | #CC0000 |
| 🟣 Light Purple | j / w (semivowels) | yes, we | #E57373 |
| 🟠 Orange | e / ɛ | bed, say | #EE5B00 |
| 🩷 Pink | ɒ / ɔ | hot, or | #FF3399 |
| ⚪ Silent | (no sound) | — | #000000 |
| ⬛ Black | consonants | — | #000000 |

---

## The Rules - Step by Step

### ⚙️ RULE 1: What counts as a "Graphic Consonant"?

**Definition:** Letters that are ONLY consonants, no exceptions.

```typescript
const GRAPHIC_CONSONANTS = new Set('bcdfghjklmnpqrstvxz')
```

**Beginner explanation:** 
- `b, c, d, f, g, h, j, k, l, m, n, p, q, r, s, t, v, x, z` are pure consonants
- `y, w` are **excluded** because they can act like vowels (semivowels)
- Example: "b" = consonant, "y" in "yes" = semivowel, "y" in "my" = vowel

**Why it matters:** We need to identify when the database made a mistake.

---

### 🔇 RULE 2: Is a Node "Mute" (Silent)?

A node should be silent if:

1. **The color is grey** (`#000000`) — database explicitly says "no sound"
2. **The color is NOT grey AND NOT black, BUT the grapheme is pure consonant** — **database error!**

```typescript
function shouldBeMute(n: RenderNode): boolean {
  if (n.c === COLOR_SILENT) return true                    // Rule 2a
  if (!n.t || n.t.length === 0) return false               // No text = not mute
  if (n.c !== COLOR_CONSONANT && isGraphicConsonant(n.t)) return true  // Rule 2b - ERROR CORRECTION
  return false
}
```

**Example:**
- ✅ `{ t: "e", s: "ə", c: "#888888" }` — mute (silent vowel schwa)
- ✅ `{ t: "gh", s: "", c: "#000000" }` — mute (grey color)
- ⚠️ `{ t: "b", s: "ə", c: "#FF3399" }` — mute (WRONG DATA: consonant letters with a vowel color!)

---

### 🎤 RULE 3: Is a Node a "True Vowel"?

A node is a real vowel if:

```

### WORDRENDERER_LINE_BY_LINE_GUIDE.md
```markdown
# WordRenderer.tsx - Precise Line-by-Line Modification Guide

This guide shows **exactly which lines** to modify for each rule in WordRenderer.tsx.

---

## Rule 1: Graphic Consonants

**What it does:** Defines what counts as "pure" consonant letters.

**Where to modify:**
- **Line 12:** The constant that defines which letters are consonants

```typescript
// LINE 12 - MODIFY HERE
const GRAPHIC_CONSONANTS = new Set('bcdfghjklmnpqrstvxz')
                                     ↑
                           Add/remove letters here
```

**Examples:**
```typescript
// Current: no 'y' or 'w'
const GRAPHIC_CONSONANTS = new Set('bcdfghjklmnpqrstvxz')

// To include 'y': 
const GRAPHIC_CONSONANTS = new Set('bcdfghjklmnpqrstuwyxz')

// To exclude 'r':
const GRAPHIC_CONSONANTS = new Set('bcdfghjklmnpqstuvxz')
```

**Function that uses it:**
- **Lines 24-26:** `isGraphicConsonant()` function uses this constant
- **Line 43:** `isVowel()` function calls `isGraphicConsonant()`

---

## Rule 2: Mute/Silent Nodes

**What it does:** Determines when a node should display as silent/grey.

**Where to modify:**

| Line | Modification |
|------|--------------|
| **Line 28-34** | `shouldBeMute()` function — the core logic |
| **Line 30** | Check for grey color (`COLOR_SILENT`) |
| **Line 31** | Check for empty text |
| **Line 32** | Check for database error (consonant letters with vowel color) |

```typescript
// LINES 28-34 - CORE MUTE LOGIC
function shouldBeMute(n: RenderNode): boolean {
  if (n.c === COLOR_SILENT) return true           // LINE 30 - Grey color check
  if (!n.t || n.t.length === 0) return false      // LINE 31 - Empty text check
  if (n.c !== COLOR_CONSONANT && isGraphicConsonant(n.t)) return true  // LINE 32
  //                                              ↑
  //                    DATABASE ERROR DETECTION - modify condition here
  return false
}
```

**To change mute behavior:**
- **Line 30:** Change `COLOR_SILENT` to different color
- **Line 32:** Modify the condition `n.c !== COLOR_CONSONANT` (e.g., exclude certain colors)
- **Line 32:** Modify `isGraphicConsonant(n.t)` to use different consonant check

**Functions that use it:**
- **Line 40:** `isVowel()` calls `shouldBeMute()`
- **Line 139:** `buildUnderlined()` calls `shouldBeMute()`
- **Line 172:** Rendering logic checks `shouldBeMute()`

---

## Rule 3: Is a True Vowel?

**What it does:** Identifies real vowel sounds.

**Where to modify:**

```typescript
// LINES 36-42 - VOWEL DETECTION LOGIC
function isVowel(n: RenderNode): boolean {
  if (!n.t || n.t.length === 0) return false           // LINE 37 - No text = not vowel
  if (n.c === COLOR_SILENT || n.c === COLOR_CONSONANT) return false  // LINE 38 - Grey/black = not vowel
  if (n.x) return false                                // LINE 39 - x flag = consonant
  if (isGraphicConsonant(n.t)) return false            // LINE 40 - Pure consonant letters = not vowel
  return true                                          // LINE 41
}
```

**Line-by-line modifications:**
| Line | Change | Impact |
|------|--------|--------|
| Line 37 | Text length threshold | Minimum text required to be a vowel |
| Line 38 | Add/remove colors | Which colors count as vowel colors |
| Line 39 | Change `n.x` condition | Whether to ignore x flag |
| Line 40 | Change consonant check | What counts as consonant-only letters |

```

## Type Definitions & Interfaces

### src/lib/gameTypes.ts
```typescript
export interface GameNode {
  t: string
  s: string
  c: string
  u: boolean
  x: boolean
}

export interface GameWord {
  word:          string
  nodes:         GameNode[]
  dominantColor: string
}

export type GameLevel = 1 | 2 | 3

export interface GameState {
  level:       GameLevel
  words:       GameWord[]
  current:     number    // index into words
  score:       number
  streak:      number
  maxStreak:   number
  xp:          number
  roundsDone:  number
  totalRounds: number
  phase:       'intro' | 'playing' | 'feedback' | 'done'
  lastCorrect: boolean | null
}

export const COLOR_LABELS: Record<string, { label: string; example: string }> = {
  '#008E40': { label: 'ɑ / ʌ',  example: 'car, cup' },
  '#00b0f0': { label: 'æ',      example: 'cat, hat' },
  '#7030A0': { label: 'u / ʊ',  example: 'moon, book' },
  '#888888': { label: 'ə',      example: 'about, the' },
  '#CC0000': { label: 'i / ɪ',  example: 'see, sit' },
  '#E57373': { label: 'j / w',  example: 'yes, we' },
  '#EE5B00': { label: 'e / ɛ',  example: 'bed, say' },
  '#FF3399': { label: 'ɒ / ɔ',  example: 'hot, or' },
}

export const LEVEL_INFO = {
  1: { name: 'Colours',      desc: 'What sound does this colour represent?',      icon: '🎨' },
  2: { name: 'Silent Hunt',  desc: 'Tap the letters that make no sound.',         icon: '🔇' },
  3: { name: 'Stress Mark',  desc: 'Tap the stressed vowel group.',               icon: '💡' },
}
```

### src/lib/renderNode.ts
```typescript
// Schema exactă din words.db RenderJson
export interface RenderNode {
  t: string   // grafemul (literele din cuvânt, poate fi '' pentru foneme fără grafem)
  s: string   // fonemul display
  c: string   // culoare hex
  u: boolean  // isStressed — silabă accentuată
  x: boolean  // isConsonant
}

// Zero-width joiner — marker pentru consoana silabică în DB
export const SYLLABIC_MARKER = '\u200d'

export const COLOR_SILENT    = '#000000'
export const COLOR_CONSONANT = '#000000'

export function isSyllabicConsonant(node: RenderNode): boolean {
  return node.s === SYLLABIC_MARKER
}

export function isMute(node: RenderNode): boolean {
  return node.c === COLOR_SILENT
}

export function isVowelNode(node: RenderNode): boolean {
  return !node.x && node.c !== COLOR_SILENT && node.t.length > 0
}
```

### src/lib/ruleConfig.ts
```typescript
// ruleConfig.ts
// Single source of truth for all EiC rendering rules.
// Editable in /rules page — changes generate a structured prompt.

export interface ColorEntry {
  sounds:   string[]   // IPA display forms that map to this colour
  hex:      string
  label:    string
  category: 'vowel' | 'semivowel' | 'consonant' | 'silent'
}

export interface UnderlineRules {
  monosyllabic:      boolean  // underline in monosyllabic words?
  withSyllabicCons:  boolean  // underline when true syllabic consonant present?
  extendThroughSemi: boolean  // extend underline group through semivowels?
  extendThroughGlide:boolean  // extend through diphthong glides?
}

export interface SilentRules {
  // Grapheme patterns always treated as silent regardless of DB
  alwaysSilentPatterns: string[]
  // If a grapheme is purely graphic-consonant but DB gives vowel colour → mute
  graphicConsonantOverride: boolean
}

export interface VowelChars {
  vowels:     string[]  // IPA chars classified as vowels
  semivowels: string[]  // IPA chars classified as semivowels
  consonants: string[]  // IPA chars classified as consonants (for reference)
}

export interface RuleConfig {
  colors:     ColorEntry[]
  underline:  UnderlineRules
  silent:     SilentRules
  vowelChars: VowelChars
}

// ── DEFAULT CONFIG — matches current implementation ───────────────────────────

export const DEFAULT_CONFIG: RuleConfig = {
  colors: [
    { sounds: ['æ'],              hex: '#00b0f0', label: 'æ — cat',      category: 'vowel' },
    { sounds: ['ʌ','a','ɑ'],      hex: '#008E40', label: 'ɑ/ʌ — car/cup', category: 'vowel' },
    { sounds: ['ə','ɜ','ər','er'],hex: '#888888', label: 'ə — schwa',    category: 'vowel' },
    { sounds: ['e','ɛ','eɪ','eỷ'],hex: '#EE5B00', label: 'e/ɛ — bed',    category: 'vowel' },
    { sounds: ['ɪ','i','iː'],     hex: '#CC0000', label: 'i/ɪ — see/sit', category: 'vowel' },
    { sounds: ['ɒ','ɔ','o','oʊ','əw'], hex: '#FF3399', label: 'ɒ/ɔ — hot/or', category: 'vowel' },
    { sounds: ['ʊ','u','uː'],     hex: '#7030A0', label: 'u/ʊ — moon/book', category: 'vowel' },
    { sounds: ['aɪ','aỷ','aw','aʊ','oɪ','oỷ','ɔɪ'], hex: '#4472C4', label: 'aɪ/aʊ — my/now', category: 'vowel' },
    { sounds: ['j','w','ỷ'],      hex: '#E57373', label: 'j/w — yes/we', category: 'semivowel' },
  ],

  underline: {
    monosyllabic:       false,
    withSyllabicCons:   false,
    extendThroughSemi:  true,
    extendThroughGlide: true,
  },

  silent: {
    alwaysSilentPatterns:      ['kn','wr','mb','gh','ght','gn'],
    graphicConsonantOverride:  true,
  },

  vowelChars: {
    vowels:     ['a','e','i','o','u','æ','ɑ','ɒ','ɔ','ə','ɜ','ɝ','ɚ','ɛ','ɪ','ʊ','ʌ','ø','œ'],
    semivowels: ['j','w','ỷ','y'],
    consonants: ['b','d','f','g','h','k','l','m','n','p','r','s','t','v','x','z',
                 'θ','ð','ʃ','ʒ','tʃ','dʒ','ŋ','ɹ'],
  },
}

// ── Diff generator ────────────────────────────────────────────────────────────

export interface RuleDiff {
  section: string
  field:   string
  old:     string
  new:     string
}

export function diffConfigs(base: RuleConfig, modified: RuleConfig): RuleDiff[] {
  const diffs: RuleDiff[] = []

  // Colors
  base.colors.forEach((entry, i) => {
    const mod = modified.colors[i]
    if (!mod) return
    if (entry.hex !== mod.hex)
      diffs.push({ section: 'ColorMap', field: entry.label, old: entry.hex, new: mod.hex })
    if (entry.category !== mod.category)
      diffs.push({ section: 'ColorMap', field: `${entry.label} category`, old: entry.category, new: mod.category })
    const oldSounds = entry.sounds.join(', ')
    const newSounds = mod.sounds.join(', ')
    if (oldSounds !== newSounds)
      diffs.push({ section: 'ColorMap', field: `${entry.label} sounds`, old: oldSounds, new: newSounds })
  })

  // Underline rules
  const ul = modified.underline
  const ulb = base.underline
  if (ulb.monosyllabic !== ul.monosyllabic)
    diffs.push({ section: 'Underline', field: 'monosyllabic', old: String(ulb.monosyllabic), new: String(ul.monosyllabic) })
  if (ulb.withSyllabicCons !== ul.withSyllabicCons)
    diffs.push({ section: 'Underline', field: 'withSyllabicConsonant', old: String(ulb.withSyllabicCons), new: String(ul.withSyllabicCons) })
  if (ulb.extendThroughSemi !== ul.extendThroughSemi)
    diffs.push({ section: 'Underline', field: 'extendThroughSemivowels', old: String(ulb.extendThroughSemi), new: String(ul.extendThroughSemi) })
  if (ulb.extendThroughGlide !== ul.extendThroughGlide)
    diffs.push({ section: 'Underline', field: 'extendThroughDiphthongGlide', old: String(ulb.extendThroughGlide), new: String(ul.extendThroughGlide) })

  // Silent rules
  const oldPat = base.silent.alwaysSilentPatterns.join(', ')
  const newPat = modified.silent.alwaysSilentPatterns.join(', ')
  if (oldPat !== newPat)
    diffs.push({ section: 'Silent', field: 'alwaysSilentPatterns', old: oldPat, new: newPat })
  if (base.silent.graphicConsonantOverride !== modified.silent.graphicConsonantOverride)
    diffs.push({ section: 'Silent', field: 'graphicConsonantOverride', old: String(base.silent.graphicConsonantOverride), new: String(modified.silent.graphicConsonantOverride) })

  // Vowel chars
  if (base.vowelChars.vowels.join(',') !== modified.vowelChars.vowels.join(','))
    diffs.push({ section: 'VowelChars', field: 'vowels', old: base.vowelChars.vowels.join(', '), new: modified.vowelChars.vowels.join(', ') })
  if (base.vowelChars.semivowels.join(',') !== modified.vowelChars.semivowels.join(','))
    diffs.push({ section: 'VowelChars', field: 'semivowels', old: base.vowelChars.semivowels.join(', '), new: modified.vowelChars.semivowels.join(', ') })

  return diffs
}

// ── Prompt generator ──────────────────────────────────────────────────────────

export interface TestCase {
  word:    string
  current: string  // what it shows now
  desired: string  // what it should show
  note:    string
}

export function generatePrompt(
  diffs: RuleDiff[],
  testCases: TestCase[],
  config: RuleConfig
): string {
  const date = new Date().toISOString().split('T')[0]
  const lines: string[] = []

  lines.push(`## EiC Rule Change Request — ${date}`)
  lines.push('')

  if (diffs.length > 0) {
    lines.push('### Rule Changes')
    const bySection: Record<string, RuleDiff[]> = {}
    for (const d of diffs) {
      if (!bySection[d.section]) bySection[d.section] = []
      bySection[d.section].push(d)
    }
    for (const [section, ds] of Object.entries(bySection)) {
      lines.push(`\n**${section}:**`)
      for (const d of ds)
        lines.push(`- ${d.field}: \`${d.old}\` → \`${d.new}\``)
    }
    lines.push('')
  }

  if (testCases.length > 0) {
    lines.push('### Test Cases')
    for (const tc of testCases) {
      lines.push(`\n**"${tc.word}"**`)
      if (tc.current) lines.push(`- Current render: ${tc.current}`)
      if (tc.desired) lines.push(`- Should render:  ${tc.desired}`)
      if (tc.note)    lines.push(`- Note: ${tc.note}`)
    }
    lines.push('')
  }

  lines.push('### Full Config Snapshot')
  lines.push('```json')
  lines.push(JSON.stringify(config, null, 2))
  lines.push('```')

  return lines.join('\n')
}
```

## Core Library Files

## Main Components Overview

### ConstellationView.tsx (first 50 lines)
```typescript
'use client'

import { useEffect, useRef, useMemo } from 'react'
import type { TextToken } from '@/lib/useColorizer'
import { COLOR_SILENT, COLOR_CONSONANT } from '@/lib/renderNode'

interface Props {
  tokens: TextToken[]
}

interface WordNode {
  word:   string
  color:  string
  freq:   number  // how many times it appears
  size:   number  // radius
  x?:     number
  y?:     number
  vx?:    number
  vy?:    number
  fx?:    number | null
  fy?:    number | null
}

export default function ConstellationView({ tokens }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  const nodes = useMemo<WordNode[]>(() => {
    const freq  = new Map<string, { color: string; count: number }>()

    for (const tok of tokens) {
      if (!tok.isWord || !tok.nodes) continue
      const lower = tok.raw.toLowerCase()

      // Dominant vowel colour
      const colorCounts = new Map<string, number>()
      for (const n of tok.nodes) {
        if (n.c !== COLOR_SILENT && n.c !== COLOR_CONSONANT && n.t.length > 0)
          colorCounts.set(n.c, (colorCounts.get(n.c) ?? 0) + 1)
      }
      const dominant = [...colorCounts.entries()].sort((a, b) => b[1] - a[1])[0]
      const color = dominant?.[0] ?? '#888888'

      const existing = freq.get(lower)
      if (existing) existing.count++
      else freq.set(lower, { color, count: 1 })
    }

    return [...freq.entries()].map(([word, { color, count }]) => ({
      word,
      color,
```

### KaraokeMode.tsx (first 50 lines)
```typescript
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import WordRenderer from './WordRenderer'
import type { TextToken } from '@/lib/useColorizer'

interface Props {
  tokens: TextToken[]
}

const SPEEDS = { slow: 2000, normal: 1000, fast: 500 }

// Audio cache — avoid re-fetching the same word
const audioCache = new Map<string, string>()  // word → object URL

async function speak(word: string) {
  if (typeof window === 'undefined') return
  try {
    let url = audioCache.get(word)
    if (!url) {
      const res = await fetch('/api/speak', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ word }),
      })
      if (!res.ok) return
      const blob = await res.blob()
      url = URL.createObjectURL(blob)
      audioCache.set(word, url)
    }
    const audio = new Audio(url)
    audio.play().catch(() => {})
  } catch (e) {
    console.warn('speak error:', e)
  }
}

export default function KaraokeMode({ tokens }: Props) {
  const wordTokens = tokens.filter(t => t.isWord && t.nodes)
  const [current, setCurrent]         = useState(-1)
  const [playing, setPlaying]         = useState(false)
  const [speed, setSpeed]             = useState<keyof typeof SPEEDS>('normal')
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const speedRef   = useRef(speed)
  speedRef.current = speed

  const stop = useCallback(() => {
    setPlaying(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])
```

### SoundSpectrum.tsx (first 50 lines)
```typescript
'use client'

import { useEffect, useRef } from 'react'
import type { TextToken } from '@/lib/useColorizer'
import { COLOR_SILENT, COLOR_CONSONANT } from '@/lib/renderNode'

interface Props {
  tokens: TextToken[]
}

const VOWEL_COLORS = [
  '#008E40', '#00b0f0', '#7030A0', '#888888',
  '#CC0000', '#E57373', '#EE5B00', '#FF3399',
]

const LABELS: Record<string, string> = {
  '#008E40': 'ɑ/ʌ', '#00b0f0': 'æ',   '#7030A0': 'u/ʊ',
  '#888888': 'ə',   '#CC0000': 'i/ɪ',  '#E57373': 'j/w',
  '#EE5B00': 'e/ɛ', '#FF3399': 'ɒ/ɔ',
}

export default function SoundSpectrum({ tokens }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef   = useRef<number>(0)
  const barsRef   = useRef<number[]>(VOWEL_COLORS.map(() => 0))
  const targetRef = useRef<number[]>(VOWEL_COLORS.map(() => 0))

  // Compute target bar heights from tokens
  useEffect(() => {
    const counts = new Map<string, number>()
    let total = 0

    for (const tok of tokens) {
      if (!tok.nodes) continue
      for (const n of tok.nodes) {
        if (n.c === COLOR_SILENT || n.c === COLOR_CONSONANT || !n.t) continue
        counts.set(n.c, (counts.get(n.c) ?? 0) + n.t.length)
        total += n.t.length
      }
    }

    targetRef.current = VOWEL_COLORS.map(c =>
      total > 0 ? ((counts.get(c) ?? 0) / total) : 0
    )
  }, [tokens])

  // Animation loop — smooth lerp toward targets
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
```

### StatsBar.tsx (first 50 lines)
```typescript
import type { Stats } from '@/lib/useColorizer'

const LEGEND = [
  { color: '#00b0f0', label: 'æ — cat' },
  { color: '#008E40', label: 'ɑ/ʌ — car, cup' },
  { color: '#888888', label: 'ə — schwa' },
  { color: '#EE5B00', label: 'e/ɛ — bed' },
  { color: '#CC0000', label: 'i/ɪ — see, sit' },
  { color: '#FF3399', label: 'ɒ/ɔ — hot, or' },
  { color: '#7030A0', label: 'u/ʊ — moon, book' },
  { color: '#4472C4', label: 'aɪ/aʊ — my, now' },
  { color: '#E57373', label: 'j/w — yes, we' },
]

interface Props {
  stats: Stats
  usedColors: Set<string>
}

export default function StatsBar({ stats, usedColors }: Props) {
  const total = stats.distribution.reduce((s, d) => s + d.count, 0)

  return (
    <div className="eic-stats-wrap">

      {/* Legend — only colours present in current text */}
      {usedColors.size > 0 && (
        <div className="eic-legend" role="list">
          {LEGEND.filter(e => usedColors.has(e.color)).map(e => (
            <span key={e.color} className="eic-leg-item" role="listitem">
              <span className="eic-leg-dot" style={{ background: e.color }} />
              {e.label}
            </span>
          ))}
        </div>
      )}

      {/* Stats cards */}
      {stats.wordCount > 0 && (
        <div className="eic-stats">

          <div className="eic-stat">
            <span className="eic-stat-label">Words</span>
            <span className="eic-stat-value">{stats.wordCount}</span>
            <span className="eic-stat-sub">{stats.knownCount} known</span>
          </div>

          <div className="eic-stat">
            <span className="eic-stat-label">Top sound</span>
            <span className="eic-stat-value eic-stat-sound" style={{ color: stats.topColor }}>
```

### TerrainView.tsx (first 50 lines)
```typescript
'use client'

import { useMemo, useRef, useState } from 'react'
import type { TextToken } from '@/lib/useColorizer'
import { COLOR_SILENT, COLOR_CONSONANT } from '@/lib/renderNode'

interface Props {
  tokens: TextToken[]
}

interface WordPeak {
  word:       string
  height:     number  // 0-1 normalised complexity
  color:      string  // dominant vowel colour
  silent:     number  // count of silent letters
  stressed:   boolean
}

function wordComplexity(tok: TextToken): WordPeak {
  if (!tok.nodes) return { word: tok.raw, height: 0.1, color: '#000000', silent: 0, stressed: false }

  const nodes    = tok.nodes
  const total    = nodes.filter(n => n.t.length > 0).length
  const silent   = nodes.filter(n => n.c === COLOR_SILENT && n.t.length > 0).length
  const stressed = nodes.some(n => n.u)
  const vowels   = nodes.filter(n => n.c !== COLOR_SILENT && n.c !== COLOR_CONSONANT && n.t.length > 0)

  // Dominant colour
  const colorCounts = new Map<string, number>()
  for (const n of vowels) colorCounts.set(n.c, (colorCounts.get(n.c) ?? 0) + n.t.length)
  const dominant = [...colorCounts.entries()].sort((a, b) => b[1] - a[1])[0]

  // Complexity = ratio of silent + unusual mappings
  const silentRatio  = total > 0 ? silent / total : 0
  const lengthFactor = Math.min(tok.raw.length / 12, 1)
  const vowelFactor  = total > 0 ? 1 - (vowels.length / total) : 0.5

  const height = Math.max(0.08, Math.min(1,
    silentRatio * 0.5 + lengthFactor * 0.3 + vowelFactor * 0.2
  ))

  return {
    word:     tok.raw,
    height,
    color:    dominant?.[0] ?? '#888888',
    silent,
    stressed,
  }
}

```

### WordRenderer.tsx (first 50 lines)
```typescript
import type { RenderNode } from '@/lib/renderNode'
import { SYLLABIC_MARKER, COLOR_SILENT, COLOR_CONSONANT } from '@/lib/renderNode'

interface Props {
  nodes:   RenderNode[]
  wordStr: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Purely graphic consonant letters — y/w excluded (can be semivowels)

const GRAPHIC_CONSONANTS = new Set('bcdfghjklmnpqrstvxz')


// Semivowel sounds in DB
const SEMIVOWEL_SOUNDS = new Set(['j', 'w', 'ỷ'])

// Diphthong descent colour: #FF3399 (ɔ/pink) → #CC0000 (i/red)
const DIPHTHONG_START = '#FF3399'
const DIPHTHONG_END   = '#CC0000'

// ── Node classification helpers ───────────────────────────────────────────────

function isGraphicConsonant(t: string): boolean {
  return t.length > 0 && [...t.toLowerCase()].every(c => GRAPHIC_CONSONANTS.has(c))
}

// Node has vowel colour but grapheme is purely consonantic → DB error → mute
function shouldBeMute(n: RenderNode): boolean {
  if (n.c === COLOR_SILENT) return true
  if (!n.t || n.t.length === 0) return false
  if (n.c !== COLOR_CONSONANT && isGraphicConsonant(n.t)) return true
  return false
}

// True vowel: has vowel colour, not consonant, not mute, grapheme not pure-consonant
function isVowel(n: RenderNode): boolean {
  if (!n.t || n.t.length === 0) return false
  if (n.c === COLOR_SILENT || n.c === COLOR_CONSONANT) return false
  if (n.x) return false
  if (isGraphicConsonant(n.t)) return false
  return true
}

// Semivowel node: idx=5 (s='j'|'w'|'ỷ')
function isSemivowel(n: RenderNode): boolean {
  return SEMIVOWEL_SOUNDS.has(n.s) && n.c === '#E57373'
}

```

## API Routes

### src/app/api/words/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getBestNodesMany } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body  = await req.json()
    const words: string[] = body?.words

    if (!Array.isArray(words) || words.length === 0)
      return NextResponse.json({ results: {} })

    const unique = [...new Set(
      words.map(w => w.toLowerCase().trim()).filter(Boolean)
    )]

    const map = getBestNodesMany(unique)

    const results: Record<string, object[]> = {}
    for (const [word, result] of map.entries())
      results[word] = result.nodes

    return NextResponse.json({ results }, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' }
    })
  } catch (err) {
    console.error('/api/words error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// DELETE /api/words — clear cache (admin use)
export async function DELETE() {
  try {
    const { getCache } = await import('@/lib/db')
    getCache().prepare('DELETE FROM words').run()
    return NextResponse.json({ ok: true, message: 'Cache cleared' })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
```

### src/app/api/search/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { searchPrefix } from '@/lib/db'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (q.length < 2) return NextResponse.json({ words: [] })
  const words = searchPrefix(q, 10)
  return NextResponse.json({ words })
}
```

### src/app/api/speak/route.ts
```typescript
// POST /api/speak  { word: string }
// Uses espeak-ng on the server to generate audio, streams it back as audio/wav
// Falls back gracefully if espeak-ng is not available

import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { tmpdir } from 'os'
import { join } from 'path'
import { readFile, unlink } from 'fs/promises'

const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  try {
    const { word } = await req.json() as { word: string }
    if (!word || typeof word !== 'string') {
      return NextResponse.json({ error: 'No word' }, { status: 400 })
    }

    // Sanitize — only allow letters, hyphens, apostrophes
    const safe = word.replace(/[^a-zA-Z'\-]/g, '').slice(0, 50)
    if (!safe) return NextResponse.json({ error: 'Invalid word' }, { status: 400 })

    const outFile = join(tmpdir(), `eic_${Date.now()}.wav`)

    // espeak-ng: British English, slightly slower rate
    await execAsync(
      `espeak-ng -v en-gb -s 130 -w "${outFile}" "${safe}"`,
      { timeout: 3000 }
    )

    const audio = await readFile(outFile)
    await unlink(outFile).catch(() => {})

    return new NextResponse(audio, {
      headers: {
        'Content-Type':  'audio/wav',
        'Cache-Control': 'public, max-age=86400',
      }
    })
  } catch (err) {
    console.error('/api/speak error:', err)
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
  }
}
```

### src/app/api/game/route.ts
```typescript
// GET /api/game?level=1&n=10
// Returns n words for the given game level, using cache.db first then lexicon.db

import { NextRequest, NextResponse } from 'next/server'
import { getCache, getLexicon, getBestNodes } from '@/lib/db'

const SILENT       = '#000000'
const CONSONANT    = '#000000'
const GRAPHIC_CONS = new Set('bcdfghjklmnpqrstvxz')

interface GameNode { t: string; s: string; c: string; u: boolean; x: boolean }

function isGraphicCons(t: string) {
  return !!t && [...t.toLowerCase()].every(c => GRAPHIC_CONS.has(c))
}
function dominantColor(nodes: GameNode[]): string | null {
  const cc: Record<string, number> = {}
  for (const n of nodes)
    if (n.c !== SILENT && n.c !== CONSONANT && n.t && !isGraphicCons(n.t))
      cc[n.c] = (cc[n.c] ?? 0) + n.t.length
  const entries = Object.entries(cc)
  return entries.length ? entries.sort((a,b) => b[1]-a[1])[0][0] : null
}
function hasSilentLetters(nodes: GameNode[]) {
  return nodes.some(n => n.c === SILENT && n.t && isGraphicCons(n.t))
}
function hasStress(nodes: GameNode[]) {
  return nodes.some(n => n.u && n.c !== SILENT)
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]]
  }
  return a
}

export async function GET(req: NextRequest) {
  const level  = parseInt(req.nextUrl.searchParams.get('level') ?? '1')
  const n      = Math.min(parseInt(req.nextUrl.searchParams.get('n') ?? '10'), 20)
  const maxLen = level === 1 ? 6 : level === 2 ? 8 : 10
  const minLen = level === 1 ? 3 : 4

  // Get candidate words — from cache if populated, else from lexicon
  let candidates: string[] = []

  try {
    const cache = getCache()
    const cacheCount = (cache.prepare('SELECT COUNT(*) as c FROM words').get() as {c:number}).c

    if (cacheCount > 50) {
      let q = `SELECT word FROM words WHERE word_length BETWEEN ? AND ?`
      if (level === 2) q += ` AND has_silent = 1`
      if (level === 3) q += ` AND has_stress = 1 AND word_length >= 5`
      q += ` ORDER BY RANDOM() LIMIT ${n * 6}`
      candidates = (cache.prepare(q).all(minLen, maxLen) as {word:string}[]).map(r => r.word)
    }
  } catch { /* cache not ready yet */ }

  // Supplement from lexicon if needed
  if (candidates.length < n * 3) {
    try {
      const lex = getLexicon()
      const rows = lex.prepare(
        `SELECT word FROM uk WHERE length(word) BETWEEN ? AND ? ORDER BY RANDOM() LIMIT 400`
      ).all(minLen, maxLen) as {word:string}[]
      const extra = rows.map(r => r.word).filter(w => !candidates.includes(w))
      candidates = [...candidates, ...extra]
    } catch { /* lexicon not ready */ }
  }

  // Process and filter
  const filtered: { word: string; nodes: GameNode[]; dominantColor: string }[] = []

  for (const word of shuffle(candidates)) {
    if (filtered.length >= n * 3) break
    try {
      const result = getBestNodes(word)
      if (!result) continue
      const nodes = result.nodes as GameNode[]
      const dom   = dominantColor(nodes)
      if (!dom) continue

      const ok =
        level === 1 ? true :
        level === 2 ? hasSilentLetters(nodes) :
        hasStress(nodes) && word.length >= 5

      if (ok) filtered.push({ word, nodes, dominantColor: dom })
    } catch { continue }
  }

  return NextResponse.json(
    { words: shuffle(filtered).slice(0, n) },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}```

## Configuration Files

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### next.config.ts
```json
import type { NextConfig } from 'next'

const config: NextConfig = {
  // words.db is read server-side only — no need to bundle it
  serverExternalPackages: ['better-sqlite3'],
}

export default config

```

## Git Information
- Last commit: 7af3976 -  :) x6 (2026-06-04 08:38:02 +0300)
- Total commits: 7
- Current branch: main
