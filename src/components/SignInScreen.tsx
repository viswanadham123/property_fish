import { useState } from 'react'
import { signIn } from '../api/authApi'
import { useAuth } from '../context/AuthContext'
import { AuthSplitLayout } from './AuthSplitLayout'

type Props = {
  onGoToSignUp: () => void
  onAuthenticated?: () => void
}

const BULLETS = [
  'Passwords are stored using a strong one-way hash — we never keep your password in plain text.',
  'Use a unique password and keep your session private, especially on shared devices.',
  'Sign out when you are finished if others may use the same browser.',
]

export function SignInScreen({ onGoToSignUp, onAuthenticated }: Props) {
  const { login } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <AuthSplitLayout
      asideEyebrow="Welcome back"
      asideTitle="Sign in to unlock your Property Fish workspace"
      asideDescription="Sign in with the email you registered. Your password is sent only over HTTPS in production."
      bullets={BULLETS}
    >
      <div className="rounded-xl border border-border-subtle bg-surface p-6 shadow-[0_8px_30px_rgba(45,45,45,0.08)] sm:p-8">
        <h1 className="text-2xl font-bold text-ink">Sign in</h1>
        <p className="mt-1 text-sm text-ink-secondary">Enter your email and password to continue.</p>

        {submitted ? (
          <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
            Signed in successfully.
          </p>
        ) : null}

        {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}

        <form
          className="mt-6 space-y-4"
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
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium text-ink-secondary">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-secondary">
          New here?{' '}
          <button type="button" onClick={onGoToSignUp} className="font-semibold text-brand-600 hover:underline">
            Create an account
          </button>
        </p>
      </div>
    </AuthSplitLayout>
  )
}
