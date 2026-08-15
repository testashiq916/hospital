import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiClient, extractErrorMessage } from '@/api/client'
import type { Paginated } from '@/api/types'
import { Card, PageHeader, Spinner, EmptyState, ErrorBanner } from '@/components/ui/Misc'
import { Select, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/Badge'
import { Drawer } from '@/components/ui/Drawer'
import { formatDate, fullName } from '@/lib/format'
import { useReferenceOptions } from '@/hooks/useReferenceOptions'
import { useAuth } from '@/auth/AuthContext'

interface Admission {
  id: number
  admission_date: string
  status: string
  admission_type: string | null
  patient: any
  doctor: any
  bed: any
  ward: any
}

export default function AdmissionsListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [open, setOpen] = useState(false)

  const query = useQuery({
    queryKey: ['admissions', page, status],
    queryFn: async () =>
      (await apiClient.get<Paginated<Admission>>('/admissions', { params: { page, ...(status ? { status } : {}) } })).data,
    placeholderData: (prev) => prev,
  })

  const items = query.data?.data ?? []

  return (
    <div>
      <PageHeader
        title="IPD Admissions"
        description="Admit patients, assign beds, and manage the inpatient stay."
        actions={<Button onClick={() => setOpen(true)}>+ Admit Patient</Button>}
      />

      <Card>
        <div className="mb-4 w-52">
          <Select
            label="Status"
            placeholder="All Statuses"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'discharged', label: 'Discharged' },
              { value: 'transferred', label: 'Transferred' },
            ]}
          />
        </div>

        {query.isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : items.length === 0 ? (
          <EmptyState message="No admissions found." />
        ) : (
          <>
            <Table
              rows={items}
              onRowClick={(row) => navigate(`/admissions/${row.id}`)}
              columns={[
                { key: 'patient', label: 'Patient', render: (r) => fullName(r.patient) },
                { key: 'doctor', label: 'Doctor', render: (r) => `Dr. ${fullName(r.doctor)}` },
                { key: 'bed', label: 'Bed', render: (r) => (r.bed ? `${r.bed.bed_number} (${r.ward?.name ?? ''})` : 'Unassigned') },
                { key: 'admission_type', label: 'Type', render: (r) => r.admission_type ?? '—' },
                { key: 'admission_date', label: 'Admitted', render: (r) => formatDate(r.admission_date) },
                { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              ]}
            />
            {query.data && (
              <Pagination
                currentPage={query.data.current_page}
                lastPage={query.data.last_page}
                total={query.data.total}
                from={query.data.from}
                to={query.data.to}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>

      <AdmitPatientDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

function AdmitPatientDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({
    hospital_id: user?.hospital_id ? String(user.hospital_id) : '',
    patient_id: '',
    doctor_id: '',
    attending_doctor_id: '',
    admission_type: 'elective',
    bed_id: '',
    department_id: '',
    diagnosis: '',
    treatment_plan: '',
  })
  const [error, setError] = useState<string | null>(null)

  const patientOptions = useReferenceOptions({ endpoint: '/patients', label: (p: any) => `${fullName(p)} (${p.patient_id})` })
  const doctorOptions = useReferenceOptions({ endpoint: '/doctors', label: (d: any) => `Dr. ${fullName(d)}` })
  const bedOptions = useReferenceOptions({ endpoint: '/beds', label: (b: any) => `${b.bed_number} — ${b.ward?.name ?? ''}`, params: { status: 'available' } })
  const departmentOptions = useReferenceOptions({ endpoint: '/departments', label: (d: any) => d.name })

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v || undefined]))
      return (await apiClient.post('/admissions', payload)).data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] })
      onClose()
      navigate(`/admissions/${data.id}`)
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    mutation.mutate()
  }

  return (
    <Drawer open={open} onClose={onClose} title="Admit Patient">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <ErrorBanner message={error} />}
        <Select label="Patient" required options={patientOptions} value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} />
        <Select label="Admitting Doctor" required options={doctorOptions} value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })} />
        <Select label="Attending Doctor" options={doctorOptions} value={form.attending_doctor_id} onChange={(e) => setForm({ ...form, attending_doctor_id: e.target.value })} />
        <Select label="Department" options={departmentOptions} value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} />
        <Select
          label="Admission Type"
          value={form.admission_type}
          onChange={(e) => setForm({ ...form, admission_type: e.target.value })}
          options={[
            { value: 'elective', label: 'Elective' },
            { value: 'emergency', label: 'Emergency' },
            { value: 'transfer', label: 'Transfer' },
          ]}
        />
        <Select
          label="Assign Bed"
          hint="Optional — you can assign this later."
          options={bedOptions}
          value={form.bed_id}
          onChange={(e) => setForm({ ...form, bed_id: e.target.value })}
        />
        <Textarea label="Diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
        <Textarea label="Treatment Plan" value={form.treatment_plan} onChange={(e) => setForm({ ...form, treatment_plan: e.target.value })} />
        <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Admitting…' : 'Admit Patient'}
          </Button>
        </div>
      </form>
    </Drawer>
  )
}
