'use client'

import { useEffect, useState } from 'react'
import type { Lesson } from '@/lib/levels'
// Actualizare (2026-10-02): jocul montat e varianta cu pești. Revenire la baloane =
// import { BuleleVulpiiGame } from './BuleleVulpiiGame' + <BuleleVulpiiGame> mai jos.
import { BulelePestilorGame, type BulelePestilorLevel, type BulelePestilorResult } from './BulelePestilorGame'

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
  // După jocul cu pești la coloana „a”, apare cardul „Challenge - Read with EiC”.
  const [challenge, setChallenge] = useState(false)

  // Închide cu un fade scurt (nu instant) — folosit la sfârșitul jocului,
  // la „Sari peste" și la „Ieși" din joc, ca revenirea în /learn să nu
  // fie un pop brusc.
  function closeAndFinish() {
    if (config.lesson.id === 'a' && !challenge) {
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
      <style>{`.fox-helper { display: none !important; }`}</style>
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
// Card „Challenge - Read with EiC” (după jocul cu pești la coloana „a”).
// Propoziția e colorată literă cu literă, ca în codul EiC: e roșu (i),
// e portocaliu, „ou” roz (ɔ), o verde (ʌ), e gri (mut), y roșu (i),
// a albastru (æ, ca la „cat”). Consoanele rămân negre.
// ─────────────────────────────────────────────────────────────────────────
const C_RED = '#CC0000', C_ORANGE = '#EE5B00', C_PINK = '#FF3399'
const C_GREEN = '#008E40', C_GREY = '#8A8578', C_BLUE = '#00A2E0', C_INK = '#111'

const CHALLENGE_WORDS: Array<Array<[string, string]>> = [
  [['H', C_INK], ['e', C_RED]],
  [['h', C_INK], ['e', C_ORANGE], ['lps', C_INK]],
  [['f', C_INK], ['ou', C_PINK], ['r', C_INK]],
  [['l', C_INK], ['o', C_GREEN], ['v', C_INK], ['e', C_GREY], ['l', C_INK], ['y', C_RED]],
  [['c', C_INK], ['a', C_BLUE], ['ts', C_INK]],
]

function ReadChallengeCard({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="bulele-overlay-card read-challenge-card">
      <img
        className="read-challenge-fox"
        src="/mascot/v2/13_glasses_front.png"
        alt="Vulpea cu ochelari"
        width={140}
        height={140}
      />
      <p className="bulele-overlay-title">Challenge - Read with EiC</p>
      <p className="read-challenge-sentence" aria-label="He helps four lovely cats.">
        {CHALLENGE_WORDS.map((word, wi) => (
          <span key={wi} className="read-challenge-word">
            {word.map(([txt, color], si) => (
              <span key={si} style={{ color }}>{txt}</span>
            ))}
            {wi === CHALLENGE_WORDS.length - 1 ? '.' : ' '}
          </span>
        ))}
      </p>
      <div className="bulele-overlay-actions">
        <button className="bulele-overlay-skip" onClick={onContinue}>
          Continuă →
        </button>
      </div>
    </div>
  )
}
