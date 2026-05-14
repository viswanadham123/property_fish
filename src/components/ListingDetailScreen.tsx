import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Listing, ListingIntent } from '../data/listings'
import { fetchListingById } from '../api/listingsApi'
import {
  availabilityLabel,
  furnishingLabel,
  parseAgreement,
  propertyKindsLabel,
  tenantKindsLabel,
} from '../lib/listingFormat'
import { useAuth } from '../features/auth/useAuth'
import { ListingBuildingIllustration } from './ListingBuildingIllustration'

type Props = {
  listing: Listing
  intent: ListingIntent
  returnTo: 'listings' | 'profile'
  /** When true (e.g. opened from "Contact owner"), scroll the Contact section into view after paint. */
  focusContact?: boolean
  onBack: () => void
  onEditMyListing?: (listing: Listing, intent: ListingIntent) => void
}

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 010 1.415l-7.469 7.47a1 1 0 01-1.415 0L3.291 11.647a1 1 0 111.415-1.414l3.117 3.117 6.762-6.762a1 1 0 011.415 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function ListingDetailScreen({
  listing: initialListing,
  intent,
  returnTo,
  focusContact,
  onBack,
  onEditMyListing,
}: Props) {
  const { user, favoriteListingIds, toggleFavorite } = useAuth()
  const [listing, setListing] = useState(initialListing)

  useEffect(() => {
    const ac = new AbortController()
    void fetchListingById(initialListing.id, ac.signal)
      .then(setListing)
      .catch((e) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        toast.error(e instanceof Error ? e.message : 'Could not load latest property details')
      })
    return () => ac.abort()
  }, [initialListing.id])

  useEffect(() => {
    if (!focusContact) return
    const id = window.setTimeout(() => {
      document.getElementById('property-contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
    return () => window.clearTimeout(id)
  }, [focusContact, listing.id])

  const agreement = parseAgreement(listing.agreementLabel)
  const isFavorite = favoriteListingIds.includes(listing.id)
  const canFavorite = Boolean(user)
  const isOwnListing = Boolean(user && listing.postedById && listing.postedById === user.id)
  const contactName = listing.contactName?.trim() ?? ''
  const contactPhone = listing.contactPhone?.trim() ?? ''
  const hasContact = Boolean(contactName || contactPhone)
  const backLabel = returnTo === 'profile' ? 'Back to account' : 'Back to properties'

  return (
    <div className="mx-auto w-full max-w-none px-4 py-6 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary hover:bg-surface-muted"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {backLabel}
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={
              'rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ' +
              (intent === 'rent' ? 'bg-violet-100 text-violet-800' : 'bg-amber-100 text-amber-900')
            }
          >
            {intent === 'rent' ? 'For rent' : 'For sale'}
          </span>
          <button
            type="button"
            disabled={!canFavorite}
            title={canFavorite ? (isFavorite ? 'Remove from favorites' : 'Save to favorites') : 'Sign in to save favorites'}
            onClick={() => void toggleFavorite(listing.id)}
            className={
              'rounded-full border p-2 transition ' +
              (canFavorite
                ? isFavorite
                  ? 'border-brand-600 bg-brand-50 text-brand-700 hover:bg-brand-100'
                  : 'border-border-subtle text-ink-muted hover:bg-surface-muted hover:text-brand-600'
                : 'cursor-not-allowed border-border-subtle text-ink-muted opacity-50')
            }
            aria-label={isFavorite ? 'Remove from favorites' : 'Save property'}
            aria-pressed={isFavorite}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
              />
            </svg>
          </button>
        </div>
      </div>

      <article className="overflow-hidden rounded-lg border border-border-subtle bg-surface shadow-[0_2px_12px_rgba(45,45,45,0.06)]">
        <div className={`relative aspect-[21/9] max-h-[320px] min-h-[200px] bg-gradient-to-br sm:aspect-[24/9] ${listing.imageTone}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center px-6 pt-6">
            <div className="max-w-[min(100%,420px)] opacity-95">
              <ListingBuildingIllustration listing={listing} />
            </div>
          </div>
        </div>

        <div className="space-y-8 p-5 sm:p-8">
          <header className="space-y-2 border-b border-border-subtle pb-6">
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{agreement.price}</span>
              {agreement.showAgreementLink ? (
                <span className="text-sm font-semibold text-brand-600">Agreement value (see property)</span>
              ) : null}
            </p>
            <h1 className="text-xl font-bold leading-snug text-ink sm:text-2xl">{listing.title}</h1>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-secondary">
              <span className="font-semibold text-ink">{listing.location}</span>
              <span aria-hidden className="text-ink-muted">
                ·
              </span>
              <span>{listing.bhk}</span>
              <span aria-hidden className="text-ink-muted">
                ·
              </span>
              <span>{listing.propertyType}</span>
              {listing.ownerVerified ? (
                <>
                  <span aria-hidden className="text-ink-muted">
                    ·
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800">
                    Owner verified
                  </span>
                </>
              ) : null}
            </p>
          </header>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Facts</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  label: 'Agreement value (INR)',
                  value: `₹${listing.agreementAmountINR.toLocaleString('en-IN')}`,
                },
                { label: 'Bathrooms', value: String(listing.bathrooms) },
                { label: 'Parking', value: listing.parking },
                { label: 'Availability', value: availabilityLabel(listing.availability) },
                { label: 'Furnishing', value: furnishingLabel(listing.furnishing) },
                { label: 'Preferred tenants', value: tenantKindsLabel(listing.tenants) },
                { label: 'Property kinds', value: propertyKindsLabel(listing.propertyKinds) },
                { label: 'Price display', value: listing.priceDisplay },
                { label: 'Posted', value: new Date(listing.postedAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) },
              ].map((row) => (
                <div key={row.label} className="rounded-md bg-surface-muted px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{row.label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {listing.highlights.length > 0 ? (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Highlights</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {listing.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm font-medium text-ink-secondary">
                    <CheckIcon />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Description</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink-secondary">{listing.description}</p>
          </section>

          <section id="property-contact" className="rounded-lg border border-border-subtle bg-surface-muted/60 p-5 sm:p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Contact</h2>
            <div className="mt-3 space-y-4">
              {hasContact ? (
                <dl className="grid gap-4 sm:grid-cols-2">
                  {contactName ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Contact name</dt>
                      <dd className="mt-1 text-base font-semibold text-ink">{contactName}</dd>
                    </div>
                  ) : null}
                  {contactPhone ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Phone</dt>
                      <dd className="mt-1">
                        <a
                          href={`tel:${contactPhone.replace(/\s/g, '')}`}
                          className="text-base font-semibold text-brand-700 hover:underline"
                        >
                          {contactPhone}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              ) : (
                <p className="text-sm text-ink-secondary">No contact name or phone was provided for this property.</p>
              )}

              {isOwnListing ? (
                <div className="flex flex-wrap items-center gap-3 border-t border-border-subtle pt-4">
                  <p className="text-sm text-ink-secondary">This is your property.</p>
                  {onEditMyListing ? (
                    <button
                      type="button"
                      onClick={() => onEditMyListing(listing, intent)}
                      className="rounded-md border border-brand-600 bg-surface px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                    >
                      Edit property
                    </button>
                  ) : null}
                </div>
              ) : hasContact ? (
                <p className="text-xs text-ink-muted">
                  Please mention you found this property on Property Fish when you call or message.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </article>
    </div>
  )
}
