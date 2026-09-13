"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { MODULE_NODES, MODULE_EDGES, type ModuleGroup } from "@/lib/moduleGraphData";
import {
  PIPELINE_TRACE_CHANNEL,
  type PipelineStageId,
  type PipelineTraceEvent,
} from "@/lib/pipelineTrace";

/* =================================================================
   /debug/graph — LIVE module map.

   Topologia (noduri = fișiere reale, muchii = import-uri reale) vine
   tot din src/lib/moduleGraphData.ts — nu mai există o randare
   separată "statică"; graful e desenat mereu prin d3-force, iar
   evenimentele live (BroadcastChannel, emise din WordRenderer.tsx
   via src/lib/pipelineTrace.ts) aprind nodul real corespunzător
   etapei din pipeline și animă un marker care se mișcă pe traseul
   real (BFS pe muchiile de import) dintre etapa anterioară și cea
   curentă — deci "harta" e mereu aceeași hartă de cod, doar
   marker-ul se mișcă pe ea în timp real.

   Deschide /learn (sau pagina principală) în alt tab și scrie/joacă;
   graful de aici reacționează live.
   ================================================================= */

const GROUP_COLOR: Record<ModuleGroup, string> = {
  consumer: "#C77D3A",
  data: "#7A5FB0",
  orchestrator: "#2F5D8A",
  "engine-core": "#5B84AE",
  "rule-data": "#5E8C4E",
  overrides: "#B08A3E",
  support: "#4E9A94",
};

const GROUP_LABEL: Record<ModuleGroup, string> = {
  consumer: "Consumatori (UI / API)",
  data: "Boundary date (db.ts)",
  orchestrator: "Orchestrator (engine barrel)",
  "engine-core": "Engine — etape pipeline",
  "rule-data": "Date fonologice",
  overrides: "Sistem overrides",
  support: "Support",
};

// Etapă din pipelineTrace.ts -> nodul real din moduleGraphData.ts care o implementează.
const STAGE_TO_MODULE: Record<PipelineStageId, string> = {
  syllabicConsonants: "lib/engine/syllabicConsonants.ts",
  syllabicR: "lib/engine/syllabicR.ts",
  overrides: "lib/rules/overrides/apply.ts",
  resolveDisplay: "lib/engine/display.ts",
};

const SOURCE_MODULE_ID = "lib/db.ts";

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  group: ModuleGroup;
  note?: string;
  degree: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
}

// Adjacency (neorientată) pentru BFS — traseul real de execuție poate merge
// "împotriva" săgeții de import (ex: engine/index.ts -> syllabicR.ts, dar
// fluxul de rulare trece prin syllabicR pornind de la orchestrator).
function buildAdjacency(): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a)!.add(b);
  };
  for (const e of MODULE_EDGES) {
    link(e.source, e.target);
    link(e.target, e.source);
  }
  return adj;
}

function shortestPath(adj: Map<string, Set<string>>, from: string, to: string): string[] {
  if (from === to) return [from];
  const visited = new Set<string>([from]);
  const prev = new Map<string, string>();
  const queue: string[] = [from];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const next of adj.get(cur) ?? []) {
      if (visited.has(next)) continue;
      visited.add(next);
      prev.set(next, cur);
      if (next === to) {
        const path = [to];
        let n = to;
        while (prev.has(n)) {
          n = prev.get(n)!;
          path.unshift(n);
        }
        return path;
      }
      queue.push(next);
    }
  }
  return []; // fără traseu — nodurile nu sunt conectate direct/indirect
}

export default function LiveModuleGraph() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);

  const [history, setHistory] = useState<PipelineTraceEvent[]>([]);
  const [connected, setConnected] = useState(false);

  // Ref-uri "live" citite din interiorul simulației d3 fără a o reporni la fiecare eveniment.
  const activeModuleIdRef = useRef<string>(SOURCE_MODULE_ID);
  const pathModuleIdsRef = useRef<Set<string>>(new Set());
  const recentModuleAgeRef = useRef<Map<string, { age: number; changed: boolean }>>(new Map());
  const redrawOverlayRef = useRef<() => void>(() => {});

  // --- Ascultă BroadcastChannel ---
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const ch = new BroadcastChannel(PIPELINE_TRACE_CHANNEL);
    const adj = buildAdjacency();

    ch.onmessage = (ev: MessageEvent<PipelineTraceEvent>) => {
      setConnected(true);
      setHistory((prev) => [...prev, ev.data].slice(-5));

      const targetModuleId = STAGE_TO_MODULE[ev.data.stage];
      const path = shortestPath(adj, activeModuleIdRef.current, targetModuleId);

      pathModuleIdsRef.current = new Set(path);
      activeModuleIdRef.current = targetModuleId;

      const aged = new Map<string, { age: number; changed: boolean }>();
      recentModuleAgeRef.current.forEach((v, k) => aged.set(k, { age: v.age + 1, changed: v.changed }));
      aged.set(targetModuleId, { age: 0, changed: ev.data.changed });
      recentModuleAgeRef.current = aged;

      redrawOverlayRef.current();
    };
    return () => ch.close();
  }, []);

  // --- Randare d3-force (o singură dată la mount) ---
  useEffect(() => {
    const container = containerRef.current;
    const svgEl = svgRef.current;
    if (!container || !svgEl) return;

    const width = container.clientWidth;
    const height = Math.max(560, window.innerHeight - 220);

    const degree = new Map<string, number>();
    for (const e of MODULE_EDGES) {
      degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
      degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
    }

    const nodes: SimNode[] = MODULE_NODES.map((n) => ({
      ...n,
      degree: degree.get(n.id) ?? 0,
    }));
    const links: SimLink[] = MODULE_EDGES.map((e) => ({ ...e }));

    const radius = (d: SimNode) => 7 + Math.sqrt(d.degree) * 4.5;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const zoomLayer = svg.append("g");

    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on("zoom", (event) => zoomLayer.attr("transform", event.transform))
    );

    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -4 8 8")
      .attr("refX", 0)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-4L8,0L0,4")
      .attr("fill", "#c9c5bc");

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance(90)
          .strength(0.5)
      )
      .force("charge", d3.forceManyBody().strength(-260))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collide",
        d3.forceCollide<SimNode>().radius((d) => radius(d) + 14)
      );

    const link = zoomLayer
      .append("g")
      .attr("stroke", "#c9c5bc")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1.3)
      .attr("marker-end", "url(#arrow)");

    const nodeGroup = zoomLayer
      .append("g")
      .selectAll<SVGGElement, SimNode>("g")
      .data(nodes)
      .join("g")
      .style("cursor", "grab")
      .call(
        d3
          .drag<SVGGElement, SimNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.25).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // inel de puls pentru nodul activ curent (adăugat/eliminat dinamic în redrawOverlay)
    const pulseRing = nodeGroup
      .append("circle")
      .attr("class", "live-pulse")
      .attr("r", 16)
      .attr("fill", "none")
      .attr("stroke", "#2F5D8A")
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .style("pointer-events", "none");

    const circle = nodeGroup
      .append("circle")
      .attr("r", radius)
      .attr("fill", (d) => GROUP_COLOR[d.group])
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    nodeGroup
      .append("text")
      .text((d) => d.label)
      .attr("x", (d) => radius(d) + 5)
      .attr("y", 4)
      .attr("font-size", 11)
      .attr("font-family", "var(--font-sans, sans-serif)")
      .attr("fill", "#1a1917")
      .style("pointer-events", "none");

    const neighborIds = (id: string) => {
      const s = new Set<string>([id]);
      for (const e of MODULE_EDGES) {
        if (e.source === id) s.add(e.target);
        if (e.target === id) s.add(e.source);
      }
      return s;
    };

    let hoverLock = false;

    nodeGroup
      .on("mouseenter", (_event, d) => {
        hoverLock = true;
        const neighbors = neighborIds(d.id);
        nodeGroup.attr("opacity", (n) => (neighbors.has(n.id) ? 1 : 0.15));
        link.attr("opacity", (l) => {
          const s = typeof l.source === "string" ? l.source : l.source.id;
          const t = typeof l.target === "string" ? l.target : l.target.id;
          return s === d.id || t === d.id ? 0.9 : 0.05;
        });
        setHoveredNote(`${d.label}${d.note ? " — " + d.note : ""} · ${d.degree} conexiuni`);
      })
      .on("mouseleave", () => {
        hoverLock = false;
        nodeGroup.attr("opacity", 1);
        link.attr("opacity", 0.6);
        setHoveredNote(null);
        redrawOverlay();
      });

    // --- Overlay live: aplicat peste randarea de bază, fără a reporni simularea ---
    function redrawOverlay() {
      if (hoverLock) return;
      const activeId = activeModuleIdRef.current;
      const pathIds = pathModuleIdsRef.current;
      const ages = recentModuleAgeRef.current;

      circle
        .attr("fill", (d) => {
          const info = ages.get(d.id);
          if (d.id === activeId) return "#2F5D8A";
          if (info) return info.changed ? "#5E8C4E" : GROUP_COLOR[d.group];
          return GROUP_COLOR[d.group];
        })
        .attr("opacity", (d) => {
          const info = ages.get(d.id);
          if (d.id === activeId) return 1;
          if (info) return Math.max(0.45, 1 - info.age * 0.15);
          return 1;
        });

      pulseRing.style("opacity", (d) => (d.id === activeId ? 0.6 : 0));

      link
        .attr("stroke", (l) => {
          const s = typeof l.source === "string" ? l.source : l.source.id;
          const t = typeof l.target === "string" ? l.target : l.target.id;
          return pathIds.has(s) && pathIds.has(t) ? "#2F5D8A" : "#c9c5bc";
        })
        .attr("stroke-width", (l) => {
          const s = typeof l.source === "string" ? l.source : l.source.id;
          const t = typeof l.target === "string" ? l.target : l.target.id;
          return pathIds.has(s) && pathIds.has(t) ? 2.5 : 1.3;
        });
    }
    redrawOverlayRef.current = redrawOverlay;

    let pulseT = 0;
    let pulseRaf = 0;
    const animatePulse = () => {
      pulseT += 0.05;
      pulseRing.attr("r", 14 + 8 * (0.5 + 0.5 * Math.sin(pulseT)));
      pulseRaf = requestAnimationFrame(animatePulse);
    };
    animatePulse();

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimNode).x!)
        .attr("y1", (d) => (d.source as SimNode).y!)
        .attr("x2", (d) => (d.target as SimNode).x!)
        .attr("y2", (d) => (d.target as SimNode).y!);
      nodeGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      cancelAnimationFrame(pulseRaf);
      simulation.stop();
    };
  }, []);

  const current = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: "0.85rem",
          marginBottom: "0.75rem",
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
          : "deschide pagina principală (/) sau /learn în alt tab și scrie/joacă — harta se actualizează aici automat"}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem 1.25rem",
          marginBottom: "0.75rem",
          fontSize: "0.8rem",
          color: "var(--color-text-secondary, #444)",
        }}
      >
        {(Object.keys(GROUP_LABEL) as ModuleGroup[]).map((g) => (
          <span key={g} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: GROUP_COLOR[g],
                display: "inline-block",
              }}
            />
            {GROUP_LABEL[g]}
          </span>
        ))}
      </div>

      <div
        style={{
          minHeight: 24,
          marginBottom: "0.5rem",
          fontSize: "0.85rem",
          color: "var(--color-text-primary, #1a1917)",
          fontStyle: hoveredNote ? "normal" : "italic",
          opacity: hoveredNote ? 1 : 0.55,
        }}
      >
        {hoveredNote ?? "Treci cu mouse-ul peste un nod pentru detalii · trage un nod cu mouse-ul · scroll pentru zoom"}
      </div>

      <svg
        ref={svgRef}
        style={{
          width: "100%",
          background: "var(--color-surface, #f8f7f4)",
          border: "1px solid var(--color-border, #e8e6e1)",
          borderRadius: "var(--radius-lg, 20px)",
        }}
      />

      <div style={{ marginTop: "0.75rem" }}>
        <div style={{ fontSize: "0.75rem", opacity: 0.6, marginBottom: 4 }}>
          Ultimele {history.length}/5 evenimente:
        </div>
        <ol style={{ fontSize: "0.8rem", paddingLeft: "1.1rem" }}>
          {[...history].reverse().map((ev) => (
            <li key={ev.id}>
              <strong>{ev.word}</strong> · {STAGE_TO_MODULE[ev.stage].split("/").pop()} ·{" "}
              {ev.changed ? "a modificat" : "a trecut neschimbat"}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
