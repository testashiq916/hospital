import { useState } from 'react'
import type { FormEvent } from 'react'
import type { PatientProfileInput } from '../api/patients'
import { ApiError } from '../lib/http'
import type { Patient } from '../types/api'
import { Alert, Button, Field, inputClass } from './ui'

interface Props {
  initial?: Patient | null
  hospitalId?: number
  submitLabel: string
  onSubmit: (input: PatientProfileInput) => Promise<unknown>
}

export function PatientProfileForm({ initial, hospitalId, submitLabel, onSubmit }: Props) {
  const [form, setForm] = useState({
    first_name: initial?.first_name ?? '',
    last_name: initial?.last_name ?? '',
    gender: initial?.gender ?? ('female' as 'male' | 'female' | 'other'),
    date_of_birth: initial?.date_of_birth?.slice(0, 10) ?? '',
    blood_group: initial?.blood_group ?? '',
    email: initial?.email ?? '',
    address: initial?.address ?? '',
    city: initial?.city ?? '',
    state: initial?.state ?? '',
    country: initial?.country ?? 'India',
    emergency_contact_name: initial?.emergency_contact_name ?? '',
    emergency_contact_phone: initial?.emergency_contact_phone ?? '',
    emergency_contact_relationship: initial?.emergency_contact_relationship ?? '',
    allergies: initial?.allergies ?? '',
    chronic_diseases: initial?.chronic_diseases ?? '',
    medications: initial?.medications ?? '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload: PatientProfileInput = {
        ...form,
        hospital_id: hospitalId ?? initial?.hospital_id ?? 0,
        mobile: initial?.mobile ?? '',
      }
      await onSubmit(payload)
    } catch (err) {
      setError(err instanceof ApiError ? err.firstFieldError ?? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
        <Field label="Blood group" hint="Optional">
          <input
            className={inputClass}
            placeholder="e.g. O+"
            value={form.blood_group}
            onChange={(e) => update('blood_group', e.target.value)}
          />
        </Field>
        <Field label="Email" hint="Optional">
          <input
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Address" hint="Optional">
        <input
          className={inputClass}
          value={form.address}
          onChange={(e) => update('address', e.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="City">
          <input
            className={inputClass}
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
          />
        </Field>
        <Field label="State">
          <input
            className={inputClass}
            value={form.state}
            onChange={(e) => update('state', e.target.value)}
          />
        </Field>
        <Field label="Country">
          <input
            className={inputClass}
            value={form.country}
            onChange={(e) => update('country', e.target.value)}
          />
        </Field>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <p className="mb-3 text-sm font-semibold text-slate-700">Emergency contact</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name">
            <input
              className={inputClass}
              value={form.emergency_contact_name}
              onChange={(e) => update('emergency_contact_name', e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <input
              className={inputClass}
              value={form.emergency_contact_phone}
              onChange={(e) => update('emergency_contact_phone', e.target.value)}
            />
          </Field>
          <Field label="Relationship">
            <input
              className={inputClass}
              placeholder="e.g. Spouse"
              value={form.emergency_contact_relationship}
              onChange={(e) => update('emergency_contact_relationship', e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <p className="mb-3 text-sm font-semibold text-slate-700">Medical information</p>
        <div className="grid gap-4">
          <Field label="Allergies" hint="Optional">
            <input
              className={inputClass}
              value={form.allergies}
              onChange={(e) => update('allergies', e.target.value)}
            />
          </Field>
          <Field label="Chronic conditions" hint="Optional">
            <input
              className={inputClass}
              value={form.chronic_diseases}
              onChange={(e) => update('chronic_diseases', e.target.value)}
            />
          </Field>
          <Field label="Current medications" hint="Optional">
            <input
              className={inputClass}
              value={form.medications}
              onChange={(e) => update('medications', e.target.value)}
            />
          </Field>
        </div>
      </div>

      <Button type="submit" disabled={submitting} className="self-start">
        {submitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
