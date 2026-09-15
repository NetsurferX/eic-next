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

   ADĂUGAT — "Traseu optim" (Dijkstra):
   Graful e orientat (source importă target) și mic — deci Dijkstra
   aici nu e despre viteză, e despre CE ÎNSEAMNĂ "cost" între două
   parcele. Rutarea urmează strict direcția reală de import (ca
   într-un pipeline: intri prin consumer, cobori spre nucleu) — dacă
   nu există lanț de import de la A la B, spunem explicit "fără flux
   direct", pentru că exact asta e informația utilă: arată o graniță
   arhitecturală, nu doar o lipsă a algoritmului.

   Două ponderi, două întrebări diferite:
   - "cost" = LOC al parcelei în care intri → traseul cel mai ieftin
     DE CITIT/înțeles de la A la B.
   - "cost" = 1 + gradul parcelei (servitute) → traseul care evită
     hub-urile de care depind mulți alții.
   Pentru fiecare traseu găsit, semnalăm câte servituți traversează:
   0 servituți = zonă curată, bun candidat pentru o extensie izolată;
   ≥1 servitute = orice adaugi acolo moștenește cuplaj larg, ia în
   calcul un decuplare înainte de a construi peste el.
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

type CostMode = "loc" | "hub";

interface RouteResult {
  path: string[];
  cost: number;
  hubs: string[];
}

/** Dijkstra pe graful orientat MODULE_EDGES (source → target = flux real de import). */
function dijkstra(
  startId: string,
  endId: string,
  weightOf: (id: string) => number,
  outAdj: Map<string, string[]>
): RouteResult | null {
  if (startId === endId) return { path: [startId], cost: 0, hubs: [] };

  const dist = new Map<string, number>();
  const prev = new Map<string, string>();
  const visited = new Set<string>();
  for (const n of MODULE_NODES) dist.set(n.id, Infinity);
  dist.set(startId, 0);

  while (true) {
    let u: string | null = null;
    let best = Infinity;
    for (const n of MODULE_NODES) {
      if (visited.has(n.id)) continue;
      const d = dist.get(n.id) ?? Infinity;
      if (d < best) {
        best = d;
        u = n.id;
      }
    }
    if (u === null || best === Infinity) break;
    if (u === endId) break;
    visited.add(u);

    for (const v of outAdj.get(u) ?? []) {
      const cand = (dist.get(u) ?? Infinity) + weightOf(v);
      if (cand < (dist.get(v) ?? Infinity)) {
        dist.set(v, cand);
        prev.set(v, u);
      }
    }
  }

  if ((dist.get(endId) ?? Infinity) === Infinity) return null;

  const path: string[] = [endId];
  let cur = endId;
  while (cur !== startId) {
    const p = prev.get(cur);
    if (!p) return null; // n-ar trebui să se întâmple dacă dist(endId) < Infinity
    path.unshift(p);
    cur = p;
  }
  return { path, cost: dist.get(endId) ?? 0, hubs: [] };
}

export default function HartaCadastrala() {
  const [selected, setSelected] = useState<string | null>(null);
  const [fromId, setFromId] = useState<string>("");
  const [toId, setToId] = useState<string>("");
  const [costMode, setCostMode] = useState<CostMode>("loc");

  const degree = useMemo(() => {
    const d = new Map<string, number>();
    for (const n of MODULE_NODES) d.set(n.id, 0);
    for (const e of MODULE_EDGES) {
      d.set(e.source, (d.get(e.source) ?? 0) + 1);
      d.set(e.target, (d.get(e.target) ?? 0) + 1);
    }
    return d;
  }, []);

  const outAdj = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const n of MODULE_NODES) m.set(n.id, []);
    for (const e of MODULE_EDGES) {
      m.get(e.source)?.push(e.target);
    }
    return m;
  }, []);

  const route = useMemo<RouteResult | null | "no-path">(() => {
    if (!fromId || !toId) return null;
    const weightOf =
      costMode === "loc"
        ? (id: string) => Math.max(1, locOf(id))
        : (id: string) => 1 + (degree.get(id) ?? 0);
    const r = dijkstra(fromId, toId, weightOf, outAdj);
    if (!r) return "no-path";
    const hubs = r.path.filter((id) => (degree.get(id) ?? 0) >= HUB_DEGREE_THRESHOLD);
    return { ...r, hubs };
  }, [fromId, toId, costMode, degree, outAdj]);

  const routePathSet = useMemo(
    () => (route && route !== "no-path" ? new Set(route.path) : null),
    [route]
  );

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

  const sortedNodesForSelect = useMemo(
    () => MODULE_NODES.slice().sort((a, b) => a.label.localeCompare(b.label)),
    []
  );

  const selectedNode = selected ? MODULE_NODES.find((n) => n.id === selected) : null;
  const selectedNeighbors = selected ? neighborsOf(selected) : null;
  const isServitute = selected ? (degree.get(selected) ?? 0) >= HUB_DEGREE_THRESHOLD : false;

  const labelOf = (id: string) => MODULE_NODES.find((n) => n.id === id)?.label ?? id;

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

      <section
        style={{
          border: "1.5px solid var(--color-border)",
          borderRadius: 10,
          padding: "0.9rem 1.1rem",
          marginBottom: "1.4rem",
        }}
      >
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", marginTop: 0, marginBottom: "0.6rem" }}>
          Traseu optim (Dijkstra)
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", alignItems: "center", marginBottom: "0.6rem" }}>
          <select
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            style={{ fontSize: "0.8rem", padding: "0.25rem 0.4rem" }}
          >
            <option value="">de la…</option>
            {sortedNodesForSelect.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
          <span style={{ opacity: 0.5 }}>→</span>
          <select
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            style={{ fontSize: "0.8rem", padding: "0.25rem 0.4rem" }}
          >
            <option value="">spre…</option>
            {sortedNodesForSelect.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: "0.3rem", marginLeft: "0.4rem" }}>
            <button
              onClick={() => setCostMode("loc")}
              style={{
                fontSize: "0.75rem",
                padding: "0.25rem 0.5rem",
                borderRadius: 5,
                cursor: "pointer",
                border: costMode === "loc" ? "1.5px solid #2F5D8A" : "1px solid rgba(0,0,0,0.2)",
                background: costMode === "loc" ? "#eaf1f8" : "transparent",
              }}
            >
              cost: LOC
            </button>
            <button
              onClick={() => setCostMode("hub")}
              style={{
                fontSize: "0.75rem",
                padding: "0.25rem 0.5rem",
                borderRadius: 5,
                cursor: "pointer",
                border: costMode === "hub" ? "1.5px solid #6b4b1c" : "1px solid rgba(0,0,0,0.2)",
                background: costMode === "hub" ? "#fff3d6" : "transparent",
              }}
            >
              cost: evită servituți
            </button>
          </div>
        </div>

        {!fromId || !toId ? (
          <p style={{ fontSize: "0.8rem", opacity: 0.55, margin: 0 }}>
            Alege o parcelă de plecare și una de sosire. Ruta urmează direcția reală de import
            (ca într-un pipeline: intri prin consumer, cobori spre nucleu) — dacă nu există lanț
            de import în acel sens, spunem clar că nu există flux direct.
          </p>
        ) : route === "no-path" ? (
          <p
            style={{
              fontSize: "0.82rem",
              margin: 0,
              background: "#fdeceb",
              border: "1px solid #e3a49c",
              borderRadius: 6,
              padding: "0.5rem 0.7rem",
            }}
          >
            Nu există flux direct din <strong>{labelOf(fromId)}</strong> spre{" "}
            <strong>{labelOf(toId)}</strong>. Asta nu e o eroare a algoritmului — e o graniță
            arhitecturală reală: dacă vrei să legi aceste două zone, e nevoie de un seam nou
            (un import nou, deliberat), nu de o rută ascunsă care există deja.
          </p>
        ) : route ? (
          <div style={{ fontSize: "0.82rem" }}>
            <p style={{ margin: "0 0 0.4rem", lineHeight: 1.7 }}>
              {route.path.map((id, i) => (
                <span key={id}>
                  <button
                    onClick={() => setSelected(id)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: "#2F5D8A",
                      fontWeight: id === fromId || id === toId ? 700 : 400,
                      fontSize: "0.82rem",
                    }}
                  >
                    {labelOf(id)}
                  </button>
                  {i < route.path.length - 1 && <span style={{ opacity: 0.5 }}> → </span>}
                </span>
              ))}
            </p>
            <p style={{ margin: "0 0 0.4rem", opacity: 0.7 }}>
              cost total ({costMode === "loc" ? "LOC parcurs" : "servituți parcurse"}): {route.cost} ·{" "}
              {route.path.length} parcele
            </p>
            {route.hubs.length === 0 ? (
              <p
                style={{
                  margin: 0,
                  background: "#e9f6ea",
                  border: "1px solid #8fd694",
                  borderRadius: 6,
                  padding: "0.4rem 0.6rem",
                }}
              >
                ✓ Traseu curat — 0 servituți traversate. Zonă bună pentru o extensie izolată: o
                schimbare aici nu se propagă prin hub-uri partajate.
              </p>
            ) : (
              <p
                style={{
                  margin: 0,
                  background: "#fff3d6",
                  border: "1px solid #e6c15a",
                  borderRadius: 6,
                  padding: "0.4rem 0.6rem",
                }}
              >
                ⚠ Traseu prin {route.hubs.length} servitute{route.hubs.length > 1 ? "ți" : ""} (
                {route.hubs.map((id) => labelOf(id)).join(", ")}). Orice extensie construită peste
                acest traseu moștenește cuplajul larg al servituții — ia în calcul un decuplare
                înainte de a adăuga funcționalitate nouă aici.
              </p>
            )}
          </div>
        ) : null}
      </section>

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
                    const onRoute = routePathSet?.has(n.id) ?? false;
                    const routeIndex = onRoute && route && route !== "no-path" ? route.path.indexOf(n.id) : -1;
                    return (
                      <button
                        key={n.id}
                        onClick={() => setSelected(n.id)}
                        title={`${n.label} — ${loc} loc`}
                        style={{
                          position: "relative",
                          width: side,
                          height: side,
                          background: ZONE_COLOR[group] + (active ? "" : "cc"),
                          border: active
                            ? "2.5px solid #222"
                            : hub
                            ? "2px dashed #6b4b1c"
                            : "1px solid rgba(0,0,0,0.15)",
                          boxShadow: onRoute ? "0 0 0 3px #2F5D8A" : "none",
                          borderRadius: 5,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "center",
                          padding: "2px",
                        }}
                      >
                        {onRoute && (
                          <span
                            style={{
                              position: "absolute",
                              top: -8,
                              left: -8,
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              background: "#2F5D8A",
                              color: "#fff",
                              fontSize: "0.55rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              lineHeight: 1,
                            }}
                          >
                            {routeIndex + 1}
                          </span>
                        )}
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
            Chenar punctat = servitute (grad ≥ {HUB_DEGREE_THRESHOLD} — multe alte parcele depind de ea). Contur
            albastru + număr = parcelă pe traseul optim curent.
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
