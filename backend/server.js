import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'node:fs/promises'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { fileURLToPath } from 'node:url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const STORE_PATH = path.join(__dirname, 'data', 'store.json')
const DIST_PATH = path.join(__dirname, '..', 'dist')
const PORT = Number(process.env.PORT || 4000)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))

async function readStore() {
  const raw = await fs.readFile(STORE_PATH, 'utf-8')
  return JSON.parse(raw)
}

async function writeStore(store) {
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8')
}

function makeToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/listings', async (_req, res) => {
  try {
    const store = await readStore()
    res.json(store.listings)
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

    const store = await readStore()
    const record = {
      id: `${intent}-${Date.now()}`,
      agreementLabel: payload.agreementLabel || `₹${Number(payload.agreementAmountINR || 0).toLocaleString('en-IN')} agreement details`,
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
      ...payload,
    }

    if (!store.listings[intent]) store.listings[intent] = []
    store.listings[intent].unshift(record)
    await writeStore(store)

    res.status(201).json(record)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create listing', error: String(error) })
  }
})

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body
    if (!fullName || !email || !password) return res.status(400).json({ message: 'Missing required fields' })

    const store = await readStore()
    const exists = store.users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())
    if (exists) return res.status(409).json({ message: 'Email already exists' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = {
      id: `user-${Date.now()}`,
      fullName,
      email,
      phone: phone || '',
      passwordHash,
      createdAt: new Date().toISOString(),
    }
    store.users.push(user)
    await writeStore(store)

    const token = makeToken(user)
    res.status(201).json({
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone },
    })
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: String(error) })
  }
})

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })

    const store = await readStore()
    const user = store.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase())
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

    const token = makeToken(user)
    res.json({
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone },
    })
  } catch (error) {
    res.status(500).json({ message: 'Signin failed', error: String(error) })
  }
})

// Serve built frontend from the same service in production.
app.use(express.static(DIST_PATH))
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'))
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server running on http://localhost:${PORT}`)
})
