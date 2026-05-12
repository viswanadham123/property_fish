import { getStoredToken } from './authApi'
import type { Listing } from '../data/listings'
import { apiUrl } from '../lib/apiUrl'

export type ListingIntent = 'buy' | 'rent'

export type ListingCatalogue = Record<ListingIntent, Listing[]>

export async function fetchListingCatalogue(signal?: AbortSignal): Promise<ListingCatalogue> {
  const response = await fetch(apiUrl('/api/listings'), { signal })
  if (!response.ok) throw new Error(`Failed to fetch listings: ${response.status}`)
  return response.json()
}

export async function createListing(intent: ListingIntent, payload: Partial<Listing>) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const t = getStoredToken()
  if (t) headers.Authorization = `Bearer ${t}`

  const response = await fetch(apiUrl('/api/listings'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ intent, ...payload }),
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to create listing' }))
    throw new Error(data.message || 'Failed to create listing')
  }
  return response.json()
}
