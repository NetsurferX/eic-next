'use client'

import { useState } from 'react'
import Link from 'next/link'
import WordRenderer from '@/components/WordRenderer'
import { Mascot } from '@/components/game/Mascot'
import { DEMO_WORDS } from '../_demoWords'
import styles from '../_gameShell.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT NOU 6/7: Poarta Fonetică (The Phonetic Gate)
// Mini-aventură narativă pe 4 „camere": la fiecare cameră, vulpea arată un
// cuvânt și 2 uși colorate; alegerea corectă deschide poarta spre camera
// următoare, greșeala te ține pe loc (nu resetează). Singurul concept cu
// cadru narativ/progresie de tip "dungeon crawl" ușor — restul sunt reflex,
// memorie sau logică pură.
// ─────────────────────────────────────────────────────────────────────────

const ROOM_FLAVORS = [
  'Camera de intrare — praf și lumină slabă.',
  'Coridorul lung — ecoul pașilor tăi.',
  'Sala cu oglinzi — culorile par să tremure.',
  'Ultima poartă — se simte aerul de afară.',
]

function roomFor(i: number) {
  const word = DEMO_WORDS[i % DEMO_WORDS.length]
  const others = DEMO_WORDS.map(w => w.dominantColor).filter(c => c !== word.dominantColor)
  const decoy = others[Math.floor(Math.random() * others.length)]
  const doors = [word.dominantColor, decoy].sort(() => Math.random() - 0.5)
  return { word, doors }
}

export default function PoartaFoneticaConcept() {
  const [roomIdx, setRoomIdx] = useState(0)
  const [room, setRoom] = useState(() => roomFor(0))
  const [message, setMessage] = useState<string | null>(null)
  const [mood, setMood] = useState<'idle' | 'pointing' | 'cheering'>('pointing')
  const [runs, setRuns] = useState(0)

  const won = roomIdx >= ROOM_FLAVORS.length

  function choose(color: string) {
    if (color === room.word.dominantColor) {
      setMood('cheering')
      setMessage('✅ Poarta se deschide...')
      setTimeout(() => {
        const next = roomIdx + 1
        setRoomIdx(next)
        if (next < ROOM_FLAVORS.length) setRoom(roomFor(next))
        setMessage(null)
        setMood('pointing')
      }, 600)
    } else {
      setMood('idle')
      setMessage('❌ Poarta nu se mișcă. Mai încearcă.')
      setTimeout(() => { setMessage(null); setMood('pointing') }, 500)
    }
  }

  function reset() {
    setRoomIdx(0); setRoom(roomFor(0)); setMessage(null); setMood('pointing'); setRuns(r => r + (won ? 1 : 0))
  }

  return (
    <div className={styles.wrap}>
      <Link href="/debug/games" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🚪 Poarta Fonetică</h1>
        <p className={styles.sub}>
          Traversează 4 camere alegând ușa cu culoarea sunetului dominant din cuvânt.
        </p>

        {!won ? (
          <>
            <p style={{ textAlign: 'center', fontSize: 12.5, color: '#888', marginBottom: 6 }}>
              {ROOM_FLAVORS[roomIdx]}
            </p>
            <div className={styles.rowCenter} style={{ marginBottom: 12 }}>
              <Mascot state={mood} size={56} />
            </div>
            <div className={styles.wordBig}>
              <WordRenderer nodes={room.word.nodes} wordStr={room.word.word} />
            </div>
            <div className={styles.rowCenter} style={{ gap: 24, marginTop: 14 }}>
              {room.doors.map((c, i) => (
                <button key={i} className={styles.card} onClick={() => choose(c)} style={{ padding: '18px 22px', fontSize: 22 }}>
                  🚪
                  <div className={styles.swatch} style={{ background: c, margin: '6px auto 0' }} />
                </button>
              ))}
            </div>
            {message && <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13 }}>{message}</p>}
          </>
        ) : (
          <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#2f9e44' }}>
            🎉 Ai traversat toate camerele! Vulpea te așteaptă afară.
          </p>
        )}

        <div className={styles.statusRow}>
          <span>Cameră: {Math.min(roomIdx + 1, ROOM_FLAVORS.length)} / {ROOM_FLAVORS.length}</span>
          <span>Trasee complete: {runs}</span>
          <button className={styles.replay} onClick={reset}>Reia de la capăt</button>
        </div>
      </div>

      <p className={styles.note}>
        Schiță — 4 camere fixe, o singură ramură (nu chiar branching real:
        greșeala nu pedepsește, doar blochează poarta). Integrarea reală ar
        putea lega camerele de nivelurile din LEVELS, cu o hartă vizuală a
        traseului parcurs.
      </p>
    </div>
  )
}
