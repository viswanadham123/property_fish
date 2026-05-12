import type { Listing } from '../data/listings'

/** Simulates a network catalogue fetch — swap URL here for a real REST API. */
export type ListingIntent = 'buy' | 'rent'

export type ListingCatalogue = Record<ListingIntent, Listing[]>

export async function fetchListingCatalogue(signal?: AbortSignal): Promise<ListingCatalogue> {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
  const response = await fetch(`${apiBase}/api/listings`, { signal })
  if (!response.ok) throw new Error(`Failed to fetch listings: ${response.status}`)
  return response.json()
}

export async function createListing(intent: ListingIntent, payload: Partial<Listing>) {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
  const response = await fetch(`${apiBase}/api/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intent, ...payload }),
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to create listing' }))
    throw new Error(data.message || 'Failed to create listing')
  }
  return response.json()
}
