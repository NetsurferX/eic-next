# src/lib/rules/ — where to change what

One question, three shapes of answer. Find your case below.

## "I want to change a colour"

→ **`colors.ts`**. Edit the `hex` on the matching entry in `SOUND_COLORS`.
That's the only file that defines a colour anywhere in this codebase.
Everything else — the rendering engine, the `/rules` editor, the game's
colour legend and "hard mode" distractors, the standalone debug script —
imports from here. There is nothing else to keep in sync.

(This used to be four separate hand-copied colour tables that could
silently drift apart. If you ever see a raw hex string being defined
anywhere else in `src/`, that's a bug — it should import from here instead.)

## "I want a word to render differently — one specific word is wrong"

→ **`overrides/`**. Pick the file for the category:
- `overrides/vr-lexical-sets.ts` — near/bear/cure/poor/our/tower-flower/fire
  style V-R words (B_tehnic §6.2)
- `overrides/yw-exceptions.ts` — words where a y/w/j semivowel grapheme
  falls on an unexpected letter (B_tehnic Tabelul 5)
- `overrides/mute-e.ts` — expressly-mute trailing 'e' cases
- `overrides/misc.ts` — anything else; if 2+ similar rules pile up here,
  split them into their own file the same way the others were split

Add a `RegexRule` entry (see `overrides/types.ts` for the shape). It takes
effect immediately — no other file needs touching, and the `/rules` editor
page picks it up automatically via `overrides/index.ts`.

If you're fixing ONE word, this is almost always the right place — not the
engine.

## "I want to change how stress-underlining or silent-letter detection works in general"

→ **`../engine/display.ts`** (`buildUnderlineSet()`, `isMute()`) and
**`../engine/align.ts`** (grapheme/phoneme alignment that decides what
counts as "letters with no phoneme").

This is deliberately **not** a config file with toggles. Earlier versions
had `UnderlineRules`/`SilentRules` objects that looked editable from the
`/rules` UI (`monosyllabic`, `alwaysSilentPatterns`, etc.) but were never
actually wired to anything — editing them changed nothing on the real site.
They've been removed rather than left as a trap.

The real logic is a small set of interdependent invariants — e.g. "only a
stressed vowel node anchors the underline", "consonants are never
underlined" — documented as `DOGMA` comments at the top of the relevant
function in `engine/display.ts`. Turning these into independent flags would
either be decorative (if nothing reads them) or dangerous (if flipping one
breaks an invariant the others depend on). If you have a genuine, safe,
independent toggle in mind, ask for it to be added properly — as a real
parameter that the engine reads — rather than assuming a config knob
already exists here.

## Folder map

```
src/lib/rules/
  README.md              ← this file
  colors.ts              ← single source of truth for every sound → colour
  overrides/
    index.ts             ← combines all rule files into REGEX_RULES, re-exports types + applyRegexOverrides()
    types.ts             ← RegexRule / RegexRuleAction shape
    apply.ts             ← applyRegexOverrides() — the matching engine, rarely needs editing
    vr-lexical-sets.ts    ← near/bear/cure/poor/our/tower-flower/fire
    yw-exceptions.ts      ← lawyer/Freudian/rooibos/buoyant/fjord
    mute-e.ts             ← expressly-mute trailing 'e'
    misc.ts               ← one-offs and mechanism demos
```
