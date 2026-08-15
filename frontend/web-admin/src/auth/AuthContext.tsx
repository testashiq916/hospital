import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { apiClient, TOKEN_STORAGE_KEY, setUnauthorizedHandler } from '@/api/client'
import type { AuthResponse, User } from '@/api/types'

interface LoginPayload {
  email: string
  password: string
  company_code?: string
}

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY))
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setUser(null)
    apiClient.post('/auth/logout').catch(() => {
      /* token already invalid client-side; nothing to do */
    })
  }, [])

  const refreshMe = useCallback(async () => {
    const res = await apiClient.get<User>('/auth/me')
    setUser(res.data)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null)
      setUser(null)
    })
  }, [])

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }
    apiClient
      .get<User>('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await apiClient.post<AuthResponse>('/auth/login', payload)
    localStorage.setItem(TOKEN_STORAGE_KEY, res.data.token)
    setToken(res.data.token)
    setUser(res.data.user)
  }, [])

  const value = useMemo(
    () => ({ user, token, isLoading, login, logout, refreshMe }),
    [user, token, isLoading, login, logout, refreshMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
