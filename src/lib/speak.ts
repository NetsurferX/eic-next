let cachedVoice: SpeechSynthesisVoice | null = null

function pickBestVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const preferred = [
    'Google UK English Female',
    'Google UK English Male',
    'Microsoft Libby Online (Natural) - English (United Kingdom)',
    'Microsoft Sonia Online (Natural) - English (United Kingdom)',
    'Samantha',
    'Google US English',
  ]

  for (const name of preferred) {
    const match = voices.find(v => v.name === name)
    if (match) { cachedVoice = match; return match }
  }

  const enGB = voices.find(v => v.lang === 'en-GB')
  if (enGB) { cachedVoice = enGB; return enGB }
  const enAny = voices.find(v => v.lang.startsWith('en'))
  cachedVoice = enAny ?? voices[0]
  return cachedVoice
}

// Chrome garbage-collects a SpeechSynthesisUtterance mid-speech if nothing
// outside the engine holds a reference to it (a long-standing Chrome bug) —
// keeping one alive at module scope is what actually stops the audio from
// silently dropping.
let liveUtterance: SpeechSynthesisUtterance | null = null

// Speaks a word. Returns a promise that resolves when speech ends (naturally
// or via stop()), plus a stop() to cut it short — mirrors the old
// audio.pause()-triggers-'pause'-event behaviour from the fetch-based version.
export function speakWord(word: string): { promise: Promise<void>; stop: () => void } {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return { promise: Promise.resolve(), stop: () => {} }
  }

  const synth = window.speechSynthesis
  synth.cancel() // stop any word still being spoken

  const utterance = new SpeechSynthesisUtterance(word)
  liveUtterance = utterance // see comment above — prevents the GC-drop bug
  utterance.rate = 0.85
  utterance.pitch = 1.0
  utterance.lang = 'en-GB'

  const voice = pickBestVoice()
  if (voice) utterance.voice = voice

  let resolveFn: () => void = () => {}
  const promise = new Promise<void>(resolve => { resolveFn = resolve })
  const done = () => {
    if (liveUtterance === utterance) liveUtterance = null
    resolveFn()
  }

  utterance.addEventListener('end', done, { once: true })
  utterance.addEventListener('error', done, { once: true }) // fires on cancel() too

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

// Voice list loads asynchronously in some browsers — call once on app mount.
export function warmUpVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.getVoices()
  window.speechSynthesis.onvoiceschanged = () => { cachedVoice = null }
}