import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { TokenResponse } from '../core/models/auth'
import { adminService } from '../core/services/admin'
import Badge from '../components/ui/Badge'

interface ClientesPageProps {
  readonly user: TokenResponse
}

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function renderTableBody(
  isLoading: boolean,
  filtered: ReturnType<typeof useQuery<Awaited<ReturnType<typeof adminService.listClientes>>>['data']> extends undefined ? never[] : Awaited<ReturnType<typeof adminService.listClientes>>,
  search: string,
) {
  const SKEL = ['sk-a', 'sk-b', 'sk-c', 'sk-d', 'sk-e'] as const

  if (isLoading) {
    return (
      <div className="divide-y divide-gray-50">
        {SKEL.map((id) => (
          <div key={id} className="px-5 py-4 flex items-center gap-4 animate-pulse">
            <div className="w-9 h-9 bg-gray-100 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 bg-gray-100 rounded w-40" />
              <div className="h-3 bg-gray-100 rounded w-28" />
            </div>
            <div className="h-5 bg-gray-100 rounded-full w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="py-16 text-center">
        <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-sm text-gray-400">{search ? 'Sin resultados' : 'No hay clientes registrados'}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <th className="px-5 py-3 text-left">Usuario</th>
            <th className="px-5 py-3 text-left">Correo</th>
            <th className="px-5 py-3 text-left">Telefono</th>
            <th className="px-5 py-3 text-center">Rol</th>
            <th className="px-5 py-3 text-center">Envios</th>
            <th className="px-5 py-3 text-right">Registro</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filtered.map((c) => {
            const initials = c.nombre_completo
              .split(' ')
              .slice(0, 2)
              .map((w) => w[0])
              .join('')
              .toUpperCase()
            return (
              <tr key={c.id_usuario} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-slate-600">{initials}</span>
                    </div>
                    <span className="font-medium text-gray-800">{c.nombre_completo}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-600">{c.correo}</td>
                <td className="px-5 py-3 text-gray-600">{c.telefono ?? '—'}</td>
                <td className="px-5 py-3 text-center">
                  <Badge value={c.rol} type="rol" />
                </td>
                <td className="px-5 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-50 text-violet-700 text-xs font-bold">
                    {c.total_envios}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-gray-400 text-xs whitespace-nowrap">
                  {fmt(c.fecha_registro)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function ClientesPage({ user }: ClientesPageProps) {
  const [search, setSearch] = useState('')

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['admin-clientes'],
    queryFn: () => adminService.listClientes(0, 100),
    enabled: user.rol === 'admin',
    retry: false,
  })

  const filtered = clientes.filter(
    (c) =>
      c.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
      c.correo.toLowerCase().includes(search.toLowerCase()) ||
      (c.telefono ?? '').includes(search),
  )

  if (user.rol !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">Seccion exclusiva para administradores.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o telefono..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
          />
        </div>
      </div>

      {/* Stats bar */}
      {!isLoading && clientes.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {(['cliente', 'transportista'] as const).map((rol) => {
            const count = clientes.filter((c) => c.rol === rol).length
            return (
              <div key={rol} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
                <Badge value={rol} type="rol" />
                <span className="text-2xl font-bold text-gray-800">{count}</span>
              </div>
            )
          })}
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
            <span className="text-xs font-medium text-gray-500">Total registrados</span>
            <span className="text-2xl font-bold text-gray-800">{clientes.length}</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Directorio de usuarios</h2>
          {!isLoading && (
            <span className="text-xs text-gray-400">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        {renderTableBody(isLoading, filtered, search)}
      </div>
    </div>
  )
}
