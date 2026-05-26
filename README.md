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
    page.tsx          ← pagina principală
    layout.tsx        ← root layout (fonturi)
    globals.css       ← design system
    api/
      words/route.ts  ← POST /api/words — batch lookup
      search/route.ts ← GET /api/search?q= — prefix search
  components/
    WordRenderer.tsx  ← colorează un cuvânt
    StatsBar.tsx      ← legend + statistici
  lib/
    colorMap.ts       ← IPA → hex colors
    phoneticPipeline.ts ← IPA → RenderNode[]
    db.ts             ← better-sqlite3 singleton
    useColorizer.ts   ← React hook principal
data/
  words.db            ← baza de date (tu o pui aici)
```

## Deploy pe Railway

```bash
# 1. Creează proiect nou pe railway.app
# 2. Conectează repo GitHub
# 3. Adaugă persistent volume montat la /app/data
# 4. Uploadează words.db pe volume
# 5. Railway detectează Next.js automat și deployează
```
