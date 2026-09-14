import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "EiC · Observator (brainstorm)",
  description:
    "3 concepte noi de gamificare pentru developer — familiarizare cu propriul cod, stil monitorizare/hartă/tură de gardă.",
};

const CONCEPTS = [
  {
    slug: "sala-control",
    title: "Sala de control",
    pitch:
      "Dashboard stil Prometheus/Grafana peste chiar codul EiC: panouri cu \"sănătatea\" fiecărui grup de module (LOC, nr. fișiere), un panou de alerte cu bug-urile încă deschise și un istoric de \"incidente\" rezolvate.",
  },
  {
    slug: "harta-cadastrala",
    title: "Harta cadastrală",
    pitch:
      "Repo-ul ca o hartă cadastrală: fiecare fișier e o parcelă (mărime = LOC, culoare = grup), fiecare click deschide o \"carte funciară\" cu rolul fișierului, vecinii lui reali (import-uri) și eventualele \"servituți\" (hub-uri de care depind multe alte parcele).",
  },
  {
    slug: "tura-de-garda",
    title: "Tura de gardă",
    pitch:
      "Simulator stil SRE on-call: alegi un \"tichet\" (un bug real, documentat) și parcurgi manual simptom → module suspecte → cauză reală → fix, inclusiv cele 2 tichete încă deschise azi în engine.",
  },
];

export default function ObservatorIndex() {
  return (
    <main className="eic-home">
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", marginBottom: "0.25rem" }}>
        Observator — 3 concepte noi de familiarizare cu propriul cod
      </h1>
      <p style={{ marginBottom: "1rem", opacity: 0.7, fontSize: "0.9rem", maxWidth: 680 }}>
        Set separat de <code>/debug/graph</code> și <code>/debug/live</code> — niciun fișier existent
        nu e atins. Fiecare pagină de mai jos e independentă, cu date proprii în{" "}
        <code>_repoData.ts</code> (LOC real per fișier + un jurnal de 7 bug-uri reale, extrase din
        sesiunile deja documentate — 2 dintre ele chiar sunt încă nerezolvate în cod).
      </p>
      <p
        style={{
          marginBottom: "1.75rem",
          fontSize: "0.85rem",
          background: "var(--color-border-soft)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          padding: "0.7rem 0.9rem",
          maxWidth: 680,
        }}
      >
        Notă: graful &bdquo;à la Erdős&rdquo; (drum minim BFS între module, grad de nod, sortare topologică) există
        deja și e live la <Link href="/debug/graph">/debug/graph</Link> — comentariul din{" "}
        <code>moduleGraphData.ts</code> chiar îl numește așa. N-am duplicat conceptul; cele 3 de mai jos
        sunt unghiuri noi.
      </p>

      <ul style={{ display: "grid", gap: "0.9rem", listStyle: "none", padding: 0, maxWidth: 680 }}>
        {CONCEPTS.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/debug/observator/${c.slug}`}
              style={{
                display: "block",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: "1rem 1.1rem",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <strong style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem" }}>{c.title}</strong>
              <p style={{ margin: "0.35rem 0 0", fontSize: "0.88rem", opacity: 0.75 }}>{c.pitch}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
