import { useState } from 'react'
import { toast } from 'sonner'
import { resetPassword } from '../api/authApi'
import { AuthSplitLayout } from './AuthSplitLayout'
import { PasswordField } from './PasswordField'

type Props = {
  token: string
  onSuccess: () => void
  onBack: () => void
}

const BULLETS = [
  'Choose a new password with at least 10 characters.',
  'After saving, your old password stops working immediately.',
  'This link can only be used once and expires after one hour.',
]

export function ResetPasswordScreen({ token, onSuccess, onBack }: Props) {
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <AuthSplitLayout
      asideEyebrow="Set a new password"
      asideTitle="Choose a new password"
      asideDescription="Use a strong password you have not used on other sites."
      bullets={BULLETS}
    >
      <div className="rounded-xl border border-border-subtle bg-surface p-6 shadow-[0_8px_30px_rgba(45,45,45,0.08)] sm:p-8">
        <h1 className="text-2xl font-bold text-ink">New password</h1>
        <p className="mt-1 text-sm text-ink-secondary">Enter and confirm your new password.</p>

        {done ? (
          <div className="mt-4 rounded-md border border-border-subtle bg-surface-muted px-3 py-3 text-sm text-ink">
            <p className="font-medium">Your password was updated. You can sign in now.</p>
            <button type="button" onClick={onSuccess} className="mt-3 font-semibold text-brand-700 hover:underline">
              Go to sign in
            </button>
          </div>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              const form = new FormData(e.currentTarget)
              const password = String(form.get('password') || '')
              const confirm = String(form.get('passwordConfirm') || '')
              if (password !== confirm) {
                toast.error('Passwords do not match')
                return
              }
              setLoading(true)
              try {
                await resetPassword({ token, password })
                setDone(true)
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Reset failed')
              } finally {
                setLoading(false)
              }
            }}
          >
            <label className="block text-sm font-medium text-ink-secondary">
              New password
              <PasswordField
                name="password"
                required
                minLength={10}
                autoComplete="new-password"
                placeholder="At least 10 characters"
              />
            </label>
            <label className="block text-sm font-medium text-ink-secondary">
              Confirm password
              <PasswordField
                name="passwordConfirm"
                required
                minLength={10}
                autoComplete="new-password"
                placeholder="Repeat password"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Saving…' : 'Save new password'}
            </button>
          </form>
        )}

        {!done ? (
          <p className="mt-6 text-center text-sm text-ink-secondary">
            <button type="button" onClick={onBack} className="font-semibold text-brand-600 hover:underline">
              Cancel
            </button>
          </p>
        ) : null}
      </div>
    </AuthSplitLayout>
  )
}
