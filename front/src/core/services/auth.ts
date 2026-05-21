import api from "../lib/api"
import type { LoginDto, RegisterDto, TokenResponse } from "../models/auth"

export const authService = {
  async login(data: LoginDto): Promise<TokenResponse> {
    return api.post<never, TokenResponse>("/auth/login", data)
  },

  async register(data: RegisterDto): Promise<TokenResponse> {
    return api.post<never, TokenResponse>("/auth/register", data)
  },
}
