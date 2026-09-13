"use client";

import Link from "next/link";
import { useLiveTrace, LIVE_HINT } from "../_useLiveTrace";
import { useLiveTrains, MAX_LANES } from "../_useLiveTrains";
import { PIPELINE_STAGE_ORDER, type PipelineStageId } from "@/lib/pipelineTrace";

/* =================================================================
   OGLINDĂ 2/4 — "Hartă de metrou" (versiune finală)
   O singură linie, 4 stații fixe (ordinea reală a pipeline-ului).
   Fiecare cuvânt activ e propriul „tren" (vezi _useLiveTrains.ts):
   apare pe prima linie liberă, alunecă animat de la stație la stație
   pe măsură ce vin evenimente noi pentru el, și dispare (fade-out)
   dacă nu mai primește evenimente ~1.8s.
   Pagină permanentă — nu mai e doar concept de brainstorm.
   ================================================================= */

const STATION_LABEL: Record<PipelineStageId, string> = {
  syllabicConsonants: "Consoane silabice",
  syllabicR: "R silabic",
  overrides: "Regex overrides",
  resolveDisplay: "Resolve display",
};

const STATIONS: PipelineStageId[] = PIPELINE_STAGE_ORDER;

// procente calculate din același sistem de coordonate ca SVG-ul de mai jos
// (viewBox 760×160, margin 80, step 200) — țin sincronizate cele două straturi
const WIDTH = 760;
const HEIGHT = 160;
const MARGIN = 80;
const STEP = (WIDTH - MARGIN * 2) / (STATIONS.length - 1);
const STATION_X_PCT = STATIONS.map((_, i) => ((MARGIN + i * STEP) / WIDTH) * 100);

// offset-uri de bandă (lane), simetrice deasupra/dedesubtul liniei centrale
const LANE_OFFSET_PCT = [0, 9, -9, 18, -18, 27].map((px) => (px / HEIGHT) * 100);

export default function HartaMetrouConcept() {
  const { history, connected: statsConnected } = useLiveTrace(30);
  const { trains, connected } = useLiveTrains();

  const visitedCount = new Map<PipelineStageId, number>();
  history.forEach((ev) => visitedCount.set(ev.stage, (visitedCount.get(ev.stage) ?? 0) + 1));

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
        Hartă de metrou
      </h1>
      <p style={{ marginBottom: "1rem", opacity: 0.7, fontSize: "0.9rem", maxWidth: 620 }}>
        Fiecare cuvânt activ e un tren separat, pe banda lui, care alunecă de la stație la stație.
        Până la {MAX_LANES} trenuri simultane; peste plafon, cuvintele suplimentare nu mai primesc
        tren vizual (logica din spate nu e afectată).
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", marginBottom: "0.75rem" }}>
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: connected || statsConnected ? "#4E9A3E" : "#c9c5bc",
            display: "inline-block",
          }}
        />
        {connected || statsConnected ? (
          <span>live · {trains.length} tren{trains.length === 1 ? "" : "uri"} pe linie</span>
        ) : (
          LIVE_HINT
        )}
      </div>

      <div style={{ position: "relative", width: "100%", maxWidth: WIDTH }}>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ width: "100%", display: "block" }}>
          <line
            x1={MARGIN}
            y1={HEIGHT / 2}
            x2={WIDTH - MARGIN}
            y2={HEIGHT / 2}
            stroke="#2F5D8A"
            strokeWidth={6}
            strokeLinecap="round"
          />

          {STATIONS.map((s, i) => {
            const x = MARGIN + i * STEP;
            const y = HEIGHT / 2;
            const count = visitedCount.get(s) ?? 0;
            return (
              <g key={s}>
                <circle cx={x} cy={y} r={14} fill="#fff" stroke="#2F5D8A" strokeWidth={4} />
                <text x={x} y={y - 26} textAnchor="middle" fontSize={11} fontFamily="var(--font-sans, sans-serif)">
                  {STATION_LABEL[s]}
                </text>
                <text x={x} y={y + 34} textAnchor="middle" fontSize={10} opacity={0.55}>
                  {count} treceri
                </text>
              </g>
            );
          })}
        </svg>

        {/* suprapunere HTML pentru trenuri — poziționare în % ca să rămână
            aliniată cu SVG-ul de dedesubt indiferent de scalare, tranziție
            CSS pentru alunecarea animată */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {trains.map((t) => {
            const leftPct = STATION_X_PCT[stageIndex[t.stage]];
            const topOffsetPct = LANE_OFFSET_PCT[t.laneIndex] ?? 0;
            return (
              <div
                key={t.word}
                style={{
                  position: "absolute",
                  left: `${leftPct}%`,
                  top: `calc(50% + ${topOffsetPct}%)`,
                  transform: "translate(-50%, -50%)",
                  transition: "left 0.6s ease, top 0.3s ease, opacity 0.4s ease",
                  opacity: t.fading ? 0 : 1,
                  textAlign: "center",
                  fontSize: "0.85rem",
                  lineHeight: 1,
                }}
              >
                <div>🚆</div>
                <div style={{ fontSize: "0.6rem", opacity: 0.65, marginTop: 2, whiteSpace: "nowrap" }}>
                  {t.word}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
