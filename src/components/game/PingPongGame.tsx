'use client'

// ── EiC2 · Ping-pong — joc de RECAPITULARE (nu lecție nouă): cuvinte deja
//    întâlnite în EiC1 (levels.ts) traversează ecranul, alternând sensul
//    (stânga→dreapta, apoi dreapta→stânga — de-aici „ping-pong"), iar
//    copilul trebuie să apese SWATCH-UL DE CULOARE corect (cel al lecției
//    din care provine cuvântul) înainte ca bula să iasă din ecran.
//    Fără vieți/game-over — scor continuu, se joacă cât vrea copilul
//    (cerut explicit). Fără conținut nou: folosește exact cuvintele din
//    LEVELS, deci nu ține sincronizat nimic separat dacă lecțiile se
//    modifică. Complet izolat de /learn — nu atinge motorul de randare,
//    progresul salvat sau componentele existente (doar reutilizează
//    <Mascot/> pentru feedback vizual). ──

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { LEVELS } from '@/lib/levels'
import { Mascot, type MascotState } from '@/components/game/Mascot'

const CROSS_DURATION_MS = 5000   // timp fix de traversare a ecranului (o singură viteză, v1)
const CORRECT_PAUSE_MS  = 550    // pauză scurtă de feedback pozitiv înainte de următoarea bulă
const MISS_PAUSE_MS     = 500    // pauză scurtă după un rateu

interface PoolWord {
  word: string
  mark: string
  color: string
  lessonId: string
}

// Toate cuvintele din toate lecțiile EiC1, cu culoarea lecției din care provin.
const WORD_POOL: PoolWord[] = LEVELS.flatMap(lvl =>
  lvl.lessons.flatMap(lesson =>
    lesson.words.map(w => ({ word: w.text, mark: w.mark, color: lesson.color, lessonId: lesson.id }))
  )
)

// Paleta de culori distincte + eticheta românească a fiecăreia (pentru aria-label),
// luată din prima lecție care o folosește.
const COLOR_LABEL: Record<string, string> = {}
for (const lvl of LEVELS) {
  for (const lesson of lvl.lessons) {
    if (!(lesson.color in COLOR_LABEL)) COLOR_LABEL[lesson.color] = lesson.tabLabel
  }
}
const ALL_COLORS = Object.keys(COLOR_LABEL)

function pickWord(prevLessonId: string | null): PoolWord {
  let candidate: PoolWord
  do {
    candidate = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]
  } while (WORD_POOL.length > 1 && candidate.lessonId === prevLessonId)
  return candidate
}

function pickOptions(correctColor: string): string[] {
  const distractorPool = ALL_COLORS.filter(c => c !== correctColor)
  const shuffled = [...distractorPool].sort(() => Math.random() - 0.5)
  const options = [...shuffled.slice(0, 3), correctColor]
  return options.sort(() => Math.random() - 0.5)
}

// Subliniază DOAR partea din cuvânt care poartă sunetul-țintă (`mark`) — restul
// rămâne text simplu, negru, ca să nu „trădeze" culoarea corectă (WordRenderer,
// motorul real de colorare, NU e folosit aici, intenționat).
function MarkedPlainWord({ word, mark }: { word: string; mark: string }) {
  const idx = word.toLowerCase().indexOf(mark.toLowerCase())
  if (idx === -1) return <>{word}</>
  return (
    <>
      {word.slice(0, idx)}
      <span className="pingpong-word-mark">{word.slice(idx, idx + mark.length)}</span>
      {word.slice(idx + mark.length)}
    </>
  )
}

export default function PingPongGame() {
  const [score, setScore]   = useState(0)
  const [misses, setMisses] = useState(0)

  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr')
  const [current, setCurrent]     = useState<PoolWord>(() => pickWord(null))
  const [options, setOptions]     = useState<string[]>(() => pickOptions(current.color))
  const [travelling, setTravelling] = useState(false)
  const [resolved, setResolved]     = useState(false)
  const [feedback, setFeedback]     = useState<'correct' | 'wrong' | null>(null)
  const [roundKey, setRoundKey]     = useState(0)

  const spawnTimer = useRef<number | undefined>(undefined)

  // ── pornește traversarea unei bule noi. Cheia `roundKey` forțează
  //    remontarea elementului .pingpong-bubble, ca poziția de start să nu
  //    „sară" vizual prin tranziția CSS de la runda anterioară. ──
  const spawnNext = useCallback(() => {
    setDirection(d => (d === 'ltr' ? 'rtl' : 'ltr'))
    setCurrent(prev => {
      const next = pickWord(prev.lessonId)
      setOptions(pickOptions(next.color))
      return next
    })
    setResolved(false)
    setFeedback(null)
    setRoundKey(k => k + 1)
    setTravelling(false)
  }, [])

  // pornește traversarea la montare și după fiecare remontare (roundKey nou) —
  // dublu rAF, ca browserul să apuce să deseneze poziția de start înainte
  // să înceapă tranziția spre poziția finală.
  useEffect(() => {
    let raf1 = 0, raf2 = 0
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setTravelling(true))
    })
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
  }, [roundKey])

  useEffect(() => () => window.clearTimeout(spawnTimer.current), [])

  const handleMiss = useCallback((e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== 'left' || resolved) return
    setResolved(true)
    setMisses(m => m + 1)
    spawnTimer.current = window.setTimeout(spawnNext, MISS_PAUSE_MS)
  }, [resolved, spawnNext])

  const handleAnswer = useCallback((color: string) => {
    if (resolved) return
    const isCorrect = color === current.color
    if (isCorrect) {
      setResolved(true)
      setFeedback('correct')
      setScore(s => s + 1)
      spawnTimer.current = window.setTimeout(spawnNext, CORRECT_PAUSE_MS)
    } else {
      // răspuns greșit — bula NU se oprește, copilul mai poate încerca
      setFeedback('wrong')
      window.setTimeout(() => setFeedback(f => (f === 'wrong' ? null : f)), 350)
    }
  }, [resolved, current.color, spawnNext])

  const mascotState: MascotState = feedback === 'correct' ? 'clapping' : 'idle'

  const startLeft = direction === 'ltr' ? '0%' : 'calc(100% - 150px)'
  const endLeft   = direction === 'ltr' ? 'calc(100% - 150px)' : '0%'

  return (
    <main className="pingpong-page">
      <div className="pingpong-top-row">
        <Link href="/learn" className="pingpong-back-link">← Înapoi la lecții</Link>
        <div className="pingpong-score">Scor: <strong>{score}</strong></div>
      </div>

      <p className="pingpong-title">🏓 EiC2 · Recapitulare</p>
      <p className="pingpong-instructions">
        Apasă culoarea corectă a sunetului subliniat, înainte ca bula să iasă din ecran.
      </p>

      <div className="pingpong-track">
        <div
          key={roundKey}
          className={`pingpong-bubble ${feedback === 'correct' ? 'is-correct' : ''} ${feedback === 'wrong' ? 'is-wrong' : ''}`}
          style={{
            transitionDuration: `${CROSS_DURATION_MS}ms`,
            left: travelling ? endLeft : startLeft,
          }}
          onTransitionEnd={handleMiss}
        >
          <MarkedPlainWord word={current.word} mark={current.mark} />
        </div>
      </div>

      <div className="pingpong-options" role="group" aria-label="Alege culoarea corectă">
        {options.map((color, i) => (
          <button
            key={`${color}-${i}`}
            type="button"
            className="pingpong-option"
            style={{ background: color }}
            onClick={() => handleAnswer(color)}
            aria-label={COLOR_LABEL[color] ?? 'culoare'}
          />
        ))}
      </div>

      <div className="pingpong-footer">
        <Mascot state={mascotState} size={72} />
        <p className="pingpong-misses">Rateuri: {misses}</p>
      </div>
    </main>
  )
}
