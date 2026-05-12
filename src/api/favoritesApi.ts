import type { Listing } from '../data/listings'
import { authHeaders } from './authApi'
import { apiUrl } from '../lib/apiUrl'

async function readError(response: Response, fallback: string) {
  const data = await response.json().catch(() => null)
  return data?.message || fallback
}

/** GET /api/me/favorites — saved listings for the signed-in user. */
export async function fetchFavoriteListings(signal?: AbortSignal): Promise<Listing[]> {
  const response = await fetch(apiUrl('/api/me/favorites'), {
    headers: { ...authHeaders() },
    signal,
  })
  if (!response.ok) throw new Error(await readError(response, 'Could not load favorites'))
  const data = await response.json()
  return data.listings ?? []
}

/** POST /api/me/favorites — body `{ listingId }`; adds to that user's favorites in DB. */
export async function addFavorite(listingId: string): Promise<string[]> {
  const response = await fetch(apiUrl('/api/me/favorites'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ listingId }),
  })
  if (!response.ok) throw new Error(await readError(response, 'Could not save favorite'))
  const data = await response.json()
  return data.favoriteListingIds ?? []
}

/** DELETE /api/me/favorites/:listingId */
export async function removeFavorite(listingId: string): Promise<string[]> {
  const response = await fetch(apiUrl(`/api/me/favorites/${encodeURIComponent(listingId)}`), {
    method: 'DELETE',
    headers: { ...authHeaders() },
  })
  if (!response.ok) throw new Error(await readError(response, 'Could not remove favorite'))
  const data = await response.json()
  return data.favoriteListingIds ?? []
}
