import type { Metadata } from "next";
import ModuleGraph from "@/components/ModuleGraph";
import PipelineTraceGraph from "@/components/PipelineTraceGraph";

export const metadata: Metadata = {
  title: "EiC · Graf module",
  description:
    "Graf de dependințe (import-uri) al pipeline-ului de engine — noduri = fișiere, muchii = import-uri, mărime nod ~ nr. de conexiuni.",
};

export default function ModuleGraphPage() {
  return (
    <main className="eic-home">
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", marginBottom: "0.25rem" }}>
        Graf de dependințe — pipeline engine
      </h1>
      <p style={{ marginBottom: "1.25rem", opacity: 0.7, fontSize: "0.9rem" }}>
        Snapshot static al import-urilor reale din <code>src/lib/**</code> și cele 3 puncte de intrare.
        Actualizat manual — vezi <code>src/lib/moduleGraphData.ts</code>.
      </p>
      <ModuleGraph />

      <hr style={{ margin: "2.5rem 0", border: "none", borderTop: "1px solid var(--color-border, #e8e6e1)" }} />

      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", marginBottom: "0.25rem" }}>
        Live — sincronizat cu orice pagină rulează pipeline-ul
      </h2>
      <p style={{ marginBottom: "1.25rem", opacity: 0.7, fontSize: "0.9rem" }}>
        Instrumentarea e pusă direct în <code>WordRenderer.tsx</code>, care e componenta unică folosită
        de pagina principală (<code>/</code>, editorul liber), de <code>/learn</code> și de{" "}
        <code>ColourGame.tsx</code> — deci orice cuvânt colorat oriunde în site apare aici, nu doar din joc.
        Pipeline-ul client-side e strict liniar (segment/align/phonologicalRules rulează deja server-side,
        în <code>db.ts</code>, înainte ca nodurile să ajungă aici) — deci &bdquo;următorul pas&rdquo; e mereu
        pasul fix următor din secvență, nu o ramificație reală.
      </p>
      <PipelineTraceGraph />
    </main>
  );
}
