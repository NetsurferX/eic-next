'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Mascot } from '@/components/game/Mascot'
import { speakWord } from '@/lib/speak'
import { SOUND_COLORS } from '@/lib/rules/colors'
import styles from '../_gameShell.module.css'

// ─────────────────────────────────────────────────────────────────────────
// Bulele Vulpii — joc de potrivire sunet↔culoare, pe baza specificației
// exhaustive primite de la Dorel (2026-09-23), 3 niveluri:
//   Nivel 1: balonul arată litera/gruparea de litere a sunetului
//   Nivel 2: balonul e gol (fără text)
//   Nivel 3: balonul arată un cuvânt monosilabic ce conține sunetul
// Vulpea rostește sunetul (aproximat prin cuvântul-exemplu, TTS nu poate
// rosti un fonem izolat); jucătorul apasă cercul-buton cu culoarea
// corespunzătoare înainte ca balonul să atingă "dinții" din vârful zonei.
//
// SCHIȚĂ DE BAZĂ — vezi nota de la finalul fișierului pentru simplificările
// asumate față de spec (bifează cu Dorel înainte de a le extinde).
// ─────────────────────────────────────────────────────────────────────────

interface WordEntry { word: string; grapheme: string }
interface SoundGroup { symbol: string; hex: string; grapheme: string; ttsWord: string; words: WordEntry[] }

function hexFor(symbol: string): string {
  return SOUND_COLORS.find(sc => sc.sounds.includes(symbol))?.hex ?? '#999999'
}

// Cele 7 grupuri cerute de Dorel (æ, a, i, o, u, ə, e) — culorile vin din
// colors.ts (sursa unică), provizoriu, până dă valorile exacte pentru
// acest joc.
const GROUPS: SoundGroup[] = [
  {
    symbol: 'æ', hex: hexFor('æ'), grapheme: 'a', ttsWord: 'cat',
    words: [{ word: 'cat', grapheme: 'a' }, { word: 'hat', grapheme: 'a' }, { word: 'bag', grapheme: 'a' }, { word: 'man', grapheme: 'a' }, { word: 'sad', grapheme: 'a' }],
  },
  {
    symbol: 'ʌ', hex: hexFor('ʌ'), grapheme: 'u', ttsWord: 'cup',
    words: [{ word: 'cup', grapheme: 'u' }, { word: 'sun', grapheme: 'u' }, { word: 'bus', grapheme: 'u' }, { word: 'run', grapheme: 'u' }, { word: 'cut', grapheme: 'u' }],
  },
  {
    symbol: 'ɪ', hex: hexFor('ɪ'), grapheme: 'i', ttsWord: 'sit',
    words: [{ word: 'sit', grapheme: 'i' }, { word: 'big', grapheme: 'i' }, { word: 'pin', grapheme: 'i' }, { word: 'six', grapheme: 'i' }, { word: 'fish', grapheme: 'i' }],
  },
  {
    symbol: 'ɒ', hex: hexFor('ɒ'), grapheme: 'o', ttsWord: 'hot',
    words: [{ word: 'hot', grapheme: 'o' }, { word: 'dog', grapheme: 'o' }, { word: 'box', grapheme: 'o' }, { word: 'top', grapheme: 'o' }, { word: 'dot', grapheme: 'o' }],
  },
  {
    symbol: 'ʊ', hex: hexFor('ʊ'), grapheme: 'oo', ttsWord: 'book',
    words: [{ word: 'book', grapheme: 'oo' }, { word: 'look', grapheme: 'oo' }, { word: 'cook', grapheme: 'oo' }, { word: 'hood', grapheme: 'oo' }, { word: 'wood', grapheme: 'oo' }],
  },
  {
    symbol: 'ə', hex: hexFor('ə'), grapheme: 'er', ttsWord: 'her',
    words: [{ word: 'her', grapheme: 'er' }, { word: 'fern', grapheme: 'er' }, { word: 'term', grapheme: 'er' }, { word: 'herd', grapheme: 'er' }, { word: 'nerve', grapheme: 'er' }],
  },
  {
    symbol: 'e', hex: hexFor('e'), grapheme: 'e', ttsWord: 'bed',
    words: [{ word: 'bed', grapheme: 'e' }, { word: 'red', grapheme: 'e' }, { word: 'pen', grapheme: 'e' }, { word: 'ten', grapheme: 'e' }, { word: 'leg', grapheme: 'e' }],
  },
]

// Sunetul antrenat per nivel — rotație fixă pentru schiță (nu adaptivă la greșeli reale).
const LEVEL_TRAINED_IDX = [0, 2, 4]
const LEVEL_LABELS = ['Nivel 1 — literă', 'Nivel 2 — fără literă', 'Nivel 3 — cuvânt']

type Kind = 'current' | 'prevA' | 'prevB' | 'next'
interface QueueItem { kind: Kind; groupIdx: number }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 20 baloane/nivel: 60% sunet antrenat, 35% sunete anterioare problematice
// (aici: două grupuri fixe, 4+3), 5% sunetul următor.
function buildQueue(trainedIdx: number): QueueItem[] {
  const prevA = (trainedIdx + 6) % 7
  const prevB = (trainedIdx + 5) % 7
  const nextIdx = (trainedIdx + 1) % 7
  const items: QueueItem[] = []
  for (let i = 0; i < 12; i++) items.push({ kind: 'current', groupIdx: trainedIdx })
  for (let i = 0; i < 4; i++) items.push({ kind: 'prevA', groupIdx: prevA })
  for (let i = 0; i < 3; i++) items.push({ kind: 'prevB', groupIdx: prevB })
  items.push({ kind: 'next', groupIdx: nextIdx })
  return shuffle(items)
}

function pickWord(group: SoundGroup): WordEntry {
  return group.words[Math.floor(Math.random() * group.words.length)]
}

type Zone = 'blue' | 'pink'
type BalloonState = 'flying' | 'correct' | 'miss'

interface LiveBalloon {
  id: number
  kind: Kind
  groupIdx: number
  word: WordEntry
  x: number
  progress: number
  zone: Zone
  state: BalloonState
}

const FLIGHT_MS = 5200
const TICK_MS = 50
let balloonSeq = 0

function renderBalloonContent(level: number, b: LiveBalloon, group: SoundGroup) {
  const solved = b.state === 'correct'
  if (level === 1) return null // Nivel 2: fără literă/grup
  if (level === 0) {
    // Nivel 1: litera/gruparea de litere a sunetului
    return <span style={{ color: solved ? group.hex : '#333', fontWeight: 700 }}>{group.grapheme}</span>
  }
  // Nivel 3: cuvânt monosilabic, doar litera-țintă colorată la răspuns corect
  const idx = b.word.word.toLowerCase().indexOf(b.word.grapheme.toLowerCase())
  if (idx === -1 || !solved) return <span style={{ color: '#333' }}>{b.word.word}</span>
  return (
    <span style={{ color: '#333' }}>
      {b.word.word.slice(0, idx)}
      <span style={{ color: group.hex, fontWeight: 700 }}>{b.word.word.slice(idx, idx + b.word.grapheme.length)}</span>
      {b.word.word.slice(idx + b.word.grapheme.length)}
    </span>
  )
}

export default function BuleleVulpiiConcept() {
  const [level, setLevel] = useState(0)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [queuePos, setQueuePos] = useState(0)
  const [balloon, setBalloon] = useState<LiveBalloon | null>(null)
  const [score, setScore] = useState(0)
  const [missCount, setMissCount] = useState(0)
  const [hearts, setHearts] = useState(10)
  const [fourthVisible, setFourthVisible] = useState(false)
  const [hintGroupIdx, setHintGroupIdx] = useState<number | null>(null)
  const [basketPhase, setBasketPhase] = useState<null | { target: 'sound' | 'score' }>(null)
  const [scoreFlash, setScoreFlash] = useState(false)
  const [soundBasketFlash, setSoundBasketFlash] = useState(false)
  const [helpMessage, setHelpMessage] = useState<string | null>(null)
  const [levelDone, setLevelDone] = useState<null | { rate: number; passed: boolean }>(null)

  const queueRef = useRef<QueueItem[]>([])
  const queuePosRef = useRef(0)
  const scoreRef = useRef(0)
  const correctRef = useRef(0)
  const missRef = useRef(0)
  const heartsRef = useRef(10)
  const hintFiredFor = useRef<Set<number>>(new Set())
  const missHandledFor = useRef<Set<number>>(new Set())

  function flashScore() { setScoreFlash(true); setTimeout(() => setScoreFlash(false), 400) }
  function flashSoundBasket() { setSoundBasketFlash(true); setTimeout(() => setSoundBasketFlash(false), 400) }

  function spawnAt(pos: number, q: QueueItem[]) {
    const item = q[pos]
    const group = GROUPS[item.groupIdx]
    setFourthVisible(item.kind === 'next')
    setBalloon({
      id: balloonSeq++,
      kind: item.kind,
      groupIdx: item.groupIdx,
      word: pickWord(group),
      x: 12 + Math.random() * 66,
      progress: 0,
      zone: 'blue',
      state: 'flying',
    })
    speakWord(group.ttsWord)
  }

  function advanceQueue() {
    const nextPos = queuePosRef.current + 1
    queuePosRef.current = nextPos
    setQueuePos(nextPos)
    if (nextPos >= queueRef.current.length) {
      const rate = correctRef.current / queueRef.current.length
      setBalloon(null)
      setLevelDone({ rate, passed: rate >= 0.8 })
      return
    }
    setTimeout(() => spawnAt(nextPos, queueRef.current), 250)
  }

  function startLevel(lv: number) {
    const q = buildQueue(LEVEL_TRAINED_IDX[lv])
    queueRef.current = q
    queuePosRef.current = 0
    scoreRef.current = 0
    correctRef.current = 0
    missRef.current = 0
    heartsRef.current = 10
    hintFiredFor.current.clear()
    missHandledFor.current.clear()
    setLevel(lv)
    setQueue(q)
    setQueuePos(0)
    setScore(0)
    setMissCount(0)
    setHearts(10)
    setLevelDone(null)
    setBasketPhase(null)
    spawnAt(0, q)
  }

  useEffect(() => { startLevel(0) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── zborul balonului curent ──
  useEffect(() => {
    if (!balloon || balloon.state !== 'flying') return
    const id = window.setInterval(() => {
      setBalloon(prev => {
        if (!prev || prev.state !== 'flying') return prev
        const p = prev.progress + (100 * TICK_MS) / FLIGHT_MS
        if (p >= 100) return { ...prev, progress: 100, zone: 'pink', state: 'miss' }
        return { ...prev, progress: p, zone: p >= 66 ? 'pink' : 'blue' }
      })
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [balloon?.id])

  // ── reacții la schimbarea zonei/stării balonului curent ──
  useEffect(() => {
    if (!balloon) return
    if (balloon.zone === 'pink' && !hintFiredFor.current.has(balloon.id)) {
      hintFiredFor.current.add(balloon.id)
      speakWord(GROUPS[balloon.groupIdx].ttsWord)
      setHintGroupIdx(balloon.groupIdx)
      setTimeout(() => setHintGroupIdx(null), 1000)
    }
    if (balloon.state === 'miss' && !missHandledFor.current.has(balloon.id)) {
      missHandledFor.current.add(balloon.id)
      scoreRef.current -= 1
      setScore(scoreRef.current)
      missRef.current += 1
      setMissCount(missRef.current)
      flashScore()
      setFourthVisible(false)
      setTimeout(() => { setBalloon(null); advanceQueue() }, 350)
    }
  }, [balloon])

  function handlePress(groupIdx: number) {
    if (!balloon || balloon.state !== 'flying') return
    if (groupIdx !== balloon.groupIdx) {
      scoreRef.current -= 1
      setScore(scoreRef.current)
      flashScore()
      return
    }
    const points = balloon.kind === 'next' ? 2 : 1
    const target: 'sound' | 'score' = balloon.kind === 'current' ? 'sound' : 'score'
    scoreRef.current += points
    setScore(scoreRef.current)
    correctRef.current += 1
    setBalloon(prev => (prev ? { ...prev, state: 'correct' } : prev))
    setBasketPhase({ target })
    setFourthVisible(false)
    flashScore()
    if (target === 'sound') flashSoundBasket()
    setTimeout(() => { setBasketPhase(null); setBalloon(null); advanceQueue() }, 900)
  }

  function useHelp() {
    if (!balloon || balloon.state !== 'flying' || heartsRef.current <= 0) return
    heartsRef.current -= 1
    setHearts(heartsRef.current)
    const group = GROUPS[balloon.groupIdx]
    speakWord(group.ttsWord)
    setHelpMessage(group.symbol)
    setTimeout(() => setHelpMessage(null), 1400)
  }

  const trainedIdx = LEVEL_TRAINED_IDX[level]
  const prevA = (trainedIdx + 6) % 7
  const prevB = (trainedIdx + 5) % 7
  const nextIdx = (trainedIdx + 1) % 7
  const visibleButtons = fourthVisible ? [trainedIdx, prevA, prevB, nextIdx] : [trainedIdx, prevA, prevB]

  const stageBg = balloon?.zone === 'pink'
    ? 'linear-gradient(#fdeef4, #fbf7f8)'
    : 'linear-gradient(#eaf4fb, #f7fbfd)'

  return (
    <div className={styles.wrap}>
      <Link href="/debug/games" className={styles.back}>← Toate conceptele</Link>

      <div className={styles.stage}>
        <h1 className={styles.title}>🎈 Bulele Vulpii</h1>
        <p className={styles.sub}>Ascultă sunetul și apasă culoarea potrivită înainte ca balonul să ajungă sus.</p>

        <div className={styles.rowCenter} style={{ marginBottom: 10, gap: 8 }}>
          {LEVEL_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => startLevel(i)}
              className={styles.replay}
              style={i === level ? { background: '#1a1917', color: '#fff', borderColor: '#1a1917' } : undefined}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.rowCenter} style={{ marginBottom: 10, gap: 10, position: 'relative' }}>
          <Mascot
            state={levelDone?.passed ? 'cheering' : 'talking'}
            action={levelDone?.passed ? 'celebrating' : undefined}
            size={56}
          />
          {helpMessage && (
            <span style={{ position: 'absolute', left: 60, top: -6, background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: '2px 8px', fontSize: 13, fontWeight: 700 }}>
              {helpMessage}
            </span>
          )}
          <span style={{ fontSize: 13, color: '#a03060' }}>💗 {hearts}</span>
          <button className={styles.replay} onClick={useHelp} disabled={hearts <= 0}>🦊 Ajutor</button>
        </div>

        <div style={{ position: 'relative', height: 260, borderRadius: 14, overflow: 'hidden', background: stageBg, transition: 'background 400ms' }}>
          {/* dinți / coșuri, zona centrală de sus */}
          <div style={{ position: 'absolute', top: 6, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10, opacity: basketPhase ? 0 : 1, transition: 'opacity 300ms' }}>
            <span style={{ fontSize: 22, letterSpacing: -4 }}>🦷🦷🦷🦷🦷</span>
          </div>
          <div style={{ position: 'absolute', top: 2, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14, opacity: basketPhase ? 1 : 0, transition: 'opacity 300ms' }}>
            <div className={scoreFlash ? 'flash' : ''} style={{ fontSize: 26, textAlign: 'center' }}>
              🧺<div style={{ fontSize: 11, fontWeight: 700, marginTop: -4 }}>{score}</div>
            </div>
            <div className={soundBasketFlash ? 'flash' : ''} style={{ fontSize: 22, textAlign: 'center' }}>
              🧺<div style={{ width: 14, height: 14, borderRadius: 7, background: GROUPS[trainedIdx].hex, margin: '0 auto' }} />
            </div>
          </div>

          {balloon && (
            <div
              style={{
                position: 'absolute',
                left: `${balloon.x}%`,
                bottom: `${Math.min(balloon.progress, 96)}%`,
                width: 46, height: 46, borderRadius: '50%',
                background: '#fff', border: '2px solid #cfe4f2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: level === 2 ? 12 : 18,
                boxShadow: '0 2px 6px rgba(0,0,0,.08)',
                transition: balloon.state === 'correct' ? 'bottom 400ms ease-in, transform 400ms' : undefined,
                transform: balloon.state === 'miss' ? 'scale(0.4)' : balloon.state === 'correct' ? 'scale(0.7)' : 'scale(1)',
                opacity: balloon.state === 'miss' ? 0 : 1,
              }}
            >
              {renderBalloonContent(level, balloon, GROUPS[balloon.groupIdx])}
              {balloon.kind === 'next' && (
                <span style={{ position: 'absolute', top: -8, right: -6, fontSize: 13 }}>✨</span>
              )}
            </div>
          )}

          {levelDone && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>
                {levelDone.passed ? '🎉 Reușit!' : 'Mai încearcă'} — {Math.round(levelDone.rate * 100)}%
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className={styles.replay} onClick={() => startLevel(level)}>Reia nivelul</button>
                {levelDone.passed && level < 2 && (
                  <button className={styles.replay} onClick={() => startLevel(level + 1)}>Nivel următor →</button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* butoanele-culoare de jos */}
        <div className={styles.rowCenter} style={{ marginTop: 16, gap: 14 }}>
          {visibleButtons.map(idx => {
            const g = GROUPS[idx]
            const hinted = hintGroupIdx === idx
            return (
              <button
                key={idx}
                onClick={() => handlePress(idx)}
                style={{
                  width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: g.hex,
                  boxShadow: hinted ? `0 0 0 5px rgba(0,0,0,.12)` : '0 1px 3px rgba(0,0,0,.15)',
                  transition: 'box-shadow 200ms, opacity 300ms',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: g.hex }}>
                  {g.grapheme}
                </span>
              </button>
            )
          })}
        </div>

        <div className={styles.statusRow}>
          <span className={styles.score}>Scor: {score}</span>
          <span>Greșeli: {missCount}</span>
          <span>Balon {Math.min(queuePos + 1, 20)}/20</span>
        </div>
      </div>

      <style>{`
        @keyframes flash { 0% { filter: brightness(1) } 50% { filter: brightness(1.6) } 100% { filter: brightness(1) } }
        .flash { animation: flash 400ms ease-out; }
      `}</style>

      <p className={styles.note}>
        Schiță de bază — un singur balon în zbor odată (nu 20 simultan), rotația sunetului antrenat pe
        nivel e fixă (0/2/4 din cele 7 grupuri), nu adaptivă la greșeli reale; cele 2 „sunete anterioare
        problematice&quot; sunt fixe (nu ordonate după gravitate reală); vieți/scor se resetează la fiecare
        nivel; cuvintele pentru ə/ɜː (her, fern, term…) sunt aproximări demonstrative. Culorile sunt cele
        provizorii din <code>colors.ts</code>. Vulpea &quot;rostește sunetul&quot; prin TTS pe cuvântul-exemplu
        (nu poate rosti fonemul izolat). Coșurile/dinții sunt schematici (emoji), nu ilustrație dedicată.
      </p>
    </div>
  )
}
