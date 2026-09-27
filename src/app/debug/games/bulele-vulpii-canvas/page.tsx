'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import styles from '../_gameShell.module.css'

// react-konva desenează pe <canvas> — are nevoie de browser, deci scena
// e încărcată doar client-side (ssr: false), altfel build-ul Next pică
// la randarea pe server.
const BuleleVulpiiCanvasScene = dynamic(() => import('./_Scene'), {
  ssr: false,
  loading: () => <p style={{ textAlign: 'center', color: '#999', fontSize: 13 }}>Se încarcă scena…</p>,
})

export default function BuleleVulpiiCanvasPage() {
  return (
    <div className={styles.wrap}>
      <Link href="/debug/games" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🎈 Bulele Vulpii — prototip Canvas (Konva + confetti)</h1>
        <p className={styles.sub}>
          Aceeași mecanică (balon urcă → apeși culoarea → colorat sau spart la dinți), dar randată pe{' '}
          <code>&lt;canvas&gt;</code> cu <code>konva</code> (API imperativ, nu <code>react-konva</code> —
          vezi nota din <code>_Scene.tsx</code>), cu <code>canvas-confetti</code> la reușită/ratare — în
          loc de DOM absolut-poziționat + CSS keyframes ca în <code>BuleleVulpiiGame.tsx</code>. Date demo
          proprii, izolat de tot restul aplicației.
        </p>

        <BuleleVulpiiCanvasScene />

        <p className={styles.note}>
          Propunere de evaluat — nu s-a atins <code>BuleleVulpiiGame.tsx</code>, <code>bulele-vulpii/page.tsx</code>{' '}
          și nici <code>levels.ts</code>. Dacă motorul Canvas ți se pare mai bun decât varianta DOM curentă,
          pasul următor ar fi migrarea mecanicii complete (nivel 2, dinți/coșuri reali, distractori din
          LEVELS) pe acest motor — asta rămâne de confirmat.
        </p>
      </div>
    </div>
  )
}
