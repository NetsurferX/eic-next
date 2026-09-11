'use client'

import { useEffect, useRef, useState } from 'react'
import { speakWord } from '@/lib/speak'
import type { Accent } from '@/lib/levels'
import { Mascot } from './Mascot'

interface Props {
  phoneme: string       // sunetul afișat în capul coloanei — fără slash-uri, ex. 'ʌ'
  exampleWord: string   // primul cuvânt din lecție, folosit ca demo
  color: string         // culoarea EiC a sunetului (SOUND_COLORS)
  colorName?: string    // numele culorii în română (Lesson.tabLabel) — pt. mesajul vulpii "Roșu = /i/"
  matchWord?: string    // cuvânt-purtător TTS pt. sunetul izolat (vezi Lesson.matchWord) — dacă lipsește, cade back pe exampleWord
  accent: Accent        // accentul CORECT de redare pentru acest cuvânt/lecție
  onComplete: () => void
}

type Stage = 'matching' | 'listening' | 'speaking' | 'done'

const MATCH_REPS = 4          // de câte ori se aude sunetul izolat, sincron cu vibrația
const MATCH_GAP_MS = 380      // pauză între repetiții (după ce se termină redarea)
const MATCH_START_DELAY_MS = 400

// Micro-demo animat, afișat o singură dată per lecție ("prima dată când
// elevul deschide o categorie nouă de sunet" — vezi triggerul din
// learn/page.tsx). Nu face parte din motorul de randare (WordRenderer) —
// e strict un pas pedagogic de introducere.
//
// Etape:
//  1. 'matching'  — cerc mare cu un pătrat colorat care vibrează, lângă
//                   simbolul sunetului (tot vibrând); sunetul izolat
//                   (aproximat prin TTS — matchWord) se aude de 4 ori,
//                   ca elevul să asocieze direct culoarea cu sunetul.
//                   Vulpea poate adăuga "Roșu = /i/" (colorName + phoneme).
//  2. 'listening' — pauză scurtă înainte de a rosti cuvântul exemplu.
//  3. 'speaking'  — vulpea rostește cuvântul exemplu întreg, cu accentul corect.
//  4. 'done'      — elevul poate închide oricând cu "Am înțeles" (auto-
//                   completat și dacă lasă demo-ul să ruleze până la capăt).
export function OnboardingSoundIntro({ phoneme, exampleWord, color, colorName, matchWord, accent, onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('matching')
  const [pulseTick, setPulseTick] = useState(0)   // incrementat la fiecare redare — key pt. a re-porni animația CSS
  const stopRef = useRef<(() => void) | null>(null)
  const cancelledRef = useRef(false)

  // ── Etapa 1: 'matching' — 4 repetiții ale sunetului izolat, sincron cu vibrația ──
  useEffect(() => {
    cancelledRef.current = false
    setStage('matching')
    setPulseTick(0)

    const soundToMatch = matchWord ?? exampleWord
    let repsDone = 0

    const runRep = () => {
      if (cancelledRef.current) return
      setPulseTick(t => t + 1)
      const { promise, stop } = speakWord(soundToMatch, { accent })
      stopRef.current = stop
      promise.then(() => {
        if (cancelledRef.current) return
        repsDone += 1
        if (repsDone < MATCH_REPS) {
          setTimeout(runRep, MATCH_GAP_MS)
        } else {
          setTimeout(() => {
            if (!cancelledRef.current) setStage('listening')
          }, MATCH_GAP_MS)
        }
      })
    }

    const startTimer = setTimeout(runRep, MATCH_START_DELAY_MS)

    return () => {
      cancelledRef.current = true
      clearTimeout(startTimer)
      stopRef.current?.()
      stopRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exampleWord, matchWord, accent])

  // ── Etapele 2-3: 'listening' → 'speaking' → 'done' (cuvântul exemplu întreg) ──
  useEffect(() => {
    if (stage !== 'listening') return
    const timer = setTimeout(() => {
      setStage('speaking')
      const { promise, stop } = speakWord(exampleWord, { accent })
      stopRef.current = stop
      promise.then(() => setStage('done'))
    }, 550)

    return () => {
      clearTimeout(timer)
      stopRef.current?.()
      stopRef.current = null
    }
  }, [stage, exampleWord, accent])

  const isMatching = stage === 'matching'
  const foxState = isMatching ? 'pointing' : stage === 'speaking' ? 'pointing' : stage === 'done' ? 'clapping' : 'idle'

  return (
    <div className="sound-intro-card">
      <Mascot state={foxState} size={72} className="sound-intro-mascot" />

      {isMatching ? (
        <>
          <p className="sound-intro-label">Un sunet nou</p>
          <div className="sound-match-row">
            <span key={`p-${pulseTick}`} className="sound-match-phoneme" style={{ color }}>{phoneme}</span>
            <span className="sound-match-equals" aria-hidden="true">=</span>
            <span className="sound-match-circle">
              <span key={`s-${pulseTick}`} className="sound-match-square" style={{ background: color }} />
            </span>
          </div>
          {colorName && (
            <p className="sound-match-caption" style={{ color }}>{colorName} = /{phoneme}/</p>
          )}
        </>
      ) : (
        <>
          <p className="sound-intro-label">Un sunet nou</p>
          <span className="sound-intro-phoneme" style={{ color }}>{phoneme}</span>
          <p className="sound-intro-word" style={{ color }}>{exampleWord}</p>
        </>
      )}

      <button
        className="sound-intro-btn"
        style={{ background: color }}
        onClick={onComplete}
      >
        Am înțeles
      </button>
    </div>
  )
}
