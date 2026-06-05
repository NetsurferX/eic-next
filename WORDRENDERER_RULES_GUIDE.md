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

1. It has grapheme text
2. It's NOT silent (grey)
3. It's NOT a pure consonant (black)
4. It doesn't have the `x` flag (not marked as consonant)
5. The grapheme isn't just consonant letters

```typescript
function isVowel(n: RenderNode): boolean {
  if (!n.t || n.t.length === 0) return false                    // Must have text
  if (n.c === COLOR_SILENT || n.c === COLOR_CONSONANT) return false  // Rule 3b
  if (n.x) return false                                         // Rule 3d
  if (isGraphicConsonant(n.t)) return false                     // Rule 3e
  return true
}
```

**Examples:**
- ✅ `{ t: "ai", s: "eɪ", c: "#EE5B00", u: false, x: false }` — vowel
- ❌ `{ t: "r", s: "ɹ", c: "#000000", u: false, x: true }` — consonant
- ❌ `{ t: "", s: "n", c: "#etc", u: false, x: true }` — no text

---

### 🎼 RULE 4: Is a Node a "Semivowel"?

Semivowels are special: they sound like consonants but behave like vowels.

A node is a semivowel if:

1. The sound `s` is one of: `"j"`, `"w"`, or `"ỷ"`
2. The color `c` is **exactly** `"#E57373"` (light purple)

```typescript
const SEMIVOWEL_SOUNDS = new Set(['j', 'w', 'ỷ'])

function isSemivowel(n: RenderNode): boolean {
  return SEMIVOWEL_SOUNDS.has(n.s) && n.c === '#E57373'
}
```

**Why special?** In words like "**yes**" or "**we**":
- `j` and `w` sound like consonants (you can't "hold" them like vowels)
- But phonetically they're glides between vowels
- They get their own distinctive color

**Examples:**
- ✅ `{ t: "y", s: "j", c: "#E57373" }` — semivowel
- ❌ `{ t: "y", s: "j", c: "#000000" }` — consonant, not semivowel

---

### 🔗 RULE 5: Is a Node a "True Syllabic Consonant"?

Syllabic consonants are consonants that act as vowels (like the "le" in "**apple**").

A node is a TRUE syllabic consonant if:

1. The sound `s` has the special marker: `"\u200d"` (zero-width joiner)
2. The PREVIOUS node is a schwa (sound "ə", color `#888888`)

```typescript
const SCHWA = '#888888'
const trueSyllabic = new Set<number>()

for (let i = 0; i < nodes.length; i++) {
  if (nodes[i].s !== SYLLABIC_MARKER) continue
  const prev = i > 0 ? nodes[i - 1] : null
  if (prev && prev.c === SCHWA) trueSyllabic.add(i)  // Rule 5 - TRUE
}
```

**Why the schwa check?** In **"apple"**: `[ap] + [ə] + [l]`
- The schwa "ə" is the actual vowel sound
- The "l" becomes purely consonantal (but still syllabic)

**NOT true syllabic?** Then it's a **diphthong glide** (bonus sound at end of vowels).

---

### 🌊 RULE 6: Build Diphthong Gradients

Diphthongs are vowel pairs that glide together (like "oi" in "**boy**").

Nodes in a diphthong get a **gradient color** (smooth transition):

```typescript
// Gradient colors: #FF3399 (pink) → #CC0000 (red)
const DIPHTHONG_START = '#FF3399'
const DIPHTHONG_END   = '#CC0000'
```

**When do we apply a gradient?**

Look for this pattern:
1. A vowel node (real word sound)
2. Immediately followed by a diphthong glide (`\u200d` after non-schwa vowel)
3. Both nodes get gradient treatment

```typescript
function buildDiphthongGradients(nodes, diphthongGlide): Set<number> {
  const result = new Set<number>()
  for (let i = 0; i < nodes.length; i++) {
    if (!diphthongGlide.has(i)) continue
    if (i > 0 && isVowel(nodes[i - 1]) && nodes[i].t.length > 0) {
      result.add(i - 1)  // vowel part gets gradient
      result.add(i)      // glide part gets gradient
    }
  }
  return result
}
```

**Example:** "**boy**" → `[b] + [ɔ] + [ɪ(glide)]`
- Both the `ɔ` and the glide `ɪ` get the pink→red gradient

---

### 📊 RULE 7: Monosyllabic Words (One Syllable)

**Definition:** Words with no stressed syllables marked.

```typescript
function isMonosyllabic(nodes: RenderNode[]): boolean {
  return !nodes.some(n => n.u === true)  // No node has u=true (stressed)
}
```

**Examples:**
- ✅ Monosyllabic: "cat", "dog", "jump" (1 syllable)
- ❌ Not monosyllabic: "ca**ra**mel", "e**le**phant" (multiple syllables)

---

### ✏️ RULE 8: The Underline Rule (Most Complex!)

**Purpose:** Visually highlight the stressed vowel and any related vowel sounds that follow it.

**When do we underline?**

✅ **YES** — if:
- Word has multiple syllables (not monosyllabic) **AND**
- Word does NOT have a true syllabic consonant (no "apple" type) **AND**
- We find a stressed vowel

❌ **NO** — if:
- Word is monosyllabic
- Word has a true syllabic consonant in it

**What gets underlined?**

Starting from a stressed vowel/semivowel, we extend to include:
1. The stressed vowel itself
2. All immediate following vowels
3. All immediate following semivowels (with text)
4. All immediate following diphthong glides

Stop when we hit a consonant or mute node.

```typescript
function buildUnderlined(nodes, allow, diphthongGlide): Set<number> {
  const result = new Set<number>()
  if (!allow) return result  // Rule 8a - monosyllabic or has syllabic

  let i = 0
  while (i < nodes.length) {
    const n = nodes[i]

    // Find anchor: stressed vowel OR stressed semivowel with text
    const isStressedVowel = n.u && isVowel(n) && !shouldBeMute(n)
    const isStressedSemi  = n.u && isSemivowel(n) && n.t.length > 0

    if (isStressedVowel || isStressedSemi) {
      result.add(i)  // Add the anchor
      
      // Rule 8b - Extend through consecutive vowels/semivowels/glides
      let j = i + 1
      while (j < nodes.length) {
        const next = nodes[j]
        if ((isVowel(next) && !shouldBeMute(next))
          || (isSemivowel(next) && next.t.length > 0)
          || diphthongGlide.has(j)) {
          result.add(j)
          j++
        } else {
          break  // Stop at consonant or mute
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

**Example 1 - "**rainbow**" (stressed on "RAI"):**
```
[r(consonant)] + [ai(VOWEL,stressed)] + [n(consonant)] + [b(consonant)] + [ow(VOWEL,unstressed)]
Underlined:     ________↑___________________________________________
                     starts here, extends until consonant
```

**Example 2 - "**apple**" (has syllabic consonant):**
```
[a(vowel,stressed)] + [p(consonant)] + [ə(schwa)] + [l(SYLLABIC)]
Underlined: NO! (has syllabic consonant, so rule doesn't apply)
```

---

## Final Rendering Rules - Color Resolution

When rendering each node, the component chooses colors in this order:

```typescript
if (isTrueSyllabic) {
  // Rule A: Syllabic consonant → BLACK (#000000)
  color = '#000000'
} else if (isDiphthongNode) {
  // Rule B: Diphthong → GRADIENT (pink to red)
  style = gradient('linear-gradient(to right, #FF3399, #CC0000)')
} else if (shouldBeMute) {
  // Rule C: Silent → GREY (#000000)
  color = '#000000'
} else if (isSemivowel && hasText) {
  // Rule D: Semivowel with text → BLACK (consonantal display)
  color = '#000000'
} else {
  // Rule E: Normal → use the color from database
  color = node.c
}
```

---

## CSS Classes Applied

Based on the classification, nodes get CSS classes:

| Class | Applied When | Purpose |
|-------|--------------|---------|
| `eic-seg` | Always | Base segment styling |
| `eic-syllabic` | True syllabic consonant | Special syllabic styling |
| `eic-stressed` | Underlined + not syllabic | Highlight stressed vowels |
| `eic-silent` | Mute + not syllabic | Muted appearance |
| `eic-semivowel` | Semivowel with text | Semivowel styling |

---

## Summary: Decision Tree

```
┌─ Node with text?
│  ├─ NO → Skip (don't render)
│  └─ YES ↓
│
├─ Is it a TRUE syllabic consonant?
│  └─ YES → Render BLACK, class: eic-syllabic
│
├─ Is it part of a diphthong?
│  └─ YES → Render GRADIENT, class: eic-seg
│
├─ Should it be mute (silent)?
│  └─ YES → Render GREY, class: eic-silent (if not syllabic)
│
├─ Is it a semivowel with text?
│  └─ YES → Render BLACK, class: eic-semivowel
│
└─ Otherwise → Render with DATABASE COLOR
```

---

## Key Takeaways

1. **WordRenderer fixes database errors** — it corrects data where consonant letters have vowel colors
2. **Multiple classification layers** — nodes can be vowels, consonants, semivowels, syllabic consonants, or glides
3. **Diphthongs get special treatment** — vowel pairs get smooth color gradients
4. **Underlines show stress patterns** — they highlight stressed vowels and the vowel runs that follow
5. **Syllabic consonants prevent underlining** — words like "apple" don't get stressed underlines
6. **Colors have linguistic purpose** — each color represents an IPA vowel sound
