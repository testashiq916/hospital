import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePatient } from '../context/PatientContext'
import { appointmentsApi } from '../api/appointments'
import { patientsApi } from '../api/patients'
import type { Appointment, PatientTimelineEvent } from '../types/api'
import { Badge, Card, EmptyState, PageSpinner } from '../components/ui'
import { formatDate, formatDateTime, titleCase } from '../lib/format'
import { AppointmentStatusBadge } from '../components/AppointmentStatusBadge'

export function Dashboard() {
  const { patient } = usePatient()
  const [appointments, setAppointments] = useState<Appointment[] | null>(null)
  const [timeline, setTimeline] = useState<PatientTimelineEvent[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!patient) return
    Promise.all([
      appointmentsApi.listForPatient(patient.id),
      patientsApi.timeline(patient.id),
    ])
      .then(([appts, events]) => {
        setAppointments(appts.data)
        setTimeline(events.data)
      })
      .catch(() => setError('Could not load your dashboard right now.'))
  }, [patient])

  if (!patient || appointments === null) return <PageSpinner />

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = appointments
    .filter((a) => a.appointment_date.slice(0, 10) >= today && a.status !== 'cancelled')
    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date))
    .slice(0, 3)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Hi {patient.first_name} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">Here's what's happening with your care.</p>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction to="/appointments/book" icon="📅" label="Book Appointment" />
        <QuickAction to="/prescriptions" icon="💊" label="View Prescriptions" />
        <QuickAction to="/reports" icon="🧪" label="Lab & Radiology Reports" />
        <QuickAction to="/billing" icon="💳" label="Bills & Payments" />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming appointments</h2>
          <Link to="/appointments" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No upcoming appointments"
            description="Book a slot with one of our doctors to get started."
            action={
              <Link
                to="/appointments/book"
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Book an appointment
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map((appt) => (
              <Card key={appt.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">
                    Dr. {appt.doctor?.first_name} {appt.doctor?.last_name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDateTime(appt.appointment_date, appt.appointment_time)} · Token #
                    {appt.token_number}
                  </p>
                </div>
                <AppointmentStatusBadge status={appt.status} />
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Recent activity</h2>
        {!timeline || timeline.length === 0 ? (
          <EmptyState title="No activity yet" description="Your health timeline will appear here." />
        ) : (
          <Card className="divide-y divide-slate-100 p-0">
            {timeline.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-start justify-between gap-4 px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{event.event_title}</p>
                  {event.event_description && (
                    <p className="text-sm text-slate-500">{event.event_description}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge>{titleCase(event.event_type)}</Badge>
                  <span className="text-xs text-slate-400">{formatDate(event.event_date)}</span>
                </div>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  )
}

function QuickAction({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </Link>
  )
}
