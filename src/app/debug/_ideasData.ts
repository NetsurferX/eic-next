// src/app/debug/_ideasData.ts
//
// Sursă unică pentru navigarea între paginile cu idei/concepte din /debug.
// Folosită de _IdeasNav.tsx (butonul plutitor). Nu importă nimic din engine,
// levels.ts sau gameTypes.ts.
//
// Când apare o pagină nouă de idei: adaugi UN rând în secțiunea ei.

export interface IdeaPage {
  href: string;
  label: string;
}

export interface IdeaSection {
  id: string;
  emoji: string;
  /** Titlu scurt — apare în pastila plutitoare, deci păstrează-l scurt. */
  title: string;
  /** Indexul secțiunii (prima pagină din ciclul prev/next). */
  hub: IdeaPage;
  pages: IdeaPage[];
}

export const SECTIONS: IdeaSection[] = [
  {
    id: "gamification",
    emoji: "🏆",
    title: "Gamificare",
    hub: { href: "/debug/gamification", label: "Index gamificare" },
    pages: [
      { href: "/debug/gamification/harta-sunetelor", label: "🗺️ Harta Sunetelor" },
      { href: "/debug/gamification/insigne", label: "🎖️ Colecția de Insigne" },
      { href: "/debug/gamification/calendarul-vulpii", label: "🔥 Calendarul Vulpii" },
      { href: "/debug/gamification/cufarul-vulpii", label: "💰 Cufărul Vulpii" },
      { href: "/debug/gamification/provocarea-zilei", label: "🎯 Provocarea Zilei" },
    ],
  },
  {
    id: "games",
    emoji: "🎮",
    title: "Mini-jocuri",
    hub: { href: "/debug/games", label: "Index mini-jocuri" },
    pages: [
      { href: "/debug/games/color-hunt", label: "Vânătoare de culoare" },
      { href: "/debug/games/memory-perechi", label: "Memorie de perechi" },
      { href: "/debug/games/cursa-vulpii", label: "Cursa Vulpii" },
      { href: "/debug/games/dictare-colorata", label: "Dictare colorată" },
      { href: "/debug/games/trenul-cuvintelor", label: "Trenul Cuvintelor" },
      { href: "/debug/games/bulele-vulpii", label: "Bulele Vulpii" },
      { href: "/debug/games/puzzle-sunetelor", label: "Puzzle-ul Sunetelor" },
      { href: "/debug/games/sortorul-fonetic", label: "Sortorul Fonetic" },
      { href: "/debug/games/detectivul-de-cuvinte", label: "Detectivul de Cuvinte" },
      { href: "/debug/games/poarta-fonetica", label: "Poarta Fonetică" },
      { href: "/debug/games/stafeta-vulpilor", label: "Ștafeta Vulpilor" },
    ],
  },
  {
    id: "game-concepts",
    emoji: "🧩",
    title: "Concepte joc (v2)",
    hub: { href: "/debug/game-concepts", label: "Index concepte joc" },
    pages: [
      { href: "/debug/game-concepts/sound-hunt", label: "Vânătoare de Sunete" },
      { href: "/debug/game-concepts/syllable-tower", label: "Turnul Silabelor" },
      { href: "/debug/game-concepts/vowel-race", label: "Cursa Vocalelor" },
      { href: "/debug/game-concepts/color-memory", label: "Memoria Culorilor" },
    ],
  },
  {
    id: "mascot-rive",
    emoji: "🦊",
    title: "Mascotă Rive",
    hub: { href: "/debug/mascot-rive", label: "Index mascotă" },
    pages: [
      { href: "/debug/mascot-rive/priviri-si-tilt", label: "Priviri și Tilt" },
      { href: "/debug/mascot-rive/urmarire-cu-inertie", label: "Urmărire cu Inerție" },
      { href: "/debug/mascot-rive/reactie-de-proximitate", label: "Reacție de Proximitate" },
    ],
  },
  {
    id: "live",
    emoji: "📡",
    title: "Live pipeline",
    hub: { href: "/debug/live", label: "Index live" },
    pages: [
      { href: "/debug/live/monitor-cardiac", label: "Monitor cardiac" },
      { href: "/debug/live/harta-metrou", label: "Harta de metrou" },
      { href: "/debug/live/acvariu", label: "Acvariu" },
      { href: "/debug/live/turn-control", label: "Turn de control" },
    ],
  },
  {
    id: "observator",
    emoji: "🔭",
    title: "Observator",
    hub: { href: "/debug/observator", label: "Index observator" },
    pages: [
      { href: "/debug/observator/sala-control", label: "🎛 Sala de control" },
      { href: "/debug/observator/harta-cadastrala", label: "🗺 Harta cadastrală" },
      { href: "/debug/observator/tura-de-garda", label: "🚨 Tura de gardă" },
    ],
  },
];

/** Hub + pagini, în ordinea ciclului prev/next. */
export function sectionItems(section: IdeaSection): IdeaPage[] {
  return [section.hub, ...section.pages];
}

export interface Located {
  section: IdeaSection;
  index: number;
}

/**
 * Găsește secțiunea și poziția paginii curente. Potrivire exactă întâi;
 * altfel cel mai lung prefix (ca o subpagină viitoare, de ex.
 * /debug/observator/harta-cadastrala/idei/x, să cadă sub părintele ei).
 */
export function locate(pathname: string): Located | null {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  let best: (Located & { len: number }) | null = null;
  for (const section of SECTIONS) {
    const items = sectionItems(section);
    for (let index = 0; index < items.length; index++) {
      const href = items[index].href;
      const match = p === href || p.startsWith(href + "/");
      if (match && (best === null || href.length > best.len)) {
        best = { section, index, len: href.length };
      }
    }
  }
  return best ? { section: best.section, index: best.index } : null;
}
