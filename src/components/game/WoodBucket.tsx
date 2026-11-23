import { useId } from 'react'

// ── Găleata/coșul de lemn al vulpii (jocul cu pești): doage de lemn cu fibre și rosturi,
//    două cercuri de fier cu nituri, buza de lemn. Același contur ca vechiul taz metalic
//    (viewBox 104×112, buza la y=30), deci cozile prinse și zborul peștelui rămân la locul lor.
//    Numărătoarea se desenează de jocul însuși, deasupra (între cele două cercuri). ──

const RIM = 30
const N = 7
const BODY = 'M8 30 L96 30 L88 106 Q87 111 82 111 L22 111 Q17 111 16 106 Z'
const PLANKS = ['#b9824a', '#a8703a', '#c4915a', '#a06a37', '#b9824a', '#ad7640', '#c18d55']
const XT = Array.from({ length: N + 1 }, (_, i) => 8 + (88 * i) / N)    // marginea de sus a doagelor
const XB = Array.from({ length: N + 1 }, (_, i) => 16 + (72 * i) / N)   // marginea de jos
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const edge = (y: number, side: 'l' | 'r') => {
  const t = (y - RIM) / (106 - RIM)
  return side === 'l' ? lerp(8, 16, t) : lerp(96, 88, t)
}
const HOOPS = [46, 98]   // cercurile de fier; numărul stă între ele (y ≈ 50–92)

export function WoodBucket() {
  const clipId = `${useId().replace(/:/g, '')}-bk`
  return (
    <>
      <defs>
        <clipPath id={clipId}><path d={BODY} /></clipPath>
        <linearGradient id={`${clipId}-shade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".18" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".28" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {/* doage */}
        {PLANKS.map((c, i) => (
          <polygon key={`p${i}`} points={`${XT[i].toFixed(1)},28 ${XT[i + 1].toFixed(1)},28 ${XB[i + 1].toFixed(1)},113 ${XB[i].toFixed(1)},113`} fill={c} />
        ))}
        {/* fibre */}
        {PLANKS.map((_, i) => {
          const xm = (XT[i] + XT[i + 1]) / 2, xn = (XB[i] + XB[i + 1]) / 2
          return <path key={`f${i}`} d={`M${(xm - 2).toFixed(1)} 34 C${(xm + 1).toFixed(1)} 55 ${(xn - 3).toFixed(1)} 80 ${(xn - 1).toFixed(1)} 108`} fill="none" stroke="#6b4423" strokeWidth=".9" opacity=".35" />
        })}
        {/* rosturi între doage */}
        {Array.from({ length: N - 1 }, (_, k) => k + 1).map(i => (
          <line key={`s${i}`} x1={XT[i].toFixed(1)} y1="28" x2={XB[i].toFixed(1)} y2="113" stroke="#4a2f16" strokeWidth="1.6" opacity=".85" />
        ))}
        <rect x="0" y="28" width="104" height="90" fill={`url(#${clipId}-shade)`} />
        {/* cercuri de fier cu nituri */}
        {HOOPS.map(y => {
          const h = 8
          const l0 = edge(y - h / 2, 'l'), r0 = edge(y - h / 2, 'r'), l1 = edge(y + h / 2, 'l'), r1 = edge(y + h / 2, 'r')
          return (
            <g key={`h${y}`}>
              <polygon points={`${(l0 - 2).toFixed(1)},${y - h / 2} ${(r0 + 2).toFixed(1)},${y - h / 2} ${(r1 + 2).toFixed(1)},${y + h / 2} ${(l1 - 2).toFixed(1)},${y + h / 2}`} fill="#33373c" stroke="#16181b" strokeWidth="1.4" />
              <line x1={l0.toFixed(1)} y1={y - h / 2 + 2} x2={r0.toFixed(1)} y2={y - h / 2 + 2} stroke="#8a9199" strokeWidth="1.2" opacity=".8" />
              {[0.18, 0.5, 0.82].map(fx => (
                <circle key={fx} cx={lerp(edge(y, 'l'), edge(y, 'r'), fx).toFixed(1)} cy={y} r="1.4" fill="#aab1b8" />
              ))}
            </g>
          )
        })}
      </g>
      <path d={BODY} fill="none" stroke="#3a2410" strokeWidth="2.6" strokeLinejoin="round" />
      {/* buza de lemn */}
      <rect x="3" y={RIM - 4} width="98" height="9" rx="4.5" fill="#8a5a2b" stroke="#3a2410" strokeWidth="2.6" />
      <rect x="8" y={RIM - 1.8} width="88" height="2.2" rx="1.1" fill="#d9a766" opacity=".7" />
    </>
  )
}
