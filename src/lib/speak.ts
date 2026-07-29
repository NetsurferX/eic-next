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

// Speaks a word. Returns a promise that resolves when speech ends (naturally
// or via stop()), plus a stop() to cut it short — mirrors the old
// audio.pause()-triggers-'pause'-event behaviour from the fetch-based version.
export function speakWord(word: string): { promise: Promise<void>; stop: () => void } {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return { promise: Promise.resolve(), stop: () => {} }
  }

  window.speechSynthesis.cancel() // stop any word still being spoken

  const utterance = new SpeechSynthesisUtterance(word)
  utterance.rate = 0.85
  utterance.pitch = 1.0
  utterance.lang = 'en-GB'

  const voice = pickBestVoice()
  if (voice) utterance.voice = voice

  let resolveFn: () => void = () => {}
  const promise = new Promise<void>(resolve => { resolveFn = resolve })
  const done = () => resolveFn()

  utterance.addEventListener('end', done, { once: true })
  utterance.addEventListener('error', done, { once: true }) // fires on cancel() too

  window.speechSynthesis.speak(utterance)

  return { promise, stop: () => window.speechSynthesis.cancel() }
}

// Voice list loads asynchronously in some browsers — call once on app mount.
export function warmUpVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.getVoices()
  window.speechSynthesis.onvoiceschanged = () => { cachedVoice = null }
}