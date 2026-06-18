export interface SeguimientoResponse {
  id_seguimiento: number
  id_envio: number
  estado: string
  ubicacion_actual: string | null
  fecha_hora_actualizacion: string | null
  observaciones: string | null
}

export interface EnvioResponse {
  id_envio: number
  codigo_tracking: string
  id_usuario_cliente: number
  id_ruta: number | null
  descripcion_paquete: string | null
  peso_kg: number | null
  dimensiones: string | null
  direccion_origen: string
  direccion_destino: string
  fecha_creacion: string | null
  seguimientos: SeguimientoResponse[]
}

export interface CreateSeguimientoDto {
  estado: string
  ubicacion_actual?: string
  observaciones?: string
}

export interface CreateEnvioDto {
  codigo_tracking: string
  id_usuario_cliente: number
  id_ruta?: number
  descripcion_paquete?: string
  peso_kg?: number
  dimensiones?: string
  direccion_origen: string
  direccion_destino: string
  estado_inicial?: string
  ubicacion_inicial?: string
}
