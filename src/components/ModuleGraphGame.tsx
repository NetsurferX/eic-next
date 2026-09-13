"use client";

import { useMemo, useState } from "react";
import { MODULE_NODES, MODULE_EDGES, type ModuleGroup } from "@/lib/moduleGraphData";

/* =================================================================
   /debug/graph — 3 mini-jocuri algoritmice pe graful REAL de import-uri
   (MODULE_NODES / MODULE_EDGES din moduleGraphData.ts). Fiecare rundă
   e verificată cu un algoritm de graf calculat la runtime (BFS, degree,
   sortare topologică tip Kahn) — nu cu răspunsuri hardcodate.

   Nu modifică ModuleGraph.tsx sau PipelineTraceGraph.tsx. Scor/XP sunt
   ținute doar în state React (per sesiune, fără persistență) — dacă se
   dorește persistență între sesiuni, e nevoie de o cheie nouă de storage,
   separată de eic-progress-v7.
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

function label(id: string): string {
  return MODULE_NODES.find((n) => n.id === id)?.label ?? id;
}
function groupOf(id: string): ModuleGroup {
  return MODULE_NODES.find((n) => n.id === id)?.group ?? "support";
}

/* ---------------- graph algorithms (real, on the actual data) ---------------- */

function buildUndirectedAdjacency(): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  for (const n of MODULE_NODES) adj.set(n.id, new Set());
  for (const e of MODULE_EDGES) {
    adj.get(e.source)?.add(e.target);
    adj.get(e.target)?.add(e.source);
  }
  return adj;
}

function bfsDistances(adj: Map<string, Set<string>>, start: string): Map<string, number> {
  const dist = new Map<string, number>([[start, 0]]);
  const queue = [start];
  while (queue.length) {
    const cur = queue.shift()!;
    const d = dist.get(cur)!;
    for (const nb of adj.get(cur) ?? []) {
      if (!dist.has(nb)) {
        dist.set(nb, d + 1);
        queue.push(nb);
      }
    }
  }
  return dist;
}

function bfsPath(adj: Map<string, Set<string>>, start: string, end: string): string[] {
  if (start === end) return [start];
  const prev = new Map<string, string>();
  const visited = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const nb of adj.get(cur) ?? []) {
      if (!visited.has(nb)) {
        visited.add(nb);
        prev.set(nb, cur);
        if (nb === end) {
          const path = [end];
          let c = end;
          while (c !== start) {
            c = prev.get(c)!;
            path.push(c);
          }
          return path.reverse();
        }
        queue.push(nb);
      }
    }
  }
  return [];
}

function degreeMap(): Map<string, number> {
  const d = new Map<string, number>();
  for (const n of MODULE_NODES) d.set(n.id, 0);
  for (const e of MODULE_EDGES) {
    d.set(e.source, (d.get(e.source) ?? 0) + 1);
    d.set(e.target, (d.get(e.target) ?? 0) + 1);
  }
  return d;
}

/** Kahn-style validity check: edge (source,target) means source depends on target,
 *  so target must appear strictly before source in a valid order. */
function firstViolatedEdge(
  nodeIds: string[],
  order: string[]
): { source: string; target: string } | null {
  const pos = new Map(order.map((id, i) => [id, i]));
  const subEdges = MODULE_EDGES.filter((e) => nodeIds.includes(e.source) && nodeIds.includes(e.target));
  for (const e of subEdges) {
    if ((pos.get(e.target) ?? -1) > (pos.get(e.source) ?? -1)) return e;
  }
  return null;
}

/* ---------------- shared bits ---------------- */

type Tab = "path" | "degree" | "topo";

const CHIP_BASE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid var(--color-border, #e8e6e1)",
  fontSize: "0.8rem",
  cursor: "pointer",
  background: "#fff",
  lineHeight: 1.2,
};

function Dot({ group }: { group: ModuleGroup }) {
  return (
    <span
      style={{ width: 8, height: 8, borderRadius: "50%", background: GROUP_COLOR[group], display: "inline-block" }}
    />
  );
}

/* =================================================================
   Game A — "Drumul cel mai scurt" (BFS)
   ================================================================= */

function ShortestPathGame() {
  const adj = useMemo(buildUndirectedAdjacency, []);
  const candidates = useMemo(() => {
    const ids = MODULE_NODES.map((n) => n.id);
    const pairs: Array<{ a: string; b: string; dist: number }> = [];
    for (let i = 0; i < ids.length; i++) {
      const dists = bfsDistances(adj, ids[i]);
      for (let j = i + 1; j < ids.length; j++) {
        const d = dists.get(ids[j]);
        if (d && d >= 2 && d <= 4) pairs.push({ a: ids[i], b: ids[j], dist: d });
      }
    }
    return pairs;
  }, [adj]);

  const [roundIdx, setRoundIdx] = useState(() => Math.floor(Math.random() * candidates.length));
  const pair = candidates[roundIdx];
  const [path, setPath] = useState<string[]>(pair ? [pair.a] : []);
  const [result, setResult] = useState<{ optimal: number; used: number } | null>(null);
  const [score, setScore] = useState({ perfect: 0, total: 0 });

  function nextRound() {
    const idx = Math.floor(Math.random() * candidates.length);
    setRoundIdx(idx);
    setPath([candidates[idx].a]);
    setResult(null);
  }

  function click(id: string) {
    if (!pair || result) return;
    const last = path[path.length - 1];
    if (id === last || path.includes(id)) return;
    if (!adj.get(last)?.has(id)) return; // nu e muchie reală — ignorăm click-ul
    const newPath = [...path, id];
    setPath(newPath);
    if (id === pair.b) {
      const optimal = bfsPath(adj, pair.a, pair.b).length - 1;
      const used = newPath.length - 1;
      setResult({ optimal, used });
      setScore((s) => ({ perfect: s.perfect + (used === optimal ? 1 : 0), total: s.total + 1 }));
    }
  }

  if (!pair) return null;
  const optimalPath = result ? bfsPath(adj, pair.a, pair.b) : null;

  return (
    <div>
      <p style={{ fontSize: "0.85rem", opacity: 0.75, marginBottom: 8 }}>
        Pornește din <strong>{label(pair.a)}</strong> și ajunge la <strong>{label(pair.b)}</strong>, clicând doar
        module legate direct printr-un import real. Scop: cel mai scurt drum (BFS).
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {MODULE_NODES.map((n) => {
          const inPath = path.includes(n.id);
          const isEnds = n.id === pair.a || n.id === pair.b;
          const clickable = !result && adj.get(path[path.length - 1])?.has(n.id) && !path.includes(n.id);
          return (
            <button
              key={n.id}
              onClick={() => click(n.id)}
              style={{
                ...CHIP_BASE,
                opacity: result ? (optimalPath?.includes(n.id) || inPath ? 1 : 0.35) : inPath || clickable ? 1 : 0.4,
                borderColor: inPath ? "#2F5D8A" : isEnds ? "#C77D3A" : "var(--color-border, #e8e6e1)",
                borderWidth: inPath || isEnds ? 2 : 1,
                background: inPath ? "#EAF1F8" : "#fff",
                cursor: clickable ? "pointer" : "default",
              }}
            >
              <Dot group={n.group} />
              {n.label}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: "0.85rem", minHeight: 44 }}>
        {!result && (
          <div style={{ opacity: 0.6 }}>
            Traseu curent ({path.length - 1} pași): {path.map(label).join(" → ")}
          </div>
        )}
        {result && (
          <div>
            {result.used === result.optimal ? (
              <div style={{ color: "#4E9A3E", fontWeight: 600 }}>
                Perfect — {result.used} pași, exact drumul minim! 🏆
              </div>
            ) : (
              <div>
                Ai folosit <strong>{result.used}</strong> pași; drumul minim avea{" "}
                <strong>{result.optimal}</strong>: {optimalPath?.map(label).join(" → ")}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
        <button onClick={nextRound} style={{ ...CHIP_BASE, background: "#2F5D8A", color: "#fff", border: "none" }}>
          {result ? "Rundă nouă" : "Sări peste"}
        </button>
        <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>
          Scor: {score.perfect}/{score.total} drumuri optime
        </span>
      </div>
    </div>
  );
}

/* =================================================================
   Game B — "Hub sau frunză?" (grad de nod)
   ================================================================= */

function DegreeGame() {
  const degrees = useMemo(degreeMap, []);
  const pickRound = () => {
    const ids = [...MODULE_NODES.map((n) => n.id)];
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids.slice(0, 4);
  };
  const [options, setOptions] = useState<string[]>(pickRound);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const maxDeg = Math.max(...options.map((id) => degrees.get(id) ?? 0));
  const correctIds = options.filter((id) => (degrees.get(id) ?? 0) === maxDeg);

  function choose(id: string) {
    if (picked) return;
    setPicked(id);
    setScore((s) => ({ correct: s.correct + (correctIds.includes(id) ? 1 : 0), total: s.total + 1 }));
  }
  function nextRound() {
    setOptions(pickRound());
    setPicked(null);
  }

  return (
    <div>
      <p style={{ fontSize: "0.85rem", opacity: 0.75, marginBottom: 10 }}>
        Care dintre aceste 4 module are cel mai mare număr total de conexiuni (import-uri, în ambele sensuri)?
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 420 }}>
        {options.map((id) => {
          const deg = degrees.get(id) ?? 0;
          const isCorrect = correctIds.includes(id);
          const showState = !!picked;
          return (
            <button
              key={id}
              onClick={() => choose(id)}
              style={{
                ...CHIP_BASE,
                justifyContent: "space-between",
                borderRadius: 10,
                padding: "10px 12px",
                borderColor: showState ? (isCorrect ? "#4E9A3E" : id === picked ? "#B23B3B" : "var(--color-border, #e8e6e1)") : "var(--color-border, #e8e6e1)",
                borderWidth: showState && (isCorrect || id === picked) ? 2 : 1,
                background: showState && isCorrect ? "#EEF6EA" : showState && id === picked ? "#FBEAEA" : "#fff",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Dot group={groupOf(id)} /> {label(id)}
              </span>
              {showState && <strong style={{ fontSize: "0.75rem" }}>{deg} conexiuni</strong>}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
        {picked && (
          <button onClick={nextRound} style={{ ...CHIP_BASE, background: "#2F5D8A", color: "#fff", border: "none" }}>
            Rundă nouă
          </button>
        )}
        <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>
          Scor: {score.correct}/{score.total}
        </span>
      </div>
    </div>
  );
}

/* =================================================================
   Game C — "Sortare topologică" (Kahn — ordinea reală de dependință)
   ================================================================= */

const TOPO_PUZZLES: string[][] = [
  ["lib/engine/types.ts", "lib/rules/colors.ts", "lib/engine/align.ts", "lib/engine/score.ts", "lib/engine/index.ts"],
  [
    "lib/rules/overrides/types.ts",
    "lib/rules/overrides/vr-lexical-sets.ts",
    "lib/rules/overrides/yw-exceptions.ts",
    "lib/rules/overrides/mute-e.ts",
    "lib/rules/overrides/misc.ts",
    "lib/rules/overrides/apply.ts",
    "lib/rules/overrides/index.ts",
  ],
  ["lib/engine/types.ts", "lib/rules/colors.ts", "lib/engine/segment.ts", "lib/engine/display.ts", "lib/engine/index.ts"],
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function TopoSortGame() {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const puzzle = TOPO_PUZZLES[puzzleIdx];
  const [pool, setPool] = useState<string[]>(() => shuffle(puzzle));
  const [order, setOrder] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ ok: boolean; bad?: { source: string; target: string } } | null>(null);
  const [score, setScore] = useState({ solved: 0, attempts: 0 });

  function place(id: string) {
    if (feedback?.ok) return;
    setOrder((o) => [...o, id]);
    setPool((p) => p.filter((x) => x !== id));
    setFeedback(null);
  }
  function reset() {
    setPool(shuffle(puzzle));
    setOrder([]);
    setFeedback(null);
  }
  function check() {
    const bad = firstViolatedEdge(puzzle, order);
    setFeedback({ ok: !bad, bad: bad ?? undefined });
    setScore((s) => ({ solved: s.solved + (bad ? 0 : 1), attempts: s.attempts + 1 }));
  }
  function nextPuzzle() {
    const idx = (puzzleIdx + 1) % TOPO_PUZZLES.length;
    setPuzzleIdx(idx);
    setPool(shuffle(TOPO_PUZZLES[idx]));
    setOrder([]);
    setFeedback(null);
  }

  return (
    <div>
      <p style={{ fontSize: "0.85rem", opacity: 0.75, marginBottom: 10 }}>
        Clică modulele, în ordine, astfel încât fiecare să apară <strong>după</strong> tot ce importă el direct.
        Verificarea e făcută cu un algoritm real de sortare topologică (Kahn) pe muchiile reale dintre aceste module —
        pot exista mai multe ordini corecte.
      </p>

      <div style={{ fontSize: "0.8rem", opacity: 0.6, marginBottom: 4 }}>De plasat:</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10, minHeight: 34 }}>
        {pool.map((id) => (
          <button key={id} onClick={() => place(id)} style={CHIP_BASE}>
            <Dot group={groupOf(id)} /> {label(id)}
          </button>
        ))}
        {pool.length === 0 && <span style={{ opacity: 0.4, fontSize: "0.8rem" }}>—</span>}
      </div>

      <div style={{ fontSize: "0.8rem", opacity: 0.6, marginBottom: 4 }}>Ordinea ta (prima = fără dependințe):</div>
      <ol style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingLeft: 0, listStyle: "none", minHeight: 34 }}>
        {order.map((id, i) => {
          const isBad = feedback?.bad && (feedback.bad.source === id || feedback.bad.target === id);
          return (
            <li
              key={id}
              style={{
                ...CHIP_BASE,
                cursor: "default",
                borderColor: isBad ? "#B23B3B" : "#2F5D8A",
                background: isBad ? "#FBEAEA" : "#EAF1F8",
              }}
            >
              {i + 1}. <Dot group={groupOf(id)} /> {label(id)}
            </li>
          );
        })}
      </ol>

      {feedback && (
        <div style={{ marginTop: 8, fontSize: "0.85rem" }}>
          {feedback.ok ? (
            <span style={{ color: "#4E9A3E", fontWeight: 600 }}>Ordine validă — sortare topologică corectă! 🏆</span>
          ) : (
            <span>
              Încă nu e corect: <strong>{label(feedback.bad!.source)}</strong> importă direct{" "}
              <strong>{label(feedback.bad!.target)}</strong>, deci trebuie să apară după el.
            </span>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        {order.length === puzzle.length && !feedback?.ok && (
          <button onClick={check} style={{ ...CHIP_BASE, background: "#2F5D8A", color: "#fff", border: "none" }}>
            Verifică ordinea
          </button>
        )}
        {(pool.length < puzzle.length || feedback) && !feedback?.ok && (
          <button onClick={reset} style={CHIP_BASE}>
            Reia acest puzzle
          </button>
        )}
        {feedback?.ok && (
          <button onClick={nextPuzzle} style={{ ...CHIP_BASE, background: "#2F5D8A", color: "#fff", border: "none" }}>
            Puzzle următor
          </button>
        )}
        <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>
          Rezolvate: {score.solved}/{score.attempts} · Puzzle {puzzleIdx + 1}/{TOPO_PUZZLES.length}
        </span>
      </div>
    </div>
  );
}

/* =================================================================
   Wrapper cu tab-uri
   ================================================================= */

export default function ModuleGraphGame() {
  const [tab, setTab] = useState<Tab>("path");

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "path", label: "Drumul cel mai scurt" },
    { id: "degree", label: "Hub sau frunză?" },
    { id: "topo", label: "Sortare topologică" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              ...CHIP_BASE,
              borderRadius: 8,
              fontWeight: tab === t.id ? 600 : 400,
              background: tab === t.id ? "#1a1917" : "#fff",
              color: tab === t.id ? "#fff" : "#1a1917",
              borderColor: tab === t.id ? "#1a1917" : "var(--color-border, #e8e6e1)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "path" && <ShortestPathGame />}
      {tab === "degree" && <DegreeGame />}
      {tab === "topo" && <TopoSortGame />}
    </div>
  );
}
