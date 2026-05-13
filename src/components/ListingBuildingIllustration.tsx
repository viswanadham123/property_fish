import type { Listing } from '../data/listings'

/** Building silhouettes for listing thumbnails when there are no real photos. */
export function ListingBuildingIllustration({ listing }: { listing: Listing }) {
  const t = listing.propertyType.toLowerCase()
  const lowRise =
    t.includes('villa') || t.includes('house') || t.includes('independent') || t.includes('floor')

  if (lowRise) {
    return (
      <svg
        viewBox="0 0 200 120"
        className="h-[72%] w-[85%] max-h-[140px] text-white/90 drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
        fill="currentColor"
        aria-hidden
      >
        <title>Property illustration</title>
        <path
          d="M8 88V52h28v36H8zm32-20V40h34v48H40V68zm38 8V36h32v52H78V76zm36-12V44h30v44h-30V64zm34 4V48h28v40h-28V68z"
          opacity="0.95"
        />
        <path d="M22 52v8h4v-8h-4zm48-8v8h4v-8h-4zm40 4v8h4v-8h-4zm36 8v8h4v-8h-4zm34 4v8h4v-8h-4z" opacity="0.5" />
        <rect x="96" y="78" width="10" height="14" rx="1" opacity="0.55" />
        <rect x="52" y="72" width="8" height="16" rx="1" opacity="0.5" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 200 120"
      className="h-[78%] w-[88%] max-h-[150px] text-white/90 drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
      fill="currentColor"
      aria-hidden
    >
      <title>Property illustration</title>
      <path
        d="M12 92V28h32v64H12zm38-8V22h36v70H50V84zm40-4V18h34v74H90V80zm38 6V26h32v66h-32V86zm36-10V32h28v60h-28V76z"
        opacity="0.95"
      />
      <rect x="22" y="40" width="5" height="6" rx="0.5" opacity="0.45" />
      <rect x="22" y="50" width="5" height="6" rx="0.5" opacity="0.45" />
      <rect x="22" y="60" width="5" height="6" rx="0.5" opacity="0.45" />
      <rect x="60" y="36" width="5" height="6" rx="0.5" opacity="0.4" />
      <rect x="68" y="36" width="5" height="6" rx="0.5" opacity="0.4" />
      <rect x="100" y="32" width="5" height="6" rx="0.5" opacity="0.4" />
      <rect x="100" y="42" width="5" height="6" rx="0.5" opacity="0.4" />
      <rect x="138" y="38" width="5" height="6" rx="0.5" opacity="0.38" />
      <rect x="170" y="44" width="5" height="6" rx="0.5" opacity="0.38" />
      <rect x="104" y="88" width="14" height="12" rx="1" opacity="0.55" />
    </svg>
  )
}
