import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, extractErrorMessage } from '@/api/client'
import type { Paginated } from '@/api/types'
import { Card, PageHeader, Spinner, EmptyState, ErrorBanner } from '@/components/ui/Misc'
import { Select, Textarea, Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Drawer } from '@/components/ui/Drawer'
import { formatDate, fullName } from '@/lib/format'
import { useReferenceOptions } from '@/hooks/useReferenceOptions'
import { useAuth } from '@/auth/AuthContext'

interface PrescriptionItemForm {
  medicine_id: string
  quantity: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

const emptyItem: PrescriptionItemForm = { medicine_id: '', quantity: '1', dosage: '', frequency: '', duration: '', instructions: '' }

export default function PrescriptionsPage() {
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [alerts, setAlerts] = useState<any[] | null>(null)

  const query = useQuery({
    queryKey: ['prescriptions', page],
    queryFn: async () => (await apiClient.get<Paginated<any>>('/prescriptions', { params: { page } })).data,
    placeholderData: (prev) => prev,
  })

  const items = query.data?.data ?? []

  return (
    <div>
      <PageHeader
        title="Prescriptions"
        description="E-prescriptions with automatic drug-interaction alerts."
        actions={<Button onClick={() => setOpen(true)}>+ New Prescription</Button>}
      />

      {alerts && alerts.length > 0 && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <strong>Drug interaction alerts:</strong>
          <ul className="mt-1 list-disc pl-5">
            {alerts.map((a: any, i: number) => (
              <li key={i}>
                <strong>{a.drug_a} + {a.drug_b}</strong> ({a.severity}): {a.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Card>
        {query.isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : items.length === 0 ? (
          <EmptyState message="No prescriptions yet." />
        ) : (
          <>
            <Table
              rows={items}
              columns={[
                { key: 'patient', label: 'Patient', render: (r) => fullName(r.patient) },
                { key: 'doctor', label: 'Doctor', render: (r) => `Dr. ${fullName(r.doctor)}` },
                { key: 'items', label: 'Medicines', render: (r) => (
                  <div className="flex flex-wrap gap-1">
                    {(r.items ?? []).map((it: any) => (
                      <Badge key={it.id} tone="slate">{it.medicine?.name} ×{it.quantity}</Badge>
                    ))}
                  </div>
                ) },
                { key: 'prescription_date', label: 'Date', render: (r) => formatDate(r.prescription_date) },
                { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ?? 'active'} /> },
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

      <NewPrescriptionDrawer open={open} onClose={() => setOpen(false)} onCreated={(a) => setAlerts(a)} />
    </div>
  )
}

function NewPrescriptionDrawer({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (alerts: any[]) => void }) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [patientId, setPatientId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [rows, setRows] = useState<PrescriptionItemForm[]>([{ ...emptyItem }])
  const [error, setError] = useState<string | null>(null)

  const patientOptions = useReferenceOptions({ endpoint: '/patients', label: (p: any) => `${fullName(p)} (${p.patient_id})` })
  const doctorOptions = useReferenceOptions({ endpoint: '/doctors', label: (d: any) => `Dr. ${fullName(d)}` })
  const medicineOptions = useReferenceOptions({ endpoint: '/medicines', label: (m: any) => `${m.name}${m.strength ? ` (${m.strength})` : ''} — stock ${m.current_stock}` })

  const mutation = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post('/prescriptions', {
          hospital_id: user?.hospital_id,
          patient_id: Number(patientId),
          doctor_id: Number(doctorId),
          diagnosis: diagnosis || null,
          items: rows
            .filter((r) => r.medicine_id)
            .map((r) => ({
              medicine_id: Number(r.medicine_id),
              quantity: Number(r.quantity || 1),
              dosage: r.dosage || null,
              frequency: r.frequency || null,
              duration: r.duration || null,
              instructions: r.instructions || null,
            })),
        })
      ).data,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
      onCreated(data.drug_interaction_alerts ?? [])
      onClose()
      setRows([{ ...emptyItem }])
      setPatientId('')
      setDoctorId('')
      setDiagnosis('')
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function updateRow(idx: number, patch: Partial<PrescriptionItemForm>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    mutation.mutate()
  }

  return (
    <Drawer open={open} onClose={onClose} title="New Prescription" width="max-w-3xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <ErrorBanner message={error} />}
        <div className="grid grid-cols-2 gap-4">
          <Select label="Patient" required options={patientOptions} value={patientId} onChange={(e) => setPatientId(e.target.value)} />
          <Select label="Doctor" required options={doctorOptions} value={doctorId} onChange={(e) => setDoctorId(e.target.value)} />
        </div>
        <Textarea label="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Medicines</span>
            <Button type="button" size="sm" variant="secondary" onClick={() => setRows((prev) => [...prev, { ...emptyItem }])}>
              + Add Line
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {rows.map((row, idx) => (
              <div key={idx} className="rounded-md border border-slate-200 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Medicine" options={medicineOptions} value={row.medicine_id} onChange={(e) => updateRow(idx, { medicine_id: e.target.value })} />
                  <Input label="Quantity" type="number" value={row.quantity} onChange={(e) => updateRow(idx, { quantity: e.target.value })} />
                  <Input label="Dosage" placeholder="e.g. 500mg" value={row.dosage} onChange={(e) => updateRow(idx, { dosage: e.target.value })} />
                  <Input label="Frequency" placeholder="e.g. TID" value={row.frequency} onChange={(e) => updateRow(idx, { frequency: e.target.value })} />
                  <Input label="Duration" placeholder="e.g. 5 days" value={row.duration} onChange={(e) => updateRow(idx, { duration: e.target.value })} />
                  <Input label="Instructions" placeholder="e.g. After food" value={row.instructions} onChange={(e) => updateRow(idx, { instructions: e.target.value })} />
                </div>
                {rows.length > 1 && (
                  <div className="mt-2 text-right">
                    <Button type="button" size="sm" variant="ghost" className="text-red-600" onClick={() => setRows((prev) => prev.filter((_, i) => i !== idx))}>
                      Remove line
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save Prescription'}
          </Button>
        </div>
      </form>
    </Drawer>
  )
}
