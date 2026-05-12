const audienceLinks = ['For Buyers', 'For Tenants', 'For Owners', 'For Dealers/Builders'] as const

export type HeaderUserBrief = {
  fullName: string
}

type Props = {
  onPostPropertyClick?: () => void
  onLogoClick?: () => void
  onAccountClick?: () => void
  onSignOut?: () => void
  signedInUser?: HeaderUserBrief | null
}

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).slice(0, 2)
  if (parts.length === 0) return '?'
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?'
}

export function Header({
  onPostPropertyClick,
  onLogoClick,
  onAccountClick,
  onSignOut,
  signedInUser,
}: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <button type="button" onClick={onLogoClick} className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rotate-45 rounded-[2px] bg-brand-600" />
          <span className="text-[27px] leading-none font-bold tracking-tight text-[#2f2f5f]">Property</span>
          <span className="text-[27px] leading-none font-medium tracking-tight text-[#8f97a8]">Fish</span>
        </button>

        <nav
          aria-label="Audience"
          className="order-last flex w-full flex-wrap justify-center gap-x-3 gap-y-2 text-sm font-medium text-ink-secondary lg:order-none lg:w-auto lg:justify-start"
        >
          {audienceLinks.map((label) => (
            <a
              key={label}
              href="#"
              className={
                'inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-surface-muted hover:text-ink ' +
                (label === 'For Tenants' ? 'text-brand-600' : '')
              }
            >
              {label}
              <span className="text-[10px] text-ink-muted" aria-hidden>
                ▾
              </span>
            </a>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-2.5">
          {signedInUser ? (
            <div className="flex items-center gap-2">
              <span className="hidden max-w-[10rem] truncate text-sm font-medium text-ink-secondary sm:inline" title={signedInUser.fullName}>
                Hi, {signedInUser.fullName.split(/\s+/)[0]}
              </span>
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-surface-muted text-xs font-bold text-[#3c2a7f]"
                aria-hidden
                title={signedInUser.fullName}
              >
                {initials(signedInUser.fullName)}
              </span>
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
