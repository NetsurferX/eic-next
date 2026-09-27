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
      "Aceleași parcele (module reale, LOC, zone), dar grupate pe ulițe (= ModuleGroup) ca un sătuc. Fiecare casă are un acoperiș (culoarea ulitei/zonei) și o ușă (culoarea etapei din pipeline). Panoul lateral arată, pentru fiecare casă, DOUĂ tipuri de vecinătate — vecinii de gard (aceeași uliță) vs. vecinii reali prin drum (import-uri) — și cât de mult se suprapun.",
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
