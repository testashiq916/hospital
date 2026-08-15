import { useState } from 'react'
import type { FormEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, extractErrorMessage } from '@/api/client'
import type { Patient, PatientFamilyMember, PatientDocument, TimelineEvent } from '@/api/patients'
import type { Paginated } from '@/api/types'
import { Card, PageHeader, Spinner, EmptyState, ErrorBanner } from '@/components/ui/Misc'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Drawer'
import { formatCurrency, formatDate, fullName, titleCase } from '@/lib/format'

const TABS = ['Details', 'Family', 'Documents', 'Visits & Admissions', 'Timeline', 'Prescriptions'] as const
type Tab = (typeof TABS)[number]

export default function PatientProfilePage() {
  const { id } = useParams()
  const patientId = Number(id)
  const [tab, setTab] = useState<Tab>('Details')

  const patientQuery = useQuery({
    queryKey: ['patients', patientId],
    queryFn: async () => (await apiClient.get<Patient>(`/patients/${patientId}`)).data,
  })

  if (patientQuery.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  const patient = patientQuery.data
  if (!patient) return <EmptyState message="Patient not found." />

  return (
    <div>
      <PageHeader
        title={fullName(patient)}
        description={`${patient.patient_id} · ${patient.gender}, ${patient.age} yrs · ${patient.mobile}`}
        actions={
          <div className="flex gap-2">
            <Badge tone="blue">{(patient.registration_type ?? 'opd').toUpperCase()}</Badge>
            <StatusBadge status={patient.is_active ? 'active' : 'inactive'} />
          </div>
        }
      />

      <div className="mb-4 flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`cursor-pointer border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Details' && <DetailsTab patient={patient} />}
      {tab === 'Family' && <FamilyTab patientId={patientId} />}
      {tab === 'Documents' && <DocumentsTab patientId={patientId} />}
      {tab === 'Visits & Admissions' && <VisitsAdmissionsTab patientId={patientId} />}
      {tab === 'Timeline' && <TimelineTab patientId={patientId} />}
      {tab === 'Prescriptions' && <PrescriptionsTab patientId={patientId} />}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-sm text-slate-800">{value ?? '—'}</div>
    </div>
  )
}

function DetailsTab({ patient }: { patient: Patient }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Date of Birth" value={formatDate(patient.date_of_birth)} />
          <InfoRow label="Blood Group" value={patient.blood_group} />
          <InfoRow label="Marital Status" value={titleCase(patient.marital_status)} />
          <InfoRow label="Patient Type" value={patient.patient_type?.name} />
          <InfoRow label="Hospital" value={patient.hospital?.name} />
          <InfoRow label="Registered On" value={formatDate(patient.registration_date)} />
        </div>
      </Card>
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Contact</h3>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Mobile" value={patient.mobile} />
          <InfoRow label="Alternate Mobile" value={patient.alternate_mobile} />
          <InfoRow label="Email" value={patient.email} />
          <InfoRow label="Address" value={[patient.address, patient.city, patient.state, patient.zip_code].filter(Boolean).join(', ')} />
        </div>
      </Card>
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Medical Background</h3>
        <div className="grid grid-cols-1 gap-4">
          <InfoRow label="Allergies" value={patient.allergies} />
          <InfoRow label="Chronic Diseases" value={patient.chronic_diseases} />
          <InfoRow label="Current Medications" value={patient.medications} />
        </div>
      </Card>
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Insurance &amp; Emergency Contact</h3>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Insurance Provider" value={patient.insurance_provider} />
          <InfoRow label="Policy Number" value={patient.insurance_policy_number} />
          <InfoRow label="Coverage" value={patient.insurance_coverage ? formatCurrency(patient.insurance_coverage) : null} />
          <InfoRow label="Emergency Contact" value={patient.emergency_contact_name && `${patient.emergency_contact_name} (${patient.emergency_contact_relationship ?? '—'}) — ${patient.emergency_contact_phone}`} />
        </div>
      </Card>
    </div>
  )
}

function FamilyTab({ patientId }: { patientId: number }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', relationship: '', date_of_birth: '', gender: '', contact: '' })

  const query = useQuery({
    queryKey: ['patients', patientId, 'family'],
    queryFn: async () => (await apiClient.get<PatientFamilyMember[]>(`/patients/${patientId}/family`)).data,
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v || null]))
      return (await apiClient.post(`/patients/${patientId}/family`, payload)).data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'family'] })
      setOpen(false)
      setForm({ name: '', relationship: '', date_of_birth: '', gender: '', contact: '' })
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: async (memberId: number) => apiClient.delete(`/patients/${patientId}/family/${memberId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'family'] }),
  })

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Family Members</h3>
        <Button size="sm" onClick={() => setOpen(true)}>
          + Add Family Member
        </Button>
      </div>
      {query.isLoading ? (
        <Spinner />
      ) : (query.data ?? []).length === 0 ? (
        <EmptyState message="No family members recorded." />
      ) : (
        <div className="divide-y divide-slate-100">
          {query.data!.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-2.5">
              <div>
                <div className="text-sm font-medium text-slate-800">{m.name}</div>
                <div className="text-xs text-slate-500">
                  {titleCase(m.relationship)}
                  {m.gender ? ` · ${titleCase(m.gender)}` : ''}
                  {m.contact ? ` · ${m.contact}` : ''}
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteMutation.mutate(m.id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Family Member">
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            setError(null)
            mutation.mutate()
          }}
          className="flex flex-col gap-3"
        >
          {error && <ErrorBanner message={error} />}
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input
            label="Relationship"
            required
            placeholder="e.g. Spouse, Parent, Child"
            value={form.relationship}
            onChange={(e) => setForm({ ...form, relationship: e.target.value })}
          />
          <Input
            label="Date of Birth"
            type="date"
            value={form.date_of_birth}
            onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
          />
          <Select
            label="Gender"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Input label="Contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  )
}

function DocumentsTab({ patientId }: { patientId: number }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ document_type: '', document_name: '', document_path: '', document_number: '' })

  const query = useQuery({
    queryKey: ['patients', patientId, 'documents'],
    queryFn: async () => (await apiClient.get<PatientDocument[]>(`/patients/${patientId}/documents`)).data,
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v || null]))
      return (await apiClient.post(`/patients/${patientId}/documents`, payload)).data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'documents'] })
      setOpen(false)
      setForm({ document_type: '', document_name: '', document_path: '', document_number: '' })
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  const verifyMutation = useMutation({
    mutationFn: async (docId: number) => apiClient.post(`/patients/${patientId}/documents/${docId}/verify`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'documents'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (docId: number) => apiClient.delete(`/patients/${patientId}/documents/${docId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'documents'] }),
  })

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Documents</h3>
        <Button size="sm" onClick={() => setOpen(true)}>
          + Add Document
        </Button>
      </div>
      {query.isLoading ? (
        <Spinner />
      ) : (query.data ?? []).length === 0 ? (
        <EmptyState message="No documents on file." />
      ) : (
        <div className="divide-y divide-slate-100">
          {query.data!.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between py-2.5">
              <div>
                <div className="text-sm font-medium text-slate-800">
                  {doc.document_name} <span className="text-xs text-slate-400">({titleCase(doc.document_type)})</span>
                </div>
                <div className="text-xs text-slate-500">{doc.document_path}</div>
              </div>
              <div className="flex items-center gap-2">
                {doc.is_verified ? (
                  <Badge tone="green">Verified</Badge>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => verifyMutation.mutate(doc.id)}>
                    Verify
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteMutation.mutate(doc.id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Document">
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            setError(null)
            mutation.mutate()
          }}
          className="flex flex-col gap-3"
        >
          {error && <ErrorBanner message={error} />}
          <Input
            label="Document Type"
            required
            placeholder="e.g. id_proof, insurance_card"
            value={form.document_type}
            onChange={(e) => setForm({ ...form, document_type: e.target.value })}
          />
          <Input
            label="Document Name"
            required
            value={form.document_name}
            onChange={(e) => setForm({ ...form, document_name: e.target.value })}
          />
          <Input
            label="Document Reference / Path"
            required
            hint="File storage isn't wired up in this demo — record a reference or number."
            value={form.document_path}
            onChange={(e) => setForm({ ...form, document_path: e.target.value })}
          />
          <Input
            label="Document Number"
            value={form.document_number}
            onChange={(e) => setForm({ ...form, document_number: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  )
}

function VisitsAdmissionsTab({ patientId }: { patientId: number }) {
  const visitsQuery = useQuery({
    queryKey: ['patients', patientId, 'visits'],
    queryFn: async () => (await apiClient.get<Paginated<any>>('/visits', { params: { patient_id: patientId } })).data.data,
  })
  const admissionsQuery = useQuery({
    queryKey: ['patients', patientId, 'admissions'],
    queryFn: async () => (await apiClient.get<Paginated<any>>('/admissions', { params: { patient_id: patientId } })).data.data,
  })

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">OPD Visits</h3>
        {visitsQuery.isLoading ? (
          <Spinner />
        ) : (visitsQuery.data ?? []).length === 0 ? (
          <EmptyState message="No visits yet." />
        ) : (
          <div className="divide-y divide-slate-100">
            {visitsQuery.data!.map((v: any) => (
              <div key={v.id} className="py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-800">Token #{v.token_number} · Dr. {fullName(v.doctor)}</span>
                  <StatusBadge status={v.status} />
                </div>
                <div className="text-xs text-slate-500">{formatDate(v.visit_date)} · {titleCase(v.visit_type)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Admissions</h3>
          <Link to="/admissions" className="text-xs text-[var(--color-primary)] hover:underline">
            Admit patient →
          </Link>
        </div>
        {admissionsQuery.isLoading ? (
          <Spinner />
        ) : (admissionsQuery.data ?? []).length === 0 ? (
          <EmptyState message="No admissions yet." />
        ) : (
          <div className="divide-y divide-slate-100">
            {admissionsQuery.data!.map((a: any) => (
              <div key={a.id} className="py-2.5">
                <div className="flex items-center justify-between">
                  <Link to={`/admissions/${a.id}`} className="text-sm font-medium text-[var(--color-primary)] hover:underline">
                    Admission #{a.id} · Bed {a.bed?.bed_number ?? '—'}
                  </Link>
                  <StatusBadge status={a.status} />
                </div>
                <div className="text-xs text-slate-500">{formatDate(a.admission_date)} · Dr. {fullName(a.doctor)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function TimelineTab({ patientId }: { patientId: number }) {
  const query = useQuery({
    queryKey: ['patients', patientId, 'timeline'],
    queryFn: async () => (await apiClient.get<Paginated<TimelineEvent>>(`/patients/${patientId}/timeline`)).data.data,
  })

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-800">Health Timeline</h3>
      {query.isLoading ? (
        <Spinner />
      ) : (query.data ?? []).length === 0 ? (
        <EmptyState message="No timeline events yet." />
      ) : (
        <ol className="relative ml-2 border-l border-slate-200 pl-4">
          {query.data!.map((event) => (
            <li key={event.id} className="mb-4">
              <div className="absolute -ml-[21px] mt-1 h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
              <div className="text-sm font-medium text-slate-800">{event.event_title}</div>
              <div className="text-xs text-slate-400">{formatDate(event.event_date)}</div>
              {event.event_description && <p className="mt-1 text-sm text-slate-600">{event.event_description}</p>}
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}

function PrescriptionsTab({ patientId }: { patientId: number }) {
  const query = useQuery({
    queryKey: ['patients', patientId, 'prescriptions'],
    queryFn: async () => (await apiClient.get<Paginated<any>>('/prescriptions', { params: { patient_id: patientId } })).data.data,
  })

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Prescriptions</h3>
        <Link to="/pharmacy/prescriptions" className="text-xs text-[var(--color-primary)] hover:underline">
          New prescription →
        </Link>
      </div>
      {query.isLoading ? (
        <Spinner />
      ) : (query.data ?? []).length === 0 ? (
        <EmptyState message="No prescriptions yet." />
      ) : (
        <div className="divide-y divide-slate-100">
          {query.data!.map((rx: any) => (
            <div key={rx.id} className="py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-800">Dr. {fullName(rx.doctor)} — {formatDate(rx.prescription_date)}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {(rx.items ?? []).map((item: any) => (
                  <Badge key={item.id} tone="slate">
                    {item.medicine?.name} × {item.quantity}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
