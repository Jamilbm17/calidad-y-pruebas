const MOCK_NOTIFS = [
  { id: 1, tipo: 'envio', mensaje: 'Nuevo envío registrado: TRK-2025-001', leida: false, fecha: '2025-06-07T08:30:00' },
  { id: 2, tipo: 'seguimiento', mensaje: 'El envío TRK-2025-001 fue marcado como "En tránsito"', leida: false, fecha: '2025-06-07T09:15:00' },
  { id: 3, tipo: 'entrega', mensaje: 'El envío TRK-2025-002 fue entregado exitosamente', leida: true, fecha: '2025-06-06T14:22:00' },
  { id: 4, tipo: 'alerta', mensaje: 'El envío TRK-2025-003 lleva más de 5 días sin actualización', leida: false, fecha: '2025-06-06T10:00:00' },
  { id: 5, tipo: 'sistema', mensaje: 'Nueva cuenta de cliente registrada: carlos@email.com', leida: true, fecha: '2025-06-05T16:45:00' },
  { id: 6, tipo: 'entrega', mensaje: 'El envío TRK-2025-004 fue devuelto al remitente', leida: true, fecha: '2025-06-04T11:30:00' },
]

const TIPO_CONFIG: Record<string, { icon: JSX.Element; color: string }> = {
  envio: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: 'bg-teal-100 text-teal-600',
  },
  seguimiento: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'bg-blue-100 text-blue-600',
  },
  entrega: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-green-100 text-green-600',
  },
  alerta: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    color: 'bg-amber-100 text-amber-600',
  },
  sistema: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
    color: 'bg-slate-100 text-slate-600',
  },
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('es-PE', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function NotificacionesPage() {
  const unread = MOCK_NOTIFS.filter((n) => !n.leida).length

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <span className="px-2 py-0.5 bg-teal-600 text-white text-xs font-bold rounded-full">
              {unread} sin leer
            </span>
          )}
        </div>
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
          Módulo en desarrollo — datos de ejemplo
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50 overflow-hidden">
        {MOCK_NOTIFS.map((n) => {
          const cfg = TIPO_CONFIG[n.tipo] ?? TIPO_CONFIG['sistema']
          return (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-5 py-4 transition-colors ${n.leida ? '' : 'bg-teal-50/40'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.color}`}>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.leida ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{n.mensaje}</p>
                <p className="text-xs text-gray-400 mt-0.5">{fmt(n.fecha)}</p>
              </div>
              {!n.leida && (
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
