"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DEFAULT_CONFIG, applyRegexOverrides } from "@/lib/ruleConfig";
import { resolveDisplay } from "@/lib/engine";
import type { RenderNode } from "@/lib/renderNode";

/* =================================================================
   /culise — the site's own accent-test.ts, but live in the browser.

   GET /api/words/variants?word=...
     → { word, uk: { ipa, nodes } | null, us: { ipa, nodes } | null }

   `nodes` here are RAW RenderNode[] straight off the lexicon (no
   overrides applied server-side — same contract WordRenderer.tsx
   already relies on). This component runs the exact same two-step
   pipeline a real render does: applyRegexOverrides() then
   resolveDisplay(), so what you see here is what production shows,
   not a re-derived approximation of it.
================================================================= */

type VariantResult = { ipa: string; nodes: RenderNode[] } | null;

type ApiResponse = {
  word: string;
  uk: VariantResult;
  us: VariantResult;
};

/* ---------------- syntax-highlighted value cell ---------------- */

function Val({ v }: { v: unknown }) {
  if (typeof v === "boolean")
    return <span style={{ color: v ? "#B5651D" : "#4C7A3D" }}>{String(v)}</span>;
  if (v === null || v === undefined)
    return <span style={{ color: "var(--color-text-muted, #8a8578)" }}>—</span>;
  return <span style={{ color: "#4C7A3D" }}>'{String(v)}'</span>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="culise-th">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="culise-td">{children}</td>;
}

/* ---------------- one accent panel (UK or US) ---------------- */

function Panel({
  label,
  word,
  result,
}: {
  label: "UK" | "US";
  word: string;
  result: VariantResult;
}) {
  if (!result) {
    return (
      <div className="culise-panel">
        <div className="culise-panel-title">
          <span>{label}</span>
          <div className="culise-dot-line" />
        </div>
        <p className="culise-missing">niciun rând în tabela `{label.toLowerCase()}` pentru "{word}"</p>
      </div>
    );
  }

  const { ipa, nodes } = result;
  const renderNodes = applyRegexOverrides(word, nodes, DEFAULT_CONFIG.regexRules);
  const display = resolveDisplay(renderNodes);

  return (
    <div className="culise-panel">
      <div className="culise-panel-title">
        <span>{label}</span>
        <div className="culise-dot-line" />
      </div>

      <div className="culise-box">
        <p className="culise-wordline">
          IPA: <span style={{ color: "#4C7A3D" }}>{ipa}</span>
        </p>

        <table className="culise-table">
          <thead>
            <tr>
              <Th>(index)</Th>
              <Th>t</Th>
              <Th>s</Th>
              <Th>color</Th>
              <Th>underline</Th>
              <Th>mute</Th>
            </tr>
          </thead>
          <tbody>
            {display.map((d, i) => (
              <tr key={i}>
                <Td><Val v={i} /></Td>
                <Td><Val v={d.t} /></Td>
                <Td><Val v={d.sound} /></Td>
                <Td><Val v={d.color} /></Td>
                <Td><Val v={d.underline} /></Td>
                <Td><Val v={d.mute} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- page component ---------------- */

export default function EicCulise() {
  const [query, setQuery] = useState("generator");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  const lookup = useCallback((word: string) => {
    if (!word) {
      setData(null);
      setStatus("idle");
      return;
    }
    const id = ++requestId.current;
    setStatus("loading");
    fetch(`/api/words/variants?word=${encodeURIComponent(word)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json: ApiResponse) => {
        if (id !== requestId.current) return;
        setData(json);
        setStatus("idle");
      })
      .catch(() => {
        if (id !== requestId.current) return;
        setData(null);
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => lookup(query.trim().toLowerCase()), 250);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query, lookup]);

  return (
    <div className="culise-page">
      <style jsx>{`
        .culise-page {
          min-height: 100vh;
          background: var(--color-bg, #ffffff);
          padding: 3rem 1.5rem 4rem;
          font-family: "Courier New", Consolas, monospace;
        }
        .culise-head {
          max-width: 1180px;
          margin: 0 auto 1.8rem;
        }
        .culise-eyebrow {
          color: var(--color-text-muted, #8a8578);
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin: 0 0 0.5rem;
        }
        .culise-input {
          width: 100%;
          max-width: 360px;
          background: var(--color-surface, #f8f7f4);
          border: 1px solid var(--color-border, #e8e6e1);
          border-radius: var(--radius-md, 14px);
          color: var(--color-text-primary, #1a1917);
          font-family: inherit;
          font-size: 1rem;
          padding: 0.6rem 0.85rem;
          outline: none;
        }
        .culise-input:focus { border-color: var(--color-text-muted, #8a8578); }
        .culise-status {
          color: var(--color-text-muted, #8a8578);
          font-size: 0.78rem;
          margin-top: 0.5rem;
          min-height: 1.1em;
        }
        .culise-grid {
          max-width: 1180px;
          margin: 2rem auto 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.2rem;
        }
        @media (max-width: 880px) {
          .culise-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <style jsx global>{`
        .culise-panel-title {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: var(--color-text-primary, #1a1917);
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          margin-bottom: 0.6rem;
        }
        .culise-dot-line {
          width: 1px;
          height: 14px;
          background: var(--color-border, #e8e6e1);
          margin-top: 4px;
          position: relative;
        }
        .culise-dot-line::after {
          content: "";
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4a90d9;
        }
        .culise-box {
          background: var(--color-surface, #f8f7f4);
          border: 1px solid var(--color-border, #e8e6e1);
          border-radius: var(--radius-lg, 20px);
          padding: 1.1rem 1.2rem 1.3rem;
          overflow-x: auto;
        }
        .culise-wordline {
          color: var(--color-text-primary, #1a1917);
          font-size: 0.86rem;
          margin: 0 0 1rem;
        }
        .culise-table {
          border-collapse: collapse;
          width: 100%;
          font-size: 0.82rem;
        }
        .culise-th {
          text-align: left;
          color: var(--color-text-primary, #1a1917);
          border-bottom: 1px solid var(--color-border, #e8e6e1);
          padding: 0.35rem 0.7rem;
          font-weight: 700;
        }
        .culise-td {
          padding: 0.3rem 0.7rem;
          border-bottom: 1px solid var(--color-border-soft, #f0efe9);
          white-space: nowrap;
        }
        .culise-missing {
          color: var(--color-text-muted, #8a8578);
          font-size: 0.85rem;
          font-style: italic;
        }
      `}</style>

      <div className="culise-head">
        <p className="culise-eyebrow">EiC · culise</p>
        <input
          className="culise-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="cuvânt…"
          autoComplete="off"
          spellCheck="false"
        />
        <p className="culise-status">
          {status === "loading" ? "se caută…" : status === "error" ? "eroare la interogare" : "\u00A0"}
        </p>
      </div>

      {data && (
        <div className="culise-grid">
          <Panel label="UK" word={data.word} result={data.uk} />
          <Panel label="US" word={data.word} result={data.us} />
        </div>
      )}
    </div>
  );
}
