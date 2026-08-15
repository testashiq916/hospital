import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, extractErrorMessage } from '@/api/client'
import { Card, PageHeader, Spinner, ErrorBanner, SuccessBanner } from '@/components/ui/Misc'
import { Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import type { Company } from '@/api/types'

export default function CompanySettingsPage() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['settings', 'company'],
    queryFn: async () => (await apiClient.get<Company>('/settings/company')).data,
  })

  const [form, setForm] = useState<Partial<Company>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (query.data) setForm(query.data)
  }, [query.data])

  const mutation = useMutation({
    mutationFn: async () => (await apiClient.put('/settings/company', form)).data,
    onSuccess: (data) => {
      queryClient.setQueryData(['settings', 'company'], data)
      setSuccess(true)
      setError(null)
      setTimeout(() => setSuccess(false), 3000)
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  function set<K extends keyof Company>(key: K, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div>
      <PageHeader title="Company Settings" description="Organization details, GST and localization settings." />
      <Card className="max-w-3xl">
        {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
        {success && <div className="mb-4"><SuccessBanner message="Settings saved." /></div>}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Company Name" value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} />
          <Input label="Email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
          <Input label="Phone" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
          <Input label="Currency" value={form.currency ?? ''} onChange={(e) => set('currency', e.target.value)} />
          <Input label="Timezone" value={form.timezone ?? ''} onChange={(e) => set('timezone', e.target.value)} />
          <Input label="GSTIN" value={form.gstin ?? ''} onChange={(e) => set('gstin', e.target.value)} />
          <Input label="PAN" value={form.pan ?? ''} onChange={(e) => set('pan', e.target.value)} />
          <Input label="City" value={form.city ?? ''} onChange={(e) => set('city', e.target.value)} />
          <Input label="State" value={form.state ?? ''} onChange={(e) => set('state', e.target.value)} />
          <Input label="Country" value={form.country ?? ''} onChange={(e) => set('country', e.target.value)} />
          <div className="col-span-2">
            <Input label="Address" value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 rounded-md bg-slate-50 p-4 text-sm">
          <div>
            <div className="text-xs text-slate-400">Hospital limit</div>
            <div className="font-semibold text-slate-800">{form.hospital_limit}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Bed limit</div>
            <div className="font-semibold text-slate-800">{form.bed_limit}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">User limit</div>
            <div className="font-semibold text-slate-800">{form.user_limit}</div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => {
              setError(null)
              mutation.mutate()
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving…' : 'Save Settings'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
