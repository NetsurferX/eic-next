'use client'

import { speakWord, warmUpVoices } from '@/lib/speak'
import { playStarChime, playLevelFanfare } from '@/lib/sound'
import { LEVELS, STORAGE_KEY, REPS_PER_LESSON, type SavedProgress, type Lesson } from '@/lib/levels'
import { Cup, Confetti } from '@/components/game/Cup'
import { useState, useCallback, useEffect, useRef, type CSSProperties } from 'react'
import Link from 'next/link'

const AUTO_DELAY_MS = 1650   // gap between words — tripled from the original 550ms
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
  const [freePracticeCount, setFreePracticeCount] = useState(0)

  // ── Level-scope celebration state ──
  const [levelCelebrating, setLevelCelebrating]   = useState(false)
  const [showLevelOverlay, setShowLevelOverlay]   = useState(false)
  const [justRevealedIndex, setJustRevealedIndex] = useState<number | null>(null)

  const [hydrated, setHydrated] = useState(false)
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
    // `hydrated` is real state (not a ref) on purpose: the save-effect below
    // is gated on it via its dependency array, so it only actually runs on
    // the render AFTER these restored values have landed — never on the
    // same pass, with the still-default values, which used to silently
    // overwrite a real saved progress with zeros every time this page
    // remounted (e.g. going home and back mid-lesson).
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      const toSave: SavedProgress = { levelIndex, unlockedLevels, colUnlocked, starsEarned, active, allDone }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch { /* ignore */ }
  }, [hydrated, levelIndex, unlockedLevels, colUnlocked, starsEarned, active, allDone])

  // ── Leaving the column (or the level) mid-repetition also stops playback ──
  useEffect(() => {
    setCelebrating(false)
    setReadyToContinue(false)
    setPoppingStarIndex(null)
    setFreePracticeCount(0)
  }, [active, levelIndex])

  useEffect(() => {
    return () => {
      autoCancel.current = true
      currentAudio.current?.pause()
    }
  }, [])

  // ── Overlay-ul de nivel e un modal pe tot ecranul — blocăm scroll-ul de fundal cât e deschis ──
  useEffect(() => {
    document.body.style.overflow = showLevelOverlay ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showLevelOverlay])

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

    if (showLevelOverlay) {
      setShowLevelOverlay(false)
      setLevelCelebrating(false)
      if (nextLevel) {
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
      }
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

    // Already mastered — this is just a free practice replay, no star/trophy changes,
    // but the button keeps counting 1→5→1… so it still feels like a game, not a dead end.
    if (starsEarned[levelIndex][active] >= REPS_PER_LESSON) {
      setFreePracticeCount(c => c + 1)
      return
    }

    const newCount = Math.min(starsEarned[levelIndex][active] + 1, REPS_PER_LESSON)
    setPoppingStarIndex(newCount - 1)
    setTimeout(() => setPoppingStarIndex(null), POP_DURATION_MS)
    playStarChime()

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

      // Every column in the level mastered → a full-screen overlay celebrates
      // the level with its own beautiful cup, then either the next level
      // unlocks or, on the final level, the whole journey is done.
      if (updatedLevelStars.every(v => v >= REPS_PER_LESSON)) {
        setLevelCelebrating(true)
        setShowLevelOverlay(true)
        playLevelFanfare()
        setTimeout(() => setLevelCelebrating(false), LEVEL_POP_MS)
        if (isLastLevel) setAllDone(true)
      }
    }
  }, [isPlayingRep, showLevelOverlay, nextLevel, readyToContinue, levelIndex, active, level, lesson, levelStars, starsEarned, playColumnOnce, isLastLevel])

  const selectColumn = useCallback((i: number) => {
    if (isPlayingRep || !colUnlocked[levelIndex][i] || i === active) return
    setActive(i)
  }, [isPlayingRep, colUnlocked, levelIndex, active])

  const stopPlayback = useCallback(() => {
    autoCancel.current = true
    currentAudio.current?.pause()
  }, [])

  let buttonLabel: string
  if (isPlayingRep) buttonLabel = 'Repetă în glas'
  else if (readyToContinue) buttonLabel = 'Continuă →'
  else if (hasTrophy) buttonLabel = `Repetă (${(freePracticeCount % REPS_PER_LESSON) + 1}/${REPS_PER_LESSON})`
  else buttonLabel = `Repetă (${earned + 1}/${REPS_PER_LESSON})`

  return (
    <main className="lesson-page">
      <div className="lesson-top-row">
        <div className="lesson-top-links">
          <Link href="/" className="lesson-back-btn" onClick={stopPlayback}>← Pagina principală</Link>
          {/* ADAPT: schimbă "/culise" cu ruta reală a hero-ului, dacă diferă */}
          <Link href="/culise" className="lesson-back-btn lesson-hero-btn" onClick={stopPlayback}>✨ Vezi pagina de prezentare</Link>
        </div>
        <h1 className="lesson-title">EiC · English in Colours</h1>
      </div>

      <header className="lesson-header">
        <div className="lesson-stepper" aria-label="Niveluri">
          {LEVELS.map((lv, i) => {
            const done = i < levelIndex || (i === levelIndex && allDone)
            const isCurrent = i === levelIndex && !allDone
            const locked = i > levelIndex
            const pillStyle = { '--pill-color': lv.lessons[0].color } as CSSProperties
            return (
              <div
                key={lv.id}
                className={`lesson-stepper-pill ${done ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''} ${locked ? 'is-locked' : ''}`}
                style={pillStyle}
                title={lv.name}
              >
                <span className="lesson-stepper-dot" aria-hidden="true">{done ? '✓' : locked ? '🔒' : i + 1}</span>
                <span className="lesson-stepper-label">{lv.name.replace(/^Nivelul \d+ · /, '')}</span>
              </div>
            )
          })}
        </div>

        <div className="lesson-progress-inline">
          <Cup progressPct={progressPct} size={48} color="#FFB300" allFull={levelMastered} idSuffix="master" className="lesson-progress-cup" showBubbles ring />
          <p className="lesson-progress-caption">
            {levelMastered ? '🎉 Cupa e plină!' : `${totalLevelStars} / ${maxLevelStars} — scopul: umple cupa`}
          </p>
        </div>

        <p className="lesson-subhead">
          {allDone ? 'Repetă cuvintele cu voce tare' : 'Apasă „Repetă", ascultă coloana și repetă fiecare cuvânt cu voce tare'}
        </p>
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
                  showBubbles
                  activePulse={isActive && !trophyEarned}
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

              {isActive && isUnlocked && (
                <button
                  className={`lesson-col-btn ${readyToContinue ? 'is-continue' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleMainButton() }}
                  disabled={isPlayingRep}
                  style={{ background: l.color }}
                >
                  {buttonLabel}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {showLevelOverlay && (
        <div className="level-overlay" role="dialog" aria-modal="true" aria-label="Nivel finalizat">
          <div className="level-overlay-card">
            <div className="level-overlay-cupwrap">
              <span className="level-overlay-rays" style={{ '--ray-color': '#FFB300' } as CSSProperties} aria-hidden="true" />
              <Cup
                progressPct={100}
                size={132}
                color="#FFB300"
                celebrating={levelCelebrating}
                allFull
                idSuffix={`overlay-${level.id}`}
                confettiCount={32}
                big
                showBubbles
              />
              <span className="level-overlay-mascot" aria-hidden="true">🥳</span>
            </div>
            <p className="level-overlay-title">🏆 {level.name}</p>
            <p className="level-overlay-sub">
              {nextLevel ? <>Se deschide <strong>{nextLevel.name}</strong></> : 'Ai finalizat tot EiC — felicitări!'}
            </p>
            <button
              className="level-overlay-btn"
              onClick={handleMainButton}
              style={{ background: nextLevel ? nextLevel.lessons[0].color : '#FFB300' }}
            >
              {nextLevel ? `Spre ${nextLevel.name} →` : '🎉 Minunat!'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
