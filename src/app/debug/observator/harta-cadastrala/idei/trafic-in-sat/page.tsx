"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MODULE_NODES,
  MODULE_EDGES,
  locOf,
  stageOf,
  STAGE_COLOR,
  type ModuleGroup,
} from "../../../_repoData";
import ObservatorNav from "../../../_ObservatorNav";
import {
  PIPELINE_TRACE_CHANNEL,
  type PipelineStageId,
  type PipelineTraceEvent,
} from "@/lib/pipelineTrace";

/* =================================================================
   IDEE pentru "Harta cadastrală" — "Trafic în sat"
   Același sat ca la "Sătucul cadastral" (parcele cu hotare comune,
   drumuri curbate, aceleași date reale), dar cu o CĂRUȚĂ care duce
   un cuvânt prin pipeline-ul real, pe DRUMURI — nu în linie dreaptă:
     casă -> uliță -> drumul mare -> uliță -> casă.

   Traseul dintre etape e cel real: BFS pe muchiile de import
   (MODULE_EDGES), ca la /debug/graph. Căruța se oprește în fiecare
   parcelă pe care o traversează: "trece prin" (scurt) sau "lucrează"
   (lung, cu explicație) pentru cele 4 etape din pipelineTrace.ts.

   Două moduri:
   - Demonstrație: alegi un cuvânt, căruța face tot traseul, lent.
     Steagurile "a modificat / a trecut neschimbat" sunt SIMULATE.
   - Live: ascultă read-only PIPELINE_TRACE_CHANNEL (evenimente reale
     de la WordRenderer, de ex. din /learn într-un alt tab) și le pune
     la coadă, ca fiecare să se vadă.
   Control: pauză, pas cu pas, viteză 0.5× / 1× / 2×.
   Nu modifică nimic din motor; nu emite nimic pe canal.
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

const STREET_SHORT: Record<ModuleGroup, string> = {
  consumer: "Ulița Porții",
  data: "Ulița Fântânii",
  orchestrator: "Ulița Primăriei",
  "engine-core": "Ulița Morii",
  "rule-data": "Ulița Hrisoavelor",
  overrides: "Ulița Excepțiilor",
  support: "Ulița Meșteșugarilor",
};

const STREET_COLOR: Record<ModuleGroup, string> = {
  consumer: "#e0a458",
  data: "#b18cff",
  orchestrator: "#5aa9e6",
  "engine-core": "#8fc1e0",
  "rule-data": "#8fd694",
  overrides: "#e6c15a",
  support: "#5fbfb3",
};

// Etapă din pipelineTrace.ts -> modulul real care o implementează (ca la LiveModuleGraph).
const STAGE_TO_MODULE: Record<PipelineStageId, string> = {
  syllabicConsonants: "lib/engine/syllabicConsonants.ts",
  syllabicR: "lib/engine/syllabicR.ts",
  overrides: "lib/rules/overrides/apply.ts",
  resolveDisplay: "lib/engine/display.ts",
};
const STAGE_ORDER: PipelineStageId[] = ["syllabicConsonants", "syllabicR", "overrides", "resolveDisplay"];
const STAGE_LABEL: Record<PipelineStageId, string> = {
  syllabicConsonants: "consoane silabice",
  syllabicR: "r silabic",
  overrides: "overrides (reguli per cuvânt)",
  resolveDisplay: "afișare finală",
};
const STAGE_NOTE: Record<PipelineStageId, string> = {
  syllabicConsonants: "caută consoane silabice (l̩, m̩…) după schwa gol",
  syllabicR: "caută „r” silabic (NEAR, CARE, FIRE…)",
  overrides: "aplică regulile regex per cuvânt",
  resolveDisplay: "rezolvă culoarea, diacritica și sublinierea finale",
};
const DB_ID = "lib/db.ts";

// Demonstrație: steaguri SIMULATE (nu vin din motor) — doar ca să se vadă ambele situații.
const DEMO_WORDS: { word: string; changed: [boolean, boolean, boolean, boolean] }[] = [
  { word: "bottle", changed: [true, false, false, true] },
  { word: "worker", changed: [false, true, false, true] },
  { word: "though", changed: [false, false, true, true] },
  { word: "cat", changed: [false, false, false, true] },
];

/* ---------- geometrie sat (aceeași ca la "Sătucul cadastral") ---------- */

const D = 66;
const R = 9;
const S = 2 * (R + D);
const MARGIN = 28;
const MAIN_Y = 30;
const MAIN_H = 26;
const Y_TOP = MAIN_Y + MAIN_H / 2;
const WARP_DY = 10;
const WARP_DX = 7;
const ROAD_FILL = "#d9d0b6";
const ROAD_EDGE = "#b3a680";
const FENCE = "#8a7a5c";

type Side = "L" | "R";
type VNode = (typeof MODULE_NODES)[number];

function warp(x: number, y: number): [number, number] {
  return [x + WARP_DX * Math.sin(y / 118), y + WARP_DY * Math.sin(x / 165)];
}
const pts = (arr: [number, number][]) => arr.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

function roadPath(x1: number, y1: number, x2: number, y2: number): string {
  const n = Math.max(2, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 8));
  const out: string[] = [];
  for (let i = 0; i <= n; i++) {
    const [x, y] = warp(x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n);
    out.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return out.join(" ");
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function frontLen(loc: number): number {
  return Math.max(42, Math.min(104, Math.round(30 + Math.sqrt(loc) * 3.6)));
}

interface Parcel {
  id: string;
  label: string;
  group: ModuleGroup;
  loc: number;
  s: 1 | -1;
  front: number;
  rear: number;
  y0: number;
  y1: number;
  poly: string;
  rawCy: number;
  ox: number;
  oy: number;
  xs: number; // axa ulitei parcelei
}
interface StreetInfo {
  group: ModuleGroup;
  xs: number;
  yEnd: number;
}

function buildVillage() {
  const groups = STREET_ORDER.filter((g) => MODULE_NODES.some((n) => n.group === g));
  const parcels: Parcel[] = [];
  const streets: StreetInfo[] = [];

  groups.forEach((group, k) => {
    const xs = MARGIN + R + D + k * S;
    const nodes: VNode[] = MODULE_NODES.filter((n) => n.group === group)
      .slice()
      .sort((a, b) => locOf(b.id) - locOf(a.id) || a.label.localeCompare(b.label));
    const rows: Record<Side, VNode[]> = { R: [], L: [] };
    const len: Record<Side, number> = { R: 0, L: 0 };
    for (const n of nodes) {
      const side: Side = len.R <= len.L ? "R" : "L";
      rows[side].push(n);
      len[side] += frontLen(locOf(n.id));
    }
    let yEnd = Y_TOP;
    (["R", "L"] as Side[]).forEach((side) => {
      const s: 1 | -1 = side === "R" ? 1 : -1;
      const front = xs + s * R;
      const rear = xs + s * (R + D);
      const list = rows[side];
      const ys: number[] = [Y_TOP];
      for (const n of list) ys.push(ys[ys.length - 1] + frontLen(locOf(n.id)));
      const jit = ys.map((_, i) =>
        i === 0 || i === ys.length - 1 ? 0 : ((hash(`${group}${side}${i}`) % 11) - 5) * 1.4
      );
      list.forEach((n, i) => {
        const ya = ys[i];
        const yb = ys[i + 1];
        const rawCy = (ya + yb) / 2;
        const [wx, wy] = warp((front + rear) / 2, rawCy);
        parcels.push({
          id: n.id,
          label: n.label,
          group,
          loc: locOf(n.id),
          s,
          front,
          rear,
          y0: ya,
          y1: yb,
          poly: pts([
            warp(front, ya),
            warp(front, yb),
            warp(rear, yb + jit[i + 1]),
            warp(rear, ya + jit[i]),
          ]),
          rawCy,
          ox: wx - (front + rear) / 2,
          oy: wy - rawCy,
          xs,
        });
      });
      yEnd = Math.max(yEnd, ys[ys.length - 1]);
    });
    streets.push({ group, xs, yEnd });
  });

  return {
    parcels,
    streets,
    width: MARGIN * 2 + groups.length * S + WARP_DX * 2,
    height: Math.max(...streets.map((st) => st.yEnd)) + 46 + WARP_DY,
  };
}
const VILLAGE = buildVillage();
const PARCEL_BY_ID = new Map(VILLAGE.parcels.map((p) => [p.id, p]));

function houseGeometry(p: Parcel) {
  const setback = 9;
  const hd = Math.max(16, Math.min(32, 14 + Math.sqrt(p.loc) * 0.9));
  const hl = Math.min(p.y1 - p.y0 - 14, Math.max(20, Math.min(44, 16 + Math.sqrt(p.loc) * 1.3)));
  const x = p.s === 1 ? p.front + setback : p.front - setback - hd;
  const y = p.rawCy - hl / 2;
  return { x, y, w: hd, h: hl };
}

/* ---------- drumul căruței: pe drumuri reale ---------- */

interface Road {
  pts: [number, number][]; // deja deformate (coordonate de ecran)
  cum: number[];
  total: number;
}

function roadBetween(a: Parcel, b: Parcel): Road {
  const raw: [number, number][] = [[a.xs, a.rawCy]];
  if (a.group !== b.group) {
    raw.push([a.xs, MAIN_Y], [b.xs, MAIN_Y]);
  }
  raw.push([b.xs, b.rawCy]);
  const out: [number, number][] = [];
  for (let i = 0; i < raw.length - 1; i++) {
    const [x1, y1] = raw[i];
    const [x2, y2] = raw[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 6));
    for (let j = i === 0 ? 0 : 1; j <= n; j++) {
      out.push(warp(x1 + ((x2 - x1) * j) / n, y1 + ((y2 - y1) * j) / n));
    }
  }
  const cum: number[] = [0];
  for (let i = 1; i < out.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  }
  return { pts: out, cum, total: cum[cum.length - 1] ?? 0 };
}

function streetPoint(p: Parcel): [number, number] {
  return warp(p.xs, p.rawCy);
}

function pointAt(road: Road, d: number): { x: number; y: number; angle: number } {
  const { pts: P, cum } = road;
  if (P.length === 0) return { x: 0, y: 0, angle: 0 };
  let i = 1;
  while (i < P.length - 1 && cum[i] < d) i++;
  const a = P[i - 1] ?? P[0];
  const b = P[i] ?? P[0];
  const seg = (cum[i] ?? 0) - (cum[i - 1] ?? 0) || 1;
  const t = Math.max(0, Math.min(1, (d - (cum[i - 1] ?? 0)) / seg));
  return {
    x: a[0] + (b[0] - a[0]) * t,
    y: a[1] + (b[1] - a[1]) * t,
    angle: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI,
  };
}

/* ---------- BFS pe importuri reale (neorientat, ca la LiveModuleGraph) ---------- */

const ADJ: Map<string, Set<string>> = (() => {
  const m = new Map<string, Set<string>>();
  for (const n of MODULE_NODES) m.set(n.id, new Set());
  for (const e of MODULE_EDGES) {
    m.get(e.source)?.add(e.target);
    m.get(e.target)?.add(e.source);
  }
  return m;
})();

function shortestPath(from: string, to: string): string[] {
  if (from === to) return [from];
  const prev = new Map<string, string>();
  const seen = new Set<string>([from]);
  const q: string[] = [from];
  while (q.length) {
    const cur = q.shift() as string;
    for (const nx of ADJ.get(cur) ?? []) {
      if (seen.has(nx)) continue;
      seen.add(nx);
      prev.set(nx, cur);
      if (nx === to) {
        const path = [to];
        let n = to;
        while (prev.has(n)) {
          n = prev.get(n) as string;
          path.unshift(n);
        }
        return path;
      }
      q.push(nx);
    }
  }
  return [];
}

/* ---------- opriri ale căruței ---------- */

type StopKind = "start" | "pass" | "work";
interface Stop {
  seq: number;
  id: string;
  kind: StopKind;
  word: string;
  stage?: PipelineStageId;
  changed?: boolean;
  stageNo?: number;
}

const SPEED_PX = 55; // px/s la 1× — intenționat lent
const DWELL_MS: Record<StopKind, number> = { start: 1500, pass: 750, work: 2400 };
const labelOf = (id: string) => MODULE_NODES.find((n) => n.id === id)?.label ?? id;

function captionOf(s: Stop): string {
  if (s.kind === "start") return `„${s.word}” pleacă din Fântână (db.ts) — de acolo vin cuvintele.`;
  if (s.kind === "pass")
    return `Trece prin ${labelOf(s.id)} — un import real pe drumul de cod, nu o etapă.`;
  const st = s.stage as PipelineStageId;
  return `Etapa ${s.stageNo}/4 · ${STAGE_LABEL[st]}: ${STAGE_NOTE[st]}. ${
    s.changed ? "A MODIFICAT nodurile cuvântului." : "A trecut neschimbat."
  }`;
}

interface Ui {
  activeId: string | null;
  phase: "idle" | "move" | "dwell" | "wait";
  seq: number;
  visited: Record<string, StopKind>;
  legPath: string;
  caption: string;
}
const UI0: Ui = { activeId: DB_ID, phase: "idle", seq: 0, visited: {}, legPath: "", caption: "" };

/* ---------- monumente (aceleași ca la "Sătucul cadastral") ---------- */

type LandmarkKind = "fantana" | "primarie" | "biserica" | "moara" | "troita";
const LANDMARK_OF: Record<string, LandmarkKind> = {
  "lib/db.ts": "fantana",
  "lib/engine/index.ts": "primarie",
  "lib/rules/colors.ts": "biserica",
  "lib/engine/types.ts": "moara",
  "lib/rules/overrides/index.ts": "troita",
};
function Landmark({ kind }: { kind: LandmarkKind }) {
  const ink = "#4a3b22";
  switch (kind) {
    case "fantana":
      return (
        <g>
          <circle r={7} fill="#cfe3ee" stroke={ink} strokeWidth={1.2} />
          <circle r={3.6} fill="#5aa9e6" stroke={ink} strokeWidth={0.7} />
          <line x1={-7} y1={0} x2={7} y2={0} stroke={ink} strokeWidth={0.8} />
        </g>
      );
    case "primarie":
      return (
        <g>
          <rect x={-8} y={-6} width={16} height={12} rx={1.5} fill="#f2e6c8" stroke={ink} strokeWidth={1.1} />
          <polygon points="-9,-6 0,-11 9,-6" fill="#5aa9e6" stroke={ink} strokeWidth={1} />
          <line x1={0} y1={-11} x2={0} y2={-16} stroke={ink} strokeWidth={0.9} />
          <polygon points="0,-16 6,-14.5 0,-13" fill="#c0392b" />
        </g>
      );
    case "biserica":
      return (
        <g>
          <rect x={-6} y={-3} width={12} height={9} fill="#f6efe0" stroke={ink} strokeWidth={1.1} />
          <polygon points="-7,-3 0,-9 7,-3" fill="#8fd694" stroke={ink} strokeWidth={1} />
          <line x1={0} y1={-9} x2={0} y2={-15} stroke={ink} strokeWidth={0.9} />
          <line x1={-2.4} y1={-12.6} x2={2.4} y2={-12.6} stroke={ink} strokeWidth={0.9} />
        </g>
      );
    case "moara":
      return (
        <g>
          <polygon points="-5,6 5,6 3,-4 -3,-4" fill="#efe3c6" stroke={ink} strokeWidth={1.1} />
          <g stroke={ink} strokeWidth={1.4} strokeLinecap="round">
            <line x1={-9} y1={-9} x2={9} y2={1} />
            <line x1={9} y1={-9} x2={-9} y2={1} />
          </g>
          <circle cx={0} cy={-4} r={1.6} fill={ink} />
        </g>
      );
    case "troita":
      return (
        <g>
          <rect x={-2} y={-8} width={4} height={14} fill="#e6c15a" stroke={ink} strokeWidth={0.9} />
          <rect x={-5.5} y={-5.5} width={11} height={3.4} fill="#e6c15a" stroke={ink} strokeWidth={0.9} />
        </g>
      );
  }
}

/* ---------- pagina ---------- */

type Mode = "demo" | "live";

const btn = (active = false, disabled = false) =>
  ({
    padding: "0.3rem 0.75rem",
    borderRadius: 999,
    border: `1.5px solid ${active ? "#2F5D8A" : "var(--color-border)"}`,
    background: active ? "#2F5D8A" : "transparent",
    color: active ? "#fff" : "inherit",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    fontSize: "0.82rem",
  }) as const;

export default function TraficInSat() {
  const [mode, setMode] = useState<Mode>("demo");
  const [demoIdx, setDemoIdx] = useState(0);
  const [paused, setPaused] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [stepMode, setStepMode] = useState(false);
  const [ui, setUi] = useState<Ui>(UI0);
  const [plan, setPlan] = useState<Stop[]>([]);
  const [pending, setPending] = useState(0);
  const [liveSeen, setLiveSeen] = useState(false);

  // stare "vie" pentru bucla de animație (nu declanșează render)
  const queueRef = useRef<Stop[]>([]);
  const curRef = useRef<{ stop: Stop; road: Road; dist: number; phase: "move" | "dwell"; dwell: number } | null>(
    null
  );
  const posIdRef = useRef<string>(DB_ID);
  const lastWordRef = useRef<string>("");
  const lastModuleRef = useRef<string>(DB_ID);
  const seqRef = useRef(0);
  const pausedRef = useRef(true);
  const speedRef = useRef(1);
  const stepRef = useRef(false);
  const waitRef = useRef(false);
  const modeRef = useRef<Mode>("demo");
  const cartRef = useRef<SVGGElement | null>(null);
  const wagonRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  useEffect(() => {
    stepRef.current = stepMode;
  }, [stepMode]);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const placeCart = useCallback((id: string) => {
    const p = PARCEL_BY_ID.get(id);
    if (!p || !cartRef.current) return;
    const [x, y] = streetPoint(p);
    cartRef.current.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  }, []);

  useEffect(() => {
    placeCart(DB_ID);
  }, [placeCart]);

  const resetRun = useCallback(() => {
    queueRef.current = [];
    curRef.current = null;
    posIdRef.current = DB_ID;
    lastWordRef.current = "";
    lastModuleRef.current = DB_ID;
    waitRef.current = false;
    setPlan([]);
    setPending(0);
    setUi({ ...UI0, caption: "" });
    placeCart(DB_ID);
  }, [placeCart]);

  /** un eveniment de etapă -> opriri (cu drum real prin importuri) */
  const enqueueEvent = useCallback((word: string, stage: PipelineStageId, changed: boolean) => {
    const stops: Stop[] = [];
    const stageNo = STAGE_ORDER.indexOf(stage) + 1;
    if (lastWordRef.current !== word) {
      lastWordRef.current = word;
      stops.push({ seq: ++seqRef.current, id: DB_ID, kind: "start", word });
      lastModuleRef.current = DB_ID;
    }
    const target = STAGE_TO_MODULE[stage];
    if (!PARCEL_BY_ID.has(target)) return;
    const path = shortestPath(lastModuleRef.current, target);
    const hops = path.length > 1 ? path.slice(1) : [target];
    hops.forEach((id, i) => {
      const last = i === hops.length - 1;
      stops.push({
        seq: ++seqRef.current,
        id,
        kind: last ? "work" : "pass",
        word,
        stage: last ? stage : undefined,
        changed: last ? changed : undefined,
        stageNo: last ? stageNo : undefined,
      });
    });
    lastModuleRef.current = target;
    queueRef.current.push(...stops);
    setPlan((prev) => [...prev, ...stops].slice(-40));
    setPending(queueRef.current.length);
  }, []);

  const runDemo = useCallback(
    (idx: number) => {
      resetRun();
      const d = DEMO_WORDS[idx];
      STAGE_ORDER.forEach((st, i) => enqueueEvent(d.word, st, d.changed[i]));
      setPaused(false);
    },
    [resetRun, enqueueEvent]
  );

  // --- bucla de animație (o singură dată) ---
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (!pausedRef.current && !waitRef.current) {
        let cur = curRef.current;
        if (!cur) {
          const next = queueRef.current.shift();
          if (next) {
            setPending(queueRef.current.length);
            const from = PARCEL_BY_ID.get(posIdRef.current);
            const to = PARCEL_BY_ID.get(next.id);
            if (from && to) {
              const road = from.id === to.id ? { pts: [], cum: [0], total: 0 } : roadBetween(from, to);
              cur = { stop: next, road, dist: 0, phase: road.total > 0 ? "move" : "dwell", dwell: 0 };
              if (cur.phase === "dwell") cur.dwell = DWELL_MS[next.kind] / 1000;
              curRef.current = cur;
              const legPath = road.pts.length
                ? road.pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
                : "";
              setUi((u) => ({
                ...u,
                phase: cur!.phase,
                activeId: cur!.phase === "dwell" ? next.id : u.activeId,
                seq: next.seq,
                legPath,
                caption: cur!.phase === "dwell" ? captionOf(next) : `Merge spre ${labelOf(next.id)}…`,
                visited: cur!.phase === "dwell" ? { ...u.visited, [next.id]: next.kind } : u.visited,
              }));
            }
          } else if (modeRef.current === "demo" && !queueRef.current.length) {
            setUi((u) => (u.phase === "idle" ? u : { ...u, phase: "idle", legPath: "" }));
          }
        }
        if (cur) {
          if (cur.phase === "move") {
            cur.dist = Math.min(cur.road.total, cur.dist + SPEED_PX * speedRef.current * dt);
            const p = pointAt(cur.road, cur.dist);
            cartRef.current?.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
            wagonRef.current?.setAttribute("transform", `rotate(${p.angle.toFixed(1)})`);
            if (cur.dist >= cur.road.total) {
              cur.phase = "dwell";
              cur.dwell = DWELL_MS[cur.stop.kind] / 1000;
              posIdRef.current = cur.stop.id;
              const s = cur.stop;
              setUi((u) => ({
                ...u,
                phase: "dwell",
                activeId: s.id,
                caption: captionOf(s),
                visited: { ...u.visited, [s.id]: s.kind },
              }));
            }
          } else {
            posIdRef.current = cur.stop.id;
            cur.dwell -= dt * speedRef.current;
            if (cur.dwell <= 0) {
              curRef.current = null;
              if (stepRef.current && queueRef.current.length > 0) {
                waitRef.current = true;
                setUi((u) => ({ ...u, phase: "wait", legPath: "" }));
              } else {
                setUi((u) => ({ ...u, legPath: "" }));
              }
            }
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // --- Live: ascultă read-only pe canalul real ---
  useEffect(() => {
    if (mode !== "live" || typeof BroadcastChannel === "undefined") return;
    const ch = new BroadcastChannel(PIPELINE_TRACE_CHANNEL);
    ch.onmessage = (ev: MessageEvent<PipelineTraceEvent>) => {
      setLiveSeen(true);
      if (queueRef.current.length > 40) return; // nu lăsăm coada să crească la nesfârșit
      enqueueEvent(ev.data.word, ev.data.stage, ev.data.changed);
    };
    return () => ch.close();
  }, [mode, enqueueEvent]);

  const switchMode = (m: Mode) => {
    if (m === mode) return;
    setMode(m);
    setLiveSeen(false);
    resetRun();
    setPaused(m === "demo");
  };

  const nextStep = () => {
    waitRef.current = false;
    setUi((u) => (u.phase === "wait" ? { ...u, phase: "idle" } : u));
  };

  const stagePins = useMemo(
    () =>
      STAGE_ORDER.map((st, i) => {
        const p = PARCEL_BY_ID.get(STAGE_TO_MODULE[st]);
        if (!p) return null;
        const [x, y] = streetPoint(p);
        return { st, no: i + 1, x, y, p };
      }).filter(Boolean) as { st: PipelineStageId; no: number; x: number; y: number; p: Parcel }[],
    []
  );

  const showPlan = plan.slice(-14);
  const running = ui.phase === "move" || ui.phase === "dwell" || ui.phase === "wait";
  const wordNow = curRef.current?.stop.word ?? plan[plan.length - 1]?.word ?? "";

  return (
    <main className="eic-home" style={{ maxWidth: 1340 }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", marginBottom: "0.25rem" }}>
        Trafic în sat{" "}
        <span style={{ fontSize: "0.7rem", fontWeight: 400, opacity: 0.55 }}>
          (idee — variantă pentru harta cadastrală)
        </span>
      </h1>
      <ObservatorNav theme="light" accent="#2F5D8A" />
      <p style={{ marginBottom: "0.8rem", opacity: 0.7, fontSize: "0.9rem" }}>
        O căruță duce un cuvânt prin pipeline-ul real. Merge <strong>pe drumuri</strong> (casă → uliță →
        drumul mare → uliță → casă) și se oprește în fiecare parcelă: <em>trece prin</em> (scurt) sau{" "}
        <em>lucrează</em> (lung, cu explicație). Traseul e cel real de importuri (BFS pe{" "}
        <code>MODULE_EDGES</code>).
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", marginBottom: "0.7rem" }}>
        <button style={btn(mode === "demo")} onClick={() => switchMode("demo")}>
          Demonstrație
        </button>
        <button style={btn(mode === "live")} onClick={() => switchMode("live")}>
          Live (din /learn)
        </button>
        <span style={{ width: 1, height: 20, background: "var(--color-border)", margin: "0 0.3rem" }} />
        {mode === "demo" && (
          <>
            <select
              value={demoIdx}
              onChange={(e) => setDemoIdx(Number(e.target.value))}
              style={{ ...btn(), padding: "0.28rem 0.5rem" }}
              aria-label="Cuvânt demonstrativ"
            >
              {DEMO_WORDS.map((d, i) => (
                <option key={d.word} value={i}>
                  {d.word}
                </option>
              ))}
            </select>
            <button style={btn(false)} onClick={() => runDemo(demoIdx)}>
              ▶ {running ? "Din nou" : "Pornește"}
            </button>
          </>
        )}
        <button
          style={btn(false, !running && mode === "demo")}
          disabled={!running && mode === "demo"}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? "▶ Continuă" : "⏸ Pauză"}
        </button>
        {[0.5, 1, 2].map((v) => (
          <button key={v} style={btn(speed === v)} onClick={() => setSpeed(v)}>
            {v}×
          </button>
        ))}
        <label style={{ fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <input type="checkbox" checked={stepMode} onChange={(e) => setStepMode(e.target.checked)} />
          pas cu pas
        </label>
        {ui.phase === "wait" && (
          <button style={{ ...btn(true) }} onClick={nextStep}>
            Următorul pas ▶
          </button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 320px",
          gap: "1.2rem",
          alignItems: "start",
        }}
      >
        <div>
          <div
            style={{
              border: "1.5px solid var(--color-border)",
              borderRadius: 10,
              overflow: "hidden",
              background: "#efe9d3",
            }}
          >
            <svg
              viewBox={`0 0 ${VILLAGE.width} ${VILLAGE.height}`}
              style={{ width: "100%", height: "auto", display: "block" }}
              role="img"
              aria-label="Satul cu căruța care duce un cuvânt prin pipeline"
            >
              {/* drumuri */}
              <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d={roadPath(-20, MAIN_Y, VILLAGE.width + 20, MAIN_Y)} stroke={ROAD_EDGE} strokeWidth={MAIN_H + 2} />
                {VILLAGE.streets.map((st) => (
                  <path
                    key={`e-${st.group}`}
                    d={roadPath(st.xs, MAIN_Y, st.xs, st.yEnd + 4)}
                    stroke={ROAD_EDGE}
                    strokeWidth={2 * R + 2}
                  />
                ))}
                <path d={roadPath(-20, MAIN_Y, VILLAGE.width + 20, MAIN_Y)} stroke={ROAD_FILL} strokeWidth={MAIN_H - 1} />
                {VILLAGE.streets.map((st) => (
                  <path
                    key={`f-${st.group}`}
                    d={roadPath(st.xs, MAIN_Y, st.xs, st.yEnd + 4)}
                    stroke={ROAD_FILL}
                    strokeWidth={2 * R - 1}
                  />
                ))}
                <path
                  d={roadPath(-20, MAIN_Y, VILLAGE.width + 20, MAIN_Y)}
                  stroke="#f7f2e2"
                  strokeWidth={1.5}
                  strokeDasharray="10 8"
                  strokeLinecap="butt"
                />
                {VILLAGE.streets.map((st) => (
                  <path
                    key={`m-${st.group}`}
                    d={roadPath(st.xs, MAIN_Y + MAIN_H / 2, st.xs, st.yEnd)}
                    stroke="#f7f2e2"
                    strokeWidth={1.2}
                    strokeDasharray="7 6"
                    strokeLinecap="butt"
                  />
                ))}
              </g>

              {/* parcele */}
              {VILLAGE.parcels.map((p) => {
                const vis = ui.visited[p.id];
                const isActive = ui.activeId === p.id && ui.phase !== "idle";
                const hg = houseGeometry(p);
                const fill =
                  vis === "work" ? "#ffe6a8" : vis === "pass" ? "#f0efc4" : vis === "start" ? "#dbe9f6" : "#e3ecc9";
                return (
                  <g key={p.id}>
                    <title>{`${p.label} — ${p.loc} loc`}</title>
                    <polygon points={p.poly} fill={fill} stroke={FENCE} strokeWidth={1.2} strokeLinejoin="round" />
                    <g transform={`translate(${p.ox.toFixed(1)} ${p.oy.toFixed(1)})`}>
                      <rect
                        x={hg.x}
                        y={hg.y}
                        width={hg.w}
                        height={hg.h}
                        rx={2}
                        fill={STREET_COLOR[p.group]}
                        stroke="#5b4a2e"
                        strokeWidth={0.9}
                      />
                      <line
                        x1={hg.x + hg.w / 2}
                        y1={hg.y + 2}
                        x2={hg.x + hg.w / 2}
                        y2={hg.y + hg.h - 2}
                        stroke="#5b4a2e"
                        strokeWidth={0.6}
                        opacity={0.55}
                      />
                      <rect
                        x={p.s === 1 ? p.front + 5 : p.front - 9}
                        y={p.rawCy - 4.5}
                        width={4}
                        height={9}
                        rx={1}
                        fill={STAGE_COLOR[stageOf(p.id)]}
                        stroke="#3b2f1c"
                        strokeWidth={0.5}
                      />
                    </g>
                    {isActive && (
                      <polygon
                        points={p.poly}
                        fill="none"
                        stroke="#d9822b"
                        strokeWidth={3}
                        strokeLinejoin="round"
                        style={{ pointerEvents: "none" }}
                      >
                        <animate attributeName="stroke-opacity" values="1;0.25;1" dur="1.4s" repeatCount="indefinite" />
                      </polygon>
                    )}
                  </g>
                );
              })}

              {/* monumente */}
              {VILLAGE.parcels.map((p) => {
                const kind = LANDMARK_OF[p.id];
                if (!kind) return null;
                const [lx, ly] = warp(p.front - p.s * R, p.rawCy);
                return (
                  <g key={`lm-${p.id}`} transform={`translate(${lx.toFixed(1)} ${ly.toFixed(1)})`} style={{ pointerEvents: "none" }}>
                    <Landmark kind={kind} />
                  </g>
                );
              })}

              {/* stațiile pipeline-ului: steguri numerotate 1-4 */}
              {stagePins.map((s) => (
                <g key={s.st} transform={`translate(${(s.x + s.p.s * 22).toFixed(1)} ${(s.y - 14).toFixed(1)})`} style={{ pointerEvents: "none" }}>
                  <circle r={8} fill="#2F5D8A" stroke="#fff" strokeWidth={1.5} />
                  <text textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight={700} fill="#fff">
                    {s.no}
                  </text>
                </g>
              ))}

              {/* drumul etapei curente */}
              {ui.legPath && (
                <path
                  d={ui.legPath}
                  fill="none"
                  stroke="#d9822b"
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="2 7"
                  opacity={0.9}
                  style={{ pointerEvents: "none" }}
                />
              )}

              {/* numele ulițelor */}
              {VILLAGE.streets.map((st) => (
                <g key={`n-${st.group}`} style={{ pointerEvents: "none" }}>
                  <rect x={st.xs - 34} y={st.yEnd + 12} width={68} height={3} rx={1.5} fill={STREET_COLOR[st.group]} />
                  <text
                    x={st.xs}
                    y={st.yEnd + 28}
                    fontSize={10}
                    fill="#4a4030"
                    textAnchor="middle"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {STREET_SHORT[st.group]}
                  </text>
                </g>
              ))}

              {/* căruța (poziția o actualizează bucla, direct în DOM) */}
              <g ref={cartRef} style={{ pointerEvents: "none" }}>
                <g ref={wagonRef}>
                  <rect x={-9} y={-5} width={18} height={10} rx={2} fill="#fff7e0" stroke="#4a3b22" strokeWidth={1.2} />
                  <rect x={-7} y={-3.5} width={14} height={7} rx={1} fill="#d9822b" opacity={0.85} />
                  <circle cx={-6} cy={6} r={2.6} fill="#4a3b22" />
                  <circle cx={6} cy={6} r={2.6} fill="#4a3b22" />
                  <circle cx={-6} cy={-6} r={2.6} fill="#4a3b22" />
                  <circle cx={6} cy={-6} r={2.6} fill="#4a3b22" />
                  <polygon points="9,-2 15,0 9,2" fill="#4a3b22" />
                </g>
                {wordNow && running && (
                  <g transform="translate(0 -20)">
                    <rect
                      x={-(wordNow.length * 3.3 + 6)}
                      y={-7}
                      width={wordNow.length * 6.6 + 12}
                      height={14}
                      rx={7}
                      fill="#fff"
                      stroke="#4a3b22"
                      strokeWidth={1}
                    />
                    <text textAnchor="middle" dominantBaseline="central" fontSize={9.5} fontWeight={700} fill="#2b2b2b">
                      {wordNow}
                    </text>
                  </g>
                )}
              </g>
            </svg>
          </div>
          <p style={{ fontSize: "0.75rem", opacity: 0.65, marginTop: "0.5rem" }}>
            Steag albastru numerotat = stația pipeline-ului (1 consoane silabice → 2 r silabic → 3
            overrides → 4 afișare finală). Parcelă galbenă = a „lucrat”; verzuie = a fost doar traversată;
            albastră = punctul de plecare. Drumul punctat portocaliu = tronsonul pe care merge căruța acum.
          </p>
        </div>

        <aside style={{ position: "sticky", top: 16, display: "grid", gap: "0.9rem" }}>
          <div style={{ border: "1.5px solid var(--color-border)", borderRadius: 10, padding: "0.9rem 1rem" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", margin: "0 0 0.4rem" }}>Ce se întâmplă acum</h3>
            {mode === "live" && !liveSeen && (
              <p style={{ fontSize: "0.82rem", opacity: 0.7, margin: 0 }}>
                Aștept evenimente reale. Deschide <code>/learn</code> într-un alt tab, din același browser,
                și răsfoiește cuvinte — fiecare etapă rulată apare aici ca o căruță.
              </p>
            )}
            {mode === "demo" && !running && plan.length === 0 && (
              <p style={{ fontSize: "0.82rem", opacity: 0.7, margin: 0 }}>
                Alege un cuvânt și apasă „Pornește”. Steagurile „modificat / neschimbat” sunt simulate în
                demonstrație; în modul Live sunt cele reale.
              </p>
            )}
            {ui.caption && <p style={{ fontSize: "0.9rem", margin: 0, lineHeight: 1.45 }}>{ui.caption}</p>}
            {mode === "demo" && plan.length > 0 && !running && (
              <p style={{ fontSize: "0.82rem", opacity: 0.7, margin: "0.4rem 0 0" }}>Gata. „Din nou” reia de la fântână.</p>
            )}
            {pending > 0 && <p style={{ fontSize: "0.75rem", opacity: 0.6, margin: "0.5rem 0 0" }}>în coadă: {pending} opriri</p>}
          </div>

          <div style={{ border: "1.5px solid var(--color-border)", borderRadius: 10, padding: "0.9rem 1rem" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", margin: "0 0 0.4rem" }}>Itinerar</h3>
            {showPlan.length === 0 ? (
              <p style={{ fontSize: "0.82rem", opacity: 0.55, margin: 0 }}>— nimic încă</p>
            ) : (
              <ol style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.8rem" }}>
                {showPlan.map((s) => {
                  const isCur = s.seq === ui.seq && running;
                  const done = s.seq < ui.seq;
                  return (
                    <li
                      key={s.seq}
                      style={{
                        opacity: done ? 0.5 : 1,
                        fontWeight: isCur ? 700 : 400,
                        color: isCur ? "#b8611a" : "inherit",
                        margin: "0.1rem 0",
                      }}
                    >
                      {s.kind === "start" ? "📤 " : s.kind === "pass" ? "↪ " : "⚙ "}
                      {labelOf(s.id)}
                      {s.kind === "work" && s.stage && (
                        <span style={{ opacity: 0.7 }}>
                          {" "}
                          · etapa {s.stageNo} · {s.changed ? "modificat" : "neschimbat"}
                        </span>
                      )}
                      {s.kind === "start" && <span style={{ opacity: 0.7 }}> · „{s.word}”</span>}
                    </li>
                  );
                })}
              </ol>
            )}
            <p style={{ fontSize: "0.72rem", opacity: 0.55, margin: "0.6rem 0 0" }}>
              📤 pornire · ↪ trece prin (import real) · ⚙ lucrează (etapă din pipeline)
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
