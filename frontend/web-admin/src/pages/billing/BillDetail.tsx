import { useState } from 'react'
import type { FormEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, extractErrorMessage } from '@/api/client'
import { Card, PageHeader, Spinner, EmptyState, ErrorBanner } from '@/components/ui/Misc'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Drawer'
import { formatCurrency, formatDate, fullName, titleCase } from '@/lib/format'

const PAYMENT_METHODS = ['cash', 'card', 'upi', 'insurance', 'tpa', 'cheque', 'bank_transfer']

export default function BillDetailPage() {
  const { id } = useParams()
  const billId = Number(id)
  const [payOpen, setPayOpen] = useState(false)

  const query = useQuery({
    queryKey: ['bills', billId],
    queryFn: async () => (await apiClient.get(`/bills/${billId}`)).data,
  })

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  const bill = query.data
  if (!bill) return <EmptyState message="Bill not found." />

  return (
    <div>
      <PageHeader
        title={`Bill ${bill.bill_id ?? '#' + bill.id}`}
        description={`${fullName(bill.patient)} · ${titleCase(bill.bill_type)} · ${formatDate(bill.bill_date)}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={bill.payment_status} />
            {bill.balance_amount > 0 && <Button size="sm" onClick={() => setPayOpen(true)}>Collect Payment</Button>}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Line Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <th className="px-2 py-2 font-medium">Description</th>
                  <th className="px-2 py-2 font-medium">Qty</th>
                  <th className="px-2 py-2 font-medium">Unit Price</th>
                  <th className="px-2 py-2 font-medium">GST</th>
                  <th className="px-2 py-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(bill.items ?? []).map((item: any) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-2 py-2 text-slate-700">{item.description}</td>
                    <td className="px-2 py-2 text-slate-500">{item.quantity}</td>
                    <td className="px-2 py-2 text-slate-500">{formatCurrency(item.unit_price)}</td>
                    <td className="px-2 py-2 text-slate-500">{formatCurrency(item.gst_amount)}</td>
                    <td className="px-2 py-2 text-right text-slate-700">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 ml-auto w-64 space-y-1 text-sm">
            <Row label="Subtotal" value={formatCurrency(bill.subtotal)} />
            <Row label="Discount" value={`- ${formatCurrency(bill.discount_amount)}`} />
            <Row label="GST" value={formatCurrency(bill.tax_amount)} />
            <Row label="Service Charge" value={formatCurrency(bill.service_charge)} />
            <Row label="Total" value={formatCurrency(bill.total_amount)} strong />
            <Row label="Paid" value={formatCurrency(bill.paid_amount)} />
            <Row label="Balance" value={formatCurrency(bill.balance_amount)} strong />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Payments</h3>
            {(bill.payments ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">No payments recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {bill.payments.map((p: any) => (
                  <div key={p.id} className="py-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-700">{formatCurrency(p.amount)}</span>
                      <span className="text-slate-400">{titleCase(p.payment_method)}</span>
                    </div>
                    <div className="text-xs text-slate-400">{formatDate(p.payment_date)}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {bill.voucher && (
            <Card>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Ledger Voucher</h3>
                <Link to="/accounting/daybook" className="text-xs text-[var(--color-primary)] hover:underline">
                  Daybook →
                </Link>
              </div>
              <p className="mb-2 text-xs text-slate-500">{bill.voucher.voucher_no ?? `#${bill.voucher.id}`} — {titleCase(bill.voucher.voucher_type)}</p>
              <div className="divide-y divide-slate-100 text-sm">
                {(bill.voucher.entries ?? []).map((e: any) => (
                  <div key={e.id} className="flex justify-between py-1.5">
                    <span className="text-slate-600">{e.account_code} {e.remarks ? `— ${e.remarks}` : ''}</span>
                    <span className={e.drcr === 'dr' ? 'text-slate-700' : 'text-green-700'}>
                      {e.drcr.toUpperCase()} {formatCurrency(e.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <RecordPaymentModal open={payOpen} onClose={() => setPayOpen(false)} bill={bill} />
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

function RecordPaymentModal({ open, onClose, bill }: { open: boolean; onClose: () => void; bill: any }) {
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState(String(bill.balance_amount))
  const [method, setMethod] = useState('cash')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () => apiClient.post('/payments', { bill_id: bill.id, amount: Number(amount), payment_method: method }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', bill.id] })
      queryClient.invalidateQueries({ queryKey: ['bills'] })
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
    <Modal open={open} onClose={onClose} title="Collect Payment">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {error && <ErrorBanner message={error} />}
        <p className="text-sm text-slate-500">Balance due: {formatCurrency(bill.balance_amount)}</p>
        <Input label="Amount" type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Select label="Payment Method" value={method} onChange={(e) => setMethod(e.target.value)} options={PAYMENT_METHODS.map((v) => ({ value: v, label: v }))} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Recording…' : 'Record Payment'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
