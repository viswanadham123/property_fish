import { useCallback, useEffect, useId, useRef, useState } from 'react'

export type HeaderAudienceAction =
  | { type: 'browse'; intent: 'buy' | 'rent' }
  | { type: 'browse-filters'; intent: 'buy' | 'rent' }
  | { type: 'post-property'; intent?: 'buy' | 'rent' }
  | { type: 'my-properties' }
  | { type: 'partner-contact' }
  | { type: 'owner-support' }
  | { type: 'buyer-support' }
  | { type: 'tenant-support' }
  | { type: 'dealer-support' }
  | { type: 'account-tab'; tab: 'profile' | 'favorites' | 'my-listings' }

export type HeaderNavHighlight = {
  buyers: boolean
  tenants: boolean
  owners: boolean
  dealers: boolean
}

type AudienceMenuItem = {
  label: string
  description?: string
  emphasis?: 'primary'
  action: HeaderAudienceAction
}

type AudienceMenu = {
  id: 'buyers' | 'tenants' | 'owners' | 'dealers'
  label: string
  intro: string
  items: readonly AudienceMenuItem[]
}

const DROPDOWN_PANEL_CLASS = 'min-w-[17.5rem]'

const AUDIENCE_MENUS: readonly AudienceMenu[] = [
  {
    id: 'buyers',
    label: 'For Buyers',
    intro:
      'Explore properties for sale with locality chips, BHK filters, and sorting — save picks to your account when you sign in.',
    items: [
      {
        label: 'Browse properties for sale',
        description: 'Open Buy search and scroll the catalogue',
        emphasis: 'primary',
        action: { type: 'browse', intent: 'buy' },
      },
      {
        label: 'Search with filters',
        description: 'Jump to Buy and open the filter sidebar',
        action: { type: 'browse-filters', intent: 'buy' },
      },
      {
        label: 'Saved properties',
        description: 'View favorites from your profile',
        action: { type: 'account-tab', tab: 'favorites' },
      },
      {
        label: 'Buyer support',
        description: 'Help with search, listings, or sellers',
        action: { type: 'buyer-support' },
      },
    ],
  },
  {
    id: 'tenants',
    label: 'For Tenants',
    intro:
      'Find rentals that match furnishing, tenant preference, and availability — then contact owners from the property page.',
    items: [
      {
        label: 'Browse properties for rent',
        description: 'Open Rent search and explore lets',
        emphasis: 'primary',
        action: { type: 'browse', intent: 'rent' },
      },
      {
        label: 'Search with filters',
        description: 'Jump to Rent and open the filter sidebar',
        action: { type: 'browse-filters', intent: 'rent' },
      },
      {
        label: 'Saved properties',
        description: 'Rentals you saved with the heart icon',
        action: { type: 'account-tab', tab: 'favorites' },
      },
      {
        label: 'Renter support',
        description: 'Questions about renting or enquiries',
        action: { type: 'tenant-support' },
      },
    ],
  },
  {
    id: 'owners',
    label: 'For Owners',
    intro:
      'List your property for sale or rent, update details anytime, and manage enquiries from your account.',
    items: [
      {
        label: 'Post for sale',
        description: 'Reach buyers — apartments, floors, villas',
        emphasis: 'primary',
        action: { type: 'post-property', intent: 'buy' },
      },
      {
        label: 'Post for rent',
        description: 'Find tenants — furnished or semi-furnished',
        action: { type: 'post-property', intent: 'rent' },
      },
      {
        label: 'Manage my properties',
        description: 'Edit, review, or remove what you listed',
        action: { type: 'my-properties' },
      },
      {
        label: 'Owner support',
        description: 'Help with posting, verification, or account',
        action: { type: 'owner-support' },
      },
    ],
  },
  {
    id: 'dealers',
    label: 'For Dealers/Builders',
    intro:
      'Add sale and rental inventory, keep records under your account, and talk to us about partnerships or higher volume.',
    items: [
      {
        label: 'Post for sale',
        description: 'List buyer-facing inventory',
        emphasis: 'primary',
        action: { type: 'post-property', intent: 'buy' },
      },
      {
        label: 'Post for rent',
        description: 'List rental units for tenants',
        action: { type: 'post-property', intent: 'rent' },
      },
      {
        label: 'Partnership enquiries',
        description: 'Bulk listings, branding, or integrations',
        action: { type: 'partner-contact' },
      },
      {
        label: 'Dealer support',
        description: 'Account, posting, or verification help',
        action: { type: 'dealer-support' },
      },
    ],
  },
]

export type HeaderUserBrief = {
  fullName: string
}

type Props = {
  variant?: 'full' | 'auth'
  onPostPropertyClick?: () => void
  onLogoClick?: () => void
  onAccountClick?: () => void
  /** Signed-in: open profile (initials / name). */
  onProfileClick?: () => void
  onSignOut?: () => void
  signedInUser?: HeaderUserBrief | null
  /** Dropdown item clicks (browse, post, profile tab, mailto). */
  onAudienceAction?: (action: HeaderAudienceAction) => void
  /** Which top-level nav item appears active (orange). */
  navHighlight?: HeaderNavHighlight
}

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).slice(0, 2)
  if (parts.length === 0) return '?'
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?'
}

type MenuId = AudienceMenu['id']

export function Header({
  variant = 'full',
  onPostPropertyClick,
  onLogoClick,
  onAccountClick,
  onProfileClick,
  onSignOut,
  signedInUser,
  onAudienceAction,
  navHighlight = { buyers: true, tenants: false, owners: false, dealers: false },
}: Props) {
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const menuId = useId()

  const closeMenu = useCallback(() => setOpenMenu(null), [])

  useEffect(() => {
    if (!openMenu) return
    function onDocMouseDown(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) closeMenu()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeMenu()
    }
    document.addEventListener('mousedown', onDocMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openMenu, closeMenu])

  function isHighlighted(id: MenuId): boolean {
    switch (id) {
      case 'buyers':
        return navHighlight.buyers
      case 'tenants':
        return navHighlight.tenants
      case 'owners':
        return navHighlight.owners
      case 'dealers':
        return navHighlight.dealers
      default:
        return false
    }
  }

  if (variant === 'auth') {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-surface">
        <div className="flex w-full items-center px-4 py-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <button
            type="button"
            onClick={onLogoClick}
            className="flex items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40"
            aria-label="Property Fish — home"
          >
            <span className="inline-block h-3 w-3 rotate-45 rounded-[2px] bg-brand-600" aria-hidden />
            <span className="text-[27px] leading-none font-bold tracking-tight text-[#2f2f5f]">Property</span>
            <span className="text-[27px] leading-none font-medium tracking-tight text-[#8f97a8]">Fish</span>
          </button>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface">
      <div className="mx-auto flex w-full max-w-none flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <button type="button" onClick={onLogoClick} className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rotate-45 rounded-[2px] bg-brand-600" />
          <span className="text-[27px] leading-none font-bold tracking-tight text-[#2f2f5f]">Property</span>
          <span className="text-[27px] leading-none font-medium tracking-tight text-[#8f97a8]">Fish</span>
        </button>

        <nav
          ref={navRef}
          aria-label="Audience"
          className="order-last flex w-full flex-wrap justify-center gap-x-1 gap-y-2 text-sm font-medium text-ink-secondary lg:order-none lg:w-auto lg:justify-start"
        >
          {AUDIENCE_MENUS.map((menu) => {
            const expanded = openMenu === menu.id
            const highlighted = isHighlighted(menu.id)
            const btnId = `${menuId}-${menu.id}`
            const panelId = `${menuId}-${menu.id}-panel`
            return (
              <div key={menu.id} className="relative">
                <button
                  type="button"
                  id={btnId}
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  aria-haspopup="menu"
                  onClick={() => setOpenMenu((prev) => (prev === menu.id ? null : menu.id))}
                  className={
                    'inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-surface-muted hover:text-ink ' +
                    (highlighted ? 'text-brand-600' : '')
                  }
                >
                  {menu.label}
                  <span className="text-[10px] text-ink-muted" aria-hidden>
                    ▾
                  </span>
                </button>
                {expanded ? (
                  <div
                    id={panelId}
                    role="menu"
                    aria-labelledby={btnId}
                    className={
                      'absolute top-full left-1/2 z-50 mt-1 -translate-x-1/2 rounded-lg border border-border-subtle bg-surface py-1 shadow-lg lg:left-0 lg:translate-x-0 ' +
                      DROPDOWN_PANEL_CLASS
                    }
                  >
                    <p className="border-b border-border-subtle px-3 py-2.5 text-xs leading-relaxed text-ink-secondary">
                      {menu.intro}
                    </p>
                    <div className="py-1">
                      {menu.items.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          role="menuitem"
                          className={
                            'flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition-colors ' +
                            (item.emphasis === 'primary'
                              ? 'border-l-[3px] border-brand-600 bg-brand-50/70 hover:bg-brand-50'
                              : 'border-l-[3px] border-transparent hover:bg-surface-muted')
                          }
                          onClick={() => {
                            onAudienceAction?.(item.action)
                            closeMenu()
                          }}
                        >
                          <span
                            className={
                              'text-sm ' + (item.emphasis === 'primary' ? 'font-bold text-ink' : 'font-semibold text-ink')
                            }
                          >
                            {item.label}
                          </span>
                          {item.description ? (
                            <span className="text-xs leading-snug text-ink-secondary">{item.description}</span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })}
        </nav>

        <div className="flex flex-wrap items-center gap-2.5">
          {signedInUser ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onProfileClick}
                className="hidden max-w-[10rem] truncate text-left text-sm font-medium text-ink-secondary hover:text-brand-600 sm:inline"
                title="My profile"
              >
                Hi, {signedInUser.fullName.split(/\s+/)[0]}
              </button>
              <button
                type="button"
                onClick={onProfileClick}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-surface-muted text-xs font-bold text-[#3c2a7f] hover:border-brand-600/40 hover:text-brand-700"
                title={`Profile — ${signedInUser.fullName}`}
                aria-label="Open profile and favorites"
              >
                {initials(signedInUser.fullName)}
              </button>
              {onSignOut ? (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="rounded-md border border-border-subtle bg-surface-muted px-2 py-1.5 text-xs font-semibold text-ink-secondary hover:bg-surface"
                >
                  Sign out
                </button>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              aria-label="Sign in"
              onClick={onAccountClick}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-surface-muted text-xs font-bold text-[#3c2a7f]"
              title="Sign in"
            >
              A
            </button>
          )}
          <button
            type="button"
            onClick={onPostPropertyClick}
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Post Property
            <span className="rounded bg-white px-1.5 py-[1px] text-[10px] font-bold text-ink">FREE</span>
          </button>
        </div>
      </div>
    </header>
  )
}
