import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  clearStoredSession,
  fetchMe,
  getStoredToken,
  saveStoredSession,
  type PublicUser,
} from '../../api/authApi'
import { addFavorite, removeFavorite } from '../../api/favoritesApi'

export type AuthState = {
  user: PublicUser | null
  token: string | null
  favoriteListingIds: string[]
  /** false until bootstrap (stored session + /api/auth/me) completes */
  ready: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  favoriteListingIds: [],
  ready: false,
}

export const refreshUser = createAsyncThunk('auth/refreshUser', async () => {
  const storedToken = getStoredToken()
  if (!storedToken) {
    return {
      user: null as PublicUser | null,
      token: null as string | null,
      favoriteListingIds: [] as string[],
    }
  }
  try {
    const data = await fetchMe()
    saveStoredSession(storedToken, data.user)
    return {
      user: data.user,
      token: storedToken,
      favoriteListingIds: data.favoriteListingIds ?? [],
    }
  } catch {
    clearStoredSession()
    return { user: null, token: null, favoriteListingIds: [] }
  }
})

type AuthThunkState = { auth: AuthState }

export const toggleFavorite = createAsyncThunk<string[], string, { state: AuthThunkState }>(
  'auth/toggleFavorite',
  async (listingId, { getState, dispatch }) => {
    if (!getStoredToken()) {
      return getState().auth.favoriteListingIds
    }
    const isFav = getState().auth.favoriteListingIds.includes(listingId)
    try {
      return isFav ? await removeFavorite(listingId) : await addFavorite(listingId)
    } catch {
      await dispatch(refreshUser())
      return getState().auth.favoriteListingIds
    }
  },
)

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { dispatch }) => {
  await dispatch(refreshUser())
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ token: string; user: PublicUser; favorites?: string[] }>,
    ) => {
      const { token, user, favorites } = action.payload
      saveStoredSession(token, user)
      state.token = token
      state.user = user
      state.favoriteListingIds = favorites ?? []
    },
    logout: (state) => {
      clearStoredSession()
      state.user = null
      state.token = null
      state.favoriteListingIds = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        state.favoriteListingIds = action.payload.favoriteListingIds
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.favoriteListingIds = action.payload
      })
      .addCase(bootstrapAuth.fulfilled, (state) => {
        state.ready = true
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.ready = true
      })
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
