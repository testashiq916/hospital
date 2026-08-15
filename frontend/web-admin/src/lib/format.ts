export function formatCurrency(value: number | string | null | undefined): string {
  const num = Number(value ?? 0)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return '—'
  // Handles both "HH:mm:ss" and full ISO datetimes.
  const match = /^(\d{2}):(\d{2})/.exec(value)
  if (match) {
    const [, h, m] = match
    const hour = Number(h)
    const period = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 === 0 ? 12 : hour % 12
    return `${hour12}:${m} ${period}`
  }
  return value
}

export function titleCase(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function fullName(entity: { first_name?: string | null; last_name?: string | null; name?: string | null } | null | undefined): string {
  if (!entity) return '—'
  if (entity.name) return entity.name
  return [entity.first_name, entity.last_name].filter(Boolean).join(' ') || '—'
}
