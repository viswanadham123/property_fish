import { useState } from 'react'
import { signIn } from '../api/authApi'
import { useAuth } from '../features/auth/useAuth'
import { AuthSplitLayout } from './AuthSplitLayout'
import { PasswordField } from './PasswordField'

type Props = {
  onGoToSignUp: () => void
  onForgotPassword?: () => void
  onAuthenticated?: () => void
}

const BULLETS = [
  'Browse buy and rent properties with filters for BHK, locality, furnishing, and more.',
  'Save favorites to your account and pick up your shortlist on any device.',
  'Post or edit your own properties and manage enquiries from one place.',
  'Passwords are hashed securely; use HTTPS in production and sign out on shared computers.',
]

export function SignInScreen({ onGoToSignUp, onForgotPassword, onAuthenticated }: Props) {
  const { login } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <AuthSplitLayout
      asideEyebrow="Welcome back"
      asideTitle="Sign in to explore and manage properties"
      asideDescription="Use the email you registered with Property Fish. After you sign in you can search the catalogue, save favorites, and post or update your properties."
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
            <PasswordField
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>
          {onForgotPassword ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm font-semibold text-brand-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          ) : null}
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
