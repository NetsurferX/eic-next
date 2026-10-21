'use client'

// src/app/debug/prima-pagina-butoane/page.tsx
//
// PROPUNERE izolată — cele două plăci albastre din schița primei pagini:
//   „use"   → „EiC"   (albastru, ca în schiță; duce la /)
//   „learn" → „study" (litere mici, roșu; duce la /learn)
// Nu atinge page.tsx, globals.css sau LevelTeaser.tsx. Doar pentru aprobare.

import Link from 'next/link'

const BLUE = '#00a2e8'
const RED = '#e53935'

const tile: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: BLUE,
  borderRadius: 18,
  textDecoration: 'none',
  transition: 'transform .15s',
}
const band: React.CSSProperties = {
  width: '100%',
  background: '#fff',
  padding: '14px 0',
  textAlign: 'center',
  fontFamily: 'var(--font-serif)',
  fontStyle: 'italic',
  fontWeight: 700,
  fontSize: 44,
  lineHeight: 1,
}

export default function PrimaPaginaButoane() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56, background: '#fff' }}>
      <Link href="/" style={{ ...tile, width: 225, height: 218 }}>
        <span style={{ ...band, color: BLUE }}>EiC</span>
      </Link>
      <Link href="/learn" style={{ ...tile, width: 210, height: 202 }}>
        <span style={{ ...band, color: RED }}>study</span>
      </Link>
    </main>
  )
}
