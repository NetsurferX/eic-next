'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MascotV2,
  type MascotActionV2,
  type MascotStateV2,
} from '@/components/game/MascotV2'

// Banc de probă izolat pentru MascotV2 — nu atinge Mascot.tsx și nu e
// înregistrat în _ideasData.ts.

const STATES: MascotStateV2[] = [
  'idle', 'talking', 'pointing', 'clapping', 'cheering', 'waving', 'sitting', 'sleeping',
]
const ACTIONS: (MascotActionV2 | 'none')[] = [
  'none', 'idle', 'walking', 'grabbing', 'holding-star', 'holding-cup', 'pouring', 'celebrating',
]

const chip = (on: boolean) => ({
  padding: '4px 10px', borderRadius: 999, cursor: 'pointer',
  border: on ? '2px solid #e67e22' : '1px solid #bbb',
  background: on ? '#fff3e6' : '#fff', color: '#222', fontSize: 13,
})

export default function MascotV2Test() {
  const [state, setState] = useState<MascotStateV2>('idle')
  const [action, setAction] = useState<MascotActionV2 | 'none'>('none')
  const [size, setSize] = useState(160)
  const [message, setMessage] = useState('')

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/debug/gamification/vulpi-v2">← Vulpi v2</Link>
      <h1 style={{ fontSize: 22, margin: '12px 0' }}>MascotV2 — banc de probă</h1>

      <div style={{ display: 'flex', justifyContent: 'center', padding: 24, background: '#eaf3fb', borderRadius: 8, minHeight: size * 1.5 }}>
        <MascotV2
          state={state}
          action={action === 'none' ? undefined : action}
          size={size}
          message={message || null}
        />
      </div>

      <h2 style={{ fontSize: 15, marginTop: 16 }}>state</h2>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {STATES.map(s => <button key={s} style={chip(s === state)} onClick={() => setState(s)}>{s}</button>)}
      </div>

      <h2 style={{ fontSize: 15, marginTop: 16 }}>action (are prioritate față de state)</h2>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {ACTIONS.map(a => <button key={a} style={chip(a === action)} onClick={() => setAction(a)}>{a}</button>)}
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16, alignItems: 'center' }}>
        <label style={{ fontSize: 13 }}>
          size {size}px{' '}
          <input type="range" min={64} max={260} value={size} onChange={e => setSize(+e.target.value)} />
        </label>
        <label style={{ fontSize: 13 }}>
          message{' '}
          <input value={message} onChange={e => setMessage(e.target.value)} placeholder="opțional" />
        </label>
      </div>
    </main>
  )
}
