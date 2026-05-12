import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  clearStoredSession,
  fetchMe,
  getStoredToken,
  type PublicUser,
  saveStoredSession,
} from '../api/authApi'
import { addFavorite, removeFavorite } from '../api/favoritesApi'

type AuthContextValue = {
  user: PublicUser | null
  token: string | null
  favoriteListingIds: string[]
  /** false until hydration + optional /api/auth/me completes */
  ready: boolean
  login: (token: string, user: PublicUser, favoriteListingIds?: string[]) => void
  logout: () => void
  refreshUser: () => Promise<void>
  toggleFavorite: (listingId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [favoriteListingIds, setFavoriteListingIds] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  const logout = useCallback(() => {
    clearStoredSession()
    setUser(null)
    setToken(null)
    setFavoriteListingIds([])
  }, [])

  const login = useCallback((nextToken: string, nextUser: PublicUser, nextFavorites?: string[]) => {
    saveStoredSession(nextToken, nextUser)
    setToken(nextToken)
    setUser(nextUser)
    setFavoriteListingIds(nextFavorites ?? [])
  }, [])

  const refreshUser = useCallback(async () => {
    const storedToken = getStoredToken()
    if (!storedToken) {
      setUser(null)
      setToken(null)
      setFavoriteListingIds([])
      return
    }
    try {
      const data = await fetchMe()
      setToken(storedToken)
      setUser(data.user)
      setFavoriteListingIds(data.favoriteListingIds ?? [])
    } catch {
      clearStoredSession()
      setUser(null)
      setToken(null)
      setFavoriteListingIds([])
    }
  }, [])

  const toggleFavorite = useCallback(
    async (listingId: string) => {
      if (!getStoredToken()) return
      const isFav = favoriteListingIds.includes(listingId)
      try {
        const ids = isFav ? await removeFavorite(listingId) : await addFavorite(listingId)
        setFavoriteListingIds(ids)
      } catch {
        await refreshUser()
      }
    },
    [favoriteListingIds, refreshUser],
  )

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
    () => ({
      user,
      token,
      favoriteListingIds,
      ready,
      login,
      logout,
      refreshUser,
      toggleFavorite,
    }),
    [user, token, favoriteListingIds, ready, login, logout, refreshUser, toggleFavorite],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
