import { useState } from 'react'
import { toast } from 'sonner'
import { signUp } from '../api/authApi'
import { useAuth } from '../features/auth/useAuth'
import { AuthSplitLayout } from './AuthSplitLayout'
import { PasswordField } from './PasswordField'

type Props = {
  onGoToSignIn: () => void
  onAuthenticated?: () => void
}

const BULLETS = [
  'Choose a strong password (at least 10 characters). It is hashed before it ever touches storage.',
  'Properties you post are tied to your account so only you can edit them.',
  'We recommend a unique password for this site and signing out on shared computers.',
]

export function SignUpScreen({ onGoToSignIn, onAuthenticated }: Props) {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  return (
    <AuthSplitLayout
      asideEyebrow="Join Property Fish"
      asideTitle="List and discover homes across top cities"
      asideDescription="Create an account to post properties. Passwords must be at least 10 characters and are stored securely on the server."
      bullets={BULLETS}
    >
      <div className="rounded-xl border border-border-subtle bg-surface p-6 shadow-[0_8px_30px_rgba(45,45,45,0.08)] sm:p-8">
        <h1 className="text-2xl font-bold text-ink">Create account</h1>
        <p className="mt-1 text-sm text-ink-secondary">Fill in your details to register — then you can post right away.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const form = new FormData(e.currentTarget)
            const fullName = String(form.get('fullName') || '')
            const email = String(form.get('email') || '')
            const phone = String(form.get('phone') || '')
            const password = String(form.get('password') || '')

            setLoading(true)
            try {
              const data = await signUp({ fullName, email, phone, password })
              login(data.token, data.user, data.favoriteListingIds)
              toast.success('Account created. You are signed in.')
              onAuthenticated?.()
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Sign up failed')
            } finally {
              setLoading(false)
            }
          }}
        >
          <label className="block text-sm font-medium text-ink-secondary">
            Full name
            <input
              name="fullName"
              required
              autoComplete="name"
              placeholder="Your name"
              className="mt-1.5 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
            />
          </label>
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
            Mobile number
            <input
              name="phone"
              required
              autoComplete="tel"
              placeholder="+91 9XXXXXXXXX"
              className="mt-1.5 w-full rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium text-ink-secondary">
            Password
            <PasswordField
              name="password"
              required
              minLength={10}
              autoComplete="new-password"
              placeholder="At least 10 characters"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-secondary">
          Already registered?{' '}
          <button type="button" onClick={onGoToSignIn} className="font-semibold text-brand-600 hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </AuthSplitLayout>
  )
}
