import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, extractErrorMessage } from '@/api/client'
import type { Permission, Role } from '@/api/types'
import { Card, PageHeader, Spinner, EmptyState, ErrorBanner } from '@/components/ui/Misc'
import { Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Drawer } from '@/components/ui/Drawer'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { titleCase } from '@/lib/format'

export default function RolesPage() {
  const queryClient = useQueryClient()
  const [drawerRole, setDrawerRole] = useState<Role | 'new' | null>(null)
  const [deleteRole, setDeleteRole] = useState<Role | null>(null)

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await apiClient.get<Role[]>('/roles')).data,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiClient.delete(`/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setDeleteRole(null)
    },
  })

  return (
    <div>
      <PageHeader title="Roles & Permissions" description="Define staff roles and the permission modules they can access." actions={<Button onClick={() => setDrawerRole('new')}>+ New Role</Button>} />

      {rolesQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (rolesQuery.data ?? []).length === 0 ? (
        <EmptyState message="No roles configured." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rolesQuery.data!.map((role) => (
            <Card key={role.id}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">{role.name}</h3>
                <Badge tone="blue">{role.slug}</Badge>
              </div>
              {role.description && <p className="mb-2 text-xs text-slate-500">{role.description}</p>}
              <div className="mb-3 flex flex-wrap gap-1">
                {(role.permissions ?? []).length === 0 ? (
                  <span className="text-xs text-slate-400">No permissions assigned</span>
                ) : (
                  Array.from(new Set(role.permissions!.map((p) => p.module))).map((module) => (
                    <Badge key={module} tone="slate">{module}</Badge>
                  ))
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="secondary" onClick={() => setDrawerRole(role)}>
                  Edit
                </Button>
                {!['super_admin', 'hospital_admin'].includes(role.slug) && (
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setDeleteRole(role)}>
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <RoleFormDrawer
        role={drawerRole === 'new' ? null : drawerRole}
        open={!!drawerRole}
        onClose={() => setDrawerRole(null)}
      />

      <ConfirmDialog
        open={!!deleteRole}
        message={`Delete role "${deleteRole?.name}"? Users with this role will need to be reassigned.`}
        busy={deleteMutation.isPending}
        onCancel={() => setDeleteRole(null)}
        onConfirm={() => deleteRole && deleteMutation.mutate(deleteRole.id)}
      />
    </div>
  )
}

function RoleFormDrawer({ role, open, onClose }: { role: Role | null; open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(role?.name ?? '')
  const [slug, setSlug] = useState(role?.slug ?? '')
  const [description, setDescription] = useState(role?.description ?? '')
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(role?.permissions?.map((p) => p.id) ?? [])
  const [error, setError] = useState<string | null>(null)

  const permissionsQuery = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => (await apiClient.get<Permission[]>('/permissions')).data,
  })

  // Sync local state whenever a different role is opened.
  const roleId = role?.id ?? null
  const [lastRoleId, setLastRoleId] = useState<number | null | 'init'>('init')
  if (roleId !== lastRoleId) {
    setLastRoleId(roleId)
    setName(role?.name ?? '')
    setSlug(role?.slug ?? '')
    setDescription(role?.description ?? '')
    setSelectedPermissions(role?.permissions?.map((p) => p.id) ?? [])
  }

  const grouped = (permissionsQuery.data ?? []).reduce<Record<string, Permission[]>>((acc, p) => {
    acc[p.module] = acc[p.module] ?? []
    acc[p.module].push(p)
    return acc
  }, {})

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = { name, slug, description: description || null, permission_ids: selectedPermissions }
      if (role) {
        return apiClient.put(`/roles/${role.id}`, payload)
      }
      return apiClient.post('/roles', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      onClose()
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function togglePermission(id: number) {
    setSelectedPermissions((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  function toggleModule(modulePermissions: Permission[]) {
    const ids = modulePermissions.map((p) => p.id)
    const allSelected = ids.every((id) => selectedPermissions.includes(id))
    setSelectedPermissions((prev) => (allSelected ? prev.filter((p) => !ids.includes(p)) : Array.from(new Set([...prev, ...ids]))))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    mutation.mutate()
  }

  return (
    <Drawer open={open} onClose={onClose} title={role ? `Edit ${role.name}` : 'New Role'} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <ErrorBanner message={error} />}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Slug" required disabled={!!role} value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

        <div>
          <span className="mb-2 block text-xs font-medium text-slate-600">Permissions</span>
          {permissionsQuery.isLoading ? (
            <Spinner />
          ) : (
            <div className="max-h-96 space-y-3 overflow-y-auto rounded-md border border-slate-200 p-3">
              {Object.entries(grouped).map(([module, perms]) => (
                <div key={module}>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={perms.every((p) => selectedPermissions.includes(p.id))}
                      onChange={() => toggleModule(perms)}
                    />
                    {titleCase(module)}
                  </label>
                  <div className="mt-1 ml-6 flex flex-wrap gap-3">
                    {perms.map((p) => (
                      <label key={p.id} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <input type="checkbox" checked={selectedPermissions.includes(p.id)} onChange={() => togglePermission(p.id)} />
                        {p.name}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save Role'}
          </Button>
        </div>
      </form>
    </Drawer>
  )
}
