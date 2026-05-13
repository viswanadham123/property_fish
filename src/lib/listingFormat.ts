/** Parses agreement label like "₹20,000 agreement details" for display. */
export function parseAgreement(label: string) {
  const suffix = ' agreement details'
  const lower = label.toLowerCase()
  if (lower.endsWith(suffix)) {
    return {
      price: label.slice(0, label.length - suffix.length),
      showAgreementLink: true as const,
    }
  }
  return { price: label, showAgreementLink: false as const }
}

const AVAILABILITY_LABEL: Record<string, string> = {
  any: 'Flexible',
  immediate: 'Ready to move — immediately',
  within15: 'Within 15 days',
  within30: 'Within 30 days',
  after30: 'After 30 days',
}

export function availabilityLabel(value: string | undefined): string {
  if (!value) return '—'
  return AVAILABILITY_LABEL[value] ?? value
}

const FURNISHING_LABEL: Record<string, string> = {
  full: 'Fully furnished',
  semi: 'Semi-furnished',
  none: 'Unfurnished',
}

export function furnishingLabel(value: string | undefined): string {
  if (!value) return '—'
  return FURNISHING_LABEL[value] ?? value
}

const TENANT_LABEL: Record<string, string> = {
  bachelor: 'Bachelors',
  family: 'Family',
  company: 'Company',
}

export function tenantKindsLabel(values: string[]): string {
  if (!values.length) return '—'
  return values.map((v) => TENANT_LABEL[v] ?? v).join(', ')
}

const PROPERTY_KIND_LABEL: Record<string, string> = {
  apartment: 'Apartment',
  independent: 'Independent house',
  gated: 'Gated villa',
}

export function propertyKindsLabel(values: string[]): string {
  if (!values.length) return '—'
  return values.map((v) => PROPERTY_KIND_LABEL[v] ?? v).join(', ')
}
