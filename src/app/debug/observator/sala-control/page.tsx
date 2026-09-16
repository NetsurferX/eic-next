"use client";

import { useEffect, useState } from "react";
import {
  MODULE_NODES,
  MODULE_EDGES,
  groupTotals,
  locOf,
  INCIDENTS,
  OPEN_INCIDENTS,
  CLOSED_INCIDENTS,
  PIPELINE_FUNNEL,
  PIPELINE_ENTRY_WORDS,
  PIPELINE_EXTRA_STAGE_HISTOGRAM,
  type ModuleGroup,
} from "../_repoData";
import ObservatorNav from "../_ObservatorNav";

/* =================================================================
   CONCEPT 1/3 — "Sala de control" (à la Prometheus/Grafana)
   Dashboard peste date REALE (LOC per grup, jurnal de incidente),
   NU peste telemetrie live — e un panou de "observabilitate" a
   codului însuși, ca exercițiu de familiarizare, nu un APM real.
   ================================================================= */

const GROUP_LABEL: Record<ModuleGroup, string> = {
  consumer: "consumer",
  data: "data",
  orchestrator: "orchestrator",
  "engine-core": "engine-core",
  "rule-data": "rule-data",
  overrides: "overrides",
  support: "support",
};

const GROUP_COLOR: Record<ModuleGroup, string> = {
  consumer: "#e0a458",
  data: "#b18cff",
  orchestrator: "#5aa9e6",
  "engine-core": "#7fc8f8",
  "rule-data": "#8fd694",
  overrides: "#e6c15a",
  support: "#5fd0c4",
};

const SEV_COLOR = { SEV1: "#ff5d5d", SEV2: "#ffb454", SEV3: "#8fd694" };

function fmtTime(d: Date) {
  return d.toLocaleTimeString("ro-MD", { hour12: false });
}

export default function SalaControl() {
  const totals = groupTotals();
  const groups = Object.keys(totals) as ModuleGroup[];
  const maxLoc = Math.max(...groups.map((g) => totals[g].loc));
  const totalLoc = groups.reduce((s, g) => s + totals[g].loc, 0);
  const totalFiles = MODULE_NODES.length;

  // panoul are un "ultima scanare" care se reîmprospătează — pur cosmetic,
  // datele de dedesubt sunt statice; marcat clar ca snapshot, nu telemetrie.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 4000);
    return () => clearInterval(t);
  }, []);

  const hubThreshold = 5; // fișiere cu grad >= asta sunt tratate ca "servicii critice"
  const degree = new Map<string, number>();
  for (const n of MODULE_NODES) degree.set(n.id, 0);
  // grad calculat din edges reale, la fel ca ModuleGraphGame
  for (const e of MODULE_EDGES) {
    degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
    degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
  }
  const criticalServices = MODULE_NODES.filter((n) => (degree.get(n.id) ?? 0) >= hubThreshold)
    .sort((a, b) => (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0));

  const uptimePct = Math.round((CLOSED_INCIDENTS.length / INCIDENTS.length) * 1000) / 10;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111417",
        color: "#d7dade",
        fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
        padding: "1.5rem 1.5rem 3rem",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "0.25rem" }}>
          <h1 style={{ fontSize: "1.15rem", margin: 0, letterSpacing: 0.3 }}>
            📊 eic-next / sala de control{" "}
            <span style={{ color: "#6d7480", fontWeight: 400 }}>— repo overview</span>
          </h1>
          <span style={{ fontSize: "0.75rem", color: "#6d7480" }}>
            last scrape: {now ? fmtTime(now) : "—"} · static snapshot, nu date live
          </span>
        </div>
        <ObservatorNav theme="dark" accent="#7fc8f8" />
        <p style={{ fontSize: "0.8rem", color: "#8a919c", marginTop: 0, marginBottom: "1.5rem" }}>
          toate cifrele de mai jos sunt măsurate manual pe cod (wc -l + graful de import-uri din{" "}
          <code>moduleGraphData.ts</code>), nu simulate.
        </p>

        {/* rând de stat-uri mari, stil Grafana "stat panel" */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.8rem", marginBottom: "1.4rem" }}>
          <StatPanel label="fișiere urmărite" value={String(totalFiles)} accent="#7fc8f8" />
          <StatPanel label="linii de cod (LOC)" value={totalLoc.toLocaleString("ro-MD")} accent="#8fd694" />
          <StatPanel label="incidente rezolvate" value={`${CLOSED_INCIDENTS.length} / ${INCIDENTS.length}`} accent="#8fd694" />
          <StatPanel
            label="uptime engine (glumă serioasă)"
            value={`${uptimePct}%`}
            accent={uptimePct > 80 ? "#8fd694" : "#ffb454"}
            hint="= incidente rezolvate / total incidente cunoscute"
          />
        </div>

        {/* alertă activă — cele 2 bug-uri chiar deschise azi */}
        <Panel title={`🔴 Alerte active (${OPEN_INCIDENTS.length})`}>
          {OPEN_INCIDENTS.length === 0 ? (
            <p style={{ color: "#8fd694", margin: 0 }}>Niciuna. (Nu e cazul azi.)</p>
          ) : (
            <div style={{ display: "grid", gap: "0.6rem" }}>
              {OPEN_INCIDENTS.map((inc) => (
                <div
                  key={inc.id}
                  style={{
                    border: `1px solid ${SEV_COLOR[inc.severity]}55`,
                    borderLeft: `3px solid ${SEV_COLOR[inc.severity]}`,
                    borderRadius: 6,
                    padding: "0.6rem 0.8rem",
                    background: "#181c20",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <strong>
                      {inc.id} · {inc.title}
                    </strong>
                    <span style={{ color: SEV_COLOR[inc.severity] }}>{inc.severity}</span>
                  </div>
                  <p style={{ margin: "0.3rem 0 0", fontSize: "0.78rem", color: "#a9afb8" }}>{inc.symptom}</p>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.72rem", color: "#6d7480" }}>
                    module: {inc.modules.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* bar chart LOC per grup */}
        <Panel title="LOC per grup de module">
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {groups
              .sort((a, b) => totals[b].loc - totals[a].loc)
              .map((g) => (
                <div key={g} style={{ display: "grid", gridTemplateColumns: "120px 1fr 90px", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "0.78rem", color: "#a9afb8" }}>{GROUP_LABEL[g]}</span>
                  <div style={{ background: "#1e2226", borderRadius: 4, height: 14, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${(totals[g].loc / maxLoc) * 100}%`,
                        background: GROUP_COLOR[g],
                        height: "100%",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#8a919c", textAlign: "right" }}>
                    {totals[g].loc} loc · {totals[g].files} fișiere
                  </span>
                </div>
              ))}
          </div>
        </Panel>

        {/* funnel de cost per etapă a pipeline-ului — vezi comentariul din _repoData.ts:
            NU e monoton descrescător, e afișat intenționat așa (procent din
            PIPELINE_ENTRY_WORDS pt. fiecare etapă), nu forțat într-o formă de
            pâlnie clasică — cifrele reale contează mai mult decât forma. */}
        <Panel title="📉 Funnel de cost — pipeline pe tot lexiconul (147.375 cuvinte)">
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {PIPELINE_FUNNEL.map((stage) => (
              <div
                key={stage.id}
                style={{ display: "grid", gridTemplateColumns: "160px 1fr 130px", alignItems: "center", gap: "0.6rem" }}
              >
                <span style={{ fontSize: "0.78rem", color: "#a9afb8" }}>{stage.label}</span>
                <div style={{ background: "#1e2226", borderRadius: 4, height: 14, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${stage.pct}%`,
                      background: stage.id === "entry" ? "#565c66" : "#7fc8f8",
                      height: "100%",
                    }}
                  />
                </div>
                <span style={{ fontSize: "0.75rem", color: "#8a919c", textAlign: "right" }}>
                  {stage.count.toLocaleString("ro-MD")} · {stage.pct}%
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gap: "0.3rem", marginTop: "0.9rem" }}>
            {PIPELINE_FUNNEL.map((stage) => (
              <p key={stage.id} style={{ margin: 0, fontSize: "0.72rem", color: "#6d7480" }}>
                <strong style={{ color: "#8a919c" }}>{stage.label}:</strong> {stage.note}
              </p>
            ))}
          </div>
          <p style={{ margin: "0.7rem 0 0", fontSize: "0.72rem", color: "#565c66" }}>
            Nu e o pâlnie clasică (nu scade monoton) — cele 3 etape suplimentare rulează secvențial
            în pipeline, dar declanșarea uneia nu implică declanșarea alteia. Barele arată % din
            lexicon care are nevoie de acea etapă, nu o mulțime care se restrânge succesiv.
          </p>
        </Panel>

        {/* histogramă: câte din cele 3 etape suplimentare declanșează fiecare cuvânt, simultan */}
        <Panel title="⚖️ Cost agregat per cuvânt (câte etape suplimentare, simultan)">
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {PIPELINE_EXTRA_STAGE_HISTOGRAM.map((count, i) => (
              <div
                key={i}
                style={{ display: "grid", gridTemplateColumns: "160px 1fr 130px", alignItems: "center", gap: "0.6rem" }}
              >
                <span style={{ fontSize: "0.78rem", color: "#a9afb8" }}>
                  {i} etape{i === 1 ? "" : ""} extra
                </span>
                <div style={{ background: "#1e2226", borderRadius: 4, height: 14, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${(count / PIPELINE_ENTRY_WORDS) * 100}%`,
                      background: ["#565c66", "#8fd694", "#ffb454", "#ff5d5d"][i],
                      height: "100%",
                    }}
                  />
                </div>
                <span style={{ fontSize: "0.75rem", color: "#8a919c", textAlign: "right" }}>
                  {count.toLocaleString("ro-MD")} ·{" "}
                  {(Math.round((count / PIPELINE_ENTRY_WORDS) * 1000) / 10).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
          <p style={{ margin: "0.7rem 0 0", fontSize: "0.72rem", color: "#565c66" }}>
            0 = cuvântul trece prin pipeline fără nicio ramură suplimentară declanșată (doar
            segment+align+resolveDisplay de bază). 3 = cazul cel mai scump — syllabic detection ȘI
            regex override ȘI gradient, toate pe același cuvânt ({PIPELINE_EXTRA_STAGE_HISTOGRAM[3]}{" "}
            de cuvinte în tot lexiconul).
          </p>
        </Panel>

        {/* "servicii critice" = hub-uri din graf, gamified ca uptime tiers */}
        <Panel title={`🛰 Servicii critice (grad ≥ ${hubThreshold} — cad, cade jumătate din sistem)`}>
          <div style={{ display: "grid", gap: "0.45rem" }}>
            {criticalServices.map((n) => (
              <div key={n.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                <span>
                  <span style={{ color: GROUP_COLOR[n.group] }}>●</span> {n.label}{" "}
                  <span style={{ color: "#6d7480" }}>({locOf(n.id)} loc)</span>
                </span>
                <span style={{ color: "#6d7480" }}>{degree.get(n.id)} conexiuni</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* istoric incidente rezolvate, ca un "changelog" de postmortem-uri */}
        <Panel title={`✅ Postmortems (${CLOSED_INCIDENTS.length} rezolvate)`}>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {CLOSED_INCIDENTS.map((inc) => (
              <details key={inc.id} style={{ fontSize: "0.8rem" }}>
                <summary style={{ cursor: "pointer", color: "#c9cdd3" }}>
                  {inc.id} · {inc.title}{" "}
                  <span style={{ color: SEV_COLOR[inc.severity], fontSize: "0.7rem" }}>{inc.severity}</span>
                </summary>
                <div style={{ padding: "0.4rem 0 0.2rem 1rem", color: "#8a919c" }}>
                  <p style={{ margin: "0.2rem 0" }}>
                    <strong style={{ color: "#a9afb8" }}>cauză:</strong> {inc.rootCause}
                  </p>
                  {inc.fix && (
                    <p style={{ margin: "0.2rem 0" }}>
                      <strong style={{ color: "#a9afb8" }}>fix:</strong> {inc.fix}
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>
        </Panel>

        <p style={{ fontSize: "0.72rem", color: "#565c66", marginTop: "1.5rem" }}>
          Propunere, neaplicată încă. Dacă e acceptată: fișierul{" "}
          <code>_repoData.ts</code> trebuie reactualizat manual la schimbări majore de structură
          (la fel ca <code>moduleGraphData.ts</code>) — nu se recalculează automat la build.
        </p>
      </div>
    </main>
  );
}

function StatPanel({ label, value, accent, hint }: { label: string; value: string; accent: string; hint?: string }) {
  return (
    <div style={{ background: "#181c20", border: "1px solid #262b31", borderRadius: 8, padding: "0.8rem 0.9rem" }}>
      <div style={{ fontSize: "1.5rem", color: accent, fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: "0.72rem", color: "#8a919c", marginTop: "0.15rem" }}>{label}</div>
      {hint && <div style={{ fontSize: "0.65rem", color: "#565c66", marginTop: "0.1rem" }}>{hint}</div>}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#161a1e", border: "1px solid #262b31", borderRadius: 8, padding: "1rem 1.1rem", marginBottom: "1.1rem" }}>
      <h2 style={{ fontSize: "0.85rem", margin: "0 0 0.7rem", color: "#c9cdd3", fontWeight: 600 }}>{title}</h2>
      {children}
    </div>
  );
}
