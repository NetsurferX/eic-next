"use client";

import { useEffect, useMemo, useState } from "react";

/* IVD-EiC — Indice de Validare a Direcției.
   Pagină izolată de probă. Nu importă nimic din restul aplicației.
   Persistență: localStorage (cheia "eic-ivd-v1"). */

type Key = "u" | "a" | "i" | "r" | "s";
type Raw = Record<Key, number>;
type Cycle = { id: number; name: string; hours: number; n: number; raw: Raw };

const DIMS: {
  k: Key | "e";
  label: string;
  q: string;
  metric: string;
  worst: number;
  best: number;
  w: number;
}[] = [
  { k: "u", label: "Utilitate", q: "Reușește ce și-a propus?", metric: "% cuvinte citite corect din prima", worst: 0, best: 100, w: 25 },
  { k: "a", label: "Accesibilitate", q: "Înțelege singur?", metric: "% copii care încep prima sarcină singuri în <30s", worst: 0, best: 100, w: 20 },
  { k: "i", label: "Implicare", q: "Explorează fără a fi împins?", metric: "cuvinte voluntare/sesiune peste minim", worst: 0, best: 10, w: 15 },
  { k: "r", label: "Revenire", q: "Are motive reale să revină?", metric: "% reveniri în 7 zile", worst: 0, best: 60, w: 15 },
  { k: "s", label: "Recomandabilitate", q: "Ar transmite mai departe?", metric: "scor părinte/profesor 0–10", worst: 0, best: 10, w: 10 },
  { k: "e", label: "Eficiența dezvoltării", q: "Valoare per oră investită?", metric: "calculat: ΔIVD₅ la 10 ore", worst: 0, best: 100, w: 15 },
];

const DEFAULT_CYCLES: Cycle[] = [
  { id: 0, name: "Ciclu 0 — baseline (exemplu)", hours: 0, n: 40, raw: { u: 52, a: 35, i: 2, r: 18, s: 6 } },
  { id: 1, name: "Ciclu 1 — /learn 4 cuvinte (exemplu)", hours: 8, n: 40, raw: { u: 61, a: 44, i: 2.5, r: 20, s: 6.5 } },
  { id: 2, name: "Ciclu 2 — Bulele Vulpii (exemplu)", hours: 20, n: 25, raw: { u: 62, a: 41, i: 4.5, r: 27, s: 7 } },
];

const DEFAULT_CFG = { weights: Object.fromEntries(DIMS.map((d) => [d.k, d.w])) as Record<string, number>, continueMin: 60, abandonMax: 40, minDelta: 2, vetoDrop: 8, minN: 30, targetPer10h: 2 };

const THEMES: Record<"dark" | "light", Record<string, string>> = {
  dark: { "--bg": "#0b0e14", "--fg": "#e6e8ec", "--muted": "#9aa1ad", "--card": "#151922", "--border": "#232938", "--grid": "#2a2f3a", "--inp-bg": "#0e1118", "--inp-border": "#2a3040", "--row": "#1b2230", "--text2": "#c3c8d2", "--faint": "#6b7280", "--btn-bg": "#1f2636", "--btn-border": "#2f384d" },
  light: { "--bg": "#f4f6fa", "--fg": "#161a22", "--muted": "#5b6472", "--card": "#ffffff", "--border": "#dde2ea", "--grid": "#d3d9e3", "--inp-bg": "#f7f9fc", "--inp-border": "#c9d1de", "--row": "#e8eefb", "--text2": "#2d3441", "--faint": "#7a8493", "--btn-bg": "#eef1f6", "--btn-border": "#c9d1de" },
};

const clamp = (x: number, a = 0, b = 100) => Math.max(a, Math.min(b, x));
const norm = (v: number, worst: number, best: number) => clamp(((v - worst) / (best - worst)) * 100);

function compute(cycles: Cycle[], cfg: typeof DEFAULT_CFG) {
  const wsum = Object.values(cfg.weights).reduce((a, b) => a + b, 0) || 1;
  const w5 = DIMS.filter((d) => d.k !== "e").reduce((a, d) => a + cfg.weights[d.k], 0) || 1;
  const out: { scores: Record<string, number>; ivd5: number; ivd: number }[] = [];
  cycles.forEach((c, idx) => {
    const scores: Record<string, number> = {};
    DIMS.forEach((d) => {
      if (d.k !== "e") scores[d.k] = norm(c.raw[d.k], d.worst, d.best);
    });
    const ivd5 = DIMS.filter((d) => d.k !== "e").reduce((a, d) => a + scores[d.k] * cfg.weights[d.k], 0) / w5;
    if (idx === 0 || c.hours <= 0) scores.e = 50;
    else {
      const rate = ((ivd5 - out[idx - 1].ivd5) / c.hours) * 10;
      scores.e = clamp(50 + 50 * (rate / cfg.targetPer10h));
    }
    const ivd = DIMS.reduce((a, d) => a + scores[d.k] * cfg.weights[d.k], 0) / wsum;
    out.push({ scores, ivd5, ivd });
  });
  return out;
}

function verdict(cycles: Cycle[], res: ReturnType<typeof compute>, i: number, cfg: typeof DEFAULT_CFG) {
  if (i === 0) return { v: "BASELINE", c: "#8a8f98", why: ["Punct de plecare — nu se judecă."] };
  const why: string[] = [];
  const delta = res[i].ivd - res[i - 1].ivd;
  const prevDelta = i > 1 ? res[i - 1].ivd - res[i - 2].ivd : 1;
  const vetoes = DIMS.filter((d) => d.k !== "e" && res[i].scores[d.k] - res[i - 1].scores[d.k] < -cfg.vetoDrop);
  let v = "CORECTEAZĂ", c = "#e0a526";
  if (vetoes.length) {
    why.push(`Veto: ${vetoes.map((d) => d.label).join(", ")} a scăzut cu >${cfg.vetoDrop} puncte (nu compromitem alte dimensiuni).`);
  } else if (res[i].ivd < cfg.abandonMax || (delta <= 0 && prevDelta <= 0)) {
    v = "ABANDONEAZĂ"; c = "#e5484d";
    why.push(res[i].ivd < cfg.abandonMax ? `IVD sub pragul de abandon (${cfg.abandonMax}).` : "ΔIVD ≤ 0 două cicluri la rând.");
  } else if (res[i].ivd >= cfg.continueMin && delta >= cfg.minDelta) {
    v = "CONTINUĂ"; c = "#30a46c";
    why.push(`IVD ≥ ${cfg.continueMin} și ΔIVD ≥ +${cfg.minDelta}.`);
  } else {
    why.push(delta < cfg.minDelta ? `Progres insuficient (ΔIVD ${delta.toFixed(1)} < ${cfg.minDelta}).` : `IVD sub pragul de continuare (${cfg.continueMin}).`);
  }
  if (cycles[i].n < cfg.minN) why.push(`⚠ Eșantion mic (n=${cycles[i].n} < ${cfg.minN}) — verdict provizoriu.`);
  return { v, c, why };
}

function Radar({ base, cur }: { base: Record<string, number>; cur: Record<string, number> }) {
  const R = 90, cx = 130, cy = 120;
  const pt = (i: number, val: number) => {
    const a = (Math.PI * 2 * i) / DIMS.length - Math.PI / 2;
    return [cx + Math.cos(a) * R * (val / 100), cy + Math.sin(a) * R * (val / 100)];
  };
  const poly = (s: Record<string, number>) => DIMS.map((d, i) => pt(i, s[d.k]).join(",")).join(" ");
  return (
    <svg viewBox="0 0 260 240" style={{ width: "100%", maxWidth: 340 }}>
      {[25, 50, 75, 100].map((g) => (
        <polygon key={g} points={DIMS.map((_, i) => pt(i, g).join(",")).join(" ")} style={{ fill: "none", stroke: "var(--grid)" }} />
      ))}
      {DIMS.map((d, i) => {
        const [x, y] = pt(i, 118);
        return <text key={d.k} x={x} y={y} fontSize="8.5" textAnchor="middle" style={{ fill: "var(--muted)" }}>{d.label}</text>;
      })}
      <polygon points={poly(base)} fill="#8a8f9833" stroke="#8a8f98" strokeDasharray="3 3" />
      <polygon points={poly(cur)} fill="#4f9cf944" stroke="#4f9cf9" strokeWidth={2} />
    </svg>
  );
}

const box: React.CSSProperties = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 };
const inp: React.CSSProperties = { background: "var(--inp-bg)", color: "var(--fg)", border: "1px solid var(--inp-border)", borderRadius: 6, padding: "4px 6px", width: 70 };

export default function IvdEicPage() {
  const [cycles, setCycles] = useState<Cycle[]>(DEFAULT_CYCLES);
  const [cfg, setCfg] = useState(DEFAULT_CFG);
  const [sel, setSel] = useState(DEFAULT_CYCLES.length - 1);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const s = localStorage.getItem("eic-ivd-v1");
      if (s) {
        const p = JSON.parse(s);
        if (p.cycles?.length) { setCycles(p.cycles); setSel(p.cycles.length - 1); }
        if (p.cfg) setCfg({ ...DEFAULT_CFG, ...p.cfg });
      }
    } catch {}
    try {
      const t = localStorage.getItem("eic-ivd-theme");
      if (t === "light" || t === "dark") setTheme(t);
      else if (window.matchMedia?.("(prefers-color-scheme: light)").matches) setTheme("light");
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem("eic-ivd-v1", JSON.stringify({ cycles, cfg })); } catch {}
  }, [cycles, cfg, ready]);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem("eic-ivd-theme", theme); } catch {}
  }, [theme, ready]);

  const res = useMemo(() => compute(cycles, cfg), [cycles, cfg]);
  const i = Math.min(sel, cycles.length - 1);
  const ver = verdict(cycles, res, i, cfg);
  const upd = (idx: number, f: (c: Cycle) => Cycle) => setCycles(cycles.map((c, j) => (j === idx ? f(c) : c)));
  const addCycle = () => {
    const last = cycles[cycles.length - 1];
    setCycles([...cycles, { id: Date.now(), name: `Ciclu ${cycles.length}`, hours: 5, n: last.n, raw: { ...last.raw } }]);
    setSel(cycles.length);
  };

  return (
    <main style={{ ...(THEMES[theme] as React.CSSProperties), colorScheme: theme, background: "var(--bg)", color: "var(--fg)", minHeight: "100vh", padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 16 }}>
        <header style={{ position: "relative" }}>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ ...btn, position: "absolute", right: 0, top: 0 }} aria-label="Schimbă tema">
            {theme === "dark" ? "☀ Light" : "☾ Dark"}
          </button>
          <h1 style={{ margin: 0, fontSize: 24 }}>IVD-EiC · Indice de Validare a Direcției</h1>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            Fiecare ciclu de dezvoltare primește un scor 0–100 și un verdict: continuă, corectează sau abandonează.
          </p>
        </header>

        <section style={{ ...box, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Ciclu evaluat</div>
            <select value={i} onChange={(e) => setSel(+e.target.value)} style={{ ...inp, width: "100%", marginBottom: 12 }}>
              {cycles.map((c, j) => <option key={c.id} value={j}>{c.name}</option>)}
            </select>
            <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1 }}>{res[i].ivd.toFixed(1)}</div>
            <div style={{ color: "var(--muted)" }}>
              IVD {i > 0 && <>· Δ față de ciclul anterior: <b style={{ color: res[i].ivd - res[i - 1].ivd >= 0 ? "#30a46c" : "#e5484d" }}>{(res[i].ivd - res[i - 1].ivd).toFixed(1)}</b></>}
            </div>
            <div style={{ marginTop: 12, display: "inline-block", padding: "6px 14px", borderRadius: 999, background: ver.c + "22", color: ver.c, border: `1px solid ${ver.c}`, fontWeight: 700 }}>
              {ver.v}
            </div>
            <ul style={{ color: "var(--text2)", paddingLeft: 18, fontSize: 14 }}>{ver.why.map((w, k) => <li key={k}>{w}</li>)}</ul>
          </div>
          <Radar base={res[0].scores} cur={res[i].scores} />
        </section>

        <section style={box}>
          <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Metrici brute pe ciclu</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 13, width: "100%" }}>
              <thead>
                <tr style={{ color: "var(--muted)", textAlign: "left" }}>
                  <th style={{ padding: 6 }}>Ciclu</th><th>Ore</th><th>n</th>
                  {DIMS.filter((d) => d.k !== "e").map((d) => <th key={d.k} title={d.metric}>{d.label}</th>)}
                  <th>Efic.</th><th>IVD</th>
                </tr>
              </thead>
              <tbody>
                {cycles.map((c, j) => (
                  <tr key={c.id} style={{ background: j === i ? "var(--row)" : "transparent", cursor: "pointer" }} onClick={() => setSel(j)}>
                    <td style={{ padding: 6 }}><input style={{ ...inp, width: 190 }} value={c.name} onChange={(e) => upd(j, (x) => ({ ...x, name: e.target.value }))} /></td>
                    <td><input type="number" style={{ ...inp, width: 54 }} value={c.hours} onChange={(e) => upd(j, (x) => ({ ...x, hours: +e.target.value }))} /></td>
                    <td><input type="number" style={{ ...inp, width: 54 }} value={c.n} onChange={(e) => upd(j, (x) => ({ ...x, n: +e.target.value }))} /></td>
                    {DIMS.filter((d) => d.k !== "e").map((d) => (
                      <td key={d.k}>
                        <input type="number" style={inp} value={c.raw[d.k as Key]} onChange={(e) => upd(j, (x) => ({ ...x, raw: { ...x.raw, [d.k]: +e.target.value } }))} />
                        <span style={{ color: "var(--faint)", marginLeft: 4 }}>{res[j].scores[d.k].toFixed(0)}</span>
                      </td>
                    ))}
                    <td>{res[j].scores.e.toFixed(0)}</td>
                    <td><b>{res[j].ivd.toFixed(1)}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button onClick={addCycle} style={btn}>+ Ciclu nou</button>
            {cycles.length > 1 && <button onClick={() => { setCycles(cycles.slice(0, -1)); setSel(Math.max(0, cycles.length - 2)); }} style={btn}>− Șterge ultimul</button>}
            <button onClick={() => navigator.clipboard?.writeText(JSON.stringify({ cycles, cfg }, null, 2))} style={btn}>Copiază JSON</button>
            <button onClick={() => { setCycles(DEFAULT_CYCLES); setCfg(DEFAULT_CFG); setSel(2); }} style={btn}>Resetează la exemplu</button>
          </div>
          <p style={{ color: "var(--faint)", fontSize: 12 }}>Cifra gri = scorul normalizat 0–100. Primul ciclu este baseline-ul. Datele din tabel sunt exemple, nu măsurători reale.</p>
        </section>

        <section style={{ ...box, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          <div>
            <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Cele 6 dimensiuni · ponderi</h2>
            {DIMS.map((d) => (
              <div key={d.k} style={{ marginBottom: 10, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <b>{d.label}</b><span style={{ color: "var(--muted)" }}>pondere {cfg.weights[d.k]}</span>
                </div>
                <div style={{ color: "var(--muted)" }}>{d.q} · <i>{d.metric}</i></div>
                <input type="range" min={0} max={40} value={cfg.weights[d.k]} style={{ width: "100%" }}
                  onChange={(e) => setCfg({ ...cfg, weights: { ...cfg.weights, [d.k]: +e.target.value } })} />
              </div>
            ))}
            <div style={{ color: "var(--faint)", fontSize: 12 }}>Ponderile se normalizează automat la 100%.</div>
          </div>
          <div>
            <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Praguri de acceptare</h2>
            {([
              ["continueMin", "IVD minim pentru CONTINUĂ"],
              ["minDelta", "ΔIVD minim pentru CONTINUĂ"],
              ["abandonMax", "IVD sub care ABANDONEZI"],
              ["vetoDrop", "Veto: scădere max. pe o dimensiune"],
              ["minN", "Eșantion minim (n)"],
              ["targetPer10h", "Țintă eficiență (puncte IVD₅ / 10 ore)"],
            ] as [keyof typeof DEFAULT_CFG, string][]).map(([k, l]) => (
              <label key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 13 }}>
                {l}
                <input type="number" style={inp} value={cfg[k] as number} onChange={(e) => setCfg({ ...cfg, [k]: +e.target.value })} />
              </label>
            ))}
            <h3 style={{ fontSize: 14, margin: "16px 0 6px" }}>Reguli (în ordine)</h3>
            <ol style={{ color: "var(--text2)", fontSize: 13, paddingLeft: 18, margin: 0 }}>
              <li>Veto pe orice dimensiune → CORECTEAZĂ</li>
              <li>IVD sub prag, sau ΔIVD ≤ 0 de 2 ori → ABANDONEAZĂ</li>
              <li>IVD și ΔIVD peste praguri → CONTINUĂ</li>
              <li>Altfel → CORECTEAZĂ</li>
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}

const btn: React.CSSProperties = { background: "var(--btn-bg)", color: "var(--fg)", border: "1px solid var(--btn-border)", borderRadius: 8, padding: "6px 12px", cursor: "pointer" };
