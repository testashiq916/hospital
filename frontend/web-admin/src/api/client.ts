import axios from 'axios'

export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export const TOKEN_STORAGE_KEY = 'hms_token'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Central 401 handling: drop the token and let the auth guard redirect to
// /login on the next render, without forcing every call site to catch it.
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)

export interface ApiErrorShape {
  message?: string
  errors?: Record<string, string[]>
}

/** Flattens a Laravel validation error payload (or generic message) into a single readable string. */
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorShape | undefined
    if (data?.errors) {
      return Object.values(data.errors).flat().join(' ')
    }
    if (data?.message) {
      return data.message
    }
    if (error.message) {
      return error.message
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Something went wrong.'
}
