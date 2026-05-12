import { useState } from 'react'
import { createListing } from '../api/listingsApi'

type Props = {
  onBackToListings: () => void
  /** Refetch catalogue so the new listing appears on the homepage */
  onListingPosted?: () => void | Promise<void>
}

export function PostPropertyScreen({ onBackToListings, onListingPosted }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Free Listing</p>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">Post Your Property</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Fill details once. Our team can help you verify and publish quickly.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToListings}
          className="rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary hover:bg-surface-muted"
        >
          Back to listings
        </button>
      </div>

      {submitted ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          <h2 className="text-lg font-bold">Property submitted successfully</h2>
          <p className="mt-1 text-sm">Thanks! A relationship manager will contact you shortly for verification.</p>
        </div>
      ) : null}

      {error ? <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-700">{error}</p> : null}

      <form
        className="space-y-5 rounded-lg border border-border-subtle bg-surface p-5 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          const intent = form.get('intent') === 'Rent' ? 'rent' : 'buy'
          const city = String(form.get('city') || '').trim()
          const locality = String(form.get('locality') || '').trim()
          const amount = Number(form.get('agreementAmountINR') || 0)
          const contactName = String(form.get('contactName') || '').trim()
          const contactPhone = String(form.get('contactPhone') || '').trim()

          setLoading(true)
          setError(null)
          try {
            await createListing(intent, {
              contactName,
              contactPhone,
              title: String(form.get('title') || ''),
              propertyType: String(form.get('propertyType') || 'Apartment'),
              bhk: String(form.get('bhk') || '2 BHK'),
              location: city && locality ? `${locality}, ${city}` : city || locality,
              agreementAmountINR: amount,
              agreementLabel: `₹${amount.toLocaleString('en-IN')} agreement details`,
              availability: String(form.get('availability') || 'immediate') as
                | 'immediate'
                | 'within15'
                | 'within30'
                | 'after30',
              description: String(form.get('description') || ''),
              parking: 'Available',
              bathrooms: 2,
              highlights: ['Owner posted', 'Verified contact'],
              furnishing: 'semi',
              tenants: ['family'],
              propertyKinds: ['apartment'],
              ownerVerified: false,
              priceDisplay: 'Contact for price',
              imageTone: 'from-slate-700 to-slate-900',
              relevanceScore: 80,
            })
            setSubmitted(true)
            await onListingPosted?.()
          } catch (err) {
            setSubmitted(false)
            setError(err instanceof Error ? err.message : 'Failed to submit property')
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
                placeholder="e.g. 2 BHK Independent Builder Floor"
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-ink-secondary">
              Property Type
              <select
                name="propertyType"
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              >
                <option>Apartment</option>
                <option>Independent House/Villa</option>
                <option>Gated Community Villa</option>
                <option>Builder Floor</option>
              </select>
            </label>
            <label className="text-sm font-medium text-ink-secondary">
              Intent
              <select
                name="intent"
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              >
                <option>Sell</option>
                <option>Rent</option>
              </select>
            </label>
            <label className="text-sm font-medium text-ink-secondary">
              BHK
              <select
                name="bhk"
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              >
                <option>1 RK</option>
                <option>1 BHK</option>
                <option>2 BHK</option>
                <option>3 BHK</option>
                <option>4 BHK</option>
                <option>4+ BHK</option>
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
                defaultValue="Ghaziabad"
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-ink-secondary">
              Locality
              <input
                name="locality"
                required
                placeholder="e.g. Dwarka Mor, New Delhi"
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-ink-secondary">
              Expected Amount (INR)
              <input
                name="agreementAmountINR"
                required
                type="number"
                placeholder="20000"
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-ink-secondary">
              Possession
              <select
                name="availability"
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              >
                <option value="immediate">Immediate</option>
                <option value="within15">Within 15 days</option>
                <option value="within30">Within 30 days</option>
                <option value="after30">After 30 days</option>
              </select>
            </label>
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
                placeholder="Mention highlights, nearby metro, amenities, etc."
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-ink-secondary">
              Owner Name
              <input
                name="contactName"
                required
                placeholder="Your name"
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-ink-secondary">
              Phone Number
              <input
                name="contactPhone"
                required
                placeholder="+91 9XXXXXXXXX"
                className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              />
            </label>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border-subtle pt-4">
          <button
            type="button"
            onClick={onBackToListings}
            className="rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Submitting...' : 'Submit Property'}
          </button>
        </div>
      </form>
    </div>
  )
}
