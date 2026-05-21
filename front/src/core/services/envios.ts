import api from "../lib/api"
import type { CreateEnvioDto, EnvioResponse } from "../models/envio"

export const enviosService = {
  async create(data: CreateEnvioDto): Promise<EnvioResponse> {
    return api.post<never, EnvioResponse>("/envios", data)
  },

  async getByCode(codigo: string): Promise<EnvioResponse> {
    return api.get<never, EnvioResponse>(`/envios/${encodeURIComponent(codigo)}`)
  },
}
