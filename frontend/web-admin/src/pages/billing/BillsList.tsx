import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { apiClient } from '@/api/client'
import type { Paginated } from '@/api/types'
import { Card, PageHeader, Spinner, EmptyState } from '@/components/ui/Misc'
import { Select } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, fullName, titleCase } from '@/lib/format'

export default function BillsListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [paymentStatus, setPaymentStatus] = useState('')
  const [billType, setBillType] = useState('')

  const query = useQuery({
    queryKey: ['bills', page, paymentStatus, billType],
    queryFn: async () =>
      (
        await apiClient.get<Paginated<any>>('/bills', {
          params: { page, ...(paymentStatus ? { payment_status: paymentStatus } : {}), ...(billType ? { bill_type: billType } : {}) },
        })
      ).data,
    placeholderData: (prev) => prev,
  })

  const items = query.data?.data ?? []

  return (
    <div>
      <PageHeader
        title="Bills"
        description="Itemized billing with automatic GST calculation and ledger posting."
        actions={
          <Link to="/billing/bills/new">
            <Button>+ New Bill</Button>
          </Link>
        }
      />

      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="w-48">
            <Select
              label="Payment Status"
              placeholder="All"
              value={paymentStatus}
              onChange={(e) => { setPaymentStatus(e.target.value); setPage(1) }}
              options={['paid', 'partial', 'pending'].map((v) => ({ value: v, label: v }))}
            />
          </div>
          <div className="w-48">
            <Select
              label="Bill Type"
              placeholder="All"
              value={billType}
              onChange={(e) => { setBillType(e.target.value); setPage(1) }}
              options={['opd', 'ipd', 'emergency', 'pharmacy', 'lab', 'radiology', 'procedure', 'discharge'].map((v) => ({ value: v, label: v }))}
            />
          </div>
        </div>

        {query.isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : items.length === 0 ? (
          <EmptyState message="No bills yet." />
        ) : (
          <>
            <Table
              rows={items}
              onRowClick={(row) => navigate(`/billing/bills/${row.id}`)}
              columns={[
                { key: 'bill_id', label: 'Bill #' },
                { key: 'patient', label: 'Patient', render: (r) => fullName(r.patient) },
                { key: 'bill_type', label: 'Type', render: (r) => titleCase(r.bill_type) },
                { key: 'total_amount', label: 'Total', render: (r) => formatCurrency(r.total_amount) },
                { key: 'balance_amount', label: 'Balance', render: (r) => formatCurrency(r.balance_amount) },
                { key: 'bill_date', label: 'Date', render: (r) => formatDate(r.bill_date) },
                { key: 'payment_status', label: 'Status', render: (r) => <StatusBadge status={r.payment_status} /> },
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
