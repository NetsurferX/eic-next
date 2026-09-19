import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "EiC · Concepte de joc (brainstorm)",
  description: "Wireframe-uri live pentru 11 concepte de mini-joc — doar propuneri, nimic din /learn e atins.",
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
  {
    slug: "trenul-cuvintelor",
    title: "Trenul Cuvintelor",
    pitch: "Un vagon derulează peste o linie de tren; apeși STOP doar când vagonul cu culoarea-țintă e chiar în stație.",
    reuse: "WordRenderer, mecanică nouă de timing (single-lane, nu grilă)",
  },
  {
    slug: "bulele-vulpii",
    title: "Bulele Vulpii",
    pitch: "Vulpea ROSTEȘTE un cuvânt (fără text); spargi doar bulele plutitoare cu acel cuvânt scris.",
    reuse: "speakWord, Mascot.tsx — testează sunet→scris fără sprijin de culoare",
  },
  {
    slug: "puzzle-sunetelor",
    title: "Puzzle-ul Sunetelor",
    pitch: "Grafemele unui cuvânt apar amestecate ca piese; le atingi în ordine ca să reconstruiești cuvântul.",
    reuse: "WordRenderer (la final), nodurile GameNode ca piese individuale",
  },
  {
    slug: "sortorul-fonetic",
    title: "Sortorul Fonetic",
    pitch: "3 coșuri de culoare vizibile simultan; trimiți fiecare cuvânt spre coșul cu culoarea lui dominantă.",
    reuse: "WordRenderer — metaforă de fabrică de sortare, nu de reflex-pe-timp",
  },
  {
    slug: "detectivul-de-cuvinte",
    title: "Detectivul de Cuvinte",
    pitch: "Vulpea a ales un cuvânt-mister; pui întrebări despre culoarea dominantă ca să elimini candidați, apoi ghicești.",
    reuse: "WordRenderer, Mascot.tsx — singurul concept de deducție logică, nu de reflex",
  },
  {
    slug: "poarta-fonetica",
    title: "Poarta Fonetică",
    pitch: "Mini-aventură pe 4 camere: la fiecare poartă alegi ușa cu culoarea corectă ca să treci mai departe.",
    reuse: "WordRenderer, Mascot.tsx — cadru narativ/progresie, absent din restul conceptelor",
  },
  {
    slug: "stafeta-vulpilor",
    title: "Ștafeta Vulpilor",
    pitch: "5 checkpoint-uri; la fiecare alegi rută sigură (câștig mic) sau riscantă (câștig mare, recul la greșeală).",
    reuse: "WordRenderer, Mascot.tsx — element strategic de risc/recompensă",
  },
];

export default function GamesBrainstormIndex() {
  return (
    <main className="eic-home">
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", marginBottom: "0.25rem" }}>
        Concepte noi de mini-joc — brainstorm
      </h1>
      <p style={{ marginBottom: "1.5rem", opacity: 0.7, fontSize: "0.9rem", maxWidth: 640 }}>
        11 idei, fiecare pe o pagină izolată sub <code>/debug/games/*</code>, cu date demo proprii
        (<code>_demoWords.ts</code>) și stil vizual partajat (<code>_gameShell.module.css</code>) — nimic din{" "}
        <code>/learn</code>, <code>ColourGame.tsx</code> sau <code>gameTypes.ts</code> nu e modificat.
        Alege una și cer spec detaliat înainte de implementare reală.
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
