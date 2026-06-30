# Mute letter code locations in `src/components/WordRenderer.tsx`

## 1. `shouldBeMute` function
- File: `src/components/WordRenderer.tsx`
- Exact line: 25
- Includes 3 lines above and below

```tsx
function isGraphicConsonant(t: string): boolean {
  return t.length > 0 && [...t.toLowerCase()].every(c => GRAPHIC_CONSONANTS.has(c))
}

function shouldBeMute(n: RenderNode): boolean {
  if (n.c === COLOR_SILENT) return true
  if (!n.t || n.t.length === 0) return false
  
  // Modificare critică: O consoană este mută doar dacă are o culoare explicită de vocală (nu goală, nu neagră)
  const hasActiveVowelColor = n.c !== COLOR_CONSONANT && n.c !== '' && n.c !== undefined
  if (hasActiveVowelColor && isGraphicConsonant(n.t)) return true
  
  return false
}
```

## 2. `isVowel` function using `shouldBeMute`
- File: `src/components/WordRenderer.tsx`
- Exact line: 32
- Includes 3 lines above and below

```tsx
  return false
}

function isVowel(n: RenderNode): boolean {
  if (!n.t || n.t.length === 0) return false
  if (shouldBeMute(n)) return false
  if (n.c === COLOR_CONSONANT || n.x || n.c === '') return false
  return true
}

function isSemivowel(n: RenderNode): boolean {
```

## 3. Render logic where `mute` is computed and used
- File: `src/components/WordRenderer.tsx`
- Exact lines: 190, 216, 235
- Includes 3 lines above and below

```tsx
        if (!n.t) return null

        const isTrueSyl     = trueSyllabic.has(i)
        const isGlide       = diphthongGlide.has(i)
        const isDiphNode    = diphthongNodes.has(i)
        const isUnderlined  = underlined.has(i)
        const mute          = shouldBeMute(n) || (isGlide && !isDiphNode)
        const semi          = isSemivowel(n) && n.t.length > 0 && !isGlide

        let color: string
        let style: CSSProperties = {}

        // anchor colour for this node's underline run (if any)
        const runAnchor = underlineColor.get(i)

        if (isTrueSyl) {
          color = COLOR_CONSONANT
        } else if (isDiphNode) {
          // If this diphthong node is underlined, prefer a solid anchor colour
          // for both the glyph and the underline so the run looks unified.
          if (isUnderlined && !isTrueSyl && !mute) {
            color = runAnchor ?? (n.c && n.c !== '' ? n.c : COLOR_CONSONANT)
          } else {
            style = {
              background:          `linear-gradient(to right, ${DIPHTHONG_START}, ${DIPHTHONG_END})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor:  'transparent',
              backgroundClip:      'text',
            }
            color = 'transparent'
          }
        } else if (mute) {
          color = COLOR_SILENT
        } else if (semi) {
          color = COLOR_CONSONANT
        } else {
          // Fallback: if DB colour is empty/invalid, use consonant colour
          color = n.c && n.c !== '' ? n.c : COLOR_CONSONANT
        }

        // If underlined, set a unified colour for both text and the underline
        if (isUnderlined && !isTrueSyl && !mute) {
          const finalCol = runAnchor ?? color
          style = { ...style, textDecoration: 'underline', textDecorationColor: finalCol, textUnderlineOffset: '6px', textDecorationThickness: '2.5px' }
          color = finalCol
        }

        const classes = [
          'eic-seg',
          isTrueSyl                  ? 'eic-syllabic' : '',
          isUnderlined && !isTrueSyl ? 'eic-stressed' : '',
          mute && !isTrueSyl         ? 'eic-silent'   : '',
          semi                       ? 'eic-semivowel' : '',
        ].filter(Boolean).join(' ')
```
