import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiClient, extractErrorMessage } from '@/api/client'
import type { Paginated } from '@/api/types'
import { Card, PageHeader, Spinner, EmptyState, ErrorBanner } from '@/components/ui/Misc'
import { Select, Textarea, Checkbox } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/Badge'
import { Drawer } from '@/components/ui/Drawer'
import { formatDate, formatCurrency, fullName } from '@/lib/format'
import { useReferenceOptions } from '@/hooks/useReferenceOptions'
import { useAuth } from '@/auth/AuthContext'

interface LabOrder {
  id: number
  status: string
  priority: string
  order_date: string
  patient: any
  doctor: any
  items: any[]
}

export default function LabOrdersListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [open, setOpen] = useState(false)

  const query = useQuery({
    queryKey: ['lab-orders', page, status],
    queryFn: async () =>
      (await apiClient.get<Paginated<LabOrder>>('/lab-orders', { params: { page, ...(status ? { status } : {}) } })).data,
    placeholderData: (prev) => prev,
  })

  const items = query.data?.data ?? []

  return (
    <div>
      <PageHeader
        title="Lab Orders"
        description="Order tests, collect samples, enter results and generate verified reports."
        actions={<Button onClick={() => setOpen(true)}>+ New Lab Order</Button>}
      />

      <Card>
        <div className="mb-4 w-52">
          <Select
            label="Status"
            placeholder="All Statuses"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            options={['ordered', 'collected', 'processing', 'completed', 'cancelled'].map((v) => ({ value: v, label: v }))}
          />
        </div>

        {query.isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : items.length === 0 ? (
          <EmptyState message="No lab orders found." />
        ) : (
          <>
            <Table
              rows={items}
              onRowClick={(row) => navigate(`/lab/orders/${row.id}`)}
              columns={[
                { key: 'patient', label: 'Patient', render: (r) => fullName(r.patient) },
                { key: 'doctor', label: 'Doctor', render: (r) => `Dr. ${fullName(r.doctor)}` },
                { key: 'tests', label: 'Tests', render: (r) => (r.items ?? []).map((i: any) => i.lab_test?.name).filter(Boolean).join(', ') || '—' },
                { key: 'priority', label: 'Priority', render: (r) => <StatusBadge status={r.priority} /> },
                { key: 'order_date', label: 'Ordered', render: (r) => formatDate(r.order_date) },
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

      <NewLabOrderDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

function NewLabOrderDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [patientId, setPatientId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [priority, setPriority] = useState('routine')
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [selectedTests, setSelectedTests] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  const patientOptions = useReferenceOptions({ endpoint: '/patients', label: (p: any) => `${fullName(p)} (${p.patient_id})` })
  const doctorOptions = useReferenceOptions({ endpoint: '/doctors', label: (d: any) => `Dr. ${fullName(d)}` })
  const testsQuery = useQuery({
    queryKey: ['reference', '/lab-tests'],
    queryFn: async () => (await apiClient.get('/lab-tests', { params: { per_page: 200 } })).data.data,
  })

  const mutation = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post('/lab-orders', {
          hospital_id: user?.hospital_id,
          patient_id: Number(patientId),
          doctor_id: Number(doctorId),
          priority,
          clinical_notes: clinicalNotes || null,
          test_ids: selectedTests,
        })
      ).data,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] })
      onClose()
      navigate(`/lab/orders/${data.id}`)
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function toggleTest(id: number) {
    setSelectedTests((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    mutation.mutate()
  }

  return (
    <Drawer open={open} onClose={onClose} title="New Lab Order">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <ErrorBanner message={error} />}
        <Select label="Patient" required options={patientOptions} value={patientId} onChange={(e) => setPatientId(e.target.value)} />
        <Select label="Ordering Doctor" required options={doctorOptions} value={doctorId} onChange={(e) => setDoctorId(e.target.value)} />
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          options={['routine', 'urgent', 'stat'].map((v) => ({ value: v, label: v }))}
        />
        <Textarea label="Clinical Notes" value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} />

        <div>
          <span className="mb-2 block text-xs font-medium text-slate-600">Tests *</span>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-slate-200 p-2">
            {(testsQuery.data ?? []).map((t: any) => (
              <Checkbox
                key={t.id}
                label={`${t.name} (${t.test_code}) — ${formatCurrency(t.price)}`}
                checked={selectedTests.includes(t.id)}
                onChange={() => toggleTest(t.id)}
              />
            ))}
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending || selectedTests.length === 0}>
            {mutation.isPending ? 'Creating…' : 'Create Order'}
          </Button>
        </div>
      </form>
    </Drawer>
  )
}
