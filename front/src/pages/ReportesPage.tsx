import { useQuery } from '@tanstack/react-query'
import type { TokenResponse } from '../core/models/auth'
import { adminService } from '../core/services/admin'
import BarChart from '../components/ui/BarChart'
import Badge from '../components/ui/Badge'

interface ReportesPageProps {
  readonly user: TokenResponse
}

const ESTADO_COLORS: Record<string, string> = {
  registrado:  'bg-slate-400',
  en_transito: 'bg-blue-500',
  en_deposito: 'bg-amber-500',
  entregado:   'bg-green-500',
  devuelto:    'bg-red-500',
}

export default function ReportesPage({ user }: ReportesPageProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats(),
    enabled: user.rol === 'admin',
    retry: false,
  })

  const { data: envios = [] } = useQuery({
    queryKey: ['admin-envios-full'],
    queryFn: () => adminService.listEnvios(0, 100),
    enabled: user.rol === 'admin',
    retry: false,
  })

  if (user.rol !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">Seccion exclusiva para administradores.</p>
      </div>
    )
  }

  const pesoTotal = envios.reduce((s, e) => s + (e.peso_kg ?? 0), 0)
  const pesoPromedio = envios.length > 0 ? pesoTotal / envios.length : 0

  const enviosConPeso = envios.filter((e) => e.peso_kg != null)
  const rangos = [
    { label: '0-1 kg',   count: enviosConPeso.filter((e) => (e.peso_kg ?? 0) <= 1).length },
    { label: '1-5 kg',   count: enviosConPeso.filter((e) => (e.peso_kg ?? 0) > 1  && (e.peso_kg ?? 0) <= 5).length },
    { label: '5-15 kg',  count: enviosConPeso.filter((e) => (e.peso_kg ?? 0) > 5  && (e.peso_kg ?? 0) <= 15).length },
    { label: '15-30 kg', count: enviosConPeso.filter((e) => (e.peso_kg ?? 0) > 15 && (e.peso_kg ?? 0) <= 30).length },
    { label: '+30 kg',   count: enviosConPeso.filter((e) => (e.peso_kg ?? 0) > 30).length },
  ]

  return (
    <div className="space-y-5">
      {/* Resumen */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...new Array(4)].map((_, i) => (
            <div key={`skel-${i}`} className="bg-white rounded-xl border border-gray-200 p-5 h-24" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">Total envios</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total_envios}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">Clientes activos</p>
            <p className="text-3xl font-bold text-gray-900">{stats.clientes_activos}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">Peso promedio</p>
            <p className="text-3xl font-bold text-gray-900">
              {pesoPromedio.toFixed(1)} <span className="text-base font-normal text-gray-400">kg</span>
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">Peso total despachado</p>
            <p className="text-3xl font-bold text-gray-900">
              {pesoTotal.toFixed(1)} <span className="text-base font-normal text-gray-400">kg</span>
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Actividad diaria */}
        {stats && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-1">Actividad diaria — ultimos 14 dias</h2>
            <p className="text-xs text-gray-400 mb-4">Total de envios registrados por dia</p>
            <BarChart
              data={stats.envios_por_dia}
              total={stats.envios_por_dia.reduce((s, d) => s + d.total, 0)}
            />
          </div>
        )}

        {/* Distribucion por estado */}
        {stats && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-1">Distribucion por estado</h2>
            <p className="text-xs text-gray-400 mb-4">Ultimo estado registrado por envio</p>
            {stats.distribucion_estados.length === 0 ? (
              <p className="text-sm text-gray-400 text-center mt-8">Sin datos</p>
            ) : (
              <div className="space-y-4 mt-2">
                {stats.distribucion_estados.map((e) => {
                  const pct = stats.total_envios > 0
                    ? Math.round((e.total / stats.total_envios) * 100)
                    : 0
                  return (
                    <div key={e.estado}>
                      <div className="flex items-center justify-between mb-1.5">
                        <Badge value={e.estado} type="estado" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-700">{e.total}</span>
                          <span className="text-xs text-gray-400">{pct}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${ESTADO_COLORS[e.estado] ?? 'bg-gray-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Distribucion por peso */}
        {envios.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-1">Distribucion por peso</h2>
            <p className="text-xs text-gray-400 mb-4">Envios agrupados por rango de peso</p>
            <div className="space-y-3">
              {rangos.map((r) => {
                const pct = enviosConPeso.length > 0 ? Math.round((r.count / enviosConPeso.length) * 100) : 0
                return (
                  <div key={r.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">{r.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700">{r.count}</span>
                        <span className="text-xs text-gray-400">{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-indigo-400" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Info del sistema */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-1">Informacion del sistema</h2>
          <p className="text-xs text-gray-400 mb-4">Estado general de la plataforma</p>
          <div className="space-y-3">
            {[
              { label: 'Backend',       value: 'FastAPI + SQLAlchemy' },
              { label: 'Base de datos', value: 'SQLite / MySQL'       },
              { label: 'Autenticacion', value: 'JWT (HS256)'          },
              { label: 'Frontend',      value: 'React 19 + TypeScript' },
              { label: 'Version API',   value: '1.0.0'                },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-800">{item.value}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
