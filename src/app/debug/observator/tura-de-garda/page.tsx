"use client";

import { useState } from "react";
import Link from "next/link";
import { INCIDENTS, MODULE_NODES, type Incident } from "../_repoData";

/* =================================================================
   CONCEPT 3/3 — "Tura de gardă" (stil SRE on-call)
   Alegi un tichet din jurnalul real de incidente (_repoData.ts) și
   parcurgi manual, pas cu pas: simptom -> module suspecte (ghicite
   de tine, nu date direct) -> cauza reală -> fix. Cele 2 tichete
   "deschise" chiar n-au fix încă în cod.
   ================================================================= */

type Stage = "tichete" | "simptom" | "suspecti" | "cauza" | "fix";

const STAGE_ORDER: Stage[] = ["simptom", "suspecti", "cauza", "fix"];
const STAGE_LABEL: Record<Stage, string> = {
  tichete: "Tichete",
  simptom: "1. Simptom",
  suspecti: "2. Module suspecte",
  cauza: "3. Cauza reală",
  fix: "4. Fix",
};

export default function TuraDeGarda() {
  const [ticket, setTicket] = useState<Incident | null>(null);
  const [stage, setStage] = useState<Stage>("simptom");
  const [guess, setGuess] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const [solved, setSolved] = useState<string[]>([]);

  function openTicket(inc: Incident) {
    setTicket(inc);
    setStage("simptom");
    setGuess(new Set());
    setRevealed(false);
  }

  function toggleGuess(id: string) {
    const next = new Set(guess);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setGuess(next);
  }

  function checkGuess() {
    setRevealed(true);
  }

  function nextStage() {
    const i = STAGE_ORDER.indexOf(stage);
    if (i < STAGE_ORDER.length - 1) setStage(STAGE_ORDER[i + 1]);
    else if (ticket) {
      setSolved((s) => (s.includes(ticket.id) ? s : [...s, ticket.id]));
      setTicket(null);
    }
  }

  const correctSet = new Set(ticket?.modules ?? []);
  const guessHits = ticket ? [...guess].filter((g) => correctSet.has(g)).length : 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0d1117",
        color: "#c9d1d9",
        fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
        padding: "1.5rem 1.5rem 3rem",
      }}
    >
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.3rem" }}>
          <h1 style={{ fontSize: "1.1rem", margin: 0 }}>🚨 Tura de gardă — eic-next on-call</h1>
          <span style={{ fontSize: "0.72rem", color: "#8b949e" }}>rezolvate azi: {solved.length}</span>
        </div>
        <p style={{ fontSize: "0.78rem", color: "#8b949e", marginTop: 0, marginBottom: "1.3rem" }}>
          <Link href="/debug/observator" style={{ color: "#58a6ff" }}>
            ← alte concepte
          </Link>{" "}
          · fiecare tichet e un bug real, deja documentat în istoricul sesiunilor de engine.
        </p>

        {!ticket ? (
          <div style={{ display: "grid", gap: "0.6rem" }}>
            {INCIDENTS.map((inc) => (
              <button
                key={inc.id}
                onClick={() => openTicket(inc)}
                style={{
                  textAlign: "left",
                  background: "#161b22",
                  border: `1px solid ${inc.status === "deschis" ? "#f85149" : "#30363d"}`,
                  borderRadius: 8,
                  padding: "0.7rem 0.9rem",
                  cursor: "pointer",
                  color: "inherit",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <strong>
                    {inc.id} · {inc.title}
                  </strong>
                  <span style={{ color: inc.status === "deschis" ? "#f85149" : "#3fb950" }}>
                    {inc.status === "deschis" ? "DESCHIS" : solved.includes(inc.id) ? "rezolvat de tine" : "rezolvat istoric"}
                  </span>
                </div>
                <p style={{ margin: "0.3rem 0 0", fontSize: "0.75rem", color: "#8b949e" }}>{inc.severity}</p>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: "1.1rem 1.2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#8b949e", marginBottom: "0.6rem" }}>
              <span>
                {ticket.id} · {STAGE_LABEL[stage]}
              </span>
              <button onClick={() => setTicket(null)} style={{ background: "none", border: "none", color: "#8b949e", cursor: "pointer" }}>
                ✕ închide tichetul
              </button>
            </div>
            <h2 style={{ fontSize: "1rem", margin: "0 0 0.8rem" }}>{ticket.title}</h2>

            {stage === "simptom" && (
              <>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.5 }}>{ticket.symptom}</p>
                <Btn onClick={nextStage}>Am înțeles simptomul → caut modulele suspecte</Btn>
              </>
            )}

            {stage === "suspecti" && (
              <>
                <p style={{ fontSize: "0.85rem", color: "#8b949e", marginBottom: "0.6rem" }}>
                  Din tot graful ({MODULE_NODES.length} module), pe care le bănuiești? Alege oricâte, apoi verifică.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.8rem" }}>
                  {MODULE_NODES.map((n) => {
                    const picked = guess.has(n.id);
                    const isCorrect = revealed && correctSet.has(n.id);
                    const isWrong = revealed && picked && !correctSet.has(n.id);
                    const isMissed = revealed && !picked && correctSet.has(n.id);
                    return (
                      <button
                        key={n.id}
                        onClick={() => !revealed && toggleGuess(n.id)}
                        style={{
                          fontSize: "0.72rem",
                          padding: "0.25rem 0.5rem",
                          borderRadius: 5,
                          cursor: revealed ? "default" : "pointer",
                          background: isCorrect ? "#1b4721" : isWrong ? "#4a1414" : isMissed ? "#3b2f0a" : picked ? "#21262d" : "#0d1117",
                          border: `1px solid ${isCorrect ? "#3fb950" : isWrong ? "#f85149" : isMissed ? "#d29922" : "#30363d"}`,
                          color: "#c9d1d9",
                        }}
                      >
                        {n.label}
                      </button>
                    );
                  })}
                </div>
                {!revealed ? (
                  <Btn onClick={checkGuess} disabled={guess.size === 0}>
                    Verifică ({guess.size} selectate)
                  </Btn>
                ) : (
                  <>
                    <p style={{ fontSize: "0.82rem", color: guessHits === correctSet.size ? "#3fb950" : "#d29922" }}>
                      {guessHits}/{correctSet.size} module reale ghicite corect.{" "}
                      <span style={{ color: "#8b949e" }}>(verde = corect, roșu = fals-pozitiv, galben = ratat)</span>
                    </p>
                    <Btn onClick={nextStage}>Vezi cauza reală →</Btn>
                  </>
                )}
              </>
            )}

            {stage === "cauza" && (
              <>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.5 }}>{ticket.rootCause}</p>
                <Btn onClick={nextStage}>{ticket.fix ? "Vezi fix-ul →" : "Închide (tichet încă deschis)"}</Btn>
              </>
            )}

            {stage === "fix" && (
              <>
                {ticket.fix ? (
                  <p style={{ fontSize: "0.88rem", lineHeight: 1.5, color: "#3fb950" }}>{ticket.fix}</p>
                ) : (
                  <p style={{ fontSize: "0.88rem", lineHeight: 1.5, color: "#d29922" }}>
                    Fără fix aplicat încă în cod — tichetul rămâne deschis. (Ai o propunere? Se discută separat,
                    nu se implementează din acest joc.)
                  </p>
                )}
                <Btn onClick={nextStage}>Închide tichetul</Btn>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function Btn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        marginTop: "0.4rem",
        fontSize: "0.82rem",
        padding: "0.45rem 0.9rem",
        borderRadius: 6,
        border: "1px solid #30363d",
        background: disabled ? "#161b22" : "#21262d",
        color: disabled ? "#484f58" : "#c9d1d9",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
