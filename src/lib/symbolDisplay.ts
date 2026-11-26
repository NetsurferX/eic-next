// lib/symbolDisplay.ts
// Doar AFIȘARE: cum arată simbolul unei lecții în bulă (/learn), pe butonul de răspuns
// și pe pește. NU modifică levels.ts (lesson.letter rămâne simbolul IPA intern) și
// nu atinge motorul. Aici se țin înlocuirile cerute de Dorel (2026-11-06).

import { bandsFor, type Bands } from './tricolorStyle'

export interface Lesson2Display { id: string; letter: string; color: string }

export interface SymbolView {
  text: string                       // ce se scrie
  color: string                      // culoarea de bază a simbolului
  tricolor?: boolean                 // ə‍w: tricolor (ca până acum la əʊ); wa: negru–galben–negru
  bands?: Bands                      // cele trei benzi când tricolor = true
  whiteOutlined?: boolean            // l̩/m̩: alb cu chenar negru
}

// Consoanele: toate negre (simbol de apăsat + pește + bulă).
export const CONSONANT_IDS = new Set([
  'sh', 'ch', 'dj', 'th', 'syllabic-lm', 'dot-z', 'ring-gz', 'd-hat', 'c-hook', 'gh-ph-f', 'zh',
])
export const CONSONANT_BLACK = '#000000'

// Înlocuiri de text (cheie = lesson.id). Orice id lipsă → lesson.letter ca până acum.
const TEXT_BY_ID: Record<string, string> = {
  ae: '\u2091a',          // /æ/ → ₑa (e subscript + a normal)
  au: 'aw',
  u: 'u',
  ou: 'ə\u200Dw',          // schwa + U+200D (SYLLABIC_MARKER) + w — ca la əʊ
  oi: 'ỷ',                 // oɪ → ỷ (dacă vrei „oỷ”, schimbă aici)
  // Simboluri de BAZĂ pe butoane / cap de coloană (nu diacriticele din cuvinte).
  // Variantele (ŝ, ṫ, ṡ, x̊…) apar doar în tabelul de la activarea simbolului și în motor.
  sh: 'sh',
  ch: 'ch',
  dj: 'j',
  th: 'th',
  'dot-z': 'z',            // nu ṡ
  'ring-gz': 'gz',         // nu x̊
  'syllabic-lm': 'ə+',     // schwa cu plus
  'gh-ph-f': 'f',          // butonul/bula arată „f”; doar peștele poartă gh/ph (vezi fishLabelFor)
}

export function symbolView(lesson: Lesson2Display): SymbolView {
  const text = TEXT_BY_ID[lesson.id] ?? lesson.letter
  const bands = bandsFor(lesson.id)
  if (bands) return { text, color: lesson.color, tricolor: true, bands }
  if (lesson.id === 'syllabic-lm') return { text, color: '#ffffff', whiteOutlined: true }
  if (CONSONANT_IDS.has(lesson.id)) return { text, color: CONSONANT_BLACK }
  return { text, color: lesson.color }
}

// Culoarea corpului peștelui / a butonului: consoanele negre, restul ca în lesson.color.
export function bodyColorFor(lesson: Lesson2Display): string {
  return CONSONANT_IDS.has(lesson.id) ? CONSONANT_BLACK : lesson.color
}

// Stil de text pentru „alb cu chenar negru” (l̩/m̩).
export const WHITE_OUTLINED_TEXT_STYLE = {
  color: '#fff',
  WebkitTextStroke: '1.2px #000',
  paintOrder: 'stroke fill',
} as const
