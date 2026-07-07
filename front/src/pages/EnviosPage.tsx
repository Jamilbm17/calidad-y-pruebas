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

interface EnviosPageProps {
  readonly user: TokenResponse
}

const createSchema = z.object({
  codigo_tracking: z.string().min(1, 'Requerido'),
  descripcion_paquete: z.string().optional(),
  peso_kg: z.coerce.number().positive('Debe ser mayor a 0').optional(),
  dimensiones: z.string().optional(),
  direccion_origen: z.string().min(1, 'Requerido'),
  direccion_destino: z.string().min(1, 'Requerido'),
})
type CreateValues = z.infer<typeof createSchema>

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function CreateEnvioModal({ userId, onClose, onSuccess }: {
  userId: number
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
  })

  const onSubmit = async (values: CreateValues) => {
    setLoading(true)
    try {
      await enviosService.create({ ...values, id_usuario_cliente: userId })
      toast.success('Envío creado correctamente')
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Error al crear envío'
      toast.error('Error', { description: detail })
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
  const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md my-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Nuevo envío</h3>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Código de tracking *</label>
              <input {...register('codigo_tracking')} placeholder="TRK-2025-001" className={inputCls} />
              {errors.codigo_tracking && <p className="text-xs text-red-500 mt-1">{errors.codigo_tracking.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Peso (kg)</label>
              <input {...register('peso_kg')} type="number" step="0.1" placeholder="1.5" className={inputCls} />
              {errors.peso_kg && <p className="text-xs text-red-500 mt-1">{errors.peso_kg.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Dimensiones</label>
              <input {...register('dimensiones')} placeholder="30x20x10 cm" className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Descripción del paquete</label>
              <input {...register('descripcion_paquete')} placeholder="Documentos, electrónica..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Dirección origen *</label>
              <input {...register('direccion_origen')} placeholder="Av. Lima 123, Lima" className={inputCls} />
              {errors.direccion_origen && <p className="text-xs text-red-500 mt-1">{errors.direccion_origen.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Dirección destino *</label>
              <input {...register('direccion_destino')} placeholder="Av. Arequipa 456, Arequipa" className={inputCls} />
              {errors.direccion_destino && <p className="text-xs text-red-500 mt-1">{errors.direccion_destino.message}</p>}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors cursor-pointer">
              {loading ? 'Creando...' : 'Crear envío'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function EnviosPage({ user }: EnviosPageProps) {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data: envios = [], isLoading } = useQuery({
    queryKey: ['admin-envios-full'],
    queryFn: () => adminService.listEnvios(0, 100),
    enabled: user.rol === 'admin',
    retry: false,
  })

  const filtered = envios.filter(
    (e) =>
      e.codigo_tracking.toLowerCase().includes(search.toLowerCase()) ||
      e.direccion_origen.toLowerCase().includes(search.toLowerCase()) ||
      e.direccion_destino.toLowerCase().includes(search.toLowerCase()) ||
      (e.descripcion_paquete ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, origen, destino..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo envío
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Todos los envíos</h2>
          {!isLoading && (
            <span className="text-xs text-gray-400">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {isLoading ? (
          <div className="divide-y divide-gray-50">
            {(['sk-a', 'sk-b', 'sk-c', 'sk-d', 'sk-e'] as const).map((id) => (
              <div key={id} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-28" />
                <div className="h-4 bg-gray-100 rounded w-40 flex-1" />
                <div className="h-4 bg-gray-100 rounded w-20" />
                <div className="h-5 bg-gray-100 rounded-full w-16" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm text-gray-400">{search ? 'Sin resultados para tu búsqueda' : 'No hay envíos registrados'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Código</th>
                  <th className="px-5 py-3 text-left">Descripción</th>
                  <th className="px-5 py-3 text-left">Origen</th>
                  <th className="px-5 py-3 text-left">Destino</th>
                  <th className="px-5 py-3 text-right">Peso</th>
                  <th className="px-5 py-3 text-center">Estado</th>
                  <th className="px-5 py-3 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((e) => (
                  <tr key={e.id_envio} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs font-semibold text-gray-800">{e.codigo_tracking}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 max-w-[160px] truncate">
                      {e.descripcion_paquete ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-600 max-w-[140px] truncate">{e.direccion_origen}</td>
                    <td className="px-5 py-3 text-gray-600 max-w-[140px] truncate">{e.direccion_destino}</td>
                    <td className="px-5 py-3 text-right text-gray-600">
                      {e.peso_kg != null ? `${e.peso_kg} kg` : '—'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Badge value={e.estado_actual ?? 'registrado'} type="estado" />
                    </td>
                    <td className="px-5 py-3 text-right text-gray-400 text-xs whitespace-nowrap">
                      {fmt(e.fecha_creacion)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <CreateEnvioModal
          userId={user.id_usuario}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['admin-envios-full'] })
            qc.invalidateQueries({ queryKey: ['admin-stats'] })
          }}
        />
      )}
    </div>
  )
}
