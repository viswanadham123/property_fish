type ViewMode = 'list' | 'map'
type IntentMode = 'buy' | 'rent'

type Props = {
  intent: IntentMode
  onIntentChange: (mode: IntentMode) => void
  draftQuery: string
  onDraftQueryChange: (value: string) => void
  onSubmitSearch: () => void
  localityTags: string[]
  onRemoveLocalityTag: (tag: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function SearchStrip({
  intent,
  onIntentChange,
  draftQuery,
  onDraftQueryChange,
  onSubmitSearch,
  localityTags,
  onRemoveLocalityTag,
  viewMode,
  onViewModeChange,
}: Props) {
  return (
    <div className="border-b border-border-subtle bg-page">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-8">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 lg:gap-3">
          <div className="relative shrink-0">
            <select
              aria-label="Intent"
              className="appearance-none rounded-md border border-border-subtle bg-surface py-2 pr-8 pl-3 text-sm font-medium text-ink-secondary shadow-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              value={intent}
              onChange={(e) => onIntentChange(e.target.value as IntentMode)}
            >
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
            </select>
            <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-ink-muted">▾</span>
          </div>

          {localityTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onRemoveLocalityTag(tag)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-brand-600 px-2.5 py-1 text-sm font-medium text-white shadow-sm"
            >
              {tag}
              <span className="flex h-5 w-5 items-center justify-center rounded bg-white/20 text-xs leading-none">×</span>
            </button>
          ))}

          <label className="relative flex min-w-0 flex-1 items-center sm:min-w-[160px] lg:min-w-[280px]">
            <span className="sr-only">Search locality</span>
            <input
              type="search"
              placeholder="Search locality, project, or landmark"
              className="w-full rounded-md border border-border-subtle bg-page py-2 pr-3 pl-9 text-sm text-ink placeholder:text-ink-muted focus:border-brand-600 focus:bg-surface focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              value={draftQuery}
              onChange={(e) => onDraftQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSubmitSearch()
              }}
            />
            <svg
              className="absolute left-3 h-4 w-4 text-ink-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
            </svg>
          </label>

          <button
            type="button"
            onClick={onSubmitSearch}
            className="inline-flex min-w-[160px] shrink-0 items-center justify-center rounded-md bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            Search
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-md border border-border-subtle bg-surface p-1 shadow-sm">
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={
              'inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-semibold transition ' +
              (viewMode === 'list' ? 'bg-brand-600 text-white shadow-sm' : 'text-ink-muted hover:text-ink-secondary')
            }
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h10" />
            </svg>
            List
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('map')}
            className={
              'inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-semibold transition ' +
              (viewMode === 'map' ? 'bg-brand-600 text-white shadow-sm' : 'text-ink-muted hover:text-ink-secondary')
            }
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 16.382V5.618a2 2 0 011.106-1.789l5.447-2.724a2 2 0 011.894 0l5.447 2.724A2 2 0 0119 5.618v10.764a2 2 0 01-1.106 1.789L13 21m0 0l5.447-2.724M13 21V9.553m0 11.447L7.553 14.276M13 9.553L7.553 6.829M13 9.553l5.447-2.724" />
            </svg>
            Map
          </button>
        </div>
      </div>
    </div>
  )
}
