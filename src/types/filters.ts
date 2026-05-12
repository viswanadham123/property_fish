export type Availability = 'any' | 'immediate' | 'within15' | 'within30' | 'after30'

export type Furnishing = 'full' | 'semi' | 'none'

export type TenantKind = 'bachelor' | 'family' | 'company'

export type PropertyKind = 'apartment' | 'independent' | 'gated'

export type FilterState = {
  bhk: string
  availability: Availability
  furnishingAllowed: Furnishing[]
  tenantsPreferred: TenantKind[]
  propertyKinds: PropertyKind[]
  verifiedOwnersOnly: boolean
}

export const DEFAULT_FILTERS: FilterState = {
  bhk: 'any',
  availability: 'any',
  furnishingAllowed: ['full', 'semi', 'none'],
  tenantsPreferred: [],
  propertyKinds: [],
  verifiedOwnersOnly: false,
}
