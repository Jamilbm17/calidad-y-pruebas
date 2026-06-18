import api from "../lib/api"
import type { CreateEnvioDto, CreateSeguimientoDto, EnvioResponse, SeguimientoResponse } from "../models/envio"

export const enviosService = {
  async create(data: CreateEnvioDto): Promise<EnvioResponse> {
    return api.post<never, EnvioResponse>("/envios", data)
  },

  async getByCode(codigo: string): Promise<EnvioResponse> {
    return api.get<never, EnvioResponse>(`/envios/${encodeURIComponent(codigo)}`)
  },

  async addSeguimiento(codigo: string, data: CreateSeguimientoDto): Promise<SeguimientoResponse> {
    return api.post<never, SeguimientoResponse>(
      `/envios/${encodeURIComponent(codigo)}/seguimientos`,
      data,
    )
  },
}
