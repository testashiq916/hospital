import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/Misc'
import { extractErrorMessage } from '@/api/client'

const DEMO_ACCOUNTS = [
  { role: 'Super admin', email: 'superadmin@demo-hms.test' },
  { role: 'Hospital admin', email: 'admin@demo-hms.test' },
  { role: 'Doctor', email: 'doctor@demo-hms.test' },
  { role: 'Nurse', email: 'nurse@demo-hms.test' },
  { role: 'Receptionist', email: 'receptionist@demo-hms.test' },
  { role: 'Lab technician', email: 'labtech@demo-hms.test' },
  { role: 'Pharmacist', email: 'pharmacist@demo-hms.test' },
  { role: 'Accountant', email: 'accountant@demo-hms.test' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('admin@demo-hms.test')
  const [password, setPassword] = useState('Password@123')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login({ email, password })
      const dest = (location.state as any)?.from?.pathname ?? '/'
      navigate(dest, { replace: true })
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-sm md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-[var(--color-sidebar)] p-8 text-white md:flex">
          <div>
            <div className="text-2xl">🏥</div>
            <h1 className="mt-4 text-2xl font-semibold">Hospital Management SaaS</h1>
            <p className="mt-2 text-sm text-slate-300">
              One workspace for registration, appointments, clinical records, lab &amp; radiology,
              pharmacy, billing, accounting and AI-assisted care.
            </p>
          </div>
          <div className="rounded-lg bg-white/5 p-4 text-xs text-slate-300">
            <p className="mb-2 font-semibold text-slate-200">Demo accounts (password: Password@123)</p>
            <ul className="space-y-1">
              {DEMO_ACCOUNTS.map((acc) => (
                <li key={acc.email}>
                  <button
                    type="button"
                    className="cursor-pointer text-left hover:underline"
                    onClick={() => {
                      setEmail(acc.email)
                      setPassword('Password@123')
                    }}
                  >
                    <span className="text-slate-400">{acc.role}:</span> {acc.email}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-center p-8">
          <h2 className="text-lg font-semibold text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Use your hospital staff credentials.</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {error && <ErrorBanner message={error} />}
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Button type="submit" disabled={busy} className="mt-2 justify-center">
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
