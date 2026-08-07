'use client'

import { speakWord, warmUpVoices } from '@/lib/speak'
import { useState, useCallback, useEffect, useRef, type CSSProperties } from 'react'
import Link from 'next/link'

// ── Fixed lesson data — colours match the canonical EiC sound map exactly ──
// (see lib/rules/colors.ts — SOUND_COLORS is the single source of truth)
interface LessonWord {
  text: string
  mark: string   // substring of `text` that carries the target sound — only this part gets coloured
}

interface Lesson {
  id: string
  letter: string     // sound shown at the top of the column — no slashes
  color: string
  tabLabel: string   // Romanian colour-name shown on the tabs
  words: LessonWord[]
}

// A level is a set of 4 columns (4 rules). Finishing all 4 columns of a
// level unlocks the next level's 4 columns, with 4 new EiC rules/sounds.
// TO ADD A NEW LEVEL: append a Level object here — everything else (progress
// state, unlock logic, animations) is driven off LEVELS.length automatically.
interface Level {
  id: string
  name: string        // shown under the title, e.g. "Nivelul 2 · Alte vocale"
  lessons: Lesson[]    // always 4
}

const LEVELS: Level[] = [
  {
    id: 'lvl1',
    name: 'Nivelul 1 · Vocale scurte',
    lessons: [
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
    ],
  },
  {
    id: 'lvl2',
    name: 'Nivelul 2 · Alte vocale',
    lessons: [
      {
        id: 'ae', letter: 'æ', color: '#00b0f0', tabLabel: 'Bleu',
        words: [
          { text: 'cat',  mark: 'a' },
          { text: 'hat',  mark: 'a' },
          { text: 'bag',  mark: 'a' },
          { text: 'man',  mark: 'a' },
          { text: 'sad',  mark: 'a' },
          { text: 'flag', mark: 'a' },
          { text: 'black', mark: 'a' },
          { text: 'hand', mark: 'a' },
        ],
      },
      {
        id: 'u', letter: 'uː', color: '#7030A0', tabLabel: 'Mov',
        words: [
          { text: 'moon', mark: 'oo' },
          { text: 'food', mark: 'oo' },
          { text: 'room', mark: 'oo' },
          { text: 'soon', mark: 'oo' },
          { text: 'book', mark: 'oo' },
          { text: 'good', mark: 'oo' },
          { text: 'look', mark: 'oo' },
          { text: 'foot', mark: 'oo' },
        ],
      },
      {
        id: 'ou', letter: 'oʊ', color: '#FCD116', tabLabel: 'Galben',
        words: [
          { text: 'go',   mark: 'o' },
          { text: 'boat', mark: 'oa' },
          { text: 'coat', mark: 'oa' },
          { text: 'road', mark: 'oa' },
          { text: 'home', mark: 'o' },
          { text: 'snow', mark: 'ow' },
          { text: 'show', mark: 'ow' },
          { text: 'slow', mark: 'ow' },
        ],
      },
      {
        id: 'ei', letter: 'eɪ', color: '#00246C', tabLabel: 'Bleumarin',
        words: [
          { text: 'day',  mark: 'ay' },
          { text: 'name', mark: 'a' },
          { text: 'cake', mark: 'a' },
          { text: 'rain', mark: 'ai' },
          { text: 'play', mark: 'ay' },
          { text: 'gate', mark: 'a' },
          { text: 'wait', mark: 'ai' },
          { text: 'say',  mark: 'ay' },
        ],
      },
    ],
  },
  {
    id: 'lvl3',
    name: 'Nivelul 3 · Diftongi',
    lessons: [
      {
        id: 'ju', letter: 'juː', color: '#833C0B', tabLabel: 'Maro',
        words: [
          { text: 'cute',     mark: 'u' },
          { text: 'music',    mark: 'u' },
          { text: 'use',      mark: 'u' },
          { text: 'computer', mark: 'u' },
          { text: 'unit',     mark: 'u' },
          { text: 'human',    mark: 'u' },
          { text: 'few',      mark: 'ew' },
          { text: 'pupil',    mark: 'u' },
        ],
      },
      {
        id: 'ai', letter: 'aɪ', color: '#4472C4', tabLabel: 'Albastru',
        words: [
          { text: 'night', mark: 'i' },
          { text: 'my',    mark: 'y' },
          { text: 'time',  mark: 'i' },
          { text: 'like',  mark: 'i' },
          { text: 'fly',   mark: 'y' },
          { text: 'high',  mark: 'igh' },
          { text: 'light', mark: 'igh' },
          { text: 'five',  mark: 'i' },
        ],
      },
      {
        id: 'au', letter: 'aʊ', color: '#23D300', tabLabel: 'Verde deschis',
        words: [
          { text: 'loud',  mark: 'ou' },
          { text: 'cow',   mark: 'ow' },
          { text: 'house', mark: 'ou' },
          { text: 'now',   mark: 'ow' },
          { text: 'mouth', mark: 'ou' },
          { text: 'down',  mark: 'ow' },
          { text: 'cloud', mark: 'ou' },
          { text: 'brown', mark: 'ow' },
        ],
      },
      {
        id: 'oi', letter: 'oɪ', color: '#FF3399', tabLabel: 'Roz-roșu',
        words: [
          { text: 'boy',   mark: 'oy' },
          { text: 'coin',  mark: 'oi' },
          { text: 'toy',   mark: 'oy' },
          { text: 'voice', mark: 'oi' },
          { text: 'enjoy', mark: 'oy' },
          { text: 'point', mark: 'oi' },
          { text: 'noise', mark: 'oi' },
          { text: 'joy',   mark: 'oy' },
        ],
      },
    ],
  },
]

const STORAGE_KEY = 'eic-lesson-progress-v5'   // bumped — v4 saves could carry the "next level's column 0 never unlocks" bug
const AUTO_DELAY_MS = 1650   // gap between words — tripled from the original 550ms
const REPS_PER_LESSON = 5
const POP_DURATION_MS = 5000    // how long the per-column cup→star pop animation plays
const LEVEL_POP_MS = 1800       // how long the big level-cup celebration plays
const REVEAL_MS = 900           // how long a freshly-unlocked column's reveal-in animation plays

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
//    pe măsură ce progresul crește. Folosită pentru cupa de nivel din header,
//    cupa fiecărei coloane, cupa mare de finalizare de nivel și insignele
//    din raftul de trofee — doar cu culoare și mărime diferite. ──
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

// ── Confetti — o mică explozie de particule, pur CSS, fără librării externe. ──
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

interface SavedProgress {
  levelIndex: number
  unlockedLevels: boolean[]
  colUnlocked: boolean[][]
  starsEarned: number[][]
  active: number
  allDone: boolean
}

export default function LearnPage() {
  const [levelIndex, setLevelIndex]         = useState(0)
  const [unlockedLevels, setUnlockedLevels] = useState<boolean[]>(() => LEVELS.map((_, i) => i === 0))
  const [colUnlocked, setColUnlocked]       = useState<boolean[][]>(() => LEVELS.map((_, i) => [i === 0, false, false, false]))
  const [starsEarned, setStarsEarned]       = useState<number[][]>(() => LEVELS.map(() => [0, 0, 0, 0]))
  const [active, setActive]                 = useState(0)
  const [allDone, setAllDone]               = useState(false)

  const [playingWord, setPlayingWord]       = useState<string | null>(null)
  const [isPlayingRep, setIsPlayingRep]     = useState(false)
  const [poppingStarIndex, setPoppingStarIndex] = useState<number | null>(null)
  const [celebrating, setCelebrating]       = useState(false)
  const [readyToContinue, setReadyToContinue] = useState(false)

  // ── Level-scope celebration state ──
  const [levelCelebrating, setLevelCelebrating]   = useState(false)
  const [readyForNextLevel, setReadyForNextLevel] = useState(false)
  const [justRevealedIndex, setJustRevealedIndex] = useState<number | null>(null)

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
        const saved = JSON.parse(raw) as Partial<SavedProgress>
        if (saved.levelIndex !== undefined) setLevelIndex(saved.levelIndex)
        if (saved.unlockedLevels) setUnlockedLevels(saved.unlockedLevels)
        if (saved.colUnlocked) setColUnlocked(saved.colUnlocked)
        if (saved.starsEarned) setStarsEarned(saved.starsEarned)
        if (saved.active !== undefined) setActive(saved.active)
        if (saved.allDone) setAllDone(saved.allDone)
      }
    } catch { /* ignore */ }
    hydrated.current = true
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    try {
      const toSave: SavedProgress = { levelIndex, unlockedLevels, colUnlocked, starsEarned, active, allDone }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch { /* ignore */ }
  }, [levelIndex, unlockedLevels, colUnlocked, starsEarned, active, allDone])

  // ── Leaving the column (or the level) mid-repetition also stops playback ──
  useEffect(() => {
    setCelebrating(false)
    setReadyToContinue(false)
    setPoppingStarIndex(null)
  }, [active, levelIndex])

  useEffect(() => {
    return () => {
      autoCancel.current = true
      currentAudio.current?.pause()
    }
  }, [])

  const level     = LEVELS[levelIndex]
  const lesson    = level.lessons[active]
  const earned    = starsEarned[levelIndex][active]
  const hasTrophy = earned >= REPS_PER_LESSON

  const levelStars    = starsEarned[levelIndex]
  const totalLevelStars = levelStars.reduce((a, b) => a + b, 0)
  const maxLevelStars   = level.lessons.length * REPS_PER_LESSON
  const levelMastered   = totalLevelStars >= maxLevelStars
  const progressPct     = Math.round((totalLevelStars / maxLevelStars) * 100)

  const isLastLevel = levelIndex === LEVELS.length - 1
  const nextLevel   = !isLastLevel ? LEVELS[levelIndex + 1] : null

  // Levels strictly before the current one are, by construction, always
  // fully mastered (that's what unlocked them) — plus the current one if
  // the whole journey just ended on it.
  const completedLevels = [...Array(levelIndex).keys(), ...(allDone ? [levelIndex] : [])]

  // The single locked column right after the active one — the one that's
  // "about to be offered". Progression is strictly linear so at most one
  // column ever carries this state.
  const nextUpIndex = colUnlocked[levelIndex].findIndex((u, i) => !u && (i === 0 || colUnlocked[levelIndex][i - 1]))

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

  // ── Main button: one press = one repetition of the active column, or —
  //    once 5 stars are reached — advances to the next column, or — once a
  //    whole level is mastered — advances into the next level's 4 columns. ──
  const handleMainButton = useCallback(async () => {
    if (isPlayingRep) return

    if (readyForNextLevel && nextLevel) {
      setReadyForNextLevel(false)
      setLevelCelebrating(false)
      const next = levelIndex + 1
      setUnlockedLevels(prev => {
        if (prev[next]) return prev
        const copy = [...prev]; copy[next] = true; return copy
      })
      setColUnlocked(prev => {
        if (prev[next][0]) return prev
        const copy = prev.map(row => [...row])
        copy[next][0] = true
        return copy
      })
      setLevelIndex(next)
      setActive(0)
      setJustRevealedIndex(0)
      setTimeout(() => setJustRevealedIndex(null), REVEAL_MS)
      return
    }

    if (readyToContinue) {
      setReadyToContinue(false)
      setCelebrating(false)
      const next = active + 1
      if (next < level.lessons.length) setActive(next)
      return
    }

    autoCancel.current = false
    setIsPlayingRep(true)
    await playColumnOnce(lesson)
    setIsPlayingRep(false)
    if (autoCancel.current) return

    // Already mastered — this is just a free practice replay, no star/trophy changes.
    if (starsEarned[levelIndex][active] >= REPS_PER_LESSON) return

    const newCount = Math.min(starsEarned[levelIndex][active] + 1, REPS_PER_LESSON)
    setPoppingStarIndex(newCount - 1)
    setTimeout(() => setPoppingStarIndex(null), POP_DURATION_MS)

    const updatedLevelStars = levelStars.map((v, idx) => (idx === active ? newCount : v))
    setStarsEarned(prev => prev.map((row, li) => (li === levelIndex ? updatedLevelStars : row)))

    if (newCount === REPS_PER_LESSON) {
      setCelebrating(true)

      const isLastColumn = active + 1 >= level.lessons.length
      if (!isLastColumn) {
        setReadyToContinue(true)
        setColUnlocked(prev => {
          if (prev[levelIndex][active + 1]) return prev
          const copy = prev.map(row => [...row])
          copy[levelIndex][active + 1] = true
          return copy
        })
        setJustRevealedIndex(active + 1)
        setTimeout(() => setJustRevealedIndex(null), REVEAL_MS)
      }

      // Every column in the level mastered → the level gets its own beautiful
      // cup + celebration, then either the next level unlocks or, on the
      // final level, the whole journey is done.
      if (updatedLevelStars.every(v => v >= REPS_PER_LESSON)) {
        setLevelCelebrating(true)
        setTimeout(() => setLevelCelebrating(false), LEVEL_POP_MS)
        if (isLastLevel) setAllDone(true)
        else setReadyForNextLevel(true)
      }
    }
  }, [isPlayingRep, readyForNextLevel, nextLevel, readyToContinue, levelIndex, active, level, lesson, levelStars, starsEarned, playColumnOnce, isLastLevel])

  const selectColumn = useCallback((i: number) => {
    if (isPlayingRep || !colUnlocked[levelIndex][i] || i === active) return
    setActive(i)
  }, [isPlayingRep, colUnlocked, levelIndex, active])

  const stopPlayback = useCallback(() => {
    autoCancel.current = true
    currentAudio.current?.pause()
  }, [])

  let buttonLabel: string
  if (isPlayingRep) buttonLabel = '🔊 Ascultă…'
  else if (readyForNextLevel && nextLevel) buttonLabel = `🏆 Spre ${nextLevel.name} →`
  else if (readyToContinue) buttonLabel = 'Continuă →'
  else if (allDone) buttonLabel = '🎉 Gata!'
  else if (hasTrophy) buttonLabel = '🔁 Exersează din nou'
  else buttonLabel = `▶ Repetă (${earned}/${REPS_PER_LESSON})`

  return (
    <main className="lesson-page">
      <div className="lesson-back-row">
        <Link href="/" className="lesson-back-btn" onClick={stopPlayback}>← Pagina principală</Link>
      </div>

      <header className="lesson-header">
        <h1 className="lesson-title">EiC · English in Colors</h1>
        <p className="lesson-level-label">{level.name}</p>

        {completedLevels.length > 0 && (
          <div className="lesson-trophy-shelf" aria-label="Niveluri finalizate">
            {completedLevels.map(i => (
              <div key={LEVELS[i].id} className="lesson-trophy-badge" title={LEVELS[i].name}>
                <Cup progressPct={100} size={30} color="#FFB300" allFull idSuffix={`shelf-${LEVELS[i].id}`} />
                <span className="lesson-trophy-num">{i + 1}</span>
              </div>
            ))}
          </div>
        )}

        {(levelCelebrating || readyForNextLevel) ? (
          <div className="lesson-level-complete">
            <Cup progressPct={100} size={104} color="#FFB300" celebrating={levelCelebrating} allFull idSuffix={`level-${level.id}`} confettiCount={26} />
            <p className="lesson-level-complete-text">
              🏆 {level.name} — finalizat!
              {nextLevel && <><br />Se deschide <strong>{nextLevel.name}</strong></>}
              {!nextLevel && <><br />Ai terminat tot EiC!</>}
            </p>
          </div>
        ) : (
          <>
            <Cup progressPct={progressPct} size={88} color="#FFB300" allFull={levelMastered} idSuffix="master" />
            <p className="lesson-progress-caption">
              {levelMastered ? '🎉 Cupa e plină!' : `${totalLevelStars} / ${maxLevelStars} — scopul: umple cupa`}
            </p>
          </>
        )}

        <p className="lesson-subhead">
          {allDone ? '🎉 Ai finalizat toate nivelurile EiC!' : 'Apasă „Repetă", ascultă coloana și repetă fiecare cuvânt cu voce tare'}
        </p>
        <button
          className={`shadow-repeat-btn ${readyToContinue || (readyForNextLevel && nextLevel) ? 'is-continue' : ''}`}
          onClick={handleMainButton}
          disabled={isPlayingRep}
          style={readyToContinue ? { background: lesson.color, borderColor: 'transparent', color: '#fff' } : undefined}
        >
          {buttonLabel}
        </button>
      </header>

      <div className="lesson-grid">
        {level.lessons.map((l, i) => {
          const isUnlocked   = colUnlocked[levelIndex][i]
          const isActive     = active === i
          const stars        = starsEarned[levelIndex][i]
          const trophyEarned = stars >= REPS_PER_LESSON
          const isNextUp     = i === nextUpIndex
          const isRevealing  = justRevealedIndex === i
          const style = { '--lesson-color': l.color } as CSSProperties
          return (
            <div
              key={l.id}
              className={`lesson-col ${isUnlocked ? 'is-unlocked' : 'is-locked'} ${isActive && isUnlocked ? 'is-active' : ''} ${isNextUp ? 'is-next-up' : ''} ${isRevealing ? 'is-revealing' : ''}`}
              style={style}
              onClick={() => selectColumn(i)}
            >
              <div className="lesson-col-head">
                {!isUnlocked && <span className="lesson-lock" aria-label="blocat">{isNextUp ? '🔓' : '🔒'}</span>}
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
              {!isUnlocked && isNextUp && (
                <p className="lesson-next-hint">se deschide imediat</p>
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

      {nextLevel && !levelCelebrating && !readyForNextLevel && (
        <div className="lesson-next-level-teaser">
          <span className="lesson-next-level-lock" aria-hidden="true">🔒</span>
          <div className="lesson-next-level-info">
            <p className="lesson-next-level-name">{nextLevel.name}</p>
            <div className="lesson-next-level-dots">
              {nextLevel.lessons.map(nl => (
                <span key={nl.id} className="lesson-next-level-dot" style={{ '--dot-color': nl.color } as CSSProperties} />
              ))}
            </div>
          </div>
          <span className="lesson-next-level-caption">se deschide după finalizarea acestui nivel</span>
        </div>
      )}
    </main>
  )
}
