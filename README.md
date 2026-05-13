# Property Fish 

Property Fish is a full-stack web app for browsing, searching, and posting residential properties (buy and rent). The UI is branded around **properties** (not generic “listings”). Signed-in users can favorite properties, manage their profile, post new properties, and edit their own posts.

---

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| State | Redux Toolkit + React Redux (auth bootstrap and session UX) |
| Backend | Node.js (ES modules), Express 5 |
| Database | MongoDB via Mongoose |
| Auth | JWT (`Bearer` token), bcrypt password hashing |

---

## Features

- **Browse** sale and rent catalogues with filters (BHK, locality chips, furnishing, tenants, availability, etc.), sort options, list/map toggle placeholder.
- **Authentication**: sign up, sign in, sign out; session persisted in `localStorage`; optional `/api/auth/me` refresh on load.
- **Forgot password**: rate-limited `POST /api/auth/forgot-password` and `POST /api/auth/reset-password`; in development the API may return `devResetUrl`; production relies on configurable app URL (`PUBLIC_APP_URL` / `FRONTEND_URL`) for reset links until email is integrated.
- **Profile**: edit contact details; **Favorites**; **My properties** (posted while signed in) with edit flow.
- **Post / edit property** form with validation and catalogue refresh after changes.
- **Catalogue loading** after login (guests do not fetch the public catalogue until authenticated).

---

## Requirements

- **Node.js** `>=20 <25` (see `package.json` → `engines`)
- **MongoDB** cluster or local instance (connection string compatible with Mongoose)

---

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the examples and edit values (never commit real secrets):

```bash
copy .env.example .env
```

See **Environment variables** below for meaning of each key. At minimum you need `MONGODB_URI`, `JWT_SECRET` (non-empty in development; length ≥ 32 in production), `CORS_ORIGIN`, and frontend `VITE_API_BASE_URL` pointing at your API unless you run a single-origin deployment.

### 3. Run in development (two processes)

Terminal A — API (default port **4000**):

```bash
npm run server
```

Terminal B — Vite dev server (default port **5173**):

```bash
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`). Ensure `CORS_ORIGIN` includes that origin.

### 4. Production build

```bash
npm run build
npm run server
```

After `npm run build`, `backend/server.js` serves static files from `dist/` and falls back to `index.html` for SPA routes (except paths starting with `/api`). With an empty `VITE_API_BASE_URL`, the browser uses **same-origin** URLs for `/api/*`, which matches this single-service setup.

Preview the built front end only (no API):

```bash
npm run preview
```

---

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Vite development server |
| `npm run build` | TypeScript check + production bundle to `dist/` |
| `npm run preview` | Serve `dist/` via Vite preview |
| `npm run server` / `npm start` | Start Express API (+ static `dist/` if present) |

---

## Environment variables

### Frontend (Vite — prefix `VITE_`)

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Absolute API base URL, e.g. `http://localhost:4000`. Omit or leave empty when the API is served from the **same** origin as the SPA (combined deploy). |

### Backend

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port (default `4000`) |
| `HOST` | Bind address (default `0.0.0.0`) |
| `NODE_ENV` | Set to `production` for strict JWT enforcement and sanitized 500 responses |
| `JWT_SECRET` or `SESSION_SECRET` | Signing key for JWTs; **required** in production, minimum **32** characters |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB_NAME` | Database name (default `propertyfish`) |
| `CORS_ORIGIN` | Allowed browser origins (comma or space separated); include every frontend URL that calls this API |
| `PUBLIC_APP_URL` or `FRONTEND_URL` | Public web app origin (no trailing slash) for password-reset links in non-email flows |

See `.env.example` and `.env.production.example` for split hosting notes (e.g. separate frontend/backend services).

---

## API overview (high level)

All JSON APIs are under `/api`. Examples:

- `POST /api/auth/signup`, `POST /api/auth/sign-in`, `GET /api/auth/me`
- `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- `GET /api/listings` — full catalogue (`buy` / `rent`). The SPA loads this only **after** sign-in (product choice); the route itself is currently public on the server.
- `GET /api/listings/:id` — property detail
- `POST /api/listings` — create (authenticated)
- `GET /api/me/listings`, `PATCH /api/me/listings/:id` — owned properties
- `GET /api/me/favorites`, `POST /api/me/favorites`, `DELETE /api/me/favorites/:id`

Refer to `backend/server.js` and `backend/models.js` for exact payloads and behavior.

---

## Project structure

```
best-infra/
├── backend/           # Express app, Mongoose models
│   ├── server.js
│   └── models.js
├── src/
│   ├── api/           # fetch helpers (auth, listings, favorites)
│   ├── components/    # UI screens and layout
│   ├── features/auth/ # Redux auth slice, bootstrap, useAuth hook
│   ├── store/         # Redux store and typed hooks
│   ├── lib/           # apiUrl, filters, formatting
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── dist/              # produced by npm run build (served by Express)
├── index.html
├── vite.config.ts
└── package.json
```

---

## Security notes

- Use a long, random `JWT_SECRET` (or `SESSION_SECRET`) in production; the server exits on boot if the secret is missing or too short when `NODE_ENV=production`.
- Do not commit `.env` files; use platform secret stores in production.
- Password reset emails are not wired in all environments; configure `PUBLIC_APP_URL` / `FRONTEND_URL` so reset links target the correct SPA origin.

---

## License

Private project (`"private": true` in `package.json`). Adjust if you open-source the repository.
