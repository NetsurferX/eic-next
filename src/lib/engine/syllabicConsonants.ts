// engine/syllabicConsonants.ts
//
// General syllabic-consonant detector (rb6.docx table: [l̩][n̩][m̩][k̩][ŗ][d̦][v̩]
// → "alb cu chenar negru" instead of plain black). Runs on the RenderNode[]
// already built by align.ts/segment.ts, BEFORE applyRegexOverrides() — so a
// per-word regex override can still take precedence for the rare word where
// this general detector gets it wrong.
//
// SIGNAL: align.ts already marks a schwa (/ə/) that consumed NO letter as a
// t='' node (see align.ts's "consumed === '' && display !== 'ə'" exception —
// that guard exists SPECIFICALLY so schwa keeps this empty-node shape instead
// of getting a superscript). That's Pasul 3 din protocolul de schwa
// (rb6.docx): when the following consonant absorbs the schwa's syllable
// nucleus entirely (button, little, rhythm...), the vowel letter simply
// isn't there — English spelling doesn't write it. When the schwa DOES have
// its own vowel letter (camera, chocolate, several...), align.ts consumes it
// normally (t !== ''), nu apare acest nod gol; schwa se mapează normal,
// negru, fără fuziune.
// Deci "nod gol cu schwa, urmat imediat de o consoană din \C" ESTE
// declanșatorul Pasului 3 — nu trebuie reinventat, doar detectat.
//
// CORECTARE (după 'could've'/'that'd'): verificarea trebuia făcută pe
// FONEM (n.s), nu pe LITERĂ (n.t) — găsit direct din date reale. În
// 'could've', consoana care trebuie să fie silabică are fonemul /v/, dar
// GRAFEMUL afișat e 'd' (aliniere neobișnuită a contracției: 'l'→d, 'd'→v).
// O verificare pe literă n-ar fi prins niciodată acest caz, indiferent câte
// litere s-ar fi adăugat la listă — problema nu era lista incompletă, era
// nivelul greșit de verificare.

import type { RenderNode } from './types'

// Setul \C — consoane fuzionabile cu schwa (rb6.docx, Tabelul cu
// [l̩][n̩][m̩][k̩][ŗ][d̦][v̩]), verificat acum pe FONEM (n.s), nu pe literă.
// l/n/m — confirmate cu exemple reale (little/button/rhythm).
// v — confirmat (could've/would've/should've: schwa fără literă-vocală
// înainte de /v/, chiar dacă litera afișată pe acel nod e 'd').
// d — confirmat (that'd: EiC normalizează vocala redusă la schwa,
// /ˈðætəd/ nu /ˈðætɪd/, tocmai ca să declanșeze fuziunea).
// k — încă neconfirmat prin dicționar (Mc-/McDonald sunt nume proprii,
// fără IPA de procesat aici), dar inclus oricum — mecanismul e
// general, nu are nevoie de un exemplu anume ca să fie corect dacă
// situația chiar apare undeva.
// r rămâne acoperit separat, doar pentru cuvintele V-R (vr-lexical-sets.ts),
// ca să nu se suprapună/contrazică cu tratamentul de acolo.
const FUSIBLE_CONSONANT_PHONEMES = new Set(['l', 'n', 'm', 'v', 'd', 'k'])

/**
 * Scanează nodurile deja construite de align.ts/segment.ts și marchează cu
 * `syllabicOverride: true` orice consoană din \C (verificat pe fonem)
 * precedată imediat de un nod schwa cu grafem gol (semnul că schwa n-a avut
 * nicio literă-vocală de care să se lege). Nu modifică nimic altceva — pur
 * aditiv, un singur pas peste array-ul de noduri, O(n).
 */
export function applySyllabicConsonantDetection<T extends RenderNode>(nodes: T[]): T[] {
  const out = nodes.map(n => ({ ...n }))

  for (let i = 1; i < out.length; i++) {
    const prev = out[i - 1]
    const cur = out[i]
    const prevIsEmptySchwa = prev.t === '' && prev.s === 'ə'
    // cur.t !== '' — apără contra artefactului de variantă-dublă (pronunție
    // alternativă concatenată cu spațiu): acolo, noduri "doar exponent" au
    // grafem gol dar fonemul tot populat (ex. 'n'/'l'), și ar declanșa
    // fals fuziunea dacă am verifica doar fonemul. O consoană CHIAR
    // silabică are mereu o literă reală de arătat (chiar dacă neobișnuită,
    // ca 'd' purtând /v/ în could've) — nu poate fi un nod gol.
    const curIsFusible = cur.x && cur.t !== '' && FUSIBLE_CONSONANT_PHONEMES.has(cur.s)

    if (prevIsEmptySchwa && curIsFusible) {
      out[i].syllabicOverride = true
    }
  }

  return out
}
