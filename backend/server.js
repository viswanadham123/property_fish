import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { fileURLToPath } from 'node:url'

import { Listing, User, serializeListing, serializeListingForOwner } from './models.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DIST_PATH = path.join(__dirname, '..', 'dist')

const HOST = process.env.HOST || '0.0.0.0'
const PORT = Number(process.env.PORT || 4000)
const isProduction = process.env.NODE_ENV === 'production'
const JWT_SECRET_RAW = (process.env.JWT_SECRET || '').trim()
const JWT_SECRET = JWT_SECRET_RAW || (!isProduction ? 'dev-secret-change-me' : '')

if (isProduction) {
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    // eslint-disable-next-line no-console
    console.error('Production requires JWT_SECRET (random string, at least 32 characters).')
    process.exit(1)
  }
}

const MONGODB_URI = (process.env.MONGODB_URI || '').trim()
const DATABASE_NAME = process.env.MONGODB_DB_NAME || 'propertyfish'

/** Do not leak stack traces or DB errors to API clients in production. */
function send500(res, message, error) {
  if (error) {
    // eslint-disable-next-line no-console
    console.error(message, error)
  }
  if (!isProduction && error != null) {
    return res.status(500).json({ message, error: String(error) })
  }
  return res.status(500).json({ message })
}

function makeToken(user) {
  return jwt.sign({ sub: String(user._id), email: user.email }, JWT_SECRET, { expiresIn: '7d' })
}

function publicUser(user) {
  return {
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || '',
    location: user.location || '',
    profession: user.profession || '',
  }
}

function parseBearer(req) {
  const raw = req.headers.authorization
  if (!raw || typeof raw !== 'string' || !raw.startsWith('Bearer ')) return null
  return raw.slice('Bearer '.length).trim()
}

function jwtSubjectFromRequest(req) {
  const token = parseBearer(req)
  if (!token) return null
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const sub = payload?.sub
    return sub ? String(sub) : null
  } catch {
    return null
  }
}

/** Origins in CORS_ORIGIN: comma and/or space separated, e.g. https://app.com,http://localhost:5174 */
function corsOptionsFromEnv() {
  const raw = process.env.CORS_ORIGIN
  if (!raw?.trim()) {
    if (isProduction) {
      // eslint-disable-next-line no-console
      console.warn(
        'CORS_ORIGIN is unset — any browser origin can call this API. Set CORS_ORIGIN to your frontend URL(s) for production.',
      )
    }
    return { origin: true }
  }
  const allowed = raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  return {
    origin(origin, cb) {
      if (!origin) return cb(null, true)
      if (allowed.includes(origin)) return cb(null, true)
      cb(null, false)
    },
  }
}

function favoriteListingIdsForResponse(user) {
  return (user.favoriteListingIds || []).map((id) => String(id))
}

async function requireAuth(req, res, next) {
  const sub = jwtSubjectFromRequest(req)
  if (!sub) return res.status(401).json({ message: 'Sign in required' })
  try {
    const user = await User.findById(sub)
    if (!user) return res.status(401).json({ message: 'Invalid session' })
    req.accountUser = user
    next()
  } catch (error) {
    send500(res, 'Auth check failed', error)
  }
}

async function start() {
  if (!MONGODB_URI) {
    // eslint-disable-next-line no-console
    console.error('Missing MONGODB_URI.')
    // eslint-disable-next-line no-console
    console.error(
      'Local: set MONGODB_URI in a .env file next to package.json. Render: Dashboard → this Web Service → Environment → add MONGODB_URI (the repo .env file is not deployed).',
    )
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DATABASE_NAME,
      serverSelectionTimeoutMS: 15_000,
      connectTimeoutMS: 15_000,
    })
    // eslint-disable-next-line no-console
    console.log(`MongoDB connected (db: ${DATABASE_NAME})`)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection failed:', err instanceof Error ? err.message : String(err))
    // eslint-disable-next-line no-console
    console.error(
      'Fix: set MONGODB_URI on Render → Environment. In Atlas → Network Access, allow 0.0.0.0/0 (or your egress IP) while testing.',
    )
    process.exit(1)
  }

  const app = express()
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  )
  app.use(cors(corsOptionsFromEnv()))
  app.use(express.json({ limit: '1mb' }))

  const signUpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many signup attempts from this network. Try again later.' },
  })
  const signInLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many sign-in attempts from this network. Try again later.' },
  })

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, db: mongoose.connection.readyState === 1 })
  })

  app.get('/api/auth/me', async (req, res) => {
    const sub = jwtSubjectFromRequest(req)
    if (!sub) return res.status(401).json({ message: 'Not signed in' })

    try {
      const user = await User.findById(sub)
      if (!user) return res.status(401).json({ message: 'Session no longer valid' })
      res.json({
        user: publicUser(user),
        favoriteListingIds: favoriteListingIdsForResponse(user),
      })
    } catch (error) {
      send500(res, 'Could not load account', error)
    }
  })

  const PROFILE_STRING_MAX = 200

  app.patch('/api/me/profile', requireAuth, async (req, res) => {
    try {
      const body = req.body || {}
      const updates = {}

      if (body.fullName !== undefined) {
        const v = String(body.fullName || '').trim()
        if (!v) return res.status(400).json({ message: 'Full name cannot be empty' })
        updates.fullName = v.slice(0, 120)
      }
      if (body.phone !== undefined) {
        updates.phone = String(body.phone || '').trim().slice(0, 40)
      }
      if (body.location !== undefined) {
        updates.location = String(body.location || '').trim().slice(0, PROFILE_STRING_MAX)
      }
      if (body.profession !== undefined) {
        updates.profession = String(body.profession || '').trim().slice(0, PROFILE_STRING_MAX)
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No profile fields to update' })
      }

      Object.assign(req.accountUser, updates)
      await req.accountUser.save()
      const fresh = await User.findById(req.accountUser._id)
      res.json({ user: publicUser(fresh) })
    } catch (error) {
      send500(res, 'Could not update profile', error)
    }
  })

  app.get('/api/listings', async (_req, res) => {
    try {
      const docs = await Listing.find().sort({ relevanceScore: -1 })
      const buy = docs.filter((d) => d.intent === 'buy').map((d) => serializeListing(d))
      const rent = docs.filter((d) => d.intent === 'rent').map((d) => serializeListing(d))
      res.json({ buy, rent })
    } catch (error) {
      send500(res, 'Failed to load listings', error)
    }
  })

  /** Single listing (same JSON shape as catalogue rows, including contact fields). */
  app.get('/api/listings/:listingId', async (req, res) => {
    try {
      const listingId = String(req.params.listingId || '').trim()
      if (!listingId || !mongoose.isValidObjectId(listingId)) {
        return res.status(400).json({ message: 'Valid listing id is required' })
      }
      const doc = await Listing.findById(listingId)
      if (!doc) return res.status(404).json({ message: 'Listing not found' })
      res.json(serializeListing(doc))
    } catch (error) {
      send500(res, 'Failed to load listing', error)
    }
  })

  app.post('/api/listings', requireAuth, async (req, res) => {
    try {
      const { intent = 'buy', ...payload } = req.body
      const location = String(payload.location || '').trim()
      if (!payload.title || !location) {
        return res.status(400).json({ message: 'title and location are required' })
      }

      const record = {
        postedBy: req.accountUser._id,
        intent: intent === 'rent' ? 'rent' : 'buy',
        contactName: String(payload.contactName || '').slice(0, 120),
        contactPhone: String(payload.contactPhone || '').slice(0, 40),
        title: payload.title,
        location,
        agreementLabel:
          payload.agreementLabel ||
          `₹${Number(payload.agreementAmountINR || 0).toLocaleString('en-IN')} agreement details`,
        agreementAmountINR: Number(payload.agreementAmountINR || 0),
        description: payload.description || '',
        bathrooms: Number(payload.bathrooms || 1),
        parking: payload.parking || 'Available',
        highlights: Array.isArray(payload.highlights)
          ? payload.highlights.map((h) => String(h).slice(0, 120)).slice(0, 20)
          : [],
        bhk: payload.bhk || '2 BHK',
        propertyType: payload.propertyType || 'Apartment',
        priceDisplay: payload.priceDisplay || 'Contact for price',
        imageTone: payload.imageTone || 'from-slate-700 to-slate-900',
        availability: payload.availability || 'immediate',
        furnishing: payload.furnishing || 'semi',
        tenants: Array.isArray(payload.tenants) ? payload.tenants : ['family'],
        propertyKinds: Array.isArray(payload.propertyKinds) ? payload.propertyKinds : ['apartment'],
        ownerVerified: false,
        postedAt: new Date().toISOString(),
        relevanceScore: 80,
      }

      const saved = await Listing.create(record)
      res.status(201).json(serializeListing(saved))
    } catch (error) {
      send500(res, 'Failed to create listing', error)
    }
  })

  app.post('/api/auth/signup', signUpLimiter, async (req, res) => {
    try {
      const { fullName, email, phone, password } = req.body
      if (!fullName || !email || !password) return res.status(400).json({ message: 'Missing required fields' })
      const pwd = String(password)
      if (pwd.length < 10) {
        return res.status(400).json({ message: 'Password must be at least 10 characters' })
      }

      const existing = await User.findOne({ email: String(email).toLowerCase() })
      if (existing) return res.status(409).json({ message: 'Email already exists' })

      const passwordHash = await bcrypt.hash(pwd, 12)
      const user = await User.create({
        fullName,
        email: String(email).toLowerCase(),
        phone: phone || '',
        passwordHash,
      })

      const token = makeToken(user)
      res.status(201).json({
        token,
        user: publicUser(user),
        favoriteListingIds: favoriteListingIdsForResponse(user),
      })
    } catch (error) {
      send500(res, 'Signup failed', error)
    }
  })

  app.post('/api/auth/signin', signInLimiter, async (req, res) => {
    try {
      const { email, password } = req.body
      if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })

      const user = await User.findOne({ email: String(email).toLowerCase() })
      if (!user) return res.status(401).json({ message: 'Invalid credentials' })

      const ok = await bcrypt.compare(password, user.passwordHash)
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

      const token = makeToken(user)
      res.json({
        token,
        user: publicUser(user),
        favoriteListingIds: favoriteListingIdsForResponse(user),
      })
    } catch (error) {
      send500(res, 'Signin failed', error)
    }
  })

  app.get('/api/me/favorites', requireAuth, async (req, res) => {
    try {
      const user = await User.findById(req.accountUser._id).lean()
      const ids = user.favoriteListingIds || []
      if (ids.length === 0) return res.json({ listings: [] })

      const docs = await Listing.find({ _id: { $in: ids } }).lean()
      const byId = new Map(docs.map((d) => [String(d._id), d]))
      const ordered = ids.map((id) => byId.get(String(id))).filter(Boolean).map((d) => serializeListing(d))
      res.json({ listings: ordered })
    } catch (error) {
      send500(res, 'Failed to load favorites', error)
    }
  })

  /** Listings this user posted while authenticated (`postedBy` = you). Includes contact fields for editing. */
  app.get('/api/me/listings', requireAuth, async (req, res) => {
    try {
      const uid = req.accountUser._id
      const docs = await Listing.find({ postedBy: uid }).sort({ relevanceScore: -1 }).lean()
      const buy = docs.filter((d) => d.intent === 'buy').map((d) => serializeListingForOwner(d))
      const rent = docs.filter((d) => d.intent === 'rent').map((d) => serializeListingForOwner(d))
      res.json({ buy, rent })
    } catch (error) {
      send500(res, 'Failed to load your listings', error)
    }
  })

  app.patch('/api/me/listings/:listingId', requireAuth, async (req, res) => {
    try {
      const listingId = String(req.params.listingId || '').trim()
      if (!listingId || !mongoose.isValidObjectId(listingId)) {
        return res.status(400).json({ message: 'Valid listing id is required' })
      }

      const doc = await Listing.findById(listingId)
      if (!doc) return res.status(404).json({ message: 'Listing not found' })
      if (!doc.postedBy || String(doc.postedBy) !== String(req.accountUser._id)) {
        return res.status(403).json({ message: 'You can only edit your own listings' })
      }

      const payload = req.body || {}

      if (payload.intent !== undefined) {
        doc.intent = payload.intent === 'rent' ? 'rent' : 'buy'
      }
      if (payload.title !== undefined) doc.title = String(payload.title || '').trim().slice(0, 200)
      if (payload.location !== undefined) doc.location = String(payload.location || '').trim().slice(0, 300)
      if (payload.description !== undefined) doc.description = String(payload.description || '').slice(0, 8000)
      if (payload.contactName !== undefined) doc.contactName = String(payload.contactName || '').slice(0, 120)
      if (payload.contactPhone !== undefined) doc.contactPhone = String(payload.contactPhone || '').slice(0, 40)
      if (payload.propertyType !== undefined) doc.propertyType = String(payload.propertyType || 'Apartment').slice(0, 80)
      if (payload.bhk !== undefined) doc.bhk = String(payload.bhk || '2 BHK').slice(0, 40)
      if (payload.availability !== undefined) doc.availability = String(payload.availability || 'immediate')
      if (payload.bathrooms !== undefined) doc.bathrooms = Number(payload.bathrooms || 1)
      if (payload.parking !== undefined) doc.parking = String(payload.parking || 'Available').slice(0, 80)
      if (Array.isArray(payload.highlights)) doc.highlights = payload.highlights.map((h) => String(h).slice(0, 120)).slice(0, 20)
      if (payload.priceDisplay !== undefined) doc.priceDisplay = String(payload.priceDisplay || '').slice(0, 120)
      if (payload.imageTone !== undefined) doc.imageTone = String(payload.imageTone || '').slice(0, 80)
      if (payload.furnishing !== undefined) doc.furnishing = String(payload.furnishing || 'semi')
      if (Array.isArray(payload.tenants)) doc.tenants = payload.tenants.map((t) => String(t)).slice(0, 10)
      if (Array.isArray(payload.propertyKinds)) doc.propertyKinds = payload.propertyKinds.map((t) => String(t)).slice(0, 10)

      if (payload.agreementAmountINR !== undefined) {
        doc.agreementAmountINR = Number(payload.agreementAmountINR || 0)
      }
      if (payload.agreementLabel !== undefined) {
        doc.agreementLabel = String(payload.agreementLabel || '').slice(0, 200)
      } else if (payload.agreementAmountINR !== undefined) {
        doc.agreementLabel = `₹${doc.agreementAmountINR.toLocaleString('en-IN')} agreement details`
      }

      if (!doc.title || !doc.location) {
        return res.status(400).json({ message: 'title and location are required' })
      }

      await doc.save()
      res.json(serializeListing(doc))
    } catch (error) {
      send500(res, 'Failed to update listing', error)
    }
  })

  app.post('/api/me/favorites', requireAuth, async (req, res) => {
    try {
      const listingId = String(req.body?.listingId || '').trim()
      if (!listingId || !mongoose.isValidObjectId(listingId)) {
        return res.status(400).json({ message: 'Valid listingId is required' })
      }
      const exists = await Listing.exists({ _id: listingId })
      if (!exists) return res.status(404).json({ message: 'Listing not found' })

      await User.updateOne({ _id: req.accountUser._id }, { $addToSet: { favoriteListingIds: listingId } })
      const updated = await User.findById(req.accountUser._id)
      res.json({ favoriteListingIds: favoriteListingIdsForResponse(updated) })
    } catch (error) {
      send500(res, 'Failed to save favorite', error)
    }
  })

  app.delete('/api/me/favorites/:listingId', requireAuth, async (req, res) => {
    try {
      const listingId = String(req.params.listingId || '').trim()
      if (!listingId || !mongoose.isValidObjectId(listingId)) {
        return res.status(400).json({ message: 'Valid listingId is required' })
      }
      await User.updateOne({ _id: req.accountUser._id }, { $pull: { favoriteListingIds: listingId } })
      const updated = await User.findById(req.accountUser._id)
      res.json({ favoriteListingIds: favoriteListingIdsForResponse(updated) })
    } catch (error) {
      send500(res, 'Failed to remove favorite', error)
    }
  })

  app.use(express.static(DIST_PATH))
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(DIST_PATH, 'index.html'))
  })

  app.listen(PORT, HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on ${HOST}:${PORT}`)
  })
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Server failed to start', err)
  process.exit(1)
})
