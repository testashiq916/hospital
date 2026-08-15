import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, extractErrorMessage } from '@/api/client'
import type { Paginated, User } from '@/api/types'
import { Card, PageHeader, Spinner, EmptyState, ErrorBanner } from '@/components/ui/Misc'
import { Input, Select, Checkbox } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/Badge'
import { Drawer, Modal } from '@/components/ui/Drawer'
import { fullName } from '@/lib/format'
import { useReferenceOptions } from '@/hooks/useReferenceOptions'

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [resetUser, setResetUser] = useState<User | null>(null)

  const query = useQuery({
    queryKey: ['users', page, search],
    queryFn: async () => (await apiClient.get<Paginated<User>>('/users', { params: { page, ...(search ? { search } : {}) } })).data,
    placeholderData: (prev) => prev,
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => apiClient.put(`/users/${id}`, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  const items = query.data?.data ?? []

  return (
    <div>
      <PageHeader title="Users" description="Staff accounts, roles and access." actions={<Button onClick={() => setCreateOpen(true)}>+ New User</Button>} />

      <Card>
        <div className="mb-4 w-72">
          <Input label="Search" placeholder="Name or email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>

        {query.isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : items.length === 0 ? (
          <EmptyState message="No users found." />
        ) : (
          <>
            <Table
              rows={items}
              columns={[
                { key: 'name', label: 'Name', render: (r) => fullName(r) },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Role', render: (r) => r.role?.name ?? '—' },
                { key: 'designation', label: 'Designation' },
                { key: 'is_active', label: 'Status', render: (r) => <StatusBadge status={r.is_active ? 'active' : 'inactive'} /> },
              ]}
              actions={(row) => (
                <>
                  <Button size="sm" variant="secondary" onClick={() => setResetUser(row)}>
                    Reset Password
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActiveMutation.mutate({ id: row.id, is_active: !row.is_active })}
                  >
                    {row.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </>
              )}
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

      <CreateUserDrawer open={createOpen} onClose={() => setCreateOpen(false)} />
      <ResetPasswordModal user={resetUser} onClose={() => setResetUser(null)} />
    </div>
  )
}

function CreateUserDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    mobile: '',
    role_id: '',
    hospital_id: '',
    designation: '',
    specialization: '',
    is_consultant: false,
  })
  const [error, setError] = useState<string | null>(null)

  const roleOptions = useReferenceOptions({ endpoint: '/roles', label: (r: any) => r.name })
  const hospitalOptions = useReferenceOptions({ endpoint: '/hospitals', label: (h: any) => h.name })

  const mutation = useMutation({
    mutationFn: async () => apiClient.post('/users', { ...form, role_id: Number(form.role_id), hospital_id: form.hospital_id || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onClose()
      setForm({ first_name: '', last_name: '', email: '', password: '', mobile: '', role_id: '', hospital_id: '', designation: '', specialization: '', is_consultant: false })
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    mutation.mutate()
  }

  return (
    <Drawer open={open} onClose={onClose} title="New User">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <ErrorBanner message={error} />}
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <Input label="Last Name" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
        </div>
        <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Password" type="password" required hint="Minimum 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Input label="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
        <Select label="Role" required options={roleOptions} value={form.role_id} onChange={(e) => setForm({ ...form, role_id: e.target.value })} />
        <Select label="Hospital" options={hospitalOptions} value={form.hospital_id} onChange={(e) => setForm({ ...form, hospital_id: e.target.value })} />
        <Input label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
        <Input label="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
        <Checkbox label="Consultant (shown as a bookable doctor)" checked={form.is_consultant} onChange={(e) => setForm({ ...form, is_consultant: e.target.checked })} />
        <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating…' : 'Create User'}
          </Button>
        </div>
      </form>
    </Drawer>
  )
}

function ResetPasswordModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const mutation = useMutation({
    mutationFn: async () => apiClient.post(`/users/${user!.id}/reset-password`, { password }),
    onSuccess: () => {
      setSuccess(true)
      setPassword('')
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  if (!user) return null

  return (
    <Modal
      open={!!user}
      onClose={() => {
        onClose()
        setSuccess(false)
        setError(null)
      }}
      title={`Reset Password — ${fullName(user)}`}
    >
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          setError(null)
          mutation.mutate()
        }}
        className="flex flex-col gap-3"
      >
        {error && <ErrorBanner message={error} />}
        {success ? (
          <p className="text-sm text-green-700">Password reset successfully.</p>
        ) : (
          <Input label="New Password" type="password" required hint="Minimum 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          {!success && (
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Resetting…' : 'Reset Password'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  )
}

