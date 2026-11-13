'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Mascot } from '@/components/game/Mascot'
import WordRenderer from '@/components/WordRenderer'
import { LEVELS, STORAGE_KEY, type Lesson, type Accent } from '@/lib/levels'
import { speakWord } from '@/lib/speak'
import type { RenderNode } from '@/lib/renderNode'
import styles from './page.module.css'

type Lane = 0 | 1 | 2 | 3
type CatchWord = { text: string; nodes?: RenderNode[]; accent: Accent }
type Egg = { id: number; lane: Lane; born: number; duration: number; golden: boolean; word?: CatchWord }
type Phase = 'ready' | 'playing' | 'paused' | 'over'

const LANES: { label: string; key: string; nest: string; side: 'left' | 'right'; height: 'top' | 'bottom' }[] = [
  { label: 'Stânga sus', key: 'Q', nest: '🌿', side: 'left', height: 'top' },
  { label: 'Dreapta sus', key: 'P', nest: '🌿', side: 'right', height: 'top' },
  { label: 'Stânga jos', key: 'A', nest: '🌾', side: 'left', height: 'bottom' },
  { label: 'Dreapta jos', key: 'L', nest: '🌾', side: 'right', height: 'bottom' },
]

export default function OuaVulpiiPage() {
  const [phase, setPhase] = useState<Phase>('ready')
  const [eggs, setEggs] = useState<Egg[]>([])
  const [basket, setBasket] = useState<Lane>(0)
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [best, setBest] = useState(0)
  const [message, setMessage] = useState('Alege un cuib și prinde ouăle!')
  const [flash, setFlash] = useState<Lane | null>(null)
  const [soundOn, setSoundOn] = useState(true)
  const [lesson, setLesson] = useState<Lesson>(LEVELS[0].lessons[0])
  const [learningWords, setLearningWords] = useState<CatchWord[]>([])
  const [latestCaught, setLatestCaught] = useState<CatchWord | null>(null)
  const [learnedWords, setLearnedWords] = useState<string[]>([])
  const learningWordsRef = useRef<CatchWord[]>([])
  const lastSpawn = useRef(0)
  const nextId = useRef(1)
  const eggsRef = useRef<Egg[]>([])
  const phaseRef = useRef<Phase>('ready')
  const scoreRef = useRef(0)
  const soundRef = useRef(true)

  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { eggsRef.current = eggs }, [eggs])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { soundRef.current = soundOn }, [soundOn])

  useEffect(() => {
    try { setBest(Number(localStorage.getItem('eic-fox-eggs-best') || 0)) } catch {}
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as { levelIndex?: number; active?: number }
        const selected = LEVELS[saved.levelIndex ?? 0]?.lessons[saved.active ?? 0]
        if (selected) setLesson(selected)
      }
    } catch {}
    try {
      const raw = localStorage.getItem('eic-fox-eggs-learned-v1')
      if (raw) setLearnedWords(JSON.parse(raw))
    } catch {}
  }, [])

  // Jocul împrumută coloana activă din EiC /learn. Motorul real de colorare
  // furnizează aceleași noduri fonologice ca lecția, fără să modifice stelele
  // sau deblocările din parcursul principal.
  useEffect(() => {
    let cancelled = false
    const accents = Object.fromEntries(lesson.words.map(word => [
      word.text.toLowerCase(),
      (word.accent ?? lesson.accent ?? 'en-US') === 'en-GB' ? 'uk' : 'us',
    ]))
    fetch('/api/words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words: lesson.words.map(word => word.text), accents }),
    })
      .then(res => res.json())
      .then((data: { results?: Record<string, RenderNode[]> }) => {
        if (cancelled) return
        const prepared = lesson.words.map(word => ({
          text: word.text,
          nodes: data.results?.[word.text.toLowerCase()],
          accent: word.accent ?? lesson.accent ?? 'en-US',
        }))
        setLearningWords(prepared)
        learningWordsRef.current = prepared
      })
      .catch(() => {
        if (cancelled) return
        const prepared = lesson.words.map(word => ({
          text: word.text,
          accent: word.accent ?? lesson.accent ?? 'en-US',
        }))
        setLearningWords(prepared)
        learningWordsRef.current = prepared
      })
    return () => { cancelled = true }
  }, [lesson])

  useEffect(() => {
    try { localStorage.setItem('eic-fox-eggs-learned-v1', JSON.stringify(learnedWords)) } catch {}
  }, [learnedWords])

  const chirp = useCallback((frequency: number, duration = 0.09) => {
    if (!soundRef.current || typeof window === 'undefined') return
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      const ctx = new AudioContextClass()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = frequency
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.07, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.connect(gain); gain.connect(ctx.destination)
      osc.start(); osc.stop(ctx.currentTime + duration)
      osc.onended = () => void ctx.close()
    } catch {}
  }, [])

  const chooseLane = useCallback((lane: Lane) => {
    setBasket(lane)
    if (phaseRef.current === 'playing') chirp(320 + lane * 45, 0.045)
  }, [chirp])

  const start = useCallback(() => {
    setEggs([]); eggsRef.current = []
    setScore(0); scoreRef.current = 0
    setMisses(0); setBasket(0); setLatestCaught(null)
    lastSpawn.current = performance.now()
    nextId.current = 1
    setMessage('Hai, vulpițo! Prinde ouăle!')
    setPhase('playing'); phaseRef.current = 'playing'
    chirp(620, 0.14)
  }, [chirp])

  const togglePause = useCallback(() => {
    if (phaseRef.current === 'playing') { setPhase('paused'); phaseRef.current = 'paused'; setMessage('Luăm o mică pauză.') }
    else if (phaseRef.current === 'paused') { setPhase('playing'); phaseRef.current = 'playing'; setMessage('Atenție la cuiburi!') }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const lane = LANES.findIndex(item => item.key.toLowerCase() === key)
      if (lane >= 0) { event.preventDefault(); chooseLane(lane as Lane); return }
      if (event.code === 'Space') { event.preventDefault(); if (phaseRef.current === 'ready' || phaseRef.current === 'over') start(); else togglePause() }
      if (key === 'enter' && (phaseRef.current === 'ready' || phaseRef.current === 'over')) start()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [chooseLane, start, togglePause])

  useEffect(() => {
    if (phase !== 'playing') return
    let frame = 0
    let last = 0
    const tick = (now: number) => {
      if (phaseRef.current !== 'playing') return
      if (!last) last = now
      const elapsed = now - last
      last = now
      const interval = Math.max(570, 1450 - scoreRef.current * 13)
      if (now - lastSpawn.current > interval && eggsRef.current.length < 5) {
        const lane = Math.floor(Math.random() * 4) as Lane
        const word = learningWordsRef.current.length
          ? learningWordsRef.current[Math.floor(Math.random() * learningWordsRef.current.length)]
          : undefined
        const egg: Egg = { id: nextId.current++, lane, born: now, duration: Math.max(2300, 3900 - scoreRef.current * 12), golden: Math.random() < 0.075, word }
        eggsRef.current = [...eggsRef.current, egg]
        setEggs(eggsRef.current)
        lastSpawn.current = now
      }
      const remaining: Egg[] = []
      let caught = 0
      let missed = 0
      const caughtEggs: Egg[] = []
      for (const egg of eggsRef.current) {
        if (now - egg.born >= egg.duration) {
          if (egg.lane === basket) { caught += egg.golden ? 5 : 1; caughtEggs.push(egg) }
          else missed += 1
        } else remaining.push(egg)
      }
      if (caught) {
        const caughtWord = caughtEggs[caughtEggs.length - 1]?.word
        if (caughtWord) {
          setLatestCaught(caughtWord)
          if (soundRef.current) speakWord(caughtWord.text, { accent: caughtWord.accent })
          setLearnedWords(previous => [...new Set([...previous, ...caughtEggs.flatMap(egg => egg.word ? [egg.word.text] : [])])])
        }
        const total = scoreRef.current + caught
        scoreRef.current = total; setScore(total)
        setMessage(caughtWord
          ? `Bravo! Ai prins și cuvântul „${caughtWord.text}”!`
          : caught > 1 ? 'Uau! Ouă prinse!' : 'Bravo! Un ou în coș!')
        chirp(760 + Math.min(total, 20) * 15, 0.11)
        setFlash(basket); window.setTimeout(() => setFlash(null), 260)
      }
      if (missed) {
        setMisses(value => {
          const next = value + missed
          setMessage('Ups! Un ou a căzut. Fii atentă!')
          chirp(170, 0.2)
          if (next >= 5) {
            setPhase('over'); phaseRef.current = 'over'
            setMessage('S-a terminat runda! Vulpea mai vrea o încercare.')
            const record = Math.max(scoreRef.current, best)
            setBest(record)
            try { localStorage.setItem('eic-fox-eggs-best', String(record)) } catch {}
          }
          return next
        })
      }
      eggsRef.current = remaining
      setEggs(remaining)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [phase, basket, best, chirp])

  const progress = (egg: Egg) => Math.min(100, Math.max(0, ((performance.now() - egg.born) / egg.duration) * 100))

  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <Link href="/learn" className={styles.back}>← Înapoi la Learn</Link>
        <span className={styles.eyebrow}>EiC · MINI ARCADE</span>
        <button className={styles.sound} onClick={() => setSoundOn(v => !v)} aria-label="Sunet">
          {soundOn ? '🔊' : '🔇'}
        </button>
      </div>

      <header className={styles.heading}>
        <div>
          <p className={styles.kicker}>JOC DE ATENȚIE ȘI REACȚIE</p>
          <h1>Vulpea și ouăle fermecate</h1>
          <p>Patru cuiburi. Un coș isteț. Cât de multe ouă poți salva?</p>
        </div>
        <Mascot state={phase === 'over' ? 'talking' : score > 0 ? 'cheering' : 'idle'} action={phase === 'playing' ? 'walking' : undefined} size={104} />
      </header>

      <section className={styles.hud} aria-label="Scor">
        <div><span>OUĂ PRINSE</span><strong>{score.toString().padStart(2, '0')}</strong></div>
        <div><span>RECORD</span><strong>{Math.max(best, score).toString().padStart(2, '0')}</strong></div>
        <div><span>OUĂ SCĂPATE</span><strong className={styles.misses}>{'🥚'.repeat(Math.max(0, 5 - misses))}{'💔'.repeat(Math.min(5, misses))}</strong></div>
      </section>

      <section className={styles.learningRibbon} aria-label="Învățare EiC în joc">
        <div className={styles.lessonBadge}>
          <span>Sunetul explorat</span>
          <strong>{lesson.letter}</strong>
        </div>
        <div className={styles.learningCatch}>
          <span>{latestCaught ? 'Ai prins:' : 'Ouăle ascund cuvinte din lecția ta'}</span>
          <strong>{latestCaught
            ? latestCaught.nodes
              ? <WordRenderer nodes={latestCaught.nodes} wordStr={latestCaught.text} />
              : latestCaught.text
            : lesson.words.slice(0, 3).map(word => word.text).join(' · ')}</strong>
          <small>{latestCaught ? 'Ascultă pronunția și observă culorile EiC.' : `${learningWords.length} cuvinte din lecția ta apar firesc în joc.`}</small>
        </div>
        <div className={styles.learnedCount}>
          <strong>{learnedWords.length}</strong>
          <span>cuvinte întâlnite</span>
        </div>
      </section>

      <section className={styles.gameCard}>
        <div className={styles.farmSky}>
          <div className={styles.sun}>☀️</div>
          <div className={`${styles.cloud} ${styles.cloudOne}`}>☁️</div><div className={`${styles.cloud} ${styles.cloudTwo}`}>☁️</div>
          <div className={styles.fence}>🌳　🌼　🌳　🌼　🌳　🌼　🌳</div>
          <div className={styles.nests}>
            {LANES.map((lane, i) => (
              <button key={lane.key} className={`${styles.nest} ${basket === i ? styles.selectedNest : ''}`} onClick={() => chooseLane(i as Lane)} aria-label={lane.label}>
                <span>{lane.nest}</span><small>{lane.label}</small><b>{lane.key}</b>
              </button>
            ))}
          </div>
          <div className={styles.chutes}>
            {LANES.map((lane, i) => (
              <div key={lane.key} className={styles.chute}>
                <span className={styles.chuteLine} />
                {eggs.filter(egg => egg.lane === i).map(egg => (
                  <span key={egg.id} className={styles.egg} style={{ left: '50%', top: `${progress(egg)}%` }} aria-label="Ou în mișcare">
                    <span className={styles.eggSymbol}>{egg.golden ? '🌟' : '🥚'}</span>
                    {egg.word && <span className={styles.eggWord}>{egg.word.text}</span>}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className={styles.catcherRow}>
            {LANES.map((lane, i) => (
              <button key={lane.key} onClick={() => chooseLane(i as Lane)} className={`${styles.catcher} ${basket === i ? styles.activeCatcher : ''} ${flash === i ? styles.catchFlash : ''}`} aria-label={`Mută vulpea: ${lane.label}`}>
                <div className={styles.fox}>{basket === i
                  ? <Mascot state={flash === i ? 'cheering' : 'idle'} action={flash === i ? 'celebrating' : undefined} size={72} />
                  : '·'}</div>
                <span className={styles.basket}>🧺</span>
              </button>
            ))}
          </div>
          <div className={styles.grass}>🌱 🌷 🌱 🌼 🌱 🌷 🌱 🌼 🌱</div>
          {phase !== 'playing' && (
            <div className={styles.overlay}>
              <div className={styles.overlayCard}>
                <span className={styles.overlayIcon}>{phase === 'over' ? '🏆' : phase === 'paused' ? '⏸️' : '🥚'}</span>
                <h2>{phase === 'over' ? 'Runda s-a încheiat!' : phase === 'paused' ? 'Pauză de vulpe' : 'Ești gata de joacă?'}</h2>
                <p>{phase === 'over' ? `Ai prins ${score} ouă. Mai încercăm?` : phase === 'paused' ? 'Ouăle așteaptă cuminți.' : 'Privește oul și mută vulpea în cuibul potrivit înainte să ajungă jos.'}</p>
                <button className={styles.primary} onClick={phase === 'paused' ? togglePause : start}>{phase === 'paused' ? 'Continuă' : phase === 'over' ? 'Joacă din nou' : 'Începe jocul'}</button>
              </div>
            </div>
          )}
        </div>
        <div className={styles.gameFooter}>
          <p className={styles.status}>{message}</p>
          <div className={styles.controls}>
            <button onClick={togglePause} disabled={phase === 'ready' || phase === 'over'}>{phase === 'paused' ? '▶ Continuă' : 'Ⅱ Pauză'}</button>
            <button onClick={start}>↻ Reîncepe</button>
          </div>
        </div>
      </section>

      <section className={styles.instructions}>
        <div><strong>🎮 Cum joci</strong><p>Apasă Q, P, A sau L, ori atinge unul dintre cele patru coșuri. Vulpea noastră sare imediat în poziția aleasă.</p></div>
        <div><strong>🌟 Ou auriu</strong><p>Un ou magic valorează 5 puncte. Prinde-l pentru un bonus!</p></div>
        <div><strong>❤️ Cinci șanse</strong><p>Ai cinci ouă de rezervă. La fiecare ou scăpat pierzi o șansă.</p></div>
      </section>
      <p className={styles.note}>Ritmul crește treptat. Cuvintele provin din coloana EiC activă; prinderea lor declanșează pronunția și colorarea reală a motorului. Jocul nu modifică automat stelele sau nivelul de competență.</p>
    </main>
  )
}
