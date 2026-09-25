'use client'

import { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import WordRenderer from '@/components/WordRenderer'
import { useColorizer } from '@/lib/useColorizer'
import LevelTeaser from '@/components/game/LevelTeaser'
import IdeasNav from './debug/_IdeasNav'
import { MascotIntro } from '@/components/game/MascotIntro'
import { FoxHelper, type FoxTip, type FoxMood } from '@/components/game/FoxHelper'

// ── Salut inițial, o singură dată la prima vizită a paginii principale ──
// Aceeași convenție ca /learn: vulpea mare apare la centru, salută
// ("Salut!"/"Bine ai revenit!" — vezi MascotIntro.tsx, citește el însuși
// localStorage `eic-fox-seen`), apoi „zboară" spre dock-ul permanent din
// colțul dreapta-jos (FoxHelper), montat abia după aterizare.
const HOME_IDLE_TIP = 'Scrie un cuvânt sau o propoziție ca să vezi fiecare sunet colorat 🎨'

export default function Home() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { tokens, inputText, onInput } = useColorizer()
  const [introDone, setIntroDone] = useState(false)

  // ── Vulpea-asistent — coadă de mesaje declanșate din meniul de acțiuni ──
  const [foxQueue, setFoxQueue] = useState<FoxTip[]>([])
  const triggerFox = useCallback((text: string, mood?: FoxMood) => {
    setFoxQueue(q => [...q, { id: `${Date.now()}-${Math.random()}`, text, mood }])
  }, [])
  const dequeueFox = useCallback(() => setFoxQueue(q => q.slice(1)), [])

  const rendered = tokens.map((tok, i) => {
    if (tok.isWhitespace) return <span key={i}>{tok.raw}</span>
    if (tok.isPunct)      return <span key={i} className="eic-punct">{tok.raw}</span>
    if (!tok.nodes)       return <span key={i} className="eic-plain">{tok.raw}</span>

    return (
      <span key={i}>
        <WordRenderer nodes={tok.nodes} wordStr={tok.raw} />
      </span>
    )
  })

  return (
    <main className="eic-home">

      {/* Minimal top bar — brand + entry point into the game, nothing else */}
      <div className="eic-topbar">
        <span className="eic-brand">English in Colours</span>
        <LevelTeaser />
      </div>

      {/* The tool itself: one generous input, nothing competing for attention */}
      <div className="eic-editor-wrap">
        <div className="eic-editor" onClick={() => textareaRef.current?.focus()}>
          <div className="eic-highlight" aria-hidden="true">
            {tokens.length === 0
              ? <span className="eic-placeholder">Type or paste English text here…</span>
              : rendered
            }
          </div>
          <textarea
            ref={textareaRef}
            className="eic-textarea"
            defaultValue={inputText}
            onChange={e => onInput(e.target.value)}
            placeholder=" "
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            rows={18}
            aria-label="Text input"
          />
        </div>
      </div>

      {/* Acces la paginile cu idei (buton plutitor, stânga-jos) */}
      <IdeasNav />

      {/* Vulpea mare, la centru, la deschiderea paginii — salută, apoi
          „zboară" spre dock-ul de mai jos (vezi MascotIntro.tsx) ── */}
      {!introDone && <MascotIntro onComplete={() => setIntroDone(true)} />}

      {/* Vulpea-asistent — dock permanent, montat abia după aterizare, ca
          predarea vizuală să fie fără sărituri (vezi introDone mai sus) ── */}
      {introDone && (
        <FoxHelper
          idleTip={HOME_IDLE_TIP}
          queue={foxQueue}
          onDequeue={dequeueFox}
          actions={[
            {
              id: 'ce-e-asta',
              label: 'Ce e "English in Colours"?',
              onClick: () => triggerFox('Fiecare sunet din engleză are propria culoare — așa vezi cum se pronunță un cuvânt doar privindu-l, nu doar citindu-l.', 'hint'),
            },
            {
              id: 'cum-functioneaza',
              label: 'Cum funcționează culorile?',
              onClick: () => triggerFox('Literele care sună la fel primesc aceeași culoare, indiferent cum sunt scrise — de-asta "ee" din "see" și "y" din "happy" pot avea aceeași culoare.', 'hint'),
            },
            {
              id: 'la-joc',
              label: 'Du-mă la joc',
              onClick: () => router.push('/learn'),
            },
          ]}
        />
      )}

    </main>
  )
}
