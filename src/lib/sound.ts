// Tiny Web-Audio synth for the learn page's feedback sounds — no audio
// files, no dependencies. A shared AudioContext is created lazily on first
// use (must happen inside a user-gesture handler, e.g. a button click, to
// satisfy browser autoplay policies).
let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq: number, startAt: number, duration: number, gainPeak = 0.16, type: OscillatorType = 'triangle') {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t0 = c.currentTime + startAt
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(gainPeak, t0 + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

// A single bright "ding" — played every time a new star is earned.
export function playStarChime() {
  tone(1046.5, 0, 0.32, 0.14, 'triangle') // C6
}

// A short ascending fanfare with a sustained shimmer on top — played once
// per level completed.
export function playLevelFanfare() {
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
  notes.forEach((f, i) => tone(f, i * 0.11, 0.4, 0.15, 'triangle'))
  tone(1046.5, notes.length * 0.11 + 0.04, 0.7, 0.1, 'sine')
  tone(1318.5, notes.length * 0.11 + 0.04, 0.7, 0.06, 'sine') // E6 — adds a little sparkle
}
