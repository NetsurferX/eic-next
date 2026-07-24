import type { Stats } from '@/lib/useColorizer'
import { COLOR_LABELS } from '@/lib/rules/colors'

// Derived from the single canonical source (src/lib/rules/colors.ts) instead
// of a hand-copied table. The old hardcoded version here had drifted from
// two spec corrections: schwa at '#888888' (should be '#000000') and a
// separate '#E57373' j/w bucket that the spec removed (j is the same red as
// i/ɪ; w is plain black like any consonant) — plus aɪ/aʊ merged into one
// blue when the spec splits them into two colours.
const LEGEND = Object.entries(COLOR_LABELS).map(([color, { label, example }]) => ({
  color,
  label: `${label} — ${example}`,
}))

interface Props {
  stats: Stats
  usedColors: Set<string>
}

export default function StatsBar({ stats, usedColors }: Props) {
  const total = stats.distribution.reduce((s, d) => s + d.count, 0)

  return (
    <div className="eic-stats-wrap">

      {/* Legend — only colours present in current text */}
      {usedColors.size > 0 && (
        <div className="eic-legend" role="list">
          {LEGEND.filter(e => usedColors.has(e.color)).map(e => (
            <span key={e.color} className="eic-leg-item" role="listitem">
              <span className="eic-leg-dot" style={{ background: e.color }} />
              {e.label}
            </span>
          ))}
        </div>
      )}

      {/* Stats cards */}
      {stats.wordCount > 0 && (
        <div className="eic-stats">

          <div className="eic-stat">
            <span className="eic-stat-label">Words</span>
            <span className="eic-stat-value">{stats.wordCount}</span>
            <span className="eic-stat-sub">{stats.knownCount} known</span>
          </div>

          <div className="eic-stat">
            <span className="eic-stat-label">Top sound</span>
            <span className="eic-stat-value eic-stat-sound" style={{ color: stats.topColor }}>
              {stats.topLabel || '—'}
            </span>
            <span className="eic-stat-sub">{stats.topCount} segments</span>
          </div>

          <div className="eic-stat eic-stat-wide">
            <span className="eic-stat-label">Colour mix</span>
            <div className="eic-dist-bar" role="img" aria-label="Colour distribution">
              {total === 0
                ? <div className="eic-dist-seg" style={{ background: '#ebebeb', flex: 1 }} />
                : stats.distribution.map(d => (
                    <div
                      key={d.color}
                      className="eic-dist-seg"
                      style={{ background: d.color, flex: d.count }}
                    />
                  ))
              }
            </div>
            <span className="eic-stat-sub">{stats.distSummary || 'type to see'}</span>
          </div>

          <div className="eic-stat">
            <span className="eic-stat-label">Difficulty</span>
            <span className="eic-stat-value">{stats.difficulty}</span>
            <span className="eic-stat-sub">{stats.diffLabel}</span>
          </div>

        </div>
      )}
    </div>
  )
}
