import type { ReactNode } from 'react'

type Props = {
  /** Short label above the headline (e.g. “Welcome back”). */
  asideEyebrow: string
  asideTitle: string
  asideDescription: string
  bullets: string[]
  children: ReactNode
}

/**
 * Full-width split: left story, right form. Fills space below header (`flex-1` parent).
 * lg+: equal-height columns; sm: stacked (panel then form).
 */
export function AuthSplitLayout({ asideEyebrow, asideTitle, asideDescription, bullets, children }: Props) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="grid min-h-0 w-full flex-1 grid-cols-1 lg:grid-cols-2 lg:grid-rows-1">
        <aside
          className={
            `relative flex min-h-[240px] min-w-0 flex-col justify-center overflow-hidden ` +
            `bg-gradient-to-br from-[#2a2842] via-[#352f5c] to-[#1e3a4a] ` +
            `px-4 py-10 text-white sm:min-h-[280px] sm:px-6 sm:py-12 ` +
            `lg:min-h-0 lg:px-8 lg:py-12 xl:px-12`
          }
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-brand-500/35 blur-3xl" />
            <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 h-40 w-40 rounded-full bg-amber-400/10 blur-2xl" />
          </div>
          <div className="relative z-10 mx-auto w-full max-w-xl lg:mx-0">
            <div className="mb-5 flex items-center gap-2 sm:mb-6">
              <span className="inline-block h-2.5 w-2.5 rotate-45 rounded-[2px] bg-brand-400" aria-hidden />
              <span className="text-lg font-bold tracking-tight text-white">Property</span>
              <span className="text-lg font-medium tracking-tight text-white/60">Fish</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-200/90">{asideEyebrow}</p>
            <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-[1.85rem] lg:leading-snug xl:text-[2rem]">
              {asideTitle}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">{asideDescription}</p>
            <ul className="mt-7 space-y-3 sm:mt-8 sm:space-y-3.5">
              {bullets.map((text) => (
                <li key={text} className="flex items-start gap-3 text-sm leading-snug text-white/90 sm:text-[15px]">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-[11px] font-bold text-emerald-300"
                    aria-hidden
                  >
                    ✓
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div
          className={
            `flex min-h-0 min-w-0 flex-1 flex-col justify-center ` +
            `border-border-subtle bg-page px-4 py-10 sm:px-6 sm:py-12 ` +
            `lg:border-l lg:bg-surface lg:px-8 lg:py-12 xl:px-12`
          }
        >
          <div className="mx-auto w-full max-w-md lg:mx-0">{children}</div>
        </div>
      </div>
    </div>
  )
}
