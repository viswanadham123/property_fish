type Props = {
  onPostPropertyClick?: () => void
}

export function Footer({ onPostPropertyClick }: Props) {
  return (
    <footer className="pf-footer-gradient mt-16 text-white/90">
      <div className="mx-auto w-full max-w-none px-4 py-14 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white">Browse</h2>
            <p className="max-w-md text-sm leading-relaxed text-white/75">
              Search and filter listings from the catalogue. Data is loaded from the server when you use the app.
            </p>
            <button
              type="button"
              className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-700"
            >
              Browse listings
            </button>
          </div>

          <div className="space-y-4 rounded-lg bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white">List your property</h2>
            <p className="text-sm text-white/75">Post when you are signed in. You can edit or remove your own listings from your account.</p>
            <button
              type="button"
              onClick={onPostPropertyClick}
              className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-700"
            >
              Post now
            </button>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-10">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-white/50">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="text-white/50">Support: </span>
              <a href="mailto:support@propertyfish.in" className="font-semibold text-white hover:underline">
                support@propertyfish.in
              </a>
            </li>
          </ul>
        </div>

        <p className="mt-10 border-t border-white/10 pt-8 text-center text-xs text-white/45">
          Copyright © {new Date().getFullYear()}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
