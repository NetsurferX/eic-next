"use client";

import { useState } from "react";
import { TINCTURES, blazon, filledSlots, isValid, validate, type Arms, type Tincture } from "./_blazon";

const SAMPLES: { name: string; arms: Arms }[] = [
  {
    name: "1. Validă (câmp plin)",
    arms: {
      field: { partition: "plin", tinctures: ["azur"] },
      charge: { kind: "vulpe", attitude: "stând", tincture: "aur" },
      ordinaries: [{ kind: "bordura", tincture: "argint" }],
    },
  },
  {
    name: "2. Regula tincturilor încălcată",
    arms: {
      field: { partition: "plin", tinctures: ["azur"] },
      charge: { kind: "vulpe", attitude: "sărind", tincture: "rosu" },
    },
  },
  {
    name: "3. Vulpe invizibilă",
    arms: {
      field: { partition: "plin", tinctures: ["verde"] },
      charge: { kind: "vulpe", attitude: "șezând", tincture: "verde" },
    },
  },
  {
    name: "4. Număr greșit de tincturi",
    arms: {
      field: { partition: "vertical", tinctures: ["azur"] },
      charge: { kind: "vulpe", attitude: "stând", tincture: "aur" },
    },
  },
  {
    name: "5. Câmp împărțit, stemă completă",
    arms: {
      field: { partition: "vertical", tinctures: ["azur", "aur"] },
      charge: { kind: "vulpe", attitude: "sărind", tincture: "rosu" },
      ordinaries: [{ kind: "bordura", tincture: "argint" }],
      crest: "carte",
      supporters: "lauri",
      motto: "Read in colours",
    },
  },
];

function Swatch({ t }: { t: Tincture }) {
  return (
    <span
      title={TINCTURES[t].label}
      style={{
        display: "inline-block",
        width: 18,
        height: 18,
        borderRadius: 4,
        background: TINCTURES[t].hex,
        border: "1px solid #888",
        marginRight: 4,
      }}
    />
  );
}

export default function HeraldicaDebug() {
  const [strict, setStrict] = useState(false);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Heraldică EiC: formalism (probă)</h1>
      <p style={{ opacity: 0.7, marginTop: 0 }}>Model de date + validator. Fără integrare în joc.</p>

      <label style={{ display: "block", margin: "12px 0" }}>
        <input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)} /> Mod strict
        (avertismentele resping stema)
      </label>

      {SAMPLES.map(({ name, arms }) => {
        const issues = validate(arms);
        const ok = isValid(arms, strict);
        return (
          <section key={name} style={{ border: "1px solid #8884", borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <strong>{name}</strong>
              <span style={{ color: ok ? "#2e8b57" : "#d62839", fontWeight: 600 }}>{ok ? "ACCEPTATĂ" : "RESPINSĂ"}</span>
            </div>
            <div style={{ margin: "8px 0" }}>
              {arms.field.tinctures.map((t, i) => (
                <Swatch key={`f${i}`} t={t} />
              ))}
              <span style={{ margin: "0 6px" }}>→</span>
              <Swatch t={arms.charge.tincture} />
              {(arms.ordinaries ?? []).map((o, i) => (
                <Swatch key={`o${i}`} t={o.tincture} />
              ))}
            </div>
            <p style={{ margin: "4px 0" }}>{blazon(arms)}</p>
            <p style={{ margin: "4px 0", fontSize: 12, opacity: 0.7 }}>Sloturi: {filledSlots(arms).join(", ")}</p>
            {issues.length > 0 && (
              <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13 }}>
                {issues.map((i, k) => (
                  <li key={k} style={{ color: i.severity === "error" ? "#d62839" : "#b8860b" }}>
                    [{i.severity}] {i.message}
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </main>
  );
}
