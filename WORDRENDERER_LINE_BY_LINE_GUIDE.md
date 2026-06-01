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

---

## Rule 4: Semivowels

**What it does:** Identifies semivowel sounds (j, w, ỷ).

**Where to modify:**

```typescript
// LINES 15 - SEMIVOWEL SOUNDS
const SEMIVOWEL_SOUNDS = new Set(['j', 'w', 'ỷ'])
                                  ↑         ↑    ↑
                    Add/remove sounds here

// LINES 44-46 - SEMIVOWEL DETECTION
function isSemivowel(n: RenderNode): boolean {
  return SEMIVOWEL_SOUNDS.has(n.s) && n.c === '#E57373'
         ↑                                   ↑
         Sound check               Color check (light purple)
}
```

**Specific modifications:**

| Line | What to change | Example |
|------|----------------|---------|
| **Line 15** | Add/remove sounds in the set | Add `'l'` for syllabic l → `['j', 'w', 'ỷ', 'l']` |
| **Line 45** | Change color requirement | Change `'#E57373'` to `'#FF3399'` to use different color |
| **Line 45** | Condition operator | Change `&&` to `\|\|` to make either condition sufficient |

**Functions that use this:**
- **Line 138:** `buildUnderlined()` checks for semivowels
- **Line 171:** Rendering logic checks for semivowels

---

## Rule 5: True Syllabic Consonants

**What it does:** Identifies consonants acting as vowels (apple, button).

**Where to modify:**

```typescript
// LINES 50-64 - SYLLABIC CONSONANT CLASSIFICATION
function classifyNodes(nodes: RenderNode[]): Classification {
  const SCHWA = '#888888'  // LINE 51 - MODIFY THIS COLOR if schwa color changes
  const trueSyllabic  = new Set<number>()
  const diphthongGlide = new Set<number>()

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].s !== SYLLABIC_MARKER) continue      // LINE 57 - Change marker if needed
                            ↑
                  Zero-width joiner marker
    const prev = i > 0 ? nodes[i - 1] : null
    if (prev && prev.c === SCHWA) trueSyllabic.add(i) // LINE 60 - SYLLABIC CHECK
             // LINE 60: requires previous node color = SCHWA
    else diphthongGlide.add(i)                        // LINE 61 - Otherwise = glide
  }
  return { trueSyllabic, diphthongGlide }
}
```

**Precise line modifications:**

| Line | Change | Impact |
|------|--------|--------|
| **Line 51** | Change `'#888888'` | Change what counts as "schwa" color |
| **Line 57** | Change `SYLLABIC_MARKER` | Change the special marker used for syllabic consonants |
| **Line 60** | Change `prev.c === SCHWA` | Change the condition for true syllabic detection |
| **Line 61** | Change to `diphthongGlide.add(i)` | Change what happens when it's NOT syllabic |

**Example modification — make it only syllabic if it's ANY vowel color (not just schwa):**
```typescript
// BEFORE (line 60):
if (prev && prev.c === SCHWA) trueSyllabic.add(i)

// AFTER:
if (prev && prev.c !== '#000000') trueSyllabic.add(i)  // Any non-consonant color
```

---

## Rule 6: Diphthong Colors and Gradients

**What it does:** Color transitions for vowel pairs.

**Where to modify:**

```typescript
// LINES 18-19 - GRADIENT COLORS
const DIPHTHONG_START = '#FF3399'  // LINE 18 - Pink (start)
                       ↑↑↑↑↑↑
const DIPHTHONG_END   = '#CC0000'  // LINE 19 - Red (end)
                       ↑↑↑↑↑↑
```

**To change gradient:**
```typescript
// Current: Pink → Red
const DIPHTHONG_START = '#FF3399'
const DIPHTHONG_END   = '#CC0000'

// Example: Blue → Green
const DIPHTHONG_START = '#00b0f0'
const DIPHTHONG_END   = '#008E40'

// Example: Single color (no gradient effect)
const DIPHTHONG_START = '#FF3399'
const DIPHTHONG_END   = '#FF3399'  // Same as start = flat color
```

**Diphthong detection logic:**

```typescript
// LINES 92-101 - BUILD DIPHTHONG GRADIENTS
function buildDiphthongGradients(
  nodes: RenderNode[],
  diphthongGlide: Set<number>
): Set<number> {
  const result = new Set<number>()
  for (let i = 0; i < nodes.length; i++) {
    if (!diphthongGlide.has(i)) continue              // LINE 98 - Check if glide
    if (i > 0 && isVowel(nodes[i - 1]) && nodes[i].t.length > 0) {
    //          ↑                      ↑
    //   LINE 99 - Preceding vowel check, text check
      result.add(i - 1)  // LINE 100 - Add vowel to gradient
      result.add(i)      // LINE 101 - Add glide to gradient
    }
  }
  return result
}
```

**Modifications:**

| Line | Change | Result |
|------|--------|--------|
| **Lines 18-19** | Change colors | Different gradient appearance |
| **Line 98** | Change `!diphthongGlide.has(i)` | Change which nodes can start a diphthong |
| **Line 99** | Remove `isVowel()` check | Allow non-vowels to start gradients |
| **Line 99** | Remove text check `nodes[i].t.length > 0` | Include empty-text nodes |

---

## Rule 7: Monosyllabic Words

**What it does:** Detects single-syllable words.

**Where to modify:**

```typescript
// LINES 103-105 - MONOSYLLABIC DETECTION
function isMonosyllabic(nodes: RenderNode[]): boolean {
  return !nodes.some(n => n.u === true)
         ↑                  ↑
    Negation         Check stress flag
}
```

**To change monosyllabic detection:**

```typescript
// Current: No stressed nodes = monosyllabic
return !nodes.some(n => n.u === true)

// Alternative: Only 1 vowel = monosyllabic
return nodes.filter(n => isVowel(n)).length === 1

// Alternative: No multi-syllable markers = monosyllabic
return !nodes.some(n => n.u === true && n.s !== SYLLABIC_MARKER)
```

| Line | Modify | Impact |
|------|--------|--------|
| **Line 105** | Condition `n.u === true` | What flag indicates stressed (currently `u` = stressed) |
| **Line 105** | Change `!nodes.some()` to `nodes.every()` | Inverse logic |
| **Line 105** | Add filter function | Use different criteria (vowel count, etc.) |

---

## Rule 8: Underline (Most Complex)

**What it does:** Highlights stressed vowel groups.

**Where to modify:**

```typescript
// LINES 111-143 - UNDERLINE BUILDING LOGIC
function buildUnderlined(
  nodes: RenderNode[],
  allow: boolean,          // LINE 112 - Controls whether underlines allowed
  diphthongGlide: Set<number>
): Set<number> {
  const result = new Set<number>()
  if (!allow) return result  // LINE 116 - Gate: check allow flag

  let i = 0
  while (i < nodes.length) {
    const n = nodes[i]

    // LINES 122-123 - ANCHOR DETECTION (where underline starts)
    const isStressedVowel = n.u && isVowel(n) && !shouldBeMute(n)
    //                      ↑      ↑            ↑
    //              Stress flag, vowel check, not mute
    
    const isStressedSemi  = n.u && isSemivowel(n) && n.t.length > 0
    //                      ↑      ↑               ↑ 
    //              Stress flag, semivowel check, has text

    if (isStressedVowel || isStressedSemi) {  // LINE 125 - Either anchor type
      result.add(i)
      
      // LINES 127-137 - EXTEND THROUGH CONSECUTIVE VOWELS
      let j = i + 1
      while (j < nodes.length) {
        const next = nodes[j]
        if ((isVowel(next) && !shouldBeMute(next))      // LINE 130 - Vowels OK
          || (isSemivowel(next) && next.t.length > 0)   // LINE 131 - Semivowels OK
          || diphthongGlide.has(j)) {                    // LINE 132 - Glides OK
          result.add(j)
          j++
        } else {
          break  // LINE 135 - Stop at consonant or other
        }
      }
      i = j
    } else {
      i++
    }
  }
  return result
}
```

**Where this gets enabled/disabled:**

```typescript
// LINES 154-156 - ENABLE/DISABLE UNDERLINES
const mono   = isMonosyllabic(nodes)          // LINE 154 - Monosyllabic check
const hasSyl = hasTrueSyllabic(trueSyllabic)  // LINE 155 - Syllabic check
const allow  = !mono && !hasSyl               // LINE 156 - GATE LOGIC
           // ↑
    Set to false to disable all underlines
```

**Line-by-line modifications:**

| Lines | Change | Impact |
|-------|--------|--------|
| **Line 116** | Change `if (!allow) return result` | Change when underlines are disabled |
| **Line 122** | Change `n.u &&` to something else | Change stress detection (currently `u` flag) |
| **Line 122** | Remove `!shouldBeMute(n)` | Allow mute nodes to be anchors |
| **Line 123** | Change `n.u &&` | Change semivowel stress detection |
| **Line 125** | Change `\|\|` to `&&` | Require BOTH anchor types (likely never true) |
| **Line 130** | Remove `!shouldBeMute(next)` | Include mute nodes in run |
| **Line 131** | Change `next.t.length > 0` | Allow empty-text semivowels |
| **Line 132** | Remove `\|\| diphthongGlide.has(j)` | Don't include glides |
| **Line 156** | Change `!mono && !hasSyl` | Change enable/disable logic |

**Example: Underline ONLY monosyllabic words (opposite of current):**
```typescript
// LINE 156 - BEFORE:
const allow  = !mono && !hasSyl

// AFTER:
const allow  = mono  // ONLY monosyllabic
```

**Example: Never underline:**
```typescript
// LINE 156 - BEFORE:
const allow  = !mono && !hasSyl

// AFTER:
const allow  = false  // Always false
```

---

## Color Resolution Logic

**What it does:** Chooses the final color for each node when rendering.

**Where to modify:**

```typescript
// LINES 175-183 - COLOR PRIORITY (first match wins!)
if (isTrueSyl) {                          // LINE 175 - Priority 1: Syllabic
  color = COLOR_CONSONANT                 // = black
} else if (isDiphNode) {                  // LINE 177 - Priority 2: Diphthong
  style = {
    background: `linear-gradient(to right, ${DIPHTHONG_START}, ${DIPHTHONG_END})`,
    WebkitBackgroundClip: 'text',      // LINE 180 - CSS gradient setup
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  }
  color = 'transparent'
} else if (mute) {                        // LINE 183 - Priority 3: Mute
  color = COLOR_SILENT                    // = grey
} else if (semi) {                        // LINE 184 - Priority 4: Semivowel
  color = COLOR_CONSONANT                 // = black
} else {                                  // LINE 186 - Priority 5: Default
  color = n.c                             // Use database color
}
```

**Priority order (CRITICAL - order matters!):**

1. **Line 175** - Syllabic consonant → BLACK
2. **Line 177** - Diphthong → GRADIENT
3. **Line 183** - Mute/silent → GREY
4. **Line 184** - Semivowel → BLACK
5. **Line 186** - Everything else → database color

**To change priority order:**
```typescript
// BEFORE: Syllabic has highest priority
if (isTrueSyl) {
  color = COLOR_CONSONANT
} else if (isDiphNode) {
  // ...
}

// AFTER: Mute has highest priority (moved up)
if (mute) {
  color = COLOR_SILENT
} else if (isTrueSyl) {
  color = COLOR_CONSONANT
} else if (isDiphNode) {
  // ...
}
```

---

## CSS Classes Logic

**What it does:** Applies visual styles via CSS classes.

**Where to modify:**

```typescript
// LINES 185-191 - CSS CLASS ASSIGNMENT
const classes = [
  'eic-seg',                              // LINE 186 - Always added
  isTrueSyl                        ? 'eic-syllabic' : '',   // LINE 187
  isUnderlined && !isTrueSyl       ? 'eic-stressed'  : '',  // LINE 188
  mute && !isTrueSyl               ? 'eic-silent'    : '',  // LINE 189
  semi                             ? 'eic-semivowel' : '',  // LINE 190
].filter(Boolean).join(' ')
```

**Line-by-line modifications:**

| Line | Change | New class name |
|------|--------|----------------|
| **Line 186** | Change `'eic-seg'` | Rename base class |
| **Line 187** | Change `'eic-syllabic'` | Rename syllabic class |
| **Line 187** | Add `\|\| isDiphNode` before `?` | Add class when diphthong |
| **Line 188** | Change `'eic-stressed'` | Rename stressed class |
| **Line 188** | Remove `&& !isTrueSyl` | Apply even to syllabic |
| **Line 189** | Change `'eic-silent'` | Rename silent class |
| **Line 189** | Change `mute &&` condition | When silent class applies |
| **Line 190** | Change `'eic-semivowel'` | Rename semivowel class |

**Example: Add a new class for diphthongs:**
```typescript
// BEFORE (lines 185-191):
const classes = [
  'eic-seg',
  isTrueSyl                        ? 'eic-syllabic' : '',
  isUnderlined && !isTrueSyl       ? 'eic-stressed'  : '',
  mute && !isTrueSyl               ? 'eic-silent'    : '',
  semi                             ? 'eic-semivowel' : '',
].filter(Boolean).join(' ')

// AFTER:
const classes = [
  'eic-seg',
  isTrueSyl                        ? 'eic-syllabic' : '',
  isDiphNode                       ? 'eic-diphthong' : '',  // NEW LINE
  isUnderlined && !isTrueSyl       ? 'eic-stressed'  : '',
  mute && !isTrueSyl               ? 'eic-silent'    : '',
  semi                             ? 'eic-semivowel' : '',
].filter(Boolean).join(' ')
```

---

## Quick Reference - All Lines by Rule

| Rule | Lines | Main Function |
|------|-------|---------------|
| **Rule 1: Graphic Consonants** | 12, 24-26 | `isGraphicConsonant()` |
| **Rule 2: Mute Nodes** | 28-34 | `shouldBeMute()` |
| **Rule 3: True Vowels** | 36-42 | `isVowel()` |
| **Rule 4: Semivowels** | 15, 44-46 | `isSemivowel()` |
| **Rule 5: Syllabic Consonants** | 50-64 | `classifyNodes()` |
| **Rule 6: Diphthongs** | 18-19, 92-101 | `buildDiphthongGradients()` |
| **Rule 7: Monosyllabic** | 103-105 | `isMonosyllabic()` |
| **Rule 8: Underlines** | 111-156 | `buildUnderlined()` + enable logic |
| **Color Resolution** | 175-186 | Rendering `if-else` chain |
| **CSS Classes** | 185-191 | Class assignment array |

---

## How to Make Changes Safely

1. **Identify your target rule** from the table above
2. **Find the line numbers** listed for that rule
3. **Understand the current logic** using the code examples
4. **Make ONE change at a time** and test
5. **Test with example words:**
   - Monosyllabic: "cat", "dog"
   - Multi-syllabic: "ca**ra**mel", "e**le**phant"
   - With semivowels: "**y**es", "**w**e"
   - With diphthongs: "b**oi**", "r**ai**nbow"
   - With syllabic consonants: "**ap**ple", "**bott**on"
