import type { Metadata } from "next";
import EicCulise from "@/components/EicCulise";

export const metadata: Metadata = {
  title: "EiC · Culise",
  description:
    "Vizualizare live a pipeline-ului de randare — nodurile brute și DisplayNode-urile rezolvate, pentru UK și US, per cuvânt.",
};

export default function CulisePage() {
  return (
    <main className="culise-route">
      <EicCulise />
    </main>
  );
}
