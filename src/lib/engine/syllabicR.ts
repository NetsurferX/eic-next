// engine/syllabicR.ts
//
// General syllabic-'r' detector (B_tehnic §6.1 — "alb cu chenar negru"
// pentru grafemul /ər/). Până acum, fiecare cuvânt din familiile NEAR
// (near/dear), "-ere" (here/there/premiere/interfere) și CARE/FIRE
// (care/bare/stare/bear/hair/poor/tour/fire/tyre/ire) avea o regulă regex
// separată doar pentru syllabicR, hardcodată pe ortografie — cf. cererii
// „fă-o regulă generală", mecanismul de mai jos le înlocuiește pe toate
// printr-un singur test, verificat pe FONEME reale (nodes[].s/.t), nu pe
// literele cuvântului. Rulează ÎNAINTE de applyRegexOverrides(), exact ca
// applySyllabicConsonantDetection (syllabicConsonants.ts) — un eventual
// regex per-cuvânt tot poate suprascrie rezultatul, dacă apare vreodată o
// excepție reală.
//
// SEMNALUL (derivat empiric, verificat pe pipeline-ul real, 2026-09-08):
// un 'r' consoană primește syllabicOverride quando:
//   0. grafemul e LITERAL litera 'r' (nu doar fonemul 's'==='r') — gardă
//      adăugată după ce "assure" a arătat o anomalie preexistentă în
//      align.ts (un nod cu litera 's' care poartă fonemul 'r', artefact
//      independent de acest detector); fiecare cuvânt confirmat pozitiv
//      (near/dear/here/there/care/bare/stare/bear/hair/poor/tour/fire/
//      tyre/ire/premiere) are oricum grafemul 'r' propriu-zis pe acel nod,
//      deci garda nu exclude niciun caz real.
//   1. nu mai urmează NICIUN nod cu fonem real după el (doar noduri mute,
//      s==='') — exclude "curable"/"curing" (sufix real după r) și
//      "berry"/"senior" (r urmat de altă vocală reală, nu final).
//   2. nodul de dinainte e fie:
//      (a) o vocală cu fonem real, care NU e schwa (near/dear/here/there/
//          care/bare/stare/bear/hair/poor/tour/fire[direct]/tyre/ire/
//          premiere) — r urmează direct diftongul/vocala accentuată; SAU
//      (b) un schwa cu GRAFEM GOL (t==='', s==='ə') — exact semnalul deja
//          folosit de syllabicConsonants.ts (Pasul 3 din protocolul de
//          schwa) — iar ÎNAINTEA acelui schwa gol se află o vocală reală
//          (cazul "fire": ay̓ → ə(gol) → r).
//
// DE CE NU ACOPERĂ ȘI "hour/our/tower/power" — verificat explicit, NU e o
// omisiune: hour/our au schwa cu GRAFEM REAL (litera 'u'/'w' consumată de
// schwa), la fel ca tower/power/flower — structural IDENTICE. Diferența
// hour(DA, syllabicR) vs. tower(NU) e pur PEDAGOGICĂ, nu fonetică (cf.
// notelor lui Dorel: "r silabic e folosit din motive pedagogice, nu dintr-o
// regulă fonetică universală") — deci NU poate fi derivată mecanic fără
// ambiguitate. vr-our-r și vr-tower-power-flower-w (vr-lexical-sets.ts)
// rămân reguli separate, hand-written, neatinse.
// De asemenea NU acoperă formele CURE cu sufix (curable/curing/curate) —
// acelea trec testul 1 de mai sus (au litere reale după r), deci sunt
// lăsate exclusiv pe vr-cure-r (deja mecanică, phonemicGate, rescrisă la
// regula 18).

import type { RenderNode } from './types'

function hasRealPhonemeAfter<T extends RenderNode>(nodes: T[], fromIndex: number): boolean {
  for (let j = fromIndex + 1; j < nodes.length; j++) {
    if (nodes[j].s !== '') return true
  }
  return false
}

/**
 * Scanează nodurile deja construite de align.ts/segment.ts și marchează cu
 * `syllabicOverride: true` orice 'r' consoană care urmează direct unei
 * vocale accentuate (sau unui schwa fără literă proprie, la rândul lui
 * precedat de o vocală) și care nu mai e urmată de niciun fonem real —
 * semnul unei fuziuni /ər/ finale (grafemul /ər/, B_tehnic §6.1). Pur
 * aditiv, un singur pas peste array-ul de noduri, O(n).
 */
export function applySyllabicRDetection<T extends RenderNode>(nodes: T[]): T[] {
  const out = nodes.map(n => ({ ...n }))

  for (let i = 0; i < out.length; i++) {
    const cur = out[i]
    if (!(cur.x && cur.s === 'r' && cur.t.toLowerCase() === 'r')) continue
    if (hasRealPhonemeAfter(out, i)) continue

    const prev = i >= 1 ? out[i - 1] : undefined
    if (!prev || prev.x) continue // trebuie să existe o vocală imediat înainte

    const directVowel = prev.s !== '' && prev.s !== 'ə'
    const fusedEmptySchwa =
      prev.s === 'ə' && prev.t === '' &&
      i >= 2 && !out[i - 2].x && out[i - 2].s !== ''

    if (directVowel || fusedEmptySchwa) {
      out[i].syllabicOverride = true
    }
  }

  return out
}
