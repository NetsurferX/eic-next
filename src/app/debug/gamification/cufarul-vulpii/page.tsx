'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

// ─────────────────────────────────────────────────────────────────────────
// CONCEPT: Cufărul Vulpii (Reward Chest / Cosmetic Shop)
// Schematic wireframe only. Hardcoded shell balance & items, no db.ts /
// persistence integration. Purely cosmetic — no gameplay advantage — by
// design, since this targets young children.
// ─────────────────────────────────────────────────────────────────────────

interface Item {
  id: string
  emoji: string
  label: string
  cost: number
}

const ITEMS: Item[] = [
  { id: 'hat',      emoji: '🎩', label: 'Pălărie de gală', cost: 20 },
  { id: 'scarf',    emoji: '🧣', label: 'Eșarfă colorată', cost: 15 },
  { id: 'glasses',  emoji: '🕶️', label: 'Ochelari de soare', cost: 25 },
  { id: 'crown',    emoji: '👑', label: 'Coroniță', cost: 40 },
  { id: 'bow',      emoji: '🎀', label: 'Fundiță', cost: 10 },
  { id: 'balloon',  emoji: '🎈', label: 'Balon', cost: 8 },
]

const STARTING_SHELLS = 42

export default function CufarulVulpiiConcept() {
  const [shells, setShells] = useState(STARTING_SHELLS)
  const [owned, setOwned] = useState<Set<string>>(new Set(['bow']))
  const [equipped, setEquipped] = useState<string | null>('bow')
  const [message, setMessage] = useState<string | null>(null)

  function buy(item: Item) {
    if (owned.has(item.id) || shells < item.cost) return
    setShells(s => s - item.cost)
    setOwned(prev => new Set(prev).add(item.id))
    setEquipped(item.id)
    setMessage(`${item.label} cumpărată!`)
    setTimeout(() => setMessage(null), 1500)
  }

  const equippedItem = ITEMS.find(i => i.id === equipped)

  return (
    <div className={styles.wrap}>
      <Link href="/debug/gamification" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>💰 Cufărul Vulpii</h1>
        <p className={styles.sub}>
          Fiecare lecție terminată dă scoici. Scoicile se cheltuiesc pe
          accesorii cosmetice pentru mascotă — fără avantaj de joc, doar
          personalizare.
        </p>

        <div className={styles.mascotPreview}>
          <div className={styles.mascotBox}>
            <span className={styles.mascotFox}>🦊</span>
            {equippedItem && <span className={styles.mascotAccessory}>{equippedItem.emoji}</span>}
          </div>
          <div className={styles.shellCounter}>
            <span>🐚</span>
            <strong>{shells}</strong>
          </div>
        </div>

        {message && <div className={styles.toast}>{message}</div>}

        <div className={styles.grid}>
          {ITEMS.map(item => {
            const isOwned = owned.has(item.id)
            const isEquipped = equipped === item.id
            const canAfford = shells >= item.cost
            return (
              <button
                key={item.id}
                className={[
                  styles.item,
                  isEquipped ? styles.equipped : '',
                  isOwned ? styles.owned : '',
                ].join(' ')}
                disabled={!isOwned && !canAfford}
                onClick={() => (isOwned ? setEquipped(item.id) : buy(item))}
              >
                <span className={styles.itemEmoji}>{item.emoji}</span>
                <span className={styles.itemLabel}>{item.label}</span>
                <span className={styles.itemCost}>
                  {isOwned ? (isEquipped ? 'Echipată' : 'Deținută') : `🐚 ${item.cost}`}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <p className={styles.note}>
        Schiță — soldul de scoici și lista de accesorii sunt hardcodate.
        Integrarea reală ar acorda scoici la finalizarea lecției (ex. 5-10 per
        lecție), ar persista deținerea/echiparea în db.ts, și ar afișa
        mascota personalizată în Mascot.tsx pe toate ecranele, nu doar aici.
      </p>
    </div>
  )
}
