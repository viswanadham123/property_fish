import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  clearStoredSession,
  fetchMe,
  getStoredToken,
  type PublicUser,
  saveStoredSession,
} from '../api/authApi'

type AuthContextValue = {
  user: PublicUser | null
  token: string | null
  /** false until hydration + optional /api/auth/me completes */
  ready: boolean
  login: (token: string, user: PublicUser) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const logout = useCallback(() => {
    clearStoredSession()
    setUser(null)
    setToken(null)
  }, [])

  const login = useCallback((nextToken: string, nextUser: PublicUser) => {
    saveStoredSession(nextToken, nextUser)
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const refreshUser = useCallback(async () => {
    const storedToken = getStoredToken()
    if (!storedToken) {
      setUser(null)
      setToken(null)
      return
    }
    try {
      const data = await fetchMe()
      setToken(storedToken)
      setUser(data.user)
    } catch {
      clearStoredSession()
      setUser(null)
      setToken(null)
    }
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      await refreshUser()
      if (alive) setReady(true)
    })()
    return () => {
      alive = false
    }
  }, [refreshUser])

  const value = useMemo(
    () => ({ user, token, ready, login, logout, refreshUser }),
    [user, token, ready, login, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
