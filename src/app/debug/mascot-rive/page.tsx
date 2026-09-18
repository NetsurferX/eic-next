import Link from 'next/link'
import styles from './page.module.css'

// ─────────────────────────────────────────────────────────────────────────
// PROPUNERE — mascotă reactivă la cursor, în stilul micro-interacțiunilor
// fluide de tip rive.app. Rută complet izolată: nu atinge Mascot.tsx,
// globals.css sau vreun alt fișier existent. Fiecare concept de mai jos
// refolosește componenta reală <Mascot /> (aceleași PNG-uri din
// /public/mascot/) și doar o "înfășoară" într-un wrapper cu transform
// calculat din poziția cursorului — vezi _useCursorVector.ts.
//
// Cele 3 variante diferă prin CÂT de mult "simte" mascota cursorul:
//   1. subtil (tilt/parallax fin, mereu discret)
//   2. dramatic (urmărire cu inerție/spring, senzație fizică)
//   3. comportamental (praguri de proximitate → schimbă starea reală a
//      mascotei: idle → pointing → talking, nu doar un transform vizual)
// ─────────────────────────────────────────────────────────────────────────

const CONCEPTS = [
  {
    href: '/debug/mascot-rive/priviri-si-tilt',
    emoji: '👀',
    title: 'Priviri și Tilt',
    tagText: 'Micro-interacțiune subtilă',
    tagColor: '#0d9488',
    desc: 'Mascota se apleacă și se rotește foarte discret spre cursor — câteva grade, câțiva pixeli — ca și cum "ar privi" în direcția ta, fără să pară că se agită.',
    mechanic: 'Cel mai aproape de senzația rive.app: mișcare minimă, continuă, niciodată zgomotoasă. Bun candidat pentru starea "idle" permanentă din /learn.',
  },
  {
    href: '/debug/mascot-rive/urmarire-cu-inertie',
    emoji: '🌀',
    title: 'Urmărire cu Inerție',
    tagText: 'Fizică / spring',
    tagColor: '#7048e8',
    desc: 'Mascota "rămâne în urmă" cursorului cu o mică întârziere elastică (spring), plus o umbră proprie care se întinde pe direcția mișcării rapide.',
    mechanic: 'Senzație mai jucăușă și mai vizibilă decât #1 — potrivit pentru un ecran de recompensă sau o pagină de start, nu pentru fundal permanent în timpul lecției.',
  },
  {
    href: '/debug/mascot-rive/reactie-de-proximitate',
    emoji: '🦊',
    title: 'Reacție de Proximitate',
    tagText: 'Comportament, nu doar vizual',
    tagColor: '#e8590c',
    desc: 'Nu doar un transform: pe măsură ce cursorul se apropie, mascota chiar schimbă starea reală (idle → pointing → talking + portret "laugh"), ca și cum te-ar observa venind.',
    mechanic: 'Cel mai "viu" — dar și cel mai potrivit de folosit cu măsură (un moment de suprindere, nu fundal continuu, ca să nu obosească copilul).',
  },
]

export default function MascotRiveIndex() {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.badge}>Propuneri · doar wireframe</span>
        <h1>Mascotă reactivă la cursor</h1>
        <p>
          Trei variante de „à la rive.app&rdquo; pentru mascota existentă —
          de la un tilt discret, la urmărire cu inerție fizică, până la o
          reacție comportamentală reală (schimbare de stare). Toate refolosesc
          componenta <code>Mascot.tsx</code> și PNG-urile existente, fără nicio
          modificare la codul actual. Alege un concept pentru a-l încerca live
          cu mouse-ul.
        </p>
      </div>

      <div className={styles.grid}>
        {CONCEPTS.map(c => (
          <Link key={c.href} href={c.href} className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.emoji}>{c.emoji}</span>
              <h2>{c.title}</h2>
            </div>
            <span
              className={styles.tag}
              style={{ background: c.tagColor + '1a', color: c.tagColor }}
            >
              {c.tagText}
            </span>
            <p className={styles.desc}>{c.desc}</p>
            <p className={styles.mechanic}>{c.mechanic}</p>
          </Link>
        ))}
      </div>

      <div className={styles.footer}>
        Rută izolată: /debug/mascot-rive. Nu modifică Mascot.tsx, globals.css
        sau orice alt fișier existent. Necesită mouse/pointer — pe touch,
        rămâne pur și simplu în starea idle a mascotei. Respectă
        prefers-reduced-motion.
      </div>
    </div>
  )
}
