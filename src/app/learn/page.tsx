'use client'

import { speakWord, warmUpVoices } from '@/lib/speak'
import { playStarChime, playLevelFanfare } from '@/lib/sound'
import { LEVELS, STORAGE_KEY, REPS_PER_LESSON, type SavedProgress, type Lesson, type LessonWord, type Accent } from '@/lib/levels'
import { Cup, Confetti } from '@/components/game/Cup'
import { Mascot } from '@/components/game/Mascot'
import { FoxHelper, type FoxTip, type FoxMood } from '@/components/game/FoxHelper'
import { useState, useCallback, useEffect, useRef, useMemo, type CSSProperties } from 'react'
import Link from 'next/link'
import { tricolorLetterStyle, TRICOLOR_UNDERLINE_COLOR, TRICOLOR_BANDS, TRICOLOR_CSS_HORIZONTAL } from '@/lib/tricolorStyle'

const POP_DURATION_MS = 5000    // how long the per-column cup→star pop animation plays
const LEVEL_POP_MS = 1800       // how long the big level-cup celebration plays
const REVEAL_MS = 900           // how long a freshly-unlocked column's reveal-in animation plays
const STAR_FLIGHT_MS = 112100     // how long the star takes to fly from the button into the cup
const AUTO_DELAY_MS = 1650      // default gap between words — user-adjustable via the speed slider
const AUTO_DELAY_KEY = 'eic-auto-delay-ms'
const REVIEW_THRESHOLD = 3      // clicking one word this many times sends it to "Cuvinte de exersat"

// Alege accentul efectiv al unui cuvânt: override-ul cuvântului > accentul
// coloanei > 'en-US' implicit.
const resolveAccent = (w: { accent?: Accent }, l: { accent?: Accent }): Accent =>
  w.accent ?? l.accent ?? 'en-US'

// Numărătoare grosieră de silabe, doar ca să decidem dacă un cuvânt e
// monosilabic (caz în care sublinierea accentului dispare complet — regula
// 4.2 din protocolul fonologic — dar culoarea rămâne).
function countSyllables(word: string): number {
  const w = word.toLowerCase()
  const groups = w.match(/[aeiouy]+/g)
  let count = groups ? groups.length : 1
  if (w.endsWith('e') && !w.endsWith('le') && count > 1) count--
  return Math.max(count, 1)
}

// /ɔɪ/ off-glide diacritic (Vulpea șireată legend: "boỷ=ỉ") — the print
// reference marks the SECOND letter of the "oy"/"oi" spelling with a
// diacritic instead of a plain letter: 'y' → 'ỷ' ("boy" → "boỷ"), 'i' → 'ỉ'
// ("point"/"coin" → "poỉnt"/"coỉn"). Scoped to lesson id 'oi' only — this is
// the one column the reference book shows this for; other diphthong columns
// (ai/au/ei/ju) aren't confirmed against the book yet, so left untouched.
// Per Dorel's request, the diacritic letter is ALSO its own colour — red
// #CC0000, distinct from the column's magenta (var(--lesson-color)) that
// the rest of "oy"/"oi" keeps. Matches engine/display.ts's OFFGLIDE_COLOR.
const OFFGLIDE_DIACRITIC: Record<string, string> = { y: 'ỷ', Y: 'Ỷ', i: 'ỉ', I: 'Ỉ' }
const OFFGLIDE_COLOR = '#CC0000'

// Randează un cuvânt colorând + subliniind DOAR grupul-țintă (mark). w și y
// au statut de vocală (ca a/e/i/o/u) — deci literele colorate ȘI subliniate
// din interiorul mark-ului sunt vocale+w+y; consoanele adevărate rămân
// negre/gri, niciodată colorate. La cuvinte monosilabice sublinierea
// dispare complet, culoarea rămâne.
function MarkedWord({ text, mark, lessonId, isLocked, isPlaying }: { text: string; mark: string; lessonId?: string; isLocked?: boolean; isPlaying?: boolean }) {
  const idx = text.toLowerCase().indexOf(mark.toLowerCase())
  const isMonosyllabic = countSyllables(text) === 1

  if (idx === -1) return <>{text}</>

  const markEnd  = idx + mark.length
  const before   = text.slice(0, idx)
  const markText = text.slice(idx, markEnd)
  const after    = text.slice(markEnd)
  const isVowelLike = (ch: string) => /[aeiouwy]/i.test(ch) // vocale + w + y — colorare ȘI underline

  // Doar coloana 'oi' (/ɔɪ/): ultima literă a mark-ului ('y' sau 'i') se
  // afișează cu diacritic ȘI cu propria culoare roșie, restul mark-ului
  // (ex. 'o') rămâne pe culoarea coloanei (magenta).
  const diacriticIdx = lessonId === 'oi' && markText.length > 0
    ? markText.length - 1
    : -1

  // Coloana 'ou' (/əʊ/): engine/display.ts randează acest sunet mereu cu
  // tricolorul românesc (albastru/galben/roșu, gradient vertical pe
  // fereastra de cerneală a fontului), niciodată galben plat — vezi
  // TRICOLOR_GRADIENT_SOUNDS din display.ts și lib/tricolorStyle.ts.
  // Fiecare literă a mark-ului își ia propriul ciclu tricolor complet
  // (verificat pe "Vulpea șireată" — "oa"/"ow" nu întind un singur
  // gradient pe ambele litere). Coloanele blocate rămân pe stilul vechi
  // (culoare plată, estompată de CSS) ca să nu se "trădeze" prin gradient.
  const isTricolorLesson = lessonId === 'ou' && !isLocked

  return (
    <>
      {before}
      {[...markText].map((ch, i) => {
        const vowelLike = isVowelLike(ch)

        if (isTricolorLesson && vowelLike) {
          const underline = !isMonosyllabic
          return (
            <span
              key={i}
              style={{
                ...tricolorLetterStyle(),
                // `currentColor` (used by .lesson-word.is-playing's glow
                // rule) is 'transparent' here since the gradient fill sets
                // color:transparent — so the playing-glow needs its own
                // explicit white drop-shadow instead of relying on the
                // shared CSS class.
                ...(isPlaying ? { filter: 'drop-shadow(0 0 3px #fff) drop-shadow(0 0 8px #FCD116)' } : {}),
                ...(underline
                  ? {
                      textDecoration: 'underline',
                      textDecorationColor: TRICOLOR_UNDERLINE_COLOR,
                      textUnderlineOffset: '4.7px',
                      textDecorationThickness: '2px',
                    }
                  : {}),
              }}
            >
              {ch}
            </span>
          )
        }

        const classes = [
          vowelLike ? 'lesson-word-mark' : '',
          vowelLike && !isMonosyllabic ? 'lesson-word-mark-underline' : '',
        ].filter(Boolean).join(' ')
        const isDiacritic = i === diacriticIdx
        const display = isDiacritic ? (OFFGLIDE_DIACRITIC[ch] ?? ch) : ch
        const style = isDiacritic ? { color: OFFGLIDE_COLOR } : undefined
        return <span key={i} className={classes || undefined} style={style}>{display}</span>
      })}
      {after}
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
  // Coloana căreia îi aparține playingWord — necesar ca să nu se aprindă
  // vizual un cuvânt dintr-o altă coloană care are întâmplător același text
  // (ex. "the" poate apărea în mai multe lecții).
  const [playingColId, setPlayingColId]     = useState<string | null>(null)
  const [isPlayingRep, setIsPlayingRep]     = useState(false)
  const [poppingStarIndex, setPoppingStarIndex] = useState<number | null>(null)
  const [celebrating, setCelebrating]       = useState(false)
  const [freePracticeCount, setFreePracticeCount] = useState(0)

  // ── Level-scope celebration state ──
  const [levelCelebrating, setLevelCelebrating]   = useState(false)
  const [showLevelOverlay, setShowLevelOverlay]   = useState(false)
  const [justRevealedIndex, setJustRevealedIndex] = useState<number | null>(null)

  // ── Steaua zburătoare — apare pe butonul „Repetă" chiar când o repetiție
  //   se termină cu succes, crește scurt, apoi zboară vizual spre cupa
  //   coloanei active și dispare acolo (cupa oricum se umple singură,
  //   printr-o tranziție CSS proprie, de îndată ce starsEarned crește —
  //   asta e doar „mesagerul" vizual dintre buton și cupă). Poziția de
  //   start/sosire vine din getBoundingClientRect pe butonul activ, respectiv
  //   pe wrapper-ul cupei coloanei — calculate o singură dată, în momentul
  //   în care se câștigă steaua, nu urmărite continuu. ──
  const [flyingStar, setFlyingStar] = useState<{ id: number; fromX: number; fromY: number; toX: number; toY: number; color: string } | null>(null)
  const flyingStarIdRef = useRef(0)
  const activeBtnRef = useRef<HTMLButtonElement | null>(null)
  const cupRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // ── Resetarea completă a jocului (buton + modal de confirmare) ──
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // ── Viteza între cuvinte — ajustabilă prin slider, persistă în localStorage ──
  const [autoDelayMs, setAutoDelayMs] = useState(AUTO_DELAY_MS)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTO_DELAY_KEY)
      if (saved) setAutoDelayMs(Number(saved))
    } catch { /* ignore */ }
  }, [])
  useEffect(() => {
    try { localStorage.setItem(AUTO_DELAY_KEY, String(autoDelayMs)) } catch { /* ignore */ }
  }, [autoDelayMs])

  // ── Cuvinte de exersat — un cuvânt apăsat individual de REVIEW_THRESHOLD
  //   ori ajunge automat aici, ca semn că pare dificil pentru cel care învață ──
  const [wordClickCounts, setWordClickCounts] = useState<Record<string, number>>({})
  // HYDRATION FIX (2026-08-30): asta era inițializat printr-un lazy
  // initializer care citea localStorage direct în useState(() => ...),
  // spre deosebire de restul stărilor din fișier (vezi autoDelayMs mai sus)
  // care toate încarcă din localStorage într-un useEffect după montare.
  // Efectul practic: pe server reviewWords era mereu [] (localStorage nu
  // există), dar la PRIMUL render pe client lazy-initializer-ul chiar citea
  // valoarea salvată dintr-o vizită anterioară — dacă exista vreun cuvânt
  // de exersat, acel prim render de client producea markup diferit de cel
  // trimis de server (blocul <div className="review-panel"> apărea doar pe
  // client), exact mismatch-ul din eroarea de hidratare. Aliniat acum la
  // același tipar cu celelalte: default gol, încărcare reală în useEffect.
  const [reviewWords, setReviewWords] = useState<{ word: string; colId: string; accent: Accent }[]>([])
  useEffect(() => {
    try {
      const raw = localStorage.getItem('eic-review-words')
      if (raw) setReviewWords(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])
  useEffect(() => {
    try { localStorage.setItem('eic-review-words', JSON.stringify(reviewWords)) } catch { /* ignore */ }
  }, [reviewWords])

  // ── Vulpea-asistent — coadă de mesaje declanșate de evenimentele jocului ──
  const [foxQueue, setFoxQueue] = useState<FoxTip[]>([])
  const triggerFox = useCallback((text: string, mood?: FoxMood) => {
    setFoxQueue(q => [...q, { id: `${Date.now()}-${Math.random()}`, text, mood }])
  }, [])
  const dequeueFox = useCallback(() => setFoxQueue(q => q.slice(1)), [])

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

  // ── Salut personalizat, o singură dată la prima vizită, apoi „Bine ai revenit" ──
  useEffect(() => {
    const seenBefore = (() => {
      try { return localStorage.getItem('eic-fox-seen') === '1' } catch { return false }
    })()
    triggerFox(seenBefore ? 'Bine ai revenit! Hai să continuăm.' : 'Salut! Sunt Vulpea și te ajut la lecție 🦊', 'greeting')
    try { localStorage.setItem('eic-fox-seen', '1') } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Leaving the column (or the level) mid-repetition also stops playback ──
  useEffect(() => {
    setCelebrating(false)
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

  // ── Un nivel e „terminat" dacă toate cele 4 coloane ale lui au 5 stele —
  //   calculat direct din starsEarned, NU din compararea cu levelIndex
  //   curent, tocmai ca să rămână corect și atunci când utilizatorul se
  //   întoarce să revadă un nivel mai vechi (vezi visitLevel mai jos):
  //   levelIndex arată ce se VEDE acum pe ecran, nu neapărat cât de departe
  //   a ajuns utilizatorul. ──
  const isLevelDone = useCallback((i: number) => (
    LEVELS[i].lessons.every((_, ci) => starsEarned[i][ci] >= REPS_PER_LESSON)
  ), [starsEarned])

  // The single locked column right after the active one — the one that's
  // "about to be offered". Progression is strictly linear so at most one
  // column ever carries this state.
  const nextUpIndex = colUnlocked[levelIndex].findIndex((u, i) => !u && (i === 0 || colUnlocked[levelIndex][i - 1]))

  // ── playWord — simplificat, fără urmărire boundary/fallback pe litere.
  //   Tot butonul cuvântului se mărește proporțional (vezi CSS
  //   .lesson-word.is-playing) cât timp e activ; nimic nu mai avansează
  //   progresiv pe litere în timp ce vorbește vocea. ──
  const playWord = useCallback(async (word: string, colId: string, accent: Accent = 'en-US') => {
    setPlayingWord(word)
    setPlayingColId(colId)
    try {
      const { promise, stop } = speakWord(word, { accent })
      currentAudio.current = { pause: stop }
      await promise
      if (currentAudio.current?.pause === stop) currentAudio.current = null
    } catch { /* ignore */ }
    setPlayingWord(null)
    setPlayingColId(null)
  }, [])

  // ── Plays every word in a column exactly once, in order, cu pauza dintre
  //   cuvinte controlată de slider-ul de viteză (autoDelayMs) și accentul
  //   fiecărui cuvânt rezolvat individual (word.accent > lesson.accent). ──
  const playColumnOnce = useCallback(async (l: Lesson) => {
    for (let wi = 0; wi < l.words.length; wi++) {
      if (autoCancel.current) break
      await playWord(l.words[wi].text, l.id, resolveAccent(l.words[wi], l))
      if (autoCancel.current) break
      if (wi < l.words.length - 1) {
        await new Promise(res => setTimeout(res, autoDelayMs))
      }
    }
  }, [playWord, autoDelayMs])

  // ── Main button: one press = one repetition of the active column. La a
  //    5-a repetiție reușită, coloana avansează SINGURĂ spre următoarea
  //    (fără butonul „Continuă" — regula 4), iar când tot nivelul e
  //    masterizat, apare overlay-ul de nivel. ──
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
    triggerFox('Bravo, o stea în plus! 🌟', 'celebrate')
    playStarChime()

    // ── Steaua zburătoare: pornește din poziția reală a butonului tocmai
    //   apăsat și țintește cupa reală a coloanei active, citite chiar acum
    //   prin getBoundingClientRect — un singur calcul, nu o urmărire
    //   continuă, exact ca restul animațiilor din joc. Dacă din orice motiv
    //   unul dintre elemente nu e încă montat, sărim peste efectul vizual
    //   fără să blocăm restul logicii (stelele/cupa se actualizează oricum). ──
    const btnEl = activeBtnRef.current
    const cupEl = cupRefs.current[lesson.id]
    if (btnEl && cupEl) {
      const bRect = btnEl.getBoundingClientRect()
      const cRect = cupEl.getBoundingClientRect()
      const id = ++flyingStarIdRef.current
      setFlyingStar({
        id,
        fromX: bRect.left + bRect.width / 2,
        fromY: bRect.top + bRect.height / 2,
        toX: cRect.left + cRect.width / 2,
        toY: cRect.top + cRect.height / 2,
        color: lesson.color,
      })
      setTimeout(() => {
        setFlyingStar(f => (f && f.id === id ? null : f))
      }, STAR_FLIGHT_MS)
    }

    const updatedLevelStars = levelStars.map((v, idx) => (idx === active ? newCount : v))
    setStarsEarned(prev => prev.map((row, li) => (li === levelIndex ? updatedLevelStars : row)))

    if (newCount === REPS_PER_LESSON) {
      setCelebrating(true)

      const isLastColumn = active + 1 >= level.lessons.length
      if (!isLastColumn) {
        setColUnlocked(prev => {
          if (prev[levelIndex][active + 1]) return prev
          const copy = prev.map(row => [...row])
          copy[levelIndex][active + 1] = true
          return copy
        })
        setJustRevealedIndex(active + 1)
        setTimeout(() => setJustRevealedIndex(null), REVEAL_MS)
        triggerFox('S-a deschis o coloană nouă!', 'celebrate')
        // pauză scurtă pentru celebrare, apoi trece singur — fără buton „Continuă"
        setTimeout(() => setActive(active + 1), 900)
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
  }, [isPlayingRep, showLevelOverlay, nextLevel, levelIndex, active, level, lesson, levelStars, starsEarned, playColumnOnce, isLastLevel, triggerFox])

  // ── Buton „Știu deja acest sunet" — sare direct la 5 stele, fără să mai
  //   redea audio, și avansează coloana la fel ca handleMainButton. ──
  const handleStudiedButton = useCallback(() => {
    if (isPlayingRep || starsEarned[levelIndex][active] >= REPS_PER_LESSON) return

    const newCount = REPS_PER_LESSON
    const updatedLevelStars = levelStars.map((v, idx) => (idx === active ? newCount : v))
    setStarsEarned(prev => prev.map((row, li) => (li === levelIndex ? updatedLevelStars : row)))

    const isLastColumn = active + 1 >= level.lessons.length
    if (!isLastColumn) {
      setColUnlocked(prev => {
        if (prev[levelIndex][active + 1]) return prev
        const copy = prev.map(row => [...row])
        copy[levelIndex][active + 1] = true
        return copy
      })
      setJustRevealedIndex(active + 1)
      setTimeout(() => setJustRevealedIndex(null), REVEAL_MS)
      triggerFox('S-a deschis o coloană nouă!', 'celebrate')
      setActive(active + 1)
    }

    if (updatedLevelStars.every(v => v >= REPS_PER_LESSON)) {
      setLevelCelebrating(true)
      setShowLevelOverlay(true)
      playLevelFanfare()
      setTimeout(() => setLevelCelebrating(false), LEVEL_POP_MS)
      if (isLastLevel) setAllDone(true)
    }
  }, [isPlayingRep, starsEarned, levelIndex, active, levelStars, level, isLastLevel, triggerFox])

  const selectColumn = useCallback((i: number) => {
    if (isPlayingRep || !colUnlocked[levelIndex][i] || i === active) return
    setActive(i)
  }, [isPlayingRep, colUnlocked, levelIndex, active])

  // ── Permite să revii la un nivel deja deblocat (curent sau terminat),
  //   ca să revezi coloanele lui — fără să atingi progresul (colUnlocked,
  //   starsEarned rămân neschimbate; doar „ce se vede" se mută). ──
  const visitLevel = useCallback((i: number) => {
    if (isPlayingRep || !unlockedLevels[i] || i === levelIndex) return
    autoCancel.current = true
    currentAudio.current?.pause()
    setLevelIndex(i)
    const firstUnlockedCol = colUnlocked[i].findIndex(Boolean)
    setActive(firstUnlockedCol === -1 ? 0 : firstUnlockedCol)
  }, [isPlayingRep, unlockedLevels, levelIndex, colUnlocked])

  // ── Reia tot jocul de la zero: șterge progresul salvat și readuce toate
  //   flag-urile la valorile inițiale (aceleași cu cele din useState de mai
  //   sus). Cerută printr-un buton + un modal de confirmare, ca să nu se
  //   piardă progresul dintr-o apăsare greșită. ──
  const resetGame = useCallback(() => {
    autoCancel.current = true
    currentAudio.current?.pause()
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }

    setLevelIndex(0)
    setUnlockedLevels(LEVELS.map((_, i) => i === 0))
    setColUnlocked(LEVELS.map((_, i) => [i === 0, false, false, false]))
    setStarsEarned(LEVELS.map(() => [0, 0, 0, 0]))
    setActive(0)
    setAllDone(false)

    setPlayingWord(null)
    setPlayingColId(null)
    setIsPlayingRep(false)
    setPoppingStarIndex(null)
    setCelebrating(false)
    setFreePracticeCount(0)
    setLevelCelebrating(false)
    setShowLevelOverlay(false)
    setJustRevealedIndex(null)
    setFlyingStar(null)
    setShowResetConfirm(false)
  }, [])

  const stopPlayback = useCallback(() => {
    autoCancel.current = true
    currentAudio.current?.pause()
  }, [])

  // ── Apasă pe UN cuvânt anume din listă → se aude doar el, o singură dată,
  //    fără să pornească repetiția întregii coloane și fără să afecteze
  //    stelele/progresul. Blocat cât timp o repetiție de coloană e deja în
  //    desfășurare, ca să nu se suprapună două voci. La al treilea click pe
  //    același cuvânt, acesta ajunge în „Cuvinte de exersat". ──
  const playSingleWord = useCallback((word: string, colId: string, isUnlocked: boolean, accent: Accent = 'en-US') => {
    if (isPlayingRep || playingWord !== null || !isUnlocked) return
    autoCancel.current = false
    void playWord(word, colId, accent)

    setWordClickCounts(prev => {
      const key = `${colId}:${word}`
      const count = (prev[key] ?? 0) + 1
      if (count === REVIEW_THRESHOLD) {
        setReviewWords(rw => rw.some(r => r.word === word && r.colId === colId) ? rw : [...rw, { word, colId, accent }])
        triggerFox(`„${word}" pare dificil — l-am pus la exersat!`, 'hint')
      }
      return { ...prev, [key]: count }
    })
  }, [isPlayingRep, playingWord, playWord, triggerFox])

  let buttonLabel: string
  if (isPlayingRep) buttonLabel = 'Repetă în glas'
  else if (hasTrophy) buttonLabel = `Repetă (${(freePracticeCount % REPS_PER_LESSON) + 1}/${REPS_PER_LESSON})`
  else buttonLabel = `Repetă (${earned + 1}/${REPS_PER_LESSON})`

  // ── Mesajul implicit al vulpii — calculat live din starea lecției, nu
  //   ales dintr-o listă fixă de „tips" (vezi FoxHelper.tsx). ──
  const foxIdleHint = useMemo(() => {
    if (allDone) return 'Ai terminat tot parcursul — felicitări! 🎉'
    if (hasTrophy) return 'Coloana asta e gata — treci la următoarea!'
    if (earned === 0) return 'Apasă „Repetă" și ascultă coloana cu voce tare.'
    return `Mai ai nevoie de ${REPS_PER_LESSON - earned} stele ca să deblochezi următoarea coloană.`
  }, [allDone, hasTrophy, earned])

  return (
    <main className="lesson-page">
      <div className="lesson-top-row">
        <div className="lesson-top-links">
          <Link href="/" className="lesson-back-btn" onClick={stopPlayback}>← Pagina principală</Link>
        </div>
      </div>

      <div className="lesson-layout">
      <div className="lesson-grid">
        {level.lessons.map((l, i) => {
          const isUnlocked   = colUnlocked[levelIndex][i]
          const isActive     = active === i
          const stars        = starsEarned[levelIndex][i]
          const trophyEarned = stars >= REPS_PER_LESSON
          const isNextUp     = i === nextUpIndex
          const isRevealing  = justRevealedIndex === i
          const isTricolor   = l.id === 'ou'
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
                <div
                  className="lesson-letter"
                  // Litera din capul coloanei ia și ea tricolorul real (nu
                  // doar roșul de identitate din --lesson-color) — dar doar
                  // când coloana e deblocată, la fel ca la cuvinte: blocată
                  // rămâne pe stilul muted vechi din CSS.
                  // Widened overshoot margin (8% vs the word-list default
                  // 2%): the header shows italic IPA symbols (ə, ʊ) at a
                  // bigger font size, not the plain lowercase Latin word
                  // letters the tight margin was tuned against — the tight
                  // margin was clipping their ink slightly top and bottom.
                  style={isTricolor && isUnlocked ? tricolorLetterStyle(8) : undefined}
                >
                  {l.letter}
                </div>
              </div>

              {isUnlocked && (
                <div ref={(el) => { cupRefs.current[l.id] = el }} className="lesson-cup-wrap">
                  <Cup
                    progressPct={(stars / REPS_PER_LESSON) * 100}
                    size={42}
                    color={l.color}
                    bandColors={isTricolor ? TRICOLOR_BANDS : undefined}
                    celebrating={isActive && celebrating}
                    allFull={trophyEarned}
                    idSuffix={l.id}
                    showBubbles
                    activePulse={isActive && !trophyEarned}
                  />
                </div>
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
                {l.words.map((w: LessonWord) => {
                  const isPlaying = playingWord === w.text && playingColId === l.id
                  const canClick  = isUnlocked && !isPlayingRep && playingWord === null
                  return (
                    <button
                      key={w.text}
                      type="button"
                      className={`lesson-word ${isPlaying ? 'is-playing' : ''} ${canClick ? 'is-clickable' : ''}`}
                      onClick={(e) => { e.stopPropagation(); playSingleWord(w.text, l.id, isUnlocked, resolveAccent(w, l)) }}
                      disabled={!canClick}
                      aria-label={`Ascultă cuvântul ${w.text}`}
                      title="Apasă ca să auzi doar acest cuvânt"
                    >
                      <MarkedWord text={w.text} mark={w.mark} lessonId={l.id} isLocked={!isUnlocked} isPlaying={isPlaying} />
                    </button>
                  )
                })}
              </div>

              {isActive && isUnlocked && (
                <div className="lesson-col-btn-wrap">
                  <button
                    ref={activeBtnRef}
                    className="lesson-col-btn"
                    onClick={(e) => { e.stopPropagation(); handleMainButton() }}
                    disabled={isPlayingRep}
                    style={{ background: isTricolor ? TRICOLOR_CSS_HORIZONTAL : l.color }}
                  >
                    {buttonLabel}
                  </button>
                  {/* steaua "crește" chiar pe buton, în clipa în care e câștigată —
                      înainte să pornească, ca element fix, spre cupă (vezi mai jos) */}
                  {flyingStar && <span className="lesson-col-btn-star" aria-hidden="true">★</span>}
                </div>
              )}

              {isActive && isUnlocked && !trophyEarned && (
                <button
                  type="button"
                  className="lesson-col-studied-btn"
                  onClick={(e) => { e.stopPropagation(); handleStudiedButton() }}
                  disabled={isPlayingRep}
                >
                  Știu deja acest sunet
                </button>
              )}
            </div>
          )
        })}
      </div>

      <aside className="lesson-header lesson-sidebar">
        <h1 className="lesson-title">EiC · English in Colours</h1>

        <div className="lesson-stepper" aria-label="Niveluri">
          {LEVELS.map((lv, i) => {
            const done    = isLevelDone(i)
            const locked  = !unlockedLevels[i]
            const viewing = i === levelIndex
            const canVisit = !locked && !viewing
            const pillStyle = { '--pill-color': lv.lessons[0].color } as CSSProperties
            return (
              <button
                type="button"
                key={lv.id}
                className={`lesson-stepper-pill ${done ? 'is-done' : ''} ${viewing ? 'is-current' : ''} ${locked ? 'is-locked' : ''} ${canVisit ? 'is-visitable' : ''}`}
                style={pillStyle}
                title={canVisit ? `Revezi ${lv.name}` : lv.name}
                onClick={canVisit ? () => visitLevel(i) : undefined}
                disabled={!canVisit}
              >
                <span className="lesson-stepper-dot" aria-hidden="true">{done ? '✓' : locked ? '🔒' : i + 1}</span>
                <span className="lesson-stepper-label">{lv.name.replace(/^Nivelul \d+ · /, '')}</span>
              </button>
            )
          })}
        </div>

        <button type="button" className="lesson-reset-btn lesson-reset-btn-sidebar" onClick={() => setShowResetConfirm(true)}>
          ↺ Reia de la început
        </button>

        <div className="lesson-progress-inline">
          <Cup progressPct={progressPct} size={48} color="#FFB300" allFull={levelMastered} idSuffix="master" className="lesson-progress-cup" showBubbles ring />
          <p className="lesson-progress-caption">
            {levelMastered ? '🎉 Cupa e plină!' : `${totalLevelStars} / ${maxLevelStars} — scopul: umple cupa`}
          </p>
        </div>

        <p className="lesson-subhead">
          {allDone ? 'Repetă cuvintele cu voce tare' : 'Apasă „Repetă", ascultă coloana și repetă fiecare cuvânt cu voce tare'}
        </p>

        <div className="lesson-speed-control">
          <label htmlFor="speed-slider" className="lesson-speed-label">Viteză</label>
          <input
            id="speed-slider"
            type="range"
            min={800}
            max={3000}
            step={50}
            value={autoDelayMs}
            onChange={(e) => setAutoDelayMs(Number(e.target.value))}
            className="lesson-speed-slider"
          />
        </div>

        {reviewWords.length > 0 && (
          <div className="review-panel">
            <p className="review-title">Cuvinte de exersat</p>
            <div className="review-words">
              {reviewWords.map(({ word, colId, accent }) => (
                <button
                  key={`${colId}-${word}`}
                  className="review-word-btn"
                  onClick={() => void playWord(word, colId, accent)}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
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
              <Mascot state="cheering" size={64} className="level-overlay-mascot" />
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

      {showResetConfirm && (
        <div className="reset-overlay" role="dialog" aria-modal="true" aria-label="Confirmare resetare">
          <div className="reset-overlay-card">
            <p className="reset-overlay-title">Reiei jocul de la început?</p>
            <p className="reset-overlay-sub">Tot progresul — stelele și nivelurile deblocate — va fi șters definitiv.</p>
            <div className="reset-overlay-actions">
              <button type="button" className="reset-overlay-cancel" onClick={() => setShowResetConfirm(false)}>
                Anulează
              </button>
              <button type="button" className="reset-overlay-confirm" onClick={resetGame}>
                Da, reia de la început
              </button>
            </div>
          </div>
        </div>
      )}

      {/* steaua zburătoare — element `position: fixed`, poziționat prin
          coordonate viewport calculate o singură dată (vezi handleMainButton);
          nu urmărește nimic continuu, doar animă de la punctul de start la
          cel de sosire și dispare ── */}
      {flyingStar && (
        <span
          key={flyingStar.id}
          className="star-flight"
          aria-hidden="true"
          style={{
            '--from-x': `${flyingStar.fromX}px`,
            '--from-y': `${flyingStar.fromY}px`,
            '--to-x': `${flyingStar.toX}px`,
            '--to-y': `${flyingStar.toY}px`,
            color: flyingStar.color,
          } as CSSProperties}
        >
          ★
        </span>
      )}

      {/* Vulpea-asistent — dock permanent, ascuns cât timp overlay-ul de
          nivel e deschis (acela are deja propria mascotă, în cupwrap) ── */}
      {!showLevelOverlay && (
        <FoxHelper
          idleTip={foxIdleHint}
          queue={foxQueue}
          onDequeue={dequeueFox}
          actions={[
            { id: 'what-now', label: 'Ce să fac acum?', onClick: () => triggerFox(foxIdleHint, 'hint') },
            { id: 'repeat', label: 'Repetă sunetul', onClick: () => { if (!isPlayingRep) handleMainButton() } },
            { id: 'help', label: 'Am nevoie de ajutor', onClick: () => triggerFox('Apasă pe orice cuvânt ca să-l auzi separat, sau „Știu deja acest sunet" ca să sari peste exercițiu.', 'hint') },
          ]}
        />
      )}
    </main>
  )
}
