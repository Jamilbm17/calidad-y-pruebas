export interface LoginDto {
  correo: string
  contrasena: string
}

export interface RegisterDto {
  nombre_completo: string
  correo: string
  contrasena: string
  rol?: string
  telefono?: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  id_usuario: number
  nombre_completo: string
  correo: string
  rol: string
}
