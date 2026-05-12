import { apiUrl } from '../lib/apiUrl'

const TOKEN_KEY = 'propertyfish_token'
const USER_KEY = 'propertyfish_user'

export type PublicUser = {
  id: string
  fullName: string
  email: string
  phone: string
}

type SignInPayload = {
  email: string
  password: string
}

type SignUpPayload = {
  fullName: string
  email: string
  phone: string
  password: string
}

export type AuthResponse = {
  token: string
  user: PublicUser
}

async function readError(response: Response, fallback: string) {
  const data = await response.json().catch(() => null)
  return data?.message || fallback
}

export function getStoredToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function saveStoredSession(token: string, user: PublicUser) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function authHeaders(): HeadersInit {
  const t = getStoredToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export async function fetchMe(signal?: AbortSignal): Promise<{ user: PublicUser }> {
  const response = await fetch(apiUrl('/api/auth/me'), {
    headers: { ...authHeaders() },
    signal,
  })

  if (!response.ok) {
    throw new Error(await readError(response, 'Session expired'))
  }

  return response.json()
}

export async function signIn(payload: SignInPayload): Promise<AuthResponse> {
  const response = await fetch(apiUrl('/api/auth/signin'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await readError(response, 'Sign in failed'))
  }

  return response.json()
}

export async function signUp(payload: SignUpPayload): Promise<AuthResponse> {
  const response = await fetch(apiUrl('/api/auth/signup'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await readError(response, 'Sign up failed'))
  }

  return response.json()
}
