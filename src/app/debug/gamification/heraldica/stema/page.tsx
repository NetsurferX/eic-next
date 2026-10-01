"use client";

import { useState } from "react";
import {
  PARTITIONS,
  TINCTURES,
  blazon,
  isValid,
  validate,
  type Arms,
  type Attitude,
  type CrestKind,
  type OrdinaryKind,
  type Partition,
  type SupportersKind,
  type Tincture,
} from "../_blazon";
import { Stema } from "../_Stema";

const TINCT = (Object.keys(TINCTURES) as Tincture[]).map((t) => ({ value: t, text: TINCTURES[t].label }));
const TINCT_OPT = [{ value: "" as const, text: "—" }, ...TINCT];

function Sel<V extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: V;
  onChange: (v: V) => void;
  options: { value: V; text: string }[];
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", fontSize: 12, gap: 2 }}>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value as V)} style={{ padding: 4, fontSize: 14 }}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.text}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function StemaDebug() {
  const [partition, setPartition] = useState<Partition>("plin");
  const [t0, setT0] = useState<Tincture>("azur");
  const [t1, setT1] = useState<Tincture>("aur");
  const [foxT, setFoxT] = useState<Tincture>("aur");
  const [attitude, setAttitude] = useState<Attitude>("stând");
  const [ord, setOrd] = useState<Record<OrdinaryKind, Tincture | "">>({ bordura: "argint", crucea: "", capul: "" });
  const [crest, setCrest] = useState<CrestKind | "">("");
  const [supporters, setSupporters] = useState<SupportersKind | "">("");
  const [motto, setMotto] = useState("");
  const [strict, setStrict] = useState(false);

  const arms: Arms = {
    field: { partition, tinctures: PARTITIONS[partition].count === 1 ? [t0] : [t0, t1] },
    charge: { kind: "vulpe", attitude, tincture: foxT },
    ordinaries: (["bordura", "crucea", "capul"] as const).flatMap((k) =>
      ord[k] ? [{ kind: k, tincture: ord[k] as Tincture }] : [],
    ),
    crest: crest || undefined,
    supporters: supporters || undefined,
    motto: motto || undefined,
  };

  const issues = validate(arms);
  const ok = isValid(arms, strict);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Stema EiC: desen (probă)</h1>
      <p style={{ opacity: 0.7, marginTop: 0 }}>Desen provizoriu al Vulpii. Fără integrare în joc.</p>

      <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
        <Stema arms={arms} width={300} />
      </div>

      <p style={{ margin: "4px 0" }}>{blazon(arms)}</p>
      <p style={{ margin: "4px 0", fontWeight: 600, color: ok ? "#2e8b57" : "#d62839" }}>
        {ok ? "ACCEPTATĂ" : "RESPINSĂ"}
      </p>
      <label style={{ fontSize: 13 }}>
        <input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)} /> Mod strict
      </label>
      {issues.length > 0 && (
        <ul style={{ paddingLeft: 18, fontSize: 13 }}>
          {issues.map((i, k) => (
            <li key={k} style={{ color: i.severity === "error" ? "#d62839" : "#b8860b" }}>
              [{i.severity}] {i.message}
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginTop: 12 }}>
        <Sel
          label="Partiție"
          value={partition}
          onChange={setPartition}
          options={(Object.keys(PARTITIONS) as Partition[]).map((p) => ({ value: p, text: p }))}
        />
        <Sel label="Câmp 1" value={t0} onChange={setT0} options={TINCT} />
        {PARTITIONS[partition].count === 2 && <Sel label="Câmp 2" value={t1} onChange={setT1} options={TINCT} />}
        <Sel label="Vulpe: tinctură" value={foxT} onChange={setFoxT} options={TINCT} />
        <Sel
          label="Vulpe: poziție"
          value={attitude}
          onChange={setAttitude}
          options={(["stând", "sărind", "șezând"] as const).map((a) => ({ value: a, text: a }))}
        />
        <Sel label="Bordură" value={ord.bordura} onChange={(v) => setOrd({ ...ord, bordura: v })} options={TINCT_OPT} />
        <Sel label="Cruce" value={ord.crucea} onChange={(v) => setOrd({ ...ord, crucea: v })} options={TINCT_OPT} />
        <Sel label="Cap" value={ord.capul} onChange={(v) => setOrd({ ...ord, capul: v })} options={TINCT_OPT} />
        <Sel
          label="Cimier"
          value={crest}
          onChange={setCrest}
          options={[
            { value: "", text: "—" },
            { value: "stea", text: "stea" },
            { value: "coroană", text: "coroană" },
            { value: "carte", text: "carte" },
          ]}
        />
        <Sel
          label="Suporți"
          value={supporters}
          onChange={setSupporters}
          options={[
            { value: "", text: "—" },
            { value: "lauri", text: "lauri" },
            { value: "stindarde", text: "stindarde" },
          ]}
        />
        <label style={{ display: "flex", flexDirection: "column", fontSize: 12, gap: 2, gridColumn: "1 / -1" }}>
          Deviză
          <input
            value={motto}
            onChange={(e) => setMotto(e.target.value)}
            maxLength={60}
            style={{ padding: 6, fontSize: 14 }}
          />
        </label>
      </div>
    </main>
  );
}
