import type { DayCount } from '../../core/models/admin'

interface BarChartProps {
  readonly data: DayCount[]
  readonly total?: number
}

export default function BarChart({ data, total }: BarChartProps) {
  const maxVal = Math.max(...data.map((d) => d.total), 1)
  const gridLines = [0, Math.ceil(maxVal / 4), Math.ceil(maxVal / 2), Math.ceil((3 * maxVal) / 4), maxVal]

  const CHART_H = 160

  return (
    <div className="relative w-full">
      {total !== undefined && (
        <div className="flex items-center gap-1.5 justify-end mb-3">
          <svg className="w-3.5 h-3.5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="text-xs text-gray-500 font-medium">{total} en total</span>
        </div>
      )}

      <div className="flex gap-1 items-end" style={{ height: CHART_H }}>
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between items-end pr-1 flex-shrink-0" style={{ height: CHART_H }}>
          {[...gridLines].reverse().map((v) => (
            <span key={v} className="text-xs text-gray-300 leading-none">{v}</span>
          ))}
        </div>

        {/* Bars + x-labels */}
        <div className="flex-1 relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {gridLines.map((v) => (
              <div key={v} className="w-full border-t border-dashed border-gray-100" />
            ))}
          </div>

          {/* Bars */}
          <div className="relative flex items-end h-full" style={{ gap: 4, paddingBottom: 20 }}>
            {data.map((d, i) => {
              const pct = maxVal > 0 ? (d.total / maxVal) * 100 : 0
              const showLabel = i % 2 === 0
              return (
                <div key={d.fecha} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  {d.total > 0 && (
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-800 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap z-10">
                      {d.total} envio{d.total !== 1 ? 's' : ''}
                    </div>
                  )}
                  <div
                    className="w-full rounded-t-sm bg-violet-500 group-hover:bg-violet-400 transition-colors"
                    style={{
                      height: pct > 0 ? `${pct}%` : '2px',
                      minHeight: d.total > 0 ? '4px' : '2px',
                      backgroundColor: d.total === 0 ? '#e5e7eb' : undefined,
                    }}
                  />
                  {showLabel && (
                    <span className="absolute bottom-0 text-gray-400 leading-none" style={{ fontSize: 9 }}>
                      {d.fecha}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
