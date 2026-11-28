import type { ReactNode } from 'react'

// ── Simbolul „x̊" (x cu inel deasupra) ──────────────────────────────────────
//    Caracterul combinat U+030A își așază singur inelul, iar fiecare font îl pune
//    altfel (uneori într-o parte). Aici inelul e desenat separat, centrat exact pe
//    literă, la aceeași distanță deasupra ei în orice font (poziția se ia din
//    înălțimea literei „x" a fontului curent, unitatea CSS `ex`), cu culoarea textului.
//    `ringify(text)` înlocuiește fiecare „x̊" din text; restul textului rămâne neschimbat.
//    Stilul: `.x-ring` / `.x-ring-o` din globals.css. ──

const X_RING = 'x\u030A'
// „ə+” (silabic l̩/m̩): plusul se scrie ca exponent (ridicat la putere), peste tot unde apare simbolul.
const SCHWA_PLUS = 'ə+'

export function ringify(text: string): ReactNode {
  if (!text.includes(X_RING) && !text.includes(SCHWA_PLUS)) return text
  const out: ReactNode[] = []
  let buf = ''
  let k = 0
  for (let i = 0; i < text.length; ) {
    if (text.startsWith(X_RING, i)) {
      if (buf) { out.push(buf); buf = '' }
      out.push(
        <span key={`r${k++}`} className="x-ring" role="img" aria-label="x̊">
          <span aria-hidden="true">x</span>
          <i className="x-ring-o" aria-hidden="true" />
        </span>,
      )
      i += X_RING.length
    } else if (text.startsWith(SCHWA_PLUS, i)) {
      buf += 'ə'
      out.push(buf); buf = ''
      out.push(<sup key={`p${k++}`} className="sym-plus" aria-label="plus">+</sup>)
      i += SCHWA_PLUS.length
    } else {
      buf += text[i]
      i += 1
    }
  }
  if (buf) out.push(buf)
  return out
}
