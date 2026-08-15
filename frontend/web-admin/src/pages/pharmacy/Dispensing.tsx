import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, extractErrorMessage } from '@/api/client'
import type { Paginated } from '@/api/types'
import { Card, PageHeader, Spinner, EmptyState, ErrorBanner, SuccessBanner } from '@/components/ui/Misc'
import { Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, fullName } from '@/lib/format'

interface DispenseLine {
  medicine_id: number
  name: string
  stock: number
  requested: number
  unit_price: number
  discount_percent: number
}

export default function DispensingPage() {
  const queryClient = useQueryClient()
  const [prescriptionId, setPrescriptionId] = useState('')
  const [lines, setLines] = useState<DispenseLine[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const prescriptionsQuery = useQuery({
    queryKey: ['prescriptions', 'pending-dispense'],
    queryFn: async () => (await apiClient.get<Paginated<any>>('/prescriptions', { params: { per_page: 100 } })).data.data,
  })

  const pending = (prescriptionsQuery.data ?? []).filter((p) => p.status !== 'completed')

  const selectedPrescriptionQuery = useQuery({
    queryKey: ['prescriptions', prescriptionId],
    queryFn: async () => (await apiClient.get(`/prescriptions/${prescriptionId}`)).data,
    enabled: !!prescriptionId,
  })

  function loadPrescription(id: string) {
    setPrescriptionId(id)
    setSuccess(null)
    setError(null)
    setLines([])
  }

  const prescription = selectedPrescriptionQuery.data

  // Populate editable dispensing lines once the prescription detail arrives.
  useEffect(() => {
    if (prescription?.items?.length > 0) {
      setLines(
        prescription.items.map((item: any) => ({
          medicine_id: item.medicine_id,
          name: item.medicine?.name ?? `Medicine #${item.medicine_id}`,
          stock: item.medicine?.current_stock ?? 0,
          requested: item.quantity,
          unit_price: Number(item.medicine?.price ?? 0),
          discount_percent: 0,
        })),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prescription?.id])

  const dispenseMutation = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post('/pharmacy-dispensing', {
          prescription_id: Number(prescriptionId),
          items: lines.map((l) => ({
            medicine_id: l.medicine_id,
            quantity: l.requested,
            unit_price: l.unit_price,
            discount_percent: l.discount_percent,
          })),
        })
      ).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
      setSuccess('Dispensed successfully. Stock has been updated.')
      setPrescriptionId('')
      setLines([])
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function updateLine(idx: number, patch: Partial<DispenseLine>) {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)))
  }

  const total = lines.reduce((sum, l) => {
    const gross = l.unit_price * l.requested
    const discount = gross * (l.discount_percent / 100)
    return sum + (gross - discount)
  }, 0)

  return (
    <div>
      <PageHeader title="Pharmacy Dispensing" description="Dispense a prescription with a live stock check." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Pending Prescriptions</h3>
          {prescriptionsQuery.isLoading ? (
            <Spinner />
          ) : pending.length === 0 ? (
            <EmptyState message="Nothing pending dispensing." />
          ) : (
            <div className="flex flex-col gap-1.5">
              {pending.map((p) => (
                <button
                  key={p.id}
                  onClick={() => loadPrescription(String(p.id))}
                  className={`cursor-pointer rounded-md border px-3 py-2 text-left text-sm ${
                    String(p.id) === prescriptionId ? 'border-[var(--color-primary)] bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-medium text-slate-800">{fullName(p.patient)}</div>
                  <div className="text-xs text-slate-500">Dr. {fullName(p.doctor)} · {formatDate(p.prescription_date)}</div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          {!prescriptionId ? (
            <EmptyState message="Select a prescription to dispense." />
          ) : selectedPrescriptionQuery.isLoading ? (
            <Spinner />
          ) : (
            <>
              {error && <div className="mb-3"><ErrorBanner message={error} /></div>}
              {success && <div className="mb-3"><SuccessBanner message={success} /></div>}
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">{fullName(prescription?.patient)}</h3>
                  <p className="text-xs text-slate-500">Dr. {fullName(prescription?.doctor)} · {formatDate(prescription?.prescription_date)}</p>
                </div>
                <StatusBadge status={prescription?.status ?? 'active'} />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                      <th className="px-2 py-2 font-medium">Medicine</th>
                      <th className="px-2 py-2 font-medium">Stock</th>
                      <th className="px-2 py-2 font-medium">Qty</th>
                      <th className="px-2 py-2 font-medium">Unit Price</th>
                      <th className="px-2 py-2 font-medium">Discount %</th>
                      <th className="px-2 py-2 font-medium text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, idx) => {
                      const insufficient = line.requested > line.stock
                      const gross = line.unit_price * line.requested
                      const lineTotal = gross - gross * (line.discount_percent / 100)
                      return (
                        <tr key={line.medicine_id} className={`border-b border-slate-100 last:border-0 ${insufficient ? 'bg-red-50' : ''}`}>
                          <td className="px-2 py-2 text-slate-700">{line.name}</td>
                          <td className={`px-2 py-2 ${insufficient ? 'font-semibold text-red-600' : 'text-slate-500'}`}>{line.stock}</td>
                          <td className="px-2 py-2">
                            <Input
                              type="number"
                              min={1}
                              value={line.requested}
                              className="w-20"
                              onChange={(e) => updateLine(idx, { requested: Number(e.target.value) })}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={line.unit_price}
                              className="w-24"
                              onChange={(e) => updateLine(idx, { unit_price: Number(e.target.value) })}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={line.discount_percent}
                              className="w-20"
                              onChange={(e) => updateLine(idx, { discount_percent: Number(e.target.value) })}
                            />
                          </td>
                          <td className="px-2 py-2 text-right text-slate-700">{formatCurrency(lineTotal)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {lines.some((l) => l.requested > l.stock) && (
                <p className="mt-2 text-xs text-red-600">
                  One or more items exceed available stock — reduce quantity or restock before dispensing.
                </p>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm font-semibold text-slate-800">Total: {formatCurrency(total)}</span>
                <Button
                  onClick={() => {
                    setError(null)
                    dispenseMutation.mutate()
                  }}
                  disabled={dispenseMutation.isPending || lines.length === 0 || lines.some((l) => l.requested > l.stock)}
                >
                  {dispenseMutation.isPending ? 'Dispensing…' : 'Dispense'}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

