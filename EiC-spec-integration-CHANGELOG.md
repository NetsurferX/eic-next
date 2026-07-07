# Integrare B_tehnic → cod — changelog

Toate modificările de mai jos sunt deja aplicate în fișierele din `src/`.
Nimic din `specTables.ts` (versiunea anterioară) nu mai e nevoie — a fost
înlocuit de aceste editări directe.

## `src/lib/engine/colorMap.ts`
- **Schwa** (`ə, ɜ, ər, er, ɐ`): `#888888` → **`#000000`** (spec: negru, nu gri).
- **`/eɪ/` (eỷ)**: scos din grupul `e/ɛ` (#EE5B00) → culoare proprie **`#00246C`**.
- **`/aʊ/` (aw)**: scos din grupul `aɪ` (#4472C4) → culoare proprie **`#23D300`**.
- **`/ɔɪ/` (oɪ/oỷ)**: scos din grupul `aɪ` → **`#FF3399`** (start-culoarea
  gradientului roz→roșu din spec; gradientul complet cu 2 tonuri necesită
  despărțirea segmentului în doi `Seg`, vezi „Neintegrat" mai jos).
- **`/əʊ/` (oʊ/əw)**: `#FF3399` → **`#FCD116`** (culoarea de mijloc a
  gradientului tricolor `#002B7F→#FCD116→#CE1126`; gradientul complet
  necesită suport nou în `display.ts`, vezi mai jos).
- **`/juː/`** (ju/ỷu/juː): adăugat, nu exista deloc → **`#833C0B`**.
- **`j`, `ỷ`**: `#E57373` → **`#CC0000`** (aceeași culoare ca i/ɪ, conform
  Tabelul 5).
- **`w`**: `#E57373` → **`#000000`** (negru, ca orice consoană, conform
  Tabelul 6).
- Categoria „semivocală" dedicată (`#E57373`) a dispărut complet — j/ỷ merg
  acum la roșu, w la negru.

## `src/lib/ruleConfig.ts`
- `DEFAULT_CONFIG.colors` actualizat identic cu `colorMap.ts` de mai sus (ca
  editorul `/rules` să reflecte aceleași valori).
- **Reguli regex noi, activate (`enabled: true`)**:
  - `vr-near`, `vr-care`, `vr-cure`, `vr-poor`, `vr-our`,
    `vr-tower-flower`, `vr-fire-tyre` — seturile lexicale V-R din §6.2
    (bear/near/cure/poor/hour vs tower/flower/fire — colorare pe tot
    intervalul cuvântului potrivit).
  - `oy-lawyer`, `oy-freudian`, `oy-rooibos`, `oy-buoyant-buoyed`,
    `j-fjord` — excepțiile manuale din Tabelul 5 pentru semivocala y.
  - `mute-e-after-ow` (ex: *stowe*) — §2.c.
- **Reguli regex noi, dezactivate intenționat**:
  - `vr-goer` — spec cere gradient tricolor + negru, nu o culoare plată;
    lăsată dezactivată până există suport de gradient (vezi mai jos).
  - `mute-e-ed` (ex: *cooed*) — regex-ul, ca regulă generală, ar declanșa
    pe orice cuvânt în -ed cu vocală înainte de e, inclusiv cazuri unde e-ul
    chiar se pronunță. Are nevoie de o verificare per-cuvânt a transcrierii
    IPA înainte să poată fi activată global.

## `src/lib/engine/align.ts`
- `CONSONANT_SPELLINGS` — adăugate: `x→h` (*loch*), `gz→x` (*example*),
  `kʃ→x` (*sexual*) — lipseau complet din tabel.

## `src/lib/engine/segment.ts`
- `TRANSFORMS` — adăugate, poziționate înaintea mapărilor `j`/`w`/`ỷ` simple
  ca să fie prinse întâi: `juː/jʊ/ju → ỷu`, `ɡz/gz → gz`, `kʃ → kʃ`.

---

## Neintegrat — necesită arhitectură nouă, nu doar date

Documentat detaliat în `EiC-tehnic-spec.md` §10. Pe scurt:

1. **Substituirea glifei literei** (ƈ, ĉ, ŝ, ẗ, ğ, ṡ, ẋ, š, ǧ, ᵮ, x̄, ӿ, ű,
   tɦ, c̈, t̂...) — motorul colorează litera originală, nu-i schimbă forma.
   Ar necesita un câmp nou pe `RenderNode`/`DisplayNode` și randare nouă în
   `WordRenderer.tsx`.
2. **Exponent pentru fonem fără grafem** (`kethi^v^bh`) — flag de
   superscript pe `DisplayNode`.
3. **Gradient pe 2 tonuri pentru vocalele simple** (`ʌ`, `ɪ`, `ɒ`, `ʊ` —
   70%→30% spre negru) — mecanismul de gradient existent (`display.ts`) e
   făcut doar pentru diftongi (glide markat), nu pentru o vocală simplă.
4. **Gradient tricolor** pentru `/əʊ/`.
5. **Alb cu chenar negru** pentru consoanele silabice forțate din setul V-R
   (§6.1) — `syllabic: boolean` există deja în `DisplayNode`, dar de
   verificat dacă acoperă și cazul V-R identic sau are nevoie de un flag
   separat.
6. **Distincția rotică/non-rotică pentru `/ɔː/`** (door/force = solid vs.
   cot/caught = gradient) — ar necesita un flag de context în `Seg`.
7. **Bicolor real pentru `/ɔɪ/`** (nu doar culoarea de start) — ar necesita
   despărțirea în doi `Seg` (o + ỷ) cu marcaj de glide, în loc de fuziunea
   curentă într-un singur token `oỷ` din `TRANSFORMS`.

Recomandare: dacă vrei, pot continua cu oricare din acestea ca pas următor
— cel mai contained ca efort e #5 (verificare syllabic) și #2 (superscript
flag), cel mai amplu e #7 (necesită re-arhitecturarea segmentării
diftongilor cu semivocală).
