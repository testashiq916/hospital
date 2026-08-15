import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { apiClient } from '@/api/client'
import type { Paginated } from '@/api/types'
import { Card, PageHeader, Spinner, EmptyState } from '@/components/ui/Misc'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, fullName, titleCase } from '@/lib/format'

export default function PaymentsListPage() {
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: ['payments', page],
    queryFn: async () => (await apiClient.get<Paginated<any>>('/payments', { params: { page } })).data,
    placeholderData: (prev) => prev,
  })

  const items = query.data?.data ?? []

  return (
    <div>
      <PageHeader title="Payments" description="All payments collected against patient bills." />
      <Card>
        {query.isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : items.length === 0 ? (
          <EmptyState message="No payments recorded yet." />
        ) : (
          <>
            <Table
              rows={items}
              columns={[
                { key: 'bill', label: 'Bill', render: (r) => <Link to={`/billing/bills/${r.bill_id}`} className="text-[var(--color-primary)] hover:underline">{r.bill?.bill_id ?? `#${r.bill_id}`}</Link> },
                { key: 'patient', label: 'Patient', render: (r) => fullName(r.patient) },
                { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
                { key: 'payment_method', label: 'Method', render: (r) => <Badge tone="blue">{titleCase(r.payment_method)}</Badge> },
                { key: 'payment_date', label: 'Date', render: (r) => formatDate(r.payment_date) },
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
