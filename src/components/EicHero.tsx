"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* =================================================================
   Real shape, from engine/types.ts + the two route handlers:

   POST /api/words  { words: string[] }
     → { results: { [word: string]: RenderNode[] } }

   GET  /api/search?q=
     → { words: string[] }

   RenderNode:
     t: string   grapheme(s) consumed ('' for a latent phoneme with
                  no letter of its own)
     s: string   sound display form (post-transform IPA)
     c: string   resolved hex colour
     u: boolean  isStressed → base underline signal
     x: boolean  isConsonant
     underlineOverride?: 'force' | 'deny'   — wins over u when set
     glyphOverride?: string                  — e.g. 'ỷ' for lawyer's y
     superscriptOverride?: string            — phoneme with no letter,
                                                shown as a superscript
                                                mark on the neighbouring node
     syllabicOverride?: boolean              — forced white-fill/black-
                                                border styling (V-R set,
                                                B_tehnic §6.1)

   No separate "mute" flag exists — a silent letter is communicated
   purely through c (its resolved colour), same as every other node.
   That matches the project's own dogma (color carries the meaning,
   not typographic decoration), so this component doesn't invent a
   strikethrough style for it.
================================================================= */

// Loose on purpose — this is the one place allowed to touch the wire
// format directly, so a real RenderNode shape drifting a field doesn't
// break the build; it just fails soft into DEMO at runtime instead.
type ApiRenderNode = {
  t?: string;
  s?: string;
  c?: string;
  u?: boolean;
  x?: boolean;
  underlineOverride?: "force" | "deny";
  glyphOverride?: string;
  superscriptOverride?: string;
};

type DisplayNode = {
  letters: string;
  ipa: string;
  color: string | null;
  underline: boolean;
  glyph: string | null;
  superscript?: string | null;
};

function resolveUnderline(raw: ApiRenderNode): boolean {
  if (raw.underlineOverride === "force") return true;
  if (raw.underlineOverride === "deny") return false;
  return Boolean(raw.u);
}

function normalizeApiNode(raw: ApiRenderNode): DisplayNode {
  return {
    letters: raw.t ?? "",
    ipa: raw.s ?? "",
    color: raw.c ?? null,
    underline: resolveUnderline(raw),
    glyph: raw.glyphOverride || null,
    superscript: raw.superscriptOverride || null,
  };
}

function normalizeApiResponse(json: any, word: string): DisplayNode[] | null {
  const raw = json?.results?.[word];
  if (!Array.isArray(raw)) return null;
  return raw.map(normalizeApiNode);
}

function normalizeSuggestions(json: any): string[] {
  return Array.isArray(json?.words) ? json.words.slice(0, 6) : [];
}

/* ---------------------------------------------------------------
   OFFLINE DEMO DATA (fallback + first paint before any fetch)
   5 words = the 5 canonical stress-underline cases already
   established for the real engine (a–e). Nodes are written in the
   same shape normalizeApiNode() produces, so DEMO and API words
   flow through one rendering path — "lawyer" even reuses the real
   documented exception colour (#CC0000) and glyph (ỷ) for y.
   ----------------------------------------------------------------
   node.category is a DEMO-only authoring convenience (maps to a
   flat hex below); it never reaches the renderer — color does.
------------------------------------------------------------------*/

/* Flat hex per phoneme category, tuned for readability on a light
   background (the dark-theme values weren't legible here). "exception"
   keeps the real #CC0000 the engine already uses for Tabelul 5 overrides
   (and, not coincidentally, is the same red the site's own CSS uses for
   errors/deletions — .pill-remove:hover, .diff-old, .sg-reveal-missed). */
const DEMO_PALETTE = {
  vowelShort: "#C2410C",
  vowelLong: "#1D6FA5",
  diphthong: "#7C3AED",
  consonant: "#1a1917",
  schwa: "rgba(26, 25, 23, 0.45)",
  exception: "#CC0000",
};

function d(
  letters: string,
  ipa: string,
  category: keyof typeof DEMO_PALETTE,
  underline?: boolean,
  glyph?: string
): DisplayNode {
  return { letters, ipa, color: DEMO_PALETTE[category], underline: Boolean(underline), glyph: glyph || null };
}

const DEMO: Record<string, { ipa: string; caseNote: string; nodes: DisplayNode[] }> = {
  accent: {
    ipa: "ˈæksɛnt",
    caseNote: "The stressed vowel is underlined in both the word and the transcription.",
    nodes: [
      d("a", "æ", "vowelShort", true),
      d("cc", "ks", "consonant"),
      d("e", "ɛ", "vowelShort"),
      d("nt", "nt", "consonant"),
    ],
  },
  taxi: {
    ipa: "ˈtæksi",
    caseNote: "Only the vowel is underlined — the consonant sitting inside the stressed syllable is left alone.",
    nodes: [
      d("t", "t", "consonant"),
      d("a", "æ", "vowelShort", true),
      d("x", "ks", "consonant"),
      d("i", "i", "vowelShort"),
    ],
  },
  beauty: {
    ipa: "ˈbjuːti",
    caseNote: "Three letters, one fused sound — the whole sequence is underlined as a single unit.",
    nodes: [
      d("b", "b", "consonant"),
      d("eau", "juː", "diphthong", true),
      d("t", "t", "consonant"),
      d("y", "i", "vowelShort"),
    ],
  },
  tower: {
    ipa: "ˈtaʊər",
    caseNote: "Both letters of the diphthong are underlined together, never split.",
    nodes: [
      d("t", "t", "consonant"),
      d("ow", "aʊ", "diphthong", true),
      d("er", "ər", "schwa"),
    ],
  },
  lawyer: {
    ipa: "ˈlɔɪər",
    caseNote: "Same rule as tower — but the y keeps its own colour and glide mark inside the diphthong.",
    nodes: [
      d("l", "l", "consonant"),
      d("aw", "ɔ", "diphthong", true),
      d("y", "ɪ", "exception", true, "ỷ"),
      d("er", "ər", "schwa"),
    ],
  },
};

const WORDS = Object.keys(DEMO);

function Node({
  node,
  resolved,
  source,
  glyphOverride,
}: {
  node: DisplayNode;
  resolved: boolean;
  source: "word" | "ipa";
  glyphOverride?: boolean;
}) {
  const text =
    source === "ipa" ? node.ipa : glyphOverride && node.glyph ? node.glyph : node.letters;

  const className = "eic-node" + (node.underline ? " eic-underline" : "");
  const style = { color: resolved ? node.color || DEMO_PALETTE.consonant : DEMO_PALETTE.consonant };

  return (
    <span className={className} style={style}>
      {text}
      {source === "word" && node.superscript && <sup className="eic-sup">{node.superscript}</sup>}
    </span>
  );
}

export default function EicHero() {
  const [query, setQuery] = useState("lawyer");
  const [resolved, setResolved] = useState(false);
  const [apiNodes, setApiNodes] = useState<DisplayNode[] | null>(null); // null = not fetched / not found
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const resolveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  const key = query.trim().toLowerCase();
  const demoEntry = DEMO[key];

  // Real lookup against POST /api/words — falls back to the offline
  // DEMO entry (if any) on network failure or an unrecognized shape,
  // so the hero never goes blank for a visitor.
  const lookupWord = useCallback((word: string) => {
    if (!word) {
      setApiNodes(null);
      setStatus("idle");
      return;
    }
    const id = ++requestId.current;
    setStatus("loading");
    fetch("/api/words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ words: [word] }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json) => {
        if (id !== requestId.current) return; // stale response, a newer keystroke won
        const nodes = normalizeApiResponse(json, word);
        setApiNodes(nodes);
        setStatus(nodes ? "idle" : "error");
      })
      .catch(() => {
        if (id !== requestId.current) return;
        setApiNodes(null);
        setStatus("error");
      });
  }, []);

  // Live suggestions against GET /api/search?q= — purely additive,
  // failures are silent since the word input still works without it.
  const fetchSuggestions = useCallback((prefix: string) => {
    if (!prefix || prefix.length < 2) {
      setSuggestions([]);
      return;
    }
    fetch(`/api/search?q=${encodeURIComponent(prefix)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => setSuggestions(normalizeSuggestions(json)))
      .catch(() => setSuggestions([]));
  }, []);

  useEffect(() => {
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    lookupTimer.current = setTimeout(() => lookupWord(key), 300);
    searchTimer.current = setTimeout(() => fetchSuggestions(key), 200);
    return () => {
      if (lookupTimer.current) clearTimeout(lookupTimer.current);
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [key, lookupWord, fetchSuggestions]);

  // Prefer real data; fall back to the offline demo entry so the 5
  // canonical words always work even with no backend attached.
  const entry = apiNodes
    ? { nodes: apiNodes, source: "api" as const, caseNote: "" }
    : demoEntry
    ? { ...demoEntry, source: "demo" as const }
    : null;

  useEffect(() => {
    setResolved(false);
    if (resolveTimer.current) clearTimeout(resolveTimer.current);
    if (entry) {
      resolveTimer.current = setTimeout(() => setResolved(true), 260);
    }
    return () => {
      if (resolveTimer.current) clearTimeout(resolveTimer.current);
    };
  }, [key, entry]);

  return (
    <div className="eic-hero">
      <style>{`
        /* No @import / no custom fonts — this block only reads the site's
           own tokens (var(--color-*), var(--font-*), var(--radius-*),
           var(--shadow-*)) with a literal fallback equal to what
           globals.css already defines. In the real app the fallback is
           dead weight (the real var always wins); standalone here it's
           what makes the preview look right without globals.css loaded. */

        .eic-hero {
          background: var(--color-bg, #ffffff);
          color: var(--color-text-primary, #1a1917);
          padding: 4rem 1.5rem 3.5rem;
          border-radius: var(--radius-lg, 20px);
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif);
          max-width: 780px;
          margin: 0 auto;
        }
        .eic-eyebrow {
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--color-text-secondary, #000000);
          opacity: 0.7;
          margin: 0 0 1rem;
        }
        .eic-headline {
          font-family: var(--font-serif, Georgia, serif);
          font-weight: 400;
          font-size: clamp(2.1rem, 5vw, 3.1rem);
          line-height: 1.12;
          margin: 0 0 0.85rem;
          letter-spacing: -0.01em;
        }
        .eic-headline em {
          font-style: italic;
        }
        .eic-sub {
          color: var(--color-text-secondary, #000000);
          opacity: 0.75;
          font-size: 1.02rem;
          line-height: 1.55;
          max-width: 46ch;
          margin: 0 0 2.4rem;
        }
        .eic-card {
          background: var(--color-surface, #f8f7f4);
          border: 1.5px solid var(--color-border, #e8e6e1);
          border-radius: var(--radius-xl, 28px);
          padding: 1.6rem 1.7rem 1.4rem;
        }
        .eic-input-row {
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
          border-bottom: 1px solid var(--color-border-soft, #f0efe9);
          padding-bottom: 0.9rem;
          margin-bottom: 1.1rem;
        }
        .eic-input-row label {
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif);
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--color-text-muted, #8a8578);
          letter-spacing: 0.08em;
        }
        .eic-input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--color-text-primary, #1a1917);
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif);
          font-size: 1.5rem;
          font-weight: 500;
          flex: 1;
          min-width: 0;
        }
        .eic-input::placeholder { color: var(--color-text-muted, #8a8578); opacity: 0.6; }

        .eic-word {
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif);
          font-size: 2.4rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          margin: 0.2rem 0 0.4rem;
        }
        .eic-ipa {
          font-family: 'Courier New', monospace;
          font-size: 1.05rem;
          color: var(--color-text-muted, #8a8578);
          opacity: 0.85;
          margin: 0 0 1rem;
        }
        .eic-node { transition: color 420ms ease; }
        .eic-underline { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 4px; }
        .eic-sup { font-size: 0.55em; margin-left: 1px; }

        .eic-case {
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
          margin-top: 0.9rem;
        }
        .eic-case-note {
          font-size: 0.9rem;
          color: var(--color-text-secondary, #000000);
          opacity: 0.7;
          line-height: 1.45;
        }
        .eic-empty {
          font-style: italic;
          color: var(--color-text-muted, #8a8578);
          font-size: 0.95rem;
        }

        .eic-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1.4rem;
        }
        .eic-chip {
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif);
          font-size: 0.78rem;
          font-weight: 500;
          background: var(--color-bg, #ffffff);
          border: 1px solid var(--color-border, #e8e6e1);
          color: var(--color-text-secondary, #000000);
          opacity: 0.8;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          cursor: pointer;
          transition: border-color 160ms ease, background 160ms ease, opacity 160ms ease;
        }
        .eic-chip:hover, .eic-chip:focus-visible {
          background: var(--color-surface-2, #f1f0ec);
          opacity: 1;
          outline: none;
        }
        .eic-chip.active {
          border-color: var(--color-text-primary, #1a1917);
          opacity: 1;
          font-weight: 700;
        }

        .eic-ctas {
          display: flex;
          gap: 0.9rem;
          margin-top: 2.6rem;
          flex-wrap: wrap;
        }
        .eic-btn {
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif);
          font-size: 0.9rem;
          font-weight: 600;
          padding: 0.7rem 1.4rem;
          border-radius: var(--radius-md, 14px);
          cursor: pointer;
          border: 1px solid var(--color-border, #e8e6e1);
          background: var(--color-surface, #f8f7f4);
          color: var(--color-text-primary, #1a1917);
          transition: background 160ms ease, opacity 160ms ease;
        }
        .eic-btn.primary {
          background: var(--color-text-primary, #1a1917);
          border-color: var(--color-text-primary, #1a1917);
          color: #fff;
        }
        .eic-btn.primary:hover { opacity: 0.85; }
        .eic-btn:not(.primary):hover { background: var(--color-surface-2, #f1f0ec); }

        @media (prefers-reduced-motion: reduce) {
          .eic-node { transition: none; }
        }
      `}</style>

      <p className="eic-eyebrow">English in Colours</p>
      <h1 className="eic-headline">
        Spelling lies.
        <br />
        <em>Sound doesn't.</em>
      </h1>
      <p className="eic-sub">
        Type any word EiC knows and watch its real pronunciation resolve in color —
        stress, vowels, glides, and the letters that go silent.
      </p>

      <div className="eic-card">
        <div className="eic-input-row">
          <label htmlFor="eic-word-input">word</label>
          <input
            id="eic-word-input"
            className="eic-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="try lawyer, tower, beauty…"
            autoComplete="off"
            spellCheck="false"
          />
        </div>

        {entry ? (
          <>
            <div className="eic-word">
              {entry.nodes.map((n, i) => (
                <Node key={i} node={n} resolved={resolved} source="word" glyphOverride />
              ))}
            </div>
            <div className="eic-ipa">
              /{entry.nodes.map((n, i) => (
                <Node key={i} node={n} resolved={resolved} source="ipa" />
              ))}/
            </div>
            <div className="eic-case">
              <span className="eic-case-note">
                {entry.source === "demo" ? entry.caseNote : "Live from your dictionary."}
              </span>
            </div>
          </>
        ) : (
          <p className="eic-empty">
            {status === "loading"
              ? "Looking it up…"
              : `Not found — try one of: ${WORDS.join(", ")}.`}
          </p>
        )}

        <div className="eic-chips">
          {(suggestions.length ? suggestions : WORDS).map((w) => (
            <button
              key={w}
              className={"eic-chip" + (key === w ? " active" : "")}
              onClick={() => setQuery(w)}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <div className="eic-ctas">
        <Link href="/learn" className="eic-btn primary">Learn the system</Link>
        <Link href="/rules" className="eic-btn">Open the rules editor</Link>
      </div>
    </div>
  );
}
