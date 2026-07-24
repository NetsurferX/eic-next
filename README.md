# English in Colours — Next.js

## Setup

```bash
# 1. Instalează dependențe
npm install

# 2. Pune words.db în folderul data/
mkdir -p data
cp /path/to/words.db data/words.db

# 3. Rulează în dev
npm run dev
# → http://localhost:3000

# 4. Build pentru producție
npm run build
npm start
```

## Structură

```
src/
  app/
    page.tsx           ← pagina principală
    layout.tsx         ← root layout (fonturi)
    globals.css        ← design system
    learn/page.tsx     ← modul de învățare
    rules/page.tsx     ← editor de reguli (colours/regex bridge + tester)
    api/
      words/route.ts   ← POST /api/words — batch lookup
      search/route.ts  ← GET /api/search?q= — prefix search
      speak/route.ts   ← TTS
      game/route.ts    ← joc — sesiune/scor
  components/
    WordRenderer.tsx   ← colorează un cuvânt (folosește lib/engine + lib/rules)
    StatsBar.tsx        ← legend + statistici
    ConstellationView.tsx / TerrainView.tsx / SoundSpectrum.tsx ← vizualizări
    game/               ← componente joc (ColourGame, GameProgress, IntroCard)
  lib/
    engine/            ← ALGORITMUL de bază: segment.ts (IPA→foneme), align.ts
                          (foneme→grafeme), display.ts (decizii de afișare
                          finale: culoare/underline/mute), score.ts, index.ts
                          (singurul punct de import public)
    rules/             ← DATELE editabile — vezi rules/README.md pentru harta
                          "unde schimb X". colors.ts (sunet→culoare, sursă
                          unică), overrides/ (excepții per-cuvânt, regex)
    ruleConfig.ts       ← punte între lib/rules/ și editorul /rules (diff +
                          prompt generator)
    db.ts               ← better-sqlite3 singleton
    useColorizer.ts     ← React hook principal
    gameTypes.ts        ← tipuri + date derivate din lib/rules/colors.ts
  scripts/
    accent-test.ts      ← harness de debug standalone (rulează motorul real)
data/
  words.db              ← baza de date (tu o pui aici)
```

Pentru "unde schimb o regulă de culoare / cuvânt / underline" — vezi
[`src/lib/rules/README.md`](src/lib/rules/README.md).

## Deploy pe Railway

```bash
# 1. Creează proiect nou pe railway.app
# 2. Conectează repo GitHub
# 3. Adaugă persistent volume montat la /app/data
# 4. Uploadează words.db pe volume
# 5. Railway detectează Next.js automat și deployează
```
