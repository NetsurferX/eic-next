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

export type SuffixEnvironment = 'consoană surdă' | 'vocală / consoană sonoră'

export interface SuffixSResult {
  base: string
  lastPhoneme: string
  phonetic: '/s/' | '/z/'
  eicSpelling: string
  environment: SuffixEnvironment
}

// Consoanele surde din engleză după care -s se pronunță /s/.
// NOTĂ: nu includem aici sibilantele sh/ch/j (vezi avertismentul din
// comentariul "LIMITARE CUNOSCUTĂ" mai jos) — dar 'h' și 's' au fost
// adăugate explicit conform specificației (2026-08-12): "If after 'ke',
// 'pe', 'te', 'p', 't', 'k', 'f', 'h', 's' → s". 'ke'/'pe'/'te' nu sunt
// adăugate ca intrări separate — sunt tratate ca echivalente fonetic cu
// k/p/t (ortografie cu e mut, ex. bike/hope/gate), iar acest pipeline
// lucrează pe FONEM, nu pe literă. Dacă intenția era alta (o distincție
// ortografică reală, nu doar fonetică), spune și revizuim.
export const VOICELESS_CONSONANTS = new Set(['p', 't', 'k', 'f', 'th', 'h', 's'])

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
LIMITARE CUNOSCUTĂ (nu am corectat-o fără să întreb, doar semnalez):

Regula reală -s din engleză are 3 alofoane, nu 2:
  /s/   după consoane surde non-sibilante   (p, t, k, f, th)
  /ɪz/  după sibilante                       (s, z, sh, zh, ch, j/dʒ)
  /z/   după tot restul (vocale + consoane sonore non-sibilante)

Clasa Python originală pune sibilantele surde (s, sh, ch) implicit în ramura
/z/ (pentru că nu sunt în voiceless_consonants), ceea ce dă rezultate greșite:
  "kiss" -> ar trebui "kisses" /ɪz/, nu "kissṡ" /z/
  "bush" -> ar trebui "bushes" /ɪz/, nu "bushṡ" /z/
  "watch" -> ar trebui "watches" /ɪz/, nu "watchṡ" /z/

De asemenea pʰ/tʰ/kʰ (aspirate) din setul original nu apar niciodată ca
"ultim fonem" — aspirația e un alofon de atac de silabă, nu de coda finală
de cuvânt — deci acele 3 intrări sunt moarte în practică. Nu le-am mai pus.

Portul de mai sus e fidel 1:1 cu clasa cerută. Spune dacă vrei să adaug
ramura /ɪz/ (sibilante) — e un `if` în plus, dar schimbă rezultatul pentru
orice cuvânt terminat în s/z/sh/zh/ch/j.

ACTUALIZARE (2026-08-12): 's' a fost adăugat la VOICELESS_CONSONANTS conform
noii specificații. Asta NU rezolvă limitarea de mai sus — doar schimbă CE
răspuns greșit primești pentru cuvinte terminate în /s/. Înainte: "kiss" →
ramura /z/ → "kissṡ" (greșit, ar trebui /ɪz/). Acum: "kiss" → ramura /s/ →
"kisss" (tot greșit — nici spelling-ul cu 3 s-uri, nici /s/ simplu nu e
corect; real e /ɪz/, "kisses"). Dacă vrei corectitudine reală pe cuvinte
terminate în sibilante, tot ramura /ɪz/ e nevoie, nu doar mutarea lui 's'
între seturi. 'h' ca fonem final e practic mort în engleză (nu există
cuvinte native terminate în /h/), deci adăugarea lui nu schimbă comportament
observabil — l-am păstrat doar pentru fidelitate literală față de listă.
*/
