import api from '../lib/api'
import type { AdminStats, AdminEnvio, AdminCliente, AdminSeguimiento } from '../models/admin'

export const adminService = {
  getStats(): Promise<AdminStats> {
    return api.get<never, AdminStats>('/admin/stats')
  },
  listEnvios(skip = 0, limit = 50): Promise<AdminEnvio[]> {
    return api.get<never, AdminEnvio[]>(`/admin/envios?skip=${skip}&limit=${limit}`)
  },
  listClientes(skip = 0, limit = 50): Promise<AdminCliente[]> {
    return api.get<never, AdminCliente[]>(`/admin/clientes?skip=${skip}&limit=${limit}`)
  },
  listSeguimientos(skip = 0, limit = 50): Promise<AdminSeguimiento[]> {
    return api.get<never, AdminSeguimiento[]>(`/admin/seguimientos?skip=${skip}&limit=${limit}`)
  },
}
