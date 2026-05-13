import { useCallback, useMemo } from 'react'
import type { PublicUser } from '../../api/authApi'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { login, logout, refreshUser, toggleFavorite } from './authSlice'

export function useAuth() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const token = useAppSelector((s) => s.auth.token)
  const favoriteListingIds = useAppSelector((s) => s.auth.favoriteListingIds)
  const ready = useAppSelector((s) => s.auth.ready)

  const loginCb = useCallback(
    (nextToken: string, nextUser: PublicUser, nextFavorites?: string[]) => {
      dispatch(login({ token: nextToken, user: nextUser, favorites: nextFavorites }))
    },
    [dispatch],
  )

  const logoutCb = useCallback(() => {
    dispatch(logout())
  }, [dispatch])

  const refreshUserCb = useCallback(async () => {
    await dispatch(refreshUser())
  }, [dispatch])

  const toggleFavoriteCb = useCallback(
    async (listingId: string) => {
      await dispatch(toggleFavorite(listingId))
    },
    [dispatch],
  )

  return useMemo(
    () => ({
      user,
      token,
      favoriteListingIds,
      ready,
      login: loginCb,
      logout: logoutCb,
      refreshUser: refreshUserCb,
      toggleFavorite: toggleFavoriteCb,
    }),
    [user, token, favoriteListingIds, ready, loginCb, logoutCb, refreshUserCb, toggleFavoriteCb],
  )
}
