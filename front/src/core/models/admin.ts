export interface DayCount {
  fecha: string
  total: number
}

export interface EstadoCount {
  estado: string
  total: number
}

export interface AdminStats {
  envios_hoy: number
  envios_mes: number
  total_envios: number
  clientes_activos: number
  en_transito: number
  envios_por_dia: DayCount[]
  distribucion_estados: EstadoCount[]
}

export interface AdminEnvio {
  id_envio: number
  codigo_tracking: string
  descripcion_paquete: string | null
  direccion_origen: string
  direccion_destino: string
  peso_kg: number | null
  fecha_creacion: string | null
  estado_actual: string | null
  id_usuario_cliente: number
}

export interface AdminCliente {
  id_usuario: number
  nombre_completo: string
  correo: string
  rol: string
  telefono: string | null
  fecha_registro: string | null
  total_envios: number
}

export interface AdminSeguimiento {
  id_seguimiento: number
  id_envio: number
  codigo_tracking: string
  estado: string
  ubicacion_actual: string | null
  fecha_hora_actualizacion: string | null
  observaciones: string | null
}
