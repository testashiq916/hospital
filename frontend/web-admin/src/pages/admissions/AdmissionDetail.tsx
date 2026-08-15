import { useState } from 'react'
import type { FormEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, extractErrorMessage } from '@/api/client'
import { Card, PageHeader, Spinner, EmptyState, ErrorBanner } from '@/components/ui/Misc'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Drawer'
import { formatDate, fullName } from '@/lib/format'
import { useReferenceOptions } from '@/hooks/useReferenceOptions'

export default function AdmissionDetailPage() {
  const { id } = useParams()
  const admissionId = Number(id)
  const [bedModalOpen, setBedModalOpen] = useState(false)
  const [dischargeModalOpen, setDischargeModalOpen] = useState(false)

  const query = useQuery({
    queryKey: ['admissions', admissionId],
    queryFn: async () => (await apiClient.get(`/admissions/${admissionId}`)).data,
  })

  const ipdRecordsQuery = useQuery({
    queryKey: ['admissions', admissionId, 'ipd-records'],
    queryFn: async () => (await apiClient.get('/ipd-records', { params: { admission_id: admissionId } })).data.data,
    enabled: !!query.data,
  })

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  const admission = query.data
  if (!admission) return <EmptyState message="Admission not found." />

  const isActive = admission.status === 'active'

  return (
    <div>
      <PageHeader
        title={`Admission #${admission.admission_id ?? admission.id}`}
        description={`${fullName(admission.patient)} · Dr. ${fullName(admission.doctor)}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={admission.status} />
            {isActive && (
              <>
                <Button size="sm" variant="secondary" onClick={() => setBedModalOpen(true)}>
                  {admission.bed ? 'Transfer Bed' : 'Assign Bed'}
                </Button>
                <Button size="sm" variant="danger" onClick={() => setDischargeModalOpen(true)}>
                  Discharge
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Admission Details</h3>
          <dl className="space-y-2 text-sm">
            <Row label="Patient" value={<Link to={`/patients/${admission.patient?.id}`} className="text-[var(--color-primary)] hover:underline">{fullName(admission.patient)}</Link>} />
            <Row label="Admitting Doctor" value={`Dr. ${fullName(admission.doctor)}`} />
            <Row label="Attending Doctor" value={admission.attending_doctor ? `Dr. ${fullName(admission.attending_doctor)}` : '—'} />
            <Row label="Department" value={admission.department?.name ?? '—'} />
            <Row label="Bed / Ward" value={admission.bed ? `${admission.bed.bed_number} (${admission.ward?.name ?? ''})` : 'Unassigned'} />
            <Row label="Admission Type" value={admission.admission_type ?? '—'} />
            <Row label="Admitted On" value={formatDate(admission.admission_date)} />
            {admission.status === 'discharged' && <Row label="Discharged On" value={formatDate(admission.discharge_date)} />}
          </dl>
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Clinical Notes</h3>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs font-medium text-slate-400">Diagnosis</div>
              <p className="text-slate-700">{admission.diagnosis || '—'}</p>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400">Treatment Plan</div>
              <p className="text-slate-700">{admission.treatment_plan || '—'}</p>
            </div>
            {admission.status === 'discharged' && (
              <div>
                <div className="text-xs font-medium text-slate-400">Discharge Summary</div>
                <p className="text-slate-700">{admission.discharge_summary || '—'}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Daily IPD Records</h3>
          <Link to="/clinical/ipd-records" className="text-xs text-[var(--color-primary)] hover:underline">
            Add daily record →
          </Link>
        </div>
        {ipdRecordsQuery.isLoading ? (
          <Spinner />
        ) : (ipdRecordsQuery.data ?? []).length === 0 ? (
          <EmptyState message="No daily records yet." />
        ) : (
          <div className="divide-y divide-slate-100">
            {ipdRecordsQuery.data!.map((rec: any) => (
              <div key={rec.id} className="py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-800">Day {rec.day_number} — {formatDate(rec.ipd_date)}</span>
                  {rec.is_icu && <StatusBadge status="critical" />}
                </div>
                <p className="mt-1 text-sm text-slate-600">{rec.doctor_notes || rec.diagnosis || '—'}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <BedAssignModal open={bedModalOpen} onClose={() => setBedModalOpen(false)} admissionId={admissionId} />
      <DischargeModal open={dischargeModalOpen} onClose={() => setDischargeModalOpen(false)} admissionId={admissionId} />
    </div>
  )

  function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
      <div className="flex justify-between gap-2">
        <dt className="text-slate-400">{label}</dt>
        <dd className="text-right text-slate-800">{value}</dd>
      </div>
    )
  }
}

function BedAssignModal({ open, onClose, admissionId }: { open: boolean; onClose: () => void; admissionId: number }) {
  const queryClient = useQueryClient()
  const [bedId, setBedId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const bedOptions = useReferenceOptions({ endpoint: '/beds', label: (b: any) => `${b.bed_number} — ${b.ward?.name ?? ''}`, params: { status: 'available' } })

  const mutation = useMutation({
    mutationFn: async () => apiClient.post(`/admissions/${admissionId}/transfer`, { bed_id: Number(bedId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] })
      onClose()
      setBedId('')
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    mutation.mutate()
  }

  return (
    <Modal open={open} onClose={onClose} title="Assign / Transfer Bed">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {error && <ErrorBanner message={error} />}
        <Select label="Available Bed" required options={bedOptions} value={bedId} onChange={(e) => setBedId(e.target.value)} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending || !bedId}>
            {mutation.isPending ? 'Saving…' : 'Confirm'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function DischargeModal({ open, onClose, admissionId }: { open: boolean; onClose: () => void; admissionId: number }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ discharge_summary: '', discharge_instructions: '' })
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () => apiClient.post(`/admissions/${admissionId}/discharge`, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] })
      queryClient.invalidateQueries({ queryKey: ['admissions', admissionId] })
      onClose()
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    mutation.mutate()
  }

  return (
    <Modal open={open} onClose={onClose} title="Discharge Patient">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {error && <ErrorBanner message={error} />}
        <Textarea label="Discharge Summary" value={form.discharge_summary} onChange={(e) => setForm({ ...form, discharge_summary: e.target.value })} />
        <Textarea label="Discharge Instructions" value={form.discharge_instructions} onChange={(e) => setForm({ ...form, discharge_instructions: e.target.value })} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" disabled={mutation.isPending}>
            {mutation.isPending ? 'Discharging…' : 'Confirm Discharge'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
