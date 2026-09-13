import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GAME_CONCEPTS, type GameConcept } from '@/lib/gameConcepts'

export function generateStaticParams() {
  return GAME_CONCEPTS.map((c) => ({ slug: c.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const concept = GAME_CONCEPTS.find((c) => c.slug === params.slug)
  return { title: concept ? `EiC · ${concept.name}` : 'EiC · Concept joc' }
}

const box: React.CSSProperties = {
  border: '2px dashed #b8b4ab',
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  opacity: 0.8,
  padding: '0.5rem',
  textAlign: 'center',
}

function Chip({ hex, label }: { hex: string; label: string }) {
  return (
    <span
      style={{
        ...box,
        borderStyle: 'solid',
        borderColor: hex,
        color: hex,
        fontWeight: 600,
        padding: '0.4rem 0.8rem',
        borderRadius: 20,
      }}
    >
      {label}
    </span>
  )
}

function Wireframe({ concept }: { concept: GameConcept }) {
  const colors = concept.accentColors
  switch (concept.layout) {
    case 'sort-columns':
      return (
        <div>
          <div style={{ ...box, height: 60, marginBottom: '1.2rem' }}>cuvânt care cade ↓</div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colors.length}, 1fr)`, gap: '0.75rem' }}>
            {colors.map((hex) => (
              <div key={hex} style={{ ...box, height: 140, flexDirection: 'column', gap: 8, borderColor: hex }}>
                <span style={{ width: 24, height: 24, borderRadius: 6, background: hex }} />
                <span>coș</span>
              </div>
            ))}
          </div>
        </div>
      )
    case 'memory-grid':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', maxWidth: 420 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                ...box,
                aspectRatio: '1',
                background: i % 2 === 0 ? colors[i % colors.length] : '#f4f2ee',
                color: i % 2 === 0 ? '#fff' : undefined,
                borderColor: i % 2 === 0 ? colors[i % colors.length] : '#b8b4ab',
              }}
            >
              {i % 2 === 0 ? '' : '?'}
            </div>
          ))}
        </div>
      )
    case 'lane-runner':
      return (
        <div>
          <div style={{ ...box, height: 50, marginBottom: '1rem' }}>țintă / cuvânt curent</div>
          <div style={{ ...box, height: 120, position: 'relative', overflow: 'hidden', justifyContent: 'flex-start', paddingLeft: 20 }}>
            <span style={{ fontSize: '1.5rem' }}>🦊</span>
            <div style={{ display: 'flex', gap: '2rem', marginLeft: '2rem' }}>
              {colors.map((hex, i) => (
                <span key={i} style={{ width: 36, height: 36, borderRadius: 8, background: hex, flexShrink: 0 }} />
              ))}
            </div>
          </div>
        </div>
      )
    case 'maze-path':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem', maxWidth: 320 }}>
          {Array.from({ length: 25 }).map((_, i) => {
            const hex = colors[i % colors.length]
            const onPath = i % 4 === 0
            return (
              <div
                key={i}
                style={{
                  ...box,
                  aspectRatio: '1',
                  fontSize: '0.6rem',
                  background: onPath ? hex : '#f4f2ee',
                  borderColor: onPath ? hex : '#b8b4ab',
                  color: onPath ? '#fff' : '#999',
                }}
              >
                {i === 0 ? '🦊' : i === 24 ? '🏁' : ''}
              </div>
            )
          })}
        </div>
      )
    case 'chain-flow':
      return (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          {colors.map((hex, i) => (
            <div key={hex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ ...box, height: 60, width: 90, borderColor: hex, color: hex, fontWeight: 600 }}>
                cuvânt {i + 1}
              </div>
              {i < colors.length - 1 && <span style={{ opacity: 0.4 }}>→</span>}
            </div>
          ))}
          <div style={{ ...box, height: 60, width: 90, borderStyle: 'dashed' }}>+ adaugă</div>
        </div>
      )
    case 'mc-audio':
      return (
        <div>
          <div style={{ ...box, height: 70, marginBottom: '1rem' }}>🔊 redă sunet</div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colors.length}, 1fr)`, gap: '0.75rem' }}>
            {colors.map((hex) => (
              <div key={hex} style={{ ...box, height: 70, borderColor: hex, color: hex, fontWeight: 600 }}>
                varianta
              </div>
            ))}
          </div>
        </div>
      )
    case 'hunt-highlight':
      return (
        <div style={{ ...box, height: 100, fontSize: '1.8rem', gap: '0.15rem' }}>
          {'e x a m p l e'.split(' ').map((ch, i) => (
            <span
              key={i}
              style={{
                textDecoration: i === 1 || i === 5 ? 'underline' : 'none',
                opacity: i === 1 || i === 5 ? 1 : 0.5,
                color: i === 1 || i === 5 ? colors[0] : undefined,
              }}
            >
              {ch}
            </span>
          ))}
        </div>
      )
    case 'stack-tower':
      return (
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 4, width: 100, margin: '0 auto' }}>
          {colors.map((hex) => (
            <div key={hex} style={{ height: 28, background: hex, borderRadius: 4 }} />
          ))}
          <div style={{ ...box, height: 40, borderStyle: 'dashed' }}>bază</div>
        </div>
      )
    default:
      return null
  }
}

export default function GameConceptPage({ params }: { params: { slug: string } }) {
  const concept = GAME_CONCEPTS.find((c) => c.slug === params.slug)
  if (!concept) return notFound()

  return (
    <main className="eic-home" style={{ maxWidth: 640 }}>
      <Link href="/debug/game-concepts" style={{ fontSize: '0.8rem', opacity: 0.6 }}>
        ← toate conceptele
      </Link>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: '0.5rem 0 0.25rem' }}>
        {concept.name}
      </h1>
      <p style={{ fontSize: '0.9rem', opacity: 0.75, marginBottom: '0.4rem', lineHeight: 1.5 }}>
        {concept.mechanic}
      </p>
      <p style={{ fontSize: '0.8rem', opacity: 0.5, fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Antrenează: {concept.skill}
      </p>

      <Wireframe concept={concept} />
    </main>
  )
}
