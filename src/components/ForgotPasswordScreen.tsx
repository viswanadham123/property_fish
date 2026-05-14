import { useState } from 'react'
import { toast } from 'sonner'
import { requestPasswordReset } from '../api/authApi'
import { AuthSplitLayout } from './AuthSplitLayout'

type Props = {
  onBackToSignIn: () => void
}

const BULLETS = [
  'We only send reset links to the email on file — we never confirm whether an address exists in the public response.',
  'Reset links expire after one hour for your security.',
  'After you set a new password, sign in with it on any device.',
]

export function ForgotPasswordScreen({ onBackToSignIn }: Props) {
  const [sent, setSent] = useState(false)
  const [devLink, setDevLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <AuthSplitLayout
      asideEyebrow="Account recovery"
      asideTitle="Forgot your password?"
      asideDescription="Enter the email you used to register. If it matches an account, you can set a new password from the link we provide."
      bullets={BULLETS}
    >
      <div className="rounded-xl border border-border-subtle bg-surface p-6 shadow-[0_8px_30px_rgba(45,45,45,0.08)] sm:p-8">
        <h1 className="text-2xl font-bold text-ink">Reset password</h1>
        <p className="mt-1 text-sm text-ink-secondary">We will email instructions when email delivery is configured.</p>

        {sent ? (
          <div className="mt-4 space-y-3 rounded-md border border-border-subtle bg-surface-muted px-3 py-3 text-sm text-ink">
            <p className="font-medium text-ink">Request received.</p>
            <p className="text-ink-secondary">
              If that email is registered, follow the link to choose a new password. The link expires in one hour.
            </p>
            {devLink ? (
              <div className="rounded-md bg-white/80 p-3 ring-1 ring-emerald-200">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Development only</p>
                <p className="mt-1 break-all text-xs text-ink-secondary">Open this in your browser:</p>
                <a href={devLink} className="mt-1 block break-all text-sm font-semibold text-brand-700 underline">
                  {devLink}
                </a>
              </div>
            ) : null}
            <button
              type="button"
              onClick={onBackToSignIn}
              className="text-sm font-semibold text-brand-700 hover:underline"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              const form = new FormData(e.currentTarget)
              const email = String(form.get('email') || '').trim()
              setLoading(true)
              try {
                const data = await requestPasswordReset(email)
                setDevLink(data.devResetUrl ?? null)
                setSent(true)
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Something went wrong')
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
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        {!sent ? (
          <p className="mt-6 text-center text-sm text-ink-secondary">
            <button type="button" onClick={onBackToSignIn} className="font-semibold text-brand-600 hover:underline">
              Back to sign in
            </button>
          </p>
        ) : null}
      </div>
    </AuthSplitLayout>
  )
}
