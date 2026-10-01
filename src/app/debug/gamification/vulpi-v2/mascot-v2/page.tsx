'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FOX_BY_ID, FOX_SPRITES, type FoxSpriteId } from '../_foxSprites'

// Previzualizare izolată a setului nou de vulpi. Nu modifică Mascot.tsx și
// nu e înregistrată în _ideasData.ts.

export default function VulpiV2Page() {
  const [sel, setSel] = useState<FoxSpriteId>('wave')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 180)
    return () => clearInterval(t)
  }, [])

  // repaus: idleSide, cu clipit scurt din când în când
  const idle = FOX_BY_ID[tick % 17 === 0 ? 'blink' : 'idleSide']
  // alergare: alternează cadrele A/B și traversează scena
  const run = FOX_BY_ID[tick % 2 === 0 ? 'runA' : 'runB']
  const runX = (tick * 6) % 110

  const cur = FOX_BY_ID[sel]

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/debug/gamification">← Index gamificare</Link>
      <h1 style={{ fontSize: 22, margin: '12px 0' }}>Vulpi v2 — set de 12 poze</h1>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cur.src} alt={cur.label} width={220} height={220} />
        <div>
          <div style={{ fontWeight: 700 }}>{cur.label}</div>
          <div style={{ fontSize: 14, opacity: 0.8 }}>{cur.usage}</div>
          <code style={{ fontSize: 12 }}>{cur.src}</code>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8, margin: '16px 0' }}>
        {FOX_SPRITES.map(s => (
          <button
            key={s.id}
            onClick={() => setSel(s.id)}
            style={{
              border: s.id === sel ? '3px solid #e67e22' : '1px solid #bbb',
              borderRadius: 8, background: '#fff', padding: 4, cursor: 'pointer',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt={s.label} width={96} height={96} />
            <div style={{ fontSize: 11, color: '#333' }}>{s.label}</div>
          </button>
        ))}
      </div>

      <h2 style={{ fontSize: 16 }}>Animație din cadre (repaus + alergare)</h2>
      <div style={{ position: 'relative', height: 130, background: '#eaf3fb', borderRadius: 8, overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={idle.src} alt="" width={110} height={110} style={{ position: 'absolute', left: 8, bottom: 4 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={run.src} alt="" width={110} height={110} style={{ position: 'absolute', left: `${runX - 10}%`, bottom: 4 }} />
      </div>
    </main>
  )
}
