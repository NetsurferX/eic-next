import Link from 'next/link'
import styles from './page.module.css'

// NOTE: schematic / wireframe proposals only. Nothing here touches the
// existing engine, lexicon, /learn flow, levels.ts or db.ts. Nothing is
// wired into gameTypes.ts or GameSession — standalone route for Dorel to
// review shape & feel before any real spec/integration work starts.
//
// Scope note: /debug/game-concepts already covers per-lesson MINI-GAME
// mechanics (sound-hunt, syllable-tower, vowel-race, color-memory). This
// route covers the layer ABOVE that: META-PROGRESSION / gamification
// systems that would wrap around lessons and mini-games alike (streaks,
// collectibles, currency, maps, daily quests).

const CONCEPTS = [
  {
    href: '/debug/gamification/harta-sunetelor',
    emoji: '🗺️',
    title: 'Harta Sunetelor',
    tagText: 'Progres vizual / hartă',
    tagColor: '#1c7ed6',
    desc: 'Nivelurile din LEVELS devin insule pe o hartă pe care vulpița călătorește. Fiecare insulă are culoarea sunetului ei; ceața se ridică pe măsură ce lecțiile sunt terminate.',
    mechanic: 'Înlocuiește lista plată de niveluri cu o poveste de călătorie — motivează "următorul pas", nu doar "următoarea lecție".',
  },
  {
    href: '/debug/gamification/insigne',
    emoji: '🎖️',
    title: 'Colecția de Insigne',
    tagText: 'Colecționare',
    tagColor: '#ae3ec9',
    desc: 'Un album cu o insignă colorată pentru fiecare sunet stăpânit (repetiții suficiente + acuratețe). Insignele nedeblocate apar ca siluete gri.',
    mechanic: 'Obiectiv orizontal peste toate nivelurile ("colecționează toate insignele"), nu doar avans liniar.',
  },
  {
    href: '/debug/gamification/calendarul-vulpii',
    emoji: '🔥',
    title: 'Calendarul Vulpii',
    tagText: 'Streak / obicei zilnic',
    tagColor: '#e8590c',
    desc: 'Calendar lunar cu o amprentă de vulpe în fiecare zi în care copilul a exersat. Un contor de "zile la rând" crește vulpița din pui în vulpe mare.',
    mechanic: 'Recompensează consecvența zilnică, nu doar volumul; risc de streak-pierdut gestionat blând (fără pedeapsă agresivă).',
  },
  {
    href: '/debug/gamification/cufarul-vulpii',
    emoji: '💰',
    title: 'Cufărul Vulpii',
    tagText: 'Monedă / personalizare',
    tagColor: '#2f9e44',
    desc: 'Fiecare lecție terminată dă "scoici" (monedă simbolică). Scoicile se cheltuiesc într-un magazin pe accesorii cosmetice pentru mascotă (pălărie, eșarfă, ochelari).',
    mechanic: 'Recompensă tangibilă și persistentă, fără avantaj de joc — pur cosmetică, deci sigură pentru copii mici.',
  },
  {
    href: '/debug/gamification/provocarea-zilei',
    emoji: '🎯',
    title: 'Provocarea Zilei',
    tagText: 'Misiune zilnică',
    tagColor: '#f08c00',
    desc: 'O mini-provocare unică pe zi ("găsește 5 cuvinte cu sunetul roșu azi"), diferită de lecția obișnuită, cu recompensă bonus la finalizare.',
    mechanic: 'Motiv suplimentar de revenire zilnică, separat de progresul liniar prin niveluri; se poate combina cu oricare mini-joc existent.',
  },
]

export default function GamificationIndex() {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.badge}>Propuneri · doar wireframe</span>
        <h1>Concepte de gamificare (meta-progres)</h1>
        <p>
          Cinci idei schițate, separate complet de codul existent — nimic din
          /learn, levels.ts, gameTypes.ts sau ColourGame.tsx nu e atins.
          Acestea sunt sisteme care ar înveli lecțiile și mini-jocurile deja
          existente (vezi și /debug/game-concepts pentru mecanici de joc
          individuale). Alege un concept pentru a-l vedea ca schiță
          interactivă; nimic nu se integrează real până nu confirmi.
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
        Rută izolată: /debug/gamification. Nu modifică niciun fișier existent.
        După ce alegi un concept (sau o combinație), urmează spec-ul detaliat
        (stocare în localStorage/db, integrare cu STORAGE_KEY v7, hook-uri de
        declanșare din page.tsx / ColourGame.tsx).
      </div>
    </div>
  )
}
