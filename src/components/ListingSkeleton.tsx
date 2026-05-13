export function ListingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-lg border border-border-subtle bg-surface md:flex"
        >
          <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-slate-400 to-slate-600 md:h-auto md:min-h-[185px] md:w-[260px]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <svg
              viewBox="0 0 200 120"
              className="relative z-0 h-[65%] w-[80%] max-h-[120px] text-white/35"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 92V28h32v64H12zm38-8V22h36v70H50V84zm40-4V18h34v74H90V80zm38 6V26h32v66h-32V86z" />
            </svg>
          </div>
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
