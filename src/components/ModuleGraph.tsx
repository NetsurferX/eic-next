"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { MODULE_NODES, MODULE_EDGES, type ModuleGroup } from "@/lib/moduleGraphData";

/* =================================================================
   /debug/graph — force-directed dependency graph of the EiC engine
   pipeline (src/lib/**), in the spirit of an Erdős collaboration
   graph: nodes are modules, edges are imports, and node radius
   grows with the number of connections (in + out degree).

   Data comes from src/lib/moduleGraphData.ts, a hand-extracted
   snapshot of the real import statements — not live-computed, so
   this stays fast and dependency-free at runtime.
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

export default function ModuleGraph() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);

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

    nodeGroup
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

    nodeGroup
      .on("mouseenter", (_event, d) => {
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
        nodeGroup.attr("opacity", 1);
        link.attr("opacity", 0.6);
        setHoveredNote(null);
      });

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimNode).x!)
        .attr("y1", (d) => (d.source as SimNode).y!)
        .attr("x2", (d) => (d.target as SimNode).x!)
        .attr("y2", (d) => (d.target as SimNode).y!);
      nodeGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
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
    </div>
  );
}
