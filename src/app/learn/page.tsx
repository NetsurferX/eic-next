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

const STORAGE_KEY = 'eic-lesson-progress-v2'
const AUTO_DELAY_MS = 550   // gap between words
const TROPHY_PAUSE_MS = 900 // pause on a column's trophy before moving to the next one
const REPS_PER_LESSON = 5

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
  const [unlocked, setUnlocked] = useState<boolean[]>([true, false, false, false])
  const [trophies, setTrophies] = useState<boolean[]>([false, false, false, false])
  const [active, setActive] = useState(0)
  const [currentRep, setCurrentRep] = useState(0)              // 0 = not currently running a rep
  const [starsThisRun, setStarsThisRun] = useState<number[]>([0, 0, 0, 0])
  const [playingWord, setPlayingWord] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [justCompleted, setJustCompleted] = useState<number | null>(null)

  const hydrated    = useRef(false)
  const autoCancel  = useRef(false)
  // Holds a { pause } handle for whatever's currently speaking (Web Speech API),
  // so the cleanup/stop logic below can silence it instantly either way.
  const currentAudio = useRef<{ pause: () => void } | null>(null)
  const repRef      = useRef(0)   // rep in progress when stopped — 0 = nothing in progress
  const wordIdxRef  = useRef(0)   // word index in progress within that rep

  // ── Warm up the speech-synthesis voice list so the first playWord() has it ready ──
  useEffect(() => { warmUpVoices() }, [])

  // ── Restore progress from a previous visit ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved.unlocked) setUnlocked(saved.unlocked)
        if (saved.trophies) setTrophies(saved.trophies)
      }
    } catch { /* ignore */ }
    hydrated.current = true
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ unlocked, trophies })) } catch { /* ignore */ }
  }, [unlocked, trophies])

  // ── Safety net: leaving the page any other way (back button, another link) also stops playback ──
  useEffect(() => {
    return () => {
      autoCancel.current = true
      currentAudio.current?.pause()
    }
  }, [])

  const lesson = LESSONS[active]

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

  // ── Main automatic sequence: for every column, play the word list five times,
  //    one star per completed pass, a trophy — and the next column — once all five are done.
  //    Resumes exactly where a previous "Oprește" left off (same rep, same word). ──
  const startGame = useCallback(async () => {
    if (isRunning) return
    autoCancel.current = false
    setIsRunning(true)
    setJustCompleted(null)

    const resumeLessonIdx = active
    let firstLesson = true

    for (let lessonIdx = resumeLessonIdx; lessonIdx < LESSONS.length; lessonIdx++) {
      if (autoCancel.current) break
      setActive(lessonIdx)
      const currentLesson = LESSONS[lessonIdx]

      // Only the lesson we were stopped on resumes mid-way; every lesson after starts clean.
      const resuming  = firstLesson && repRef.current > 0
      let repStart    = resuming ? repRef.current : 1
      let wordStart   = resuming ? wordIdxRef.current : 0
      firstLesson = false

      if (!resuming) {
        setCurrentRep(0)
        setStarsThisRun(prev => { const copy = [...prev]; copy[lessonIdx] = 0; return copy })
      }

      for (let rep = repStart; rep <= REPS_PER_LESSON; rep++) {
        if (autoCancel.current) break
        repRef.current = rep
        setCurrentRep(rep)
        for (let wi = wordStart; wi < currentLesson.words.length; wi++) {
          if (autoCancel.current) break
          wordIdxRef.current = wi
          await playWord(currentLesson.words[wi].text)
          if (autoCancel.current) break
          await new Promise(res => setTimeout(res, AUTO_DELAY_MS))
          if (autoCancel.current) break
          wordIdxRef.current = wi + 1
        }
        wordStart = 0
        if (autoCancel.current) break
        wordIdxRef.current = 0
        setStarsThisRun(prev => { const copy = [...prev]; copy[lessonIdx] = rep; return copy })
      }
      if (autoCancel.current) break

      repRef.current = 0
      wordIdxRef.current = 0
      setTrophies(prev => { const copy = [...prev]; copy[lessonIdx] = true; return copy })
      setJustCompleted(lessonIdx)
      setUnlocked(prev => {
        if (lessonIdx + 1 < LESSONS.length && !prev[lessonIdx + 1]) {
          const copy = [...prev]; copy[lessonIdx + 1] = true; return copy
        }
        return prev
      })
      await new Promise(res => setTimeout(res, TROPHY_PAUSE_MS))
    }

    setCurrentRep(0)
    setIsRunning(false)
  }, [active, isRunning, playWord])

  const stopGame = useCallback(() => {
    autoCancel.current = true
    currentAudio.current?.pause()   // silences the word being spoken right away
    setIsRunning(false)
  }, [])

  const toggleGame = useCallback(() => {
    if (isRunning) stopGame(); else startGame()
  }, [isRunning, startGame, stopGame])

  return (
    <main className="lesson-page">
      <div className="lesson-back-row">
        <Link href="/" className="lesson-back-btn" onClick={stopGame}>← Pagina principală</Link>
      </div>

      <header className="lesson-header">
        <h1 className="lesson-title">EiC · English in Colors</h1>
        <p className="lesson-subhead">Repetă în glas fiecare cuvânt pe care îl auzi</p>
        <button className={`shadow-repeat-btn ${isRunning ? 'is-stop' : ''}`} onClick={toggleGame}>
          {isRunning ? '■ Oprește' : trophies[active] ? '🔁 Exersează din nou' : '▶ Start'}
        </button>
      </header>

      <div className="lesson-grid">
        {LESSONS.map((l, i) => {
          const isUnlocked = unlocked[i]
          const isActive   = active === i
          const stars      = trophies[i] ? REPS_PER_LESSON : (isActive ? starsThisRun[i] : 0)
          const style = { '--lesson-color': l.color } as CSSProperties
          return (
            <div
              key={l.id}
              className={`lesson-col ${isUnlocked ? 'is-unlocked' : 'is-locked'} ${isActive && isUnlocked ? 'is-active' : ''}`}
              style={style}
            >
              <div className="lesson-col-head">
                {!isUnlocked && <span className="lesson-lock" aria-label="blocat">🔒</span>}
                <div className="lesson-letter">{l.letter}</div>
                {trophies[i] && <span className="lesson-trophy" aria-label="trofeu câștigat">🏆</span>}
              </div>

              <div className="lesson-stars" aria-label={`${stars} din ${REPS_PER_LESSON} stele`}>
                {Array.from({ length: REPS_PER_LESSON }).map((_, s) => (
                  <span key={s} className={`lesson-star ${s < stars ? 'is-filled' : ''}`}>★</span>
                ))}
              </div>

              <div className="lesson-words">
                {l.words.map((w) => {
                  const isPlaying = isActive && playingWord === w.text
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