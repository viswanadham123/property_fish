import { useState } from 'react'
import { signIn } from '../api/authApi'
import { useAuth } from '../context/AuthContext'

type Props = {
  onBackToListings: () => void
  onGoToSignUp: () => void
  onAuthenticated?: () => void
}

export function SignInScreen({ onBackToListings, onGoToSignUp, onAuthenticated }: Props) {
  const { login } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
      <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-ink">Sign In</h1>
        <p className="mt-1 text-sm text-ink-secondary">Access your listings, leads, and property dashboards.</p>

        {submitted ? (
          <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
            Signed in successfully.
          </p>
        ) : null}

        {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}

        <form
          className="mt-5 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const form = new FormData(e.currentTarget)
            const email = String(form.get('email') || '')
            const password = String(form.get('password') || '')

            setLoading(true)
            setError(null)
            try {
              const data = await signIn({ email, password })
              login(data.token, data.user, data.favoriteListingIds)
              setSubmitted(true)
              onAuthenticated?.()
            } catch (err) {
              setSubmitted(false)
              setError(err instanceof Error ? err.message : 'Sign in failed')
            } finally {
              setLoading(false)
            }
          }}
        >
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
            Password
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="mt-1 w-full rounded-md border border-border-subtle px-3 py-2.5 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <button type="button" onClick={onGoToSignUp} className="font-semibold text-brand-600 hover:underline">
            Create account
          </button>
          <button type="button" onClick={onBackToListings} className="text-ink-secondary hover:text-ink">
            Back to listings
          </button>
        </div>
      </div>
    </div>
  )
}
