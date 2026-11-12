import Link from 'next/link'

// Index — animații cu vulpea (poze din public/mascot/v2). Rută izolată:
// nu modifică Mascot.tsx / MascotV2.tsx / jocul și nu e înregistrată în
// _ideasData.ts (de adăugat doar dacă Dorel acceptă).

const ANIMS = [
  { href: 'sarituri', emoji: '🦘', title: 'Săriturile', desc: 'Se ghemuiește, sare în arc, se întinde în aer, aterizează cu zguduit elastic; umbra se micșorează cu înălțimea. Click = sare acum.' },
  { href: 'alergare', emoji: '🏃', title: 'Alergarea', desc: 'Aleargă pe loc cu peisaj în paralax, praf la fiecare pas; slider de viteză, frânează și se oprește lin.' },
  { href: 'somn', emoji: '😴', title: 'Somnul', desc: 'Respiră adânc, se ridică Z-uri sub lună. „Trezește” = tresărire, salut, se așază și adoarme la loc.' },
  { href: 'priveste', emoji: '👀', title: 'Te urmărește', desc: 'Își întoarce corpul după cursor/deget, clipește, saltă la click; dacă o ignori, se așază și adoarme.' },
  { href: 'sarbatoare', emoji: '🎉', title: 'Sărbătoarea', desc: 'Răspuns corect: sărituri de bucurie + explozie de stele și confetti. „Aproape”: încurajare blândă.' },
  { href: 'pescuit', emoji: '🎣', title: 'Pescuitul liniștit', desc: 'Vulpea stă așezată pe ponton, urmărește pluta și reacționează discret la trăsătură.' },
  { href: 'asculta', emoji: '👂', title: 'Ascultă', desc: 'Își îndreaptă atenția spre copil și răspunde calm, cu o mică înclinare.' },
  { href: 'gandeste', emoji: '💭', title: 'Se gândește', desc: 'Înclină capul, privește în sus și lasă ideile să apară.' },
  { href: 'primeste-stea', emoji: '⭐', title: 'Primește o stea', desc: 'Primește recompensa cu grijă și o arată cu mândrie.' },
]

export default function Page() {
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/debug/gamification">← Index gamificare</Link>
      <h1 style={{ fontSize: 24, margin: '12px 0 4px' }}>🦊 Animații vulpe</h1>
      <p style={{ color: '#444', fontSize: 14, margin: '0 0 16px' }}>
        Mișcare continuă (transformări + fizică simplă) pe pozele din <code>public/mascot/v2</code>. Fiecare pagină e independentă.
      </p>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {ANIMS.map((a) => (
          <Link
            key={a.href}
            href={`/debug/gamification/animatii-vulpii/${a.href}`}
            style={{ display: 'block', padding: 14, border: '1px solid #ddd', borderRadius: 10, textDecoration: 'none', color: '#222', background: '#fff' }}
          >
            <div style={{ fontSize: 28 }}>{a.emoji}</div>
            <div style={{ fontWeight: 600, margin: '4px 0' }}>{a.title}</div>
            <div style={{ fontSize: 13, color: '#555' }}>{a.desc}</div>
          </Link>
        ))}
      </div>
    </main>
  )
}
