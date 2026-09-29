'use client'

// src/app/debug/live/fabrica-de-ciocolata/page.tsx
//
// PROPUNERE (nimic existent modificat): „Fabrica de ciocolată" — vizită ghidată
// prin motorul real al site-ului. Cuvântul e „boaba de cacao"; cele 4 etape
// reale din WordRenderer.tsx (syllabicConsonants → syllabicR → overrides →
// resolveDisplay) sunt mașinile fabricii. Două moduri:
//   • Comandă  — scrii un cuvânt, îl rulezi prin mașinile fabricii (aceleași
//                funcții din engine/ruleConfig), cu snapshot după fiecare etapă
//                și un mini-joc „Inspectorul" (ghicești ce mașină îl schimbă).
//   • Vizită live — ascultă read-only PIPELINE_TRACE_CHANNEL (deschide /learn
//                într-o altă filă) și numără ciocolata produsă pe fiecare mașină.
// Datele „boabelor" vin din POST /api/words (aceeași sursă ca /learn).
// Ghidaj: comentariile sunt descriptive (ce intră, ce face mașina, ce s-a
// schimbat exact); viteza (0.5×–4×), pauza și pasul manual sunt disponibile.

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import WordRenderer from '@/components/WordRenderer'
import type { RenderNode } from '@/lib/renderNode'
import { DEFAULT_CONFIG, applyRegexOverrides } from '@/lib/ruleConfig'
import { resolveDisplay, applySyllabicConsonantDetection, applySyllabicRDetection } from '@/lib/engine'
import type { PipelineStageId } from '@/lib/pipelineTrace'
import { useLiveTrace } from '../_useLiveTrace'

interface Machine { id: 'lexicon' | PipelineStageId; emoji: string; name: string; job: string; detail: string }
const MACHINES: Machine[] = [
  { id: 'lexicon', emoji: '🫘', name: 'Recepție', job: 'Cuvântul se sparge în sunete.',
    detail: 'Cuvântul este căutat în lexicon (lexicon.db). Pronunția IPA este aliniată cu literele; fiecare segment primește litere, sunet, culoare, accent și tipul consoană/vocală.' },
  { id: 'syllabicConsonants', emoji: '🔥', name: 'Prăjitor', job: 'Caută consoane care sunt silabă singure.',
    detail: 'Ex.: „l" din „bottle", „n" din „button". Segmentele găsite sunt marcate ca silabice (applySyllabicConsonantDetection).' },
  { id: 'syllabicR', emoji: '⚙️', name: 'Moara de R', job: 'Caută r-ul special (bird, fire, hour).',
    detail: 'Detectează r-ul silabic și combinațiile vocală + r; le marchează pentru afișare specială (applySyllabicRDetection).' },
  { id: 'overrides', emoji: '🧪', name: 'Rețete', job: 'Aplică reguli pentru cuvinte speciale.',
    detail: 'Regulile din rules/overrides potrivesc un tipar pe litere și schimbă culoarea, litera mută, sublinierea sau diacriticul (applyRegexOverrides), în ordinea priorității.' },
  { id: 'resolveDisplay', emoji: '🎁', name: 'Ambalare', job: 'Alege culorile finale.',
    detail: 'resolveDisplay stabilește forma finală a fiecărui segment: culoare, litera mută în gri, subliniere de accent, diacritice, degradeuri.' },
]
const PRESETS = ['bottle', 'bird', 'hour', 'island', 'cat', 'lawyer', 'near']
const STEP_MS = 1500

type Snap = { t?: string; s?: string; c?: string; [k: string]: unknown }[]
interface Run {
  word: string
  base: RenderNode[]
  snaps: Snap[]                       // câte una pentru fiecare mașină (0..4)
  changed: boolean[]                  // dacă mașina a schimbat ceva (lexicon = mereu false)
  rules: { id: string; label: string }[]
}

const j = (x: unknown) => JSON.stringify(x)
function runPipeline(word: string, base: RenderNode[]): Run {
  const a = applySyllabicConsonantDetection(base)
  const b = applySyllabicRDetection(a)
  const c = applyRegexOverrides(word, b, DEFAULT_CONFIG.regexRules)
  const d = resolveDisplay(c)
  const snaps = [base, a, b, c, d].map(x => x as unknown as Snap)
  const changed = snaps.map((s, i) => (i === 0 ? false : j(s) !== j(snaps[i - 1])))
  // aproximare: regulile care, aplicate SINGUR, schimbă cuvântul
  const rules = DEFAULT_CONFIG.regexRules
    .filter(r => r.enabled && j(applyRegexOverrides(word, b, [r])) !== j(b))
    .map(r => ({ id: r.id, label: r.label }))
  return { word, base, snaps, changed, rules }
}

function diffKeys(prev: Snap | null, cur: Snap): string[] {
  if (!prev) return []
  if (prev.length !== cur.length) return ['structură (nr. de segmente)']
  const out = new Set<string>()
  cur.forEach((n, i) => {
    for (const k of new Set([...Object.keys(n), ...Object.keys(prev[i])]))
      if (j(n[k]) !== j(prev[i][k])) out.add(k)
  })
  return [...out]
}

function short(v: unknown) { const x = j(v); return x === undefined ? '—' : x.length > 18 ? x.slice(0, 17) + '…' : x }
/** Descriere factuală a diferențelor dintre două snapshot-uri. */
function describe(prev: Snap | null, cur: Snap): string[] {
  if (!prev) return []
  if (prev.length !== cur.length) return [`Numărul de segmente: ${prev.length} → ${cur.length}.`]
  const out: string[] = []
  cur.forEach((n, i) => {
    const keys = [...new Set([...Object.keys(n), ...Object.keys(prev[i])])].filter(k => j(n[k]) !== j(prev[i][k]))
    if (keys.length) out.push(`Segmentul ${i + 1} („${n.t || '∅'}"): ${keys.map(k => `${KEY_LABEL[k] ?? k} ${short(prev[i][k])} → ${short(n[k])}`).join('; ')}.`)
  })
  return out
}

const KEY_LABEL: Record<string, string> = {
  c: 'culoare', s: 'sunet', t: 'litere', u: 'accent', x: 'consoană',
  syllabicOverride: 'consoană silabică', underlineOverride: 'subliniere',
  glyphOverride: 'diacritic', superscriptOverride: 'semn ridicat', colorOverride: 'culoare forțată',
}

function isDark(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex); if (!m) return false
  const n = parseInt(m[1], 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) < 150
}
function Chips({ snap, prev }: { snap: Snap; prev: Snap | null }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {snap.map((n, i) => {
        const bg = typeof n.c === 'string' && n.c ? n.c : '#efe6dc'
        const diff = prev && prev.length === snap.length && j(n) !== j(prev[i])
        return (
          <span key={i} title={`${n.s ?? ''}`} style={{
            minWidth: 26, padding: '4px 7px', textAlign: 'center', borderRadius: 8, fontWeight: 700, fontSize: 18,
            background: bg, color: isDark(bg) ? '#fff' : '#3b2418',
            outline: diff ? '3px solid #ffb703' : '1px solid #0002', outlineOffset: 1,
            animation: diff ? 'fc-pop .5s ease' : undefined,
          }}>{n.t ? n.t : '∅'}</span>
        )
      })}
    </div>
  )
}

const SPEEDS = [0.5, 1, 2, 4]

export default function FabricaDeCiocolata() {
  const [tab, setTab] = useState<'comanda' | 'live'>('comanda')
  const [word, setWord] = useState('bottle')
  const [run, setRun] = useState<Run | null>(null)
  const [err, setErr] = useState('')
  const [step, setStep] = useState(0)          // 0..4 = mașina curentă; 5 = terminat
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [guess, setGuess] = useState<string>('none')
  const [tickets, setTickets] = useState(0)
  const [verdict, setVerdict] = useState('')
  const scored = useRef<Run | null>(null)

  // avans automat: o mașină la STEP_MS / viteză
  useEffect(() => {
    if (!run || !playing || step >= 5) return
    const t = setTimeout(() => setStep(x => Math.min(5, x + 1)), STEP_MS / speed)
    return () => clearTimeout(t)
  }, [run, playing, step, speed])

  // la final: se verifică predicția Inspectorului (o singură dată per rulare)
  useEffect(() => {
    if (!run || step < 5 || scored.current === run) return
    scored.current = run
    setPlaying(false)
    const changedIds = MACHINES.filter((_, k) => k > 0 && k < 4 && run.changed[k]).map(m => m.id as string)
    const guessName = guess === 'none' ? 'niciuna' : MACHINES.find(m => m.id === guess)?.name
    const realName = changedIds.length ? changedIds.map(id => MACHINES.find(m => m.id === id)?.name).join(', ') : 'niciuna'
    const ok = guess === 'none' ? changedIds.length === 0 : changedIds.includes(guess)
    if (ok) setTickets(t => t + 1)
    setVerdict(`${ok ? '✅ +🎟️' : '❌'}  Ai ales: ${guessName}. Schimbat de: ${realName}.`)
  }, [run, step, guess])

  async function start(w = word) {
    const clean = w.toLowerCase().trim()
    if (!clean) return
    setErr(''); setVerdict(''); setRun(null); setPlaying(false)
    try {
      const res = await fetch('/api/words', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ words: [clean] }) })
      const data = await res.json() as { results?: Record<string, RenderNode[]> }
      const nodes = data.results?.[clean]
      if (!nodes) { setErr(`Cuvântul „${clean}" nu există în lexicon.`); return }
      setRun(runPipeline(clean, nodes)); setStep(0); setPlaying(true)
    } catch { setErr('Cererea către /api/words a eșuat (serverul Next și lexicon.db trebuie să ruleze).') }
  }

  const locked = !!run && step < 5
  const shown = run ? Math.min(step, 4) : -1
  const lines = run && shown > 0 ? describe(run.snaps[shown - 1], run.snaps[shown]) : []
  const wrap: React.CSSProperties = { background: '#fffaf3', border: '2px solid #5a3a26', borderRadius: 14, padding: 14 }
  const btn: React.CSSProperties = { padding: '6px 12px', borderRadius: 8, border: '1px solid #5a3a26', background: '#fff', cursor: 'pointer', fontWeight: 600 }

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif', color: '#3b2418', background: '#fbf3e8', minHeight: '100vh' }}>
      <style>{`
        @keyframes fc-pop { 0% { transform: scale(.6) } 60% { transform: scale(1.25) } 100% { transform: scale(1) } }
        @keyframes fc-steam { 0%,100% { transform: translateY(0); opacity: .9 } 50% { transform: translateY(-6px); opacity: .5 } }
        @keyframes fc-bean { from { transform: translateX(0) } to { transform: translateX(6px) } }
      `}</style>
      <Link href="/debug/live" style={{ fontSize: 13, color: '#8a5a3a' }}>← Live</Link>
      <h1 style={{ margin: '6px 0 2px' }}>🍫 Fabrica de ciocolată EiC</h1>
      <p style={{ margin: '0 0 12px', fontSize: 14 }}>Un cuvânt intră pe bandă și trece prin 5 mașini. Urmărește culorile. 🟡 = ce s-a schimbat.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {(['comanda', 'live'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 14px', borderRadius: 10, border: '2px solid #5a3a26', background: tab === t ? '#5a3a26' : '#fff', color: tab === t ? '#fff' : '#5a3a26', fontWeight: 700, cursor: 'pointer' }}>
            {t === 'comanda' ? '🎫 Parcurs ghidat' : '🔴 Vizită live'}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontWeight: 700 }}>🎟️ Bilete: {tickets}</span>
      </div>

      {tab === 'comanda' && (
        <>
          <section style={{ ...wrap, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <input value={word} onChange={e => setWord(e.target.value)} onKeyDown={e => e.key === 'Enter' && start()} placeholder="un cuvânt englezesc" style={{ padding: 8, fontSize: 16, borderRadius: 8, border: '2px solid #5a3a26' }} />
              <button onClick={() => start()} style={{ ...btn, background: '#c8722a', color: '#fff', border: 'none' }}>▶ Pornește parcursul</button>
              {PRESETS.map(p => <button key={p} onClick={() => { setWord(p); start(p) }} style={{ ...btn, borderRadius: 14, padding: '3px 10px', fontWeight: 400 }}>{p}</button>)}
            </div>
            <div style={{ marginTop: 10, fontSize: 14, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <span>
                🔍 Ghicește: ce mașină schimbă cuvântul?{' '}
                <select value={guess} disabled={locked} onChange={e => setGuess(e.target.value)}>
                  <option value="none">niciuna</option>
                  {MACHINES.slice(1, 4).map(m => <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>)}
                </select>
              </span>
              <span>
                ⏱{' '}
                {SPEEDS.map(v => <button key={v} onClick={() => setSpeed(v)} style={{ ...btn, padding: '2px 8px', marginRight: 4, background: speed === v ? '#5a3a26' : '#fff', color: speed === v ? '#fff' : '#5a3a26' }}>{v}×</button>)}
              </span>
            </div>
            {err && <div style={{ marginTop: 8, color: '#b00020' }}>{err}</div>}
          </section>

          <section style={{ ...wrap, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 6 }}>
              {MACHINES.map((m, i) => {
                const active = !!run && step === i
                const done = !!run && step > i
                return (
                  <div key={m.id} onClick={() => run && setStep(i)} style={{ flex: 1, textAlign: 'center', padding: 8, borderRadius: 12, cursor: run ? 'pointer' : 'default', border: `2px solid ${active ? '#c8722a' : '#d9c3ad'}`, background: active ? '#fff1de' : done ? '#f4e6d6' : '#fff', position: 'relative' }}>
                    <div style={{ fontSize: 11, color: '#8a5a3a' }}>{i + 1}</div>
                    <div style={{ fontSize: 30, animation: active && playing ? 'fc-steam 1s infinite' : undefined }}>{m.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{m.name}</div>
                    {done && i > 0 && <div style={{ fontSize: 16, marginTop: 2 }}>{run?.changed[i] ? '🟡' : '⚪'}</div>}
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
              <button style={btn} disabled={!run || step <= 0} onClick={() => { setPlaying(false); setStep(x => Math.max(0, x - 1)) }}>⏮ Înapoi</button>
              <button style={btn} disabled={!run || step >= 5} onClick={() => setPlaying(p => !p)}>{playing ? '⏸ Pauză' : '▶ Continuă'}</button>
              <button style={btn} disabled={!run || step >= 5} onClick={() => { setPlaying(false); setStep(x => Math.min(5, x + 1)) }}>⏭ Înainte</button>
              
            </div>
          </section>

          {run && shown >= 0 && (
            <section style={wrap}>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{MACHINES[shown].emoji} {MACHINES[shown].name} — {MACHINES[shown].job}</div>
              {shown === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 28, fontWeight: 700 }}>{run.word}</span>
                  <span style={{ fontSize: 26 }}>➜</span>
                  <Chips snap={run.snaps[0]} prev={null} />
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ opacity: .6 }}><Chips snap={run.snaps[shown - 1]} prev={null} /></div>
                  <span style={{ fontSize: 30 }}>{MACHINES[shown].emoji}➜</span>
                  <Chips snap={run.snaps[shown]} prev={run.snaps[shown - 1]} />
                  <span style={{ fontSize: 22 }}>{run.changed[shown] ? '🟡' : '⚪'}</span>
                </div>
              )}
              {shown === 3 && run.rules.length > 0 && (
                <div style={{ marginTop: 10 }}>🧾 {run.rules.map(r => <code key={r.id} title={r.label} style={{ marginRight: 8, background: '#fff1de', padding: '2px 6px', borderRadius: 6 }}>{r.id}</code>)}</div>
              )}
              <details style={{ marginTop: 12, fontSize: 13 }}>
                <summary style={{ cursor: 'pointer', color: '#8a5a3a' }}>Detalii tehnice</summary>
                <p style={{ margin: '6px 0' }}>{MACHINES[shown].detail}</p>
                {shown > 0 && run.changed[shown] && (
                  <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                    {lines.slice(0, 8).map((l, i) => <li key={i}>{l}</li>)}
                    {lines.length > 8 && <li>… +{lines.length - 8}</li>}
                  </ul>
                )}
                {shown === 0 && <p style={{ margin: 0 }}>Sunete: <code>{run.snaps[0].map(n => n.s || '∅').join(' ')}</code></p>}
                {shown === 3 && run.rules.length > 0 && (
                  <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>{run.rules.map(r => <li key={r.id}><code>{r.id}</code> — {r.label}</li>)}</ul>
                )}
              </details>
            </section>
          )}

          {run && step >= 5 && (
            <section style={{ ...wrap, marginTop: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>🍫</div>
              <div style={{ fontSize: 56, lineHeight: 1.3 }}><WordRenderer nodes={run.base} wordStr={run.word} /></div>
              {verdict && <div style={{ marginTop: 6, fontSize: 15 }}>{verdict}</div>}
            </section>
          )}
        </>
      )}

      {tab === 'live' && <LiveTour />}
    </main>
  )
}

function LiveTour() {
  const { history, connected } = useLiveTrace(60)
  const totals = useMemo(() => {
    const m: Record<string, { n: number; ch: number }> = {}
    for (const e of history) { const s = (m[e.stage] ??= { n: 0, ch: 0 }); s.n++; if (e.changed) s.ch++ }
    return m
  }, [history])
  const words = useMemo(() => [...new Set(history.map(e => e.word))].slice(-12).reverse(), [history])
  const wrap: React.CSSProperties = { background: '#fffaf3', border: '2px solid #5a3a26', borderRadius: 14, padding: 14, marginBottom: 14 }
  return (
    <>
      <section style={wrap}>
        <b>{connected ? '🟢 Conectat' : '⚪ Deconectat'}</b>{' '}
        — deschide <Link href="/learn" target="_blank">/learn</Link> în altă filă și apasă pe cuvinte. 🟡 = mașina a schimbat cuvântul, • = l-a lăsat la fel.
      </section>
      <section style={{ ...wrap, display: 'flex', gap: 6 }}>
        {MACHINES.slice(1).map(m => {
          const t = totals[m.id] ?? { n: 0, ch: 0 }
          return (
            <div key={m.id} style={{ flex: 1, textAlign: 'center', padding: 8, borderRadius: 12, border: '2px solid #d9c3ad', background: '#fff' }}>
              <div style={{ fontSize: 30 }}>{m.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{m.name}</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{t.n}</div>
              <div style={{ fontSize: 11 }}>🟡 {t.ch}</div>
              <div style={{ height: 6, borderRadius: 3, background: '#eee', marginTop: 4 }}><div style={{ height: 6, borderRadius: 3, background: '#c8722a', width: `${t.n ? (t.ch / t.n) * 100 : 0}%` }} /></div>
            </div>
          )
        })}
      </section>
      <section style={wrap}>
        <b>Ultimele cuvinte procesate</b>
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {words.length === 0 && <span style={{ fontSize: 13 }}>…</span>}
          {words.map(w => {
            const ev = history.filter(e => e.word === w)
            return (
              <span key={w} style={{ padding: '4px 10px', background: '#fff', border: '1px solid #d9c3ad', borderRadius: 12, fontSize: 14 }}>
                {w}{' '}
                {MACHINES.slice(1).map(m => { const e = ev.find(x => x.stage === m.id); return <span key={m.id} title={m.name} style={{ opacity: e ? 1 : 0.2 }}>{e?.changed ? '🟡' : '•'}</span> })}
              </span>
            )
          })}
        </div>
      </section>
    </>
  )
}
