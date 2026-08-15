import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, extractErrorMessage } from '@/api/client'
import type { Paginated } from '@/api/types'
import type { ResourceConfig } from './types'
import { PageHeader, EmptyState, Card, Spinner } from '@/components/ui/Misc'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { Drawer } from '@/components/ui/Drawer'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ResourceForm } from './ResourceForm'
import { useReferenceOptions } from '@/hooks/useReferenceOptions'

export function ResourcePage<T extends { id: number }>({ config }: { config: ResourceConfig<T> }) {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [drawerState, setDrawerState] = useState<{ mode: 'create' | 'edit'; row?: T } | null>(null)
  const [deleteRow, setDeleteRow] = useState<T | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const listParams: Record<string, string | number> = {
    page,
    ...config.fixedParams,
    ...(search ? { search } : {}),
    ...Object.fromEntries(Object.entries(filterValues).filter(([, v]) => v !== '')),
  }

  const listQuery = useQuery({
    queryKey: [config.key, 'list', listParams],
    queryFn: async () => {
      const res = await apiClient.get<Paginated<T>>(config.endpoint, { params: listParams })
      return res.data
    },
    placeholderData: (prev) => prev,
  })

  const createMutation = useMutation({
    mutationFn: async (values: Record<string, any>) => {
      const res = await apiClient.post(config.endpoint, values)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.key] })
      setDrawerState(null)
      setFormError(null)
    },
    onError: (err) => setFormError(extractErrorMessage(err)),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: Record<string, any> }) => {
      const res = await apiClient.put(`${config.endpoint}/${id}`, values)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.key] })
      setDrawerState(null)
      setFormError(null)
    },
    onError: (err) => setFormError(extractErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${config.endpoint}/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.key] })
      setDeleteRow(null)
    },
  })

  const items = listQuery.data?.data ?? []

  return (
    <div>
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          config.canCreate !== false ? (
            <Button
              onClick={() => {
                setFormError(null)
                setDrawerState({ mode: 'create' })
              }}
            >
              + New {config.singular}
            </Button>
          ) : undefined
        }
      />

      <Card>
        {(config.searchable || (config.filters && config.filters.length > 0)) && (
          <div className="mb-4 flex flex-wrap items-end gap-3">
            {config.searchable && (
              <div className="w-64">
                <Input
                  label="Search"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                />
              </div>
            )}
            {config.filters?.map((filter) => (
              <FilterField
                key={filter.name}
                filter={filter}
                value={filterValues[filter.name] ?? ''}
                onChange={(v) => {
                  setFilterValues((prev) => ({ ...prev, [filter.name]: v }))
                  setPage(1)
                }}
              />
            ))}
          </div>
        )}

        {listQuery.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <Table
              columns={config.columns}
              rows={items}
              onRowClick={
                config.canEdit !== false
                  ? (row) => {
                      setFormError(null)
                      setDrawerState({ mode: 'edit', row })
                    }
                  : undefined
              }
              actions={
                config.canDelete !== false || config.rowActions
                  ? (row) => (
                      <>
                        {config.rowActions?.(row)}
                        {config.canDelete !== false && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteRow(row)}
                          >
                            Delete
                          </Button>
                        )}
                      </>
                    )
                  : undefined
              }
            />
            {listQuery.data && (
              <Pagination
                currentPage={listQuery.data.current_page}
                lastPage={listQuery.data.last_page}
                total={listQuery.data.total}
                from={listQuery.data.from}
                to={listQuery.data.to}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>

      <Drawer
        open={!!drawerState}
        onClose={() => setDrawerState(null)}
        title={drawerState?.mode === 'edit' ? `Edit ${config.singular}` : `New ${config.singular}`}
      >
        {drawerState && (
          <ResourceForm
            fields={config.fields}
            initialValues={drawerState.row as any}
            isEdit={drawerState.mode === 'edit'}
            serverError={formError}
            busy={createMutation.isPending || updateMutation.isPending}
            submitLabel={drawerState.mode === 'edit' ? 'Save changes' : 'Create'}
            onCancel={() => setDrawerState(null)}
            onSubmit={(values) => {
              if (drawerState.mode === 'edit' && drawerState.row) {
                updateMutation.mutate({ id: drawerState.row.id, values })
              } else {
                createMutation.mutate(values)
              }
            }}
          />
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteRow}
        message={`This will permanently delete this ${config.singular.toLowerCase()}. This cannot be undone.`}
        busy={deleteMutation.isPending}
        onCancel={() => setDeleteRow(null)}
        onConfirm={() => deleteRow && deleteMutation.mutate(deleteRow.id)}
      />
    </div>
  )
}

function FilterField({
  filter,
  value,
  onChange,
}: {
  filter: ResourceConfig['filters'] extends (infer F)[] | undefined ? F : never
  value: string
  onChange: (v: string) => void
}) {
  const referenceOptions = useReferenceOptions(filter.reference)
  const options = filter.options ?? referenceOptions

  return (
    <div className="w-52">
      <Select
        label={filter.label}
        options={options}
        value={value}
        placeholder={`All ${filter.label}`}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
