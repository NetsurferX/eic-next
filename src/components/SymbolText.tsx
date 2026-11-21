import type { ReactNode } from 'react'

// ── Simbolul „x̊" (x cu inel deasupra) ──────────────────────────────────────
//    Caracterul combinat U+030A își așază singur inelul, iar fiecare font îl pune
//    altfel (uneori într-o parte). Aici inelul e desenat separat, centrat exact pe
//    literă, la aceeași distanță deasupra ei în orice font (poziția se ia din
//    înălțimea literei „x" a fontului curent, unitatea CSS `ex`), cu culoarea textului.
//    `ringify(text)` înlocuiește fiecare „x̊" din text; restul textului rămâne neschimbat.
//    Stilul: `.x-ring` / `.x-ring-o` din globals.css. ──

const X_RING = 'x\u030A'

export function ringify(text: string): ReactNode {
  if (!text.includes(X_RING)) return text
  return text.split(X_RING).flatMap((part, i, all) => {
    const out: ReactNode[] = part ? [part] : []
    if (i < all.length - 1) {
      out.push(
        <span key={`r${i}`} className="x-ring" role="img" aria-label="x̊">
          <span aria-hidden="true">x</span>
          <i className="x-ring-o" aria-hidden="true" />
        </span>,
      )
    }
    return out
  })
}
