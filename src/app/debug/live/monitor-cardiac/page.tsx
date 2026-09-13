"use client";

import Link from "next/link";
import { useLiveTrace, LIVE_HINT } from "../_useLiveTrace";
import { PIPELINE_STAGE_ORDER, type PipelineStageId } from "@/lib/pipelineTrace";

/* =================================================================
   OGLINDĂ 1/4 — "Monitor cardiac"
   O linie tip ECG: fiecare eveniment de pipeline produce un puls;
   evenimentele "changed=true" au vârf mai înalt. Etapele au culori
   diferite pe traseu, ca 4 "canale" suprapuse pe același ecran.
   ================================================================= */

const STAGE_COLOR: Record<PipelineStageId, string> = {
  syllabicConsonants: "#2F5D8A",
  syllabicR: "#8B7BB8",
  overrides: "#5E8C4E",
  resolveDisplay: "#CC7A00",
};

export default function MonitorCardiacConcept() {
  const { history, connected, latest } = useLiveTrace(24);

  const width = 720;
  const height = 200;
  const step = width / 24;

  // build a simple zig-zag path across recent events
  const points = history.map((ev, i) => {
    const x = i * step;
    const peak = ev.changed ? 60 : 22;
    const y = height / 2 - peak;
    return { x, y, ev };
  });

  const path = points
    .map((p, i) => {
      const baseY = height / 2;
      const prevX = i === 0 ? 0 : points[i - 1].x;
      // baseline -> spike -> baseline for each event
      return `${i === 0 ? "M" : "L"} ${prevX + step * 0.3} ${baseY} L ${p.x} ${p.y} L ${p.x + step * 0.3} ${baseY}`;
    })
    .join(" ");

  return (
    <main className="eic-home">
      <Link href="/debug/live" style={{ fontSize: "0.8rem", opacity: 0.6 }}>
        ← înapoi la oglinzi live
      </Link>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", margin: "0.5rem 0 0.25rem" }}>
        Monitor cardiac
      </h1>
      <p style={{ marginBottom: "1rem", opacity: 0.7, fontSize: "0.9rem", maxWidth: 620 }}>
        Fiecare eveniment real din pipeline = un puls. Vârf înalt = etapa a modificat nodurile;
        vârf mic = a trecut neschimbată.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", marginBottom: "0.75rem" }}>
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: connected ? "#4E9A3E" : "#c9c5bc",
            display: "inline-block",
          }}
        />
        {connected ? (
          <span>
            live · ultimul: <strong>{latest?.word}</strong>
          </span>
        ) : (
          LIVE_HINT
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", maxWidth: width, background: "#0c1210", borderRadius: 8 }}
      >
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#1f2e28" strokeWidth={1} />
        {points.length > 1 && (
          <path d={path} fill="none" stroke="#3ddc84" strokeWidth={2} strokeLinejoin="round" />
        )}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={STAGE_COLOR[p.ev.stage]} />
        ))}
      </svg>

      <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", fontSize: "0.8rem" }}>
        {PIPELINE_STAGE_ORDER.map((s) => (
          <span key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: STAGE_COLOR[s], display: "inline-block" }} />
            {s}
          </span>
        ))}
      </div>
    </main>
  );
}
