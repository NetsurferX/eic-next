"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MODULE_NODES, MODULE_EDGES, locOf, type ModuleGroup } from "../_repoData";

/* =================================================================
   CONCEPT 2/3 — "Harta cadastrală"
   Metafora: fiecare fișier urmărit în moduleGraphData.ts e o PARCELĂ
   (mărime ~ LOC), grupată în ZONE (= ModuleGroup). Click pe o parcelă
   deschide o "carte funciară" cu rolul fișierului + vecinii reali
   (import-uri, din MODULE_EDGES) + dacă e "servitute" (hub de care
   depind multe alte parcele — nu poți demola fără să afectezi restul).
   ================================================================= */

const ZONE_LABEL: Record<ModuleGroup, string> = {
  consumer: "Zona A — Intrări (consumer)",
  data: "Zona B — Frontiera de date",
  orchestrator: "Zona C — Orchestrator",
  "engine-core": "Zona D — Nucleul motorului",
  "rule-data": "Zona E — Tabele de reguli",
  overrides: "Zona F — Excepții punctuale",
  support: "Zona G — Suport",
};

const ZONE_COLOR: Record<ModuleGroup, string> = {
  consumer: "#e0a458",
  data: "#b18cff",
  orchestrator: "#5aa9e6",
  "engine-core": "#8fc1e0",
  "rule-data": "#8fd694",
  overrides: "#e6c15a",
  support: "#5fbfb3",
};

const HUB_DEGREE_THRESHOLD = 5;

export default function HartaCadastrala() {
  const [selected, setSelected] = useState<string | null>(null);

  const degree = useMemo(() => {
    const d = new Map<string, number>();
    for (const n of MODULE_NODES) d.set(n.id, 0);
    for (const e of MODULE_EDGES) {
      d.set(e.source, (d.get(e.source) ?? 0) + 1);
      d.set(e.target, (d.get(e.target) ?? 0) + 1);
    }
    return d;
  }, []);

  const neighborsOf = (id: string) => {
    const out = MODULE_EDGES.filter((e) => e.source === id).map((e) => e.target);
    const inn = MODULE_EDGES.filter((e) => e.target === id).map((e) => e.source);
    return { importă: out, importat_de: inn };
  };

  const zones = useMemo(() => {
    const byGroup = new Map<ModuleGroup, typeof MODULE_NODES>();
    for (const n of MODULE_NODES) {
      const arr = byGroup.get(n.group) ?? [];
      arr.push(n);
      byGroup.set(n.group, arr as typeof MODULE_NODES);
    }
    return byGroup;
  }, []);

  const selectedNode = selected ? MODULE_NODES.find((n) => n.id === selected) : null;
  const selectedNeighbors = selected ? neighborsOf(selected) : null;
  const isServitute = selected ? (degree.get(selected) ?? 0) >= HUB_DEGREE_THRESHOLD : false;

  return (
    <main className="eic-home" style={{ maxWidth: 980 }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", marginBottom: "0.25rem" }}>
        Harta cadastrală a repo-ului
      </h1>
      <p style={{ marginBottom: "1rem", opacity: 0.7, fontSize: "0.9rem" }}>
        <Link href="/debug/observator">← alte concepte</Link> · fiecare pătrat e o parcelă (fișier);
        mărimea e proporțională cu LOC real, culoarea e zona (grupul din <code>moduleGraphData.ts</code>).
        Click pe o parcelă pentru cartea funciară.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" }}>
        <div>
          {Array.from(zones.entries()).map(([group, nodes]) => (
            <div key={group} style={{ marginBottom: "1.4rem" }}>
              <h2
                style={{
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-serif)",
                  marginBottom: "0.5rem",
                  color: ZONE_COLOR[group],
                }}
              >
                {ZONE_LABEL[group]} <span style={{ opacity: 0.6, fontWeight: 400 }}>({nodes.length} parcele)</span>
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {nodes
                  .slice()
                  .sort((a, b) => locOf(b.id) - locOf(a.id))
                  .map((n) => {
                    const loc = locOf(n.id);
                    const side = 34 + Math.min(56, Math.round(loc / 10));
                    const hub = (degree.get(n.id) ?? 0) >= HUB_DEGREE_THRESHOLD;
                    const active = selected === n.id;
                    return (
                      <button
                        key={n.id}
                        onClick={() => setSelected(n.id)}
                        title={`${n.label} — ${loc} loc`}
                        style={{
                          width: side,
                          height: side,
                          background: ZONE_COLOR[group] + (active ? "" : "cc"),
                          border: active ? "2.5px solid #222" : hub ? "2px dashed #6b4b1c" : "1px solid rgba(0,0,0,0.15)",
                          borderRadius: 5,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "center",
                          padding: "2px",
                        }}
                      >
                        <span style={{ fontSize: "0.55rem", color: "#1c1c1c", opacity: 0.75, lineHeight: 1 }}>
                          {loc}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
          <p style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "0.5rem" }}>
            Chenar punctat = servitute (grad ≥ {HUB_DEGREE_THRESHOLD} — multe alte parcele depind de ea).
          </p>
        </div>

        <aside
          style={{
            border: "1.5px solid var(--color-border)",
            borderRadius: 10,
            padding: "1rem 1.1rem",
            position: "sticky",
            top: 16,
            minHeight: 260,
          }}
        >
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", marginTop: 0 }}>Carte funciară</h3>
          {!selectedNode ? (
            <p style={{ fontSize: "0.85rem", opacity: 0.6 }}>Alege o parcelă din hartă.</p>
          ) : (
            <div style={{ fontSize: "0.85rem" }}>
              <p style={{ margin: "0 0 0.4rem" }}>
                <strong>{selectedNode.label}</strong>
              </p>
              <p style={{ margin: "0 0 0.4rem", opacity: 0.7 }}>
                zonă: {ZONE_LABEL[selectedNode.group]}
                <br />
                suprafață: {locOf(selectedNode.id)} loc
                {selectedNode.note && (
                  <>
                    <br />
                    destinație: {selectedNode.note}
                  </>
                )}
              </p>
              {isServitute && (
                <p
                  style={{
                    background: "#fff3d6",
                    border: "1px solid #e6c15a",
                    borderRadius: 6,
                    padding: "0.4rem 0.6rem",
                    fontSize: "0.78rem",
                    margin: "0.4rem 0",
                  }}
                >
                  ⚠ Servitute activă — {degree.get(selectedNode.id)} conexiuni. O modificare aici se propagă
                  larg; tratează ca refactor cu grijă, nu ca fix punctual.
                </p>
              )}
              <p style={{ margin: "0.5rem 0 0.15rem", fontWeight: 600 }}>importă:</p>
              {selectedNeighbors!.importă.length === 0 ? (
                <p style={{ margin: 0, opacity: 0.5 }}>— (frunză, nu importă nimic din grafic)</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                  {selectedNeighbors!.importă.map((id) => (
                    <li key={id}>
                      <button
                        onClick={() => setSelected(id)}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#2F5D8A", fontSize: "0.82rem" }}
                      >
                        {MODULE_NODES.find((n) => n.id === id)?.label ?? id}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p style={{ margin: "0.5rem 0 0.15rem", fontWeight: 600 }}>importat de:</p>
              {selectedNeighbors!.importat_de.length === 0 ? (
                <p style={{ margin: 0, opacity: 0.5 }}>— (nimeni, din ce urmărim aici)</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                  {selectedNeighbors!.importat_de.map((id) => (
                    <li key={id}>
                      <button
                        onClick={() => setSelected(id)}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#2F5D8A", fontSize: "0.82rem" }}
                      >
                        {MODULE_NODES.find((n) => n.id === id)?.label ?? id}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
