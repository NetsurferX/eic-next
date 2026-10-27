'use client'
// 25 de mini-jocuri wireframe, câte unul pe coloană din LEVELS.
// Autonom: citește doar LEVELS (read-only), nu atinge motorul, WordRenderer,
// gameTypes.ts sau /learn. Culoarea sunetului = lesson.color (fără engine).
// Distractorii vin din ALTE coloane, de altă culoare, și NU conțin grupul de
// litere al coloanei curente (filtrare conservatoare, vezi buildPool în
// [id]/page.tsx) — ca un cuvânt „greșit” să nu aibă din greșeală sunetul.

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Accent, Lesson, LessonWord } from '@/lib/levels'
import s from './page.module.css'

export interface GP { lesson: Lesson; pool: LessonWord[]; again: () => void }
interface Item { w: LessonWord; ok: boolean }

// ── utilitare ───────────────────────────────────────────────────────────
function shuffle<T>(a: T[]): T[] {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] }
  return r
}
const take = <T,>(a: T[], n: number): T[] => shuffle(a).slice(0, n)
const one = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]
function cyc<T>(a: T[], n: number): T[] {
  const out: T[] = []
  while (out.length < n) out.push(...shuffle(a))
  return out.slice(0, n)
}
function mixed(l: Lesson, pool: LessonWord[], nOk: number, nBad: number): Item[] {
  return shuffle([
    ...cyc(l.words, nOk).map(w => ({ w, ok: true })),
    ...take(pool, nBad).map(w => ({ w, ok: false })),
  ])
}
export function say(t: string, acc?: Accent) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(t)
  u.lang = acc === 'en-GB' ? 'en-GB' : 'en-US'
  u.rate = 0.8
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}
const wait = (ms: number, f: () => void) => window.setTimeout(f, ms)

// Cuvânt cu partea-sunet colorată (sau simplu, dacă `bare`)
function W({ w, color, bare, size = 26 }: { w: LessonWord; color?: string; bare?: boolean; size?: number }) {
  const i = w.mark ? w.text.indexOf(w.mark) : -1
  const base = { fontSize: size, fontWeight: 700 as const }
  if (bare || i < 0 || !color) return <span style={base}>{w.text}</span>
  return (
    <span style={base}>
      {w.text.slice(0, i)}
      <span style={{ color, textDecoration: color === '#000000' ? 'underline' : undefined }}>{w.mark}</span>
      {w.text.slice(i + w.mark.length)}
    </span>
  )
}
function End({ score, total, again, note }: { score: number; total: number; again: () => void; note?: string }) {
  return (
    <div className={s.end}>
      <div style={{ fontSize: 44 }}>{score >= total * 0.8 ? '🦊🎉' : '🦊'}</div>
      <p style={{ fontSize: 20 }}>Scor: <b>{score}</b> / {total}</p>
      {note && <p style={{ color: '#777' }}>{note}</p>}
      <button className={s.btn} onClick={again}>Din nou</button>
    </div>
  )
}
function Stat({ children }: { children: ReactNode }) { return <div className={s.stat}>{children}</div> }

// ── 1. a — Balonul ──────────────────────────────────────────────────────
function Balloons({ lesson, pool, again }: GP) {
  const N = 12
  const items = useMemo(() => mixed(lesson, pool, 7, 5), [lesson, pool])
  const [sp, setSp] = useState(0)
  const [live, setLive] = useState<(Item & { id: number; x: number })[]>([])
  const [hit, setHit] = useState(0); const [bad, setBad] = useState(0); const [lost, setLost] = useState(0)
  useEffect(() => {
    if (sp >= N) return
    const t = window.setTimeout(() => {
      setLive(l => [...l, { ...items[sp], id: sp, x: 4 + Math.random() * 70 }])
      setSp(sp + 1)
    }, sp === 0 ? 200 : 1000)
    return () => window.clearTimeout(t)
  }, [sp, items])
  if (sp >= N && live.length === 0) return <End score={hit} total={7} note={`greșeli: ${bad} · scăpate: ${lost}`} again={again} />
  const gone = (b: Item & { id: number }, tapped: boolean) => {
    setLive(l => l.filter(x => x.id !== b.id))
    if (tapped) { if (b.ok) setHit(h => h + 1); else setBad(h => h + 1) } else if (b.ok) setLost(h => h + 1)
  }
  return (
    <>
      <Stat><span>Sparte corect: {hit}</span><span>Greșit: {bad}</span></Stat>
      <div className={s.sky}>
        {live.map(b => (
          <button key={b.id} className={`${s.bubble} ${s.rise}`} style={{ left: `${b.x}%`, borderColor: lesson.color }}
            onClick={() => gone(b, true)} onAnimationEnd={() => gone(b, false)}>
            <W w={b.w} bare size={20} />
          </button>
        ))}
      </div>
    </>
  )
}

// ── 2. e — Perechi (cuvânt ↔ literele sunetului) ───────────────────────
function Memory({ lesson, again }: GP) {
  const cards = useMemo(() => {
    const seen = new Set<string>()
    const uniq = shuffle(lesson.words).filter(w => (seen.has(w.mark) ? false : (seen.add(w.mark), true)))
    const ws = uniq.slice(0, 4)
    return shuffle(ws.flatMap(w => [{ w, kind: 'w' as const }, { w, kind: 'm' as const }]))
  }, [lesson])
  const [open, setOpen] = useState<number[]>([])
  const [got, setGot] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const tap = (i: number) => {
    if (open.length === 2 || open.includes(i) || got.includes(i)) return
    const n = [...open, i]; setOpen(n)
    if (n.length === 2) {
      setMoves(m => m + 1)
      const [a, b] = [cards[n[0]], cards[n[1]]]
      if (a.kind !== b.kind && a.w.mark === b.w.mark) { setGot(g => [...g, ...n]); setOpen([]) }
      else wait(800, () => setOpen([]))
    }
  }
  if (got.length === cards.length) return <End score={cards.length / 2} total={cards.length / 2} note={`mutări: ${moves}`} again={again} />
  return (
    <>
      <Stat><span>Mutări: {moves}</span><span>Potrivește cuvântul cu literele colorate</span></Stat>
      <div className={s.row}>
        {cards.map((c, i) => {
          const up = open.includes(i) || got.includes(i)
          return (
            <button key={i} className={`${s.opt} ${got.includes(i) ? s.good : ''}`} style={{ width: 130, height: 80 }} onClick={() => tap(i)}>
              {!up ? '❓' : c.kind === 'w' ? <W w={c.w} bare size={22} /> : <span style={{ color: lesson.color, fontWeight: 800, fontSize: 28 }}>{c.w.mark}</span>}
            </button>
          )
        })}
      </div>
    </>
  )
}

// ── 3. o — Coșul de paie (cădere + mișcare) ─────────────────────────────
interface F extends Item { id: number; x: number; y: number }
function Basket({ lesson, pool, again }: GP) {
  const N = 14
  const items = useMemo(() => mixed(lesson, pool, 8, 6), [lesson, pool])
  const [st, setSt] = useState({ t: 0, sp: 0, bx: 50, fall: [] as F[], hit: 0, bad: 0, lost: 0, lives: 3, done: false })
  useEffect(() => {
    const iv = window.setInterval(() => setSt(p => {
      if (p.done) return p
      const t = p.t + 1
      let { sp, hit, bad, lost, lives } = p
      let fall = p.fall
      if (t % 16 === 0 && sp < N) { fall = [...fall, { ...items[sp], id: sp, x: 10 + Math.random() * 80, y: 0 }]; sp++ }
      fall = fall.map(f => ({ ...f, y: f.y + 2.5 }))
      const rest: F[] = []
      for (const f of fall) {
        if (f.y >= 82 && Math.abs(f.x - p.bx) <= 13) { if (f.ok) hit++; else { bad++; lives-- } }
        else if (f.y > 100) { if (f.ok) lost++ }
        else rest.push(f)
      }
      return { ...p, t, sp, fall: rest, hit, bad, lost, lives, done: lives <= 0 || (sp >= N && rest.length === 0) }
    }), 60)
    return () => window.clearInterval(iv)
  }, [items])
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setSt(p => ({ ...p, bx: Math.max(5, p.bx - 8) }))
      if (e.key === 'ArrowRight') setSt(p => ({ ...p, bx: Math.min(95, p.bx + 8) }))
    }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [])
  if (st.done) return <End score={st.hit} total={8} note={`greșit prinse: ${st.bad} · scăpate: ${st.lost}`} again={again} />
  return (
    <>
      <Stat><span>Prinse: {st.hit}</span><span>{'❤️'.repeat(Math.max(0, st.lives))}</span><span>← → sau mută cu degetul</span></Stat>
      <div className={s.field} onPointerMove={e => {
        const r = e.currentTarget.getBoundingClientRect()
        const bx = Math.min(95, Math.max(5, ((e.clientX - r.left) / r.width) * 100))
        setSt(p => ({ ...p, bx }))
      }}>
        {st.fall.map(f => <div key={f.id} className={s.faller} style={{ left: `${f.x}%`, top: `${f.y}%` }}><W w={f.w} bare size={18} /></div>)}
        <div className={s.basket} style={{ left: `${st.bx}%` }}>🧺</div>
      </div>
    </>
  )
}

// ── 4. i — Da / Nu rapid ────────────────────────────────────────────────
function YesNo({ lesson, pool, again }: GP) {
  const items = useMemo(() => mixed(lesson, pool, 6, 4), [lesson, pool])
  const [i, setI] = useState(0); const [score, setScore] = useState(0)
  const [fb, setFb] = useState<null | boolean>(null)
  if (i >= items.length) return <End score={score} total={items.length} again={again} />
  const it = items[i]
  const ans = (yes: boolean) => {
    if (fb !== null) return
    const ok = yes === it.ok
    setFb(ok); if (ok) setScore(x => x + 1)
    wait(700, () => { setFb(null); setI(x => x + 1) })
  }
  return (
    <>
      <Stat><span>{i + 1} / {items.length}</span><span>Scor: {score}</span></Stat>
      <p className={s.prompt}>Are cuvântul sunetul?</p>
      <div className={`${s.big} ${fb === false ? s.shake : ''}`}><W w={it.w} color={lesson.color} bare={fb === null} size={46} /></div>
      <div className={s.row}>
        <button className={`${s.opt} ${fb !== null && it.ok ? s.good : ''}`} disabled={fb !== null} onClick={() => ans(true)}>👍 Da</button>
        <button className={`${s.opt} ${fb !== null && !it.ok ? s.good : ''}`} disabled={fb !== null} onClick={() => ans(false)}>👎 Nu</button>
      </div>
    </>
  )
}

// ── 5. æ — Literele colorate ────────────────────────────────────────────
function Letters({ lesson, again }: GP) {
  const words = useMemo(() => cyc(lesson.words, 6), [lesson])
  const [i, setI] = useState(0); const [sel, setSel] = useState<number[]>([]); const [res, setRes] = useState<null | boolean>(null); const [score, setScore] = useState(0)
  if (i >= words.length) return <End score={score} total={words.length} again={again} />
  const w = words[i]; const st = w.text.indexOf(w.mark)
  const want = st < 0 ? [] : Array.from({ length: w.mark.length }, (_, k) => st + k)
  const check = () => {
    const ok = sel.length === want.length && want.every(x => sel.includes(x))
    setRes(ok); if (ok) setScore(x => x + 1)
    wait(1100, () => { setRes(null); setSel([]); setI(x => x + 1) })
  }
  return (
    <>
      <Stat><span>{i + 1} / {words.length}</span><span>Scor: {score}</span></Stat>
      <p className={s.prompt}>Bifează literele care poartă sunetul coloanei.</p>
      {res === null ? (
        <div className={s.row}>
          {w.text.split('').map((c, k) => (
            <button key={k} className={`${s.tile} ${sel.includes(k) ? s.chipSel : ''}`}
              onClick={() => setSel(x => x.includes(k) ? x.filter(y => y !== k) : [...x, k])}>{c}</button>
          ))}
        </div>
      ) : <div className={s.big}><W w={w} color={lesson.color} size={46} /> {res ? '✅' : '❌'}</div>}
      <div className={s.row}><button className={s.btn} disabled={res !== null || sel.length === 0} onClick={check}>Verifică</button></div>
    </>
  )
}

// ── 6. uː — Dictare ─────────────────────────────────────────────────────
function Dictation({ lesson, pool, again }: GP) {
  const rounds = useMemo(() => cyc(lesson.words, 6).map(w => ({ w, opts: shuffle([w, ...take(pool, 2)]) })), [lesson, pool])
  const [i, setI] = useState(0); const [score, setScore] = useState(0); const [pick, setPick] = useState<string | null>(null)
  const r = rounds[i]
  useEffect(() => { if (r) say(r.w.text, r.w.accent ?? lesson.accent) }, [r, lesson.accent])
  if (!r) return <End score={score} total={rounds.length} again={again} />
  const ans = (t: string) => {
    if (pick) return
    setPick(t); if (t === r.w.text) setScore(x => x + 1)
    wait(900, () => { setPick(null); setI(x => x + 1) })
  }
  return (
    <>
      <Stat><span>{i + 1} / {rounds.length}</span><span>Scor: {score}</span></Stat>
      <div className={s.center}><button className={s.btn} onClick={() => say(r.w.text, r.w.accent ?? lesson.accent)}>🔊 Ascultă</button></div>
      <div className={s.row}>
        {r.opts.map(o => (
          <button key={o.text} className={`${s.opt} ${pick && o.text === r.w.text ? s.good : ''} ${pick === o.text && o.text !== r.w.text ? s.badc : ''}`} onClick={() => ans(o.text)}>
            <W w={o} color={lesson.color} bare={!pick} size={24} />
          </button>
        ))}
      </div>
    </>
  )
}

// ── 7. əʊ — Turnul ──────────────────────────────────────────────────────
function Tower({ lesson, pool, again }: GP) {
  const GOAL = 8
  const [h, setH] = useState(0); const [errs, setErrs] = useState(0); const [n, setN] = useState(0)
  const opts = useMemo(() => shuffle([{ w: one(lesson.words), ok: true }, { w: one(pool), ok: false }]), [lesson, pool, n])
  if (h >= GOAL || errs >= 3) return <End score={h} total={GOAL} note={h >= GOAL ? 'Turn terminat!' : 'Turnul s-a dărâmat'} again={again} />
  const ans = (ok: boolean) => { if (ok) setH(x => x + 1); else { setErrs(x => x + 1); setH(x => Math.max(0, x - 1)) } setN(x => x + 1) }
  return (
    <>
      <Stat><span>Înălțime: {h} / {GOAL}</span><span>Greșeli: {errs} / 3</span></Stat>
      <p className={s.prompt}>Care cuvânt are sunetul?</p>
      <div className={s.row}>{opts.map(o => <button key={o.w.text} className={s.opt} onClick={() => ans(o.ok)}><W w={o.w} bare /></button>)}</div>
      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column-reverse', minHeight: 120 }}>
        {Array.from({ length: h }, (_, k) => <div key={k} className={s.block} style={{ background: lesson.color, marginLeft: `calc(50% - 60px + ${(k % 2) * 6}px)` }} />)}
      </div>
    </>
  )
}

// ── 8. eɪ — Litere amestecate ───────────────────────────────────────────
function Scramble({ lesson, again }: GP) {
  const words = useMemo(() => take(lesson.words.filter(w => w.text.length >= 3), 5), [lesson])
  const [i, setI] = useState(0); const [typed, setTyped] = useState(0); const [used, setUsed] = useState<number[]>([]); const [mist, setMist] = useState(0)
  const w = words[i]
  const tiles = useMemo(() => {
    if (!w) return []
    let t = w.text.split('')
    for (let k = 0; k < 5; k++) { t = shuffle(w.text.split('')); if (t.join('') !== w.text) break }
    return t
  }, [w])
  if (!w) return <End score={words.length} total={words.length} note={`greșeli: ${mist}`} again={again} />
  const done = typed === w.text.length
  const tap = (k: number) => {
    if (done || used.includes(k)) return
    if (tiles[k].toLowerCase() === w.text[typed].toLowerCase()) {
      const t = typed + 1; setTyped(t); setUsed(u => [...u, k])
      if (t === w.text.length) wait(1000, () => { setI(x => x + 1); setTyped(0); setUsed([]) })
    } else setMist(m => m + 1)
  }
  return (
    <>
      <Stat><span>{i + 1} / {words.length}</span><span>Greșeli: {mist}</span></Stat>
      <div className={s.big}>{done ? <W w={w} color={lesson.color} size={46} /> : w.text.slice(0, typed) + '＿'.repeat(w.text.length - typed)}</div>
      <div className={s.row}>{tiles.map((c, k) => <button key={k} className={s.tile} disabled={used.includes(k)} onClick={() => tap(k)}>{c}</button>)}</div>
    </>
  )
}

// ── 9. juː — Spânzurătoarea ─────────────────────────────────────────────
function Hangman({ lesson, again }: GP) {
  const words = useMemo(() => take(lesson.words, 3), [lesson])
  const [i, setI] = useState(0); const [g, setG] = useState<string[]>([]); const [miss, setMiss] = useState(0); const [score, setScore] = useState(0)
  const w = words[i]
  if (!w) return <End score={score} total={words.length} again={again} />
  const low = w.text.toLowerCase()
  const solved = low.split('').every(c => g.includes(c))
  const lost = miss >= 6
  const next = () => { if (solved) setScore(x => x + 1); setI(x => x + 1); setG([]); setMiss(0) }
  const guess = (c: string) => { if (g.includes(c) || solved || lost) return; setG(x => [...x, c]); if (!low.includes(c)) setMiss(m => m + 1) }
  const st = w.text.indexOf(w.mark)
  return (
    <>
      <Stat><span>Cuvânt {i + 1} / {words.length}</span><span>{'❤️'.repeat(6 - miss)}{'🖤'.repeat(miss)}</span></Stat>
      <div className={s.big} style={{ letterSpacing: 6 }}>
        {w.text.split('').map((c, k) => {
          const show = g.includes(c.toLowerCase()) || lost
          const inMark = st >= 0 && k >= st && k < st + w.mark.length
          return <span key={k} style={{ color: show && inMark ? lesson.color : undefined }}>{show ? c : '＿'}</span>
        })}
      </div>
      <div className={s.row}>
        {'abcdefghijklmnopqrstuvwxyz'.split('').map(c => (
          <button key={c} className={s.tile} style={{ width: 40, height: 40, fontSize: 18 }} disabled={g.includes(c) || solved || lost} onClick={() => guess(c)}>{c}</button>
        ))}
      </div>
      {(solved || lost) && <div className={s.row}><button className={s.btn} onClick={next}>{solved ? '✅ Mai departe' : '❌ Mai departe'}</button></div>}
    </>
  )
}

// ── 10. aɪ — Cursa cu iepurele ──────────────────────────────────────────
function Race({ lesson, pool, again }: GP) {
  const GOAL = 8
  const [me, setMe] = useState(0); const [bunny, setBunny] = useState(0); const [n, setN] = useState(0)
  const opts = useMemo(() => shuffle([{ w: one(lesson.words), ok: true }, ...take(pool, 2).map(w => ({ w, ok: false }))]), [lesson, pool, n])
  const over = me >= GOAL || bunny >= GOAL
  useEffect(() => {
    if (over) return
    const iv = window.setInterval(() => setBunny(b => b + 1), 2600)
    return () => window.clearInterval(iv)
  }, [over])
  if (over) return <End score={me} total={GOAL} note={me >= GOAL ? 'Ai câștigat cursa!' : 'Iepurele a ajuns primul'} again={again} />
  return (
    <>
      <p className={s.prompt}>Alege cuvântul cu sunetul — fiecare răspuns corect te mută înainte.</p>
      <div className={s.track}><span className={s.runner} style={{ left: `${(me / GOAL) * 88}%` }}>🦊</span></div>
      <div className={s.track}><span className={s.runner} style={{ left: `${(bunny / GOAL) * 88}%` }}>🐇</span></div>
      <div className={s.row}>{opts.map(o => <button key={o.w.text} className={s.opt} onClick={() => { if (o.ok) setMe(x => x + 1); setN(x => x + 1) }}><W w={o.w} bare /></button>)}</div>
    </>
  )
}

// ── 11. aʊ — Cârtița ────────────────────────────────────────────────────
function Whack({ lesson, pool, again }: GP) {
  const N = 18
  const items = useMemo(() => mixed(lesson, pool, 11, 7), [lesson, pool])
  const [holes, setHoles] = useState<((Item & { id: number }) | null)[]>(Array(9).fill(null))
  const [sp, setSp] = useState(0); const [hit, setHit] = useState(0); const [bad, setBad] = useState(0)
  useEffect(() => {
    if (sp >= N) return
    const t = window.setTimeout(() => {
      const h = Math.floor(Math.random() * 9); const it = { ...items[sp], id: sp }
      setHoles(hs => hs.map((x, k) => (k === h ? it : x)))
      setSp(sp + 1)
      wait(1500, () => setHoles(hs => hs.map(x => (x && x.id === it.id ? null : x))))
    }, sp === 0 ? 300 : 850)
    return () => window.clearTimeout(t)
  }, [sp, items])
  if (sp >= N && holes.every(h => !h)) return <End score={hit} total={11} note={`greșit lovite: ${bad}`} again={again} />
  return (
    <>
      <Stat><span>Lovite corect: {hit}</span><span>Greșit: {bad}</span></Stat>
      <div className={s.holes}>
        {holes.map((h, k) => (
          <button key={k} className={s.hole} onClick={() => { if (!h) return; if (h.ok) setHit(x => x + 1); else setBad(x => x + 1); setHoles(hs => hs.map((x, j) => (j === k ? null : x))) }}>
            {h && <span className={s.pop}><W w={h.w} bare size={18} /></span>}
          </button>
        ))}
      </div>
    </>
  )
}

// ── 12. oɪ — Intrusul ───────────────────────────────────────────────────
function Odd({ lesson, pool, again }: GP) {
  const rounds = useMemo(() => Array.from({ length: 8 }, () => shuffle([...take(lesson.words, 3).map(w => ({ w, ok: true })), { w: one(pool), ok: false }])), [lesson, pool])
  const [i, setI] = useState(0); const [score, setScore] = useState(0); const [fb, setFb] = useState(false)
  if (i >= rounds.length) return <End score={score} total={rounds.length} again={again} />
  const ans = (ok: boolean) => { if (fb) return; setFb(true); if (!ok) setScore(x => x + 1); wait(900, () => { setFb(false); setI(x => x + 1) }) }
  return (
    <>
      <Stat><span>{i + 1} / {rounds.length}</span><span>Scor: {score}</span></Stat>
      <p className={s.prompt}>Trei cuvinte au sunetul. Care e intrusul?</p>
      <div className={s.row}>
        {rounds[i].map(o => (
          <button key={o.w.text} className={`${s.opt} ${fb && !o.ok ? s.good : ''}`} onClick={() => ans(o.ok)}><W w={o.w} color={lesson.color} bare={!fb} /></button>
        ))}
      </div>
    </>
  )
}

// ── 13. ʃ — Litera lipsă ────────────────────────────────────────────────
function Missing({ lesson, pool, again }: GP) {
  const rounds = useMemo(() => cyc(lesson.words, 8).map(w => {
    const others = Array.from(new Set(pool.map(p => p.mark).filter(m => m && m !== w.mark)))
    return { w, opts: shuffle([w.mark, ...take(others, 2)]) }
  }), [lesson, pool])
  const [i, setI] = useState(0); const [score, setScore] = useState(0); const [pick, setPick] = useState<string | null>(null)
  if (i >= rounds.length) return <End score={score} total={rounds.length} again={again} />
  const r = rounds[i]; const st = r.w.text.indexOf(r.w.mark)
  const ans = (m: string) => { if (pick) return; setPick(m); if (m === r.w.mark) setScore(x => x + 1); wait(900, () => { setPick(null); setI(x => x + 1) }) }
  return (
    <>
      <Stat><span>{i + 1} / {rounds.length}</span><span>Scor: {score}</span></Stat>
      <div className={s.big}>{pick ? <W w={r.w} color={lesson.color} size={46} /> : <>{r.w.text.slice(0, st)}<span style={{ color: '#aaa' }}>＿＿</span>{r.w.text.slice(st + r.w.mark.length)}</>}</div>
      <div className={s.row}>{r.opts.map(m => <button key={m} className={`${s.opt} ${pick && m === r.w.mark ? s.good : ''}`} onClick={() => ans(m)}>{m}</button>)}</div>
    </>
  )
}

// ── 14. tʃ — Bingo ──────────────────────────────────────────────────────
function Bingo({ lesson, pool, again }: GP) {
  const cells = useMemo(() => {
    const t = take(lesson.words, Math.min(5, lesson.words.length)).map(w => ({ w, ok: true }))
    return shuffle([...t, ...take(pool, 9 - t.length).map(w => ({ w, ok: false }))])
  }, [lesson, pool])
  const [tapped, setTapped] = useState<number[]>([]); const [bad, setBad] = useState(0)
  const total = cells.filter(c => c.ok).length
  const found = tapped.filter(k => cells[k].ok).length
  if (found === total) return <End score={total} total={total} note={`atingeri greșite: ${bad}`} again={again} />
  return (
    <>
      <Stat><span>Găsite: {found} / {total}</span><span>Greșeli: {bad}</span></Stat>
      <p className={s.prompt}>Atinge toate cuvintele cu sunetul.</p>
      <div className={s.holes} style={{ gap: 10 }}>
        {cells.map((c, k) => (
          <button key={k} className={`${s.opt} ${tapped.includes(k) ? (c.ok ? s.good : s.badc) : ''}`} style={{ height: 80, minWidth: 0 }}
            onClick={() => { if (tapped.includes(k)) return; setTapped(x => [...x, k]); if (!c.ok) setBad(b => b + 1) }}>
            <W w={c.w} color={lesson.color} bare={!tapped.includes(k)} size={22} />
          </button>
        ))}
      </div>
    </>
  )
}

// ── 15. dʒ — Numără-le ──────────────────────────────────────────────────
function Counter({ lesson, pool, again }: GP) {
  const rounds = useMemo(() => Array.from({ length: 3 }, () => {
    const k = 1 + Math.floor(Math.random() * 4)
    return { n: k, list: shuffle([...cyc(lesson.words, k).map(w => ({ w, ok: true })), ...take(pool, 6 - k).map(w => ({ w, ok: false }))]) }
  }), [lesson, pool])
  const [r, setR] = useState(0); const [j, setJ] = useState(0); const [score, setScore] = useState(0); const [res, setRes] = useState<null | number>(null)
  const showing = j < 6
  useEffect(() => {
    if (!showing || r >= rounds.length) return
    const t = window.setTimeout(() => setJ(x => x + 1), 1300)
    return () => window.clearTimeout(t)
  }, [j, showing, r, rounds.length])
  if (r >= rounds.length) return <End score={score} total={rounds.length} again={again} />
  const cur = rounds[r]
  const ans = (n: number) => { if (res !== null) return; setRes(n); if (n === cur.n) setScore(x => x + 1); wait(1100, () => { setRes(null); setJ(0); setR(x => x + 1) }) }
  return (
    <>
      <Stat><span>Runda {r + 1} / {rounds.length}</span><span>Scor: {score}</span></Stat>
      {showing ? (
        <><p className={s.prompt}>Numără cuvintele care au sunetul…</p><div className={s.big}><W w={cur.list[j].w} bare size={48} /></div></>
      ) : (
        <><p className={s.prompt}>Câte au avut sunetul?</p>
          <div className={s.row}>{[0, 1, 2, 3, 4, 5, 6].map(n => <button key={n} className={`${s.opt} ${res !== null && n === cur.n ? s.good : ''}`} style={{ minWidth: 60 }} onClick={() => ans(n)}>{n}</button>)}</div></>
      )}
    </>
  )
}

// ── 16. θ/ð — Reflexul (go / no-go) ─────────────────────────────────────
function Reflex({ lesson, pool, again }: GP) {
  const items = useMemo(() => mixed(lesson, pool, 7, 5), [lesson, pool])
  const [i, setI] = useState(0); const [hit, setHit] = useState(0); const [bad, setBad] = useState(0); const [miss, setMiss] = useState(0)
  const pressed = useRef(false)
  useEffect(() => {
    if (i >= items.length) return
    pressed.current = false
    const t = window.setTimeout(() => { if (items[i].ok && !pressed.current) setMiss(m => m + 1); setI(x => x + 1) }, 1600)
    return () => window.clearTimeout(t)
  }, [i, items])
  const press = () => {
    if (i >= items.length || pressed.current) return
    pressed.current = true
    if (items[i].ok) setHit(h => h + 1); else setBad(b => b + 1)
  }
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); press() } }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  })
  if (i >= items.length) return <End score={hit} total={7} note={`ratate: ${miss} · apăsări greșite: ${bad}`} again={again} />
  return (
    <>
      <Stat><span>{i + 1} / {items.length}</span><span>Corect: {hit}</span></Stat>
      <div className={s.big} key={i}><W w={items[i].w} bare size={50} /></div>
      <div className={s.row}><button className={s.btn} style={{ fontSize: 28, padding: '18px 48px', background: lesson.color }} onClick={press}>ACUM!</button></div>
      <p className={s.prompt}>Apasă (sau Spațiu) doar dacă cuvântul are sunetul.</p>
    </>
  )
}

// ── 17. l̩/m̩ — Ceața ───────────────────────────────────────────────────
function Fog({ lesson, pool, again }: GP) {
  const BUDGET = 9
  const tiles = useMemo(() => {
    const t = take(lesson.words, Math.min(4, lesson.words.length)).map(w => ({ w, ok: true }))
    return shuffle([...t, ...take(pool, 12 - t.length).map(w => ({ w, ok: false }))])
  }, [lesson, pool])
  const [rev, setRev] = useState<number[]>([])
  const total = tiles.filter(t => t.ok).length
  const found = rev.filter(k => tiles[k].ok).length
  if (found === total || rev.length >= BUDGET) return <End score={found} total={total} note={`întoarceri folosite: ${rev.length} / ${BUDGET}`} again={again} />
  return (
    <>
      <Stat><span>Găsite: {found} / {total}</span><span>Întoarceri rămase: {BUDGET - rev.length}</span></Stat>
      <div className={s.holes} style={{ gridTemplateColumns: 'repeat(4,1fr)', maxWidth: 560 }}>
        {tiles.map((t, k) => (
          <button key={k} className={`${s.opt} ${rev.includes(k) ? (t.ok ? s.good : '') : ''}`} style={{ height: 70, minWidth: 0, background: rev.includes(k) ? undefined : '#d9dde2' }}
            onClick={() => { if (!rev.includes(k)) setRev(x => [...x, k]) }}>
            {rev.includes(k) ? <W w={t.w} color={lesson.color} size={18} /> : '🌫️'}
          </button>
        ))}
      </div>
    </>
  )
}

// ── 18. ṡ — Dactilo ─────────────────────────────────────────────────────
function Typing({ lesson, again }: GP) {
  const words = useMemo(() => cyc(lesson.words, 12), [lesson])
  const [i, setI] = useState(0); const [v, setV] = useState(''); const [left, setLeft] = useState(45); const [score, setScore] = useState(0)
  useEffect(() => {
    if (left <= 0) return
    const t = window.setTimeout(() => setLeft(x => x - 1), 1000)
    return () => window.clearTimeout(t)
  }, [left])
  if (left <= 0 || i >= words.length) return <End score={score} total={words.length} note="cuvinte scrise în 45 s" again={again} />
  const w = words[i]
  return (
    <>
      <Stat><span>Timp: {left}s</span><span>Scris: {score}</span></Stat>
      <div className={s.big}><W w={w} color={lesson.color} size={50} /></div>
      <div className={s.center}>
        <input autoFocus value={v} style={{ fontSize: 28, padding: '8px 14px', borderRadius: 10, border: '2px solid #ccc', textAlign: 'center' }}
          onChange={e => { const x = e.target.value; setV(x); if (x.trim().toLowerCase() === w.text.toLowerCase()) { setScore(c => c + 1); setI(c => c + 1); setV('') } }} />
      </div>
    </>
  )
}

// ── 19. x̊ — Simon ──────────────────────────────────────────────────────
function Simon({ lesson, again }: GP) {
  const btns = useMemo(() => take(lesson.words, Math.min(4, lesson.words.length)), [lesson])
  const MAX = 6
  const [seq, setSeq] = useState<number[]>(() => [Math.floor(Math.random() * btns.length)])
  const [phase, setPhase] = useState<'play' | 'input' | 'over'>('play')
  const [lit, setLit] = useState<number | null>(null); const [pos, setPos] = useState(0)
  useEffect(() => {
    if (phase !== 'play') return
    const ids: number[] = []
    seq.forEach((b, k) => {
      ids.push(window.setTimeout(() => setLit(b), 700 + k * 800))
      ids.push(window.setTimeout(() => setLit(null), 700 + k * 800 + 500))
    })
    ids.push(window.setTimeout(() => { setPhase('input'); setPos(0) }, 700 + seq.length * 800))
    return () => ids.forEach(id => window.clearTimeout(id))
  }, [phase, seq])
  if (phase === 'over' || seq.length > MAX) return <End score={Math.min(seq.length - (phase === 'over' ? 1 : 0), MAX)} total={MAX} again={again} />
  const tap = (b: number) => {
    if (phase !== 'input') return
    if (b !== seq[pos]) { setPhase('over'); return }
    if (pos + 1 === seq.length) { setSeq(q => [...q, Math.floor(Math.random() * btns.length)]); setPhase('play') } else setPos(pos + 1)
  }
  return (
    <>
      <Stat><span>Secvența: {seq.length} / {MAX}</span><span>{phase === 'play' ? 'Urmărește…' : 'Acum tu!'}</span></Stat>
      <div className={s.row} style={{ marginTop: 40 }}>
        {btns.map((w, b) => (
          <button key={b} className={s.opt} style={{ minWidth: 130, height: 90, background: lit === b ? lesson.color : undefined, color: lit === b ? '#fff' : undefined }} onClick={() => tap(b)}>
            <W w={w} bare size={24} />
          </button>
        ))}
      </div>
    </>
  )
}

// ── 20. đ — Trage în coșuri (drag & drop + tap) ─────────────────────────
function Sort({ lesson, pool, again }: GP) {
  const items = useMemo(() => mixed(lesson, pool, 5, 3).map((x, k) => ({ ...x, id: k })), [lesson, pool])
  const [placed, setPlaced] = useState<number[]>([]); const [bad, setBad] = useState(0); const [sel, setSel] = useState<number | null>(null)
  const drop = (id: number, yes: boolean) => {
    const it = items.find(x => x.id === id); if (!it || placed.includes(id)) return
    if (it.ok === yes) setPlaced(p => [...p, id]); else setBad(b => b + 1)
    setSel(null)
  }
  if (placed.length === items.length) return <End score={items.length - Math.min(bad, items.length)} total={items.length} note={`încercări greșite: ${bad}`} again={again} />
  const bin = (yes: boolean) => (
    <div className={s.bin} style={{ borderColor: yes ? lesson.color : '#bbb' }}
      onDragOver={e => e.preventDefault()} onDrop={e => drop(Number(e.dataTransfer.getData('text')), yes)}
      onClick={() => sel !== null && drop(sel, yes)}>
      {yes ? 'Are sunetul' : 'Nu are'}
      <div>{items.filter(x => placed.includes(x.id) && x.ok === yes).map(x => <span key={x.id} className={s.chip} style={{ cursor: 'default' }}><W w={x.w} color={lesson.color} size={16} /></span>)}</div>
    </div>
  )
  return (
    <>
      <Stat><span>Sortate: {placed.length} / {items.length}</span><span>Greșeli: {bad}</span></Stat>
      <div className={s.center} style={{ minHeight: 100 }}>
        {items.filter(x => !placed.includes(x.id)).map(x => (
          <span key={x.id} draggable className={`${s.chip} ${sel === x.id ? s.chipSel : ''}`}
            onDragStart={e => e.dataTransfer.setData('text', String(x.id))} onClick={() => setSel(x.id)}>
            <W w={x.w} bare size={20} />
          </span>
        ))}
      </div>
      <p className={s.prompt}>Trage cuvântul în coș (sau atinge cuvântul, apoi coșul).</p>
      <div style={{ display: 'flex', gap: 14 }}>{bin(true)}{bin(false)}</div>
    </>
  )
}

// ── 21. ƈ — Rămâi sau retrage-te ────────────────────────────────────────
function Bank({ lesson, pool, again }: GP) {
  const items = useMemo(() => mixed(lesson, pool, 6, 4), [lesson, pool])
  const [i, setI] = useState(0); const [pot, setPot] = useState(0); const [bank, setBank] = useState(0); const [fb, setFb] = useState<null | boolean>(null)
  if (i >= items.length) return <End score={bank + pot} total={items.length} note="Potul rămas la final se adaugă automat." again={again} />
  const it = items[i]
  const ans = (yes: boolean) => {
    if (fb !== null) return
    const ok = yes === it.ok; setFb(ok)
    if (ok) setPot(p => p + 1); else setPot(0)
    wait(700, () => { setFb(null); setI(x => x + 1) })
  }
  return (
    <>
      <Stat><span>La bancă: {bank}</span><span>Pot: {pot} 🔥</span></Stat>
      <p className={s.prompt}>Are cuvântul sunetul? O greșeală îți pierde potul!</p>
      <div className={s.big}><W w={it.w} color={lesson.color} bare={fb === null} size={46} /></div>
      <div className={s.row}>
        <button className={s.opt} disabled={fb !== null} onClick={() => ans(true)}>Da</button>
        <button className={s.opt} disabled={fb !== null} onClick={() => ans(false)}>Nu</button>
        <button className={s.btn} disabled={fb !== null || pot === 0} onClick={() => { setBank(b => b + pot); setPot(0) }}>💰 Pune la bancă</button>
      </div>
    </>
  )
}

// ── 22. gh/ph — Duelul cu vulpea ────────────────────────────────────────
function Duel({ lesson, pool, again }: GP) {
  const cards = useMemo(() => {
    const t = take(lesson.words, Math.min(5, lesson.words.length)).map(w => ({ w, ok: true }))
    return shuffle([...t, ...take(pool, 9 - t.length).map(w => ({ w, ok: false }))]).map((x, k) => ({ ...x, id: k }))
  }, [lesson, pool])
  const [taken, setTaken] = useState<number[]>([]); const [me, setMe] = useState(0); const [fox, setFox] = useState(0); const [turn, setTurn] = useState<'me' | 'fox'>('me')
  const left = cards.filter(c => c.ok && !taken.includes(c.id))
  useEffect(() => {
    if (turn !== 'fox' || left.length === 0) return
    const t = window.setTimeout(() => {
      const free = cards.filter(c => !taken.includes(c.id))
      const goodFree = free.filter(c => c.ok)
      const c = Math.random() < 0.7 && goodFree.length ? one(goodFree) : one(free)
      setTaken(x => [...x, c.id]); if (c.ok) setFox(f => f + 1); else setMe(m => m + 1)
      setTurn('me')
    }, 900)
    return () => window.clearTimeout(t)
  })
  if (left.length === 0) return <End score={me} total={me + fox} note={me > fox ? 'Ai învins vulpea!' : me === fox ? 'Egalitate' : 'Vulpea a câștigat'} again={again} />
  const pick = (c: { id: number; ok: boolean }) => {
    if (turn !== 'me' || taken.includes(c.id)) return
    setTaken(x => [...x, c.id]); if (c.ok) setMe(m => m + 1); else setFox(f => f + 1)
    setTurn('fox')
  }
  return (
    <>
      <Stat><span>Tu: {me}</span><span>{turn === 'me' ? 'E rândul tău' : '🦊 se gândește…'}</span><span>Vulpea: {fox}</span></Stat>
      <p className={s.prompt}>Ia cuvintele cu sunetul. Un cuvânt greșit îi dă punct vulpii.</p>
      <div className={s.holes} style={{ gap: 10 }}>
        {cards.map(c => (
          <button key={c.id} className={`${s.opt} ${taken.includes(c.id) ? (c.ok ? s.good : s.badc) : ''}`} style={{ height: 76, minWidth: 0 }} onClick={() => pick(c)}>
            <W w={c.w} color={lesson.color} bare={!taken.includes(c.id)} size={20} />
          </button>
        ))}
      </div>
    </>
  )
}

// ── 23. š — Din culoare, în cuvânt ──────────────────────────────────────
function FromColour({ lesson, pool, again }: GP) {
  const rounds = useMemo(() => Array.from({ length: 8 }, () => ({ opts: shuffle([{ w: one(lesson.words), ok: true }, ...take(pool, 2).map(w => ({ w, ok: false }))]) })), [lesson, pool])
  const [i, setI] = useState(0); const [score, setScore] = useState(0); const [fb, setFb] = useState(false)
  if (i >= rounds.length) return <End score={score} total={rounds.length} again={again} />
  const ans = (ok: boolean) => { if (fb) return; setFb(true); if (ok) setScore(x => x + 1); wait(900, () => { setFb(false); setI(x => x + 1) }) }
  return (
    <>
      <Stat><span>{i + 1} / {rounds.length}</span><span>Scor: {score}</span></Stat>
      <div className={s.center}><div style={{ width: 110, height: 110, borderRadius: '50%', background: lesson.color, margin: '6px auto', border: '6px solid #ddd' }} /></div>
      <p className={s.prompt}>Care cuvânt are sunetul acestei culori?</p>
      <div className={s.row}>
        {rounds[i].opts.map(o => <button key={o.w.text} className={`${s.opt} ${fb && o.ok ? s.good : ''}`} onClick={() => ans(o.ok)}><W w={o.w} color={lesson.color} bare={!fb} /></button>)}
      </div>
    </>
  )
}

// ── 24. ʌ — Bara de putere ──────────────────────────────────────────────
function Power({ lesson, pool, again }: GP) {
  const ROUNDS = 6
  const [r, setR] = useState(0); const [score, setScore] = useState(0); const [phase, setPhase] = useState<'q' | 'bar' | 'res'>('q')
  const [pos, setPos] = useState(0); const [msg, setMsg] = useState('')
  const dir = useRef(1)
  const opts = useMemo(() => shuffle([{ w: one(lesson.words), ok: true }, { w: one(pool), ok: false }]), [lesson, pool, r])
  useEffect(() => {
    if (phase !== 'bar') return
    const iv = window.setInterval(() => setPos(p => { let n = p + dir.current * 3; if (n >= 100) { n = 100; dir.current = -1 } if (n <= 0) { n = 0; dir.current = 1 } return n }), 25)
    return () => window.clearInterval(iv)
  }, [phase])
  if (r >= ROUNDS) return <End score={score} total={ROUNDS * 3} note="1 punct pentru răspuns + până la 2 pentru timing" again={again} />
  const next = () => { setPhase('q'); setR(x => x + 1) }
  const ans = (ok: boolean) => { if (ok) { setScore(x => x + 1); setPos(0); dir.current = 1; setPhase('bar') } else { setMsg('Răspuns greșit'); setPhase('res'); wait(900, next) } }
  const stop = () => {
    const d = Math.abs(pos - 50); const pts = d <= 10 ? 2 : d <= 20 ? 1 : 0
    setScore(x => x + pts); setMsg(pts === 2 ? 'Perfect! +2' : pts === 1 ? 'Aproape! +1' : 'Pe lângă… +0'); setPhase('res'); wait(900, next)
  }
  return (
    <>
      <Stat><span>Runda {r + 1} / {ROUNDS}</span><span>Puncte: {score}</span></Stat>
      {phase === 'q' && <><p className={s.prompt}>Care cuvânt are sunetul?</p><div className={s.row}>{opts.map(o => <button key={o.w.text} className={s.opt} onClick={() => ans(o.ok)}><W w={o.w} bare /></button>)}</div></>}
      {phase === 'bar' && <><p className={s.prompt}>Oprește bara în zona verde!</p><div className={s.meter}><div className={s.needle} style={{ left: `${pos}%` }} /></div><div className={s.row}><button className={s.btn} onClick={stop}>STOP</button></div></>}
      {phase === 'res' && <div className={s.big}>{msg}</div>}
    </>
  )
}

// ── 25. o (rotic) — Pietre peste râu ────────────────────────────────────
function Stones({ lesson, pool, again }: GP) {
  const STEPS = 6
  const [step, setStep] = useState(0); const [lives, setLives] = useState(3); const [n, setN] = useState(0); const [splash, setSplash] = useState(false)
  const pair = useMemo(() => shuffle([{ w: one(lesson.words), ok: true }, { w: one(pool), ok: false }]), [lesson, pool, n])
  if (step >= STEPS || lives <= 0) return <End score={step} total={STEPS} note={step >= STEPS ? 'Ai trecut râul!' : 'Ai căzut în apă'} again={again} />
  const go = (ok: boolean) => {
    if (splash) return
    if (ok) { setStep(x => x + 1); setN(x => x + 1) } else { setLives(l => l - 1); setSplash(true); wait(700, () => { setSplash(false); setN(x => x + 1) }) }
  }
  return (
    <>
      <Stat><span>Pas {step} / {STEPS}</span><span>{'❤️'.repeat(lives)}</span></Stat>
      <div className={s.track} style={{ background: '#d0ebff' }}><span className={s.runner} style={{ left: `${(step / STEPS) * 88}%` }}>{splash ? '💦' : '🦊'}</span></div>
      <p className={s.prompt}>Alege piatra cu cuvântul care are sunetul.</p>
      <div className={s.row}>{pair.map(o => <button key={o.w.text} className={s.stone} onClick={() => go(o.ok)}><W w={o.w} bare size={22} /></button>)}</div>
    </>
  )
}

// ── registru: Lesson.id → componentă ────────────────────────────────────
export const GAME_COMPONENTS: Record<string, (p: GP) => ReactNode> = {
  a: Balloons, e: Memory, o: Basket, i: YesNo, ae: Letters, u: Dictation, ou: Tower, ei: Scramble,
  ju: Hangman, ai: Race, au: Whack, oi: Odd, sh: Missing, ch: Bingo, dj: Counter, th: Reflex,
  'syllabic-lm': Fog, 'dot-z': Typing, 'ring-gz': Simon, 'd-hat': Sort, 'c-hook': Bank,
  'gh-ph-f': Duel, zh: FromColour, strut: Power, 'rotic-o': Stones,
}
