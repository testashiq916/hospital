import { http } from '../lib/http'
import type { AuthUser, LoginResponse } from '../types/api'

export interface LoginPayload {
  email: string
  password: string
  company_code?: string
}

export interface RegisterPayload {
  company_name: string
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirmation: string
  mobile?: string
}

export const authApi = {
  login: (payload: LoginPayload) => http.post<LoginResponse>('/auth/login', payload),
  register: (payload: RegisterPayload) =>
    http.post<{ message: string; token: string; user: AuthUser }>('/auth/register', payload),
  logout: () => http.post<{ message: string }>('/auth/logout'),
  me: () => http.get<AuthUser>('/auth/me'),
}
