// engine/phonologicalRules.ts
//
// Portul regulilor din protocolul fonologic EiC care se aplică STRICT pe
// baza ortografiei cuvântului + IPA-ul brut din lexicon.db — fără date
// externe (dicționare de variante atestate) sau context (cuvânt anterior/
// următor, tag gramatical). Rulează în processIpa() (engine/index.ts),
// ÎNAINTE de segment(), exact ca în transcribe() din protocolul original.
//
// REGULI PORTATE AICI (numerotarea e cea din document):
//   7.  /ɪ/+/V/ ⇒ /i/+/V/
//   8.  Eval(w/iər/∼/ir/) ∈ G={-ear,-eer,-eir,-ier,-ere} ⇒ /iər/, altfel /ir/
//   12. -ness→/nes/, -less→/les/, -iness→/ines/, -iless→/iles/
//
// REGULI *NEPORTATE* — motiv explicit, nu omisiune:
//   1,3,4,5,13,17d,17e — cer Attested(w) (variante atestate Collins/Oxford/
//     Cambridge/Macmillan/Longman/Merriam-Webster). lexicon.db dă o SINGURĂ
//     transcriere per cuvânt (firstIpaVariant) — nu există un al doilea
//     candidat cu care să se facă comparația. Structural neportabile fără
//     o sursă de date nouă (nu doar "neterminate").
//   6.  /ɪ/∼/ə/⇒/ɪ/ — NEPORTATĂ INTENȚIONAT. E o conversie globală care ar
//     schimba culoarea (ə=negru → ɪ=roșu) pe orice schwa neprotejat din
//     lexicon.db, adică pe o proporție mare din cele ~126k cuvinte. O
//     schimbare de asemenea amploare are nevoie de verificare pe date reale
//     (cum s-a făcut la patch-urile anterioare pt. lawyer/yw-exceptions),
//     nu doar de portul funcției — riscul unei regresii silențioase e prea
//     mare pentru un port "orb". Excepțiile de sufix (-ity,-icy/-acy,-ible,
//     -ace,-ate,-ily) sunt oricum condiționate de regula 6, deci rămân
//     neportate împreună cu ea.
//   9.  Forme fixe (to/do/can/...) — doar o ETICHETĂ slabă/tare în protocol,
//     nu schimbă IPA. lexicon.db nu are un rând separat pentru forma slabă
//     vs. tare a cuvintelor funcționale, deci nu există ce să comute.
//   10. Heteronime (regula POS) — are nevoie de POS-tagging extern (spaCy/
//     nltk sau manual), care nu există în pipeline.
//   11. THE (ðə/ði după cuvântul următor) — are nevoie de contextul
//     propoziției (next_word); processIpa() primește un singur cuvânt.

const RULE7_VOWELS = 'aeiouəɪʌɒɔæ'
// Same diphthong-off-glide guard as RULE8_PATTERN above (2026-08-30 fix):
// without it, "fire" (faɪər) hit THIS rule too — the /ɪ/ in the aɪ
// diphthong is followed by 'ə', so unguarded it got rewritten to 'i',
// turning "faɪər" into "faiər" and losing the aɪ diphthong grouping
// (segment.ts's TRANSFORMS only fuses the literal 'aɪ' pair, not 'a'+'i').
// Rule 7 is for genuine hiatus ("real" ɪ.ə → i.ə), never for a diphthong's
// second element — which is always immediately preceded by 'a' or 'ɔ'.
const RULE7_PATTERN = new RegExp(`(?<![aɔ])ɪ(?=[${RULE7_VOWELS}])`, 'g')

/** 7. /ɪ/+/V/ ⇒ /i/+/V/ */
export function applyRule7_iPlusVowel(ipa: string): string {
  return ipa.replace(RULE7_PATTERN, 'i')
}

const IEAR_SPELLING_GROUP = ['ear', 'eer', 'eir', 'ier', 'ere']
// NEGATIVE LOOKBEHIND (2026-08-30 fix, found while implementing the fire/
// tyre/ire §6.2 V-R lexical set): the raw pattern matched the SECOND
// element of an /aɪ/ diphthong too, since IPA writes that diphthong as two
// separate characters 'a'+'ɪ' — indistinguishable from a genuine /ɪ/
// syllable nucleus by shape alone. "fire" (spelling ends in "re", so passes
// RULE8_SPELLING_GUARD) has lexicon IPA "faɪər": the trailing "ɪər" wrongly
// matched this rule and got rewritten to "ir" (target='ir', since "fire"
// isn't in IEAR_SPELLING_GROUP), collapsing "faɪər" → "fair" — destroying
// the /aɪ/ diphthong entirely (blue #4472C4) and replacing it with a plain
// /a/+/i/ split (wrong colours, wrong phoneme count). Rule 8 is only meant
// for the NEAR set (a true /ɪ/ or /i/ nucleus, e.g. "near" nɪər, "beer"
// bɪr) — never for a diphthong's off-glide. The fix: don't match when the
// character immediately before is 'a' or 'ɔ' (the diphthongs that end in
// an ɪ-like off-glide: aɪ, ɔɪ) — a genuine near-set nucleus is always
// preceded by a consonant or the start of the word, never by that vowel.
const RULE8_PATTERN = /(?<![aɔ])[ɪi]ər?$/

/**
 * 8. Eval(w/iər/∼/ir/) ∈ G={-ear,-eer,-eir,-ier,-ere} ⇒ /iər/, altfel ⇒ /ir/
 *
 * GARDĂ ADĂUGATĂ FAȚĂ DE PROTOCOLUL ORIGINAL (necesară, confirmată pe date
 * reale din lexicon.db — nu era în pseudocodul Python):
 * regex-ul de potrivire IPA are 'r' opțional (`ər?$`), pt. că protocolul
 * trebuie să potrivească AMBELE surse — forma RP nerotică ("nɪə", fără r
 * audibil) și forma GA rotică ("nɪr"/"nɪɹ"). Dar același tipar "[ɪi]ə$"
 * (fără r) apare și la cuvinte care N-AU NICIUN sunet de r în apropierea
 * finalului — "idea" (aɪˈdiə), "area"/"korea" (ˈeəɹiə, cu r ca atac de
 * silabă ÎNAINTE de vocală, nu ca r postvocalic). Fără gardă, regula
 * inserează un /r/ inexistent: "idea" -> "diir"(!), "area" -> dublează r-ul
 * deja prezent din mijlocul cuvântului. Verificat direct pe lexicon.db.
 *
 * Semnalul corect (absent din pseudocod, dedus din chiar grupul G): un 'r'
 * postvocalic hotărăște, nu doar tiparul IPA final — și ortografic, toate
 * cuvintele cu adevărat NEAR/AIR-relevante se termină în '-r' sau '-re'
 * ("near", "fear", "interfere", "happier"), spre deosebire de "idea"/"area"
 * (terminate în vocală simplă, r-ul lor e în altă poziție silabică).
 * Gardă: regula 8 rulează DOAR dacă ortografia se termină în 'r' sau 're'.
 */
const RULE8_SPELLING_GUARD = /(r|re)$/i

export function applyRule8_near(word: string, ipa: string): string {
  const lw = word.toLowerCase()
  if (!RULE8_SPELLING_GUARD.test(lw)) return ipa
  if (!RULE8_PATTERN.test(ipa)) return ipa
  const target = IEAR_SPELLING_GROUP.some(suf => lw.endsWith(suf)) ? 'iər' : 'ir'
  return ipa.replace(RULE8_PATTERN, target)
}

// 12. Sufixe — regex ancorat la coada FONEMICĂ reală (nu la lungimea
// ortografică a sufixului), ca în protocol. iness/iless verificate înaintea
// lui ness/less pt. potrivire corectă (altfel "-ness" ar prinde și coada
// lui "-iness" mai devreme).
const RULE12_PATTERNS: [suffix: string, phonPattern: RegExp, replacement: string][] = [
  ['iness', /[ɪi]?n[əɪ]s$/, 'ines'],
  ['iless', /[ɪi]?l[əɪ]s$/, 'iles'],
  ['ness', /n[əɪ]s$/, 'nes'],
  ['less', /l[əɪ]s$/, 'les'],
]

/** 12. -ness→/nes/, -less→/les/, -iness→/ines/, -iless→/iles/ */
export function applyRule12_suffix(word: string, ipa: string): string | null {
  const lw = word.toLowerCase()
  for (const [suffix, phonPattern, replacement] of RULE12_PATTERNS) {
    if (!lw.endsWith(suffix)) continue
    if (!phonPattern.test(ipa)) return null // sufix ortografic găsit, coadă fonemică nepotrivită
    return ipa.replace(phonPattern, replacement)
  }
  return null
}

/**
 * Orchestrare — aplică 8, apoi 7, apoi 12, pe IPA-ul brut din lexicon.db,
 * înainte ca segment() să-l descompună în Seg[]. Signature-compatible cu
 * un pas suplimentar în processIpa(); nu schimbă nimic dacă niciuna din
 * reguli nu se potrivește.
 */
export function applyPhonologicalRules(word: string, rawIpa: string): string {
  let ipa = applyRule8_near(word, rawIpa)
  ipa = applyRule7_iPlusVowel(ipa)
  const suffixed = applyRule12_suffix(word, ipa)
  if (suffixed !== null) ipa = suffixed
  return ipa
}