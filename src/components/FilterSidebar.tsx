import type { Availability, FilterState, Furnishing, PropertyKind, TenantKind } from '../types/filters'

const bhkOptions = ['any', '1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'] as const

const PROPERTY_OPTIONS: { label: string; value: PropertyKind }[] = [
  { label: 'Apartment', value: 'apartment' },
  { label: 'Independent House', value: 'independent' },
  { label: 'Gated Villa', value: 'gated' },
]

const TENANT_OPTIONS: { label: string; value: TenantKind }[] = [
  { label: 'Bachelor', value: 'bachelor' },
  { label: 'Family', value: 'family' },
  { label: 'Company', value: 'company' },
]

const FURNISHING_OPTIONS: Furnishing[] = ['full', 'semi', 'none']

type Props = {
  mobileOpen: boolean
  onCloseMobile: () => void
  filters: FilterState
  onFiltersChange: (next: FilterState) => void
  onReset: () => void
}

export function FilterSidebar({ mobileOpen, onCloseMobile, filters, onFiltersChange, onReset }: Props) {
  const asideClass =
    'fixed inset-y-0 left-0 z-40 w-[min(100%,320px)] transform bg-surface shadow-xl transition-transform duration-200 lg:relative lg:z-0 lg:w-72 lg:translate-x-0 lg:shadow-none ' +
    (mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')

  function patch(partial: Partial<FilterState>) {
    onFiltersChange({ ...filters, ...partial })
  }

  function toggleFurnishing(f: Furnishing) {
    const has = filters.furnishingAllowed.includes(f)
    const next = has ? filters.furnishingAllowed.filter((x) => x !== f) : [...filters.furnishingAllowed, f]
    patch({ furnishingAllowed: next })
  }

  function toggleTenant(t: TenantKind) {
    const has = filters.tenantsPreferred.includes(t)
    const next = has ? filters.tenantsPreferred.filter((x) => x !== t) : [...filters.tenantsPreferred, t]
    patch({ tenantsPreferred: next })
  }

  function toggleKind(k: PropertyKind) {
    const has = filters.propertyKinds.includes(k)
    const next = has ? filters.propertyKinds.filter((x) => x !== k) : [...filters.propertyKinds, k]
    patch({ propertyKinds: next })
  }

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close filters"
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={onCloseMobile}
        />
      ) : null}

      <aside className={asideClass} aria-label="Filters">
        <div className="flex h-full flex-col border-r border-border-subtle bg-surface lg:rounded-lg lg:border lg:shadow-[0_2px_12px_rgba(45,45,45,0.06)]">
          <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b border-border-subtle bg-surface px-4 pt-3 pb-0">
            <div className="flex gap-4">
              <div className="border-b-2 border-brand-600 pb-3">
                <h2 className="text-base font-bold text-ink">Filters</h2>
              </div>
              <button type="button" className="pb-3 text-sm font-semibold text-ink-secondary hover:text-ink">
                More Filters
              </button>
            </div>
            <button type="button" className="pb-3 text-xs font-semibold text-brand-600 hover:underline" onClick={onReset}>
              Reset
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
            <div className="flex flex-col gap-6">
            <section>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted">BHK Type</h3>
              <div className="grid grid-cols-3 gap-2">
                {bhkOptions.map((opt) => {
                  const active = filters.bhk === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => patch({ bhk: opt })}
                      className={
                        'aspect-square max-h-[44px] rounded-md border text-xs font-semibold transition ' +
                        (active
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-border-subtle bg-surface text-ink-secondary hover:border-brand-600/40')
                      }
                    >
                      {opt === 'any' ? 'Any' : opt}
                    </button>
                  )
                })}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted">Availability</h3>
              <div className="flex flex-col gap-2.5 text-sm text-ink-secondary">
                {(
                  [
                    ['any', 'Any'],
                    ['immediate', 'Immediate'],
                    ['within30', 'Within 30 days'],
                    ['within15', 'Within 15 days'],
                    ['after30', 'After 30 days'],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="avail"
                      checked={filters.availability === value}
                      onChange={() => patch({ availability: value as Availability })}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted">Furnishing</h3>
              <div className="flex flex-col gap-2.5 text-sm text-ink-secondary">
                {FURNISHING_OPTIONS.map((x) => (
                  <label key={x} className="flex cursor-pointer items-center gap-2 capitalize">
                    <input type="checkbox" checked={filters.furnishingAllowed.includes(x)} onChange={() => toggleFurnishing(x)} />
                    {x}
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted">Preferred Tenants</h3>
              <div className="flex flex-wrap gap-2">
                {TENANT_OPTIONS.map(({ label, value }) => {
                  const on = filters.tenantsPreferred.includes(value)
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleTenant(value)}
                      className={
                        'rounded-full border px-3 py-2 text-xs font-semibold transition ' +
                        (on
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-border-subtle bg-surface-muted text-ink-secondary hover:border-brand-600/35')
                      }
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted">Property Type</h3>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_OPTIONS.map(({ label, value }) => {
                  const on = filters.propertyKinds.includes(value)
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleKind(value)}
                      className={
                        'rounded-full border px-3 py-2 text-xs font-semibold transition ' +
                        (on
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-border-subtle bg-surface-muted text-ink-secondary hover:border-brand-600/35')
                      }
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted">Company</h3>
              <select
                value={filters.verifiedOwnersOnly ? 'verified' : 'none'}
                onChange={(e) => patch({ verifiedOwnersOnly: e.target.value === 'verified' })}
                className="w-full rounded-md border border-border-subtle bg-surface py-2 text-sm text-ink-secondary focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
              >
                <option value="none">None</option>
                <option value="verified">Verified owners only</option>
              </select>
            </section>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 shrink-0 border-t border-border-subtle bg-surface p-4">
            <button
              type="button"
              className="w-full rounded-md bg-brand-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-700"
              onClick={onCloseMobile}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
