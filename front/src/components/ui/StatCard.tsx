type AccentColor = 'violet' | 'blue' | 'indigo' | 'amber'

const ACCENT: Record<AccentColor, { border: string; icon: string; value: string }> = {
  violet: { border: 'border-t-violet-600', icon: 'text-violet-600 bg-violet-50', value: 'text-violet-700' },
  blue:   { border: 'border-t-blue-500',   icon: 'text-blue-500  bg-blue-50',    value: 'text-blue-600'   },
  indigo: { border: 'border-t-indigo-500', icon: 'text-indigo-500 bg-indigo-50', value: 'text-indigo-600' },
  amber:  { border: 'border-t-amber-500',  icon: 'text-amber-500  bg-amber-50',  value: 'text-amber-600'  },
}

interface StatCardProps {
  readonly title: string
  readonly value: number | string
  readonly description: string
  readonly icon: JSX.Element
  readonly accent: AccentColor
}

export default function StatCard({ title, value, description, icon, accent }: StatCardProps) {
  const a = ACCENT[accent]
  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-t-4 ${a.border} p-5 flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${a.icon}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className={`text-3xl font-bold tracking-tight ${a.value}`}>{value}</p>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  )
}
