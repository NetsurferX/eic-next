import Link from 'next/link'
import styles from './page.module.css'

// NOTE: schematic / wireframe proposals only. Nothing here touches the
// existing engine, lexicon, or /learn flow. Nothing is wired into
// gameTypes.ts or GameSession — this is a standalone route for Dorel to
// review shape & feel before any real spec/integration work starts.

const CONCEPTS = [
  {
    href: '/debug/game-concepts/sound-hunt',
    emoji: '🦊',
    title: 'Vânătoare de Sunete',
    tagText: 'Recunoaștere rapidă',
    tagColor: '#2f9e44',
    desc: 'Vulpița aleargă printre tufișuri colorate; copilul trebuie să atingă tufișul a cărui culoare corespunde sunetului auzit, înainte să treacă vulpița.',
    mechanic: 'Mecanică: timp scurt pe rundă, 4 tufișuri-culoare, reacție vizuală imediată (corect/greșit) + scor de reflex.',
  },
  {
    href: '/debug/game-concepts/syllable-tower',
    emoji: '🧱',
    title: 'Turnul Silabelor',
    tagText: 'Construcție / secvențiere',
    tagColor: '#1c7ed6',
    desc: 'Un cuvânt e spart în cărămizi-silabe amestecate. Copilul le așază în ordine pe turn; cărămida silabei accentuate e mai mare și strălucește.',
    mechanic: 'Mecanică: click/atingere pentru a plasa următoarea cărămidă; turnul crește; greșeală = cărămida se clatină și cade un nivel.',
  },
  {
    href: '/debug/game-concepts/vowel-race',
    emoji: '🏁',
    title: 'Cursa Vocalelor',
    tagText: 'Reflex sub presiune',
    tagColor: '#e8590c',
    desc: 'Vulpița aleargă pe o pistă cu 3 porți colorate. Un cuvânt apare deasupra; copilul alege poarta cu culoarea vocalei dominante înainte ca vulpița să ajungă la ea.',
    mechanic: 'Mecanică: viteză crescândă pe măsură ce seria de răspunsuri corecte crește; o greșeală încetinește vulpița, nu termină jocul.',
  },
  {
    href: '/debug/game-concepts/color-memory',
    emoji: '🃏',
    title: 'Memoria Culorilor',
    tagText: 'Memorie / perechi',
    tagColor: '#ae3ec9',
    desc: 'Joc clasic de perechi: cărți cu cuvinte scrise simplu (fără culoare) și cărți-culoare. Copilul întoarce două cărți și trebuie să potrivească cuvântul cu culoarea sunetului dominant.',
    mechanic: 'Mecanică: grilă 4×3, două cărți întoarse simultan, pereche corectă rămâne descoperită + reacție mascotă.',
  },
]

export default function GameConceptsIndex() {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.badge}>Propuneri · doar wireframe</span>
        <h1>Concepte noi de mini-jocuri</h1>
        <p>
          Patru idei schițate, separate complet de codul existent — nimic din
          /learn, gameTypes.ts sau ColourGame.tsx nu e atins. Alege un concept
          pentru a-l vedea ca schiță interactivă; nimic nu se integrează
          real până nu confirmi.
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
        Rută izolată: /debug/game-concepts. Nu modifică niciun fișier existent.
        După ce alegi un concept, urmează spec-ul detaliat (ecrane, stare,
        integrare cu gameTypes.ts / GameSession, reutilizare din ColourGame.tsx).
      </div>
    </div>
  )
}
