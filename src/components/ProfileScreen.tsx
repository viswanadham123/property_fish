import { useCallback, useEffect, useState } from 'react'
import { fetchFavoriteListings } from '../api/favoritesApi'
import { fetchMyListingCatalogue } from '../api/listingsApi'
import type { PublicUser } from '../api/authApi'
import type { Listing } from '../data/listings'
import { useAuth } from '../context/AuthContext'
import { PropertyCard } from './PropertyCard'

type Tab = 'profile' | 'favorites' | 'my-listings'

type Props = {
  user: PublicUser
  onBack: () => void
}

export function ProfileScreen({ user, onBack }: Props) {
  const { favoriteListingIds } = useAuth()
  const [tab, setTab] = useState<Tab>('profile')

  const [favorites, setFavorites] = useState<Listing[]>([])
  const [favLoading, setFavLoading] = useState(false)
  const [favError, setFavError] = useState<string | null>(null)

  const [myBuy, setMyBuy] = useState<Listing[]>([])
  const [myRent, setMyRent] = useState<Listing[]>([])
  const [myLoading, setMyLoading] = useState(false)
  const [myError, setMyError] = useState<string | null>(null)

  const loadFavorites = useCallback(async () => {
    setFavLoading(true)
    setFavError(null)
    try {
      const rows = await fetchFavoriteListings()
      setFavorites(rows)
    } catch (e) {
      setFavError(e instanceof Error ? e.message : 'Failed to load favorites')
    } finally {
      setFavLoading(false)
    }
  }, [])

  const loadMyListings = useCallback(async () => {
    setMyLoading(true)
    setMyError(null)
    try {
      const cat = await fetchMyListingCatalogue()
      setMyBuy(cat.buy)
      setMyRent(cat.rent)
    } catch (e) {
      setMyError(e instanceof Error ? e.message : 'Failed to load your listings')
    } finally {
      setMyLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'favorites') void loadFavorites()
  }, [tab, favoriteListingIds, loadFavorites])

  useEffect(() => {
    if (tab === 'my-listings') void loadMyListings()
  }, [tab, loadMyListings])

  const myTotal = myBuy.length + myRent.length

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">My account</h1>
          <p className="mt-1 text-sm text-ink-secondary">Profile, saved favorites, and properties you posted.</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary hover:bg-surface-muted"
        >
          Back to listings
        </button>
      </div>

      <div className="border-b border-border-subtle">
        <nav className="-mb-px flex flex-wrap gap-4 sm:gap-6" aria-label="Account sections">
          <button
            type="button"
            onClick={() => setTab('profile')}
            className={
              'border-b-2 pb-3 text-sm font-semibold transition ' +
              (tab === 'profile'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-ink-secondary hover:text-ink')
            }
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => setTab('favorites')}
            className={
              'border-b-2 pb-3 text-sm font-semibold transition ' +
              (tab === 'favorites'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-ink-secondary hover:text-ink')
            }
          >
            Favorites
          </button>
          <button
            type="button"
            onClick={() => setTab('my-listings')}
            className={
              'border-b-2 pb-3 text-sm font-semibold transition ' +
              (tab === 'my-listings'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-ink-secondary hover:text-ink')
            }
          >
            My listings
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {tab === 'profile' ? (
          <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-ink-muted">Full name</dt>
                <dd className="mt-1 text-sm font-semibold text-ink">{user.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-ink-muted">Email</dt>
                <dd className="mt-1 text-sm font-semibold text-ink">{user.email}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-wide text-ink-muted">Phone</dt>
                <dd className="mt-1 text-sm font-semibold text-ink">{user.phone || '—'}</dd>
              </div>
            </dl>
          </div>
        ) : tab === 'favorites' ? (
          favError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              <p>{favError}</p>
              <button type="button" className="mt-2 font-semibold text-brand-600 hover:underline" onClick={() => void loadFavorites()}>
                Retry
              </button>
            </div>
          ) : favLoading ? (
            <p className="text-sm text-ink-secondary">Loading favorites…</p>
          ) : favorites.length === 0 ? (
            <p className="rounded-lg border border-border-subtle bg-surface px-4 py-8 text-center text-sm text-ink-secondary">
              No saved listings yet. Use the heart on a property card to add favorites.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {favorites.map((listing) => (
                <PropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
          )
        ) : myError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            <p>{myError}</p>
            <button type="button" className="mt-2 font-semibold text-brand-600 hover:underline" onClick={() => void loadMyListings()}>
              Retry
            </button>
          </div>
        ) : myLoading ? (
          <p className="text-sm text-ink-secondary">Loading your listings…</p>
        ) : myTotal === 0 ? (
          <p className="rounded-lg border border-border-subtle bg-surface px-4 py-8 text-center text-sm text-ink-secondary">
            You have not posted any properties yet while signed in. Use <strong>Post Property</strong> from the header — your
            posts will show here.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {myBuy.length > 0 ? (
              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">For sale</h2>
                <div className="flex flex-col gap-6">
                  {myBuy.map((listing) => (
                    <PropertyCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </section>
            ) : null}
            {myRent.length > 0 ? (
              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">For rent</h2>
                <div className="flex flex-col gap-6">
                  {myRent.map((listing) => (
                    <PropertyCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
