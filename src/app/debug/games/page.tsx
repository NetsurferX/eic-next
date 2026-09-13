import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "EiC · Concepte de joc (brainstorm)",
  description: "Wireframe-uri live pentru 4 concepte noi de mini-joc — doar propuneri, nimic din /learn e atins.",
};

const CONCEPTS = [
  {
    slug: "color-hunt",
    title: "Vânătoare de culoare",
    pitch: "Grilă de cuvinte; atingi doar cele cu culoarea-țintă, contra cronometru.",
    reuse: "WordRenderer + culorile din colors.ts",
  },
  {
    slug: "memory-perechi",
    title: "Memorie de perechi",
    pitch: "Cărți întoarse: potrivești cuvântul scris cu eticheta lui de culoare/sunet.",
    reuse: "WordRenderer, layout tip joc de cărți",
  },
  {
    slug: "cursa-vulpii",
    title: "Cursa Vulpii",
    pitch: "Vulpea aleargă pe o pistă; fiecare răspuns corect o mișcă înainte, o greșeală o oprește o rundă.",
    reuse: "Mascot.tsx (poze existente), GameSession.streak",
  },
  {
    slug: "dictare-colorata",
    title: "Dictare colorată",
    pitch: "Aude cuvântul (Web Speech API), alege varianta randată corect dintre 3 variante cu culori/diacritice greșite.",
    reuse: "speakWord, WordRenderer",
  },
];

export default function GamesBrainstormIndex() {
  return (
    <main className="eic-home">
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", marginBottom: "0.25rem" }}>
        Concepte noi de mini-joc — brainstorm
      </h1>
      <p style={{ marginBottom: "1.5rem", opacity: 0.7, fontSize: "0.9rem", maxWidth: 640 }}>
        4 idei, fiecare pe o pagină izolată sub <code>/debug/games/*</code>, cu date demo proprii
        (<code>_demoWords.ts</code>) — nimic din <code>/learn</code>, <code>ColourGame.tsx</code> sau{" "}
        <code>gameTypes.ts</code> nu e modificat. Alege una și cer spec detaliat înainte de implementare reală.
      </p>

      <ul style={{ display: "grid", gap: "0.9rem", listStyle: "none", padding: 0, maxWidth: 640 }}>
        {CONCEPTS.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/debug/games/${c.slug}`}
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
              <div style={{ fontSize: "0.85rem", opacity: 0.75, marginBottom: "0.35rem" }}>{c.pitch}</div>
              <div style={{ fontSize: "0.75rem", opacity: 0.5 }}>reutilizează: {c.reuse}</div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
