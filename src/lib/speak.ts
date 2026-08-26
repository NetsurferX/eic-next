export type Accent = 'en-GB' | 'en-US'

// Un cache per-accent — nu unul singur global — pentru că acum pagina cere
// explicit voci diferite pentru coloane/cuvinte diferite (regula 6 din
// EiC — /learn — Modificări de implementat: æ și /o/ sunt britanice,
// restul americane).
const cachedVoices: Partial<Record<Accent, SpeechSynthesisVoice>> = {}

const PREFERRED_US = [
  'Google US English',
  'Microsoft Aria Online (Natural) - English (United States)',
  'Microsoft Guy Online (Natural) - English (United States)',
  'Samantha',
]

const PREFERRED_GB = [
  'Google UK English Female',
  'Google UK English Male',
  'Microsoft Libby Online (Natural) - English (United Kingdom)',
  'Microsoft Ryan Online (Natural) - English (United Kingdom)',
  'Daniel',
]

function pickVoiceForAccent(accent: Accent): SpeechSynthesisVoice | null {
  if (cachedVoices[accent]) return cachedVoices[accent]!
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const preferred = accent === 'en-GB' ? PREFERRED_GB : PREFERRED_US
  for (const name of preferred) {
    const match = voices.find(v => v.name === name)
    if (match) { cachedVoices[accent] = match; return match }
  }

  const exact = voices.find(v => v.lang === accent)
  if (exact) { cachedVoices[accent] = exact; return exact }
  const enAny = voices.find(v => v.lang.startsWith('en'))
  const fallback = enAny ?? voices[0]
  if (fallback) cachedVoices[accent] = fallback
  return fallback ?? null
}

// Chrome garbage-collects a SpeechSynthesisUtterance mid-speech if nothing
// outside the engine holds a reference to it (a long-standing Chrome bug) —
// keeping one alive at module scope is what actually stops the audio from
// silently dropping.
let liveUtterance: SpeechSynthesisUtterance | null = null

// Speaks a word. Returns a promise that resolves when speech ends (naturally
// or via stop()), plus a stop() to cut it short — mirrors the old
// audio.pause()-triggers-'pause'-event behaviour from the fetch-based version.
//
// onBoundary (opțional) transmite evenimentele REALE 'boundary' ale motorului
// de voce, cu charIndex/charLength — poziția exactă în `word` unde a ajuns
// pronunția. Nu toate vocile le trimit (multe voci offline de desktop nu
// raportează deloc boundary pentru un singur cuvânt), și cele care le trimit
// nu sunt neapărat per-literă — de-aia apelantul trebuie să aibă un fallback
// pe estimare (vezi estimateSpeechDurationMs mai jos) pentru cazul în care
// nu vine niciun eveniment.
export interface SpeakOptions {
  onBoundary?: (charIndex: number, charLength: number) => void
  accent?: Accent   // implicit 'en-US' dacă lipsește
}

export function speakWord(word: string, options: SpeakOptions = {}): { promise: Promise<void>; stop: () => void } {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return { promise: Promise.resolve(), stop: () => {} }
  }

  const synth = window.speechSynthesis
  synth.cancel() // stop any word still being spoken

  const accent = options.accent ?? 'en-US'
  const utterance = new SpeechSynthesisUtterance(word)
  liveUtterance = utterance // see comment above — prevents the GC-drop bug
  utterance.rate = 0.85
  utterance.pitch = 1.0
  utterance.lang = accent

  const voice = pickVoiceForAccent(accent)
  if (voice) utterance.voice = voice

  let resolveFn: () => void = () => {}
  const promise = new Promise<void>(resolve => { resolveFn = resolve })
  const done = () => {
    if (liveUtterance === utterance) liveUtterance = null
    resolveFn()
  }

  utterance.addEventListener('end', done, { once: true })
  utterance.addEventListener('error', done, { once: true }) // fires on cancel() too

  if (options.onBoundary) {
    utterance.addEventListener('boundary', (e: SpeechSynthesisEvent) => {
      // charLength nu e în tipurile TS mai vechi ale DOM lib, deși e în spec.
      const charLength = (e as SpeechSynthesisEvent & { charLength?: number }).charLength ?? 1
      if (typeof e.charIndex === 'number') options.onBoundary!(e.charIndex, charLength)
    })
  }

  // cancel() is asynchronous under the hood in Chrome — calling speak()
  // in the very same tick can silently swallow the new utterance. A 0ms
  // timeout pushes speak() to the next tick, after cancel() has settled.
  // Chrome also sometimes leaves the engine in a "paused" state after a
  // cancel/tab-blur cycle, so resume() is called defensively first.
  setTimeout(() => {
    synth.resume()
    synth.speak(utterance)
  }, 0)

  return {
    promise,
    stop: () => {
      if (liveUtterance === utterance) liveUtterance = null
      synth.cancel()
    },
  }
}

// Estimare grosieră a duratei de pronunție a unui cuvânt — folosită DOAR ca
// fallback, când vocea curentă nu trimite deloc evenimente 'boundary' reale
// (vezi onBoundary de mai sus). Multe voci offline de desktop se comportă
// exact așa pentru un singur cuvânt.
export function estimateSpeechDurationMs(word: string, rate = 0.85): number {
  const MS_PER_CHAR = 105
  const MIN_MS = 380
  return Math.max(MIN_MS, (word.length * MS_PER_CHAR) / rate)
}

// Voice list loads asynchronously in some browsers — call once on app mount.
export function warmUpVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.getVoices()
  window.speechSynthesis.onvoiceschanged = () => {
    delete cachedVoices['en-US']
    delete cachedVoices['en-GB']
  }
}