// scripts/diacritic-test.ts — spot-check Tabelul T1 diacritic substitution
// and the dʒ/j display-token fix, using the REAL pipeline (processIpa +
// resolveDisplay), same as production.

import Database from 'better-sqlite3'
import path from 'path'
import { processIpa, resolveDisplay } from '../lib/engine'

function firstIpaVariant(raw: string): string {
  const noZwj = raw.replace(/\u200d/g, '')
  const firstPart = noZwj.split(',')[0].trim()
  const m = firstPart.match(/\/([^/]+)\//)
  return m ? m[1] : firstPart.replace(/^\/|\/$/g, '')
}

const db = new Database(path.join(__dirname, 'lexicon.db'), { readonly: true })

const words = [
  'cent', 'city', 'cat', 'cold',           // c → s vs c → k (no diacritic)
  'chemistry', 'chef', 'machine', 'school', // ch → k / ch → sh
  'gem', 'judge', 'barge', 'fridge',        // g/dj-collision fix
  'does', 'is', 'sugar',                    // s → z / s → sh
  'nation', 'station',                      // ti → sh (split)
  'culture', 'future',                      // t → ch
  'exam', 'example',                        // x → gz
  'this', 'them', 'think', 'three',         // th → dh (diacritic) vs th → th (plain)
]

for (const w of words) {
  const row = (db.prepare('SELECT ipa FROM us WHERE word=?').get(w) as { ipa: string } | undefined)
    ?? (db.prepare('SELECT ipa FROM uk WHERE word=?').get(w) as { ipa: string } | undefined)
  if (!row) { console.log(w, '— NOT FOUND'); continue }
  const ipa = firstIpaVariant(row.ipa)
  const nodes = processIpa(w, ipa)
  const display = resolveDisplay(nodes)
  const rendered = display.map(d => d.glyph ?? d.t).join('')
  const colors = nodes.map(n => `${n.t || '∅'}:${n.c}${n.glyphOverride ? `(${n.glyphOverride})` : ''}`).join(' ')
  console.log(`${w.padEnd(10)} ipa=/${ipa}/  →  ${rendered.padEnd(14)}  [${colors}]`)
}
