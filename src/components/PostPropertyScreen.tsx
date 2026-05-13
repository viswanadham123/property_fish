import { useEffect, useMemo, useState } from 'react'
import { createListing, updateMyListing, type ListingIntent } from '../api/listingsApi'
import type { Listing } from '../data/listings'
import type { Furnishing, PropertyKind, TenantKind } from '../types/filters'

function splitLocationForForm(location: string): { city: string; locality: string } {
  const t = location.trim()
  const idx = t.lastIndexOf(', ')
  if (idx === -1) return { city: '', locality: t }
  return { locality: t.slice(0, idx).trim(), city: t.slice(idx + 2).trim() }
}

const TENANT_OPTIONS: { label: string; value: TenantKind }[] = [
  { label: 'Bachelor', value: 'bachelor' },
  { label: 'Family', value: 'family' },
  { label: 'Company', value: 'company' },
]

const PROPERTY_KIND_OPTIONS: { label: string; value: PropertyKind }[] = [
  { label: 'Apartment', value: 'apartment' },
  { label: 'Independent House', value: 'independent' },
  { label: 'Gated Villa', value: 'gated' },
]

function parseTenantKinds(form: FormData): TenantKind[] {
  const raw = form.getAll('tenants') as string[]
  const allowed: TenantKind[] = ['bachelor', 'family', 'company']
  return raw.filter((x): x is TenantKind => allowed.includes(x as TenantKind))
}

function parsePropertyKinds(form: FormData): PropertyKind[] {
  const raw = form.getAll('propertyKinds') as string[]
  const allowed: PropertyKind[] = ['apartment', 'independent', 'gated']
  return raw.filter((x): x is PropertyKind => allowed.includes(x as PropertyKind))
}

type EditContext = { listing: Listing; intent: ListingIntent }

type Props = {
  onBackToListings: () => void
  onListingPosted?: () => void | Promise<void>
  edit?: EditContext
  onCancelEdit?: () => void
  onEditSaved?: () => void | Promise<void>
  /** Create flow only: pre-select Sell vs Rent in the form */
  initialIntent?: ListingIntent
}

const PROPERTY_TYPES = [
  'Apartment',
  'Independent House/Villa',
  'Gated Community Villa',
  'Builder Floor',
] as const

const BHK_OPTIONS = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'] as const

function propertyTypeForSelect(stored: string | undefined): string {
  if (!stored) return 'Apartment'
  return (PROPERTY_TYPES as readonly string[]).includes(stored) ? stored : stored
}

function bhkForSelect(stored: string | undefined): string {
  if (!stored) return '2 BHK'
  return (BHK_OPTIONS as readonly string[]).includes(stored) ? stored : stored
}

export function PostPropertyScreen({
  onBackToListings,
  onListingPosted,
  edit,
  onCancelEdit,
  onEditSaved,
  initialIntent = 'buy',
}: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const formKey = edit ? `edit-${edit.listing.id}` : `create-${initialIntent}`

  const defaults = useMemo(() => {
    if (!edit) {
      return {
        title: '',
        propertyType: 'Apartment',
        intentIsRent: initialIntent === 'rent',
        bhk: '2 BHK',
        city: '',
        locality: '',
        amount: '',
        availability: 'immediate' as const,
        description: '',
        contactName: '',
        contactPhone: '',
        furnishing: 'semi' as Furnishing,
        tenants: ['family'] as TenantKind[],
        propertyKinds: ['apartment'] as PropertyKind[],
      }
    }
    const loc = splitLocationForForm(edit.listing.location)
    return {
      title: edit.listing.title,
      propertyType: propertyTypeForSelect(edit.listing.propertyType),
      bhk: bhkForSelect(edit.listing.bhk),
      intentIsRent: edit.intent === 'rent',
      city: loc.city || '',
      locality: loc.locality,
      amount: String(edit.listing.agreementAmountINR ?? ''),
      availability: edit.listing.availability,
      description: edit.listing.description,
      contactName: edit.listing.contactName ?? '',
      contactPhone: edit.listing.contactPhone ?? '',
      furnishing: edit.listing.furnishing,
      tenants: (edit.listing.tenants?.length ? edit.listing.tenants : ['family']) as TenantKind[],
      propertyKinds: (edit.listing.propertyKinds?.length ? edit.listing.propertyKinds : ['apartment']) as PropertyKind[],
    }
  }, [edit, initialIntent])

  useEffect(() => {
    setSubmitted(false)
    setError(null)
  }, [formKey])

  const heading = edit ? 'Edit your property' : 'Post Your Property'
  const subheading = edit
    ? 'Update the details below and save. Changes apply immediately.'
    : 'Fill details once. Our team can help you verify and publish quickly.'
  const successTitle = edit ? 'Property updated' : 'Property submitted successfully'
  const successBody = edit
    ? 'Your changes have been saved.'
    : 'Thanks! A relationship manager will contact you shortly for verification.'
  const submitLabel = loading ? (edit ? 'Saving…' : 'Submitting…') : edit ? 'Save changes' : 'Submit Property'

  function handleBack() {
    if (edit && onCancelEdit) onCancelEdit()
    else onBackToListings()
  }

  const customPropertyType = edit && !(PROPERTY_TYPES as readonly string[]).includes(edit.listing.propertyType)
  const customBhk = edit && !(BHK_OPTIONS as readonly string[]).includes(edit.listing.bhk)

  return (
    <div className="mx-auto w-full max-w-none px-4 py-6 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {edit ? 'Edit property' : 'Free property post'}
          </p>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">{heading}</h1>
          <p className="mt-1 text-sm text-ink-secondary">{subheading}</p>
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary hover:bg-surface-muted"
        >
          {edit ? 'Back' : 'Back to properties'}
        </button>
      </div>

      {submitted ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          <h2 className="text-lg font-bold">{successTitle}</h2>
          <p className="mt-1 text-sm">{successBody}</p>
          {edit ? (
            <button
              type="button"
              onClick={() => void onEditSaved?.()}
              className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Back to my properties
            </button>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-700">{error}</p> : null}

      {!submitted ? (
        <form
          key={formKey}
          className="space-y-5 rounded-lg border border-border-subtle bg-surface p-5 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault()
          setLoading(true)
          setError(null)
          try {
            const form = new FormData(e.currentTarget)
            const intent = form.get('intent') === 'Rent' ? 'rent' : 'buy'
            const city = String(form.get('city') || '').trim()
            const locality = String(form.get('locality') || '').trim()
            const amount = Number(form.get('agreementAmountINR') || 0)
            const contactName = String(form.get('contactName') || '').trim()
            const contactPhone = String(form.get('contactPhone') || '').trim()

            const furnishingRaw = String(form.get('furnishing') || 'semi')
            const furnishing: Furnishing = ['full', 'semi', 'none'].includes(furnishingRaw)
              ? (furnishingRaw as Furnishing)
              : 'semi'
            const tenants = parseTenantKinds(form)
            const propertyKinds = parsePropertyKinds(form)

            if (tenants.length === 0) {
              setError('Choose at least one preferred tenant type (same options as property search filters).')
              return
            }
            if (propertyKinds.length === 0) {
              setError('Choose at least one property kind: Apartment, Independent House, or Gated Villa.')
              return
            }

            const payload = {
              contactName,
              contactPhone,
              title: String(form.get('title') || ''),
              propertyType: String(form.get('propertyType') || 'Apartment'),
              bhk: String(form.get('bhk') || '2 BHK'),
              location: city && locality ? `${locality}, ${city}` : city || locality,
              agreementAmountINR: amount,
              agreementLabel: `₹${amount.toLocaleString('en-IN')} agreement details`,
              availability: String(form.get('availability') || 'immediate') as
                | 'any'
                | 'immediate'
                | 'within15'
                | 'within30'
                | 'after30',
              description: String(form.get('description') || ''),
              parking: 'Available',
              bathrooms: 2,
              highlights: edit ? (edit.listing.highlights?.length ? edit.listing.highlights : []) : [],
              furnishing,
              tenants,
              propertyKinds,
              priceDisplay: 'Contact for price',
              imageTone: 'from-slate-700 to-slate-900',
            }

            if (!payload.title || !payload.location) {
              setError('Title and location are required')
              return
            }

            if (edit) {
              await updateMyListing(edit.listing.id, {
                intent,
                ...payload,
              })
              setSubmitted(true)
              await onListingPosted?.()
            } else {
              await createListing(intent, {
                ...payload,
              })
              setSubmitted(true)
              await onListingPosted?.()
            }
          } catch (err) {
            setSubmitted(false)
            setError(err instanceof Error ? err.message : edit ? 'Failed to save changes' : 'Failed to submit property')
          } finally {
            setLoading(false)
          }
        }}
      >
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">Basic Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-ink-secondary">
              Property Title
              <input
                name="title"
                required
                defaultValue={defaults.title}
                placeholder="e.g. 2 BHK Independent Builder Floor"
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-ink-secondary">
              Property Type
              <select
                name="propertyType"
                defaultValue={defaults.propertyType}
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              >
                {customPropertyType ? (
                  <option value={edit!.listing.propertyType}>{edit!.listing.propertyType}</option>
                ) : null}
                {PROPERTY_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-ink-secondary">
              Intent
              <select
                name="intent"
                defaultValue={defaults.intentIsRent ? 'Rent' : 'Sell'}
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              >
                <option>Sell</option>
                <option>Rent</option>
              </select>
            </label>
            <label className="text-sm font-medium text-ink-secondary">
              <span>BHK</span>
              <span className="mt-0.5 block text-xs font-normal text-ink-muted">Matches “BHK Type” in property search filters</span>
              <select
                name="bhk"
                defaultValue={defaults.bhk}
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              >
                {customBhk ? <option value={edit!.listing.bhk}>{edit!.listing.bhk}</option> : null}
                {BHK_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">Location & Pricing</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-ink-secondary">
              City
              <input
                name="city"
                required
                defaultValue={defaults.city}
                placeholder="City name"
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-ink-secondary">
              Locality
              <input
                name="locality"
                required
                defaultValue={defaults.locality}
                placeholder="Area or sector"
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-ink-secondary">
              Expected Amount (INR)
              <input
                name="agreementAmountINR"
                required
                type="number"
                defaultValue={defaults.amount}
                placeholder="20000"
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-ink-secondary">
              <span>Availability (possession)</span>
              <span className="mt-0.5 block text-xs font-normal text-ink-muted">Same choices as “Availability” in the filter sidebar</span>
              <select
                name="availability"
                defaultValue={defaults.availability}
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              >
                <option value="any">Flexible (any)</option>
                <option value="immediate">Immediate</option>
                <option value="within15">Within 15 days</option>
                <option value="within30">Within 30 days</option>
                <option value="after30">After 30 days</option>
              </select>
            </label>
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-ink-muted">How buyers filter your property</h2>
          <p className="mb-4 text-xs text-ink-secondary">
            These line up with the sidebar filters on the main search page (furnishing, tenants, and property kind).
          </p>

          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Furnishing</h3>
          <div className="mb-5 flex flex-col gap-2.5 text-sm text-ink-secondary">
            {(['full', 'semi', 'none'] as const).map((f) => (
              <label key={f} className="flex cursor-pointer items-center gap-2 capitalize">
                <input type="radio" name="furnishing" value={f} defaultChecked={defaults.furnishing === f} />
                {f}
              </label>
            ))}
          </div>

          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Preferred tenants</h3>
          <div className="mb-5 flex flex-wrap gap-2">
            {TENANT_OPTIONS.map(({ label, value }) => {
              const on = defaults.tenants.includes(value)
              return (
                <label
                  key={value}
                  className={
                    'cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold transition ' +
                    (on
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-border-subtle bg-surface-muted text-ink-secondary hover:border-brand-600/35')
                  }
                >
                  <input type="checkbox" name="tenants" value={value} defaultChecked={on} className="sr-only" />
                  {label}
                </label>
              )
            })}
          </div>

          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Property kind</h3>
          <p className="mb-2 text-xs text-ink-muted">Used for “Property Type” filters (apartment / independent / gated).</p>
          <div className="mb-5 flex flex-wrap gap-2">
            {PROPERTY_KIND_OPTIONS.map(({ label, value }) => {
              const on = defaults.propertyKinds.includes(value)
              return (
                <label
                  key={value}
                  className={
                    'cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold transition ' +
                    (on
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-border-subtle bg-surface-muted text-ink-secondary hover:border-brand-600/35')
                  }
                >
                  <input type="checkbox" name="propertyKinds" value={value} defaultChecked={on} className="sr-only" />
                  {label}
                </label>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">Description & Contact</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-ink-secondary md:col-span-2">
              Description
              <textarea
                name="description"
                required
                rows={4}
                defaultValue={defaults.description}
                placeholder="Mention highlights, nearby metro, amenities, etc."
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-ink-secondary">
              Owner Name
              <input
                name="contactName"
                required
                defaultValue={defaults.contactName}
                placeholder="Your name"
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-ink-secondary">
              Phone Number
              <input
                name="contactPhone"
                required
                defaultValue={defaults.contactPhone}
                placeholder="+91 9XXXXXXXXX"
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              />
            </label>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border-subtle pt-4">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitLabel}
          </button>
        </div>
      </form>
      ) : null}
    </div>
  )
}
