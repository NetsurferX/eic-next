'use client'

// src/app/page.tsx — pagina principală (poarta de intrare).
// Două plăci: „EiC" → /eic (editorul, fostă pagină principală)
//             „study" → /learn (lecțiile / jocul)

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

export default function Gateway() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 56, background: '#fff' }}>
      <Link href="/eic" style={{ ...tile, width: 225, height: 218 }}>
        <span style={{ ...band, color: BLUE }}>EiC</span>
      </Link>
      <Link href="/learn" style={{ ...tile, width: 210, height: 202 }}>
        <span style={{ ...band, color: RED }}>study</span>
      </Link>
    </main>
  )
}
