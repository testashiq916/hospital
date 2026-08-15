type Tone = 'slate' | 'green' | 'red' | 'amber' | 'blue' | 'purple'

const toneClasses: Record<Tone, string> = {
  slate: 'bg-slate-100 text-slate-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
}

export function Badge({ tone = 'slate', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}

const STATUS_TONE_MAP: Record<string, Tone> = {
  active: 'green',
  available: 'green',
  completed: 'green',
  paid: 'green',
  verified: 'green',
  approved: 'green',
  settled: 'green',
  stable: 'green',
  cancelled: 'red',
  rejected: 'red',
  critical: 'red',
  overdue: 'red',
  unpaid: 'red',
  expired: 'red',
  no_show: 'red',
  skipped: 'red',
  discharged: 'slate',
  inactive: 'slate',
  draft: 'slate',
  pending: 'amber',
  partial: 'amber',
  waiting: 'amber',
  in_progress: 'blue',
  scheduled: 'blue',
  confirmed: 'blue',
  ordered: 'blue',
  collected: 'blue',
  occupied: 'amber',
  reserved: 'purple',
  maintenance: 'slate',
  cleaning: 'slate',
}

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="text-slate-300">—</span>
  const tone = STATUS_TONE_MAP[status.toLowerCase()] ?? 'slate'
  return <Badge tone={tone}>{status.replace(/_/g, ' ')}</Badge>
}
