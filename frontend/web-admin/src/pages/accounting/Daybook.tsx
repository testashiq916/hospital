import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { Paginated } from '@/api/types'
import { Card, PageHeader, Spinner, EmptyState } from '@/components/ui/Misc'
import { Input, Select } from '@/components/ui/Field'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, titleCase } from '@/lib/format'
import { useReferenceOptions } from '@/hooks/useReferenceOptions'

export default function DaybookPage() {
  const [page, setPage] = useState(1)
  const [accountCode, setAccountCode] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const accountOptions = useReferenceOptions({ endpoint: '/chart-of-accounts', label: (a: any) => `${a.account_code} — ${a.account_name}` })

  const query = useQuery({
    queryKey: ['daybook', page, accountCode, fromDate, toDate],
    queryFn: async () =>
      (
        await apiClient.get<Paginated<any>>('/daybook', {
          params: {
            page,
            ...(accountCode ? { account_code: accountCode } : {}),
            ...(fromDate ? { from_date: fromDate } : {}),
            ...(toDate ? { to_date: toDate } : {}),
          },
        })
      ).data,
    placeholderData: (prev) => prev,
  })

  const items = query.data?.data ?? []

  return (
    <div>
      <PageHeader title="Daybook" description="Chronological ledger of all posted voucher entries." />
      <Card>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="w-64">
            <Select label="Account" placeholder="All Accounts" options={accountOptions} value={accountCode} onChange={(e) => { setAccountCode(e.target.value); setPage(1) }} />
          </div>
          <Input label="From" type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1) }} className="w-40" />
          <Input label="To" type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1) }} className="w-40" />
        </div>

        {query.isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : items.length === 0 ? (
          <EmptyState message="No ledger entries for this filter." />
        ) : (
          <>
            <Table
              rows={items}
              columns={[
                { key: 'voucher_date', label: 'Date', render: (r) => formatDate(r.voucher_date) },
                { key: 'account_code', label: 'Account' },
                { key: 'voucher_type', label: 'Type', render: (r) => <Badge tone="blue">{titleCase(r.voucher_type)}</Badge> },
                { key: 'drcr', label: 'Dr/Cr', render: (r) => <Badge tone={r.drcr === 'dr' ? 'slate' : 'green'}>{r.drcr.toUpperCase()}</Badge> },
                { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
                { key: 'remarks', label: 'Remarks' },
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
    </div>
  )
}
