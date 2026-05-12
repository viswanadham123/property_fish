import { useState } from 'react'
import { signUp } from '../api/authApi'

type Props = {
  onBackToListings: () => void
  onGoToSignIn: () => void
}

export function SignUpScreen({ onBackToListings, onGoToSignIn }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
      <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-ink">Create Account</h1>
        <p className="mt-1 text-sm text-ink-secondary">Sign up to post property, track leads, and manage listings.</p>

        {submitted ? (
          <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
            Account created successfully (demo flow).
          </p>
        ) : null}

        {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}

        <form
          className="mt-5 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const form = new FormData(e.currentTarget)
            const fullName = String(form.get('fullName') || '')
            const email = String(form.get('email') || '')
            const phone = String(form.get('phone') || '')
            const password = String(form.get('password') || '')

            setLoading(true)
            setError(null)
            try {
              await signUp({ fullName, email, phone, password })
              setSubmitted(true)
            } catch (err) {
              setSubmitted(false)
              setError(err instanceof Error ? err.message : 'Sign up failed')
            } finally {
              setLoading(false)
            }
          }}
        >
          <label className="block text-sm font-medium text-ink-secondary">
            Full Name
            <input
              name="fullName"
              required
              placeholder="Your name"
              className="mt-1 w-full rounded-md border border-border-subtle px-3 py-2.5 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium text-ink-secondary">
            Email
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="mt-1 w-full rounded-md border border-border-subtle px-3 py-2.5 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium text-ink-secondary">
            Mobile Number
            <input
              name="phone"
              required
              placeholder="+91 9XXXXXXXXX"
              className="mt-1 w-full rounded-md border border-border-subtle px-3 py-2.5 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium text-ink-secondary">
            Password
            <input
              name="password"
              type="password"
              required
              placeholder="Create password"
              className="mt-1 w-full rounded-md border border-border-subtle px-3 py-2.5 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <button type="button" onClick={onGoToSignIn} className="font-semibold text-brand-600 hover:underline">
            Already have an account? Sign in
          </button>
          <button type="button" onClick={onBackToListings} className="text-ink-secondary hover:text-ink">
            Back to listings
          </button>
        </div>
      </div>
    </div>
  )
}
