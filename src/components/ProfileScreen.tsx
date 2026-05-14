import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { toast } from 'sonner'
import { updateProfile, type PublicUser } from '../api/authApi'
import { fetchFavoriteListings } from '../api/favoritesApi'
import { fetchMyListingCatalogue } from '../api/listingsApi'
import type { Listing, ListingIntent } from '../data/listings'
import { useAuth } from '../features/auth/useAuth'
import { PropertyCard } from './PropertyCard'

const inputClass =
  'mt-1 w-full rounded-md border border-border-subtle px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none'

export type ProfileScreenTab = 'profile' | 'favorites' | 'my-listings'
type Tab = ProfileScreenTab

type Props = {
  user: PublicUser
  onBack: () => void
  onEditMyListing?: (listing: Listing, intent: ListingIntent) => void
  /** Open full listing detail (favorites + my listings). */
  onViewListing?: (listing: Listing, intent: ListingIntent) => void
  /** Same as opening detail, but scrolls to the Contact block (used by "Contact owner" on cards). */
  onContactListing?: (listing: Listing, intent: ListingIntent) => void
  /** Increment from parent after saving an edit so "My listings" refetches. */
  myListingsVersion?: number
  /** From header nav: which tab to show (token bumps on each request so repeats work). */
  profileNavTab?: ProfileScreenTab | null
  profileNavToken?: number
}

type ProfileDraft = Pick<PublicUser, 'fullName' | 'phone' | 'location' | 'profession'>

export function ProfileScreen({
  user,
  onBack,
  onEditMyListing,
  onViewListing,
  onContactListing,
  myListingsVersion = 0,
  profileNavTab,
  profileNavToken = 0,
}: Props) {
  const { favoriteListingIds, refreshUser } = useAuth()
  const [tab, setTab] = useState<Tab>('profile')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<ProfileDraft>(() => ({
    fullName: user.fullName,
    phone: user.phone,
    location: user.location ?? '',
    profession: user.profession ?? '',
  }))
  const [profileSaving, setProfileSaving] = useState(false)

  useLayoutEffect(() => {
    if (!profileNavTab || profileNavToken <= 0) return
    setTab(profileNavTab)
  }, [profileNavTab, profileNavToken])

  useEffect(() => {
    if (!editing) {
      setDraft({
        fullName: user.fullName,
        phone: user.phone,
        location: user.location ?? '',
        profession: user.profession ?? '',
      })
    }
  }, [user, editing])

  const [favorites, setFavorites] = useState<Listing[]>([])
  const [favLoading, setFavLoading] = useState(false)
  const [favLoadFailed, setFavLoadFailed] = useState(false)

  const [myBuy, setMyBuy] = useState<Listing[]>([])
  const [myRent, setMyRent] = useState<Listing[]>([])
  const [myLoading, setMyLoading] = useState(false)
  const [myLoadFailed, setMyLoadFailed] = useState(false)

  const loadFavorites = useCallback(async () => {
    setFavLoading(true)
    setFavLoadFailed(false)
    try {
      const rows = await fetchFavoriteListings()
      setFavorites(rows)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load favorites'
      toast.error(msg)
      setFavLoadFailed(true)
    } finally {
      setFavLoading(false)
    }
  }, [])

  const loadMyListings = useCallback(async () => {
    setMyLoading(true)
    setMyLoadFailed(false)
    try {
      const cat = await fetchMyListingCatalogue()
      setMyBuy(cat.buy)
      setMyRent(cat.rent)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load your properties'
      toast.error(msg)
      setMyLoadFailed(true)
    } finally {
      setMyLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'favorites') void loadFavorites()
  }, [tab, favoriteListingIds, loadFavorites])

  useEffect(() => {
    if (tab === 'my-listings') void loadMyListings()
  }, [tab, loadMyListings, myListingsVersion])

  const myTotal = myBuy.length + myRent.length

  return (
    <div className="mx-auto w-full max-w-none px-4 py-6 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
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
          Back to properties
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
            My properties
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {tab === 'profile' ? (
          <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink">Your details</h2>
                <p className="mt-0.5 text-sm text-ink-secondary">Update how you appear and your contact preferences.</p>
              </div>
              {editing ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={profileSaving}
                    onClick={() => {
                      setEditing(false)
                    }}
                    className="rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={profileSaving}
                    onClick={async () => {
                      setProfileSaving(true)
                      try {
                        await updateProfile({
                          fullName: draft.fullName.trim(),
                          phone: draft.phone.trim(),
                          location: draft.location.trim(),
                          profession: draft.profession.trim(),
                        })
                        await refreshUser()
                        setEditing(false)
                        toast.success('Profile updated.')
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : 'Save failed')
                      } finally {
                        setProfileSaving(false)
                      }
                    }}
                    className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {profileSaving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDraft({
                      fullName: user.fullName,
                      phone: user.phone,
                      location: user.location ?? '',
                      profession: user.profession ?? '',
                    })
                    setEditing(true)
                  }}
                  className="rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-muted"
                >
                  Edit profile
                </button>
              )}
            </div>

            {editing ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-ink-secondary sm:col-span-2">
                  Full name
                  <input
                    value={draft.fullName}
                    onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))}
                    className={inputClass}
                    autoComplete="name"
                  />
                </label>
                <label className="block text-sm font-medium text-ink-secondary sm:col-span-2">
                  Email
                  <input value={user.email} readOnly className={inputClass + ' bg-surface-muted text-ink-secondary'} />
                  <span className="mt-1 block text-xs text-ink-muted">Email cannot be changed here.</span>
                </label>
                <label className="block text-sm font-medium text-ink-secondary">
                  Phone
                  <input
                    value={draft.phone}
                    onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                    className={inputClass}
                    autoComplete="tel"
                    placeholder="Optional"
                  />
                </label>
                <label className="block text-sm font-medium text-ink-secondary">
                  Location
                  <input
                    value={draft.location}
                    onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                    className={inputClass}
                    autoComplete="address-level2"
                    placeholder="City or area"
                  />
                </label>
                <label className="block text-sm font-medium text-ink-secondary sm:col-span-2">
                  Profession
                  <input
                    value={draft.profession}
                    onChange={(e) => setDraft((d) => ({ ...d, profession: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g. Civil engineer, Agent, Home buyer"
                  />
                </label>
              </div>
            ) : (
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink-muted">Full name</dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">{user.fullName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink-muted">Email</dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink-muted">Phone</dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">{user.phone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink-muted">Location</dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">{user.location || '—'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink-muted">Profession</dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">{user.profession || '—'}</dd>
                </div>
              </dl>
            )}
          </div>
        ) : tab === 'favorites' ? (
          favLoadFailed && !favLoading ? (
            <div className="rounded-lg border border-border-subtle bg-surface px-4 py-3 text-sm text-ink-secondary">
              <p>Could not load favorites.</p>
              <button type="button" className="mt-2 font-semibold text-brand-600 hover:underline" onClick={() => void loadFavorites()}>
                Retry
              </button>
            </div>
          ) : favLoading ? (
            <p className="text-sm text-ink-secondary">Loading favorites…</p>
          ) : favorites.length === 0 ? (
            <p className="rounded-lg border border-border-subtle bg-surface px-4 py-8 text-center text-sm text-ink-secondary">
              No saved properties yet. Use the heart on a property card to add favorites.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {favorites.map((listing) => (
                <PropertyCard
                  key={listing.id}
                  listing={listing}
                  listingIntent={listing.intent ?? 'buy'}
                  onViewDetails={onViewListing}
                  onContactOwner={onContactListing}
                />
              ))}
            </div>
          )
        ) : myLoadFailed && !myLoading ? (
          <div className="rounded-lg border border-border-subtle bg-surface px-4 py-3 text-sm text-ink-secondary">
            <p>Could not load your properties.</p>
            <button type="button" className="mt-2 font-semibold text-brand-600 hover:underline" onClick={() => void loadMyListings()}>
              Retry
            </button>
          </div>
        ) : myLoading ? (
          <p className="text-sm text-ink-secondary">Loading your properties…</p>
        ) : myTotal === 0 ? (
          <p className="rounded-lg border border-border-subtle bg-surface px-4 py-8 text-center text-sm text-ink-secondary">
            You have not posted any properties yet while signed in. Use <strong>Post Property</strong> from the header —
            your posts will show here.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {myBuy.length > 0 ? (
              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">For sale</h2>
                <div className="flex flex-col gap-6">
                  {myBuy.map((listing) => (
                    <PropertyCard
                      key={listing.id}
                      listing={listing}
                      listingIntent="buy"
                      myListingIntent="buy"
                      onViewDetails={onViewListing}
                      onContactOwner={onContactListing}
                      onEditMyListing={onEditMyListing}
                    />
                  ))}
                </div>
              </section>
            ) : null}
            {myRent.length > 0 ? (
              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">For rent</h2>
                <div className="flex flex-col gap-6">
                  {myRent.map((listing) => (
                    <PropertyCard
                      key={listing.id}
                      listing={listing}
                      listingIntent="rent"
                      myListingIntent="rent"
                      onViewDetails={onViewListing}
                      onContactOwner={onContactListing}
                      onEditMyListing={onEditMyListing}
                    />
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
