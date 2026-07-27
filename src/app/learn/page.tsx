'use client'

import { useState, useCallback, useEffect, useRef, type CSSProperties } from 'react'

// ── Fixed lesson data — colours match the canonical EiC sound map exactly ──
// (ɑ/ʌ → green, e/ɛ → orange, ɒ/ɔ → pink, i/ɪ → red — see lib/rules/colors.ts)
interface Lesson {
  id: string
  ipaBig: string
  ipaSub: string
  color: string
  tabLabel: string   // Romanian colour-name shown on the shadowing tabs
  words: string[]
}

const LESSONS: Lesson[] = [
  {
    id: 'a', ipaBig: '/a/', ipaSub: '/ɑ/', color: '#008E40', tabLabel: 'Verde',
    words: ['dark', 'cart', 'father', 'star', 'farm', 'hard', 'park', 'calm'],
  },
  {
    id: 'e', ipaBig: '/e/', ipaSub: '/ɛ/', color: '#EE5B00', tabLabel: 'Portocaliu',
    words: ['bed', 'head', 'said', 'bread', 'friend', 'left', 'best', 'red'],
  },
  {
    id: 'o', ipaBig: '/o/', ipaSub: '/ɔ/', color: '#FF3399', tabLabel: 'Roz',
    words: ['hot', 'top', 'stop', 'clock', 'dog', 'box', 'lot', 'not'],
  },
  {
    id: 'i', ipaBig: '/i/', ipaSub: '/ɪ/', color: '#CC0000', tabLabel: 'Roșu',
    words: ['sit', 'tip', 'big', 'fish', 'hit', 'list', 'ship', 'wind'],
  },
]

const STORAGE_KEY = 'eic-lesson-progress-v1'
const AUTO_DELAY_MS = 550 // gap between words in "Repetă tot" mode

export default function LearnPage() {
  const [unlocked, setUnlocked] = useState<boolean[]>([true, false, false, false])
  const [active, setActive] = useState(0)
  const [practiced, setPracticed] = useState<Set<string>>(new Set())
  const [playingWord, setPlayingWord] = useState<string | null>(null)
  const [autoPlaying, setAutoPlaying] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

  const hydrated  = useRef(false)
  const audioCache = useRef<Map<string, string>>(new Map())   // word → object URL
  const autoCancel  = useRef(false)

  // ── Restore progress from a previous visit ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUnlocked(JSON.parse(raw))
    } catch { /* ignore */ }
    hydrated.current = true
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked)) } catch { /* ignore */ }
  }, [unlocked])

  const lesson = LESSONS[active]

  // ── Prefetch every word's audio for the active lesson so playback is instant ──
  useEffect(() => {
    let cancelled = false
    lesson.words.forEach(async (word) => {
      if (audioCache.current.has(word)) return
      try {
        const res = await fetch('/api/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word }),
        })
        if (!res.ok || cancelled) return
        const blob = await res.blob()
        audioCache.current.set(word, URL.createObjectURL(blob))
      } catch { /* ignore — that word just falls back to on-demand fetch */ }
    })
    return () => { cancelled = true }
  }, [lesson])

  const playWord = useCallback(async (word: string) => {
    setPlayingWord(word)
    try {
      let url = audioCache.current.get(word)
      if (!url) {
        const res = await fetch('/api/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word }),
        })
        if (res.ok) {
          const blob = await res.blob()
          url = URL.createObjectURL(blob)
          audioCache.current.set(word, url)
        }
      }
      if (url) {
        const audio = new Audio(url)
        await audio.play()
        await new Promise<void>(resolve => { audio.onended = () => resolve() })
      }
    } catch { /* ignore — still counts as practiced below */ }
    setPlayingWord(null)
    setPracticed(prev => (prev.has(word) ? prev : new Set(prev).add(word)))
  }, [])

  const selectLesson = useCallback((i: number) => {
    if (!unlocked[i]) return
    autoCancel.current = true
    setAutoPlaying(false)
    setActive(i)
    setPracticed(new Set())
    setJustCompleted(false)
  }, [unlocked])

  const handleWordTap = useCallback((word: string) => {
    if (playingWord || autoPlaying) return
    playWord(word)
  }, [playingWord, autoPlaying, playWord])

  const toggleAutoPlay = useCallback(async () => {
    if (autoPlaying) { autoCancel.current = true; setAutoPlaying(false); return }
    autoCancel.current = false
    setAutoPlaying(true)
    for (const word of lesson.words) {
      if (autoCancel.current) break
      await playWord(word)
      if (autoCancel.current) break
      await new Promise(r => setTimeout(r, AUTO_DELAY_MS))
    }
    setAutoPlaying(false)
  }, [autoPlaying, lesson, playWord])

  // ── Lesson-complete detection: every word practiced at least once ──
  useEffect(() => {
    if (justCompleted) return
    if (practiced.size > 0 && practiced.size === lesson.words.length) {
      setJustCompleted(true)
      setUnlocked(u => {
        if (active + 1 < LESSONS.length && !u[active + 1]) {
          const copy = [...u]
          copy[active + 1] = true
          return copy
        }
        return u
      })
    }
  }, [practiced, lesson, active, justCompleted])

  const allDone = unlocked.every(Boolean) && active === LESSONS.length - 1 && justCompleted

  return (
    <main className="lesson-page">
      <header className="lesson-header">
        <h1 className="lesson-title">EiC · English in Color</h1>
        <p className="lesson-subhead">Antrenamentul Activ — Lecția {active + 1}: sunetele de bază</p>
      </header>

      <div className="lesson-tabs">
        {LESSONS.map((l, i) => (
          <button
            key={l.id}
            className={`lesson-tab ${active === i ? 'active' : ''}`}
            onClick={() => selectLesson(i)}
            disabled={!unlocked[i]}
          >
            Lecția {i + 1}{!unlocked[i] && <span className="lesson-tab-lock">🔒</span>}
          </button>
        ))}
      </div>

      <div className="lesson-grid">
        {LESSONS.map((l, i) => {
          const isUnlocked = unlocked[i]
          const isActive   = active === i
          const style = { '--lesson-color': l.color } as CSSProperties
          return (
            <div
              key={l.id}
              className={`lesson-col ${isUnlocked ? 'is-unlocked' : 'is-locked'} ${isActive && isUnlocked ? 'is-active' : ''}`}
              style={style}
            >
              <div className="lesson-col-head">
                {!isUnlocked && <span className="lesson-lock" aria-label="blocat">🔒</span>}
                <div className="lesson-ipa-big">{l.ipaBig}</div>
                <div className="lesson-ipa-sub">{l.ipaSub}</div>
              </div>
              <div className="lesson-words">
                {l.words.map((w) => {
                  const isPracticed = isActive && practiced.has(w)
                  const isPlaying   = isActive && playingWord === w
                  const tappable    = isActive && isUnlocked && !autoPlaying
                  return (
                    <button
                      key={w}
                      type="button"
                      className={`lesson-word ${isPlaying ? 'is-playing' : ''} ${isPracticed ? 'is-practiced' : ''} ${tappable ? 'is-tappable' : ''}`}
                      onClick={() => tappable && handleWordTap(w)}
                      disabled={!tappable}
                    >
                      <span>{w}</span>
                      {isPracticed && !isPlaying && <span className="lesson-word-check">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="shadow-panel">
        <p className="shadow-title">Shadowing — atinge un cuvânt și repetă-l cu voce tare:</p>

        <div className="shadow-tabs">
          {LESSONS.map((l, i) => {
            const style = { '--tab-color': l.color } as CSSProperties
            return (
              <button
                key={l.id}
                className={`shadow-tab ${active === i ? 'active' : ''}`}
                style={style}
                onClick={() => selectLesson(i)}
                disabled={!unlocked[i]}
              >
                {l.tabLabel}
              </button>
            )
          })}
        </div>

        <button className={`shadow-repeat-btn ${autoPlaying ? 'is-stop' : ''}`} onClick={toggleAutoPlay}>
          {autoPlaying ? '■ Oprește' : '🔀 Repetă tot'}
        </button>

        <div className="shadow-count">{practiced.size} / {lesson.words.length}</div>
        <div className="shadow-progress">
          <div className="shadow-progress-fill" style={{ width: `${(practiced.size / lesson.words.length) * 100}%` }} />
        </div>

        <p className="shadow-caption">
          {allDone
            ? '🎉 Ai terminat toate lecțiile de bază!'
            : justCompleted
            ? `🎉 Lecție completă! Lecția ${active + 2} s-a deblocat.`
            : practiced.size === 0
            ? 'Atinge orice cuvânt colorat ca să-l auzi și să-l repeți'
            : `Mai sunt ${lesson.words.length - practiced.size} cuvinte de repetat`}
        </p>
      </div>
    </main>
  )
}
