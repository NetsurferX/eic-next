// engine/suffixVoicing.ts
// Determină alofonul sufixului -s (plural / persoana a III-a / posesiv) pe
// baza ultimului fonem al cuvântului de bază:
//   /s/ după consoane surde (voiceless)
//   /z/ după vocale și consoane sonore (voiced)
//
// Fonemele sunt scrise în forma lor de AFIȘARE (post-TRANSFORMS din
// segment.ts, vezi tabelul de acolo), nu în IPA brut — 'ch' pentru /tʃ/,
// 'th' pentru /θ/, 'sh' pentru /ʃ/ etc. Astfel se poate apela direct cu
// Seg.display sau cu ultimul RenderNode.s produs de pipeline.

export type SuffixEnvironment =
  | 'consoană surdă'
  | 'vocală / consoană sonoră'
  | 'sibilantă (epenteză /ɪz/)'

export interface SuffixSResult {
  base: string
  lastPhoneme: string
  phonetic: '/s/' | '/z/' | '/ɪz/'
  eicSpelling: string
  environment: SuffixEnvironment
}

// Consoanele surde din engleză după care -s se pronunță /s/.
// FIX (2026-09-01, B_tehnic §2.2 Regula 12, doc "0109"): lista corectă din
// specificația v2.0 e {p, t, k, f, th} — EXACT atât, fără 'h' și fără 's'.
// 'h' a fost păstrat anterior "pentru fidelitate literală" dar era deja
// semnalat ca fonem final practic inexistent în engleză — mort, dar
// inofensiv. 's' NU e inofensiv: e o SIBILANTĂ, nu doar o consoană surdă,
// și trebuia de la bun început în ramura /ɪz/ (mai jos), nu în ramura /s/.
// Cu 's' aici, "kiss" primea "kisss" (3 s-uri, greșit) — vezi comentariul
// LIMITARE CUNOSCUTĂ păstrat mai jos pt. istoric. Acum "kiss" cade corect
// în SIBILANT_FINALS și primește /ɪz/.
export const VOICELESS_CONSONANTS = new Set(['p', 't', 'k', 'f', 'th'])

// Sibilantele din engleză (Regula 12, a doua clauză): "s, z, ʃ, ʒ, tʃ, dʒ".
// Formele de mai jos sunt formele de AFIȘARE post-TRANSFORMS din
// engine/segment.ts (vezi tabelul de-acolo): /s/→'s', /z/→'z', /ʃ/→'sh',
// /ʒ/→'ʒ' (fără transformare proprie — cade pe fallback-ul cu un caracter),
// /tʃ/→'ch', /dʒ/→'dj'.
export const SIBILANT_FINALS = new Set(['s', 'z', 'sh', 'ʒ', 'ch', 'dj'])

// Excepții lexicale — cuvinte unde fonemul final e surd (th), dar sufixul
// -s se voice-uiește oricum la plural (mouth→mouths /maʊðz/, clothe→
// clothes /kloʊðz/), contrazicând regula generală de mai sus. Din
// specificație: "If after 'mouth', 'clothe' → ṡ". Listă mică, per-cuvânt —
// nu o categorie fonetică generală (alte cuvinte în -th, ex. "month"→
// "months" /s/, NU se voice-uiesc), deci nu poate fi absorbită în
// VOICELESS_CONSONANTS fără să strice acele cazuri regulate.
export const VOICING_EXCEPTIONS = new Set(['mouth', 'clothe'])

export class EiCSuffixVoicingPipeline {
  process_suffix_s(base_word: string, last_phoneme: string): SuffixSResult {
    const clean_word = base_word.trim().toLowerCase()
    const clean_phoneme = last_phoneme.trim().toLowerCase()

    if (VOICING_EXCEPTIONS.has(clean_word)) {
      return {
        base: base_word,
        lastPhoneme: last_phoneme,
        phonetic: '/z/',
        eicSpelling: `${base_word}ṡ`,
        environment: 'vocală / consoană sonoră',
      }
    }

    if (SIBILANT_FINALS.has(clean_phoneme)) {
      // Ortografia reală a pluralului sibilant nu e mereu o simplă alipire
      // de "es" (watch→watches, kiss→kisses, buzz→buzzes: DA; dar house→
      // houses, judge→judges: baza se termină deja în 'e' mut, deci se
      // adaugă doar 's', nu 'es'). Acest pipeline nu are acces la ortografia
      // completă a bazei aici (doar la ultimul FONEM) — heuristica de mai
      // jos (bază care se termină în 'e' → +s, altfel → +es) acoperă
      // majoritatea cazurilor reale fără date suplimentare.
      const eicSpelling = clean_word.endsWith('e') ? `${base_word}s` : `${base_word}es`
      return {
        base: base_word,
        lastPhoneme: last_phoneme,
        phonetic: '/ɪz/',
        eicSpelling,
        environment: 'sibilantă (epenteză /ɪz/)',
      }
    }

    if (VOICELESS_CONSONANTS.has(clean_phoneme)) {
      return {
        base: base_word,
        lastPhoneme: last_phoneme,
        phonetic: '/s/',
        eicSpelling: `${base_word}s`,
        environment: 'consoană surdă',
      }
    }

    return {
      base: base_word,
      lastPhoneme: last_phoneme,
      phonetic: '/z/',
      eicSpelling: `${base_word}ṡ`,
      environment: 'vocală / consoană sonoră',
    }
  }
}

/*
ISTORIC (rezolvat 2026-09-01, B_tehnic v2.0 §2.2 Regula 12, doc "0109"):

Această clasă avea până acum doar 2 alofoane (/s/, /z/); Regula 12 din
specificație cere 3. Ramura /ɪz/ (sibilante: s, z, ʃ, ʒ, tʃ, dʒ) e acum
implementată mai sus, cu 's' scos din VOICELESS_CONSONANTS și mutat corect
în SIBILANT_FINALS. "kiss" → SIBILANT_FINALS → /ɪz/ → "kisses" (corect,
înainte dădea "kisss"). "watch" → /ɪz/ → "watches". "bush"/"garage"(/ʒ/
final)/"judge" (dj) — la fel.

Rămâne o limitare minoră, semnalată explicit în process_suffix_s: alegerea
"+s" vs. "+es" e o heuristică pe baza literei finale a bazei (bază pe 'e'
mut → +s, altfel → +es), nu o consultare a ortografiei complete atestate —
acoperă cazurile comune (watch/kiss/buzz → +es; house/judge → +s), dar nu
e garantată 100% pe excepții neregulate. Spune dacă apare un caz concret
greșit și îl tratăm punctual, ca la V-R lexical sets.

'h' ca fonem final e practic mort în engleză (nu există cuvinte native
terminate în /h/) — a fost scos din VOICELESS_CONSONANTS pentru fidelitate
față de lista exactă din §2.2 Regula 12 ({p, t, k, f, th}), fără să schimbe
vreun comportament observabil.
*/
