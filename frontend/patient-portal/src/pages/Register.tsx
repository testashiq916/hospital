import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePatient } from '../context/PatientContext'
import { hospitalsApi } from '../api/hospitals'
import { ApiError } from '../lib/http'
import { Alert, Button, Field, inputClass } from '../components/ui'

export function Register() {
  const { register } = useAuth()
  const { createProfile } = usePatient()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    password: '',
    password_confirmation: '',
    gender: 'female' as 'male' | 'female' | 'other',
    date_of_birth: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'form' | 'provisioning'>('form')

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      // Step 1: create the login (backend's only public signup endpoint —
      // see README for why this provisions a brand-new, empty tenant rather
      // than joining the existing City Care Hospital).
      await register({
        company_name: `${form.first_name} ${form.last_name} — Patient Account`,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        mobile: form.mobile,
      })

      setStep('provisioning')

      // Step 2: that tenant has no hospital yet, so create a minimal one —
      // required because `patients.hospital_id` is a not-null foreign key.
      const hospital = await hospitalsApi.create({
        name: 'My Care Record',
        code: `PT-${Date.now().toString(36).toUpperCase()}`,
      })

      // Step 3: create the linked patient row itself.
      await createProfile({
        hospital_id: hospital.id,
        first_name: form.first_name,
        last_name: form.last_name,
        gender: form.gender,
        date_of_birth: form.date_of_birth,
        mobile: form.mobile,
        email: form.email,
      })

      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.firstFieldError ?? err.message : 'Registration failed.')
      setStep('form')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-slate-50 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="mb-2 text-4xl">🏥</div>
          <h1 className="text-2xl font-semibold text-slate-900">Create your patient account</h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Alert tone="amber">
            <strong>Heads up:</strong> this backend's public sign-up endpoint provisions a brand
            new, empty hospital record for every new account — it can't join the existing seeded
            "City Care Hospital" (that would need an invite-code style endpoint the backend
            doesn't have). Your new account will work fully, but Book Appointment will show no
            doctors until you're your own admin adds some. For the full demo experience with real
            doctors and data, use the <Link to="/login" className="underline">seeded demo patient login</Link>{' '}
            instead. Full explanation in the project README.
          </Alert>

          {step === 'provisioning' ? (
            <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
              <p className="text-sm text-slate-600">Setting up your account…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              {error && <Alert>{error}</Alert>}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name">
                  <input
                    required
                    className={inputClass}
                    value={form.first_name}
                    onChange={(e) => update('first_name', e.target.value)}
                  />
                </Field>
                <Field label="Last name">
                  <input
                    required
                    className={inputClass}
                    value={form.last_name}
                    onChange={(e) => update('last_name', e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Email address">
                <input
                  required
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                />
              </Field>
              <Field label="Mobile number">
                <input
                  required
                  className={inputClass}
                  placeholder="+91-9000000000"
                  value={form.mobile}
                  onChange={(e) => update('mobile', e.target.value)}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date of birth">
                  <input
                    required
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    className={inputClass}
                    value={form.date_of_birth}
                    onChange={(e) => update('date_of_birth', e.target.value)}
                  />
                </Field>
                <Field label="Gender">
                  <select
                    className={inputClass}
                    value={form.gender}
                    onChange={(e) => update('gender', e.target.value as typeof form.gender)}
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Password" hint="Minimum 8 characters">
                  <input
                    required
                    type="password"
                    minLength={8}
                    className={inputClass}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                  />
                </Field>
                <Field label="Confirm password">
                  <input
                    required
                    type="password"
                    minLength={8}
                    className={inputClass}
                    value={form.password_confirmation}
                    onChange={(e) => update('password_confirmation', e.target.value)}
                  />
                </Field>
              </div>
              <Button type="submit" disabled={submitting} className="mt-1 w-full">
                {submitting ? 'Creating account…' : 'Create account'}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
