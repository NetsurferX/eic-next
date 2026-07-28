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
// NOTĂ: nu includem aici sibilantele (s, sh, ch/z, j) — vezi avertismentul
// din comentariul de mai jos, secțiunea "LIMITARE CUNOSCUTĂ".
export const VOICELESS_CONSONANTS = new Set(['p', 't', 'k', 'f', 'th'])

export class EiCSuffixVoicingPipeline {
  process_suffix_s(base_word: string, last_phoneme: string): SuffixSResult {
    const clean_phoneme = last_phoneme.trim().toLowerCase()

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
*/
