'use client'

// src/app/debug/live/filmul-cuvantului/page.tsx
//
// PROPUNERE (nimic existent modificat): „Filmul cuvântului" — prezentare
// animată, pas cu pas, a procesării reale a unui cuvânt în motorul EiC.
// Arhitectură de „film": fiecare scenă e o funcție pură de progres p ∈ [0,1];
// cronologia (play/pauză/viteză/scrubber) decide p. Datele sunt cele reale:
//   nodurile din lexicon (POST /api/words) → applySyllabicConsonantDetection
//   → applySyllabicRDetection → applyRegexOverrides → resolveDisplay.
// Verificările afișate în scenele 4–5 repetă condițiile din engine/
// syllabicConsonants.ts și engine/syllabicR.ts doar pentru a le ILUSTRA;
// rezultatul (marcat / nemarcat) vine din funcțiile reale, nu din copie.

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import WordRenderer from '@/components/WordRenderer'
import Mascot from '@/components/game/Mascot'
import type { RenderNode } from '@/lib/renderNode'
import { DEFAULT_CONFIG, applyRegexOverrides } from '@/lib/ruleConfig'
import type { RegexRule } from '@/lib/ruleConfig'
import { resolveDisplay, applySyllabicConsonantDetection, applySyllabicRDetection, getColor } from '@/lib/engine'
import type { DisplayNode } from '@/lib/engine'
import { SOUND_COLORS } from '@/lib/rules/colors'

// ── date ─────────────────────────────────────────────────────────────────
interface Run {
  word: string
  base: RenderNode[]
  afterSC: RenderNode[]
  afterR: RenderNode[]
  afterRules: RenderNode[]
  display: DisplayNode[]
  rules: { rule: RegexRule; span: [number, number] | null }[]   // reguli active pe acest cuvânt
  enabledCount: number
}
const j = (x: unknown) => JSON.stringify(x)

function matchSpan(word: string, r: RegexRule): [number, number] | null {
  try {
    const m = new RegExp(r.pattern, (r.flags ?? '').replace('d', '') + 'd').exec(word) as (RegExpExecArray & { indices?: [number, number][] }) | null
    if (!m) return null
    const ix = m.indices?.[r.group ?? 0] ?? m.indices?.[0]
    return ix ? [ix[0], ix[1]] : null
  } catch { return null }
}

function buildRun(word: string, base: RenderNode[]): Run {
  const afterSC = applySyllabicConsonantDetection(base)
  const afterR = applySyllabicRDetection(afterSC)
  const afterRules = applyRegexOverrides(word, afterR, DEFAULT_CONFIG.regexRules)
  const display = resolveDisplay(afterRules)
  const enabled = DEFAULT_CONFIG.regexRules.filter(r => r.enabled)
  const rules = enabled
    .filter(r => j(applyRegexOverrides(word, afterR, [r])) !== j(afterR))
    .sort((a, b) => a.priority - b.priority)
    .map(rule => ({ rule, span: matchSpan(word, rule) }))
  return { word, base, afterSC, afterR, afterRules, display, rules, enabledCount: enabled.length }
}

const categoryOf = (s: string): string => {
  if (!s) return 'mut'
  const e = SOUND_COLORS.find(c => c.sounds.includes(s.toLowerCase()))
  return e ? ({ vowel: 'vocală', semivowel: 'semivocală', consonant: 'consoană', silent: 'mut' } as Record<string, string>)[e.category] : '—'
}
const isDark = (hex: string) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex); if (!m) return false
  const n = parseInt(m[1], 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) < 150
}
const clamp = (x: number) => Math.min(1, Math.max(0, x))
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const nodeColor = (n: RenderNode) => (n.c && n.c !== '' ? n.c : getColor(n.s) ?? '#e9e2d8')

// ── scene primitives ─────────────────────────────────────────────────────
const box: React.CSSProperties = { borderRadius: 10, border: '1.5px solid #2b3a55', background: '#fff' }
function Tile({ text, bg = '#eef2f8', fg, outline, dashed, w = 34, sub, opacity = 1, dy = 0 }:
  { text: string; bg?: string; fg?: string; outline?: string; dashed?: boolean; w?: number; sub?: string; opacity?: number; dy?: number }) {
  return (
    <div style={{ width: w, textAlign: 'center', opacity, transform: `translateY(${dy}px)`, transition: 'none' }}>
      <div style={{ ...box, background: bg, color: fg ?? (isDark(bg) ? '#fff' : '#1c2740'), fontWeight: 700, fontSize: 20, padding: '6px 0', border: `${outline ? 3 : 1.5}px ${dashed ? 'dashed' : 'solid'} ${outline ?? '#2b3a55'}` }}>{text || '∅'}</div>
      {sub && <div style={{ fontSize: 10, color: '#4a5a78', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}
const Check = ({ ok, label }: { ok: boolean | null; label: string }) => (
  <div style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'baseline', color: ok === null ? '#8894aa' : '#1c2740' }}>
    <b style={{ width: 16, color: ok ? '#1b8a3a' : '#c0392b' }}>{ok === null ? '·' : ok ? '✔' : '✘'}</b><span>{label}</span>
  </div>
)
const Caption = ({ children }: { children: React.ReactNode }) => <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{children}</div>

interface SceneProps { run: Run; p: number }
const nodeSub = (n: RenderNode) => (n.u ? 'ˈ accent' : '')

// 0 — intrare
function S0({ run, p }: SceneProps) {
  const L = [...run.word]
  return (
    <>
      <Caption>Intrare: un șir de {L.length} litere.</Caption>
      <div style={{ display: 'flex', gap: 4 }}>
        {L.map((c, i) => { const a = seg(p, i / (L.length + 1), (i + 1) / (L.length + 1)); return <Tile key={i} text={c} sub={String(i)} opacity={a} dy={(1 - a) * -24} /> })}
      </div>
    </>
  )
}

// 1 — segmentare în sunete
function S1({ run, p }: SceneProps) {
  const N = run.base
  return (
    <>
      <Caption>Lexiconul dă pronunția; motorul o împarte în {N.length} segmente (sunet + culoare + clasă).</Caption>
      <div style={{ fontSize: 22, marginBottom: 14, fontFamily: 'serif' }}>
        /{N.map(n => n.s || '∅').join(' ').slice(0, Math.ceil(seg(p, 0, 0.35) * N.map(n => n.s || '∅').join(' ').length))}/
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {N.map((n, i) => {
          const a = seg(p, 0.3 + (0.6 * i) / N.length, 0.3 + (0.6 * (i + 1)) / N.length)
          const bg = nodeColor(n)
          return <Tile key={i} w={64} text={n.s} bg={n.s ? bg : '#e9e2d8'} sub={`${categoryOf(n.s)}${n.u ? ' · ˈ' : ''}`} opacity={a} dy={(1 - a) * 28} />
        })}
      </div>
    </>
  )
}

// 2 — aliniere grafem ↔ fonem
function S2({ run, p }: SceneProps) {
  const N = run.base, W = 34, PW = 64
  const spans: [number, number][] = []; let pos = 0
  N.forEach(n => { const s = pos; pos += n.t.length; spans.push([s, pos]) })
  const letters = [...run.word]
  const width = Math.max(letters.length * (W + 4), N.length * (PW + 8)), H = 90
  return (
    <>
      <Caption>Aliniere: fiecare segment ocupă o secvență de litere (∅ = sunet fără literă).</Caption>
      <div style={{ position: 'relative', width, height: 190 }}>
        <div style={{ position: 'absolute', top: 0, display: 'flex', gap: 4 }}>{letters.map((c, i) => <Tile key={i} text={c} />)}</div>
        <svg width={width} height={H} style={{ position: 'absolute', top: 52 }}>
          {N.map((n, i) => {
            const a = seg(p, i / N.length, (i + 1) / N.length)
            const x1 = n.t ? ((spans[i][0] + spans[i][1]) / 2) * (W + 4) - 2 : Math.min(spans[i][0], letters.length) * (W + 4) - 2
            const x2 = i * (PW + 8) + PW / 2
            return <line key={i} x1={x1} y1={0} x2={x1 + (x2 - x1) * a} y2={H * a} stroke={n.t ? '#2b3a55' : '#a0a9bb'} strokeWidth={2} strokeDasharray={n.t ? undefined : '5 4'} />
          })}
        </svg>
        <div style={{ position: 'absolute', top: 140, display: 'flex', gap: 8 }}>
          {N.map((n, i) => { const a = seg(p, i / N.length, (i + 1) / N.length); return <Tile key={i} w={PW} text={n.s} bg={n.s ? nodeColor(n) : '#e9e2d8'} sub={n.t ? `„${n.t}"` : 'fără literă'} opacity={0.25 + 0.75 * a} /> })}
        </div>
      </div>
    </>
  )
}

// 3 — consoane silabice
const FUSIBLE = ['l', 'n', 'm', 'v', 'd', 'k']
function S3({ run, p }: SceneProps) {
  const N = run.base
  const pairs = Math.max(0, N.length - 1)
  const idx = pairs ? Math.min(pairs, Math.floor(p * pairs) + 1) : 0
  const cur = idx ? N[idx] : null, prev = idx ? N[idx - 1] : null
  const flagged = (i: number) => !!run.afterSC[i].syllabicOverride && !run.base[i].syllabicOverride
  const total = N.filter((_, i) => flagged(i)).length
  return (
    <>
      <Caption>Consoane silabice: se verifică fiecare pereche de segmente vecine.</Caption>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {N.map((n, i) => {
          const inWin = idx && (i === idx || i === idx - 1)
          const done = i <= idx - 1 || p >= 1
          return <Tile key={i} w={64} text={n.t} bg={n.s ? nodeColor(n) : '#e9e2d8'} sub={n.s || '∅'} dashed={!n.t}
            outline={flagged(i) && done ? '#000' : inWin ? '#f2a900' : undefined} />
        })}
      </div>
      {cur && prev ? (
        <div style={{ ...box, padding: 10, maxWidth: 520 }}>
          <div style={{ fontSize: 12, color: '#4a5a78', marginBottom: 4 }}>Perechea {idx}/{pairs}: „{prev.s || '∅'}" + „{cur.s || '∅'}"</div>
          <Check ok={prev.t === '' && prev.s === 'ə'} label="anterior = schwa (ə) fără literă" />
          <Check ok={cur.x && cur.t !== ''} label="curent = consoană cu literă proprie" />
          <Check ok={FUSIBLE.includes(cur.s)} label={`sunet curent ∈ {${FUSIBLE.join(', ')}}`} />
          <div style={{ fontSize: 13, marginTop: 4, fontWeight: 700 }}>{flagged(idx) ? '→ marcat: consoană silabică' : '→ nemarcat'}</div>
        </div>
      ) : <div style={{ fontSize: 13 }}>Un singur segment — nu există perechi de verificat.</div>}
      {p >= 1 && <div style={{ fontSize: 13, marginTop: 8 }}>Rezultat: {total} {total === 1 ? 'segment marcat' : 'segmente marcate'}.</div>}
    </>
  )
}

// 4 — r silabic
function S4({ run, p }: SceneProps) {
  const N = run.afterSC
  const cands = N.map((n, i) => i).filter(i => N[i].s === 'r')
  const k = cands.length ? Math.min(cands.length - 1, Math.floor(p * cands.length)) : -1
  const i = k >= 0 ? cands[k] : -1
  const flagged = (x: number) => !!run.afterR[x].syllabicOverride && !run.afterSC[x].syllabicOverride
  const after = i >= 0 ? N.slice(i + 1).some(n => n.s !== '') : false
  const prev = i > 0 ? N[i - 1] : undefined
  const direct = !!prev && !prev.x && prev.s !== '' && prev.s !== 'ə'
  const fused = !!prev && !prev.x && prev.s === 'ə' && prev.t === '' && i >= 2 && !N[i - 2].x && N[i - 2].s !== ''
  return (
    <>
      <Caption>r silabic: se analizează doar segmentele cu sunetul r.</Caption>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {N.map((n, x) => <Tile key={x} w={64} text={n.t} bg={n.s ? nodeColor(n) : '#e9e2d8'} sub={n.s || '∅'} dashed={!n.t}
          outline={flagged(x) && p >= 0.99 ? '#000' : x === i ? '#f2a900' : undefined} />)}
      </div>
      {i < 0 ? <div style={{ fontSize: 13 }}>Niciun segment cu sunetul r — etapa nu are ce verifica.</div> : (
        <div style={{ ...box, padding: 10, maxWidth: 560 }}>
          <div style={{ fontSize: 12, color: '#4a5a78', marginBottom: 4 }}>Candidatul {k + 1}/{cands.length}: segmentul {i + 1}</div>
          <Check ok={N[i].x && N[i].t.toLowerCase() === 'r'} label="grafemul este litera r" />
          <Check ok={!after} label="niciun fonem real după el" />
          <Check ok={!!prev && !prev.x} label="segmentul dinainte este vocală" />
          <Check ok={direct || fused} label={direct ? 'vocală nenulă, nu schwa (direct)' : fused ? 'schwa fără literă, precedat de vocală' : 'vocală directă sau schwa fără literă după vocală'} />
          <div style={{ fontSize: 13, marginTop: 4, fontWeight: 700 }}>{flagged(i) ? '→ marcat: r silabic' : '→ nemarcat'}</div>
        </div>
      )}
    </>
  )
}

// 5 — reguli punctuale
function actionTags(r: RegexRule): string[] {
  const a = r.action, t: string[] = []
  if (a.color) t.push(`culoare ${a.color}`)
  if (a.silent) t.push('literă mută')
  if (a.underline) t.push(`subliniere: ${a.underline}`)
  if (a.syllabicR) t.push('r silabic')
  if (a.glyph) t.push(`diacritic ${a.glyph}`)
  if (a.superscript) t.push(`exponent ${a.superscript}`)
  return t
}
function S5({ run, p }: SceneProps) {
  const L = [...run.word], R = run.rules
  const k = R.length ? Math.min(R.length - 1, Math.floor(p * R.length)) : -1
  const cur = k >= 0 ? R[k] : null
  return (
    <>
      <Caption>Reguli punctuale: {run.enabledCount} active în configurație, {R.length} modifică acest cuvânt.</Caption>
      <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        {L.map((c, i) => <Tile key={i} text={c} bg={cur?.span && i >= cur.span[0] && i < cur.span[1] ? '#ffe08a' : '#eef2f8'} />)}
      </div>
      {!cur ? <div style={{ fontSize: 13 }}>Nicio regulă nu modifică acest cuvânt.</div> : (
        <div style={{ ...box, padding: 10, maxWidth: 620 }}>
          <div style={{ fontSize: 12, color: '#4a5a78' }}>Regula {k + 1}/{R.length} · prioritate {cur.rule.priority}</div>
          <div style={{ fontWeight: 700, margin: '2px 0' }}>{cur.rule.id}</div>
          <div style={{ fontSize: 13 }}>tipar: <code>/{cur.rule.pattern}/{cur.rule.flags ?? ''}</code>{cur.rule.group ? <> · grup {cur.rule.group}</> : null}{cur.rule.phonemicGate ? <> · poartă fonemică: <code>{cur.rule.phonemicGate}</code></> : null}</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>acțiune: {actionTags(cur.rule).join(' · ') || '—'}</div>
          <div style={{ fontSize: 12, color: '#4a5a78', marginTop: 4 }}>{cur.rule.label}</div>
        </div>
      )}
    </>
  )
}

// 6 — decizii de afișare
function S6({ run, p }: SceneProps) {
  const D = run.display
  return (
    <>
      <Caption>Afișare: resolveDisplay ia, pentru fiecare segment, deciziile finale.</Caption>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {D.map((d, i) => {
          const a = seg(p, i / D.length, (i + 1) / D.length)
          const row = (l: string, v: boolean) => <div style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between' }}><span>{l}</span><b>{v ? '✔' : '–'}</b></div>
          return (
            <div key={i} style={{ ...box, width: 104, padding: 6, opacity: 0.15 + 0.85 * a, transform: `translateY(${(1 - a) * 20}px)` }}>
              <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, color: d.color, textDecoration: d.underline ? 'underline' : 'none', textDecorationColor: d.underlineColor, textDecorationThickness: 3, background: d.gradient ? d.gradientCss : undefined, WebkitBackgroundClip: d.gradient ? 'text' : undefined, WebkitTextFillColor: d.gradient ? 'transparent' : undefined }}>{d.glyph ?? d.t ?? '∅'}</div>
              <div style={{ fontSize: 10, textAlign: 'center', color: '#4a5a78', marginBottom: 3 }}>{d.color}</div>
              {row('subliniat', d.underline)}{row('degrade', d.gradient)}{row('mut', d.mute)}{row('silabic', d.syllabic)}{row('silabic V-R', d.syllabicVR)}
              {(d.superscript || d.glyph) && <div style={{ fontSize: 10 }}>{d.glyph ? `glif ${d.glyph}` : ''} {d.superscript ? `exp. ${d.superscript}` : ''}</div>}
            </div>
          )
        })}
      </div>
    </>
  )
}

// 7 — rezultat
function S7({ run, p }: SceneProps) {
  const stages: [string, boolean][] = [
    ['consoane silabice', j(run.base) !== j(run.afterSC)], ['r silabic', j(run.afterSC) !== j(run.afterR)],
    ['reguli punctuale', j(run.afterR) !== j(run.afterRules)], ['afișare', true],
  ]
  return (
    <div style={{ opacity: seg(p, 0, 0.3) }}>
      <Caption>Rezultat: randarea finală, identică cu cea din /learn.</Caption>
      <div style={{ fontSize: 64, lineHeight: 1.3 }}><WordRenderer nodes={run.base} wordStr={run.word} /></div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
        {stages.map(([n, ch]) => <span key={n} style={{ ...box, padding: '3px 8px', background: ch ? '#fff3c4' : '#fff' }}>{n}: {ch ? 'modificat' : 'neschimbat'}</span>)}
      </div>
    </div>
  )
}

// ── cronologie ───────────────────────────────────────────────────────────
const SCENES: { name: string; ms: number; C: (p: SceneProps) => React.ReactElement; say: string }[] = [
  { name: 'Intrare',    ms: 4000, C: S0, say: 'Cuvântul intră ca text.' },
  { name: 'Sunete',     ms: 7000, C: S1, say: 'Se aleg sunetele.' },
  { name: 'Aliniere',   ms: 8000, C: S2, say: 'Sunetele se potrivesc cu literele.' },
  { name: 'Silabice',   ms: 8000, C: S3, say: 'Consoane care țin loc de vocală.' },
  { name: 'R silabic',  ms: 8000, C: S4, say: 'r la sfârșit de silabă.' },
  { name: 'Reguli',     ms: 9000, C: S5, say: 'Excepții scrise de mână.' },
  { name: 'Afișare',    ms: 9000, C: S6, say: 'Se decide aspectul.' },
  { name: 'Rezultat',   ms: 4000, C: S7, say: 'Gata.' },
]
const TOTAL = SCENES.reduce((a, s) => a + s.ms, 0)
const PRESETS = ['bottle', 'bird', 'hour', 'island', 'cat', 'lawyer']

export default function FilmulCuvantului() {
  const [word, setWord] = useState('bottle')
  const [run, setRun] = useState<Run | null>(null)
  const [err, setErr] = useState('')
  const [t, setT] = useState(0)                 // ms pe cronologie
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const last = useRef(0)

  useEffect(() => {
    if (!playing) return
    let raf = 0; last.current = performance.now()
    const loop = (now: number) => {
      const dt = Math.max(0, now - last.current); last.current = now
      setT(x => { const nx = x + dt * speed; if (nx >= TOTAL) { setPlaying(false); return TOTAL } return nx })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, speed])

  async function load(w = word) {
    const clean = w.toLowerCase().trim(); if (!clean) return
    setErr('')
    try {
      const res = await fetch('/api/words', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ words: [clean] }) })
      const data = await res.json() as { results?: Record<string, RenderNode[]> }
      const nodes = data.results?.[clean]
      if (!nodes) { setErr(`„${clean}" nu există în lexicon.`); return }
      setRun(buildRun(clean, nodes)); setT(0); setPlaying(true)
    } catch { setErr('Cererea către /api/words a eșuat.') }
  }

  const starts = useMemo(() => SCENES.reduce<number[]>((a, s, i) => [...a, i ? a[i - 1] + SCENES[i - 1].ms : 0], []), [])
  const si = Math.max(0, Math.min(SCENES.length - 1, starts.filter(s => t >= s).length - 1))
  const p = clamp((t - starts[si]) / SCENES[si].ms)
  const Scene = SCENES[si].C
  const btn: React.CSSProperties = { padding: '6px 12px', borderRadius: 8, border: '1.5px solid #2b3a55', background: '#fff', cursor: 'pointer', fontWeight: 600 }

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif', color: '#1c2740', background: '#f4f7fb', minHeight: '100vh' }}>
      <Link href="/debug/live" style={{ fontSize: 13, color: '#4a5a78' }}>← Live</Link>
      <h1 style={{ margin: '6px 0 10px' }}>Filmul cuvântului</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
        <input value={word} onChange={e => setWord(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} style={{ padding: 8, fontSize: 16, borderRadius: 8, border: '1.5px solid #2b3a55' }} />
        <button style={{ ...btn, background: '#2b3a55', color: '#fff' }} onClick={() => load()}>▶ Redă</button>
        {PRESETS.map(w => <button key={w} style={{ ...btn, borderRadius: 14, padding: '3px 10px', fontWeight: 400 }} onClick={() => { setWord(w); load(w) }}>{w}</button>)}
        <span style={{ marginLeft: 'auto' }}>⏱ {[0.5, 1, 2, 4].map(v => <button key={v} onClick={() => setSpeed(v)} style={{ ...btn, padding: '2px 8px', marginRight: 4, background: speed === v ? '#2b3a55' : '#fff', color: speed === v ? '#fff' : '#2b3a55' }}>{v}×</button>)}</span>
      </div>
      {err && <div style={{ color: '#b00020', marginBottom: 8 }}>{err}</div>}

      <section style={{ ...box, padding: 18, minHeight: 360, display: 'flex', gap: 16 }}>
        <div style={{ flex: '0 0 auto', textAlign: 'center', width: 110 }}>
          <Mascot state={playing ? 'pointing' : 'idle'} size={104} />
          <div style={{ fontSize: 12, marginTop: 4 }}>{SCENES[si].say}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0, overflowX: 'auto' }}>
          <div style={{ fontSize: 12, color: '#4a5a78', marginBottom: 6 }}>Scena {si + 1}/{SCENES.length} · {SCENES[si].name}</div>
          {run ? <Scene run={run} p={p} /> : <div style={{ fontSize: 14 }}>Alege un cuvânt și apasă „Redă".</div>}
        </div>
      </section>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
        <button style={btn} disabled={!run} onClick={() => { setPlaying(false); setT(starts[Math.max(0, si - (p < 0.1 ? 1 : 0))]) }}>⏮</button>
        <button style={btn} disabled={!run} onClick={() => { if (t >= TOTAL) setT(0); setPlaying(x => !x) }}>{playing ? '⏸' : '▶'}</button>
        <button style={btn} disabled={!run} onClick={() => { setPlaying(false); setT(starts[Math.min(SCENES.length - 1, si + 1)]) }}>⏭</button>
        <div style={{ flex: 1, position: 'relative' }}>
          <input type="range" min={0} max={TOTAL} value={t} disabled={!run} onChange={e => { setPlaying(false); setT(+e.target.value) }} style={{ width: '100%' }} />
          <div style={{ display: 'flex', position: 'absolute', left: 0, right: 0, top: 22, pointerEvents: 'none' }}>
            {SCENES.map((s, i) => <div key={s.name} style={{ width: `${(s.ms / TOTAL) * 100}%`, fontSize: 10, textAlign: 'center', fontWeight: i === si ? 800 : 400, color: i === si ? '#2b3a55' : '#8894aa' }}>{s.name}</div>)}
          </div>
        </div>
      </div>
    </main>
  )
}
