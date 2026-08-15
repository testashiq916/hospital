import type { AppointmentStatus } from '../types/api'
import { Badge } from './ui'
import { titleCase } from '../lib/format'

const TONES: Record<AppointmentStatus, 'slate' | 'green' | 'amber' | 'red' | 'blue'> = {
  scheduled: 'blue',
  confirmed: 'blue',
  in_progress: 'amber',
  completed: 'green',
  cancelled: 'red',
  no_show: 'slate',
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge tone={TONES[status]}>{titleCase(status)}</Badge>
}
