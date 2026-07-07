# EiC — Specificație tehnică (referință)

> Reorganizat din `B_tehnic (Copy).docx`, cu titluri aliniate la modulele
> motorului (`colorMap.ts`, `align.ts`, `segment.ts`, `display.ts`,
> `ruleConfig.ts`) ca să fie ușor de mapat rulă-cu-rulă la cod.
> Conținutul e reformulat/organizat, nu tradus cuvânt-cu-cuvânt din document.

---

## 1. Principii generale

### 1.1 Grafemele consoane
- Culoare **neagră** când exprimă un fonem.
- Culoare **gri** când nu au fonem asociat (mute).

### 1.2 Grafemele vocale — principiul alăturării vocalice
Nu există un număr fix de vocale per fonem: **toată secvența continuă de
vocale** grafemice aparține fonemului.
- `/kɑr/` → **car**, `/taʊn/` → **town**, `/ˈpoʊ.ər/` → **p[ow]er**, `/aɪ/` → **eye**

**Excepții de la secvența continuă:**
- *e* mut prevăzut expres (vezi §3.2–3.3)
- fonem exprimat prin semivocale alăturate (**w**, **y**): `/rɔɪ.əl/` → **roỷal**
- corespondență directă fonem↔grafem (1:1, 2:2): `/ri.əl/` → **real**

Dacă grafemul nu exprimă niciun fonem → gri. Dacă exprimă fonemul → culoarea
fonemului respectiv.

### 1.3 Situații speciale (grafeme individuale)
| Caz | Regulă |
|---|---|
| Grafemul lui `/ə/` | **negru** — ex: *curse* `/kərs/` |
| Grafemul lui `/w/` prenucleic în diftong | **negru** — *wound, aw**ai**t, warm* |
| `/w/` = litera **u** prenucleică | **u negru + diacritic**: **ű** — *qűeen* |
| Grafemul lui `/ỷ/` = **y/i** prenucleic sau în `/oỷ/` | **roșu**, cu diacritic **ỷ / ỉ** |
| `/ju/` | **nu are grafem propriu y** |
| **w** fără fonem | se atașează cromatic vocalei alăturate — **excepție**: dacă e între schwa și consoană → **gri** |

---

## 2. Litera mută (grafem fără fonem corespondent)

**Principiul literei mute**: *dacă nu se văd bine, nu se pronunță.*

a. **Consoane mute** → gri: `knight` (**k**), `sigh` (**gh**)
b. **Vocale mute izolate** (flancate de consoane, izolate de alte vocale cu
   fonem) → gri: `mute`, `who`
c. **E mut prevăzut expres #1**: *e* din **-ed**, dacă nu apare în
   transcrierea fonetică (chiar dacă e parte dintr-un grup de vocale):
   `cooed` `/ku:d/` → **cooed**
d. **E mut prevăzut expres #2**: *e* final după **ow**: `stowe` `/stəʊ/` →
   **stowe**
e. **W fără grafem**, între `/ə/` și un fonem consonantic → gri
f. **Sunet fără nicio literă corespondentă** → notat ca exponent (ridicare
   la putere): `kethib` `/keˈti:v/` → **kethi^v^bh**

### 2.1 Grafemele consoane silabice
Consoanele **c, l, m, n, r** pot exprima simultan fonemul lor obișnuit *și*
schwa, în combinațiile `/ək/, /əl/, /əm/, /ən/, /ər/`.
- Forțare **naturală**: c, l, m, n (nu există grafem vocalic pentru schwa
  acolo)
- Forțare **artificială**: r (doar în setul lexical V-R, vezi §6)
- Culoare: **negru cu chenar alb**

---

## 3. Accentul și transcrierea fonetică

- Accentul se subliniază **direct în cuvânt și în transcriere**, extras din
  IPA.
- Se subliniază doar grafemele **vocale + semivocale** din silaba accentuată.
- Secvență vocalică → se subliniază **întreaga secvență**: **b[eau]ty**
- Diftong → se subliniază **întregul diftong**: **t[ow]er**, **[ỷe]sterday**,
  **[wo]man**, **l[aw]ỷer**
- **Nu** se subliniază accentul în: monosilabice (`stop`) și bisilabice cu
  grafem-consoană silabică (`[a]pple` — nu **a**pple).

---

## 4. Fonemele — principiu general

> Fonemele din transcriere trebuie regăsite în grafemele cuvântului simplu.

`mean /mɪn/` → IPA `/m-ɪ-n/` = EiC `/m-i-n/` → prelucrare `m-e-a-n` → **mean**

### 4.1 Fonemele consoane — moduri de exprimare
| Mod | Exemplu |
|---|---|
| literă corespondentă | `/z/=z` → *zoo* |
| literă dublă | `/s/=ss` → *kiss* |
| literă transformată (diacritic) | `/z/=ṡ` → *doeṡ* |
| grup de litere | `/f/=gh` → *en[ou]gh* |
| exponent (regula 3, §2f) | `/k/=ᵏ` |
| `/ŋg/` | *congress* |

### 4.2 Y și W — semivocale grafemic ȘI fonemic
- Nu pot forma silabă/fonem singure.
- Statut de colorare special.
- Fac parte din fonemul decis prin divizarea silabică IPA.
- **Principiu**: semivocala funcționează ca separator silabic (grafemic și
  fonetic).

---

## 5. Clasificarea completă a semivocalelor

### 5.1 `/j/ → /ỷ/`

| Nr | Context fonologic | Funcție | Structură | Notare EiC | Colorare | Observații |
|---|---|---|---|---|---|---|
| 1 | Caz special `/oỷ/` (*boy, coin*) | Semivocală V₂ (finală) | V–V₂ | o+ỷ | Gradient Roz→Roșu descendent | Intră în unitatea etanșă V–V₁ |
| 2 | Înainte de vocală (*yes, you*) | Semivocală V₁–V₂ (inițială) | V₁–V₂ | ỷe, ỷu | Roșu integral | Diftong ascendent, nu se notează ca și consoană |
| 3 | Fără grafem propriu (*Europe, unity*) | Semivocală latentă | V₁–V₂ | invizibil fonemic | Necolorat | Activ doar fonemic, nu apare grafemic |
| 4 | Diftongi lexicali (*day, fire*) | V₂ integrat (fuzionat) | V–V₂ | eỷ, aỷər | Gradient albastru→roșu/alb | `/ỷ/` absorbit în diftong, fără marcare separată |

**Regulă canonică**: `/j/→/ỷ/` e **întotdeauna** semivocală (V₂), niciodată
consoană.
- Caz special (final, `/oỷ/`): gradient roz→roșu
- Dacă precede vocală: diftong ascendent, roșu integral + diacritic
- Fără grafem: doar fonemic
- Fuzionat lexical: integrat, fără marcare separată

**Tabelul 5 — grafemul semivocalei /j/→/ỷ/** (doar prenucleic sau în `/oỷ/`):

| Grafem sursă | Diacritic | Exemple | Condiție |
|---|---|---|---|
| y | ỷ | *boy* | — |
| i | ỉ | *coin, onion* | — |
| u | ủ | *lawỷer, Freủdian, rooỉbos, ŝĉĥuỉt, buoỷant, buoỷed* (rezolvabile manual) | doar `/ɔɪ/`→`o+ỷ` |
| e | ẻ | — | doar `/ɔɪ/`→`o+ỷ` |
| a | ả | — | doar `/ɔɪ/`→`o+ỷ` |
| o | ỏ | — | doar `/ɔɪ/`→`o+ỷ` |
| j | j̉ | *fjord* | — |

### 5.2 `/w/ → /w/`

| Nr | Context fonologic | Funcție | Structură | Notare fonem EiC | Colorare+diacritic | Observații |
|---|---|---|---|---|---|---|
| 1 | Caz special `/w/` (*queen, suave*) | Semivocală V₂ (inițială) | V–V₂ | w | **ű** | Diftong ascendent, intră în unitatea etanșă V–V₁ |
| 2 | Înainte de vocală (*wet*) | Semivocală V₁–V₂ (inițială) | V₁–V₂ | w | Negru integral | Diftong ascendent, nu se notează ca și consoană |
| 3 | Fără grafem propriu (*go, goer*) | Semivocală latentă | V₁–V₂ | invizibil fonemic | Necolorat | Activ doar fonemic |
| 4 | Diftongi lexicali (*low, sound*) | V₂ integrat (fuzionat) | V–V₂ | əw, aw | Gradient tricolor / verde neon | `/w/` absorbit în diftong, fără marcare separată |

**Regulă canonică**:
- `/oʊ/ → /əw/` — întotdeauna vocală+semivocală, niciodată două vocale
- `/aʊ/ → /aw/` — întotdeauna vocală+semivocală, niciodată două vocale
- Caz special (inițial): diftong ascendent → **u negru → ű** cu diacritic
- Precede vocală: diftong ascendent → negru
- Fără grafem: doar fonemic
- Fuzionat lexical: integrat, fără marcare separată

**Tabelul 6 — grafemul semivocalei w**:

| Fonem | Notare | Culoare | Exemple |
|---|---|---|---|
| /w/ | w | Negru (#000000) | *wet, with* |
| /w/ | w + diacritic **ű** | Negru (#000000) | *qűeen* |

### 5.3 Normalizări standard EiC
- **Rotacitate**: `car /kɑr/` = **car**
- **Fuziunea cot–caught** → varianta `/ɒ/` (seturile LOT/COT, COUGHT/THOUGHT
  primesc `/ɒ/`, nu `/ɑ/`/`/ɔ/`)
- **Fuziunea boy–door** → varianta `/o/`: `/ɔɪ/,/ɔːr/ → /oỷ/, /or/`
- Varianta `/æ/` în setul lexical *class, task*
- Varianta `/eəri/` -ary în *military, ordinary*
- Varianta `/ori/` -ory în *laboratory, inventory*

---

## 6. Fonemele vocalice complexe (V-C) — legea priorității lui schwa

Fonemele `/ək/, /əl/, /əm/, /ən/, /ər/` sunt **forțate** să se fuzioneze cu
consoana silabică, dându-i lui schwa ocazia de exprimare grafemică conform
principiului că *orice fonem trebuie exprimat de un grafem*.

**Legea priorității lui schwa**: în secvențele unde `/ə/` precede fonemul
consonantic `/k/, /l/, /r/, /m/, /n/` fără grafem vocalic propriu pentru
schwa, schwa se alocă **integral și exclusiv** grafemului consonantic
următor.

- **Naturală** — nu există grafem vocalic pentru schwa în acel context; se
  prelucrează în ordinea normală a fonemelor cuvântului.
- **Artificială** — apare doar în setul lexical V-R (§6.1, prevăzut expres:
  *poor, cure, near, bear, fire, hour*): toată secvența grafemică vocalică
  din silaba accentuată primar e alocată vocalei care precede schwa,
  sărind peste toate celelalte principii EiC. **Se prelucrează prioritar.**

> Aplicarea fonemelor silabice complexe e strict limitată la aceste
> contexte.

### 6.1 Tabelul 3 — V-R greedy
- Se prelucrează în **blocul II** al algoritmului.
- Unica excepție parțială de la interdicția V-C/V/C.
- Se aplică **exclusiv** seturilor lexicale: *bear, near, cure, poor, fire,
  hour*.

| Fonem | Notare | Grafem | Culoare | Exemplu | Observații |
|---|---|---|---|---|---|
| /ək/ | /k/ | c | **Alb cu chenar negru** | *McDonald* | `/ə/` + `/k/` |
| /əl/ | /l/ | l | **Alb cu chenar negru** | *little* | `/ə/` fără grafem + `/l/` |
| /əm/ | /m/ | m | **Alb cu chenar negru** | *Communism, rhythm* | `/ə/` fără grafem + `/m/` |
| /ən/ | /n/ | n | **Alb cu chenar negru** | *isn't, didn't* | `/ə/` fără grafem + `/n/` |
| /ər/ | /r/ | r | **Alb cu chenar negru** | *near, aire, stare* | `/ə/` fără grafem + `/r/` |

### 6.2 Setul lexical V-R extins (diftong + schwa + r)

| Fonem IPA | Fonem EiC | Culoare | Exemple | Set lexical |
|---|---|---|---|---|
| /iə/ | /i/+/ə/ | Roșu + Negru | *idea* | non-lexical, "near"-adjacent |
| /iər/ | /i/+/ər/ | Roșu + (r alb/chenar negru) | *near, interfere* | **Near** |
| /eər/ | /e/+/ər/ | Portocaliu + (r alb/chenar negru) | *bear, hair* | **Care/bare/aire** |
| /jʊər/ | /ỷu/+/ər/ | Maro + (r alb/chenar negru) | *cure, lure* | **Cure** |
| /ʊər/ | /ʊ/+/ər/ | Violet + (r alb/chenar negru) | *poor, tour* | **Poor** |
| /aʊər/ | /aw/+/ər/ | Verde neon + (r alb/chenar negru) | *hour, our, sour, dour* | **Our** (= `/aw/+/ər/`) |
| /aʊər/ (non-our) | /aw/+/ə/+/negru/ | Verde neon + negru + negru | *tower, flower* | **Nu** e "our" — există grafem vocalic (e) pt. `/ə/` înainte de r |
| /aɪər/ | /aỷ/+/ər/ | Albastru mediu + (r alb/chenar negru) | *tyre, fire, ire* | — |
| /əʊər/ | /əw/+/ə/+/r/ | Gradient tricolor + negru | *goer* | — |

---

## 7. Separarea grafemelor vocalice — algoritm complet

1. **Un singur fonem ↔ toată secvența grafemică vocalică**: `car`, `fraud`
   (vocală plină), `loud, queen` (diftongi), `eye, queue` (diftongi).
2. **Două foneme vocalice (2 silabe) ↔ 2 grafeme**: împărțire directă 1:1,
   stânga→dreapta. `/ke.'ɑnu/` → **Ke[a]nu**, `/ri.al/` → **r[e]al**
3. **Două foneme, 3–4 grafeme, cu semivocală prezentă**:
   *Regulă*: prioritate pentru semivocală (w/y, sau u-ca-semivocală) când
   apare în setul de grafeme și corespunde unui fonem semivocalic.
   *Algoritm*:
   - detectează poziția semivocalei w/y (+u-accommodate) în cele 3 grafeme
   - o alocă fonemului căruia îi corespunde
   - grafemele din stânga semivocalei → fonemul din stânga; cele din
     dreapta → fonemul din dreapta
   - Exemple: *layer, lawyer, royal, power, await*
4. **Două foneme vocalice alăturate, 3 grafeme, ultimele două = "ou" urmat
   de "s"** → primul grafem la primul fonem, "ou" la schwa.
5. **Terminație în -ing**: dacă ultimul fonem e `/i/`, i se acordă lui **i**.
6. **Rezolvabile doar manual / prin dicționar EiC**: *contiguous, queueing*

---

## 8. Tabel 1 — Foneme consoane IPA → Fonem EiC (grafem + diacritic + culoare)

Toate consoanele sunt **negre (#000000)** — diferența e doar în **grafemul**
folosit și, pentru unele, un **diacritic** care marchează transformarea
literei. Grupate pe fonem:

| Fonem IPA | Fonem EiC | Grafem englez | Grafem EiC (cu diacritic) | Exemple |
|---|---|---|---|---|
| /b/ | /b/ | b | b | bat, b[eau]tiful |
| /b/ | /b/ | bb | bb | r[a]bbit, r[u]bber |
| /d/ | /d/ | d | d | dog |
| /d/ | /d/ | dd | dd | add r[e]ss |
| /dʒ/ | /j/ | j | j | jam |
| /dʒ/ | /j/ | g | **ğ** | bar**ğ**e |
| /dʒ/ | /j/ | gg | **ğğ** | v[e]**ğğ**ieṡ |
| /dʒ/ | /j/ | dg | **dğ** | bri**dğ**e |
| /dʒ/ | /j/ | dj | dj | adjust |
| /g/ | /g/ | g | g | good, go |
| /g/ | /g/ | gg | gg | egg |
| /f/ | /f/ | f | f | fun, funny |
| /f/ | /f/ | ff | ff | off |
| /f/ | /f/ | ph | ph | phone, graph |
| /f/ | /f/ | gh | gh | enough |
| /h/ | /h/ | h | h | hat, he |
| /x/ | /x/ | h | h | loch |
| /tʃ/ | /ch/ | ch | ch | chair, church |
| /tʃ/ | /ch/ | tch | tch | watch |
| /tʃ/ | /ch/ | c | **c̈** | c̈ello |
| /tʃ/ | /ch/ | t | **ẗ** | Si**ẗu**ation, cul**ẗ**ure, sta**ẗ**ue |
| /k/ | /k/ | k | k | k*i*ng |
| /k/ | /k/ | c | c | cat |
| /k/ | /k/ | cc | cc | accommodate |
| /k/ | /k/ | ck | ck | black |
| /k/ | /k/ | cq | cq | acquaintant |
| /k/ | /k/ | q | q | queen |
| /l/ | /l/ | l | l | leg |
| /l/ | /l/ | ll | ll | fall |
| /m/ | /m/ | m | m | man |
| /m/ | /m/ | mm | mm | summer |
| /n/ | /n/ | n | n | net |
| /n/ | /n/ | nn | nn | funny |
| /ŋ/ | /ŋ/ | ng | ng | sing |
| /ŋ/ | /ŋ/ | n | n | bank, tank, uncle, fun**ĉt**ion |
| /ŋg/ | /ŋg/ | ng | ng | congress |
| /p/ | /p/ | p | p | pen, pronunciation |
| /p/ | /p/ | pp | pp | happy |
| /r/ | /r/ | r | r | red |
| /r/ | /r/ | rr | rr | better *(EiC e rotic)* |
| /s/ | /s/ | s | s | sun, success |
| /s/ | /s/ | ss | ss | success |
| /s/ | /s/ | sc | **sƈ** | — |
| /s/ | /s/ | c | **ƈ** | ƈircus |
| /s/ | /s/ | cc | **ƈƈ** | suƈƈess |
| /ʃ/ | /sh/ | sh | sh | she, fish |
| /ʃ/ | /sh/ | c | **ĉ** | oĉean |
| /ʃ/ | /sh/ | cĥ | **ĉĥ** | ĉĥef |
| /ʃ/ | /sh/ | s | **ŝ** | ŝure |
| /ʃ/ | /sh/ | ss | **ŝŝ** | miŝŝion |
| /ʃ/ | /sh/ | sch | **ŝĉĥ** | borŝĉĥ |
| /ʃ/ | /sh/ | sc | **ŝĉ** | fascism |
| /ʃ/ | /sh/ | t | **t̂** | n[a]t̂ion |
| /t/ | /t/ | t | t | t**o**p |
| /t/ | /t/ | tt | tt | letter |
| /θ/ | /th/ | th | **tɦ** | thin, think |
| /ð/ | /dh/ | th | th | this, father |
| /v/ | /v/ | v | v | van, vote |
| /v/ | /v/ | ph | ph | Stephen |
| /v/ | /v/ | f | **ᵮ** | oᵮ |
| /z/ | /z/ | z | z | zoo |
| /z/ | /z/ | zz | zz | fizz |
| /z/ | /z/ | s | **ṡ** | roṡe |
| /z/ | /z/ | sc | **ṡƈ** | crescent |
| /z/ | /z/ | x | **ẋ** | ẋylophone |
| /ʒ/ | /zh/ | s | **š** | vision, measure, television |
| /ʒ/ | /zh/ | g | **ǧ** | mirage |
| /w/ | /w/ | w | w | water, win |
| /w/ | /w/ | u | **ű** | qűeen |
| /gz/ | /gz/ | x | **ӿ** | example |
| /ks/ | /ks/ | x | x | sex |
| /kʃ/ | /kʃ/ | x | **x̄** | sex̄ual |

> **Notă arhitecturală**: coloana "Grafem EiC (cu diacritic)" implică o
> **substituire a formei literei** afișate (nu doar o culoare) — o
> funcționalitate care **nu există încă** în pipeline-ul curent
> (`align.ts`/`display.ts` colorează litera originală, nu-i schimbă
> glifa). Vezi §10 „Lacune arhitecturale".

---

## 9. Tabel 2 — Foneme vocale IPA → Fonem EiC (culoare)

| IPA | Fonem EiC | Culoare | Exemple |
|---|---|---|---|
| /æ/ | /æ/ | Albastru deschis `#00b0f0` | apple, cat |
| /ʌ/ | /ʌ/ | **Gradient**: Verde închis `#008E40` 70% → Negru 30% | son, cup |
| /ɑː/ | /a/ | Verde închis `#008E40` (solid) | car, father |
| /ə/, /ɜː/ | /ə/ | **Negru `#000000`** | about, taken |
| /e/, /ɛ/ | /e/ | Portocaliu `#EE5B00` | bed, head |
| /ɪ/ | /ɪ/ | **Gradient**: Roșu `#CC0000` 70% → Negru 30% | sit, tip |
| /iː/ | /i/ | Roșu `#CC0000` (solid) | see, mean |
| /ɒ/, /ɔ/, /ɔː/ | /ɒ/ | **Gradient**: Roz `#FF3399` 70% → Negru 30% | hot, what, lawn, caught |
| /ɔː/ | /o/ | Roz `#FF3399` (solid) | door, force |
| /ʊ/ | /ʊ/ | **Gradient**: Violet `#7030A0` 70% → Negru 30% | put, book |
| /uː/ | /u/ | Violet `#7030A0` (solid) | food, room |
| /əʊ/ | /əw/ | **Gradient tricolor**: `#002B7F → #FCD116 → #CE1126` | go, snow |
| /aɪ/ | /aỷ/ | Albastru mediu `#4472C4` | time, my |
| /eɪ/ | /eỷ/ | Albastru închis `#00246C` | name, day |
| /juː/ | /ỷu/ | Maro `#833C0B` | cute, beauty |
| /ɔɪ/ | /o/+/ỷ/ | Roz `#FF3399` → Roșu `#CC0000` (bicolor, nu gradient continuu) | boỷ, coỉn |

> **Notă**: `/ɔː/` apare de două ori cu roluri diferite (gradient roz→negru
> pentru setul cot/caught, roz solid pentru setul door/force) — distincția
> pare a fi context rotic (înainte de r) vs. non-rotic. Vezi §10.

---

## 10. Lacune arhitecturale (necesită mai mult decât date noi)

Aceste puncte din spec **nu pot fi acoperite doar prin tabele de date** —
au nevoie de extensii de pipeline:

1. **Substituirea glifei literei** (§8, toată coloana "Grafem EiC cu
   diacritic": ƈ, ĉ, ŝ, ẗ, ğ, ṡ, ẋ, š, ǧ, ᵮ, x̄, ӿ, ű, tɦ, c̈, t̂…). Necesită
   un câmp nou pe `RenderNode` (ex: `glyph?: string`, litera efectivă de
   afișat, diferită de `t`), plus randare în `WordRenderer.tsx`.
2. **Exponent pentru fonem fără grafem** (§2f: `kethi^v^bh`). Necesită
   marcaj de "superscript" pe `DisplayNode` (ex: `superscript?: boolean`).
3. **Gradient pe 2 culori pentru fonemele vocalice simple** (`ʌ`, `ɪ`, `ɒ`,
   `ʊ` — 70%→30% spre negru). Motorul are deja gradient pentru diftongi
   (`DIPHTHONG_START`/`END` în `display.ts`), dar nu pentru vocale simple
   individuale — ar necesita un nou flag `simpleGradient` pe `DisplayNode`.
4. **Gradient tricolor** pentru `/əʊ/` (`#002B7F → #FCD116 → #CE1126`) —
   dincolo de gradientul cu 2 culori din `display.ts` actual.
5. **Chenar alb / "alb cu chenar negru"** pentru consoanele silabice
   forțate (§6, tabel 3) — corespunde parțial cu `syllabic: boolean` deja
   existent în `DisplayNode`, dar culoarea `COLOR_CONSONANT` (negru) e
   folosită acolo unde spec cere alb-cu-chenar-negru pentru cazurile V-R
   (§6.1) — de verificat dacă `syllabic` acoperă ambele cazuri identic sau
   dacă V-R are nevoie de un flag separat (`x.2`: syllabicVR).
6. **Distincția rotică/non-rotică pentru `/ɔː/`** (§9, nota de mai sus) —
   ar necesita un flag suplimentar în `Seg` din `segment.ts` (context
   rotic) pentru a decide între gradient (cot/caught) și solid (door).

Vezi `specTables.ts` pentru toate regulile care **pot** fi adăugate ca
date pure (fără schimbări de arhitectură), gata de integrat în
`ruleConfig.ts` / `colorMap.ts` / `align.ts`.
