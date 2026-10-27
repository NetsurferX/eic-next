import Link from 'next/link'
import { LEVELS } from '@/lib/levels'
import { GAMES } from './_meta'
import styles from './page.module.css'

// Index: câte un joc pentru fiecare coloană din LEVELS (25). Wireframe.
// Citește LEVELS read-only; nu modifică nimic existent.

const LESSONS = LEVELS.flatMap(l => l.lessons.map(x => ({ ...x, level: l.name })))

export default function JocuriPeLitere() {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.badge}>Propunere · wireframe jucabil</span>
        <h1>Un joc pentru fiecare literă</h1>
        <p>
          Fiecare coloană din EiC are propriul joc, cu o mecanică diferită, ca
          parcurgerea sistemului să nu devină monotonă. Jocurile folosesc
          cuvintele coloanei din levels.ts; nimic nu e legat de /learn,
          gameTypes.ts sau ColourGame.tsx.
        </p>
      </div>
      <div className={styles.grid}>
        {GAMES.map(g => {
          const l = LESSONS.find(x => x.id === g.id)
          if (!l) return null
          return (
            <Link key={g.id} href={`/debug/gamification/jocuri-pe-litere/${g.id}`} className={styles.card} style={{ borderTopColor: l.color }}>
              <div className={styles.cardTop}>
                <span className={styles.sym} style={{ background: l.color }}>{l.letter.replace('\\u200D', '\u200D')}</span>
                <h2>{g.emoji} {g.title}</h2>
              </div>
              <span className={styles.tag}>{g.tag}</span>
              <p className={styles.desc}>{g.mechanic}</p>
            </Link>
          )
        })}
      </div>
      <div className={styles.footer}>
        Rută izolată: /debug/gamification/jocuri-pe-litere. Cuvintele „greșite” vin din coloane de altă culoare și
        nu conțin grupul de litere al coloanei curente. Nu există persistență de scor în această versiune.
      </div>
    </div>
  )
}
