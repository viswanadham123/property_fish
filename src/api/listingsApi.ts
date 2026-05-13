import { authHeaders, getStoredToken } from './authApi'
import type { Listing } from '../data/listings'
import { apiUrl } from '../lib/apiUrl'

export type ListingIntent = 'buy' | 'rent'

export type ListingCatalogue = Record<ListingIntent, Listing[]>

export async function fetchListingCatalogue(signal?: AbortSignal): Promise<ListingCatalogue> {
  const response = await fetch(apiUrl('/api/listings'), { signal })
  if (!response.ok) throw new Error(`Failed to fetch listings: ${response.status}`)
  return response.json()
}

/** Full listing row from the server (includes contact when stored). */
export async function fetchListingById(listingId: string, signal?: AbortSignal): Promise<Listing> {
  const response = await fetch(apiUrl(`/api/listings/${encodeURIComponent(listingId)}`), { signal })
  if (response.status === 404) throw new Error('Listing not found')
  if (!response.ok) throw new Error(`Failed to load listing: ${response.status}`)
  return response.json() as Promise<Listing>
}

/** Authenticated: properties you posted (buy / rent buckets, same as public catalogue). */
export async function fetchMyListingCatalogue(signal?: AbortSignal): Promise<ListingCatalogue> {
  const response = await fetch(apiUrl('/api/me/listings'), {
    headers: { ...authHeaders() },
    signal,
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to load your listings' }))
    throw new Error(data.message || `Failed to load your listings: ${response.status}`)
  }
  return response.json()
}

export async function createListing(intent: ListingIntent, payload: Partial<Listing>) {
  const t = getStoredToken()
  if (!t) throw new Error('Sign in to post a property')

  const response = await fetch(apiUrl('/api/listings'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
    body: JSON.stringify({ intent, ...payload }),
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to create listing' }))
    throw new Error(data.message || 'Failed to create listing')
  }
  return response.json()
}

export async function updateMyListing(listingId: string, payload: Partial<Listing> & { intent?: ListingIntent }) {
  const response = await fetch(apiUrl(`/api/me/listings/${encodeURIComponent(listingId)}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to update listing' }))
    throw new Error(data.message || 'Failed to update listing')
  }
  return response.json() as Promise<Listing>
}
