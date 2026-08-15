import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, extractErrorMessage } from '@/api/client'
import type { Paginated } from '@/api/types'
import { Card, PageHeader, Spinner, EmptyState, ErrorBanner } from '@/components/ui/Misc'
import { Input, Select } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/Badge'
import { Drawer } from '@/components/ui/Drawer'
import { formatDate, formatTime, fullName } from '@/lib/format'
import { useReferenceOptions } from '@/hooks/useReferenceOptions'
import { useAuth } from '@/auth/AuthContext'

interface Appointment {
  id: number
  appointment_date: string
  appointment_time: string
  token_number: number
  status: string
  appointment_type: string | null
  patient: any
  doctor: any
}

const APPT_TYPES = ['opd', 'follow_up', 'teleconsultation', 'emergency']

export default function AppointmentsListPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [doctorFilter, setDoctorFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [bookOpen, setBookOpen] = useState(false)

  const listQuery = useQuery({
    queryKey: ['appointments', page, doctorFilter, statusFilter, dateFilter],
    queryFn: async () => {
      const res = await apiClient.get<Paginated<Appointment>>('/appointments', {
        params: {
          page,
          ...(doctorFilter ? { doctor_id: doctorFilter } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(dateFilter ? { date: dateFilter } : {}),
        },
      })
      return res.data
    },
    placeholderData: (prev) => prev,
  })

  const cancelMutation = useMutation({
    mutationFn: async (id: number) => apiClient.post(`/appointments/${id}/cancel`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  })

  const doctorOptions = useReferenceOptions({ endpoint: '/doctors', label: (d: any) => `Dr. ${fullName(d)}` })
  const items = listQuery.data?.data ?? []

  return (
    <div>
      <PageHeader
        title="Appointments"
        description="Book and manage doctor appointments."
        actions={<Button onClick={() => setBookOpen(true)}>+ Book Appointment</Button>}
      />

      <Card>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="w-56">
            <Select label="Doctor" placeholder="All Doctors" options={doctorOptions} value={doctorFilter} onChange={(e) => { setDoctorFilter(e.target.value); setPage(1) }} />
          </div>
          <div className="w-48">
            <Select
              label="Status"
              placeholder="All Statuses"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              options={['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'].map((v) => ({ value: v, label: v }))}
            />
          </div>
          <div className="w-44">
            <Input label="Date" type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1) }} />
          </div>
        </div>

        {listQuery.isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : items.length === 0 ? (
          <EmptyState message="No appointments found." />
        ) : (
          <>
            <Table
              rows={items}
              columns={[
                { key: 'token_number', label: 'Token' },
                { key: 'patient', label: 'Patient', render: (r) => fullName(r.patient) },
                { key: 'doctor', label: 'Doctor', render: (r) => `Dr. ${fullName(r.doctor)}` },
                { key: 'date', label: 'Date & Time', render: (r) => `${formatDate(r.appointment_date)} ${formatTime(r.appointment_time)}` },
                { key: 'appointment_type', label: 'Type', render: (r) => r.appointment_type ?? 'opd' },
                { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              ]}
              actions={(row) =>
                !['cancelled', 'completed', 'no_show'].includes(row.status) ? (
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => cancelMutation.mutate(row.id)}>
                    Cancel
                  </Button>
                ) : null
              }
            />
            {listQuery.data && (
              <Pagination
                currentPage={listQuery.data.current_page}
                lastPage={listQuery.data.last_page}
                total={listQuery.data.total}
                from={listQuery.data.from}
                to={listQuery.data.to}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>

      <BookAppointmentDrawer open={bookOpen} onClose={() => setBookOpen(false)} />
    </div>
  )
}

function BookAppointmentDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [form, setForm] = useState({
    hospital_id: user?.hospital_id ? String(user.hospital_id) : '',
    patient_id: '',
    doctor_id: '',
    appointment_date: new Date().toISOString().slice(0, 10),
    appointment_time: '',
    appointment_type: 'opd',
    reason: '',
    is_emergency: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<any>(null)

  const hospitalOptions = useReferenceOptions({ endpoint: '/hospitals', label: (h: any) => h.name })
  const patientOptions = useReferenceOptions({ endpoint: '/patients', label: (p: any) => `${fullName(p)} (${p.patient_id})` })
  const doctorOptions = useReferenceOptions({ endpoint: '/doctors', label: (d: any) => `Dr. ${fullName(d)}${d.specialization ? ` — ${d.specialization}` : ''}` })

  const mutation = useMutation({
    mutationFn: async () => {
      return (await apiClient.post('/appointments', form)).data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      onClose()
      setForm((f) => ({ ...f, patient_id: '', appointment_time: '', reason: '' }))
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  const suggestMutation = useMutation({
    mutationFn: async () => {
      if (!form.doctor_id) return null
      return (await apiClient.get(`/appointments/optimal-slot/${form.doctor_id}`)).data
    },
    onSuccess: (data) => setSuggestion(data),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    mutation.mutate()
  }

  return (
    <Drawer open={open} onClose={onClose} title="Book Appointment">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <ErrorBanner message={error} />}
        <Select label="Hospital" required options={hospitalOptions} value={form.hospital_id} onChange={(e) => setForm({ ...form, hospital_id: e.target.value })} />
        <Select label="Patient" required options={patientOptions} value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} />
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Select label="Doctor" required options={doctorOptions} value={form.doctor_id} onChange={(e) => { setForm({ ...form, doctor_id: e.target.value }); setSuggestion(null) }} />
          </div>
          <Button type="button" size="sm" variant="secondary" disabled={!form.doctor_id} onClick={() => suggestMutation.mutate()}>
            Suggest slot
          </Button>
        </div>
        {suggestion && (
          <div className="rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Least busy: <strong>{suggestion.date}</strong> ({suggestion.day_of_week}) {suggestion.start_time}–{suggestion.end_time} ·{' '}
            {suggestion.booked}/{suggestion.capacity} booked
            <button
              type="button"
              className="ml-2 cursor-pointer underline"
              onClick={() => setForm({ ...form, appointment_date: suggestion.date, appointment_time: suggestion.start_time })}
            >
              Use this
            </button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Date" type="date" required value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} />
          <Input label="Time" type="time" required value={form.appointment_time} onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} />
        </div>
        <Select
          label="Appointment Type"
          value={form.appointment_type}
          onChange={(e) => setForm({ ...form, appointment_type: e.target.value })}
          options={APPT_TYPES.map((v) => ({ value: v, label: v }))}
        />
        <Input label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Booking…' : 'Book Appointment'}
          </Button>
        </div>
      </form>
    </Drawer>
  )
}
