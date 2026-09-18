import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "EiC · Harta site-ului",
  description:
    "Index central: toate paginile aplicației EiC, grupate pe secțiuni, cu link direct către fiecare.",
};

type PageLink = {
  href: string;
  label: string;
  note?: string;
};

type PageSection = {
  title: string;
  intro?: string;
  links: PageLink[];
};

const SECTIONS: PageSection[] = [
  {
    title: "Aplicație (producție)",
    links: [
      { href: "/", label: "/", note: "Ecranul principal — lecția curentă" },
      { href: "/learn", label: "/learn", note: "Fluxul de învățare" },
      { href: "/eic2", label: "/eic2", note: "Modul recapitulare ping-pong" },
      { href: "/landing", label: "/landing", note: "Pagină de prezentare" },
      { href: "/culise", label: "/culise", note: "Pagină culise / behind the scenes" },
    ],
  },
  {
    title: "Unelte dezvoltator",
    links: [
      { href: "/debug/graph", label: "/debug/graph", note: "Graful live al modulelor (D3)" },
    ],
  },
  {
    title: "Concepte jocuri — /debug/games",
    intro: "Wireframe-uri de joc pentru elevi, date demo auto-conținute.",
    links: [
      { href: "/debug/games", label: "/debug/games", note: "index" },
      { href: "/debug/games/color-hunt", label: "→ color-hunt" },
      { href: "/debug/games/memory-perechi", label: "→ memory-perechi" },
      { href: "/debug/games/cursa-vulpii", label: "→ cursa-vulpii" },
      { href: "/debug/games/dictare-colorata", label: "→ dictare-colorata" },
    ],
  },
  {
    title: "Concepte jocuri (variantă) — /debug/game-concepts",
    links: [
      { href: "/debug/game-concepts", label: "/debug/game-concepts", note: "index" },
      { href: "/debug/game-concepts/sound-hunt", label: "→ sound-hunt" },
      { href: "/debug/game-concepts/syllable-tower", label: "→ syllable-tower" },
      { href: "/debug/game-concepts/vowel-race", label: "→ vowel-race" },
      { href: "/debug/game-concepts/color-memory", label: "→ color-memory" },
    ],
  },
  {
    title: "Gamification — meta-progres — /debug/gamification",
    intro: "5 concepte de progres pe termen lung (hărți, insigne, streak, monedă, misiune zilnică).",
    links: [
      { href: "/debug/gamification", label: "/debug/gamification", note: "index" },
      { href: "/debug/gamification/harta-sunetelor", label: "→ harta-sunetelor" },
      { href: "/debug/gamification/insigne", label: "→ insigne" },
      { href: "/debug/gamification/calendarul-vulpii", label: "→ calendarul-vulpii" },
      { href: "/debug/gamification/cufarul-vulpii", label: "→ cufarul-vulpii" },
      { href: "/debug/gamification/provocarea-zilei", label: "→ provocarea-zilei" },
    ],
  },
  {
    title: "Vizualizări live pipeline — /debug/live",
    intro: "Abonați read-only la PIPELINE_TRACE_CHANNEL.",
    links: [
      { href: "/debug/live", label: "/debug/live", note: "index" },
      { href: "/debug/live/monitor-cardiac", label: "→ monitor-cardiac" },
      { href: "/debug/live/harta-metrou", label: "→ harta-metrou" },
      { href: "/debug/live/acvariu", label: "→ acvariu" },
      { href: "/debug/live/turn-control", label: "→ turn-control" },
    ],
  },
  {
    title: "Observator — familiarizare cu propriul cod — /debug/observator",
    intro: "3 concepte pentru dezvoltator, nu pentru elevi.",
    links: [
      { href: "/debug/observator", label: "/debug/observator", note: "index" },
      { href: "/debug/observator/sala-control", label: "→ sala-control" },
      { href: "/debug/observator/harta-cadastrala", label: "→ harta-cadastrala" },
      { href: "/debug/observator/tura-de-garda", label: "→ tura-de-garda" },
    ],
  },
];

export default function DebugIndex() {
  return (
    <main className="eic-home" style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", marginBottom: "0.25rem" }}>
        Harta site-ului EiC
      </h1>
      <p style={{ marginBottom: "1.5rem", opacity: 0.7, fontSize: "0.9rem", maxWidth: 680 }}>
        Index nou, adăugat pentru navigare rapidă între toate paginile existente. Nu modifică
        niciun fișier existent — doar adaugă acest punct central de acces.
      </p>

      {SECTIONS.map((section) => (
        <section key={section.title} style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1.05rem", marginBottom: "0.25rem" }}>{section.title}</h2>
          {section.intro && (
            <p style={{ fontSize: "0.82rem", opacity: 0.65, marginBottom: "0.5rem", maxWidth: 620 }}>
              {section.intro}
            </p>
          )}
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.35rem" }}>
            {section.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    borderBottom: "1px solid transparent",
                  }}
                >
                  <code>{link.label}</code>
                </Link>
                {link.note && (
                  <span style={{ fontSize: "0.8rem", opacity: 0.55 }}> — {link.note}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
