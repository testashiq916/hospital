import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { Card, PageHeader, Spinner, EmptyState } from '@/components/ui/Misc'
import { Select } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { fullName } from '@/lib/format'
import { useReferenceOptions } from '@/hooks/useReferenceOptions'

interface QueueToken {
  id: number
  token_number: number
  queue_status: string
  called_at: string | null
  started_at: string | null
  completed_at: string | null
  patient: any
  doctor: any
}

export default function QueueBoardPage() {
  const queryClient = useQueryClient()
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  const doctorOptions = useReferenceOptions({ endpoint: '/doctors', label: (d: any) => `Dr. ${fullName(d)}` })

  const query = useQuery({
    queryKey: ['queue-tokens', doctorId, date],
    queryFn: async () =>
      (
        await apiClient.get<QueueToken[]>('/queue-tokens', {
          params: { ...(doctorId ? { doctor_id: doctorId } : {}), date },
        })
      ).data,
    refetchInterval: 15_000,
  })

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: 'call' | 'start' | 'complete' | 'skip' }) =>
      apiClient.post(`/queue-tokens/${id}/${action}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['queue-tokens'] }),
  })

  const tokens = query.data ?? []
  const columns: { status: string; label: string; tone: 'amber' | 'blue' | 'purple' | 'green' | 'red' }[] = [
    { status: 'waiting', label: 'Waiting', tone: 'amber' },
    { status: 'called', label: 'Called', tone: 'purple' },
    { status: 'in_progress', label: 'In Progress', tone: 'blue' },
    { status: 'completed', label: 'Completed', tone: 'green' },
  ]

  return (
    <div>
      <PageHeader title="Doctor Queue Board" description="Live token board — call, start, complete or skip patients." />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-64">
          <Select label="Doctor" placeholder="All Doctors" options={doctorOptions} value={doctorId} onChange={(e) => setDoctorId(e.target.value)} />
        </div>
        <div className="w-44">
          <label className="block text-left">
            <span className="mb-1 block text-xs font-medium text-slate-600">Date</span>
            <input
              type="date"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </div>
      </div>

      {query.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : tokens.length === 0 ? (
        <EmptyState message="No tokens for this date." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {columns.map((col) => (
            <Card key={col.status} className="flex flex-col gap-2">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">{col.label}</h3>
                <StatusBadge status={col.status} />
              </div>
              {tokens
                .filter((t) => t.queue_status === col.status)
                .map((t) => (
                  <div key={t.id} className="rounded-md border border-slate-200 p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-800">#{t.token_number}</span>
                    </div>
                    <div className="text-xs text-slate-600">{fullName(t.patient)}</div>
                    <div className="text-[11px] text-slate-400">Dr. {fullName(t.doctor)}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {col.status === 'waiting' && (
                        <>
                          <Button size="sm" onClick={() => actionMutation.mutate({ id: t.id, action: 'call' })}>
                            Call
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => actionMutation.mutate({ id: t.id, action: 'skip' })}>
                            Skip
                          </Button>
                        </>
                      )}
                      {col.status === 'called' && (
                        <Button size="sm" onClick={() => actionMutation.mutate({ id: t.id, action: 'start' })}>
                          Start Consult
                        </Button>
                      )}
                      {col.status === 'in_progress' && (
                        <Button size="sm" onClick={() => actionMutation.mutate({ id: t.id, action: 'complete' })}>
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              {tokens.filter((t) => t.queue_status === col.status).length === 0 && (
                <p className="py-6 text-center text-xs text-slate-300">Empty</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
