import type { Metadata } from "next";
import EicHero from "@/components/EicHero";

export const metadata: Metadata = {
  title: "EiC · English in Colours",
  description:
    "See English pronunciation in color — stress, vowels, glides, and silent letters, resolved live as you type.",
};

export default function WelcomePage() {
  return (
    <main className="welcome-page">
      <EicHero />
    </main>
  );
}
