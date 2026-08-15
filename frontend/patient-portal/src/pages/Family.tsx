import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { usePatient } from '../context/PatientContext'
import { patientsApi } from '../api/patients'
import type { FamilyMember } from '../types/api'
import { Alert, Button, Card, EmptyState, Field, PageSpinner, inputClass } from '../components/ui'
import { ApiError } from '../lib/http'
import { formatDate, titleCase } from '../lib/format'

const emptyForm = {
  name: '',
  relationship: '',
  date_of_birth: '',
  gender: '' as '' | 'male' | 'female' | 'other',
  contact: '',
}

export function Family() {
  const { patient } = usePatient()
  const [members, setMembers] = useState<FamilyMember[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)

  function load() {
    if (!patient) return
    patientsApi
      .family.list(patient.id)
      .then(setMembers)
      .catch(() => setError('Could not load family members.'))
  }

  useEffect(load, [patient])

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!patient) return
    setSubmitting(true)
    setError(null)
    try {
      await patientsApi.family.add(patient.id, {
        name: form.name,
        relationship: form.relationship,
        date_of_birth: form.date_of_birth || undefined,
        gender: form.gender || undefined,
        contact: form.contact || undefined,
      })
      setForm(emptyForm)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.firstFieldError ?? err.message : 'Could not add family member.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRemove(member: FamilyMember) {
    if (!patient || !confirm(`Remove ${member.name} from your family list?`)) return
    setRemovingId(member.id)
    try {
      await patientsApi.family.remove(patient.id, member.id)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove family member.')
    } finally {
      setRemovingId(null)
    }
  }

  if (!patient || members === null) {
    return error ? <p className="text-sm text-rose-600">{error}</p> : <PageSpinner />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Family management</h1>
          <p className="mt-1 text-sm text-slate-500">Keep track of your family members' details.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Close' : 'Add member'}</Button>
      </div>

      {error && <Alert>{error}</Alert>}

      {showForm && (
        <Card>
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input
                required
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
            <Field label="Relationship">
              <input
                required
                placeholder="e.g. Spouse, Child, Parent"
                className={inputClass}
                value={form.relationship}
                onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))}
              />
            </Field>
            <Field label="Date of birth" hint="Optional">
              <input
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                className={inputClass}
                value={form.date_of_birth}
                onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))}
              />
            </Field>
            <Field label="Gender" hint="Optional">
              <select
                className={inputClass}
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as typeof form.gender }))}
              >
                <option value="">—</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Contact number" hint="Optional">
              <input
                className={inputClass}
                value={form.contact}
                onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
              />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Adding…' : 'Add family member'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {members.length === 0 ? (
        <EmptyState icon="👨‍👩‍👧" title="No family members added yet" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {members.map((m) => (
            <Card key={m.id} className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">{m.name}</p>
                <p className="text-sm text-slate-500">{titleCase(m.relationship)}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {[m.gender ? titleCase(m.gender) : null, m.date_of_birth ? formatDate(m.date_of_birth) : null, m.contact]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={removingId === m.id}
                onClick={() => handleRemove(m)}
              >
                {removingId === m.id ? '…' : 'Remove'}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
