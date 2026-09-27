"use client";

import { useMemo, useState } from "react";
import {
  MODULE_NODES,
  MODULE_EDGES,
  locOf,
  stageOf,
  STAGE_LABEL,
  STAGE_BADGE,
  STAGE_COLOR,
  type ModuleGroup,
} from "../../../_repoData";
import ObservatorNav from "../../../_ObservatorNav";

/* =================================================================
   IDEE pentru "Harta cadastrală" — "Sătucul cadastral"
   Aceleași date reale (MODULE_NODES / MODULE_EDGES / LOC / etapă pipeline)
   ca la /debug/observator/harta-cadastrala (neatinsă), dar organizate ca
   un sat: fiecare ZONĂ (ModuleGroup) e o ULIȚĂ, fiecare fișier e o CASĂ
   pe acea uliță (mărime ~ LOC). Acoperișul ia culoarea ulitei; ușa ia
   culoarea etapei din pipeline (al doilea canal vizual, ca banda de sus
   de la parcelele originale).

   DIFERENȚA de fond față de harta-cadastrala: acolo "vecin" înseamnă
   direct import real (MODULE_EDGES). Aici o casă are DOUĂ feluri de
   vecini, și tocmai contrastul dintre ele e ideea:
     - vecini de gard  = restul caselor de pe aceeași uliță (grupare pe
       folder / ModuleGroup — proximitate geografică/organizatorică).
     - vecini prin drum = importurile reale (ca la harta-cadastrala).
   Un fișier poate avea mulți vecini de gard cu care nu schimbă nimic
   (cuplaj geografic fals) sau un vecin prin drum aflat pe altă uliță
   (cuplaj real peste graniță de folder) — panoul lateral arată exact
   câți din vecinii de gard sunt și vecini prin drum, ca semnal rapid de
   "cât de mult contează organizarea pe foldere, de fapt".
   ================================================================= */

const STREET_ORDER: ModuleGroup[] = [
  "consumer",
  "data",
  "orchestrator",
  "engine-core",
  "rule-data",
  "overrides",
  "support",
];

const STREET_LABEL: Record<ModuleGroup, string> = {
  consumer: "Ulița Porții (consumer)",
  data: "Ulița Fântânii (frontiera de date)",
  orchestrator: "Ulița Primăriei (orchestrator)",
  "engine-core": "Ulița Morii (nucleul motorului)",
  "rule-data": "Ulița Hrisoavelor (tabele de reguli)",
  overrides: "Ulița Excepțiilor",
  support: "Ulița Meșteșugarilor (suport)",
};

// aceleași culori de zonă ca la harta-cadastrala/page.tsx — intenționat
// duplicate aici, ca pagina să rămână autonomă (nu depinde de un fișier
// _shared.ts neconfirmat încă în repo).
const STREET_COLOR: Record<ModuleGroup, string> = {
  consumer: "#e0a458",
  data: "#b18cff",
  orchestrator: "#5aa9e6",
  "engine-core": "#8fc1e0",
  "rule-data": "#8fd694",
  overrides: "#e6c15a",
  support: "#5fbfb3",
};

const HUB_DEGREE_THRESHOLD = 5;

function houseSize(loc: number): number {
  return Math.max(34, Math.min(92, Math.round(26 + Math.sqrt(loc) * 3)));
}

export default function SatucCadastral() {
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

  const streets = useMemo(() => {
    const byGroup = new Map<ModuleGroup, typeof MODULE_NODES>();
    for (const n of MODULE_NODES) {
      const arr = byGroup.get(n.group) ?? [];
      arr.push(n);
      byGroup.set(n.group, arr as typeof MODULE_NODES);
    }
    for (const arr of byGroup.values()) arr.sort((a, b) => a.label.localeCompare(b.label));
    return byGroup;
  }, []);

  const neighborsOf = (id: string) => {
    const out = MODULE_EDGES.filter((e) => e.source === id).map((e) => e.target);
    const inn = MODULE_EDGES.filter((e) => e.target === id).map((e) => e.source);
    return { trimiteSpre: out, primeȘteDe: inn };
  };

  const labelOf = (id: string) => MODULE_NODES.find((n) => n.id === id)?.label ?? id;

  const selectedNode = selected ? MODULE_NODES.find((n) => n.id === selected) : null;
  const selectedNeighbors = selected ? neighborsOf(selected) : null;
  const isServitute = selected ? (degree.get(selected) ?? 0) >= HUB_DEGREE_THRESHOLD : false;

  const gardNeighbors = useMemo(() => {
    if (!selectedNode) return [] as string[];
    return MODULE_NODES.filter((n) => n.group === selectedNode.group && n.id !== selectedNode.id).map(
      (n) => n.id
    );
  }, [selectedNode]);

  const drumNeighborSet = useMemo(() => {
    if (!selectedNeighbors) return new Set<string>();
    return new Set([...selectedNeighbors.trimiteSpre, ...selectedNeighbors.primeȘteDe]);
  }, [selectedNeighbors]);

  const overlapCount = gardNeighbors.filter((id) => drumNeighborSet.has(id)).length;
  const drumOutsideStreet = selectedNeighbors
    ? [...drumNeighborSet].filter((id) => !gardNeighbors.includes(id) && id !== selected)
    : [];

  return (
    <main className="eic-home" style={{ maxWidth: 980 }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", marginBottom: "0.25rem" }}>
        Sătucul cadastral{" "}
        <span style={{ fontSize: "0.7rem", fontWeight: 400, opacity: 0.55 }}>
          (idee — variantă pentru harta cadastrală)
        </span>
      </h1>
      <ObservatorNav theme="light" accent="#2F5D8A" />
      <p style={{ marginBottom: "1rem", opacity: 0.7, fontSize: "0.9rem" }}>
        fiecare uliță = o zonă (<code>ModuleGroup</code>); fiecare casă = un fișier, mărimea ~ LOC real.
        acoperiș = culoarea ulitei; ușă = etapa reală din pipeline. Click pe o casă pentru poarta ei —
        acolo vezi separat <strong>vecinii de gard</strong> (aceeași uliță) și{" "}
        <strong>vecinii reali prin drum</strong> (import-uri, ca la harta cadastrală).
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.2rem" }}>
        <div>
          {STREET_ORDER.map((group) => {
            const nodes = streets.get(group) ?? [];
            if (nodes.length === 0) return null;
            return (
              <div key={group} style={{ marginBottom: "1.4rem" }}>
                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "0.88rem",
                    margin: "0 0 0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: STREET_COLOR[group],
                      display: "inline-block",
                    }}
                  />
                  {STREET_LABEL[group]}
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: "0.7rem",
                    flexWrap: "wrap",
                    alignItems: "flex-end",
                    borderBottom: "2px dashed var(--color-border)",
                    paddingBottom: "0.6rem",
                  }}
                >
                  {nodes.map((n) => {
                    const size = houseSize(locOf(n.id));
                    const stage = stageOf(n.id);
                    const isHub = (degree.get(n.id) ?? 0) >= HUB_DEGREE_THRESHOLD;
                    const active = selected === n.id;
                    return (
                      <button
                        key={n.id}
                        onClick={() => setSelected(n.id)}
                        title={`${n.label} — ${locOf(n.id)} loc`}
                        style={{
                          position: "relative",
                          width: size,
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          outline: active ? "2px solid #2F5D8A" : "none",
                          outlineOffset: 3,
                          borderRadius: 4,
                        }}
                      >
                        {/* acoperiș — culoarea ulitei */}
                        <div
                          style={{
                            width: 0,
                            height: 0,
                            borderLeft: `${size / 2}px solid transparent`,
                            borderRight: `${size / 2}px solid transparent`,
                            borderBottom: `${Math.round(size * 0.5)}px solid ${STREET_COLOR[group]}`,
                          }}
                        />
                        {/* corpul casei */}
                        <div
                          style={{
                            position: "relative",
                            width: Math.round(size * 0.86),
                            height: Math.max(20, Math.round(size * 0.55)),
                            background: "#f6f0e2",
                            border: `1.5px ${isHub ? "dashed" : "solid"} ${isHub ? "#c0392b" : "#8a7a5c"}`,
                            borderTop: "none",
                            borderRadius: "0 0 3px 3px",
                          }}
                        >
                          {/* ușă — culoarea etapei din pipeline */}
                          <span
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: Math.max(6, Math.round(size * 0.16)),
                              height: "70%",
                              background: STAGE_COLOR[stage],
                              borderRadius: "2px 2px 0 0",
                            }}
                          />
                          {/* insignă etapă, colț dreapta-sus */}
                          <span
                            style={{
                              position: "absolute",
                              top: -7,
                              right: -6,
                              minWidth: 15,
                              height: 13,
                              padding: "0 3px",
                              borderRadius: 4,
                              background: STAGE_COLOR[stage],
                              color: "#fff",
                              fontSize: "0.48rem",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              lineHeight: 1,
                            }}
                          >
                            {STAGE_BADGE[stage]}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.52rem", opacity: 0.6, marginTop: 2 }}>
                          {locOf(n.id)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <p style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "0.3rem" }}>
            Chenar punctat roșu = servitute (grad ≥ {HUB_DEGREE_THRESHOLD} — mulți vecini prin drum
            depind de ea). Acoperiș = uliță/zonă. Ușă + insignă = etapa reală din pipeline.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.6rem",
              marginTop: "0.5rem",
              fontSize: "0.72rem",
              opacity: 0.8,
            }}
          >
            {(Object.keys(STAGE_LABEL) as (keyof typeof STAGE_LABEL)[]).map((stage) => (
              <span key={stage} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: 3,
                    background: STAGE_COLOR[stage],
                    color: "#fff",
                    fontSize: "0.48rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  {STAGE_BADGE[stage]}
                </span>
                {STAGE_LABEL[stage]}
              </span>
            ))}
          </div>
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
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", marginTop: 0 }}>
            Poarta gospodăriei
          </h3>
          {!selectedNode ? (
            <p style={{ fontSize: "0.85rem", opacity: 0.6 }}>Alege o casă din sat.</p>
          ) : (
            <div style={{ fontSize: "0.85rem" }}>
              <p style={{ margin: "0 0 0.4rem" }}>
                <strong>{selectedNode.label}</strong>
              </p>
              <p style={{ margin: "0 0 0.4rem", opacity: 0.7 }}>
                uliță: {STREET_LABEL[selectedNode.group]}
                <br />
                suprafață: {locOf(selectedNode.id)} loc
                <br />
                etapă procesare: {STAGE_LABEL[stageOf(selectedNode.id)]}
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
                  ⚠ Servitute activă — {degree.get(selectedNode.id)} conexiuni prin drum. Mulți vecini
                  depind de trecerea pe-aici.
                </p>
              )}

              <p
                style={{
                  margin: "0.6rem 0 0.3rem",
                  fontSize: "0.78rem",
                  background: "var(--color-border-soft)",
                  borderRadius: 6,
                  padding: "0.4rem 0.55rem",
                }}
              >
                {gardNeighbors.length} vecini de gard pe uliță, din care{" "}
                <strong>{overlapCount}</strong> sunt și vecini reali prin drum
                {drumOutsideStreet.length > 0 && (
                  <>
                    ; plus <strong>{drumOutsideStreet.length}</strong> vecin(i) prin drum de pe altă
                    uliță
                  </>
                )}
                .
              </p>

              <p style={{ margin: "0.5rem 0 0.15rem", fontWeight: 600 }}>trimite pe drum spre:</p>
              {selectedNeighbors!.trimiteSpre.length === 0 ? (
                <p style={{ margin: 0, opacity: 0.5 }}>— (nu importă nimic din ce urmărim aici)</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                  {selectedNeighbors!.trimiteSpre.map((id) => (
                    <li key={id}>
                      <button
                        onClick={() => setSelected(id)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          color: "#2F5D8A",
                          fontSize: "0.82rem",
                        }}
                      >
                        {labelOf(id)}
                      </button>
                      {gardNeighbors.includes(id) ? " (și vecin de gard)" : " (altă uliță)"}
                    </li>
                  ))}
                </ul>
              )}

              <p style={{ margin: "0.5rem 0 0.15rem", fontWeight: 600 }}>primește pe drum de la:</p>
              {selectedNeighbors!.primeȘteDe.length === 0 ? (
                <p style={{ margin: 0, opacity: 0.5 }}>— (nimeni, din ce urmărim aici)</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                  {selectedNeighbors!.primeȘteDe.map((id) => (
                    <li key={id}>
                      <button
                        onClick={() => setSelected(id)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          color: "#2F5D8A",
                          fontSize: "0.82rem",
                        }}
                      >
                        {labelOf(id)}
                      </button>
                      {gardNeighbors.includes(id) ? " (și vecin de gard)" : " (altă uliță)"}
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
