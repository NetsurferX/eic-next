import type { Stats } from '@/lib/useColorizer'

const LEGEND = [
  { color: '#00b0f0', label: 'æ — cat' },
  { color: '#008E40', label: 'ɑ/ʌ — car, cup' },
  { color: '#888888', label: 'ə — schwa' },
  { color: '#EE5B00', label: 'e/ɛ — bed' },
  { color: '#CC0000', label: 'i/ɪ — see, sit' },
  { color: '#FF3399', label: 'ɒ/ɔ — hot, or' },
  { color: '#7030A0', label: 'u/ʊ — moon, book' },
  { color: '#4472C4', label: 'aɪ/aʊ — my, now' },
  { color: '#E57373', label: 'j/w — yes, we' },
]

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
