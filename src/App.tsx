import { useCallback, useEffect, useMemo, useState } from 'react'
import { Header } from './components/Header'
import { SearchStrip } from './components/SearchStrip'
import { FilterSidebar } from './components/FilterSidebar'
import { PropertyCard } from './components/PropertyCard'
import { Footer } from './components/Footer'
import { ListingSkeleton } from './components/ListingSkeleton'
import { PostPropertyScreen } from './components/PostPropertyScreen'
import { SignInScreen } from './components/SignInScreen'
import { SignUpScreen } from './components/SignUpScreen'
import { ProfileScreen } from './components/ProfileScreen'
import { ListingDetailScreen } from './components/ListingDetailScreen'
import { fetchListingCatalogue, type ListingCatalogue, type ListingIntent } from './api/listingsApi'
import type { Listing } from './data/listings'
import { filterListings, sortListings, type SortMode } from './lib/filterAndSort'
import { DEFAULT_FILTERS, type FilterState } from './types/filters'
import { useAuth } from './context/AuthContext'

const PAGE_CHUNK = 6
type ScreenMode =
  | 'listings'
  | 'listing-detail'
  | 'post-property'
  | 'edit-listing'
  | 'sign-in'
  | 'sign-up'
  | 'profile'

export default function App() {
  const { user, logout, ready } = useAuth()
  const [catalogue, setCatalogue] = useState<ListingCatalogue>({ buy: [], rent: [] })
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [intent, setIntent] = useState<ListingIntent>('buy')

  const [filters, setFilters] = useState<FilterState>(() => ({ ...DEFAULT_FILTERS }))
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortMode>('relevance')

  const [draftQuery, setDraftQuery] = useState('')
  const [committedQuery, setCommittedQuery] = useState('')
  const [localityTags, setLocalityTags] = useState<string[]>([])

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [visibleCount, setVisibleCount] = useState(PAGE_CHUNK)
  const [screen, setScreen] = useState<ScreenMode>('listings')
  const [editListingTarget, setEditListingTarget] = useState<{ listing: Listing; intent: ListingIntent } | null>(null)
  const [listingDetail, setListingDetail] = useState<{
    listing: Listing
    intent: ListingIntent
    returnTo: 'listings' | 'profile'
  } | null>(null)
  const [myListingsVersion, setMyListingsVersion] = useState(0)

  const openListingDetail = useCallback((l: Listing, listingIntent: ListingIntent, returnTo: 'listings' | 'profile') => {
    setListingDetail({ listing: l, intent: listingIntent, returnTo })
    setScreen('listing-detail')
  }, [])

  const handleSignOut = useCallback(() => {
    logout()
    setScreen('sign-in')
  }, [logout])

  /** After session check: guests land on sign-in; returning users stay on listings (or current flow). */
  useEffect(() => {
    if (!ready) return
    if (!user) {
      setEditListingTarget(null)
      setListingDetail(null)
      setScreen('sign-in')
    }
  }, [ready, user])

  const loadCatalogue = useCallback(async (opts?: { signal?: AbortSignal; showSpinner?: boolean }) => {
    const showSpinner = opts?.showSpinner !== false
    if (showSpinner) {
      setLoading(true)
      setLoadError(null)
    }
    try {
      const rows = await fetchListingCatalogue(opts?.signal)
      setCatalogue(rows)
      if (showSpinner) setLoadError(null)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      if (showSpinner) setLoadError('Unable to refresh listings. Please try again.')
    } finally {
      if (showSpinner) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadCatalogue({ signal: controller.signal, showSpinner: true })
    return () => controller.abort()
  }, [loadCatalogue])

  const activeListings = useMemo(() => catalogue[intent], [catalogue, intent])

  const filteredSorted = useMemo(() => {
    const filtered = filterListings(activeListings, filters, committedQuery, localityTags)
    return sortListings(filtered, sortBy)
  }, [activeListings, filters, committedQuery, localityTags, sortBy])

  useEffect(() => {
    setVisibleCount(PAGE_CHUNK)
  }, [filters, committedQuery, localityTags, sortBy])

  const visibleSlice = useMemo(() => filteredSorted.slice(0, visibleCount), [filteredSorted, visibleCount])

  function resetFilters() {
    setFilters({ ...DEFAULT_FILTERS })
    setLocalityTags([])
    setCommittedQuery('')
    setDraftQuery('')
    setSortBy('relevance')
  }

  function retryFetch() {
    void loadCatalogue({ showSpinner: true })
  }

  function submitSearch() {
    const t = draftQuery.trim()
    if (t) {
      setLocalityTags((prev) => {
        const low = t.toLowerCase()
        if (prev.some((x) => x.toLowerCase() === low)) return prev
        return [...prev, t]
      })
    }
    setCommittedQuery('')
    setDraftQuery('')
  }

  const removeLocalityTag = useCallback(
    (tag: string) => {
      setLocalityTags((tags) => tags.filter((t) => t !== tag))
      void loadCatalogue({ showSpinner: false })
    },
    [loadCatalogue],
  )

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-page">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"
          aria-hidden
        />
        <p className="text-sm text-ink-secondary">Loading…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <Header
        variant={screen === 'sign-in' || screen === 'sign-up' ? 'auth' : 'full'}
        signedInUser={user ? { fullName: user.fullName } : null}
        onProfileClick={user ? () => setScreen('profile') : undefined}
        onSignOut={handleSignOut}
        onPostPropertyClick={() => {
          setEditListingTarget(null)
          setListingDetail(null)
          if (user) setScreen('post-property')
          else setScreen('sign-in')
        }}
        onLogoClick={() => {
          setListingDetail(null)
          setEditListingTarget(null)
          setScreen('listings')
        }}
        onAccountClick={() => setScreen('sign-in')}
      />
      <main className="flex min-h-0 flex-1 flex-col">
      {screen === 'profile' && user ? (
        <ProfileScreen
          user={user}
          onBack={() => setScreen('listings')}
          myListingsVersion={myListingsVersion}
          onViewListing={(listing, listingIntent) => openListingDetail(listing, listingIntent, 'profile')}
          onEditMyListing={(listing, intent) => {
            setEditListingTarget({ listing, intent })
            setScreen('edit-listing')
          }}
        />
      ) : screen === 'listing-detail' && listingDetail ? (
        <ListingDetailScreen
          key={listingDetail.listing.id}
          listing={listingDetail.listing}
          intent={listingDetail.intent}
          returnTo={listingDetail.returnTo}
          onBack={() => {
            const r = listingDetail.returnTo
            setListingDetail(null)
            setScreen(r)
          }}
          onEditMyListing={
            user
              ? (l, i) => {
                  setListingDetail(null)
                  setEditListingTarget({ listing: l, intent: i })
                  setScreen('edit-listing')
                }
              : undefined
          }
        />
      ) : screen === 'post-property' && user ? (
        <PostPropertyScreen
          onBackToListings={() => setScreen('listings')}
          onListingPosted={() => loadCatalogue({ showSpinner: false })}
        />
      ) : screen === 'edit-listing' && editListingTarget ? (
        <PostPropertyScreen
          edit={editListingTarget}
          onBackToListings={() => {
            setEditListingTarget(null)
            setScreen('listings')
          }}
          onCancelEdit={() => {
            setEditListingTarget(null)
            setScreen('profile')
          }}
          onListingPosted={() => loadCatalogue({ showSpinner: false })}
          onEditSaved={() => {
            setMyListingsVersion((v) => v + 1)
            setEditListingTarget(null)
            setScreen('profile')
          }}
        />
      ) : screen === 'sign-in' ? (
        <SignInScreen onGoToSignUp={() => setScreen('sign-up')} onAuthenticated={() => setScreen('listings')} />
      ) : screen === 'sign-up' ? (
        <SignUpScreen onGoToSignIn={() => setScreen('sign-in')} onAuthenticated={() => setScreen('listings')} />
      ) : (
        <>
          <SearchStrip
            intent={intent}
            onIntentChange={setIntent}
            draftQuery={draftQuery}
            onDraftQueryChange={setDraftQuery}
            onSubmitSearch={submitSearch}
            localityTags={localityTags}
            onRemoveLocalityTag={removeLocalityTag}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <div className="mx-auto w-full max-w-none px-4 py-5 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="flex flex-wrap items-center gap-3 border-b border-border-subtle pb-5">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-sm lg:hidden"
                onClick={() => setFiltersOpen(true)}
              >
                <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M10 18h4" />
                </svg>
                Filters
              </button>
              <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-3 sm:gap-4">
                <p className="text-sm font-medium text-ink-secondary">
                  Showing{' '}
                  <span className="font-semibold text-ink">
                    {filteredSorted.length === 0 ? 0 : 1} – {visibleSlice.length}
                  </span>{' '}
                  of <span className="font-semibold text-ink">{filteredSorted.length}</span> matches
                </p>
                <label className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink-secondary">
                  Sort by:
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortMode)}
                    className="rounded-md border border-border-subtle bg-surface py-2 pr-8 pl-3 text-sm font-semibold text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest first</option>
                    <option value="price-low">Agreement value — low to high</option>
                  </select>
                </label>
              </div>
            </div>

        <div className="mt-4 flex gap-4 lg:items-start">
          <FilterSidebar
            mobileOpen={filtersOpen}
            onCloseMobile={() => setFiltersOpen(false)}
            filters={filters}
            onFiltersChange={setFilters}
            onReset={resetFilters}
          />

          <div className="min-w-0 flex-1 space-y-6">
            {loadError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                <p>{loadError}</p>
                <button type="button" className="mt-2 font-semibold text-brand-600 hover:underline" onClick={retryFetch}>
                  Retry
                </button>
              </div>
            ) : null}

            {loading ? (
              <ListingSkeleton />
            ) : viewMode === 'map' ? (
              <div className="rounded-lg border border-dashed border-border-subtle bg-surface px-6 py-16 text-center shadow-sm">
                <p className="text-lg font-semibold text-ink">Map view</p>
                <p className="mt-2 text-sm text-ink-secondary">
                  Map view is not enabled yet. Switch to list view to see results.
                </p>
              </div>
            ) : filteredSorted.length === 0 ? (
              <div className="rounded-lg border border-border-subtle bg-surface px-6 py-14 text-center shadow-sm">
                <p className="text-lg font-semibold text-ink">No listings match</p>
                <p className="mt-2 text-sm text-ink-secondary">
                  Relax filters, remove locality chips, or clear the search keyword — currently{' '}
                  <strong>{activeListings.length}</strong> properties loaded from the server.
                </p>
                <button
                  type="button"
                  className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                  onClick={() => {
                    resetFilters()
                  }}
                >
                  Reset search &amp; filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {visibleSlice.map((listing) => (
                  <PropertyCard
                    key={listing.id}
                    listing={listing}
                    listingIntent={intent}
                    onViewDetails={(l, i) => openListingDetail(l, i, 'listings')}
                  />
                ))}
              </div>
            )}

            {!loading && viewMode === 'list' && visibleSlice.length > 0 && visibleSlice.length < filteredSorted.length ? (
              <div className="flex justify-center pb-8">
                <button
                  type="button"
                  className="rounded-full border border-border-subtle bg-surface px-6 py-2 text-sm font-semibold text-ink-secondary shadow-sm hover:bg-surface-muted"
                  onClick={() => setVisibleCount((n) => Math.min(n + PAGE_CHUNK, filteredSorted.length))}
                >
                  Load more listings
                </button>
              </div>
            ) : null}
          </div>
        </div>
          </div>
        </>
      )}
      </main>

      {screen !== 'sign-in' && screen !== 'sign-up' ? (
        <Footer
          onPostPropertyClick={() => {
            setEditListingTarget(null)
            setListingDetail(null)
            if (user) setScreen('post-property')
            else setScreen('sign-in')
          }}
        />
      ) : null}
    </div>
  )
}
