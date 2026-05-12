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
import { fetchListingCatalogue, type ListingCatalogue, type ListingIntent } from './api/listingsApi'
import { filterListings, sortListings, type SortMode } from './lib/filterAndSort'
import { DEFAULT_FILTERS, type FilterState } from './types/filters'
import { useAuth } from './context/AuthContext'

const REGION_CATALOGUE_TOTAL = 1581
const PAGE_CHUNK = 6
type ScreenMode = 'listings' | 'post-property' | 'sign-in' | 'sign-up'

export default function App() {
  const { user, logout } = useAuth()
  const [catalogue, setCatalogue] = useState<ListingCatalogue>({ buy: [], rent: [] })
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [intent, setIntent] = useState<ListingIntent>('buy')

  const [filters, setFilters] = useState<FilterState>(() => ({ ...DEFAULT_FILTERS }))
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortMode>('relevance')

  const [draftQuery, setDraftQuery] = useState('')
  const [committedQuery, setCommittedQuery] = useState('')
  const [localityTags, setLocalityTags] = useState<string[]>(['Ghaziabad'])

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [visibleCount, setVisibleCount] = useState(PAGE_CHUNK)
  const [screen, setScreen] = useState<ScreenMode>('listings')

  const loadCatalogue = useCallback(async (opts?: { signal?: AbortSignal; showSpinner?: boolean }) => {
    const showSpinner = opts?.showSpinner !== false
    if (showSpinner) {
      setLoading(true)
      setLoadError(null)
    }
    try {
      const rows = await fetchListingCatalogue(opts?.signal)
      setCatalogue(rows)
      setLastSynced(new Date())
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
  }

  function retryFetch() {
    void loadCatalogue({ showSpinner: true })
  }

  const headingFocus =
    localityTags.join(', ') || committedQuery.trim() || 'Dwarka Mor, New Delhi'

  return (
    <div className="min-h-screen bg-page">
      <Header
        signedInUser={user ? { fullName: user.fullName } : null}
        onSignOut={logout}
        onPostPropertyClick={() => setScreen('post-property')}
        onLogoClick={() => setScreen('listings')}
        onAccountClick={() => setScreen('sign-in')}
      />
      {screen === 'post-property' ? (
        <PostPropertyScreen
          onBackToListings={() => setScreen('listings')}
          onListingPosted={() => loadCatalogue({ showSpinner: false })}
        />
      ) : screen === 'sign-in' ? (
        <SignInScreen
          onBackToListings={() => setScreen('listings')}
          onGoToSignUp={() => setScreen('sign-up')}
          onAuthenticated={() => setScreen('listings')}
        />
      ) : screen === 'sign-up' ? (
        <SignUpScreen
          onBackToListings={() => setScreen('listings')}
          onGoToSignIn={() => setScreen('sign-in')}
          onAuthenticated={() => setScreen('listings')}
        />
      ) : (
        <>
          <SearchStrip
            intent={intent}
            onIntentChange={setIntent}
            draftQuery={draftQuery}
            onDraftQueryChange={setDraftQuery}
            onSubmitSearch={() => setCommittedQuery(draftQuery.trim())}
            localityTags={localityTags}
            onRemoveLocalityTag={(tag) => setLocalityTags((tags) => tags.filter((t) => t !== tag))}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <a href="#" className="hover:text-brand-600">
                Home
              </a>
            </li>
            <li aria-hidden>/</li>
            <li>
              <a href="#" className="hover:text-brand-600">
                New Delhi
              </a>
            </li>
            <li aria-hidden>/</li>
            <li className="font-medium text-ink">Flats for {intent === 'buy' ? 'sale' : 'rent'} near {headingFocus}</li>
          </ol>
        </nav>

        <div className="mt-4 rounded-lg border border-border-subtle bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-ink-muted">
            Last updated:{' '}
            <time dateTime={lastSynced?.toISOString()}>
              {lastSynced ? lastSynced.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            </time>
          </p>
          <p className="text-sm font-medium text-ink-secondary">
            Showing{' '}
            <span className="font-semibold text-ink">
              {filteredSorted.length === 0 ? 0 : 1} – {visibleSlice.length}
            </span>{' '}
            of <span className="font-semibold text-ink">{filteredSorted.length}</span> matches ·{' '}
            <span className="text-ink-muted">{REGION_CATALOGUE_TOTAL.toLocaleString()} in corridor catalogue</span>
          </p>
          </div>
          <p className="mt-2 text-[15px] font-semibold text-ink">
            Flats for {intent === 'buy' ? 'Sale' : 'Rent'} in {headingFocus}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[30px]">
              Flats for {intent === 'buy' ? 'Sale' : 'Rent'} near {headingFocus}
            </h1>
            <p className="mt-1 text-sm text-ink-secondary">
              Filters, search, and sort update results live — listings are loaded from MongoDB via the bundled API.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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

            <label className="flex items-center gap-2 text-sm font-semibold text-ink-secondary">
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
                  Plug in Mapbox GL JS or Google Maps — markers would mirror the same filtered{' '}
                  <strong>{filteredSorted.length}</strong> listings passed from React state.
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
                    setCommittedQuery('')
                    setDraftQuery('')
                    setLocalityTags([])
                  }}
                >
                  Reset search &amp; filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {visibleSlice.map((listing) => (
                  <PropertyCard key={listing.id} listing={listing} />
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

      <Footer onPostPropertyClick={() => setScreen('post-property')} />
    </div>
  )
}
