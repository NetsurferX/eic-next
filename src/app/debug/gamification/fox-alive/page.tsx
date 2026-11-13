'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FoxAlive, type FoxAliveAction, type FoxAliveState } from '@/components/game/FoxAlive'
import { Mascot } from '@/components/game/Mascot'

// FoxAlive — proba de comparație. Rută izolată: nu modifică niciun fișier
// existent și nu e înregistrată în indexul de gamificare (de adăugat doar
// dacă Dorel acceptă). În stânga: Mascot-ul actual din joc; în dreapta:
// FoxAlive, cu aceleași props. Mărimile 72 / 96 sunt cele folosite real în
// joc (PingPong, OnboardingSoundIntro, BuleleVulpii, MascotReward).

type Choice =
  | { label: string; state: FoxAliveState; action?: undefined }
  | { label: string; state: FoxAliveState; action: FoxAliveAction }

const CHOICES: Choice[] = [
  { label: '🙂 idle', state: 'idle' },
  { label: '👉 pointing', state: 'pointing' },
  { label: '👏 clapping', state: 'clapping' },
  { label: '🎉 cheering', state: 'cheering' },
  { label: '💬 talking', state: 'talking' },
  { label: '👋 waving', state: 'waving' },
  { label: '🪑 sitting', state: 'sitting' },
  { label: '😴 sleeping', state: 'sleeping' },
  { label: '🏃 walking', state: 'idle', action: 'walking' },
  { label: '🤏 grabbing', state: 'idle', action: 'grabbing' },
  { label: '⭐ holding-star', state: 'idle', action: 'holding-star' },
  { label: '🏆 holding-cup', state: 'idle', action: 'holding-cup' },
  { label: '🫗 pouring', state: 'idle', action: 'pouring' },
  { label: '🥳 celebrating', state: 'idle', action: 'celebrating' },
]

// Mascot (veche) nu cunoaște waving/sitting/sleeping — le arătăm ca idle
const OLD_STATE: Record<FoxAliveState, 'idle' | 'pointing' | 'clapping' | 'cheering' | 'talking'> = {
  idle: 'idle', pointing: 'pointing', clapping: 'clapping', cheering: 'cheering', talking: 'talking',
  waving: 'idle', sitting: 'idle', sleeping: 'idle',
}

const btn = (on: boolean) => ({
  padding: '6px 12px',
  borderRadius: 999,
  cursor: 'pointer',
  border: on ? '2px solid #e67e22' : '1px solid #bbb',
  background: on ? '#fff3e6' : '#fff',
  color: '#222',
  fontSize: 13,
})

export default function Page() {
  const [i, setI] = useState(0)
  const [replay, setReplay] = useState(0)
  const [msg, setMsg] = useState(false)
  const c = CHOICES[i]
  const message = msg ? 'Bravo! Ai nimerit 🦊' : null

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/debug/gamification">← Index gamificare</Link>
      <h1 style={{ fontSize: 24, margin: '12px 0 4px' }}>🦊 FoxAlive — vulpea vie</h1>
      <p style={{ color: '#444', fontSize: 14, margin: '0 0 12px' }}>
        Aceleași props ca <code>MascotV2</code>. Stânga: <code>Mascot</code> actual. Dreapta:{' '}
        <code>FoxAlive</code> (mișcarea din <code>animatii-vulpii</code>). „Rejoacă” repornește starea
        (explozia de stele la cheering/celebrating).
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {CHOICES.map((x, n) => (
          <button key={x.label} style={btn(n === i)} onClick={() => { setI(n); setReplay((r) => r + 1) }}>
            {x.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button style={btn(false)} onClick={() => setReplay((r) => r + 1)}>↻ Rejoacă</button>
        <button style={btn(msg)} onClick={() => setMsg((v) => !v)}>💬 Mesaj în bulă</button>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <section style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Acum (Mascot)</div>
          <div style={{ minHeight: 330, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 28, paddingTop: 70 }}>
            <Mascot key={`o72-${replay}`} state={c.action ? 'idle' : OLD_STATE[c.state]} action={c.action} message={message} size={72} />
            <Mascot key={`o220-${replay}`} state={c.action ? 'idle' : OLD_STATE[c.state]} action={c.action} size={220} />
          </div>
        </section>

        <section style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>FoxAlive</div>
          <div style={{ minHeight: 330, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 28, paddingTop: 70 }}>
            <FoxAlive key={`n72-${replay}`} state={c.state} action={c.action} message={message} size={72} />
            <FoxAlive key={`n220-${replay}`} state={c.state} action={c.action} size={220} />
          </div>
        </section>
      </div>
    </main>
  )
}
