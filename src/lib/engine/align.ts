// engine/align.ts
// Maps Seg[] (IPA phonemes after transforms) onto the word's letters.
//
// TWO RULES drive this, not a dictionary:
//
// 1. CONSONANT_SPELLINGS table: each IPA display (e.g. 'sh', 'k', 'r') lists
//    every letter sequence that can spell it in English, longest first.
//    Handles: ti/ci→sh ("nation"), ch→k ("school"), rr/ll/nn/tt ("current",
//    "better"), ph/gh→f ("phone","enough"), kn/gn→n ("knight"), tch→ch, etc.
//
// 2. R-CONTROLLED VOWEL rule: after consuming vowel letters, if the next
//    letter is 'r' AND the next phoneme is NOT /r/, absorb the 'r' into this
//    vowel node. Handles: er/ir/or/ur/ar as single phoneme ("inter-", "her").
//
// With these two rules almost all English spelling irregularities are covered
// without touching a word list.

import type { RenderNode, Seg } from './types'
import { getColor, COLOR_SILENT, COLOR_CONSONANT } from '../rules/colors'

// ── Graphic vowel / consonant ─────────────────────────────────────────────────
// Only a/e/i/o/u define vowel-letter RUNS (y/w handled separately as glides).

export const GRAPHIC_VOWELS = new Set([...'aeiou', ...'AEIOU'])
export function isGraphicVowel(c: string): boolean { return GRAPHIC_VOWELS.has(c) }
export function isGraphicCons(c: string):  boolean { return !GRAPHIC_VOWELS.has(c) }

// ── Glide sounds ──────────────────────────────────────────────────────────────
const GLIDE_DISPLAYS = new Set(['j', 'w', 'ỷ'])

// IPA displays that are vowel sounds (used to decide vowel-run width)
const VOWEL_DISPLAY_STARTS = new Set([...'aeiouæɑɔəɛɪʊʌỷyw'])
function isVowelDisplay(d: string): boolean {
  return d.length > 0 && VOWEL_DISPLAY_STARTS.has(d[0])
}

// ── Consonant spelling table ──────────────────────────────────────────────────
// Key   = IPA display string (after TRANSFORMS in segment.ts)
// Value = letter sequences that spell it, LONGEST FIRST (greedy match wins)
//
// Adding a new rule: just add a line here. No other file needs to change.

const CONSONANT_SPELLINGS = new Map<string, string[]>([
  // Affricates & fricatives
  ['sh',  ['tsch', 'sch', 'ssh', 'sh',
           'ti', 'ci', 'si']],     // "nation"→ti, "social"→ci, "pension"→si
  ['ch',  ['tch', 'ch']],          // "catch", "church"
  ['j',   ['dge', 'dg', 'j']],    // "judge", "fridge"
  ['zh',  ['si', 'zi', 'z']],     // "vision", "azure"
  ['ng',  ['ngg', 'ng']],          // "finger", "ring"
  ['th',  ['th']],
  ['dh',  ['th']],
  // Stops
  ['k',   ['ck', 'kk', 'ch',       // "back", "bookkeeper", "school"
           'kh', 'k', 'c', 'q']],  // "khaki", "cat", "queen"
  ['g',   ['gg', 'gh', 'g']],     // "bigger", "ghost"
  ['ɡ',   ['gg', 'g']],           // script-g (U+0261) variant from some IPA fonts
  ['t',   ['tt', 't']],
  ['d',   ['dd', 'd']],
  ['p',   ['pp', 'p']],
  ['b',   ['bb', 'b']],
  // Fricatives
  ['f',   ['ph', 'gh', 'ff', 'f']], // "phone", "enough", "off"
  ['v',   ['vv', 'v']],
  ['s',   ['ss', 's']],
  ['z',   ['zz', 'z', 's']],       // "buzz", "zero", "his"
  ['h',   ['wh', 'h']],            // "who" (wh→h), "hat"
  // Nasals & liquids
  ['n',   ['kn', 'gn', 'nn', 'n']], // "knight", "gnome", "inn"
  ['m',   ['mm', 'm']],
  ['l',   ['ll', 'l']],
  ['r',   ['rr', 'wr', 'rh', 'r']], // "current", "write", "rhythm"
  // Glides (as graphic consonants — position-based edge cases)
  ['w',   ['wh', 'w']],
  // SPEC ADDITIONS (B_tehnic §8 Tabel 1) — not previously in this table.
  ['x',   ['h']],           // /x/ voiceless velar fricative — "loch"
  ['gz',  ['x']],           // /gz/ — "example"
  ['kʃ',  ['x']],           // /kʃ/ — "sexual"
])

// ── Silent letter within a consonant digraph ──────────────────────────────────
// B_tehnic — principiul literei mute (a), "grafemele-consoane": o parte din
// digraful care sună identifică sunetul (negru, normal), cealaltă parte NU se
// pronunță deloc și trebuie desprinsă ca nod gri separat, nu contopită într-un
// singur nod uniform colorat cu restul digrafului.
// display → spelling (lowercase) → [start,end) felia din spelling care e mută.
// Cheia e sunetul-țintă (`display`), deci "wh" apare de două ori cu felii
// diferite: pt /h/ (who) 'w'-ul e mut; pt /w/ (what) 'h'-ul e mut.
const SILENT_WITHIN_SPELLING: Record<string, Record<string, [number, number]>> = {
  n: { kn: [0, 1], gn: [0, 1] },   // knight, gnome — k/g mut, n sună
  r: { wr: [0, 1], rh: [1, 2] },   // write — w mut; rhythm — h mut
  h: { wh: [0, 1] },               // who, whole, whose — w mut
  w: { wh: [1, 2] },               // what, when, why — h mut
}

function tryConsSpellings(display: string, word: string, pos: number): string {
  const spellings = CONSONANT_SPELLINGS.get(display)
  if (!spellings) return ''
  const wLow = word.toLowerCase()
  for (const sp of spellings) {
    if (wLow.startsWith(sp, pos)) return word.slice(pos, pos + sp.length)
  }
  return ''
}

// ── Vowel consumption ─────────────────────────────────────────────────────────

function consumeVowel(
  display: string,
  word: string,
  pos: number,
  nextDisplay: string | undefined
): { consumed: string; newPos: number; muteTail: string } {
  const wLen = word.length

  // Glide sound: consume exactly 1 letter (it may be a consonant-looking letter
  // like 'u' in "queen" or 'o' in "one") — never extend into the adjacent vowel run
  if (GLIDE_DISPLAYS.has(display)) {
    const consumed = pos < wLen ? word[pos] : ''
    return { consumed, newPos: pos + (consumed ? 1 : 0), muteTail: '' }
  }

  // True vowel: consume the consecutive vowel-letter run.
  //
  // CONSECUTIVE-VOWEL RULE: if the next phoneme is also a plain vowel
  // (not r-colored like 'ər'), take only 1 letter — the rest belong to
  // that next phoneme ("ia" in "association" = i + eɪ, not one run).
  // R-colored vowels like 'ər' are excluded because they follow a diphthong
  // without competing for the same letters ("power": aw→'ow', ər→'er').
  const R_COLORED = new Set(['ər', 'er', 'ar', 'or', 'ur', 'ɪr', 'ɛr'])
  const isPlainVowelDisplay = (d: string) =>
    d.length > 0 && VOWEL_DISPLAY_STARTS.has(d[0]) && !R_COLORED.has(d)

  const start = pos
  if (nextDisplay && isPlainVowelDisplay(nextDisplay)) {
    // Consecutive plain vowels: 1 letter each, no extensions.
    if (pos < wLen && isGraphicVowel(word[pos])) pos++
    // Y/W fallback for consecutive case ("beyond" ɪ at 'e' is covered by
    // graphic vowel; this handles edge cases where only a y/w is available)
    else if (pos < wLen && 'ywYW'.includes(word[pos])) pos++
  } else {
    // Full vowel run
    while (pos < wLen && isGraphicVowel(word[pos])) pos++

    // Track graphic vowels consumed BEFORE extensions — used by r-guard below.
    const graphicVowelCount = pos - start

    // Y/W fallback: if the run consumed nothing (no a/e/i/o/u at this position),
    // try consuming one 'y' or 'w'. Handles vowel phonemes whose only available
    // letter is y/w: "type"→aɪ at 'y', "happy"→i at 'y', "few"→u at 'w'.
    if (graphicVowelCount === 0 && pos < wLen && 'ywYW'.includes(word[pos])) {
      pos++
    }

    // Trailing w/y digraph (ow/aw/ay/oy/ey) — only when run had a real vowel start
    if (graphicVowelCount > 0 && pos < wLen && 'wyWY'.includes(word[pos])) pos++

    // Silent 'gh' after vowel run (night, high, caught, though). B_tehnic —
    // principiul literei mute (a): 'gh' aici e o pereche "grafeme-consoane"
    // complet mută și trebuie desprinsă ca nod gri propriu, NU inclusă în
    // grafemul colorat al vocalei (altfel "igh" ar fi colorat uniform, dar
    // spec cere 'i' colorat + 'gh' gri separat, ca în knight/sigh). Poziția
    // dinaintea lui 'gh' e reținută separat (preGhPos) tocmai ca `consumed`
    // de mai jos să NU includă gh-ul.
    let ghLen = 0
    if (pos > start && pos + 1 < wLen
        && (word[pos] === 'g' || word[pos] === 'G')
        && (word[pos + 1] === 'h' || word[pos + 1] === 'H')
        && nextDisplay !== 'f' && nextDisplay !== 'g') {
      ghLen = 2
    }
    const preGhPos = pos
    pos += ghLen

    // R-controlled absorption:
    // a) Display IS r-colored (ər, er…): always absorb the 'r' letter.
    // b) Medial 'r' before a consonant: absorb ONLY when the vowel consumed
    //    ≤1 graphic vowel letter. This handles "inter-" (1 letter 'e' → absorb 'r')
    //    but NOT "colours" (2 letters 'ou' → 'r' stays mute/silent).
    const nextIsConsonant = nextDisplay !== undefined
      && !isPlainVowelDisplay(nextDisplay)
      && !R_COLORED.has(nextDisplay)
      && nextDisplay !== 'r'
    if (pos < wLen && (word[pos] === 'r' || word[pos] === 'R') && nextDisplay !== 'r') {
      if (R_COLORED.has(display) || (nextIsConsonant && graphicVowelCount <= 1)) pos++
    }

    // consumed = tot run-ul (start..pos), MINUS doar felia gh (dacă există) —
    // nu doar prefixul de dinainte de gh, ca să nu pierdem litere absorbite
    // DUPĂ gh (ex. un eventual 'r' r-controlled — caz teoretic, dar corect).
    const wholeRun = word.slice(start, pos)
    const ghRelStart = preGhPos - start
    const consumed = ghLen > 0
      ? wholeRun.slice(0, ghRelStart) + wholeRun.slice(ghRelStart + ghLen)
      : wholeRun
    const muteTail = ghLen > 0 ? wholeRun.slice(ghRelStart, ghRelStart + ghLen) : ''
    return { consumed, newPos: pos, muteTail }
  }

  return { consumed: word.slice(start, pos), newPos: pos, muteTail: '' }
}

// ── Main alignment ────────────────────────────────────────────────────────────

export function align(word: string, segs: Seg[]): RenderNode[] {
  if (segs.length === 0)
    return [{ t: word, s: '', c: COLOR_SILENT, u: false, x: false }]

  const nodes: RenderNode[] = []
  let pos = 0
  const wLen = word.length

  for (let si = 0; si < segs.length; si++) {
    const { ipa, display, isVowel, accented } = segs[si]
    const nextDisplay = si + 1 < segs.length ? segs[si + 1].display : undefined

    // Latent phoneme — no letters consumed (syllabic marker, zero-width joiner)
    if (!display || display === '\u200d') {
      nodes.push({ t: '', s: display ?? '', c: COLOR_CONSONANT, u: false, x: true })
      continue
    }

    let consumed = ''
    let muteTail = ''      // B_tehnic (a) — 'gh' mut desprins din grupul de vocale
    let silentSlice: [number, number] | undefined

    if (isVowel) {
      const r = consumeVowel(display, word, pos, nextDisplay)
      consumed = r.consumed
      pos = r.newPos
      muteTail = r.muteTail
    } else {
      // 1. Try spelling table (handles ti→sh, rr→r, ch→k, ph→f, kn→n, etc.)
      const fromTable = tryConsSpellings(display, word, pos)
      if (fromTable) {
        consumed = fromTable
        pos += fromTable.length
        silentSlice = SILENT_WITHIN_SPELLING[display]?.[fromTable.toLowerCase()]
      } else if (
        // B_tehnic (a)+(b) generalizat: dacă litera curentă NU spune deloc
        // sunetul (nici prin tabel), dar litera URMĂTOARE se potrivește
        // exact prin tabel, litera curentă e complet mută (nod gri) și
        // sunetul se leagă de litera corectă de după ea. Trebuie verificat
        // ÎNAINTE de fallback-ul generic de mai jos (care altfel apucă orbește
        // orice literă consonantică, indiferent dacă spune sau nu sunetul —
        // exact bug-ul din "calm": /m/ apuca 'l' în loc de 'm').
        // Acoperă atât consoane pur decorative — 'l' mut înainte de /m/
        // (calm/palm/qualm) sau de /k/ (walk/talk/chalk) — cât și 'e' mut
        // de sufix (played/walked → -ed; legumes/molecules → -es/-s, /z/,
        // tratat înainte separat prin cooed's splitMuteEdSuffix pt varianta
        // fuzionată-în-vocală). Doar pt ULTIMUL fonem al cuvântului — nu
        // poate strica un caz care oricum funcționa, se declanșează STRICT
        // pe eșec total la poziția curentă.
        si === segs.length - 1 && pos < wLen
      ) {
        const better = tryConsSpellings(display, word, pos + 1)
        if (better) {
          nodes.push({ t: word[pos], s: '', c: COLOR_SILENT, u: false, x: false })
          consumed = better
          pos = pos + 1 + better.length
          silentSlice = SILENT_WITHIN_SPELLING[display]?.[better.toLowerCase()]
        } else if (isGraphicCons(word[pos])) {
          // Niciun ajutor din tabel la pos+1 → fallback vechi, ca să nu
          // pierdem litera complet.
          consumed = word[pos++]
          if (ipa.length >= 2 && pos < wLen && isGraphicCons(word[pos]))
            consumed += word[pos++]
        }
      } else if (pos < wLen && isGraphicCons(word[pos])) {
        // 2. Generic fallback: 1 letter (2 for IPA digraphs like th, ng)
        consumed = word[pos++]
        if (ipa.length >= 2 && pos < wLen && isGraphicCons(word[pos]))
          consumed += word[pos++]
      }
      // 3. Nothing matched → consumed stays '' (truly latent phoneme)
    }

    const color      = getColor(display)
    const isCons     = !color
    const isStressed = accented && isVowel

    // B_tehnic — principiul literei mute (a): digraf consonantic cu o
    // literă complet mută (kn, gn, wr, rh, wh) → două noduri, nu unul:
    // litera mută (gri) + litera care sună (normal).
    if (!isVowel && silentSlice) {
      const [ss, se] = silentSlice
      const muteText = consumed.slice(ss, se)
      const realText = consumed.slice(0, ss) + consumed.slice(se)
      const realNode: RenderNode = { t: realText, s: display, c: color ?? COLOR_CONSONANT, u: false, x: true }
      const silentNode: RenderNode = { t: muteText, s: '', c: COLOR_SILENT, u: false, x: false }
      if (ss === 0) nodes.push(silentNode, realNode)
      else nodes.push(realNode, silentNode)
      continue
    }

    // B_tehnic — regula (e): un fonem fără nicio literă/grup de litere
    // corespondent (consumed==='') apare ca ridicare la putere, nu dispare
    // silențios. Excepție — regula (d): dacă e chiar sunetul /w/ prins
    // între o schwă și un fonem consonantic, se colorează gri (fără
    // superscript), nu ridicare la putere.
    // EXCEPȚIE separată, nu din spec ci din arhitectura deja existentă:
    // schwa (/ə/) latentă (t='') e mecanismul deliberat de "consoană
    // silabică" din Regula 4 (apple/table/button — validat pe date reale
    // în sesiuni anterioare, vezi [[eic-lexicon-db]]) — rămâne complet
    // invizibilă (fără superscript), altfel s-ar strica acel guard.
    if (consumed === '' && display !== 'ə') {
      const prevDisplay = si > 0 ? segs[si - 1].display : undefined
      const isPhantomWAfterSchwa = display === 'w' && prevDisplay === 'ə'
        && nextDisplay !== undefined && !isVowelDisplay(nextDisplay)
      nodes.push(isPhantomWAfterSchwa
        ? { t: '', s: display, c: COLOR_SILENT, u: false, x: isCons }
        : { t: '', s: display, c: color ?? (isCons ? COLOR_CONSONANT : COLOR_SILENT), u: isStressed, x: isCons, superscriptOverride: display })
      continue
    }

    nodes.push({
      t: consumed,
      s: display,
      c: color ?? (isCons ? COLOR_CONSONANT : COLOR_SILENT),
      u: isStressed,
      x: isCons,
    })

    // B_tehnic — principiul literei mute (a): 'gh' mut desprins din grupul
    // de vocale al lui knight/sigh/night/caught etc., ca nod gri separat,
    // nu contopit cu culoarea vocalei.
    if (muteTail) {
      nodes.push({ t: muteTail, s: '', c: COLOR_SILENT, u: false, x: false })
    }
  }

  // Remaining letters → silent tail
  if (pos < wLen)
    nodes.push({ t: word.slice(pos), s: '', c: COLOR_SILENT, u: false, x: false })

  // GUARD (Regula 4 — subliniere doar dacă mai există o silabă cu nucleu
  // vocalic real). Verificare POST-HOC pe nodurile deja construite, nu pe
  // Seg-uri brute: un nucleu "real" e unul care a consumat efectiv litere
  // (n.t.length > 0). O schwă care nu consumă nicio literă ("apple": ə între
  // 'pp' și 'l' -> t='') e exact cazul consoanei silabice — fonemic există,
  // grafemic nu ocupă nimic. Marcajul IPA U+200D nu poate fi folosit ca semnal
  // aici: firstIpaVariant() în db.ts îl șterge necondiționat înainte ca
  // IPA-ul să ajungă la segment(), deci n-ar ajunge niciodată în Seg[].
  // Un glide (j/w/ỷ) nu contează ca nucleu real — el nu poartă niciodată
  // accent propriu, deci n.u ar fi oricum false pentru el, dar excludem
  // explicit ca să nu depindem de asta.
  //
  // Validat pe lexicon.db real (125.927 cuvinte, tabela `us`): 22.192 cuvinte
  // (~17.6%) își schimbă subliniere față de codul vechi — 14.571 monosilabice
  // marcate greșit cu accent de lexicon (asumpția veche "monosilabicele n-au
  // niciodată u=true" era falsă la scară), 7.621 cazuri reale de consoană
  // silabică (apple/table/able/addle etc.). 31/31 cuvinte-test curate corecte:
  // suprimate (-Cle: apple, table, little, purple, simple, people, middle,
  // candle, handle, bottle, uncle, angle, puddle, saddle, turtle, battle) și
  // păstrate (camera, family, chocolate, different, several, vegetable,
  // button, mountain, children, elephant, kitchen, garden, open, seven, cabin).
  const hasOtherRealVowelNucleus = nodes.some(
    n => !n.u && !n.x && n.t.length > 0 && n.s !== '' && !GLIDE_DISPLAYS.has(n.s)
  )
  if (!hasOtherRealVowelNucleus) {
    for (const n of nodes) n.u = false
  }

  return splitMuteEdSuffix(word, nodes)
}

// B_tehnic — principiul literei mute (b): "E mut prevăzut expres1" — 'e'-ul
// din sufixul "-ed" rămâne mut când n-are propriul fonem în transcriere,
// chiar dacă a fost consumat ca parte dintr-un grup de vocale deja complet
// (ex. cooed /kuːd/: digraful "oo" duce singur /uː/-ul, iar 'e' de la "-ed"
// nu are propriul segment — trebuie desprins ca nod gri, nu contopit cu "oo").
//
// Semnal folosit: cuvântul se termină în "ed", iar nodul-vocală imediat
// dinaintea consoanei finale 'd' a consumat un run de ≥3 litere terminat în
// 'e'. Un digraf englezesc normal are 2 litere (oo, ee, oa, oe, ow...); a
// treia literă vocalică e semnul că 'e' e adăugarea sufixului, nu parte din
// digraf. De-asta "hoed"/"freed"/"seed" (run de 2 litere: "oe"/"ee") NU se
// despart — acolo 'e' e organic parte a digrafului/temei, corect.
function splitMuteEdSuffix(word: string, nodes: RenderNode[]): RenderNode[] {
  if (!/ed$/i.test(word) || nodes.length < 2) return nodes
  const last = nodes[nodes.length - 1]
  const prev = nodes[nodes.length - 2]
  const lastIsFinalD = last.x && last.t.length > 0 && last.t.toLowerCase() === 'd'
  const prevIsVowelRun = !prev.x && prev.t.length >= 3
    && prev.t[prev.t.length - 1].toLowerCase() === 'e'
  if (!lastIsFinalD || !prevIsVowelRun) return nodes

  const stem = prev.t.slice(0, -1)
  const muteE = prev.t[prev.t.length - 1]
  return [
    ...nodes.slice(0, -2),
    { ...prev, t: stem },
    { t: muteE, s: '', c: COLOR_SILENT, u: false, x: false },
    last,
  ]
}