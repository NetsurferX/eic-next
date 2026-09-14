// src/app/debug/observator/_repoData.ts
//
// Date REALE, măsurate manual (wc -l pe fișierele din src/lib și src/components,
// pe HEAD-ul curent) + un jurnal de incidente extras din istoricul de bug-uri
// deja documentat/rezolvat în sesiunile anterioare (vezi eic.md). Nu e conectat
// la nicio telemetrie live — e un snapshot static, la fel ca moduleGraphData.ts,
// gândit ca material de joc pentru cele 3 concepte din /debug/observator/*.
//
// IMPORTANT: nu duplică graful de dependințe — grupurile (ModuleGroup) și
// notele scurte sunt preluate direct din lib/moduleGraphData.ts.

import { MODULE_NODES, MODULE_EDGES, type ModuleGroup } from "@/lib/moduleGraphData";

export { MODULE_NODES, MODULE_EDGES };
export type { ModuleGroup };

/** LOC măsurat manual per fișier urmărit în moduleGraphData.ts (id -> linii). */
export const LOC_BY_MODULE: Record<string, number> = {
  "app/api/words/route.ts": 48,
  "components/WordRenderer.tsx": 118,
  "components/EicCulise.tsx": 316,
  "lib/db.ts": 474,
  "lib/ruleConfig.ts": 142,
  "lib/renderNode.ts": 14,
  "lib/tricolorStyle.ts": 93,
  "lib/useColorizer.ts": 185,
  "lib/engine/index.ts": 34,
  "lib/engine/segment.ts": 148,
  "lib/engine/align.ts": 510,
  "lib/engine/display.ts": 438,
  "lib/engine/score.ts": 44,
  "lib/engine/syllabicConsonants.ts": 75,
  "lib/engine/syllabicR.ts": 88,
  "lib/engine/suffixVoicing.ts": 127,
  "lib/engine/graphemeToPhoneme.ts": 366,
  "lib/engine/types.ts": 49,
  "lib/phonologicalRules.ts": 134,
  "lib/rules/colors.ts": 153,
  "lib/rules/overrides/index.ts": 24,
  "lib/rules/overrides/apply.ts": 91,
  "lib/rules/overrides/misc.ts": 41,
  "lib/rules/overrides/mute-e.ts": 25,
  "lib/rules/overrides/vr-lexical-sets.ts": 204,
  "lib/rules/overrides/yw-exceptions.ts": 44,
  "lib/rules/overrides/types.ts": 52,
};

export function locOf(id: string): number {
  return LOC_BY_MODULE[id] ?? 0;
}

export function groupTotals(): Record<ModuleGroup, { loc: number; files: number }> {
  const totals = {} as Record<ModuleGroup, { loc: number; files: number }>;
  for (const n of MODULE_NODES) {
    const t = totals[n.group] ?? { loc: 0, files: 0 };
    t.loc += locOf(n.id);
    t.files += 1;
    totals[n.group] = t;
  }
  return totals;
}

export type IncidentStatus = "rezolvat" | "deschis";
export type IncidentSeverity = "SEV1" | "SEV2" | "SEV3";

export interface Incident {
  id: string;
  title: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  modules: string[]; // ids din MODULE_NODES, cel puțin unul
  symptom: string;
  rootCause: string;
  fix?: string;
}

/**
 * Jurnal real de bug-uri, reconstituit din sesiunile de engine deja documentate.
 * Cele două marcate "deschis" chiar nu au fost încă rezolvate în cod — nu sunt
 * puse aici de efect dramatic.
 */
export const INCIDENTS: Incident[] = [
  {
    id: "INC-1",
    title: "Concatenarea pronunțărilor multiple din lexicon.db",
    status: "rezolvat",
    severity: "SEV1",
    modules: ["lib/db.ts", "lib/engine/segment.ts"],
    symptom:
      "~7.479 din 125.927 rânduri din tabela `us` (≈6%) au IPA multiplu, separat prin virgulă — cuvinte ca lawyer (\"/ˈɫɔɪɝ/, /ˈɫɔjɝ/\").",
    rootCause:
      "Șirul IPA era pasat întreg (cu virgulă cu tot) către segment(), dublând numărul de segmente și consumând greșit literele pentru toate aceste cuvinte.",
    fix: "firstIpaVariant() — extrage doar prima variantă înainte de segment().",
  },
  {
    id: "INC-2",
    title: "glyphOverride niciodată citit în resolveDisplay()",
    status: "rezolvat",
    severity: "SEV1",
    modules: ["lib/engine/display.ts"],
    symptom:
      "Excepțiile din yw-exceptions.ts (lawyer, Freudian, rooibos...) treceau tsc --noEmit curat, dar nu se vedeau niciodată în UI.",
    rootCause:
      "resolveDisplay() construia glyph-ul doar din glideGlyph(n); câmpul n.glyphOverride exista în tip și era populat de apply.ts, dar nimeni nu îl citea — mecanism complet, dar mut de la un capăt la altul.",
    fix: "Precedență explicită pentru glyphOverride înaintea deciziei isDiph, cu gradient forțat oprit + return timpuriu în isMute().",
  },
  {
    id: "INC-3",
    title: "cache.db servea o culoare veche, hard-codată",
    status: "rezolvat",
    severity: "SEV2",
    modules: ["lib/db.ts"],
    symptom:
      "\"er\" din lawyer apărea roz (#FF3399) în browser, deși accent-test.ts arăta mereu negru pentru același cuvânt.",
    rootCause:
      "getBestNodes() verifică întâi cache.db; rândul cache pentru lawyer (procesat 2026-07-31, înainte de fix-ul firstIpaVariant) avea 8 noduri stricate în loc de 4, cu \"er\" fixat direct în JSON-ul cache-uit. accent-test.ts nu atinge niciodată cache-ul, deci nu putea reproduce bug-ul.",
    fix: "Invalidare manuală cache.db — fix-ul de cod singur nu ajunge la cuvinte deja cache-uite.",
  },
  {
    id: "INC-4",
    title: "Regulile de excepție forțau culoarea pe tot cuvântul",
    status: "rezolvat",
    severity: "SEV2",
    modules: ["lib/rules/overrides/yw-exceptions.ts"],
    symptom:
      "lawyer, Freudian, rooibos, buoyant, buoyed apăreau colorate integral roșu, nu doar litera de excepție.",
    rootCause:
      "Regulile foloseau group:0 (tot match-ul) în loc de un capture group țintit pe litera respectivă.",
    fix: "Îngustat toate cele 6 reguli de la group:0 la un capture group specific.",
  },
  {
    id: "INC-5",
    title: "Banda albastră a tricolorului /əʊ/ invizibilă",
    status: "rezolvat",
    severity: "SEV3",
    modules: ["components/WordRenderer.tsx", "lib/tricolorStyle.ts"],
    symptom:
      "Pe litere x-height (o, w) banda de sus a gradientului vertical nu se vedea deloc în aplicația live, deși logica de calibrare era corectă.",
    rootCause:
      "line-height: 2.1 pe .eic-highlight/.eic-textarea face ca background-clip: text să picteze pe toată cutia liniei; banda de sus cădea în spațiul gol de leading de deasupra glifului.",
    fix: "lineHeight: 1 pe span-ul cu gradient, exact ca la .eic-syllabic / .eic-syllabic-vr.",
  },
  {
    id: "INC-6",
    title: "Fuziune greșită /j/+/ɛ/ → \"y̓e\"",
    status: "deschis",
    severity: "SEV2",
    modules: ["lib/engine/segment.ts"],
    symptom: "yes, yet, yesterday (toate /jɛ.../) ies negre în loc de roșu(j)+galben(ɛ).",
    rootCause:
      "TRANSFORMS din segment.ts are intrarea ['jɛ','y̓e'], o supra-generalizare a regulii legitime juː/jʊ/ju→y̓u (cute, beauty). 'y̓e' nu are nicio intrare în colors.ts, deci cade pe negru — contrazice chiar comentariul din display.ts care citează yes/yesterday ca exemplul canonic de glide separat.",
    fix: "Propus, neaplicat încă: eliminarea liniei ['jɛ','y̓e'] din TRANSFORMS.",
  },
  {
    id: "INC-7",
    title: "\"you\" consumă o singură literă",
    status: "deschis",
    severity: "SEV2",
    modules: ["lib/engine/segment.ts"],
    symptom: "\"ou\" din you rămâne coadă neclasificată (negru/mut) în loc să preia culoarea lui /u/.",
    rootCause:
      "/ˈju/ se fuzionează într-un singur token 'ỷu' care consumă doar litera 'y', lăsând 'ou' fără nod propriu — aceeași clasă de bug ca fuziunea de la lawyer, de data asta în consumeVowel.",
  },
];

export const OPEN_INCIDENTS = INCIDENTS.filter((i) => i.status === "deschis");
export const CLOSED_INCIDENTS = INCIDENTS.filter((i) => i.status === "rezolvat");
