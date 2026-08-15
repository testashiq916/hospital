import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient } from '@/api/client'
import type { Paginated } from '@/api/types'
import type { Patient } from '@/api/patients'
import { PageHeader, Card, Spinner, EmptyState } from '@/components/ui/Misc'
import { Input, Select } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { Badge } from '@/components/ui/Badge'
import { formatDate, fullName } from '@/lib/format'

export default function PatientsListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [registrationType, setRegistrationType] = useState('')

  const query = useQuery({
    queryKey: ['patients', 'list', page, search, registrationType],
    queryFn: async () => {
      const res = await apiClient.get<Paginated<Patient>>('/patients', {
        params: {
          page,
          ...(search ? { search } : {}),
          ...(registrationType ? { registration_type: registrationType } : {}),
        },
      })
      return res.data
    },
    placeholderData: (prev) => prev,
  })

  const items = query.data?.data ?? []

  return (
    <div>
      <PageHeader
        title="Patients"
        description="Search, register and manage patient records."
        actions={
          <Link to="/patients/new">
            <Button>+ Register Patient</Button>
          </Link>
        }
      />

      <Card>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="w-72">
            <Input
              label="Search"
              placeholder="Name, patient ID or mobile…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div className="w-52">
            <Select
              label="Registration Type"
              placeholder="All Types"
              value={registrationType}
              onChange={(e) => {
                setRegistrationType(e.target.value)
                setPage(1)
              }}
              options={[
                { value: 'opd', label: 'OPD' },
                { value: 'ipd', label: 'IPD' },
                { value: 'emergency', label: 'Emergency' },
              ]}
            />
          </div>
        </div>

        {query.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <EmptyState message="No patients found." />
        ) : (
          <>
            <Table
              rows={items}
              onRowClick={(row) => navigate(`/patients/${row.id}`)}
              columns={[
                { key: 'patient_id', label: 'Patient ID' },
                { key: 'name', label: 'Name', render: (r) => fullName(r) },
                { key: 'gender', label: 'Gender', render: (r) => <span className="capitalize">{r.gender}</span> },
                { key: 'age', label: 'Age' },
                { key: 'mobile', label: 'Mobile' },
                {
                  key: 'registration_type',
                  label: 'Type',
                  render: (r) => <Badge tone="blue">{(r.registration_type ?? 'opd').toUpperCase()}</Badge>,
                },
                { key: 'registration_date', label: 'Registered', render: (r) => formatDate(r.registration_date) },
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
