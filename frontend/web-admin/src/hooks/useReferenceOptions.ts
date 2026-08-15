import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { ReferenceConfig, SelectOption } from '@/components/crud/types'

/** Normalizes either a plain-array response or a Laravel paginator response into an array. */
function normalizeList(data: unknown): any[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && Array.isArray((data as any).data)) {
    return (data as any).data
  }
  return []
}

export function useReferenceOptions(reference?: ReferenceConfig): SelectOption[] {
  const { data } = useQuery({
    queryKey: ['reference', reference?.endpoint, reference?.params],
    queryFn: async () => {
      if (!reference) return []
      const res = await apiClient.get(reference.endpoint, {
        params: { per_page: 500, ...reference.params },
      })
      return normalizeList(res.data)
    },
    enabled: !!reference,
    staleTime: 60_000,
  })

  if (!reference || !data) return []

  return data.map((item) => ({ value: item.id, label: reference.label(item) }))
}
