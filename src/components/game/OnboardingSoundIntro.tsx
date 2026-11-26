'use client'

import { useEffect, useRef, useState } from 'react'
import { speakWord } from '@/lib/speak'
import type { Accent } from '@/lib/levels'
import { Mascot } from './Mascot'
import { ringify } from '@/components/SymbolText'

interface Props {
  phoneme: string       // sunetul afișat sus — fără slash-uri, ex. 'a'
  exampleWord: string   // cuvântul exemplu folosit ca demo (ex. 'bug')
  exampleMark?: string  // substring-ul din exampleWord care poartă sunetul (ex. 'u' în 'bug')
  color: string         // culoarea EiC a sunetului
  matchWord?: string    // cuvânt-purtător TTS / înregistrare pt. sunetul izolat (Lesson.matchWord)
  accent: Accent        // accentul CORECT de redare pentru acest cuvânt/lecție
  onComplete: () => void
}

type Phase = 'sound' | 'flow' | 'word' | 'done'

const REPS = 3
const GAP_MS = 380
const START_DELAY_MS = 500
const FLOW_MS = 1300
const SQUARE_PX = 26

// Un singur ecran „Un sunet nou":
//  1. 'sound' — simbolul colorat (ex. a verde) pulsează și se aude de 3 ori.
//  2. 'flow'  — din simbol curge un pătrat colorat care e absorbit de litera
//               care poartă sunetul în cuvânt (u din bug); abia apoi se colorează.
//  3. 'word'  — cuvântul se aude de 3 ori; simbolul și litera pulsează în
//               ritmul fiecărei rostiri.
//  4. 'done'  — vulpea aplaudă; elevul apasă „ok".
export function OnboardingSoundIntro({ phoneme, exampleWord, exampleMark, color, matchWord, accent, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('sound')
  const [symPulse, setSymPulse] = useState(0)      // key — repornește animația de puls a simbolului
  const [markPulse, setMarkPulse] = useState(0)    // key — idem pentru litera din cuvânt
  const [absorbed, setAbsorbed] = useState(false)  // litera devine colorată după absorbție

  const cardRef = useRef<HTMLDivElement>(null)
  const symRef = useRef<HTMLSpanElement>(null)
  const markRef = useRef<HTMLSpanElement>(null)
  const squareRef = useRef<HTMLSpanElement>(null)

  const i = exampleMark ? exampleWord.indexOf(exampleMark) : -1
  const hasMark = !!exampleMark && i >= 0

  useEffect(() => {
    let cancelled = false
    let stop: (() => void) | null = null
    let anim: Animation | null = null
    const timers: ReturnType<typeof setTimeout>[] = []

    const sleep = (ms: number) => new Promise<void>(res => { timers.push(setTimeout(res, ms)) })

    // Redă un text și așteaptă sfârșitul (cu plasă de siguranță dacă motorul audio nu răspunde).
    const say = async (text: string, onStart: () => void) => {
      if (cancelled) return
      onStart()
      const s = speakWord(text, { accent })
      stop = s.stop
      await Promise.race([s.promise, sleep(4500)])
    }

    const flow = async () => {
      const card = cardRef.current, from = symRef.current, to = markRef.current, sq = squareRef.current
      if (!card || !from || !to || !sq) return
      const c = card.getBoundingClientRect()
      const a = from.getBoundingClientRect()
      const b = to.getBoundingClientRect()
      const ax = a.left - c.left + a.width / 2 - SQUARE_PX / 2
      const ay = a.top - c.top + a.height / 2 - SQUARE_PX / 2
      const bx = b.left - c.left + b.width / 2 - SQUARE_PX / 2
      const by = b.top - c.top + b.height / 2 - SQUARE_PX / 2
      anim = sq.animate(
        [
          { transform: `translate(${ax}px, ${ay}px) scale(.3)`, opacity: 0 },
          { transform: `translate(${ax}px, ${ay}px) scale(1)`, opacity: 1, offset: 0.18 },
          { transform: `translate(${bx}px, ${by}px) scale(1)`, opacity: 1, offset: 0.86 },
          { transform: `translate(${bx}px, ${by}px) scale(.15)`, opacity: 0 },
        ],
        { duration: FLOW_MS, easing: 'ease-in-out', fill: 'forwards' },
      )
      await Promise.race([anim.finished.catch(() => {}), sleep(FLOW_MS + 300)])
    }

    const run = async () => {
      setPhase('sound'); setSymPulse(0); setMarkPulse(0); setAbsorbed(false)
      await sleep(START_DELAY_MS)

      // 1. sunetul izolat ×3, simbolul pulsează
      const isolated = matchWord ?? exampleWord
      for (let r = 0; r < REPS; r++) {
        await say(isolated, () => setSymPulse(t => t + 1))
        if (cancelled) return
        await sleep(GAP_MS)
      }
      if (cancelled) return

      // 2. pătratul curge din simbol în litera din cuvânt
      setPhase('flow')
      await flow()
      if (cancelled) return
      setAbsorbed(true)
      setMarkPulse(t => t + 1)
      await sleep(450)
      if (cancelled) return

      // 3. cuvântul ×3, simbol + literă pulsează în ritm
      setPhase('word')
      for (let r = 0; r < REPS; r++) {
        await say(exampleWord, () => { setSymPulse(t => t + 1); setMarkPulse(t => t + 1) })
        if (cancelled) return
        await sleep(GAP_MS)
      }
      if (!cancelled) setPhase('done')
    }
    void run()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      stop?.()
      anim?.cancel()
    }
  }, [exampleWord, matchWord, accent])

  const foxState = phase === 'done' ? 'clapping' : phase === 'sound' ? 'pointing' : 'idle'

  return (
    <div className="sound-intro-card sound-intro-card--flow" ref={cardRef}>
      <Mascot state={foxState} size={72} className="sound-intro-mascot" />
      <p className="sound-intro-label">Un sunet nou</p>

      <span
        key={`s-${symPulse}`}
        ref={symRef}
        className={`sound-intro-phoneme sound-flow-phoneme${symPulse ? ' is-pulsing' : ''}`}
        style={{ color }}
      >
        {ringify(phoneme)}
      </span>

      <p className="sound-intro-word sound-flow-word">
        {hasMark ? (
          <>
            {exampleWord.slice(0, i)}
            <span
              key={`m-${markPulse}`}
              ref={markRef}
              className={`sound-flow-mark${markPulse ? ' is-pulsing' : ''}`}
              style={absorbed ? { color } : undefined}
            >
              {exampleMark}
            </span>
            {exampleWord.slice(i + exampleMark!.length)}
          </>
        ) : (
          <span key={`m-${markPulse}`} ref={markRef} className={`sound-flow-mark${markPulse ? ' is-pulsing' : ''}`}>
            {exampleWord}
          </span>
        )}
      </p>

      <span ref={squareRef} className="sound-flow-square" style={{ background: color }} aria-hidden="true" />

      <button className="sound-intro-btn" style={{ background: color }} onClick={onComplete}>
        ok
      </button>
    </div>
  )
}
