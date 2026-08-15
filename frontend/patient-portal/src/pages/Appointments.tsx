import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePatient } from '../context/PatientContext'
import { appointmentsApi } from '../api/appointments'
import type { Appointment } from '../types/api'
import { Alert, Button, Card, EmptyState, PageSpinner } from '../components/ui'
import { AppointmentStatusBadge } from '../components/AppointmentStatusBadge'
import { formatDateTime, titleCase } from '../lib/format'
import { ApiError } from '../lib/http'

export function Appointments() {
  const { patient } = usePatient()
  const [appointments, setAppointments] = useState<Appointment[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  function load() {
    if (!patient) return
    appointmentsApi
      .listForPatient(patient.id)
      .then((page) => setAppointments(page.data))
      .catch(() => setError('Could not load your appointments.'))
  }

  useEffect(load, [patient])

  async function handleCancel(appt: Appointment) {
    if (!confirm('Cancel this appointment?')) return
    setCancellingId(appt.id)
    try {
      await appointmentsApi.cancel(appt.id, 'Cancelled by patient via portal')
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not cancel this appointment.')
    } finally {
      setCancellingId(null)
    }
  }

  if (!patient || appointments === null) return <PageSpinner />

  const sorted = [...appointments].sort((a, b) =>
    `${b.appointment_date}${b.appointment_time}`.localeCompare(
      `${a.appointment_date}${a.appointment_time}`,
    ),
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My appointments</h1>
          <p className="mt-1 text-sm text-slate-500">All your OPD and teleconsultation visits.</p>
        </div>
        <Link to="/appointments/book">
          <Button>Book new</Button>
        </Link>
      </div>

      {error && <Alert>{error}</Alert>}

      {sorted.length === 0 ? (
        <EmptyState
          icon="🗓️"
          title="No appointments yet"
          description="Book your first appointment to see it here."
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
          {sorted.map((appt) => {
            const cancellable = !['cancelled', 'completed', 'no_show'].includes(appt.status)
            return (
              <Card key={appt.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">
                      Dr. {appt.doctor?.first_name} {appt.doctor?.last_name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDateTime(appt.appointment_date, appt.appointment_time)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {titleCase(appt.appointment_type)} · Token #{appt.token_number}
                      {appt.reason ? ` · ${appt.reason}` : ''}
                    </p>
                    {appt.is_teleconsultation && (
                      <p className="mt-1 text-xs text-sky-600">
                        📹{' '}
                        {appt.teleconsultation_link ? (
                          <a href={appt.teleconsultation_link} className="underline">
                            Join video call
                          </a>
                        ) : (
                          'Video link will be shared before your appointment'
                        )}
                      </p>
                    )}
                    {appt.cancelled_reason && (
                      <p className="mt-1 text-xs text-rose-500">Reason: {appt.cancelled_reason}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <AppointmentStatusBadge status={appt.status} />
                    {cancellable && (
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={cancellingId === appt.id}
                        onClick={() => handleCancel(appt)}
                      >
                        {cancellingId === appt.id ? 'Cancelling…' : 'Cancel'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
