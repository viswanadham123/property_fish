import type { Listing, ListingIntent } from '../data/listings'
import { parseAgreement } from '../lib/listingFormat'
import { useAuth } from '../features/auth/useAuth'
import { ListingBuildingIllustration } from './ListingBuildingIllustration'

type Props = {
  listing: Listing
  /** Buy/rent context for this row (browse tab or explicit). Defaults to `listing.intent` or `buy`. */
  listingIntent?: ListingIntent
  /** When viewing "My listings", enables Edit for cards you own. */
  myListingIntent?: ListingIntent
  onEditMyListing?: (listing: Listing, intent: ListingIntent) => void
  onViewDetails?: (listing: Listing, intent: ListingIntent) => void
  /** Opens detail with contact in view (e.g. scroll to Contact). Falls back to onViewDetails when omitted. */
  onContactOwner?: (listing: Listing, intent: ListingIntent) => void
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

export function PropertyCard({
  listing,
  listingIntent,
  myListingIntent,
  onEditMyListing,
  onViewDetails,
  onContactOwner,
}: Props) {
  const { user, favoriteListingIds, toggleFavorite } = useAuth()
  const agreement = parseAgreement(listing.agreementLabel)
  const detailIntent: ListingIntent = listingIntent ?? listing.intent ?? 'buy'

  function openDetails() {
    onViewDetails?.(listing, detailIntent)
  }

  function openContact() {
    if (onContactOwner) {
      onContactOwner(listing, detailIntent)
    } else {
      openDetails()
    }
  }
  const isFavorite = favoriteListingIds.includes(listing.id)
  const canFavorite = Boolean(user)
  const isOwnListing = Boolean(user && listing.postedById && listing.postedById === user.id)
  /** Cards under Profile → My listings are always the signed-in user's posts (even if postedById is missing on legacy rows). */
  const isOwnerContext = isOwnListing || Boolean(myListingIntent)

  return (
    <article className="overflow-hidden rounded-md border border-border-subtle bg-surface shadow-[0_1px_6px_rgba(45,45,45,0.06)] transition hover:shadow-[0_5px_14px_rgba(45,45,45,0.1)] md:flex md:max-w-none">
      <div className="relative md:w-[260px] md:shrink-0">
        <div
          className={`relative aspect-[16/10] bg-gradient-to-br md:h-full md:min-h-[185px] md:aspect-auto ${listing.imageTone}`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center pt-2">
            <ListingBuildingIllustration listing={listing} />
          </div>
          <div className="absolute bottom-3 left-3 flex size-10 items-center justify-center rounded-full border-2 border-white/90 bg-white/15 shadow-md ring-2 ring-white/50 backdrop-blur-[2px]">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M3 21h18v-2H3v2zM5 21V7l7-4 7 4v14H5zm2-2h10V8.5L12 5.5 7 8.5V19zm2-2h2v-2H9v2zm4 0h2v-2h-2v2zm-4-4h2v-2H9v2zm4 0h2v-2h-2v2z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-3.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-[29px] leading-none font-bold text-ink">{agreement.price}</span>
              {agreement.showAgreementLink ? (
                <button
                  type="button"
                  onClick={onViewDetails ? openDetails : undefined}
                  className="text-sm font-semibold text-brand-600 hover:underline"
                >
                  agreement details
                </button>
              ) : null}
            </p>
            <h3 className="mt-1 text-base font-bold text-ink">{listing.title}</h3>
          </div>
          <div className="flex shrink-0 gap-1">
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

        <dl className="grid grid-cols-3 gap-3 rounded-md bg-surface-muted px-3 py-3 text-sm">
          <div>
            <dt className="flex items-center gap-1 text-xs font-medium text-ink-muted">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a2 2 0 10-2.828 2.828l4.243 4.243m0 0L21 21M15 11a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Location
            </dt>
            <dd className="mt-1 font-semibold text-ink">{listing.location}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-xs font-medium text-ink-muted">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-6v6m4-9v9M5 5h14l-1 14H6L5 5z" />
              </svg>
              Bathroom
            </dt>
            <dd className="mt-1 font-semibold text-ink">{listing.bathrooms}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-xs font-medium text-ink-muted">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Parking
            </dt>
            <dd className="mt-1 font-semibold text-ink">{listing.parking}</dd>
          </div>
        </dl>

        {listing.contactName?.trim() || listing.contactPhone?.trim() ? (
          <p className="text-xs text-ink-secondary">
            <span className="font-semibold text-ink-muted">Contact: </span>
            {[listing.contactName?.trim(), listing.contactPhone?.trim()].filter(Boolean).join(' · ')}
          </p>
        ) : null}

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Special Highlights</p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {listing.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-sm font-medium text-ink-secondary">
                <CheckIcon />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-ink-secondary">
          {listing.description}{' '}
          {onViewDetails ? (
            <button type="button" onClick={openDetails} className="font-bold text-ink hover:text-brand-600">
              More
            </button>
          ) : (
            <span className="font-bold text-ink-muted">More</span>
          )}
        </p>

        <div className="mt-auto flex flex-wrap gap-2 border-t border-border-subtle pt-3">
          <button
            type="button"
            onClick={onViewDetails ? openDetails : undefined}
            disabled={!onViewDetails}
            className={
              'inline-flex flex-1 items-center justify-center rounded-md px-3 py-2 text-sm font-semibold md:flex-none ' +
              (onViewDetails
                ? 'bg-brand-600 text-white hover:bg-brand-700'
                : 'cursor-not-allowed bg-surface-muted text-ink-muted')
            }
          >
            View property
          </button>
          {isOwnerContext ? (
            onEditMyListing && myListingIntent ? (
              <div className="flex min-w-0 flex-1 flex-wrap gap-2 md:flex-none md:min-w-[280px]">
                <span className="inline-flex min-h-[38px] min-w-0 flex-1 items-center justify-center rounded-md border border-border-subtle border-dashed bg-surface-muted px-3 py-2 text-sm font-semibold text-ink-muted">
                  Your property
                </span>
                <button
                  type="button"
                  onClick={() => onEditMyListing(listing, myListingIntent)}
                  className="inline-flex min-h-[38px] flex-1 items-center justify-center rounded-md border border-brand-600 bg-surface px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 md:flex-none md:px-5"
                >
                  Edit
                </button>
              </div>
            ) : (
              <span className="inline-flex flex-1 items-center justify-center rounded-md border border-border-subtle border-dashed bg-surface-muted px-3 py-2 text-sm font-semibold text-ink-muted md:flex-none">
                Your property
              </span>
            )
          ) : (
            <button
              type="button"
              onClick={onViewDetails || onContactOwner ? openContact : undefined}
              disabled={!onViewDetails && !onContactOwner}
              className={
                'inline-flex flex-1 items-center justify-center rounded-md border border-border-subtle px-3 py-2 text-sm font-semibold md:flex-none ' +
                (onViewDetails || onContactOwner
                  ? 'text-ink-secondary hover:bg-surface-muted'
                  : 'cursor-not-allowed text-ink-muted opacity-60')
              }
            >
              Contact owner
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
