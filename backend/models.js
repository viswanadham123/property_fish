import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    /** User's city / area (not listing location). */
    location: { type: String, default: '' },
    profession: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    favoriteListingIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
      default: () => [],
    },
    passwordResetToken: { type: String, default: null, sparse: true, index: true },
    passwordResetExpires: { type: Date, default: null },
  },
  { timestamps: true },
)

const listingSchema = new mongoose.Schema(
  {
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    intent: { type: String, enum: ['buy', 'rent'], required: true, index: true },
  /** Shown internally / moderation only — included for owner on GET /api/me/listings for editing */
  contactName: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
    title: { type: String, required: true },
    agreementLabel: { type: String, default: '' },
    agreementAmountINR: { type: Number, default: 0 },
    description: { type: String, default: '' },
    location: { type: String, required: true },
    bathrooms: { type: Number, default: 1 },
    parking: { type: String, default: 'Available' },
    highlights: [{ type: String }],
    bhk: { type: String, default: '2 BHK' },
    propertyType: { type: String, default: 'Apartment' },
    priceDisplay: { type: String, default: 'Contact for price' },
    imageTone: { type: String, default: 'from-slate-700 to-slate-900' },
    availability: { type: String, default: 'immediate' },
    furnishing: { type: String, default: 'semi' },
    tenants: [{ type: String }],
    propertyKinds: [{ type: String }],
    ownerVerified: { type: Boolean, default: false },
    postedAt: { type: String, default: () => new Date().toISOString() },
    relevanceScore: { type: Number, default: 80 },
  },
  { timestamps: false },
)

export const User = mongoose.models.User || mongoose.model('User', userSchema)
export const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema)

export function serializeListing(doc) {
  const o = doc?.toObject?.({ depopulate: true }) ?? doc
  const contactName = o.contactName != null ? String(o.contactName).trim().slice(0, 120) : ''
  const contactPhone = o.contactPhone != null ? String(o.contactPhone).trim().slice(0, 40) : ''
  return {
    id: String(o._id),
    postedById: o.postedBy ? String(o.postedBy) : null,
    intent: o.intent === 'rent' ? 'rent' : 'buy',
    title: o.title,
    agreementLabel: o.agreementLabel,
    agreementAmountINR: o.agreementAmountINR,
    description: o.description,
    location: o.location,
    bathrooms: o.bathrooms,
    parking: o.parking,
    highlights: o.highlights || [],
    bhk: o.bhk,
    propertyType: o.propertyType,
    priceDisplay: o.priceDisplay,
    imageTone: o.imageTone,
    availability: o.availability,
    furnishing: o.furnishing,
    tenants: o.tenants || [],
    propertyKinds: o.propertyKinds || [],
    ownerVerified: o.ownerVerified,
    postedAt: o.postedAt,
    relevanceScore: o.relevanceScore,
    contactName,
    contactPhone,
  }
}

/** Same as public catalogue row plus contact fields (only for authenticated owner routes). */
export function serializeListingForOwner(doc) {
  return serializeListing(doc)
}
