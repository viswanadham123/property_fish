import { apiUrl } from '../lib/apiUrl'

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

async function readError(response: Response, fallback: string) {
  const data = await response.json().catch(() => null)
  return data?.message || fallback
}

export async function signIn(payload: SignInPayload) {
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

export async function signUp(payload: SignUpPayload) {
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
