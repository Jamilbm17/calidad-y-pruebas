import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { TokenResponse } from '../core/models/auth'
import { adminService } from '../core/services/admin'
import { enviosService } from '../core/services/envios'
import Badge from '../components/ui/Badge'
import type { AdminSeguimiento } from '../core/models/admin'

interface SeguimientoPageProps {
  readonly user: TokenResponse
}

const ESTADOS = ['en_transito', 'en_deposito', 'entregado', 'devuelto'] as const

const addSeguimientoSchema = z.object({
  codigo: z.string().min(1, 'Requerido'),
  estado: z.enum(ESTADOS, { required_error: 'Selecciona un estado' }),
  ubicacion_actual: z.string().optional(),
  observaciones: z.string().optional(),
})
type AddValues = z.infer<typeof addSeguimientoSchema>

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function AddSeguimientoPanel({ onSuccess }: { readonly onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddValues>({
    resolver: zodResolver(addSeguimientoSchema),
  })

  const onSubmit = async ({ codigo, ...rest }: AddValues) => {
    setLoading(true)
    try {
      await enviosService.addSeguimiento(codigo, rest)
      toast.success('Seguimiento registrado')
      reset()
      onSuccess()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Error al registrar'
      toast.error('Error', { description: detail })
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white'
  const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Registrar actualizacion de estado</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="seg-codigo" className={labelCls}>Codigo de tracking *</label>
            <input id="seg-codigo" {...register('codigo')} placeholder="TRK-2025-001" className={inputCls} />
            {errors.codigo && <p className="text-xs text-red-500 mt-1">{errors.codigo.message}</p>}
          </div>
          <div>
            <label htmlFor="seg-estado" className={labelCls}>Nuevo estado *</label>
            <select id="seg-estado" {...register('estado')} className={inputCls}>
              <option value="">Seleccionar estado</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e.replaceAll('_', ' ')}</option>
              ))}
            </select>
            {errors.estado && <p className="text-xs text-red-500 mt-1">{errors.estado.message}</p>}
          </div>
          <div>
            <label htmlFor="seg-ubicacion" className={labelCls}>Ubicacion actual</label>
            <input id="seg-ubicacion" {...register('ubicacion_actual')} placeholder="Lima, Miraflores" className={inputCls} />
          </div>
          <div>
            <label htmlFor="seg-obs" className={labelCls}>Observaciones</label>
            <input id="seg-obs" {...register('observaciones')} placeholder="Entregado al portero..." className={inputCls} />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors cursor-pointer">
          {loading ? 'Registrando...' : 'Registrar actualizacion'}
        </button>
      </form>
    </div>
  )
}

const SKEL_ROWS = ['sk-a', 'sk-b', 'sk-c', 'sk-d', 'sk-e', 'sk-f'] as const

function renderSeguimientoBody(
  isLoading: boolean,
  filtered: AdminSeguimiento[],
  search: string,
) {
  if (isLoading) {
    return (
      <div className="divide-y divide-gray-50">
        {SKEL_ROWS.map((id) => (
          <div key={id} className="px-5 py-4 flex items-center gap-4 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="h-5 bg-gray-100 rounded-full w-20" />
            <div className="h-4 bg-gray-100 rounded w-32 flex-1" />
          </div>
        ))}
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-gray-400">{search ? 'Sin resultados' : 'Sin registros de seguimiento'}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <th className="px-5 py-3 text-left">#</th>
            <th className="px-5 py-3 text-left">Codigo</th>
            <th className="px-5 py-3 text-center">Estado</th>
            <th className="px-5 py-3 text-left">Ubicacion</th>
            <th className="px-5 py-3 text-left">Observaciones</th>
            <th className="px-5 py-3 text-right">Fecha y hora</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filtered.map((s) => (
            <tr key={s.id_seguimiento} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3 text-gray-400 text-xs">#{s.id_seguimiento}</td>
              <td className="px-5 py-3">
                <span className="font-mono text-xs font-semibold text-gray-800">{s.codigo_tracking}</span>
              </td>
              <td className="px-5 py-3 text-center">
                <Badge value={s.estado} type="estado" />
              </td>
              <td className="px-5 py-3 text-gray-600">{s.ubicacion_actual ?? '—'}</td>
              <td className="px-5 py-3 text-gray-500 max-w-[200px] truncate">{s.observaciones ?? '—'}</td>
              <td className="px-5 py-3 text-right text-gray-400 text-xs whitespace-nowrap">
                {fmt(s.fecha_hora_actualizacion)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function SeguimientoPage({ user }: SeguimientoPageProps) {
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data: seguimientos = [], isLoading } = useQuery({
    queryKey: ['admin-seguimientos-full'],
    queryFn: () => adminService.listSeguimientos(0, 100),
    enabled: user.rol === 'admin',
    retry: false,
  })

  const filtered = seguimientos.filter(
    (s) =>
      s.codigo_tracking.toLowerCase().includes(search.toLowerCase()) ||
      s.estado.toLowerCase().includes(search.toLowerCase()) ||
      (s.ubicacion_actual ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      {user.rol === 'admin' && (
        <AddSeguimientoPanel onSuccess={() => {
          qc.invalidateQueries({ queryKey: ['admin-seguimientos-full'] })
          qc.invalidateQueries({ queryKey: ['admin-stats'] })
        }} />
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por codigo o estado..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Historial de seguimiento</h2>
          {!isLoading && (
            <span className="text-xs text-gray-400">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        {renderSeguimientoBody(isLoading, filtered, search)}
      </div>
    </div>
  )
}
