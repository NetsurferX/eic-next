"use client";

import { useEffect, useRef, useState } from "react";
import {
  PIPELINE_STAGE_ORDER,
  PIPELINE_TRACE_CHANNEL,
  type PipelineStageId,
  type PipelineTraceEvent,
} from "@/lib/pipelineTrace";

/* =================================================================
   Live pipeline graph — synced with the REAL /learn page via
   BroadcastChannel (see src/lib/pipelineTrace.ts + the instrumentation
   in WordRenderer.tsx). Open /learn in another tab and play; this
   redraws in real time.

   The client-side pipeline is strictly linear (segment/align/
   phonologicalRules already ran server-side before nodes reach
   WordRenderer), so "options from here on" is honestly just "the next
   fixed step" — not a real decision tree. The one place with genuine
   branching potential (which regex-override category fired) is shown
   as a static side panel instead of invented graph edges.
   ================================================================= */

const STAGE_LABEL: Record<PipelineStageId, string> = {
  syllabicConsonants: "syllabicConsonants",
  syllabicR: "syllabicR",
  overrides: "overrides",
  resolveDisplay: "resolveDisplay",
};

const STAGE_NOTE: Record<PipelineStageId, string> = {
  syllabicConsonants: "detectează consoane fuzibile (\\C) după schwa gol",
  syllabicR: "detectează 'r' silabic (NEAR/CARE/FIRE etc.)",
  overrides: "reguli regex per-cuvânt (vr-lexical-sets, yw, mute-e, misc)",
  resolveDisplay: "rezolvă culoare/diacritică/underline finale",
};

const OVERRIDE_CATEGORIES = ["vr-lexical-sets", "yw-exceptions", "mute-e", "misc"];

// virtual source node index 0 = "nodes din server (db.ts)"; stages start at 1
const NODE_IDS: Array<"source" | PipelineStageId> = ["source", ...PIPELINE_STAGE_ORDER];

export default function PipelineTraceGraph() {
  const [history, setHistory] = useState<PipelineTraceEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const ch = new BroadcastChannel(PIPELINE_TRACE_CHANNEL);
    ch.onmessage = (ev: MessageEvent<PipelineTraceEvent>) => {
      setConnected(true);
      setHistory((prev) => [...prev, ev.data].slice(-5));
    };
    return () => ch.close();
  }, []);

  const width = 760;
  const height = 220;
  const margin = 90;
  const step = (width - margin * 2) / (NODE_IDS.length - 1);
  const y = height / 2;

  const positions = new Map<string, { x: number; y: number }>();
  NODE_IDS.forEach((id, i) => positions.set(id, { x: margin + i * step, y }));

  const current = history.length > 0 ? history[history.length - 1] : null;
  const currentId = current?.stage ?? null;
  const currentIndex = currentId ? NODE_IDS.indexOf(currentId) : -1;
  const nextId = currentIndex >= 0 && currentIndex < NODE_IDS.length - 1 ? NODE_IDS[currentIndex + 1] : null;

  const lastForStage = new Map<string, { age: number; changed: boolean }>();
  history.forEach((ev, i) => {
    lastForStage.set(ev.stage, { age: history.length - 1 - i, changed: ev.changed });
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: "0.85rem",
          marginBottom: "0.5rem",
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: connected ? "#4E9A3E" : "#c9c5bc",
            display: "inline-block",
          }}
        />
        {connected
          ? current
            ? <span>live · ultimul cuvânt: <strong>{current.word}</strong></span>
            : "live — aștept evenimente…"
          : "deschide pagina principală (/) sau /learn în alt tab și scrie/joacă — graful se actualizează aici automat"}
      </div>

      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", maxWidth: width }}>
        <defs>
          <marker id="live-arrow" viewBox="0 -4 8 8" refX={8} refY={0} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M0,-4L8,0L0,4" fill="#c9c5bc" />
          </marker>
        </defs>

        {/* base chain */}
        {NODE_IDS.slice(0, -1).map((id, i) => {
          const a = positions.get(id)!;
          const b = positions.get(NODE_IDS[i + 1])!;
          const isNextEdge = id === currentId && NODE_IDS[i + 1] === nextId;
          return (
            <line
              key={`edge-${id}`}
              x1={a.x + 20}
              y1={a.y}
              x2={b.x - 20}
              y2={b.y}
              stroke={isNextEdge ? "#2F5D8A" : "#d8d5cd"}
              strokeWidth={isNextEdge ? 2.5 : 1.5}
              strokeDasharray={isNextEdge ? "0" : "4 3"}
              markerEnd="url(#live-arrow)"
            />
          );
        })}

        {NODE_IDS.map((id) => {
          const p = positions.get(id)!;
          const isSource = id === "source";
          const isCurrent = id === currentId;
          const isNext = id === nextId;
          const info = !isSource ? lastForStage.get(id) : undefined;
          const opacity = info ? Math.max(0.2, 1 - info.age * 0.2) : isSource ? 0.9 : 0.35;

          const fill = isCurrent ? "#2F5D8A" : isSource ? "#8B7BB8" : info?.changed ? "#5E8C4E" : "#B0ACA2";

          return (
            <g key={id}>
              {isCurrent && (
                <circle cx={p.x} cy={p.y} r={22} fill="none" stroke="#2F5D8A" strokeWidth={2} opacity={0.5}>
                  <animate attributeName="r" values="16;26;16" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0.05;0.6" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={isSource ? 14 : 16}
                fill={fill}
                opacity={opacity}
                stroke="#fff"
                strokeWidth={1.5}
              />
              {isNext && (
                <text x={p.x} y={p.y - 26} textAnchor="middle" fontSize={10} fill="#2F5D8A">
                  următorul
                </text>
              )}
              <text
                x={p.x}
                y={p.y + 34}
                textAnchor="middle"
                fontSize={11}
                fontFamily="var(--font-sans, sans-serif)"
                fill="#1a1917"
              >
                {isSource ? "sursă (db.ts)" : STAGE_LABEL[id as PipelineStageId]}
              </text>
            </g>
          );
        })}
      </svg>

      {currentId === "overrides" && (
        <div style={{ fontSize: "0.8rem", marginTop: "0.5rem", opacity: 0.8 }}>
          Categorii de reguli disponibile la acest pas: {OVERRIDE_CATEGORIES.join(", ")}.{" "}
          {current?.changed
            ? "Cel puțin una s-a aplicat pentru acest cuvânt (nu putem încă spune exact care)."
            : "Niciuna nu s-a aplicat pentru acest cuvânt."}
        </div>
      )}

      <div style={{ marginTop: "0.75rem" }}>
        <div style={{ fontSize: "0.75rem", opacity: 0.6, marginBottom: 4 }}>Ultimele {history.length}/5 evenimente:</div>
        <ol style={{ fontSize: "0.8rem", paddingLeft: "1.1rem" }}>
          {[...history].reverse().map((ev) => (
            <li key={ev.id}>
              <strong>{ev.word}</strong> · {STAGE_LABEL[ev.stage]} · {ev.changed ? "a modificat" : "a trecut neschimbat"}
              <span style={{ opacity: 0.55 }}> — {STAGE_NOTE[ev.stage]}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
