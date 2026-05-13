import type { Availability, Furnishing, PropertyKind, TenantKind } from '../types/filters'

export type ListingIntent = 'buy' | 'rent'

/** Listing rows come from the API (`GET /api/listings`, etc.); no client-side seed data. */
export type Listing = {
  /** Name / phone for enquiries (included in public listing payloads). */
  contactName?: string
  contactPhone?: string
  /** Present when listing was posted signed-in; used to hide "Contact owner" for your own posts. */
  postedById?: string | null
  id: string
  intent?: ListingIntent
  title: string
  agreementLabel: string
  agreementAmountINR: number
  description: string
  location: string
  bathrooms: number
  parking: string
  highlights: string[]
  bhk: string
  propertyType: string
  priceDisplay: string
  imageTone: string
  availability: Availability
  furnishing: Furnishing
  tenants: TenantKind[]
  propertyKinds: PropertyKind[]
  ownerVerified: boolean
  postedAt: string
  relevanceScore: number
}
