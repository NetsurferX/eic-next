'use client'

import { speakWord, warmUpVoices } from '@/lib/speak'
import { useState, useCallback, useEffect, useRef, type CSSProperties } from 'react'
import Link from 'next/link'

// ── Fixed lesson data — colours match the canonical EiC sound map exactly ──
// (ɑ/ʌ → green, e/ɛ → orange, ɒ/ɔ → pink, i/ɪ → red — see lib/rules/colors.ts)
interface LessonWord {
  text: string
  mark: string   // substring of `text` that carries the target sound — only this part gets coloured
}

interface Lesson {
  id: string
  letter: string     // sound letter shown at the top of the column — no slashes
  color: string
  tabLabel: string   // Romanian colour-name shown on the tabs
  words: LessonWord[]
}

const LESSONS: Lesson[] = [
  {
    id: 'a', letter: 'a', color: '#008E40', tabLabel: 'Verde',
    words: [
      { text: 'dark',   mark: 'a' },
      { text: 'cart',   mark: 'a' },
      { text: 'father', mark: 'a' },
      { text: 'star',   mark: 'a' },
      { text: 'farm',   mark: 'a' },
      { text: 'hard',   mark: 'a' },
      { text: 'park',   mark: 'a' },
      { text: 'calm',   mark: 'a' },
    ],
  },
  {
    id: 'e', letter: 'e', color: '#EE5B00', tabLabel: 'Portocaliu',
    words: [
      { text: 'bed',    mark: 'e' },
      { text: 'head',   mark: 'ea' },
      { text: 'said',   mark: 'ai' },
      { text: 'bread',  mark: 'ea' },
      { text: 'friend', mark: 'ie' },
      { text: 'left',   mark: 'e' },
      { text: 'best',   mark: 'e' },
      { text: 'red',    mark: 'e' },
    ],
  },
  {
    id: 'o', letter: 'o', color: '#FF3399', tabLabel: 'Roz',
    words: [
      { text: 'hot',   mark: 'o' },
      { text: 'top',   mark: 'o' },
      { text: 'stop',  mark: 'o' },
      { text: 'clock', mark: 'o' },
      { text: 'dog',   mark: 'o' },
      { text: 'box',   mark: 'o' },
      { text: 'lot',   mark: 'o' },
      { text: 'not',   mark: 'o' },
    ],
  },
  {
    id: 'i', letter: 'i', color: '#CC0000', tabLabel: 'Roșu',
    words: [
      { text: 'sit',  mark: 'i' },
      { text: 'tip',  mark: 'i' },
      { text: 'big',  mark: 'i' },
      { text: 'fish', mark: 'i' },
      { text: 'hit',  mark: 'i' },
      { text: 'list', mark: 'i' },
      { text: 'ship', mark: 'i' },
      { text: 'wind', mark: 'i' },
    ],
  },
]

const STORAGE_KEY = 'eic-lesson-progress-v3'
const AUTO_DELAY_MS = 1650   // gap between words — tripled from the original 550ms
const REPS_PER_LESSON = 5
const POP_DURATION_MS = 5000    // how long the per-column cup→star pop animation plays
const MASTER_POP_MS   = 1300   // how long the master-cup celebration plays

// Renders a word so that only the letters carrying the target sound get colour;
// everything else stays black.
function MarkedWord({ text, mark }: { text: string; mark: string }) {
  const idx = text.toLowerCase().indexOf(mark.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <span className="lesson-word-mark">{text.slice(idx, idx + mark.length)}</span>
      {text.slice(idx + mark.length)}
    </>
  )
}

// ── Cupă de umplere reutilizabilă — un lichid colorat urcă spre buza cupei
//    pe măsură ce progresul crește. Folosită atât pentru "cupa cupelor" din
//    header (progres pe tot exercițiul), cât și pentru cupa proprie a fiecărei
//    coloane (progres 0-5 stele), doar cu culoare și mărime diferite. ──
function Cup({ progressPct, size = 64, color = '#FFB300', celebrating = false, allFull = false, idSuffix, confettiCount = 14 }: {
  progressPct: number; size?: number; color?: string; celebrating?: boolean; allFull?: boolean; idSuffix: string; confettiCount?: number
}) {
  const innerTop = 15, innerBottom = 85
  const fillHeight = ((innerBottom - innerTop) * Math.max(0, Math.min(100, progressPct))) / 100
  const fillY = innerBottom - fillHeight
  const gradId = `cupGrad-${idSuffix}`
  const clipId = `cupClip-${idSuffix}`
  return (
    <div
      className={`fill-cup ${allFull ? 'is-full' : ''} ${celebrating ? 'is-celebrating' : ''}`}
      style={{ width: size, height: size, '--cup-color': color } as CSSProperties}
    >
      <svg viewBox="0 0 100 100" className="fill-cup-svg" aria-hidden="true">
        <defs>
          <clipPath id={clipId}>
            <path d="M20,15 L80,15 L72,70 Q72,85 50,85 Q28,85 28,70 Z" />
          </clipPath>
          <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={`color-mix(in srgb, ${color} 55%, white)`} />
          </linearGradient>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <rect className="fill-cup-liquid" x="15" y={fillY} width="70" height={fillHeight} fill={`url(#${gradId})`} />
        </g>
        <path className="fill-cup-outline" d="M20,15 L80,15 L72,70 Q72,85 50,85 Q28,85 28,70 Z" />
        <path className="fill-cup-outline" d="M20,20 Q4,20 4,35 Q4,52 23,49" />
        <path className="fill-cup-outline" d="M80,20 Q96,20 96,35 Q96,52 77,49" />
        <rect className="fill-cup-outline-fill" x="41" y="85" width="18" height="7" />
        <rect className="fill-cup-outline-fill" x="29" y="92" width="42" height="5" rx="2" />
      </svg>
      {celebrating && (
        <span className="fill-cup-sparkles" aria-hidden="true">
          <Confetti count={confettiCount} />
        </span>
      )}
    </div>
  )
}

// ── Confetti — o mică explozie de particule în culorile celor 4 lecții
//    (+ auriu pentru cupa mare), pur CSS, fără librării externe. ──
const CONFETTI_COLORS = ['#008E40', '#EE5B00', '#FF3399', '#CC0000', '#FFB300']

function Confetti({ count = 14 }: { count?: number }) {
  return (
    <span className="confetti-burst" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`confetti-piece cp-${i % 8}`}
          style={{ '--confetti-color': CONFETTI_COLORS[i % CONFETTI_COLORS.length] } as CSSProperties}
        />
      ))}
    </span>
  )
}

export default function LearnPage() {
  const [unlocked, setUnlocked]       = useState<boolean[]>([true, false, false, false])
  const [starsEarned, setStarsEarned] = useState<number[]>([0, 0, 0, 0])
  const [active, setActive]           = useState(0)
  const [playingWord, setPlayingWord] = useState<string | null>(null)
  const [isPlayingRep, setIsPlayingRep]     = useState(false)
  const [poppingStarIndex, setPoppingStarIndex] = useState<number | null>(null)
  const [celebrating, setCelebrating]       = useState(false)
  const [readyToContinue, setReadyToContinue] = useState(false)
  const [masterCelebrating, setMasterCelebrating] = useState(false)

  const hydrated    = useRef(false)
  const autoCancel  = useRef(false)
  // Holds a { pause } handle for whatever's currently speaking (Web Speech API),
  // so the cleanup/stop logic below can silence it instantly either way.
  const currentAudio = useRef<{ pause: () => void } | null>(null)

  // ── Warm up the speech-synthesis voice list so the first playWord() has it ready ──
  useEffect(() => { warmUpVoices() }, [])

  // ── Restore progress from a previous visit ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved.unlocked) setUnlocked(saved.unlocked)
        if (saved.starsEarned) setStarsEarned(saved.starsEarned)
      }
    } catch { /* ignore */ }
    hydrated.current = true
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ unlocked, starsEarned })) } catch { /* ignore */ }
  }, [unlocked, starsEarned])

  // ── Leaving the column (or the page) mid-repetition also stops playback ──
  useEffect(() => {
    setCelebrating(false)
    setReadyToContinue(false)
    setPoppingStarIndex(null)
  }, [active])

  useEffect(() => {
    return () => {
      autoCancel.current = true
      currentAudio.current?.pause()
    }
  }, [])

  const lesson    = LESSONS[active]
  const earned    = starsEarned[active]
  const hasTrophy = earned >= REPS_PER_LESSON

  const totalStars  = starsEarned.reduce((a, b) => a + b, 0)
  const maxStars     = LESSONS.length * REPS_PER_LESSON
  const allMastered  = totalStars >= maxStars
  const progressPct  = Math.round((totalStars / maxStars) * 100)

  const playWord = useCallback(async (word: string) => {
    setPlayingWord(word)
    try {
      const { promise, stop } = speakWord(word)
      currentAudio.current = { pause: stop }
      await promise
      if (currentAudio.current?.pause === stop) currentAudio.current = null
    } catch { /* ignore */ }
    setPlayingWord(null)
  }, [])

  // ── Plays every word in a column exactly once, in order ──
  const playColumnOnce = useCallback(async (l: Lesson) => {
    for (let wi = 0; wi < l.words.length; wi++) {
      if (autoCancel.current) break
      await playWord(l.words[wi].text)
      if (autoCancel.current) break
      if (wi < l.words.length - 1) {
        await new Promise(res => setTimeout(res, AUTO_DELAY_MS))
      }
    }
  }, [playWord])

  // ── Main button: one press = one repetition of the active column,
  //    or — once 5 stars are reached — advances to the next column. ──
  const handleMainButton = useCallback(async () => {
    if (isPlayingRep) return

    if (readyToContinue) {
      setReadyToContinue(false)
      setCelebrating(false)
      const next = active + 1
      if (next < LESSONS.length) setActive(next)
      return
    }

    autoCancel.current = false
    setIsPlayingRep(true)
    await playColumnOnce(lesson)
    setIsPlayingRep(false)
    if (autoCancel.current) return

    // Already mastered — this is just a free practice replay, no star/trophy changes.
    if (starsEarned[active] >= REPS_PER_LESSON) return

    const newCount = Math.min(starsEarned[active] + 1, REPS_PER_LESSON)
    setPoppingStarIndex(newCount - 1)
    setTimeout(() => setPoppingStarIndex(null), POP_DURATION_MS)

    const updatedStars = starsEarned.map((v, idx) => (idx === active ? newCount : v))
    setStarsEarned(updatedStars)

    if (newCount === REPS_PER_LESSON) {
      setCelebrating(true)
      setReadyToContinue(true)
      setUnlocked(prev => {
        if (active + 1 < LESSONS.length && !prev[active + 1]) {
          const copy = [...prev]; copy[active + 1] = true; return copy
        }
        return prev
      })
      // Every column mastered → the big master cup gets its own celebration.
      if (updatedStars.every(v => v >= REPS_PER_LESSON)) {
        setMasterCelebrating(true)
        setTimeout(() => setMasterCelebrating(false), MASTER_POP_MS)
      }
    }
  }, [isPlayingRep, readyToContinue, active, lesson, starsEarned, playColumnOnce])

  const selectColumn = useCallback((i: number) => {
    if (isPlayingRep || !unlocked[i] || i === active) return
    setActive(i)
  }, [isPlayingRep, unlocked, active])

  const stopPlayback = useCallback(() => {
    autoCancel.current = true
    currentAudio.current?.pause()
  }, [])

  let buttonLabel: string
  if (isPlayingRep) buttonLabel = '🔊 Ascultă…'
  else if (readyToContinue) buttonLabel = active + 1 < LESSONS.length ? 'Continuă →' : '🎉 Gata!'
  else if (hasTrophy) buttonLabel = '🔁 Exersează din nou'
  else buttonLabel = `▶ Repetă (${earned}/${REPS_PER_LESSON})`

  return (
    <main className="lesson-page">
      <div className="lesson-back-row">
        <Link href="/" className="lesson-back-btn" onClick={stopPlayback}>← Pagina principală</Link>
      </div>

      <header className="lesson-header">
        <h1 className="lesson-title">EiC · English in Colors</h1>

        <Cup progressPct={progressPct} size={88} color="#FFB300" celebrating={masterCelebrating} allFull={allMastered} idSuffix="master" confettiCount={22} />
        <p className="lesson-progress-caption">
          {allMastered ? '🎉 Cupa e plină — ai terminat toate lecțiile!' : `${totalStars} / ${maxStars} — scopul: umple cupa`}
        </p>

        <p className="lesson-subhead">Apasă „Repetă", ascultă coloana și repetă fiecare cuvânt cu voce tare</p>
        <button
          className={`shadow-repeat-btn ${readyToContinue ? 'is-continue' : ''}`}
          onClick={handleMainButton}
          disabled={isPlayingRep}
          style={readyToContinue ? { background: lesson.color, borderColor: 'transparent', color: '#fff' } : undefined}
        >
          {buttonLabel}
        </button>
      </header>

      <div className="lesson-grid">
        {LESSONS.map((l, i) => {
          const isUnlocked   = unlocked[i]
          const isActive     = active === i
          const stars        = starsEarned[i]
          const trophyEarned = stars >= REPS_PER_LESSON
          const style = { '--lesson-color': l.color } as CSSProperties
          return (
            <div
              key={l.id}
              className={`lesson-col ${isUnlocked ? 'is-unlocked' : 'is-locked'} ${isActive && isUnlocked ? 'is-active' : ''}`}
              style={style}
              onClick={() => selectColumn(i)}
            >
              <div className="lesson-col-head">
                {!isUnlocked && <span className="lesson-lock" aria-label="blocat">🔒</span>}
                <div className="lesson-letter">{l.letter}</div>
              </div>

              {isUnlocked && (
                <Cup
                  progressPct={(stars / REPS_PER_LESSON) * 100}
                  size={42}
                  color={l.color}
                  celebrating={isActive && celebrating}
                  allFull={trophyEarned}
                  idSuffix={l.id}
                />
              )}

              <div className="lesson-stars" aria-label={`${stars} din ${REPS_PER_LESSON} stele`}>
                {Array.from({ length: REPS_PER_LESSON }).map((_, s) => (
                  <span key={s} className={`lesson-star-slot ${s < stars ? 'is-filled' : ''}`}>
                    <span className="lesson-star-icon">★</span>
                    {isActive && poppingStarIndex === s && (
                      <span className="lesson-star-pop" aria-hidden="true">
                        <span className="pop-cup">🏆</span>
                        <span className="pop-star">★</span>
                        <Confetti count={7} />
                      </span>
                    )}
                  </span>
                ))}
              </div>

              <div className="lesson-words">
                {l.words.map((w) => {
                  const isPlaying = isActive && isPlayingRep && playingWord === w.text
                  return (
                    <div
                      key={w.text}
                      className={`lesson-word ${isPlaying ? 'is-playing' : ''}`}
                    >
                      <MarkedWord text={w.text} mark={w.mark} />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
