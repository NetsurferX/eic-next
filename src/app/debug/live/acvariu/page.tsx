"use client";

import Link from "next/link";
import { useLiveTrace, LIVE_HINT } from "../_useLiveTrace";
import { PIPELINE_STAGE_ORDER, type PipelineStageId } from "@/lib/pipelineTrace";

/* =================================================================
   OGLINDĂ 3/4 — "Acvariu"
   4 bazine alăturate (= etape). Ultimele câteva cuvinte apar ca
   "pești" plutind în bazinul etapei lor curente; un cuvânt "changed"
   e un pește mai mare/mai colorat. Ton jucăuș, potrivit pentru un
   site de copii — spre deosebire de graful tehnic din /debug/graph.
   ================================================================= */

const TANK_LABEL: Record<PipelineStageId, string> = {
  syllabicConsonants: "Consoane silabice",
  syllabicR: "R silabic",
  overrides: "Overrides",
  resolveDisplay: "Display final",
};

const TANK_COLOR: Record<PipelineStageId, string> = {
  syllabicConsonants: "#bfe3f0",
  syllabicR: "#d9cdf0",
  overrides: "#cdeccb",
  resolveDisplay: "#f5ddb8",
};

export default function AcvariuConcept() {
  const { history, connected } = useLiveTrace(16);

  return (
    <main className="eic-home">
      <Link href="/debug/live" style={{ fontSize: "0.8rem", opacity: 0.6 }}>
        ← înapoi la oglinzi live
      </Link>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", margin: "0.5rem 0 0.25rem" }}>
        Acvariu
      </h1>
      <p style={{ marginBottom: "1rem", opacity: 0.7, fontSize: "0.9rem", maxWidth: 620 }}>
        Ton jucăuș pentru un site de copii: fiecare cuvânt e un „pește” care înoată prin cele 4
        bazine ale pipeline-ului. Pește mai mare = etapa a schimbat ceva la cuvânt.
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
        {connected ? "live" : LIVE_HINT}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", maxWidth: 760 }}>
        {PIPELINE_STAGE_ORDER.map((stage) => {
          const fish = history.filter((ev) => ev.stage === stage).slice(-5);
          return (
            <div
              key={stage}
              style={{
                background: TANK_COLOR[stage],
                borderRadius: 10,
                minHeight: 160,
                padding: "0.5rem",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ fontSize: "0.75rem", opacity: 0.65, marginBottom: "0.4rem" }}>
                {TANK_LABEL[stage]}
              </div>
              {fish.length === 0 && (
                <div style={{ fontSize: "0.7rem", opacity: 0.4, marginTop: "2rem", textAlign: "center" }}>
                  bazin gol
                </div>
              )}
              {fish.map((ev, i) => (
                <div
                  key={ev.id}
                  title={ev.word}
                  style={{
                    fontSize: ev.changed ? "1.3rem" : "0.95rem",
                    opacity: 0.4 + (i / fish.length) * 0.6,
                    marginBottom: "0.15rem",
                  }}
                >
                  🐟 <span style={{ fontSize: "0.65rem", opacity: 0.6 }}>{ev.word}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </main>
  );
}
