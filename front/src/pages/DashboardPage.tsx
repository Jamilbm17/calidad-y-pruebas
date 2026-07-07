import { useQuery } from '@tanstack/react-query'
import type { TokenResponse } from '../core/models/auth'
import type { Page } from '../types'
import { adminService } from '../core/services/admin'
import StatCard from '../components/ui/StatCard'
import BarChart from '../components/ui/BarChart'
import Badge from '../components/ui/Badge'

interface DashboardPageProps {
  readonly user: TokenResponse
  readonly onNavigate: (page: Page) => void
}

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

const ESTADO_COLORS: Record<string, string> = {
  registrado:  'bg-slate-400',
  en_transito: 'bg-blue-500',
  en_deposito: 'bg-amber-500',
  entregado:   'bg-green-500',
  devuelto:    'bg-red-500',
}

export default function DashboardPage({ user, onNavigate }: DashboardPageProps) {
  const isAdmin = user.rol === 'admin'

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats(),
    enabled: isAdmin,
    retry: false,
  })

  const { data: envios = [] } = useQuery({
    queryKey: ['admin-envios'],
    queryFn: () => adminService.listEnvios(0, 8),
    enabled: isAdmin,
    retry: false,
  })

  const { data: seguimientos = [] } = useQuery({
    queryKey: ['admin-seguimientos'],
    queryFn: () => adminService.listSeguimientos(0, 6),
    enabled: isAdmin,
    retry: false,
  })

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Bienvenido, {user.nombre_completo}</h2>
          <p className="text-sm text-gray-500 mt-1">Usa el menu lateral para gestionar tus envios.</p>
          <button type="button" onClick={() => onNavigate('envios')}
            className="mt-4 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors cursor-pointer">
            Ver mis envios
          </button>
        </div>
      </div>
    )
  }

  const totalEnviosDia = stats?.envios_por_dia.reduce((s, d) => s + d.total, 0) ?? 0

  return (
    <div className="space-y-6">
      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onNavigate('envios')}
          className="flex items-center gap-2 px-4 py-2 bg-violet-700 text-white text-sm font-medium rounded-lg hover:bg-violet-800 transition-colors cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear envio
        </button>
        <button type="button" onClick={() => onNavigate('seguimiento')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Registrar seguimiento
        </button>
        <button type="button" onClick={() => onNavigate('clientes')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Nuevo cliente
        </button>
        <button type="button" onClick={() => onNavigate('rutas')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Nueva ruta
        </button>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...new Array(4)].map((_, i) => (
            <div key={`stat-skel-${i}`} className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-4" />
              <div className="h-8 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          No se pudieron cargar las estadisticas. Verifica que el backend este activo.
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Envios de hoy"
            value={stats.envios_hoy}
            description="Programados para la jornada"
            accent="violet"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title="Envios del mes"
            value={stats.envios_mes}
            description="Registrados este mes"
            accent="blue"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
          <StatCard
            title="Clientes activos"
            value={stats.clientes_activos}
            description="Registros operativos"
            accent="indigo"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatCard
            title="En transito"
            value={stats.en_transito}
            description="Envios en movimiento"
            accent="amber"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
        </div>
      ) : null}

      {/* Chart + Estado distribution */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Envios por dia</h2>
              <p className="text-xs text-gray-400">Actividad de los ultimos 14 dias</p>
            </div>
            <BarChart data={stats.envios_por_dia} total={totalEnviosDia} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Estado actual</h2>
              <p className="text-xs text-gray-400">Distribucion por ultimo estado</p>
            </div>
            {stats.distribucion_estados.length === 0 ? (
              <p className="text-sm text-gray-400 text-center mt-8">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {stats.distribucion_estados.map((e) => {
                  const pct = stats.total_envios > 0
                    ? Math.round((e.total / stats.total_envios) * 100)
                    : 0
                  return (
                    <div key={e.estado}>
                      <div className="flex items-center justify-between mb-1">
                        <Badge value={e.estado} type="estado" />
                        <span className="text-xs font-medium text-gray-600">{e.total}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${ESTADO_COLORS[e.estado] ?? 'bg-gray-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Ultimos envios</h2>
              <p className="text-xs text-gray-400">Los mas recientes registrados</p>
            </div>
            <button type="button" onClick={() => onNavigate('envios')}
              className="text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors cursor-pointer flex items-center gap-1">
              Ver todos
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {envios.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sin envios registrados</p>
            ) : (
              envios.map((e) => (
                <div key={e.id_envio} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-semibold text-gray-800 truncate">{e.codigo_tracking}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {e.direccion_origen} → {e.direccion_destino}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge value={e.estado_actual ?? 'registrado'} type="estado" />
                    <span className="text-xs text-gray-400 hidden sm:block">{fmt(e.fecha_creacion)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Ultimas actualizaciones</h2>
              <p className="text-xs text-gray-400">Cambios de estado recientes</p>
            </div>
            <button type="button" onClick={() => onNavigate('seguimiento')}
              className="text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors cursor-pointer flex items-center gap-1">
              Ver historial
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {seguimientos.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sin actualizaciones</p>
            ) : (
              seguimientos.map((s) => (
                <div key={s.id_seguimiento} className="px-5 py-3 flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${ESTADO_COLORS[s.estado] ?? 'bg-gray-400'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-mono font-semibold text-gray-800 truncate">{s.codigo_tracking}</p>
                      <Badge value={s.estado} type="estado" />
                    </div>
                    {s.ubicacion_actual && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{s.ubicacion_actual}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-0.5">{fmt(s.fecha_hora_actualizacion)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
