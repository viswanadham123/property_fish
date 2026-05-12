import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Listing } from './models.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function seedListingsFromJsonIfEmpty() {
  const count = await Listing.countDocuments()
  if (count > 0) return

  const storePath = path.join(__dirname, 'data', 'store.json')
  const raw = await fs.readFile(storePath, 'utf-8')
  const store = JSON.parse(raw)

  const docs = []

  for (const intent of ['buy', 'rent']) {
    const rows = store.listings?.[intent]
    if (!Array.isArray(rows)) continue

    for (const row of rows) {
      const { id: _drop, ...rest } = row
      docs.push({
        ...rest,
        intent,
        postedAt: rest.postedAt || new Date().toISOString(),
      })
    }
  }

  if (docs.length > 0) {
    await Listing.insertMany(docs)
    // eslint-disable-next-line no-console
    console.log(`Seeded ${docs.length} listings from store.json`)
  }
}
