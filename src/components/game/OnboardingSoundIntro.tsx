'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { speakWord } from '@/lib/speak'
import type { Accent } from '@/lib/levels'
import type { RenderNode } from '@/lib/renderNode'
import WordRenderer from '@/components/WordRenderer'
import { Mascot } from './Mascot'
import { ringify } from '@/components/SymbolText'

export interface DemoWord {
  text: string
  mark?: string          // substring-ul care poartă sunetul (ex. 'u' în 'bug', 'gh' în 'laugh')
  nodes?: RenderNode[]   // dacă există: cuvântul se randează cu motorul real (culori, subliniere); mark-ul e subțire până la absorbție
  accent?: Accent        // override de accent pentru acest cuvânt
}

interface Props {
  phoneme: string        // simbolul de bază afișat sus (ex. 'a', 'f')
  words: DemoWord[]      // cuvintele demo, de sus în jos
  color: string          // culoarea EiC a sunetului
  matchWord?: string     // text TTS / înregistrare pt. sunetul izolat; dacă lipsește, primul cuvânt
  accent: Accent
  onComplete: () => void
}

type Phase = 'sound' | 'flow' | 'word' | 'done'

const REPS = 3
const GAP_MS = 380
const START_DELAY_MS = 500
const FLOW_MS = 1300
const SQUARE_PX = 26
const MARK_SEL = '[data-mark], .eic-pulse, .eic-pulse-keep'

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function pulse(els: Iterable<Element | null | undefined>) {
  if (reduced()) return
  for (const el of els) {
    el?.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.32)', offset: 0.35 },
        { transform: 'scale(.96)', offset: 0.65 },
        { transform: 'scale(1)' },
      ],
      { duration: 520, easing: 'ease-in-out' },
    )
  }
}

function unionCenter(els: Element[]) {
  const rs = els.map(e => e.getBoundingClientRect())
  const l = Math.min(...rs.map(r => r.left)), r = Math.max(...rs.map(r => r.right))
  const t = Math.min(...rs.map(r => r.top)), b = Math.max(...rs.map(r => r.bottom))
  return { x: (l + r) / 2, y: (t + b) / 2 }
}

// Un singur ecran „Un sunet nou":
//  1. 'sound' — simbolul colorat pulsează și se aude de 3 ori (literele-țintă subțiri din cuvinte pulsează odată cu el).
//  2. 'flow'  — din simbol curge câte un pătrat colorat spre fiecare literă/grup țintă; abia după absorbție se colorează.
//  3. 'word'  — fiecare cuvânt se aude de 3 ori; simbolul și litera-țintă pulsează în ritmul rostirii.
//  4. 'done'  — vulpea aplaudă; „ok".
// Literele-țintă sunt aliniate pe verticală sub simbol.
export function OnboardingSoundIntro({ phoneme, words, color, matchWord, accent, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('sound')
  const [absorbed, setAbsorbed] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)
  const symRef = useRef<HTMLSpanElement>(null)
  const wrapRefs = useRef<(HTMLSpanElement | null)[]>([])
  const sqRefs = useRef<(HTMLSpanElement | null)[]>([])
  const wordsRef = useRef(words)
  wordsRef.current = words

  const sig = words.map(w => `${w.text}|${w.mark ?? ''}`).join(',')
  const nodeSig = words.map(w => (w.nodes ? 1 : 0)).join('')

  const targetsOf = (wi: number): HTMLElement[] =>
    Array.from(wrapRefs.current[wi]?.querySelectorAll<HTMLElement>(MARK_SEL) ?? [])

  // Aliniază literele-țintă sub simbol (măsurat; compensează scara animației de intrare a cardului).
  useLayoutEffect(() => {
    const card = cardRef.current, sym = symRef.current
    if (!card || !sym) return
    wordsRef.current.forEach((_, wi) => {
      const wrap = wrapRefs.current[wi]
      const ts = targetsOf(wi)
      if (!wrap || !ts.length) return
      wrap.style.transform = ''
      const s = card.getBoundingClientRect().width / (card.offsetWidth || 1) || 1
      const sc = unionCenter([sym]), mc = unionCenter(ts)
      wrap.style.transform = `translateX(${(sc.x - mc.x) / s}px)`
    })
  }, [absorbed, nodeSig, sig])

  useEffect(() => {
    let cancelled = false
    let stop: (() => void) | null = null
    const anims: Animation[] = []
    const timers: ReturnType<typeof setTimeout>[] = []
    const sleep = (ms: number) => new Promise<void>(res => { timers.push(setTimeout(res, ms)) })
    const frames = () => new Promise<void>(res => requestAnimationFrame(() => requestAnimationFrame(() => res())))

    const say = async (text: string, acc: Accent, onStart: () => void) => {
      if (cancelled) return
      onStart()
      const s = speakWord(text, { accent: acc })
      stop = s.stop
      await Promise.race([s.promise, sleep(4500)])
    }

    const flow = async () => {
      const card = cardRef.current, sym = symRef.current
      if (!card || !sym) return
      const s = card.getBoundingClientRect().width / (card.offsetWidth || 1) || 1
      const c = card.getBoundingClientRect()
      const a = unionCenter([sym])
      const ax = (a.x - c.left) / s - SQUARE_PX / 2
      const ay = (a.y - c.top) / s - SQUARE_PX / 2
      wordsRef.current.forEach((_, wi) => {
        const sq = sqRefs.current[wi], ts = targetsOf(wi)
        if (!sq || !ts.length) return
        const m = unionCenter(ts)
        const bx = (m.x - c.left) / s - SQUARE_PX / 2
        const by = (m.y - c.top) / s - SQUARE_PX / 2
        anims.push(sq.animate(
          [
            { transform: `translate(${ax}px, ${ay}px) scale(.3)`, opacity: 0 },
            { transform: `translate(${ax}px, ${ay}px) scale(1)`, opacity: 1, offset: 0.18 },
            { transform: `translate(${bx}px, ${by}px) scale(1)`, opacity: 1, offset: 0.86 },
            { transform: `translate(${bx}px, ${by}px) scale(.15)`, opacity: 0 },
          ],
          { duration: FLOW_MS, easing: 'ease-in-out', fill: 'forwards' },
        ))
      })
      await sleep(FLOW_MS + 100)
    }

    const run = async () => {
      setPhase('sound'); setAbsorbed(false)
      await sleep(START_DELAY_MS)
      const ws = wordsRef.current
      if (!ws.length) return

      // 1. sunetul izolat ×3 — simbolul pulsează; literele-țintă subțiri pulsează odată cu el
      const isolated = matchWord ?? ws[0].text
      for (let r = 0; r < REPS; r++) {
        await say(isolated, ws[0].accent ?? accent, () => {
          pulse([symRef.current])
          ws.forEach((w, wi) => { if (w.nodes) pulse(targetsOf(wi)) })
        })
        if (cancelled) return
        await sleep(GAP_MS)
      }
      if (cancelled) return

      // 2. pătratele curg din simbol în literele-țintă
      setPhase('flow')
      await flow()
      if (cancelled) return
      setAbsorbed(true)
      await frames()
      if (cancelled) return
      pulse(ws.flatMap((_, wi) => targetsOf(wi)))
      await sleep(450)
      if (cancelled) return

      // 3. fiecare cuvânt ×3, simbol + literă-țintă pulsează în ritm
      setPhase('word')
      for (let wi = 0; wi < ws.length; wi++) {
        for (let r = 0; r < REPS; r++) {
          await say(ws[wi].text, ws[wi].accent ?? accent, () => { pulse([symRef.current]); pulse(targetsOf(wi)) })
          if (cancelled) return
          await sleep(GAP_MS)
        }
      }
      if (!cancelled) setPhase('done')
    }
    void run()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      stop?.()
      anims.forEach(a => a.cancel())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, matchWord, accent])

  const foxState = phase === 'done' ? 'clapping' : phase === 'sound' ? 'pointing' : 'idle'

  return (
    <div className="sound-intro-card sound-intro-card--flow" ref={cardRef}>
      <Mascot state={foxState} size={72} className="sound-intro-mascot" />
      <p className="sound-intro-label">Un sunet nou</p>

      <span ref={symRef} className="sound-intro-phoneme sound-flow-phoneme" style={{ color }}>
        {ringify(phoneme)}
      </span>

      <div className="sound-flow-words">
        {words.map((w, wi) => {
          const i = w.mark ? w.text.indexOf(w.mark) : -1
          const hasMark = i >= 0 && !!w.mark
          return (
            <div className="sound-intro-word sound-flow-word" key={w.text}>
              <span
                ref={el => { wrapRefs.current[wi] = el }}
                className={`sound-flow-wordwrap${absorbed ? '' : ' is-neutral'}`}
              >
                {w.nodes && hasMark ? (
                  <WordRenderer
                    nodes={w.nodes}
                    wordStr={w.text}
                    pulseRange={[i, i + w.mark!.length]}
                    pulseKeep={absorbed}
                  />
                ) : hasMark ? (
                  <>
                    {w.text.slice(0, i)}
                    <span data-mark className="sound-flow-mark" style={absorbed ? { color } : undefined}>{w.mark}</span>
                    {w.text.slice(i + w.mark!.length)}
                  </>
                ) : (
                  w.text
                )}
              </span>
            </div>
          )
        })}
      </div>

      {words.map((w, wi) => (
        <span
          key={`sq-${w.text}`}
          ref={el => { sqRefs.current[wi] = el }}
          className="sound-flow-square"
          style={{ background: color }}
          aria-hidden="true"
        />
      ))}

      <button className="sound-intro-btn" style={{ background: color }} onClick={onComplete}>
        ok
      </button>
    </div>
  )
}
