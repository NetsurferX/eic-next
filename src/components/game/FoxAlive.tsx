'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'

// ── FoxAlive — vulpea „vie”: aceeași mișcare ca în /debug/gamification/
//    animatii-vulpii (pozele din public/mascot/v2 + transformări continue și
//    fizică simplă), dar ambalată ca DROP-IN pentru Mascot / MascotV2.
//
//    - NU modifică Mascot.tsx, MascotV2.tsx, MascotReward.tsx, globals.css.
//    - Aceleași props ca MascotV2 (state / action / message / size /
//      className) + `facing` opțional. Folosește clasele existente
//      (`mascot`, `state-*`, `mascot-*`, `mascot-bubble`, `mascot-stage`,
//      `mascot-point-hint`) pe wrapper, deci contractele de layout
//      (.mascot-reward-layer .mascot, .level-overlay-mascot, bula de mesaj,
//      chevroanele „apasă aici”) rămân neschimbate.
//    - Mișcarea e imperativă (refs, fără setState pe frame): re-randare
//      doar când se schimbă poza.
//    - `prefers-reduced-motion`: poza statică corectă, fără buclă, fără
//      particule.
//
//    Tehnici (aceleași ca în paginile de probă):
//      • arcuri (spring) pe scară/rotație/offset → mișcare moale, cu
//        depășire elastică, nu interpolări liniare
//      • la fiecare schimbare de poză: impuls de squash → schimbarea nu
//        „pocnește”, e mascată de mișcare
//      • sărituri balistice: ghemuire → arc → întindere → aterizare cu
//        zguduit; umbra urmărește înălțimea
//      • explozii de stele/confetti cu gravitație (sărbătoarea)
//      • repaus viu: respirație + clipit (uneori dublu) + gesturi mici
//        la întâmplare (se uită, salută, saltă, își mută greutatea) ──

export type FoxAliveState =
  | 'idle' | 'pointing' | 'clapping' | 'cheering' | 'talking'
  | 'waving' | 'sitting' | 'sleeping'

export type FoxAliveAction =
  | 'idle' | 'walking' | 'grabbing'
  | 'holding-star' | 'holding-cup' | 'pouring' | 'celebrating'

const P = '/mascot/v2/'
const POSE = {
  idle: P + '01_idle_side.png',
  blink: P + '02_idle_blink.png',
  front: P + '03_idle_front.png',
  sit: P + '04_idle_sit.png',
  point: P + '05_point.png',
  wave: P + '06_wave.png',
  clap: P + '07_clap.png',
  cheer: P + '08_cheer_stars.png',
  runA: P + '09_run_left.png',
  runB: P + '10_run_right.png',
  celebrate: P + '11_celebrate_stars.png',
  sleep: P + '12_sleep.png',
}

// aliniere per poză (aceeași măsurătoare ca în _anim.tsx / MascotV2)
const FRAME = 346
const REF_CX = 178
const REF_BOTTOM = 337
const MEASURED: Record<string, { cx: number; bottom: number }> = {
  [POSE.idle]: { cx: 178, bottom: 337 },
  [POSE.blink]: { cx: 177, bottom: 335 },
  [POSE.front]: { cx: 175, bottom: 336 },
  [POSE.sit]: { cx: 165, bottom: 336 },
  [POSE.point]: { cx: 166, bottom: 332 },
  [POSE.wave]: { cx: 170, bottom: 332 },
  [POSE.clap]: { cx: 158, bottom: 333 },
  [POSE.sleep]: { cx: 172, bottom: 279 },
}
function align(src: string): string {
  const m = MEASURED[src]
  if (!m) return 'none'
  const dx = ((REF_CX - m.cx) / FRAME) * 100
  const dy = ((REF_BOTTOM - m.bottom) / FRAME) * 100
  return `translate(${dx.toFixed(2)}%, ${dy.toFixed(2)}%)`
}

let preloaded = false
function preloadPoses() {
  if (preloaded || typeof window === 'undefined') return
  preloaded = true
  Object.values(POSE).forEach((s) => {
    const i = new Image()
    i.src = s
    i.decode?.().catch(() => {})
  })
}

// ── mod de mișcare = acțiunea (dacă e) sau starea ──
type Kind = FoxAliveState | Exclude<FoxAliveAction, 'idle'>
const CSS_STATE: Record<FoxAliveState, string> = {
  idle: 'idle', pointing: 'pointing', clapping: 'clapping', cheering: 'cheering',
  talking: 'talking', waving: 'idle', sitting: 'idle', sleeping: 'idle',
}

function staticPose(kind: Kind): string {
  switch (kind) {
    case 'pointing': case 'grabbing': return POSE.point
    case 'clapping': case 'holding-star': case 'holding-cup': case 'pouring': return POSE.clap
    case 'cheering': return POSE.cheer
    case 'celebrating': return POSE.celebrate
    case 'talking': return POSE.front
    case 'waving': return POSE.wave
    case 'sitting': return POSE.sit
    case 'sleeping': return POSE.sleep
    case 'walking': return POSE.runA
    default: return POSE.idle
  }
}

// ── fizică ──
type Spring = { x: number; v: number }
const spring = (s: Spring, target: number, dt: number, k = 170, z = 0.55) => {
  const c = 2 * Math.sqrt(k) * z
  s.v += (k * (target - s.x) - c * s.v) * dt
  s.x += s.v * dt
}
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const rand = (a: number, b: number) => a + Math.random() * (b - a)

type Part = {
  on: boolean; x: number; y: number; vx: number; vy: number
  rot: number; vr: number; life: number; max: number; kind: 'star' | 'conf' | 'z'
}
const POOL = 56
const COLORS = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#e67e22']

type Engine = {
  key: string
  t: number
  clock: number
  sx: Spring; sy: Spring; rot: Spring; ox: Spring
  y: number
  pose: string
  blinkAt: number; blinkUntil: number
  gestureAt: number
  gesture: { kind: 'look' | 'wave' | 'hop' | 'shift'; start: number; dur: number; dir: number } | null
  jump: { phase: 'crouch' | 'air' | 'land'; pt: number; dir: number }
  beat: number
  bursts: number
  zAt: number
  parts: Part[]
}

function newEngine(): Engine {
  return {
    key: '', t: 0, clock: 0,
    sx: { x: 1, v: 0 }, sy: { x: 1, v: 0 }, rot: { x: 0, v: 0 }, ox: { x: 0, v: 0 },
    y: 0, pose: POSE.idle,
    blinkAt: rand(1.2, 2.8), blinkUntil: 0,
    gestureAt: rand(4, 7), gesture: null,
    jump: { phase: 'crouch', pt: 0, dir: 1 },
    beat: 0, bursts: 0, zAt: 0,
    parts: Array.from({ length: POOL }, () => ({
      on: false, x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, life: 0, max: 1, kind: 'conf' as const,
    })),
  }
}

export function FoxAlive({
  state = 'idle',
  action,
  message = null,
  size = 96,
  className = '',
  facing = 1,
}: {
  state?: FoxAliveState
  action?: FoxAliveAction
  /** compat. cu Mascot/MascotV2 — ignorat */
  face?: unknown
  message?: string | null
  size?: number
  className?: string
  /** 1 = privește spre dreapta (poza originală), -1 = oglindit */
  facing?: 1 | -1
}) {
  const kind: Kind = action && action !== 'idle' ? action : state
  const [reduced, setReduced] = useState(false)
  const [pose, setPose] = useState<string>(staticPose(kind))

  const props = useRef({ kind, size, facing })
  props.current = { kind, size, facing }

  const foxRef = useRef<HTMLDivElement>(null)
  const shadowRef = useRef<HTMLDivElement>(null)
  const partEls = useRef<(HTMLSpanElement | null)[]>([])
  const eng = useRef<Engine | null>(null)
  if (eng.current === null) eng.current = newEngine()

  useEffect(() => {
    preloadPoses()
    setReduced(!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  }, [])

  // reduced-motion: poza corectă pentru stare, fără buclă
  useEffect(() => {
    if (reduced) setPose(staticPose(kind))
  }, [reduced, kind])

  useEffect(() => {
    if (reduced) return
    const E = eng.current as Engine
    let id = 0
    let last = performance.now()

    const spawn = (n: number, kindP: 'star' | 'conf' | 'z', sz: number, opts?: { big?: boolean }) => {
      const s = Math.max(0.6, sz / 220)
      for (let i = 0; i < n; i++) {
        const idx = E.parts.findIndex((p) => !p.on)
        if (idx < 0) return
        const p = E.parts[idx]
        const el = partEls.current[idx]
        if (!el) continue
        if (kindP === 'z') {
          p.on = true; p.x = sz * 0.12; p.y = sz * 0.72
          p.vx = rand(4, 14) * s; p.vy = rand(26, 36) * s
          p.rot = rand(-10, 10); p.vr = rand(-12, 12); p.life = 0; p.max = 2.6; p.kind = 'z'
          el.textContent = 'Z'
          el.style.background = 'none'
          el.style.color = '#5b7fc7'
          el.style.fontWeight = '800'
          el.style.fontFamily = 'system-ui, sans-serif'
          el.style.fontSize = `${Math.round(sz * 0.12)}px`
          el.style.width = 'auto'; el.style.height = 'auto'
          el.style.lineHeight = '1'
        } else {
          const a = Math.random() * Math.PI * 2
          const v = (220 + Math.random() * 320) * s * (opts?.big ? 1.12 : 1)
          const star = kindP === 'star'
          p.on = true; p.x = 0; p.y = sz * 0.62
          p.vx = Math.cos(a) * v; p.vy = Math.abs(Math.sin(a)) * v + 120 * s
          p.rot = Math.random() * 360; p.vr = (Math.random() - 0.5) * 720
          p.life = 0; p.max = 1.6 + Math.random() * 0.8; p.kind = kindP
          const u = Math.max(0.7, s)
          if (star) {
            el.textContent = '⭐'
            el.style.background = 'none'
            el.style.width = 'auto'; el.style.height = 'auto'
            el.style.fontSize = `${Math.round((20 + Math.random() * 12) * u)}px`
            el.style.lineHeight = '1'
          } else {
            el.textContent = ''
            el.style.background = COLORS[i % COLORS.length]
            el.style.width = `${Math.round(8 * u)}px`
            el.style.height = `${Math.round(4 * u)}px`
          }
        }
      }
    }
    const burst = (n: number, sz: number, big = false) => {
      for (let i = 0; i < n; i++) spawn(1, i % 3 === 0 ? 'star' : 'conf', sz, { big })
    }

    const loop = (now: number) => {
      id = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (dt <= 0) return
      const { kind: k, size: sz, facing: face } = props.current

      // ── schimbare de mod ──
      const key = String(k)
      let modeChanged = false
      if (key !== E.key) {
        E.key = key; E.t = 0; E.gesture = null; E.beat = 0; E.bursts = 0
        E.jump = { phase: 'crouch', pt: 0, dir: 1 }; E.zAt = 0
        modeChanged = true
      }
      E.t += dt
      E.clock += dt
      const t = E.t
      const c = E.clock

      // țintele de bază: respirație lentă + ușoară legănare a greutății
      const br = Math.sin((c * Math.PI * 2) / 3.8)
      let tSy = 1 + 0.012 * br
      let tSx = 1 - 0.006 * br
      let tRot = 0.35 * Math.sin((c * Math.PI * 2) / 7.3)
      let tOx = 0
      let yPx = 0
      let pz = staticPose(k)
      let blinkOk = false

      switch (k) {
        case 'idle': {
          blinkOk = true
          pz = POSE.idle
          // clipit (uneori dublu)
          if (c >= E.blinkAt && c > E.blinkUntil) {
            E.blinkUntil = c + 0.12
            E.blinkAt = Math.random() < 0.2 ? c + 0.3 : c + rand(2.6, 4.8)
          }
          // gesturi mici, la întâmplare
          if (!E.gesture && c >= E.gestureAt) {
            const kinds = ['look', 'wave', 'hop', 'shift'] as const
            const g = kinds[Math.floor(Math.random() * kinds.length)]
            const dur = g === 'look' ? 1.2 : g === 'wave' ? 1.0 : g === 'hop' ? 0.5 : 1.4
            E.gesture = { kind: g, start: c, dur, dir: Math.random() < 0.5 ? -1 : 1 }
          }
          if (E.gesture) {
            const g = E.gesture
            const gt = c - g.start
            const p = clamp(gt / g.dur, 0, 1)
            if (g.kind === 'look') { pz = POSE.front; tRot = -2.5 * g.dir; tOx = g.dir * sz * 0.004 }
            else if (g.kind === 'wave') { pz = POSE.wave; tRot = Math.sin(gt * 11) * 2.6 }
            else if (g.kind === 'hop') {
              const crouch = 0.12
              if (gt < crouch) { tSy = 0.93; tSx = 1.04 }
              else {
                const q = clamp((gt - crouch) / (g.dur - crouch), 0, 1)
                yPx = sz * 0.05 * 4 * q * (1 - q)
                tSy = 1.03; tSx = 0.985
              }
            } else { tRot = 2.2 * g.dir * Math.sin(p * Math.PI); tOx = g.dir * sz * 0.012 * Math.sin(p * Math.PI) }
            if (gt >= g.dur) { E.gesture = null; E.gestureAt = c + rand(5, 9) }
          }
          if (c < E.blinkUntil && !E.gesture) pz = POSE.blink
          break
        }
        case 'pointing': {
          const per = 0.95
          const ph = (t % per) / per
          pz = POSE.point
          tRot = 2.5 + 2.5 * Math.sin(ph * Math.PI * 2)
          tOx = sz * 0.012 * (0.5 + 0.5 * Math.sin(ph * Math.PI * 2))
          yPx = sz * 0.02 * Math.max(0, Math.sin(ph * Math.PI * 2))
          break
        }
        case 'clapping': {
          pz = POSE.clap
          const per = 0.3
          const b = Math.floor(t / per)
          if (b > E.beat) {
            E.beat = b
            E.sy.v -= 1.5; E.sx.v += 0.75
          }
          yPx = sz * 0.012 * Math.max(0, Math.sin(((t % per) / per) * Math.PI))
          tRot = Math.sin(t * 7) * 0.8
          break
        }
        case 'cheering':
        case 'celebrating': {
          const big = k === 'celebrating'
          pz = big ? POSE.celebrate : t < 1.6 ? POSE.cheer : POSE.celebrate
          // explozii: la intrare, apoi a doua (și a treia la celebrating)
          if (E.bursts === 0) { E.bursts = 1; burst(big ? 46 : 30, sz, big) }
          if (E.bursts === 1 && t > 0.9) { E.bursts = 2; burst(big ? 30 : 16, sz, big) }
          if (big && E.bursts === 2 && t > 1.8) { E.bursts = 3; burst(20, sz, true) }
          // energia scade lin: nu sare cu aceeași forță la nesfârșit
          const energy = 0.55 + 0.45 * Math.exp(-t / 3)
          const H = sz * (big ? 0.2 : 0.17) * energy
          const J = E.jump
          J.pt += dt
          if (J.phase === 'crouch') {
            tSy = 0.9; tSx = 1.06; tRot = -J.dir * 1.5
            if (J.pt >= 0.1) { J.phase = 'air'; J.pt = 0; E.sy.v += 1.8; E.sx.v -= 0.7 }
          } else if (J.phase === 'air') {
            const T = big ? 0.42 : 0.38
            const q = clamp(J.pt / T, 0, 1)
            yPx = H * 4 * q * (1 - q)
            tSy = 1.07; tSx = 0.97; tRot = J.dir * 3.2 * Math.sin(q * Math.PI)
            if (J.pt >= T) {
              J.phase = 'land'; J.pt = 0; J.dir = -J.dir
              E.sy.v -= 2.4; E.sx.v += 1.2
            }
          } else {
            tSy = 0.94; tSx = 1.04
            if (J.pt >= 0.04) { J.phase = 'crouch'; J.pt = 0 }
          }
          break
        }
        case 'talking': {
          pz = POSE.front
          const env = 0.5 + 0.5 * Math.sin(c * Math.PI * 2 * 0.9)
          tRot = (1.6 * Math.sin(c * Math.PI * 2 * 2.3) + 1.0 * Math.sin(c * Math.PI * 2 * 3.7 + 1)) * (0.4 + 0.6 * env)
          tSy = 1 + 0.01 * Math.abs(Math.sin(c * Math.PI * 2 * 1.55))
          break
        }
        case 'waving': {
          pz = POSE.wave
          tRot = 2.8 * Math.sin(t * Math.PI * 2 * 1.5) * clamp(t / 0.3, 0, 1)
          break
        }
        case 'sitting': {
          pz = POSE.sit
          const b2 = Math.sin((c * Math.PI * 2) / 4.4)
          tSy = 1 + 0.015 * b2; tSx = 1 - 0.007 * b2
          tRot = 1.2 * Math.sin((c * Math.PI * 2) / 9)
          break
        }
        case 'sleeping': {
          pz = POSE.sleep
          const b3 = Math.sin((c * Math.PI * 2) / 3.6)
          tSy = 1 + 0.03 * b3; tSx = 1 - 0.015 * b3; tRot = 0
          if (c >= E.zAt) { E.zAt = c + 1.15; spawn(1, 'z', sz) }
          break
        }
        case 'walking': {
          const per = 0.13
          pz = Math.floor(t / per) % 2 === 0 ? POSE.runA : POSE.runB
          const ph = (t % per) / per
          yPx = sz * 0.04 * Math.sin(ph * Math.PI)
          tRot = 3.5
          tSy = 1; tSx = 1
          break
        }
        case 'grabbing': {
          pz = POSE.point
          if (t < 0.25) { tOx = -sz * 0.012; tSy = 0.97; tRot = -2 }
          else { tOx = sz * 0.03; tRot = 6; tSy = 0.98 }
          break
        }
        case 'holding-star':
        case 'holding-cup': {
          pz = POSE.clap
          tRot = 1.6 * Math.sin((c * Math.PI * 2) / 2.2)
          tOx = sz * 0.006 * Math.sin((c * Math.PI * 2) / 3.1)
          break
        }
        case 'pouring': {
          pz = POSE.clap
          const e = 0.5 - 0.5 * Math.cos(Math.PI * clamp(t / 0.7, 0, 1))
          tRot = 7 * e + 0.8 * Math.sin(t * Math.PI * 2 * 1.3) * e
          tOx = sz * 0.01 * e
          break
        }
      }

      // ── schimbare de poză: impuls de squash care maschează „pocnetul” ──
      if (pz !== E.pose) {
        const blinkInvolved = pz === POSE.blink || E.pose === POSE.blink
        const run = k === 'walking'
        if (!blinkInvolved && !run) {
          E.sy.v -= modeChanged ? 1.6 : 0.9
          E.sx.v += modeChanged ? 0.8 : 0.4
        }
        E.pose = pz
        setPose(pz)
      }

      spring(E.sx, tSx, dt)
      spring(E.sy, tSy, dt)
      spring(E.rot, tRot, dt, 120, 0.6)
      spring(E.ox, tOx, dt, 120, 0.7)
      E.y = yPx

      const fox = foxRef.current
      if (fox) {
        fox.style.transform =
          `translate(${E.ox.x.toFixed(2)}px, ${(-E.y).toFixed(2)}px) ` +
          `scale(${(face * E.sx.x).toFixed(4)}, ${E.sy.x.toFixed(4)}) rotate(${E.rot.x.toFixed(3)}deg)`
      }
      const sh = shadowRef.current
      if (sh) {
        const kk = clamp(1 - E.y / (sz * 0.6), 0.4, 1)
        sh.style.transform = `translateX(-50%) scaleX(${kk.toFixed(3)})`
        sh.style.opacity = (0.4 + 0.6 * kk).toFixed(3)
      }

      // ── particule ──
      const s = Math.max(0.6, sz / 220)
      for (let i = 0; i < E.parts.length; i++) {
        const p = E.parts[i]
        const el = partEls.current[i]
        if (!p.on || !el) continue
        p.life += dt
        if (p.kind === 'z') {
          p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt
        } else {
          p.x += p.vx * dt; p.y += p.vy * dt
          p.vy -= 900 * s * dt
          p.vx *= 1 - 0.8 * dt
          p.rot += p.vr * dt
        }
        if (p.life >= p.max || p.y < -20) {
          p.on = false
          el.style.opacity = '0'
          continue
        }
        const f = p.life / p.max
        let op = 1
        if (p.kind === 'z') {
          op = f < 0.15 ? f / 0.15 : f > 0.6 ? 1 - (f - 0.6) / 0.4 : 1
          const sc = 0.6 + 1.0 * f
          el.style.transform = `translate(${p.x.toFixed(1)}px, ${(-p.y).toFixed(1)}px) rotate(${p.rot.toFixed(0)}deg) scale(${sc.toFixed(2)})`
        } else {
          op = f > 0.7 ? 1 - (f - 0.7) / 0.3 : 1
          el.style.transform = `translate(${p.x.toFixed(1)}px, ${(-p.y).toFixed(1)}px) rotate(${p.rot.toFixed(0)}deg)`
        }
        el.style.opacity = op.toFixed(2)
      }
    }

    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  const cssState = kind in CSS_STATE ? CSS_STATE[kind as FoxAliveState] : 'idle'
  const footPx = size * (9 / FRAME)

  return (
    <div
      className={`mascot fox-alive state-${cssState} ${action ? `mascot-${action}` : ''} ${className}`}
      style={{ '--mascot-size': `${size}px` } as CSSProperties}
      aria-hidden="true"
    >
      {message && (
        <div key={message} className="mascot-bubble">{message}</div>
      )}

      <div className="mascot-stage">
        {/* umbră de contact — se îngustează și se estompează cu înălțimea */}
        <div
          ref={shadowRef}
          style={{
            position: 'absolute',
            left: '50%',
            bottom: footPx - size * 0.03,
            width: size * 0.55,
            height: size * 0.06,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.22)',
            filter: 'blur(2px)',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        />

        <div
          ref={foxRef}
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: '51.4% 97.4%',
            pointerEvents: 'none',
            willChange: 'transform',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pose}
            alt=""
            draggable={false}
            style={{ width: '100%', height: '100%', display: 'block', transform: align(pose) }}
          />
        </div>

        {/* chevroanele „apasă aici” — aceleași ca în Mascot (vizibile doar la state-pointing) */}
        <svg className="mascot-point-hint" viewBox="0 0 44 32" aria-hidden="true">
          <defs>
            <linearGradient id="foxAlivePointGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>
          <path className="mascot-chevron c1" d="M4,8 L14,16 L4,24" stroke="url(#foxAlivePointGrad)" />
          <path className="mascot-chevron c2" d="M16,8 L26,16 L16,24" stroke="url(#foxAlivePointGrad)" />
          <path className="mascot-chevron c3" d="M28,8 L38,16 L28,24" stroke="url(#foxAlivePointGrad)" />
        </svg>

        {/* particule (stele, confetti, Z-uri) — pool fix, actualizat imperativ */}
        <div
          aria-hidden="true"
          style={{ position: 'absolute', left: '50%', bottom: 0, width: 0, height: 0, pointerEvents: 'none', zIndex: 5 }}
        >
          {Array.from({ length: POOL }, (_, i) => (
            <span
              key={i}
              ref={(el) => { partEls.current[i] = el }}
              style={{ position: 'absolute', left: 0, bottom: 0, opacity: 0, willChange: 'transform' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default FoxAlive
