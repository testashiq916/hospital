import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, extractErrorMessage } from '@/api/client'
import { Card, PageHeader, Spinner, EmptyState, ErrorBanner } from '@/components/ui/Misc'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Drawer'
import { formatDate, fullName } from '@/lib/format'

export default function LabOrderDetailPage() {
  const { id } = useParams()
  const orderId = Number(id)
  const queryClient = useQueryClient()
  const [resultItem, setResultItem] = useState<any>(null)
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  const query = useQuery({
    queryKey: ['lab-orders', orderId],
    queryFn: async () => (await apiClient.get(`/lab-orders/${orderId}`)).data,
  })

  const collectMutation = useMutation({
    mutationFn: async () => apiClient.post(`/lab-orders/${orderId}/collect`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lab-orders', orderId] }),
  })

  const aiMutation = useMutation({
    mutationFn: async () => (await apiClient.get(`/ai/lab-orders/${orderId}/report-analysis`)).data,
    onSuccess: (data) => setAiAnalysis(data),
    onError: (err) => setAiError(extractErrorMessage(err)),
  })

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  const order = query.data
  if (!order) return <EmptyState message="Lab order not found." />

  const allResulted = (order.items ?? []).every((i: any) => i.result_status !== 'pending')
  const abnormalCount = (order.items ?? []).filter((i: any) => i.is_abnormal).length

  return (
    <div>
      <PageHeader
        title={`Lab Order #${order.id}`}
        description={`${fullName(order.patient)} · Dr. ${fullName(order.doctor)} · Ordered ${formatDate(order.order_date)}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={order.priority} />
            <StatusBadge status={order.status} />
          </div>
        }
      />

      {order.status === 'ordered' && (
        <div className="mb-4">
          <Button onClick={() => collectMutation.mutate()} disabled={collectMutation.isPending}>
            {collectMutation.isPending ? 'Collecting…' : 'Collect Sample'}
          </Button>
        </div>
      )}

      {abnormalCount > 0 && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {abnormalCount} abnormal result{abnormalCount > 1 ? 's' : ''} detected in this order.
        </div>
      )}

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Test Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                <th className="px-3 py-2 font-medium">Test</th>
                <th className="px-3 py-2 font-medium">Result</th>
                <th className="px-3 py-2 font-medium">Range</th>
                <th className="px-3 py-2 font-medium">Unit</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(order.items ?? []).map((item: any) => (
                <tr key={item.id} className={`border-b border-slate-100 last:border-0 ${item.is_abnormal ? 'bg-red-50' : ''}`}>
                  <td className="px-3 py-2.5 text-slate-700">{item.lab_test?.name}</td>
                  <td className={`px-3 py-2.5 font-medium ${item.is_abnormal ? 'text-red-700' : 'text-slate-700'}`}>
                    {item.result ?? item.result_text ?? '—'}
                    {item.is_abnormal && <span className="ml-1">⚠</span>}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">
                    {item.range_low != null && item.range_high != null ? `${item.range_low} – ${item.range_high}` : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">{item.unit ?? '—'}</td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={item.result_status} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {order.status !== 'ordered' && order.status !== 'cancelled' && (
                      <Button size="sm" variant="secondary" onClick={() => setResultItem(item)}>
                        {item.result_status === 'pending' ? 'Enter Result' : 'Edit Result'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {order.status === 'collected' && allResulted && !order.report && (
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setVerifyOpen(true)}>Verify &amp; Generate Report</Button>
          </div>
        )}
      </Card>

      {order.report && (
        <Card className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">{order.report.report_title}</h3>
          <p className="text-sm text-slate-600">{order.report.clinical_interpretation}</p>
          {order.report.recommendation && (
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-medium">Recommendation: </span>
              {order.report.recommendation}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <Badge tone="green">Verified</Badge>
            <span className="text-xs text-slate-400">AI risk score: {order.report.ai_risk_score}%</span>
          </div>
        </Card>
      )}

      {order.status === 'completed' && (
        <Card className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">AI Report Analysis</h3>
            <Button size="sm" variant="secondary" onClick={() => aiMutation.mutate()} disabled={aiMutation.isPending}>
              {aiMutation.isPending ? 'Analyzing…' : 'Run AI Analysis'}
            </Button>
          </div>
          {aiError && <ErrorBanner message={aiError} />}
          {aiAnalysis && (
            <div className="text-sm text-slate-700">
              <p>{aiAnalysis.interpretation}</p>
              <p className="mt-1 text-slate-600">{aiAnalysis.recommendation}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge tone={aiAnalysis.risk_score > 30 ? 'red' : 'green'}>Risk score: {aiAnalysis.risk_score}%</Badge>
                <span className="text-xs text-slate-400">
                  {aiAnalysis.abnormal_count} of {aiAnalysis.total_parameters} parameters abnormal
                </span>
              </div>
              {aiAnalysis.findings?.length > 0 && (
                <ul className="mt-2 list-disc pl-5">
                  {aiAnalysis.findings.map((f: any, i: number) => (
                    <li key={i}>
                      {f.test}: {f.result} {f.unit} ({f.direction}, normal {f.normal_range})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Card>
      )}

      <EnterResultModal item={resultItem} orderId={orderId} onClose={() => setResultItem(null)} />
      <VerifyReportModal open={verifyOpen} orderId={orderId} onClose={() => setVerifyOpen(false)} />
    </div>
  )
}

function EnterResultModal({ item, orderId, onClose }: { item: any; orderId: number; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ result: '', result_text: '', range_low: '', range_high: '', unit: '', remarks: '' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (item) {
      setForm({
        result: item.result ?? '',
        result_text: item.result_text ?? '',
        range_low: item.range_low ?? '',
        range_high: item.range_high ?? '',
        unit: item.unit ?? '',
        remarks: item.remarks ?? '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id])

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? null : v]))
      return apiClient.post(`/lab-orders/${orderId}/items/${item.id}/result`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-orders', orderId] })
      onClose()
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  if (!item) return null

  return (
    <Modal open={!!item} onClose={onClose} title={`Enter Result — ${item.lab_test?.name}`}>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          setError(null)
          mutation.mutate()
        }}
        className="flex flex-col gap-3"
      >
        {error && <ErrorBanner message={error} />}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Result (numeric)" type="number" step="0.01" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} />
          <Input label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          <Input label="Normal Range Low" type="number" step="0.01" value={form.range_low} onChange={(e) => setForm({ ...form, range_low: e.target.value })} />
          <Input label="Normal Range High" type="number" step="0.01" value={form.range_high} onChange={(e) => setForm({ ...form, range_high: e.target.value })} />
        </div>
        <Textarea label="Result Text (for qualitative tests)" value={form.result_text} onChange={(e) => setForm({ ...form, result_text: e.target.value })} />
        <Textarea label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save Result'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function VerifyReportModal({ open, orderId, onClose }: { open: boolean; orderId: number; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ report_title: 'Laboratory Report', clinical_interpretation: '', recommendation: '' })
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () => apiClient.post(`/lab-orders/${orderId}/verify`, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-orders', orderId] })
      onClose()
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  return (
    <Modal open={open} onClose={onClose} title="Verify & Generate Report">
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          setError(null)
          mutation.mutate()
        }}
        className="flex flex-col gap-3"
      >
        {error && <ErrorBanner message={error} />}
        <Input label="Report Title" value={form.report_title} onChange={(e) => setForm({ ...form, report_title: e.target.value })} />
        <Textarea label="Clinical Interpretation" value={form.clinical_interpretation} onChange={(e) => setForm({ ...form, clinical_interpretation: e.target.value })} />
        <Textarea label="Recommendation" value={form.recommendation} onChange={(e) => setForm({ ...form, recommendation: e.target.value })} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Verifying…' : 'Verify & Report'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
