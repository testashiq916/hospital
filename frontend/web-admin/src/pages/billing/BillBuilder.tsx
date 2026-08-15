import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiClient, extractErrorMessage } from '@/api/client'
import { Card, PageHeader, ErrorBanner } from '@/components/ui/Misc'
import { Select, Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { formatCurrency, fullName } from '@/lib/format'
import { useReferenceOptions } from '@/hooks/useReferenceOptions'
import { useAuth } from '@/auth/AuthContext'

interface BillLine {
  description: string
  item_type: string
  quantity: string
  unit_price: string
  discount_percent: string
  gst_rate: string
}

const emptyLine: BillLine = { description: '', item_type: 'consultation', quantity: '1', unit_price: '', discount_percent: '0', gst_rate: '0' }

const ITEM_TYPES = ['consultation', 'opd', 'lab', 'radiology', 'room', 'ipd', 'pharmacy', 'procedure', 'discharge', 'emergency']
const BILL_TYPES = ['opd', 'ipd', 'emergency', 'pharmacy', 'lab', 'radiology', 'procedure', 'discharge']

function lineTotal(l: BillLine): number {
  const qty = Number(l.quantity || 0)
  const price = Number(l.unit_price || 0)
  const gross = qty * price
  const discount = gross * (Number(l.discount_percent || 0) / 100)
  const taxable = gross - discount
  const gst = taxable * (Number(l.gst_rate || 0) / 100)
  return taxable + gst
}

export default function BillBuilderPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [patientId, setPatientId] = useState('')
  const [billType, setBillType] = useState('opd')
  const [discountAmount, setDiscountAmount] = useState('0')
  const [serviceCharge, setServiceCharge] = useState('0')
  const [lines, setLines] = useState<BillLine[]>([{ ...emptyLine }])
  const [error, setError] = useState<string | null>(null)

  const patientOptions = useReferenceOptions({ endpoint: '/patients', label: (p: any) => `${fullName(p)} (${p.patient_id})` })

  const subtotal = lines.reduce((sum, l) => sum + lineTotal(l), 0)
  const grandTotal = Math.max(0, subtotal - Number(discountAmount || 0) + Number(serviceCharge || 0))

  const mutation = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post('/bills', {
          hospital_id: user?.hospital_id,
          patient_id: Number(patientId),
          bill_type: billType,
          discount_amount: Number(discountAmount || 0),
          service_charge: Number(serviceCharge || 0),
          items: lines
            .filter((l) => l.description && l.unit_price)
            .map((l) => ({
              description: l.description,
              item_type: l.item_type,
              quantity: Number(l.quantity || 1),
              unit_price: Number(l.unit_price),
              discount_percent: Number(l.discount_percent || 0),
              gst_rate: Number(l.gst_rate || 0),
            })),
        })
      ).data,
    onSuccess: (data) => navigate(`/billing/bills/${data.id}`),
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function updateLine(idx: number, patch: Partial<BillLine>) {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    mutation.mutate()
  }

  return (
    <div>
      <PageHeader title="New Bill" description="Build an itemized bill with automatic GST and ledger posting." />
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <ErrorBanner message={error} />}
          <div className="grid grid-cols-2 gap-4">
            <Select label="Patient" required options={patientOptions} value={patientId} onChange={(e) => setPatientId(e.target.value)} />
            <Select label="Bill Type" value={billType} onChange={(e) => setBillType(e.target.value)} options={BILL_TYPES.map((v) => ({ value: v, label: v }))} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Line Items</span>
              <Button type="button" size="sm" variant="secondary" onClick={() => setLines((prev) => [...prev, { ...emptyLine }])}>
                + Add Line
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                    <th className="px-2 py-2 font-medium">Description</th>
                    <th className="px-2 py-2 font-medium">Type</th>
                    <th className="px-2 py-2 font-medium">Qty</th>
                    <th className="px-2 py-2 font-medium">Unit Price</th>
                    <th className="px-2 py-2 font-medium">Disc %</th>
                    <th className="px-2 py-2 font-medium">GST %</th>
                    <th className="px-2 py-2 font-medium text-right">Total</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, idx) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-0">
                      <td className="px-2 py-1.5">
                        <Input value={line.description} onChange={(e) => updateLine(idx, { description: e.target.value })} className="w-48" />
                      </td>
                      <td className="px-2 py-1.5">
                        <select
                          className="w-32 rounded-md border border-slate-300 px-2 py-2 text-sm"
                          value={line.item_type}
                          onChange={(e) => updateLine(idx, { item_type: e.target.value })}
                        >
                          {ITEM_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <Input type="number" value={line.quantity} onChange={(e) => updateLine(idx, { quantity: e.target.value })} className="w-16" />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input type="number" step="0.01" value={line.unit_price} onChange={(e) => updateLine(idx, { unit_price: e.target.value })} className="w-24" />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input type="number" step="0.01" value={line.discount_percent} onChange={(e) => updateLine(idx, { discount_percent: e.target.value })} className="w-16" />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input type="number" step="0.01" value={line.gst_rate} onChange={(e) => updateLine(idx, { gst_rate: e.target.value })} className="w-16" />
                      </td>
                      <td className="px-2 py-1.5 text-right text-slate-700">{formatCurrency(lineTotal(line))}</td>
                      <td className="px-2 py-1.5">
                        {lines.length > 1 && (
                          <button
                            type="button"
                            className="cursor-pointer text-xs text-red-600"
                            onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-end gap-4 border-t border-slate-100 pt-4">
            <Input label="Bill Discount (₹)" type="number" step="0.01" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} className="w-40" />
            <Input label="Service Charge (₹)" type="number" step="0.01" value={serviceCharge} onChange={(e) => setServiceCharge(e.target.value)} className="w-40" />
            <div className="text-right">
              <div className="text-xs text-slate-400">Grand Total</div>
              <div className="text-xl font-semibold text-slate-900">{formatCurrency(grandTotal)}</div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => navigate('/billing/bills')}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Generating…' : 'Generate Bill'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
