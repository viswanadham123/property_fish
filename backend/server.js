import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { fileURLToPath } from 'node:url'

import { Listing, User, serializeListing } from './models.js'
import { seedListingsFromJsonIfEmpty } from './seed.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DIST_PATH = path.join(__dirname, '..', 'dist')

const PORT = Number(process.env.PORT || 4000)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const MONGODB_URI = process.env.MONGODB_URI
const DATABASE_NAME = process.env.MONGODB_DB_NAME || 'propertyfish'

function makeToken(user) {
  return jwt.sign({ sub: String(user._id), email: user.email }, JWT_SECRET, { expiresIn: '7d' })
}

function publicUser(user) {
  return {
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || '',
  }
}

async function start() {
  if (!MONGODB_URI) {
    // eslint-disable-next-line no-console
    console.error('Missing MONGODB_URI. Add it to your .env or Render environment.')
    process.exit(1)
  }

  await mongoose.connect(MONGODB_URI, {
    dbName: DATABASE_NAME,
  })
  // eslint-disable-next-line no-console
  console.log(`MongoDB connected (db: ${DATABASE_NAME})`)

  await seedListingsFromJsonIfEmpty()

  const corsOrigin = process.env.CORS_ORIGIN
  const app = express()
  app.use(cors(corsOrigin ? { origin: corsOrigin } : { origin: true }))
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, db: mongoose.connection.readyState === 1 })
  })

  app.get('/api/listings', async (_req, res) => {
    try {
      const docs = await Listing.find().sort({ relevanceScore: -1 })
      const buy = docs.filter((d) => d.intent === 'buy').map((d) => serializeListing(d))
      const rent = docs.filter((d) => d.intent === 'rent').map((d) => serializeListing(d))
      res.json({ buy, rent })
    } catch (error) {
      res.status(500).json({ message: 'Failed to load listings', error: String(error) })
    }
  })

  app.post('/api/listings', async (req, res) => {
    try {
      const { intent = 'buy', ...payload } = req.body
      if (!payload.title || !payload.location) {
        return res.status(400).json({ message: 'title and location are required' })
      }

      const record = {
        intent: intent === 'rent' ? 'rent' : 'buy',
        title: payload.title,
        agreementLabel:
          payload.agreementLabel ||
          `₹${Number(payload.agreementAmountINR || 0).toLocaleString('en-IN')} agreement details`,
        agreementAmountINR: Number(payload.agreementAmountINR || 0),
        description: payload.description || '',
        bathrooms: Number(payload.bathrooms || 1),
        parking: payload.parking || 'Available',
        highlights: Array.isArray(payload.highlights) ? payload.highlights : [],
        bhk: payload.bhk || '2 BHK',
        propertyType: payload.propertyType || 'Apartment',
        priceDisplay: payload.priceDisplay || 'Contact for price',
        imageTone: payload.imageTone || 'from-slate-700 to-slate-900',
        availability: payload.availability || 'immediate',
        furnishing: payload.furnishing || 'semi',
        tenants: Array.isArray(payload.tenants) ? payload.tenants : ['family'],
        propertyKinds: Array.isArray(payload.propertyKinds) ? payload.propertyKinds : ['apartment'],
        ownerVerified: Boolean(payload.ownerVerified),
        postedAt: new Date().toISOString(),
        relevanceScore: Number(payload.relevanceScore || 80),
      }

      const saved = await Listing.create(record)
      res.status(201).json(serializeListing(saved))
    } catch (error) {
      res.status(500).json({ message: 'Failed to create listing', error: String(error) })
    }
  })

  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { fullName, email, phone, password } = req.body
      if (!fullName || !email || !password) return res.status(400).json({ message: 'Missing required fields' })

      const existing = await User.findOne({ email: String(email).toLowerCase() })
      if (existing) return res.status(409).json({ message: 'Email already exists' })

      const passwordHash = await bcrypt.hash(password, 10)
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
      })
    } catch (error) {
      res.status(500).json({ message: 'Signup failed', error: String(error) })
    }
  })

  app.post('/api/auth/signin', async (req, res) => {
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
      })
    } catch (error) {
      res.status(500).json({ message: 'Signin failed', error: String(error) })
    }
  })

  app.use(express.static(DIST_PATH))
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(DIST_PATH, 'index.html'))
  })

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Server failed to start', err)
  process.exit(1)
})
