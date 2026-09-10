'use client'

import { useEffect, useRef, useState } from 'react'
import { speakWord } from '@/lib/speak'
import type { Accent } from '@/lib/levels'
import { Mascot } from './Mascot'

interface Props {
  phoneme: string       // sunetul afișat în capul coloanei — fără slash-uri, ex. 'ʌ'
  exampleWord: string   // primul cuvânt din lecție, folosit ca demo
  color: string         // culoarea EiC a sunetului (SOUND_COLORS)
  accent: Accent        // accentul CORECT de redare pentru acest cuvânt/lecție
  onComplete: () => void
}

type Stage = 'listening' | 'speaking' | 'done'

// Micro-demo animat, afișat o singură dată per lecție ("prima dată când
// elevul deschide o categorie nouă de sunet" — vezi triggerul din
// learn/page.tsx). Nu face parte din motorul de randare (WordRenderer) —
// e strict un pas pedagogic de introducere: vulpea "ascultă" sunetul nou,
// apoi îl rostește cu accentul corect, iar elevul poate închide oricând cu
// "Am înțeles" (auto-completat și dacă lasă demo-ul să ruleze până la capăt).
export function OnboardingSoundIntro({ phoneme, exampleWord, color, accent, onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('listening')
  const stopRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    setStage('listening')
    const startTimer = setTimeout(() => {
      setStage('speaking')
      const { promise, stop } = speakWord(exampleWord, { accent })
      stopRef.current = stop
      promise.then(() => setStage('done'))
    }, 550)

    return () => {
      clearTimeout(startTimer)
      stopRef.current?.()
      stopRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exampleWord, accent])

  return (
    <div className="sound-intro-card">
      <Mascot
        state={stage === 'speaking' ? 'talking' : stage === 'done' ? 'clapping' : 'idle'}
        size={72}
        className="sound-intro-mascot"
      />
      <p className="sound-intro-label">Un sunet nou</p>
      <span className="sound-intro-phoneme" style={{ color }}>{phoneme}</span>
      <p className="sound-intro-word" style={{ color }}>{exampleWord}</p>
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
