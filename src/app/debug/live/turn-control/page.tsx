"use client";

import Link from "next/link";
import { useLiveTrace, LIVE_HINT } from "../_useLiveTrace";
import { PIPELINE_STAGE_ORDER, type PipelineStageId } from "@/lib/pipelineTrace";

/* =================================================================
   OGLINDĂ 4/4 — "Turn de control"
   Ecran radial tip radar de aeroport, împărțit în 4 sectoare (=
   etape). Fiecare eveniment nou apare ca un "blip" în sectorul lui,
   la o distanță de centru proporțională cu vechimea (mai aproape de
   margine = mai recent). O rază care se rotește continuu dă senzația
   de "scanare live", indiferent dacă vin evenimente sau nu.
   ================================================================= */

const SECTOR_LABEL: Record<PipelineStageId, string> = {
  syllabicConsonants: "syllabicConsonants",
  syllabicR: "syllabicR",
  overrides: "overrides",
  resolveDisplay: "resolveDisplay",
};

const SECTOR_COLOR: Record<PipelineStageId, string> = {
  syllabicConsonants: "#2F5D8A",
  syllabicR: "#8B7BB8",
  overrides: "#5E8C4E",
  resolveDisplay: "#CC7A00",
};

export default function TurnControlConcept() {
  const { history, connected, latest } = useLiveTrace(20);

  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 20;

  const stageIndex: Record<PipelineStageId, number> = {
    syllabicConsonants: 0,
    syllabicR: 1,
    overrides: 2,
    resolveDisplay: 3,
  };

  return (
    <main className="eic-home">
      <Link href="/debug/live" style={{ fontSize: "0.8rem", opacity: 0.6 }}>
        ← înapoi la oglinzi live
      </Link>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", margin: "0.5rem 0 0.25rem" }}>
        Turn de control
      </h1>
      <p style={{ marginBottom: "1rem", opacity: 0.7, fontSize: "0.9rem", maxWidth: 620 }}>
        Radar cu 4 sectoare (= etape). Fiecare blip e un eveniment real; cu cât e mai spre margine,
        cu atât e mai recent. O rază se rotește continuu, ca un radar clasic.
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
            live · <strong>{latest?.word}</strong> → {latest?.stage}
          </span>
        ) : (
          LIVE_HINT
        )}
      </div>

      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", maxWidth: 420, background: "#0a1a12", borderRadius: 10 }}>
        {[0.33, 0.66, 1].map((f) => (
          <circle key={f} cx={cx} cy={cy} r={maxR * f} fill="none" stroke="#1d3a29" strokeWidth={1} />
        ))}
        <line x1={cx} y1={20} x2={cx} y2={size - 20} stroke="#1d3a29" strokeWidth={1} />
        <line x1={20} y1={cy} x2={size - 20} y2={cy} stroke="#1d3a29" strokeWidth={1} />

        {/* rotating sweep */}
        <g style={{ transformOrigin: `${cx}px ${cy}px` }}>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${cx} ${cy}`}
            to={`360 ${cx} ${cy}`}
            dur="4s"
            repeatCount="indefinite"
          />
          <path d={`M ${cx} ${cy} L ${cx} 20 A ${maxR} ${maxR} 0 0 1 ${cx + 40} 24 Z`} fill="#3ddc8433" />
        </g>

        {/* sector labels */}
        {PIPELINE_STAGE_ORDER.map((s, i) => {
          const angle = (i / 4) * 2 * Math.PI - Math.PI / 2 + Math.PI / 4;
          const lx = cx + Math.cos(angle) * (maxR + 6);
          const ly = cy + Math.sin(angle) * (maxR + 6);
          return (
            <text key={s} x={lx} y={ly} fontSize={9} fill={SECTOR_COLOR[s]} textAnchor="middle">
              {SECTOR_LABEL[s]}
            </text>
          );
        })}

        {/* blips */}
        {history.map((ev, i) => {
          const idx = stageIndex[ev.stage];
          const sectorAngleStart = (idx / 4) * 2 * Math.PI - Math.PI / 2;
          const angle = sectorAngleStart + Math.PI / 4;
          const age = history.length - 1 - i;
          const r = Math.max(20, maxR - age * (maxR / 22));
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          return (
            <circle
              key={ev.id}
              cx={x}
              cy={y}
              r={ev.changed ? 5 : 3}
              fill={SECTOR_COLOR[ev.stage]}
              opacity={Math.max(0.15, 1 - age * 0.04)}
            />
          );
        })}

        <circle cx={cx} cy={cy} r={4} fill="#3ddc84" />
      </svg>
    </main>
  );
}
