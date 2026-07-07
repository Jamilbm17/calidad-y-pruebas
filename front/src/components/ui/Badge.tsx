const ESTADO_CONFIG: Record<string, { label: string; className: string }> = {
  registrado:  { label: 'Registrado',  className: 'bg-slate-100 text-slate-700 border-slate-200'   },
  en_transito: { label: 'En transito', className: 'bg-blue-50   text-blue-700  border-blue-200'    },
  en_deposito: { label: 'En deposito', className: 'bg-amber-50  text-amber-700 border-amber-200'   },
  entregado:   { label: 'Entregado',   className: 'bg-green-50  text-green-700 border-green-200'   },
  devuelto:    { label: 'Devuelto',    className: 'bg-red-50    text-red-700   border-red-200'     },
}

const ROL_CONFIG: Record<string, { label: string; className: string }> = {
  admin:         { label: 'Admin',         className: 'bg-purple-50 text-purple-700 border-purple-200' },
  cliente:       { label: 'Cliente',       className: 'bg-violet-50 text-violet-700 border-violet-200' },
  transportista: { label: 'Transportista', className: 'bg-blue-50   text-blue-700   border-blue-200'   },
}

interface BadgeProps {
  readonly value: string
  readonly type?: 'estado' | 'rol' | 'default'
}

function resolveConfig(value: string, type: 'estado' | 'rol' | 'default') {
  if (type === 'estado') return ESTADO_CONFIG[value] ?? null
  if (type === 'rol')    return ROL_CONFIG[value] ?? null
  return null
}

export default function Badge({ value, type = 'estado' }: BadgeProps) {
  const config = resolveConfig(value, type)

  if (!config) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-gray-50 text-gray-600 border-gray-200">
        {value}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  )
}
