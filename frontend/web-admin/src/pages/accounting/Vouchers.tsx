import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, extractErrorMessage } from '@/api/client'
import type { Paginated } from '@/api/types'
import { Card, PageHeader, Spinner, EmptyState, ErrorBanner } from '@/components/ui/Misc'
import { Select, Input, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { Badge } from '@/components/ui/Badge'
import { Drawer, Modal } from '@/components/ui/Drawer'
import { formatCurrency, formatDate, titleCase } from '@/lib/format'
import { useReferenceOptions } from '@/hooks/useReferenceOptions'

interface JournalLine {
  account_code: string
  drcr: 'dr' | 'cr'
  amount: string
  remarks: string
}

const emptyLine: JournalLine = { account_code: '', drcr: 'dr', amount: '', remarks: '' }

export default function VouchersPage() {
  const [page, setPage] = useState(1)
  const [voucherType, setVoucherType] = useState('')
  const [open, setOpen] = useState(false)
  const [viewVoucher, setViewVoucher] = useState<any>(null)

  const query = useQuery({
    queryKey: ['vouchers', page, voucherType],
    queryFn: async () =>
      (await apiClient.get<Paginated<any>>('/vouchers', { params: { page, ...(voucherType ? { voucher_type: voucherType } : {}) } })).data,
    placeholderData: (prev) => prev,
  })

  const items = query.data?.data ?? []

  return (
    <div>
      <PageHeader
        title="Vouchers"
        description="Every bill, payment and manual journal entry posts a balanced double-entry voucher."
        actions={<Button onClick={() => setOpen(true)}>+ New Journal Entry</Button>}
      />

      <Card>
        <div className="mb-4 w-52">
          <Select
            label="Voucher Type"
            placeholder="All Types"
            value={voucherType}
            onChange={(e) => { setVoucherType(e.target.value); setPage(1) }}
            options={['billing', 'receipt', 'payment', 'journal', 'insurance'].map((v) => ({ value: v, label: v }))}
          />
        </div>

        {query.isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : items.length === 0 ? (
          <EmptyState message="No vouchers yet." />
        ) : (
          <>
            <Table
              rows={items}
              onRowClick={(row) => setViewVoucher(row)}
              columns={[
                { key: 'voucher_no', label: 'Voucher #', render: (r) => r.voucher_no ?? `#${r.id}` },
                { key: 'voucher_type', label: 'Type', render: (r) => <Badge tone="blue">{titleCase(r.voucher_type)}</Badge> },
                { key: 'voucher_date', label: 'Date', render: (r) => formatDate(r.voucher_date) },
                { key: 'narration', label: 'Narration' },
                { key: 'total_amount', label: 'Amount', render: (r) => formatCurrency(r.total_debit ?? r.total_amount) },
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

      <NewJournalDrawer open={open} onClose={() => setOpen(false)} />
      <VoucherViewModal voucher={viewVoucher} onClose={() => setViewVoucher(null)} />
    </div>
  )
}

function VoucherViewModal({ voucher, onClose }: { voucher: any; onClose: () => void }) {
  const detailQuery = useQuery({
    queryKey: ['vouchers', voucher?.id],
    queryFn: async () => (await apiClient.get(`/vouchers/${voucher.id}`)).data,
    enabled: !!voucher,
  })

  if (!voucher) return null

  return (
    <Modal open={!!voucher} onClose={onClose} title={`Voucher ${voucher.voucher_no ?? '#' + voucher.id}`}>
      {detailQuery.isLoading ? (
        <Spinner />
      ) : (
        <div className="divide-y divide-slate-100 text-sm">
          {(detailQuery.data?.entries ?? []).map((e: any) => (
            <div key={e.id} className="flex justify-between py-1.5">
              <span className="text-slate-600">
                {e.account_code} {e.remarks ? `— ${e.remarks}` : ''}
              </span>
              <span className={e.drcr === 'dr' ? 'text-slate-800' : 'text-green-700'}>
                {e.drcr.toUpperCase()} {formatCurrency(e.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

function NewJournalDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [narration, setNarration] = useState('')
  const [lines, setLines] = useState<JournalLine[]>([{ ...emptyLine, drcr: 'dr' }, { ...emptyLine, drcr: 'cr' }])
  const [error, setError] = useState<string | null>(null)

  const accountOptions = useReferenceOptions({ endpoint: '/chart-of-accounts', label: (a: any) => `${a.account_code} — ${a.account_name}` })

  const totalDr = lines.filter((l) => l.drcr === 'dr').reduce((s, l) => s + Number(l.amount || 0), 0)
  const totalCr = lines.filter((l) => l.drcr === 'cr').reduce((s, l) => s + Number(l.amount || 0), 0)
  const balanced = lines.length >= 2 && totalDr > 0 && Math.abs(totalDr - totalCr) < 0.01

  const mutation = useMutation({
    mutationFn: async () =>
      apiClient.post('/vouchers/journal', {
        narration: narration || null,
        lines: lines.map((l) => ({ account_code: l.account_code, drcr: l.drcr, amount: Number(l.amount), remarks: l.remarks || null })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
      onClose()
      setLines([{ ...emptyLine, drcr: 'dr' }, { ...emptyLine, drcr: 'cr' }])
      setNarration('')
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function updateLine(idx: number, patch: Partial<JournalLine>) {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    mutation.mutate()
  }

  return (
    <Drawer open={open} onClose={onClose} title="New Journal Entry">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <ErrorBanner message={error} />}
        <Textarea label="Narration" value={narration} onChange={(e) => setNarration(e.target.value)} />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Lines</span>
            <Button type="button" size="sm" variant="secondary" onClick={() => setLines((prev) => [...prev, { ...emptyLine }])}>
              + Add Line
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {lines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-12 items-end gap-2">
                <div className="col-span-4">
                  <Select label={idx === 0 ? 'Account' : undefined} options={accountOptions} value={line.account_code} onChange={(e) => updateLine(idx, { account_code: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Select
                    label={idx === 0 ? 'Dr/Cr' : undefined}
                    value={line.drcr}
                    onChange={(e) => updateLine(idx, { drcr: e.target.value as 'dr' | 'cr' })}
                    options={[{ value: 'dr', label: 'Debit' }, { value: 'cr', label: 'Credit' }]}
                  />
                </div>
                <div className="col-span-2">
                  <Input label={idx === 0 ? 'Amount' : undefined} type="number" step="0.01" value={line.amount} onChange={(e) => updateLine(idx, { amount: e.target.value })} />
                </div>
                <div className="col-span-3">
                  <Input label={idx === 0 ? 'Remarks' : undefined} value={line.remarks} onChange={(e) => updateLine(idx, { remarks: e.target.value })} />
                </div>
                <div className="col-span-1">
                  {lines.length > 2 && (
                    <button type="button" className="cursor-pointer text-xs text-red-600" onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}>
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className={`mt-2 rounded-md px-3 py-2 text-xs ${balanced ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            Debit total: {formatCurrency(totalDr)} · Credit total: {formatCurrency(totalCr)} {balanced ? '· Balanced ✓' : '· Must balance before posting'}
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending || !balanced}>
            {mutation.isPending ? 'Posting…' : 'Post Journal Entry'}
          </Button>
        </div>
      </form>
    </Drawer>
  )
}
