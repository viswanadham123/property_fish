export function ListingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-lg border border-border-subtle bg-surface md:flex"
        >
          <div className="h-44 bg-surface-muted md:h-auto md:w-[300px]" />
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="h-6 w-40 rounded bg-surface-muted" />
            <div className="h-4 w-full max-w-xl rounded bg-surface-muted" />
            <div className="h-16 rounded-md bg-surface-muted" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="h-4 rounded bg-surface-muted" />
              <div className="h-4 rounded bg-surface-muted" />
              <div className="h-4 rounded bg-surface-muted" />
              <div className="h-4 rounded bg-surface-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
