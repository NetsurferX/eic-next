import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "EiC · Oglinzi live ale sitului (brainstorm)",
  description: "4 stiluri alternative de a arăta live pipeline-ul real, pe lângă graful din /debug/graph.",
};

const CONCEPTS = [
  {
    slug: "monitor-cardiac",
    title: "Monitor cardiac",
    pitch: "Linie tip ECG — fiecare eveniment de pipeline e un puls; „schimbat” = puls mai înalt.",
  },
  {
    slug: "harta-metrou",
    title: "Hartă de metrou",
    pitch: "Cele 4 etape ca stații pe o linie de metrou; cuvântul curent e „trenul” care se mișcă stație cu stație.",
  },
  {
    slug: "acvariu",
    title: "Acvariu",
    pitch: "4 acvarii (= etape); fiecare cuvânt e un pește care înoată din bazin în bazin, pe măsură ce trece prin pipeline.",
  },
  {
    slug: "turn-control",
    title: "Turn de control",
    pitch: "Stil radar de aeroport — un ecran radial cu 4 sectoare, evenimentele apar ca blip-uri.",
  },
];

export default function LiveBrainstormIndex() {
  return (
    <main className="eic-home">
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", marginBottom: "0.25rem" }}>
        Oglinzi live ale sitului — alte stiluri de vizualizare
      </h1>
      <p style={{ marginBottom: "1.5rem", opacity: 0.7, fontSize: "0.9rem", maxWidth: 640 }}>
        Toate cele 4 folosesc EXACT același canal live existent (
        <code>PIPELINE_TRACE_CHANNEL</code> din <code>lib/pipelineTrace.ts</code>, deja emis din{" "}
        <code>WordRenderer.tsx</code>) — nimic nu e modificat acolo, doar se ascultă. Deschide{" "}
        <code>/learn</code> sau <code>/</code> într-un alt tab și joacă/scrie: paginile de mai jos
        se actualizează live, în paralel. Alternativă/completare la decizia în așteptare de pe{" "}
        <code>/debug/graph</code> (Variantă A vs B pentru stilul „hartă”).
      </p>

      <ul style={{ display: "grid", gap: "0.9rem", listStyle: "none", padding: 0, maxWidth: 640 }}>
        {CONCEPTS.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/debug/live/${c.slug}`}
              style={{
                display: "block",
                border: "1px solid var(--color-border, #e8e6e1)",
                borderRadius: 10,
                padding: "1rem 1.1rem",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem", marginBottom: "0.25rem" }}>
                {c.title}
              </div>
              <div style={{ fontSize: "0.85rem", opacity: 0.75 }}>{c.pitch}</div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
