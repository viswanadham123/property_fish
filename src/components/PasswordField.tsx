import { useState } from 'react'

type Props = {
  name: string
  autoComplete: string
  required?: boolean
  minLength?: number
  placeholder?: string
}

/** Open eye: password is hidden (masked); click to reveal. */
function IconEyeOpen() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  )
}

/** Slashed eye: password is visible as plain text; click to hide. */
function IconEyeOff() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  )
}

export function PasswordField({ name, autoComplete, required, minLength, placeholder }: Props) {
  const [maskPassword, setMaskPassword] = useState(true)

  return (
    <div className="relative mt-1.5">
      <input
        name={name}
        type={maskPassword ? 'password' : 'text'}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-md border border-border-subtle bg-surface py-2.5 pr-11 pl-3 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-600/25 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => setMaskPassword((m) => !m)}
        className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40"
        aria-label={maskPassword ? 'Show password' : 'Hide password'}
        aria-pressed={!maskPassword}
      >
        {maskPassword ? <IconEyeOpen /> : <IconEyeOff />}
      </button>
    </div>
  )
}
