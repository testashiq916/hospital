import { useEffect, useState } from 'react'
import { usePatient } from '../context/PatientContext'
import { patientsApi } from '../api/patients'
import type { PatientTimelineEvent } from '../types/api'
import { Badge, EmptyState, PageSpinner } from '../components/ui'
import { formatDate, titleCase } from '../lib/format'

const TYPE_ICON: Record<string, string> = {
  appointment: '📅',
  prescription: '💊',
  lab: '🧪',
  admission: '🛏️',
  billing: '💳',
  other: '📌',
}

export function Timeline() {
  const { patient } = usePatient()
  const [events, setEvents] = useState<PatientTimelineEvent[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!patient) return
    patientsApi
      .timeline(patient.id)
      .then((page) => setEvents(page.data))
      .catch(() => setError('Could not load your health timeline.'))
  }, [patient])

  if (!patient || events === null) {
    return error ? <p className="text-sm text-rose-600">{error}</p> : <PageSpinner />
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Health timeline</h1>
        <p className="mt-1 text-sm text-slate-500">
          A chronological record of your visits, orders, and care events.
        </p>
      </div>

      {events.length === 0 ? (
        <EmptyState icon="📈" title="Nothing recorded yet" />
      ) : (
        <ol className="relative flex flex-col gap-6 border-l border-slate-200 pl-6">
          {events.map((event) => (
            <li key={event.id} className="relative">
              <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs">
                {TYPE_ICON[event.event_type] ?? '📌'}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-slate-900">{event.event_title}</p>
                <Badge>{titleCase(event.event_type)}</Badge>
              </div>
              {event.event_description && (
                <p className="mt-0.5 text-sm text-slate-600">{event.event_description}</p>
              )}
              <p className="mt-0.5 text-xs text-slate-400">
                {formatDate(event.event_date)} {event.event_time?.slice(0, 5)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
