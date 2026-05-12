import type { Listing } from '../data/listings'
import type { FilterState } from '../types/filters'

export type SortMode = 'relevance' | 'newest' | 'price-low'

function matchesBhk(listing: Listing, selected: string) {
  if (selected === 'any') return true
  if (selected === '4+ BHK') return listing.bhk === '4 BHK' || listing.bhk === '4+ BHK'
  return listing.bhk === selected
}

function matchesAvailability(listing: Listing, availability: FilterState['availability']) {
  if (availability === 'any') return true
  return listing.availability === availability
}

function matchesFurnishing(listing: Listing, allowed: FilterState['furnishingAllowed']) {
  if (allowed.length === 0) return true
  return allowed.includes(listing.furnishing)
}

function matchesTenants(listing: Listing, preferred: FilterState['tenantsPreferred']) {
  if (preferred.length === 0) return true
  return listing.tenants.some((t) => preferred.includes(t))
}

function matchesPropertyKinds(listing: Listing, kinds: FilterState['propertyKinds']) {
  if (kinds.length === 0) return true
  return listing.propertyKinds.some((k) => kinds.includes(k))
}

function matchesVerified(listing: Listing, verifiedOnly: boolean) {
  if (!verifiedOnly) return true
  return listing.ownerVerified === true
}

export function matchesSearchQuery(listing: Listing, query: string, localityTags: string[]) {
  const q = query.trim().toLowerCase()
  const blob = `${listing.title} ${listing.description} ${listing.location}`.toLowerCase()

  if (q && !blob.includes(q)) return false

  if (localityTags.length > 0) {
    const loc = listing.location.toLowerCase()
    const hit = localityTags.some((tag) => loc.includes(tag.toLowerCase()))
    if (!hit) return false
  }

  return true
}

export function filterListings(
  listings: Listing[],
  filters: FilterState,
  query: string,
  localityTags: string[],
): Listing[] {
  return listings.filter((listing) => {
    return (
      matchesBhk(listing, filters.bhk) &&
      matchesAvailability(listing, filters.availability) &&
      matchesFurnishing(listing, filters.furnishingAllowed) &&
      matchesTenants(listing, filters.tenantsPreferred) &&
      matchesPropertyKinds(listing, filters.propertyKinds) &&
      matchesVerified(listing, filters.verifiedOwnersOnly) &&
      matchesSearchQuery(listing, query, localityTags)
    )
  })
}

export function sortListings(listings: Listing[], sortBy: SortMode): Listing[] {
  const copy = [...listings]

  if (sortBy === 'newest') {
    return copy.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
  }

  if (sortBy === 'price-low') {
    return copy.sort((a, b) => a.agreementAmountINR - b.agreementAmountINR)
  }

  return copy.sort((a, b) => b.relevanceScore - a.relevanceScore)
}
