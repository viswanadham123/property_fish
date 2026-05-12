const popularCities = [
  'Bangalore',
  'Koramangala',
  'Marathahalli',
  'HSR Layout',
  'Whitefield',
  'Indira Nagar',
  'Bellandur',
  'Chandra Layout',
  'J. P. Nagar',
  'BTM Layout',
  'Jayanagar',
  'Chennai',
  'Hyderabad',
  'Delhi',
] as const

const importantLinks = [
  'Mobile Apps',
  'Our Services',
  'Post Free Property',
  'Blog',
  'Customer Service',
  'Sitemap',
] as const

const companyLinks = [
  'About Us',
  'Contact Us',
  'Careers With Us',
  'Terms & Conditions',
  'Request Info',
  'Feedback',
  'Report A Problem',
  'Testimonials',
  'Privacy Policy',
] as const

type Props = {
  onPostPropertyClick?: () => void
}

export function Footer({ onPostPropertyClick }: Props) {
  return (
    <footer className="pf-footer-gradient mt-16 text-white/90">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white">Find Property</h2>
            <p className="max-w-md text-sm leading-relaxed text-white/75">
              Select from thousands of verified listings across top cities. Shortlist faster with smart filters and map
              search.
            </p>
            <button
              type="button"
              className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-700"
            >
              Browse listings
            </button>
          </div>

          <div className="space-y-4 rounded-lg bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white">List Your Property</h2>
            <p className="text-sm text-white/75">For free. Without any brokerage.</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-brand-600/90 px-3 py-1 text-xs font-bold text-white">Free Posting</span>
            </div>
            <button
              type="button"
              onClick={onPostPropertyClick}
              className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-700"
            >
              Post now
            </button>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-10">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-white/50">
            Flats For Sale In Bangalore &amp; More
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {popularCities.map((city) => (
              <a key={city} href="#" className="text-white/65 transition hover:text-white">
                Flats For Sale In {city}
              </a>
            ))}
          </div>
        </div>

        <p className="mt-10 max-w-2xl text-sm italic leading-relaxed text-white/45">
          There are many variations of passages Lorem Ipsum available, but the majority have suffered alterations.
        </p>

        <div className="mt-12 grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-white/50">Important Links</h4>
            <ul className="space-y-2 text-sm">
              {importantLinks.map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/75 hover:text-white">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-white/50">Company</h4>
            <ul className="space-y-2 text-sm">
              {companyLinks.map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/75 hover:text-white">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-white/50">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-white/50">Contact Support: </span>
                <a href="tel:+91964221134" className="font-semibold text-white hover:underline">
                  +91 964221134
                </a>
              </li>
              <li>
                <span className="text-white/50">Support Email: </span>
                <a href="mailto:support@propertyfish.in" className="font-semibold text-white hover:underline">
                  support@propertyfish.in
                </a>
              </li>
              <li className="pt-2">
                <span className="text-white/50">Download Apps: </span>
                <span className="ml-2 inline-flex gap-2">
                  <a
                    href="#"
                    className="rounded-md bg-brand-600 px-3 py-1 text-xs font-bold text-white hover:bg-brand-700"
                  >
                    Google Play
                  </a>
                  <a
                    href="#"
                    className="rounded-md bg-brand-600 px-3 py-1 text-xs font-bold text-white hover:bg-brand-700"
                  >
                    App Store
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-8 text-center text-xs text-white/45">
          Copyright © {new Date().getFullYear()}. All rights reserved by Anya Infotech Private Limited
        </p>
      </div>
    </footer>
  )
}
