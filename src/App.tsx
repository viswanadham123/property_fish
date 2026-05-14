import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Header, type HeaderAudienceAction, type HeaderNavHighlight } from './components/Header'
import { SearchStrip } from './components/SearchStrip'
import { FilterSidebar } from './components/FilterSidebar'
import { PropertyCard } from './components/PropertyCard'
import { Footer } from './components/Footer'
import { ListingSkeleton } from './components/ListingSkeleton'
import { PostPropertyScreen } from './components/PostPropertyScreen'
import { SignInScreen } from './components/SignInScreen'
import { SignUpScreen } from './components/SignUpScreen'
import { ForgotPasswordScreen } from './components/ForgotPasswordScreen'
import { ResetPasswordScreen } from './components/ResetPasswordScreen'
import { ProfileScreen, type ProfileScreenTab } from './components/ProfileScreen'
import { ListingDetailScreen } from './components/ListingDetailScreen'
import { fetchListingCatalogue, type ListingCatalogue, type ListingIntent } from './api/listingsApi'
import type { Listing } from './data/listings'
import { filterListings, sortListings, type SortMode } from './lib/filterAndSort'
import { DEFAULT_FILTERS, type FilterState } from './types/filters'
import { useAuth } from './features/auth/useAuth'
import { toast } from 'sonner'

const PAGE_CHUNK = 6
const DEFAULT_DOC_TITLE = 'Property Fish'

function readResetTokenFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  const raw = new URLSearchParams(window.location.search).get('reset')
  if (!raw) return null
  const t = raw.trim()
  return /^[a-f0-9]{64}$/i.test(t) ? t : null
}

const initialPasswordResetToken = readResetTokenFromUrl()

type ScreenMode =
  | 'listings'
  | 'listing-detail'
  | 'post-property'
  | 'edit-listing'
  | 'sign-in'
  | 'sign-up'
  | 'forgot-password'
  | 'reset-password'
  | 'profile'

export default function App() {
  const { user, logout, ready } = useAuth()
  const [catalogue, setCatalogue] = useState<ListingCatalogue>({ buy: [], rent: [] })
  const [loading, setLoading] = useState(false)
  const [intent, setIntent] = useState<ListingIntent>('buy')

  const [filters, setFilters] = useState<FilterState>(() => ({ ...DEFAULT_FILTERS }))
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortMode>('relevance')

  const [draftQuery, setDraftQuery] = useState('')
  const [committedQuery, setCommittedQuery] = useState('')
  const [localityTags, setLocalityTags] = useState<string[]>([])

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [visibleCount, setVisibleCount] = useState(PAGE_CHUNK)
  const [passwordResetToken, setPasswordResetToken] = useState<string | null>(() => initialPasswordResetToken)
  const [screen, setScreen] = useState<ScreenMode>(() => (initialPasswordResetToken ? 'reset-password' : 'listings'))
  const [editListingTarget, setEditListingTarget] = useState<{ listing: Listing; intent: ListingIntent } | null>(null)
  const [listingDetail, setListingDetail] = useState<{
    listing: Listing
    intent: ListingIntent
    returnTo: 'listings' | 'profile'
    focusContact?: boolean
  } | null>(null)
  const [myListingsVersion, setMyListingsVersion] = useState(0)
  const [profileNavTab, setProfileNavTab] = useState<ProfileScreenTab | null>(null)
  const [profileNavToken, setProfileNavToken] = useState(0)
  const [postCreateIntent, setPostCreateIntent] = useState<ListingIntent>('buy')

  const goToBrowse = useCallback((nextIntent: ListingIntent) => {
    setListingDetail(null)
    setEditListingTarget(null)
    setIntent(nextIntent)
    setScreen('listings')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleAudienceAction = useCallback(
    (action: HeaderAudienceAction) => {
      switch (action.type) {
        case 'browse':
          goToBrowse(action.intent)
          break
        case 'browse-filters':
          goToBrowse(action.intent)
          setFiltersOpen(true)
          break
        case 'account-tab':
          if (user) {
            setProfileNavTab(action.tab)
            setProfileNavToken((t) => t + 1)
            setScreen('profile')
          } else {
            setScreen('sign-in')
          }
          break
        case 'buyer-support':
          window.location.href = `mailto:support@propertyfish.in?subject=${encodeURIComponent('Property Fish — Buyers')}`
          break
        case 'tenant-support':
          window.location.href = `mailto:support@propertyfish.in?subject=${encodeURIComponent('Property Fish — Renters')}`
          break
        case 'dealer-support':
          window.location.href = `mailto:support@propertyfish.in?subject=${encodeURIComponent(
            'Property Fish — Dealers / Builders',
          )}`
          break
        case 'post-property':
          setEditListingTarget(null)
          setListingDetail(null)
          setPostCreateIntent(action.intent ?? 'buy')
          if (user) setScreen('post-property')
          else setScreen('sign-in')
          break
        case 'my-properties':
          if (user) {
            setProfileNavTab('my-listings')
            setProfileNavToken((t) => t + 1)
            setScreen('profile')
          } else {
            setScreen('sign-in')
          }
          break
        case 'partner-contact':
          window.location.href =
            'mailto:support@propertyfish.in?subject=Property%20Fish%20%E2%80%94%20Dealers%20%2F%20Builders'
          break
        case 'owner-support':
          window.location.href =
            `mailto:support@propertyfish.in?subject=${encodeURIComponent('Property Fish — Owner support')}`
          break
      }
    },
    [goToBrowse, user],
  )

  const headerNavHighlight = useMemo((): HeaderNavHighlight => {
    return {
      buyers: screen === 'listings' && intent === 'buy',
      tenants: screen === 'listings' && intent === 'rent',
      owners:
        screen === 'post-property' ||
        screen === 'edit-listing' ||
        (screen === 'profile' && profileNavTab === 'my-listings'),
      dealers: false,
    }
  }, [screen, intent, profileNavTab])

  const openListingDetail = useCallback(
    (l: Listing, listingIntent: ListingIntent, returnTo: 'listings' | 'profile', opts?: { focusContact?: boolean }) => {
      setListingDetail({ listing: l, intent: listingIntent, returnTo, ...opts })
      setScreen('listing-detail')
    },
    [],
  )

  const handleSignOut = useCallback(() => {
    logout()
    setScreen('sign-in')
  }, [logout])

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    if (!initialPasswordResetToken) return
    const url = new URL(window.location.href)
    url.searchParams.delete('reset')
    window.history.replaceState({}, '', url.pathname + url.search + url.hash)
  }, [])

  /** After session check: guests land on sign-in unless they are on auth / reset flows. */
  useEffect(() => {
    if (!ready) return
    if (!user) {
      setEditListingTarget(null)
      setListingDetail(null)
      setScreen((prev) => {
        if (
          prev === 'sign-in' ||
          prev === 'sign-up' ||
          prev === 'forgot-password' ||
          prev === 'reset-password'
        ) {
          return prev
        }
        return 'sign-in'
      })
    }
  }, [ready, user])

  useEffect(() => {
    if (screen !== 'profile') {
      setProfileNavTab(null)
      setProfileNavToken(0)
    }
  }, [screen])

  const loadCatalogue = useCallback(async (opts?: { signal?: AbortSignal; showSpinner?: boolean }) => {
    const showSpinner = opts?.showSpinner !== false
    if (showSpinner) {
      setLoading(true)
    }
    try {
      const rows = await fetchListingCatalogue(opts?.signal)
      setCatalogue(rows)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      if (showSpinner) {
        toast.error('Unable to refresh properties. Please try again.', {
          duration: 10_000,
          action: {
            label: 'Retry',
            onClick: () => {
              void loadCatalogue({ showSpinner: true })
            },
          },
        })
      }
    } finally {
      if (showSpinner) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    if (!user) {
      setCatalogue({ buy: [], rent: [] })
      setLoading(false)
      return
    }
    const controller = new AbortController()
    void loadCatalogue({ signal: controller.signal, showSpinner: true })
    return () => controller.abort()
  }, [ready, user, loadCatalogue])

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
      if (user) void loadCatalogue({ showSpinner: false })
    },
    [loadCatalogue, user],
  )

  useEffect(() => {
    if (typeof document === 'undefined') return

    if (screen === 'listing-detail' && listingDetail) {
      const t = listingDetail.listing.title.trim()
      document.title = t ? `${t} | ${DEFAULT_DOC_TITLE}` : DEFAULT_DOC_TITLE
      return
    }

    if (screen === 'listings' && user) {
      const locality = localityTags.join(', ').trim()
      const kind = intent === 'rent' ? 'Flats for Rent' : 'Flats for Sale'
      document.title = locality ? `${kind} in ${locality} | ${DEFAULT_DOC_TITLE}` : `${kind} | ${DEFAULT_DOC_TITLE}`
      return
    }

    const suffix = ` | ${DEFAULT_DOC_TITLE}`
    if (screen === 'profile') document.title = `Account${suffix}`
    else if (screen === 'post-property') document.title = `Post a property${suffix}`
    else if (screen === 'edit-listing') document.title = `Edit property${suffix}`
    else if (screen === 'sign-in') document.title = `Sign in${suffix}`
    else if (screen === 'sign-up') document.title = `Create account${suffix}`
    else if (screen === 'forgot-password') document.title = `Reset password${suffix}`
    else if (screen === 'reset-password') document.title = `Set new password${suffix}`
    else document.title = DEFAULT_DOC_TITLE
  }, [screen, listingDetail, localityTags, intent, user])

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
        variant={
          screen === 'sign-in' ||
          screen === 'sign-up' ||
          screen === 'forgot-password' ||
          screen === 'reset-password'
            ? 'auth'
            : 'full'
        }
        signedInUser={user ? { fullName: user.fullName } : null}
        onProfileClick={user ? () => setScreen('profile') : undefined}
        onSignOut={handleSignOut}
        onPostPropertyClick={() => {
          setEditListingTarget(null)
          setListingDetail(null)
          setPostCreateIntent('buy')
          if (user) setScreen('post-property')
          else setScreen('sign-in')
        }}
        onLogoClick={() => {
          setListingDetail(null)
          setEditListingTarget(null)
          setPasswordResetToken(null)
          setScreen('listings')
        }}
        onAccountClick={() => setScreen('sign-in')}
        onAudienceAction={handleAudienceAction}
        navHighlight={headerNavHighlight}
      />
      <main className="flex min-h-0 flex-1 flex-col">
      {screen === 'profile' && user ? (
        <ProfileScreen
          user={user}
          onBack={() => setScreen('listings')}
          myListingsVersion={myListingsVersion}
          profileNavTab={profileNavTab}
          profileNavToken={profileNavToken}
          onViewListing={(listing, listingIntent) => openListingDetail(listing, listingIntent, 'profile')}
          onContactListing={(listing, listingIntent) =>
            openListingDetail(listing, listingIntent, 'profile', { focusContact: true })
          }
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
          focusContact={listingDetail.focusContact}
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
          key={`post-create-${postCreateIntent}`}
          initialIntent={postCreateIntent}
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
      ) : screen === 'reset-password' && passwordResetToken ? (
        <ResetPasswordScreen
          token={passwordResetToken}
          onSuccess={() => {
            setPasswordResetToken(null)
            setScreen('sign-in')
          }}
          onBack={() => {
            setPasswordResetToken(null)
            setScreen('sign-in')
          }}
        />
      ) : screen === 'forgot-password' ? (
        <ForgotPasswordScreen onBackToSignIn={() => setScreen('sign-in')} />
      ) : screen === 'sign-in' ? (
        <SignInScreen
          onGoToSignUp={() => setScreen('sign-up')}
          onForgotPassword={() => setScreen('forgot-password')}
          onAuthenticated={() => setScreen('listings')}
        />
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
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-5">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
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
                <div className="min-w-0 max-w-xl">
                  <h2 className="text-lg font-bold tracking-tight text-ink sm:text-xl">
                    {intent === 'rent'
                      ? 'Properties to rent — flats and homes in top localities'
                      : 'Properties to buy — flats and homes in top localities'}
                  </h2>
                  <p className="mt-1 text-xs leading-snug text-ink-secondary sm:text-sm">
                    {intent === 'rent'
                      ? 'Use filters, search, and locality chips to shortlist by budget, BHK, and availability — then open a listing or contact the owner.'
                      : 'Use filters, search, and locality chips to shortlist by budget, BHK, and layout — then open a listing or contact the owner.'}
                  </p>
                </div>
              </div>
              <div className="flex min-w-0 flex-wrap items-center justify-end gap-3 sm:gap-4">
                <p className="text-sm font-medium text-ink-secondary">
                  Showing{' '}
                  <span className="font-semibold text-ink">
                    {filteredSorted.length === 0 ? 0 : 1} – {visibleSlice.length}
                  </span>{' '}
                  of <span className="font-semibold text-ink">{filteredSorted.length}</span> properties
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
                <p className="text-lg font-semibold text-ink">No properties match</p>
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
                    onContactOwner={(l, i) => openListingDetail(l, i, 'listings', { focusContact: true })}
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
                  Load more properties
                </button>
              </div>
            ) : null}
          </div>
        </div>
          </div>
        </>
      )}
      </main>

      {screen !== 'sign-in' &&
      screen !== 'sign-up' &&
      screen !== 'forgot-password' &&
      screen !== 'reset-password' ? (
        <Footer
          onBrowseListings={() => {
            setListingDetail(null)
            setEditListingTarget(null)
            if (user) {
              setScreen('listings')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            } else {
              setScreen('sign-in')
            }
          }}
          onPostPropertyClick={() => {
            setEditListingTarget(null)
            setListingDetail(null)
            setPostCreateIntent('buy')
            if (user) setScreen('post-property')
            else setScreen('sign-in')
          }}
        />
      ) : null}
    </div>
  )
}
