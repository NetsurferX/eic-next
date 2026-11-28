'use client'

import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { speakWord, type Accent } from '@/lib/speak'
import type { Lesson } from '@/lib/levels'
// Actualizare (2026-10-02): jocul montat e varianta cu pești. Revenire la baloane =
// import { BuleleVulpiiGame } from './BuleleVulpiiGame' + <BuleleVulpiiGame> mai jos.
import { BulelePestilorGame, type BulelePestilorLevel, type BulelePestilorResult } from './BulelePestilorGame'
import { FoxFlight, type FlightOrigin } from './FoxFlight'

// ─────────────────────────────────────────────────────────────────────────
// Overlay full-screen deschis din /learn imediat după ce o coloană e
// completată — înlănțuie cele 2 sub-niveluri ale jocului (literă → cuvânt)
// dacă primul e trecut, și lasă un "Sari peste" dacă copilul e blocat sub
// pragul de 80%, ca să nu rămână agățat aici la nesfârșit.
//
// Vizual, refolosește rețeta lui .level-overlay din globals.css (fundal
// întunecat + blur, aceleași @keyframes de intrare) prin clasele noi
// .bulele-overlay* — nu mai e un modal cu stiluri proprii, izolate. ──
//
// Actualizare (2026-09-24): `onExit` din joc (butonul „Ieși" + confirmare)
// închide overlay-ul exact ca „Sari peste" (onDone) — coloana e oricum deja
// completată, deci ieșirea nu pierde progres. Cât timp overlay-ul e montat,
// dock-ul FoxHelper (position: fixed, z-index 70 — deasupra overlay-ului) e
// ascuns, ca pe ecran să fie o singură vulpe: cea din joc. ──
// Actualizare (2026-09-25): trecerea nivel 1 → nivel 2, ȘI continuarea
// lecției după nivelul 2 (sau sub prag), nu mai cer apăsare — o numărătoare
// inversă 5→1 pornește automat pasul următor; „Sari peste" rămâne un buton,
// pentru cazul sub prag, ca să nu aștepți numărătoarea dacă nu vrei.
// ─────────────────────────────────────────────────────────────────────────

export interface BuleleVulpiiOverlayConfig {
  lesson: Lesson
  distractorLessons: Lesson[]
  nextLesson: Lesson | null
  // Unde e medalionul vulpii din coloană (coordonate viewport) în clipa deschiderii. Dacă există,
  // vulpea zboară de acolo la vulpea din joc; dacă lipsește, jocul se deschide direct, ca înainte.
  fromRect?: FlightOrigin
}

export function BuleleVulpiiOverlay({
  config,
  onDone,
}: {
  config: BuleleVulpiiOverlayConfig
  onDone: () => void
}) {
  const [level, setLevel] = useState<BulelePestilorLevel>(1)
  const [result, setResult] = useState<BulelePestilorResult | null>(null)
  const [closing, setClosing] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  // După jocul cu pești la coloana „i”, apare cardul „Challenge - Read with EiC”.
  const [challenge, setChallenge] = useState(false)
  // Zborul vulpii de la medalion la joc: cât durează, vulpea din joc rămâne ascunsă (FoxFlight o arată la aterizare).
  const [flying, setFlying] = useState(!!config.fromRect)
  const handleLanded = useCallback(() => setFlying(false), [])

  // Închide cu un fade scurt (nu instant) — folosit la sfârșitul jocului,
  // la „Sari peste" și la „Ieși" din joc, ca revenirea în /learn să nu
  // fie un pop brusc.
  function closeAndFinish() {
    if (config.lesson.id === 'i' && !challenge) {
      setChallenge(true)
      return
    }
    setClosing(true)
    setTimeout(onDone, 260)
  }

  // Ce se întâmplă la finalul numărătorii: fie trece la nivelul următor
  // (rezultat OK, mai există un nivel), fie închide overlay-ul și continuă
  // lecția (nivelul 2 e gata, sau pragul nu a fost atins).
  const advancesLevel = !!result?.passed && level < 3

  useEffect(() => {
    if (!result) {
      setCountdown(null)
      return
    }
    setCountdown(5)
    const id = setInterval(() => {
      setCountdown(c => (c === null ? c : c - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [result, level])

  useEffect(() => {
    if (countdown !== 0 || challenge) return
    if (advancesLevel) {
      setLevel(l => (l + 1) as BulelePestilorLevel)
      setResult(null)
      setCountdown(null)
    } else {
      closeAndFinish()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown])

  return (
    <div
      className={`bulele-overlay${closing ? ' bulele-overlay-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Vulpea la pescuit"
    >
      {/* dock-ul FoxHelper stă deasupra overlay-ului — îl ascundem cât joacă */}
      {/* medalionul din coloană (în spatele overlay-ului) își ascunde vulpea cât joacă: ea e acum în joc;
          vulpea din joc rămâne ascunsă cât zboară cea de la medalion */}
      <style>{`.fox-helper { display: none !important; } .aik-corner .aik-corner-head { visibility: hidden !important; }${flying ? ' .pf-fox { visibility: hidden !important; }' : ''}`}</style>
      {flying && config.fromRect && <FoxFlight from={config.fromRect} onLand={handleLanded} />}
      {challenge ? (
        <ReadChallengeCard onContinue={closeAndFinish} />
      ) : (
      <div className="bulele-overlay-card">
        <p className="bulele-overlay-title">🐟 Vulpea la pescuit</p>
        <p className="bulele-overlay-sub">
          Ai terminat coloana {config.lesson.tabLabel.toLowerCase()} — hai să exersăm sunetul!
        </p>

        {/* key={level} → fiecare schimbare de nivel primește propriul fade-in,
            în loc să apară brusc peste jocul anterior */}
        <div key={level} className="bulele-game-fade">
          <BulelePestilorGame
            key={`${config.lesson.id}-${level}`}
            lesson={config.lesson}
            distractorLessons={config.distractorLessons}
            nextLesson={config.nextLesson}
            level={level}
            onFinish={setResult}
            onExit={closeAndFinish}
          />
        </div>

        {result && (
          <div className="bulele-overlay-actions">
            <p className="bulele-overlay-countdown">
              {advancesLevel ? `Nivel ${level + 1} începe în` : 'Lecția continuă în'}{' '}
              <span key={countdown} className="bulele-overlay-countdown-num">
                {countdown}
              </span>
              …
            </p>
            {!result.passed && (
              <button className="bulele-overlay-skip" onClick={closeAndFinish}>
                Sari peste
              </button>
            )}
          </div>
        )}
      </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Card „Challenge - Read with EiC” (după jocul cu pești la coloana „i”).
// Propoziția e colorată literă cu literă, ca în codul EiC: e roșu (i),
// e portocaliu, „ou” roz (ɔ), o verde (ʌ), e gri (mut), y roșu (i),
// a albastru (æ, ca la „cat”). Consoanele rămân negre.
// ─────────────────────────────────────────────────────────────────────────
const C_RED = '#CC0000', C_ORANGE = '#EE5B00', C_PINK = '#FF3399'
const C_GREEN = '#008E40', C_GREY = '#8A8578', C_BLUE = '#00A2E0', C_INK = '#111'

interface Vow { key: string; say: string; silent?: boolean; accent?: Accent }
type RawSeg = [string, string, Vow?]

// key = textul pentru speakWord (are înregistrare MP3 pentru it / egg / odd / æ).
const RAW: Array<{ speak: string; segs: RawSeg[] }> = [
  { speak: 'He', segs: [['H', C_INK], ['e', C_RED, { key: 'it', say: '/i/' }]] },
  { speak: 'helps', segs: [['h', C_INK], ['e', C_ORANGE, { key: 'egg', say: '/e/' }], ['lps', C_INK]] },
  { speak: 'four', segs: [['f', C_INK], ['ou', C_PINK, { key: 'odd', say: '/o/', accent: 'en-GB' }], ['r', C_INK]] },
  { speak: 'lovely', segs: [['l', C_INK], ['o', C_GREEN, { key: 'ah', say: '/a/' }], ['v', C_INK],
    ['e', C_GREY, { key: '', say: '', silent: true }], ['l', C_INK], ['y', C_RED, { key: 'it', say: '/i/' }]] },
  { speak: 'cats', segs: [['c', C_INK], ['a', C_BLUE, { key: 'æ', say: '/æ/', accent: 'en-GB' }], ['ts', C_INK]] },
]
let vowelCounter = 0
const CHALLENGE = RAW.map(w => ({
  speak: w.speak,
  segs: w.segs.map(([t, c, v]) => ({ t, c, v, idx: v ? vowelCounter++ : -1 })),
}))
const VOWELS = CHALLENGE.flatMap(w => w.segs).filter(s => s.idx >= 0)
const FULL_SENTENCE = 'He helps four lovely cats.'
const CHEERS = ['Your turn!', 'Say it with me!', 'Great, again in your head!', 'Wonderful!', 'You can do it!']

// Piciorul pozei „arată” (public/mascot/v2/14_glasses_point.png): vârful labei, ca fracție din imagine.
const PAW_X = 0.89, PAW_Y = 0.41

function ReadChallengeCard({ onContinue }: { onContinue: () => void }) {
  const [active, setActive] = useState<number | null>(null)
  const [wordLit, setWordLit] = useState<number | null>(null)
  const [say, setSay] = useState('')
  const [done, setDone] = useState(false)
  const [stick, setStick] = useState<{ x: number; y: number; len: number; deg: number } | null>(null)
  const [flip, setFlip] = useState(false)
  const [vowelPop, setVowelPop] = useState(true)   // true = doar vocala se umflă (arătarea vocalelor); false = citirea înceată: toate literele cuvântului, egal

  const stageRef = useRef<HTMLDivElement | null>(null)
  const foxRef = useRef<HTMLImageElement | null>(null)
  const vowelEls = useRef<(HTMLSpanElement | null)[]>([])
  const tokRef = useRef(0)

  // ── Bagheta: de la laba vulpii până deasupra vocalei active (vulpea se oglindește
  //    când vocala e în stânga ei). ──
  const measure = useCallback(() => {
    if (active === null) { setStick(null); return }
    const stage = stageRef.current, fox = foxRef.current, el = vowelEls.current[active]
    if (!stage || !fox || !el) return
    const sr = stage.getBoundingClientRect(), fr = fox.getBoundingClientRect(), vr = el.getBoundingClientRect()
    const tx = vr.left + vr.width / 2 - sr.left
    const ty = vr.top + vr.height / 2 - el.offsetHeight * 0.9 - 2 - sr.top   // deasupra literei umflate
    const foxCx = fr.left + fr.width / 2 - sr.left
    const flipped = tx < foxCx
    setFlip(flipped)
    const px = fr.left - sr.left + fr.width * (flipped ? 1 - PAW_X : PAW_X)
    const py = fr.top - sr.top + fr.height * PAW_Y
    setStick({ x: px, y: py, len: Math.hypot(tx - px, ty - py), deg: (Math.atan2(ty - py, tx - px) * 180) / Math.PI })
  }, [active])

  useEffect(() => {
    measure()
    const t = setTimeout(measure, 60)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(t); window.removeEventListener('resize', measure) }
  }, [measure])

  const run = useCallback(async () => {
    const tok = ++tokRef.current
    const alive = () => tokRef.current === tok
    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
    const until = (h: { promise: Promise<void> }, max: number) => Promise.race([h.promise, wait(max)])

    setDone(false); setActive(null); setWordLit(null); setVowelPop(true)

    // 1) Vulpea arată fiecare vocală (se umflă) și te îndeamnă s-o spui.
    setSay('Look! I point at each vowel — then you say it.')
    await wait(800); if (!alive()) return
    let n = 0
    for (const s of VOWELS) {
      if (!alive()) return
      setActive(s.idx)
      if (s.v!.silent) {
        setSay('Shhh… silent e! We do not say it.')
        await wait(930)
      } else {
        setSay(`Listen: ${s.v!.say}`)
        await wait(200); if (!alive()) return
        await until(speakWord(s.v!.key, { accent: s.v!.accent }), 3500)
        if (!alive()) return
        setSay(`${CHEERS[n++ % CHEERS.length]} Say ${s.v!.say}`)
        await wait(730)
      }
    }
    if (!alive()) return

    // 2) O dată rar, pe vocale: cuvânt cu cuvânt, vocalele se aprind pe rând.
    setActive(null)
    setVowelPop(false)
    setSay('Now we read slowly — vowel by vowel.')
    await wait(800)
    for (let wi = 0; wi < CHALLENGE.length; wi++) {
      if (!alive()) return
      const w = CHALLENGE[wi]
      setWordLit(wi)
      const h = speakWord(w.speak, { rate: 0.5 })
      for (const sg of w.segs) {
        if (sg.idx < 0) continue
        setActive(sg.idx)
        await wait(233)
        if (!alive()) return
      }
      await until(h, 3000)
      await wait(500)
    }
    setWordLit(null); setActive(null)
    if (!alive()) return

    // 3) O dată complet, toată propoziția.
    setSay('And now the whole sentence!')
    // la citirea cu ritm normal literele nu fac nimic (fără umflare, fără efecte)
    await wait(1500); if (!alive()) return
    await until(speakWord(FULL_SENTENCE), 6000)
    if (!alive()) return
    setSay('Great reading! 🎉')
    setDone(true)
  }, [])

  useEffect(() => {
    void run()
    return () => {
      tokRef.current++
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    }
  }, [run])

  return (
    <div className="bulele-overlay-card read-challenge-card">
      <p className="bulele-overlay-title">Challenge - Read with EiC</p>
      <p className="read-challenge-say" aria-live="polite">{say}</p>

      <div className="read-challenge-stage" ref={stageRef}>
        <img
          ref={foxRef}
          className={`read-challenge-fox${flip ? ' is-flipped' : ''}`}
          src="/mascot/v2/14_glasses_point.png"
          alt="Vulpea cu ochelari arată cu bagheta"
          width={150}
          height={150}
        />
        {stick && (
          <div
            className="read-challenge-stick"
            aria-hidden="true"
            style={{ left: stick.x, top: stick.y, width: stick.len, transform: `rotate(${stick.deg}deg)` }}
          />
        )}
        <p className="read-challenge-sentence" aria-label={FULL_SENTENCE}>
          {CHALLENGE.map((word, wi) => (
            <Fragment key={wi}>
            <span className={`read-challenge-word${wordLit === wi ? ' is-lit' : ''}`}>
              {word.segs.map((sg, si) =>
                sg.idx >= 0 ? (
                  <span
                    key={si}
                    ref={el => { vowelEls.current[sg.idx] = el }}
                    className={`rc-vowel${active === sg.idx && vowelPop ? ' is-on' : ''}`}
                    style={sg.c === C_GREEN ? { color: sg.c, textDecoration: 'underline', textDecorationColor: sg.c, textDecorationThickness: '.08em', textUnderlineOffset: '.12em' } : { color: sg.c }}
                  >{sg.t}</span>
                ) : (
                  <span key={si} style={{ color: sg.c }}>{sg.t}</span>
                )
              )}
            </span>
            {wi === CHALLENGE.length - 1 ? '.' : ' '}
            </Fragment>
          ))}
        </p>
      </div>

      <div className="bulele-overlay-actions">
        {done && (
          <button className="bulele-overlay-skip" onClick={() => void run()}>↺ Again</button>
        )}
        <button className="bulele-overlay-skip read-challenge-next" onClick={onContinue}>Next →</button>
      </div>
    </div>
  )
}
