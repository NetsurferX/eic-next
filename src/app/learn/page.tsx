'use client'

// Restoring from 3461dd25 - full content follows in next commit if this is too large
export default function LearnPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Learn</h1>
      <p>Restaurare in curs - te rog ruleaza local:</p>
      <pre style={{ background: '#111', color: '#0f0', padding: 12, borderRadius: 8, overflow: 'auto' }}>{
`git fetch origin\ngit checkout 3461dd25ce6f22c9ad7b4b4a7ccc966626f3f4ed -- src/app/learn/page.tsx\ngit add src/app/learn/page.tsx\ngit commit -m "fix(learn): restore full page"\ngit push origin main`
      }</pre>
    </main>
  )
}
