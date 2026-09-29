import type { Metadata } from "next";
import Link from "next/link";

// src/app/debug/observator/harta-cadastrala/idei/page.tsx
//
// Index pentru variantele propuse pentru vederea principală de la
// /debug/observator/harta-cadastrala (care rămâne neatinsă). Fiecare
// variantă e o pagină izolată, cu propriile date derivate din _repoData.ts
// — nimic din harta-cadastrala/page.tsx nu e modificat sau reimportat.

export const metadata: Metadata = {
  title: "EiC · Harta cadastrală — idei",
  description: "Variante propuse pentru vederea principală a hărții cadastrale a repo-ului.",
};

const IDEI = [
  {
    slug: "satuc-cadastral",
    title: "Sătucul cadastral",
    pitch:
      "Plan de sat văzut de sus, cu aceleași parcele reale (module, LOC, zone). Drumul mare și ulițele (una pe zonă) sunt curbate ușor, iar parcelele au hotare comune — gard lateral și gard din spate, fără spații goale. Fiecare casă are acoperiș (culoarea ulitei) și ușă (etapa din pipeline); fișierele-cheie au în drum un monument (fântână, primărie, biserică, moară, troiță). Panoul lateral compară vecinii de hotar (gard comun) cu vecinii reali prin import și arată cât se suprapun.",
  },
  {
    slug: "trafic-in-sat",
    title: "Trafic în sat",
    pitch:
      "Același sat, dar cu o căruță care duce un cuvânt prin pipeline-ul real, pe drumuri (casă → uliță → drumul mare → uliță → casă), în ritm lent. Traseul e cel real de importuri (BFS pe MODULE_EDGES); căruța se oprește în fiecare parcelă: „trece prin” sau „lucrează” (cele 4 etape din pipelineTrace, cu explicație și steag modificat/neschimbat). Două moduri: Demonstrație (cuvinte alese) și Live (ascultă read-only PIPELINE_TRACE_CHANNEL din /learn). Cu pauză, pas cu pas și viteză 0.5×/1×/2×.",
  },
];

export default function HartaCadastralaIdei() {
  return (
    <main className="eic-home" style={{ maxWidth: 780 }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", marginBottom: "0.25rem" }}>
        Harta cadastrală — idei pentru vederea principală
      </h1>
      <p style={{ marginBottom: "1.2rem", opacity: 0.7, fontSize: "0.9rem" }}>
        <Link href="/debug/observator/harta-cadastrala">/debug/observator/harta-cadastrala</Link> rămâne
        exact cum e. Ideile de mai jos sunt variante alternative de explorat, fiecare izolată, în{" "}
        <code>idei/&lt;slug&gt;/</code>.
      </p>

      <ul style={{ display: "grid", gap: "0.9rem", listStyle: "none", padding: 0 }}>
        {IDEI.map((i) => (
          <li key={i.slug}>
            <Link
              href={`/debug/observator/harta-cadastrala/idei/${i.slug}`}
              style={{
                display: "block",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: "1rem 1.1rem",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <strong style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem" }}>{i.title}</strong>
              <p style={{ margin: "0.35rem 0 0", fontSize: "0.88rem", opacity: 0.75 }}>{i.pitch}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
