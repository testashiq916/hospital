import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePatient } from '../context/PatientContext'
import { doctorsApi } from '../api/doctors'
import { appointmentsApi } from '../api/appointments'
import type { Doctor, DoctorSchedule, DoctorUnavailability } from '../types/api'
import { Alert, Button, Card, EmptyState, Field, PageSpinner, inputClass } from '../components/ui'
import { ApiError } from '../lib/http'
import { formatCurrency } from '../lib/format'

const DAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

function nextNDays(n: number): Date[] {
  const days: Date[] = []
  const start = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
  }
  return days
}

function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function generateSlots(schedule: DoctorSchedule, dateStr: string): string[] {
  const [sh, sm] = schedule.start_time.split(':').map(Number)
  const [eh, em] = schedule.end_time.split(':').map(Number)
  const start = sh * 60 + sm
  const end = eh * 60 + em
  const slots: string[] = []
  const isToday = dateStr === toDateInput(new Date())
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()

  for (let t = start; t + schedule.slot_duration <= end; t += schedule.slot_duration) {
    if (isToday && t <= nowMinutes) continue
    const h = Math.floor(t / 60)
    const m = t % 60
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
  return slots
}

export function BookAppointment() {
  const { patient } = usePatient()
  const navigate = useNavigate()

  const [doctors, setDoctors] = useState<Doctor[] | null>(null)
  const [schedules, setSchedules] = useState<DoctorSchedule[] | null>(null)
  const [unavailability, setUnavailability] = useState<DoctorUnavailability[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [doctorId, setDoctorId] = useState<number | null>(null)
  const [dateStr, setDateStr] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [isTele, setIsTele] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [booked, setBooked] = useState<Awaited<ReturnType<typeof appointmentsApi.book>> | null>(
    null,
  )

  useEffect(() => {
    doctorsApi
      .list()
      .then((docPage) => setDoctors(docPage.data))
      .catch(() => setLoadError('Could not load doctors right now. Please try again later.'))
  }, [])

  useEffect(() => {
    if (!doctorId) {
      setSchedules(null)
      setUnavailability(null)
      return
    }
    setDateStr(null)
    setTime(null)
    Promise.all([doctorsApi.schedules(doctorId), doctorsApi.unavailability(doctorId)])
      .then(([schedPage, unavailPage]) => {
        setSchedules(schedPage.data.filter((s) => s.is_available))
        setUnavailability(unavailPage.data)
      })
      .catch(() => setLoadError('Could not load this doctor\'s schedule.'))
  }, [doctorId])

  const availableDays = useMemo(() => nextNDays(21), [])

  function isDateBookable(d: Date): boolean {
    if (!schedules) return false
    const dow = DAY_NAMES[d.getDay()]
    const hasSchedule = schedules.some((s) => s.day_of_week === dow)
    if (!hasSchedule) return false
    const iso = toDateInput(d)
    const onLeave = (unavailability ?? []).some((u) => iso >= u.start_date.slice(0, 10) && iso <= u.end_date.slice(0, 10))
    return !onLeave
  }

  const scheduleForDate = useMemo(() => {
    if (!dateStr || !schedules) return null
    const dow = DAY_NAMES[new Date(`${dateStr}T00:00:00`).getDay()]
    return schedules.find((s) => s.day_of_week === dow) ?? null
  }, [dateStr, schedules])

  const slots = useMemo(() => {
    if (!scheduleForDate || !dateStr) return []
    return generateSlots(scheduleForDate, dateStr)
  }, [scheduleForDate, dateStr])

  const selectedDoctor = doctors?.find((d) => d.id === doctorId) ?? null

  async function handleBook() {
    if (!patient || !doctorId || !dateStr || !time) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const appt = await appointmentsApi.book({
        hospital_id: patient.hospital_id,
        patient_id: patient.id,
        doctor_id: doctorId,
        appointment_date: dateStr,
        appointment_time: time,
        appointment_type: isTele ? 'teleconsultation' : 'opd',
        reason: reason || undefined,
        is_teleconsultation: isTele,
      })
      setBooked(appt)
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.firstFieldError ?? err.message)
      } else {
        setSubmitError('Could not book this slot. Please try another time.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loadError) return <Alert>{loadError}</Alert>
  if (doctors === null) return <PageSpinner />

  if (booked) {
    return (
      <div className="mx-auto max-w-lg">
        <Card className="text-center">
          <div className="mb-3 text-4xl">✅</div>
          <h1 className="text-xl font-semibold text-slate-900">Appointment booked</h1>
          <p className="mt-1 text-sm text-slate-500">
            with Dr. {booked.doctor?.first_name} {booked.doctor?.last_name} on{' '}
            {booked.appointment_date.slice(0, 10)} at {booked.appointment_time.slice(0, 5)}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <div className="rounded-2xl bg-brand-50 px-6 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
                Your token number
              </p>
              <p className="text-3xl font-bold text-brand-700">#{booked.token_number}</p>
            </div>
          </div>
          {booked.is_teleconsultation && (
            <Alert tone="amber" >
              This is a teleconsultation. The hospital will share your video call link on this
              appointment closer to the time — this build doesn't include real video
              infrastructure.
            </Alert>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/appointments')}>
              View my appointments
            </Button>
            <Button onClick={() => navigate('/')}>Back to home</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Book an appointment</h1>
        <p className="mt-1 text-sm text-slate-500">Pick a doctor, then a date and time that works for you.</p>
      </div>

      {/* Step 1: doctor */}
      <Card>
        <p className="mb-3 text-sm font-semibold text-slate-700">1. Choose a doctor</p>

        {doctors.length === 0 ? (
          <EmptyState title="No doctors available" description="Please check back later." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {doctors.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => setDoctorId(doc.id)}
                className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors ${
                  doctorId === doc.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-slate-200 hover:border-brand-300'
                }`}
              >
                <p className="font-medium text-slate-900">
                  Dr. {doc.first_name} {doc.last_name}
                </p>
                <p className="text-sm text-slate-500">
                  {doc.specialization ?? doc.designation ?? 'General'}
                </p>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Step 2: date */}
      {doctorId && (
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-700">2. Choose a date</p>
          {schedules === null ? (
            <PageSpinner />
          ) : schedules.length === 0 ? (
            <EmptyState
              title="No schedule set up"
              description={`Dr. ${selectedDoctor?.first_name} doesn't have any open slots configured yet.`}
            />
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableDays.map((d) => {
                const iso = toDateInput(d)
                const bookable = isDateBookable(d)
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={!bookable}
                    onClick={() => {
                      setDateStr(iso)
                      setTime(null)
                    }}
                    className={`flex min-w-[64px] flex-col items-center rounded-xl border px-3 py-2 text-sm transition-colors ${
                      dateStr === iso
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : bookable
                          ? 'border-slate-200 text-slate-700 hover:border-brand-300'
                          : 'cursor-not-allowed border-slate-100 text-slate-300'
                    }`}
                  >
                    <span className="text-xs uppercase">
                      {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                    </span>
                    <span className="font-semibold">{d.getDate()}</span>
                  </button>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {/* Step 3: time */}
      {dateStr && (
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-700">3. Choose a time</p>
          {slots.length === 0 ? (
            <EmptyState title="No slots left on this day" description="Try another date." />
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTime(s)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    time === s
                      ? 'border-brand-500 bg-brand-600 text-white'
                      : 'border-slate-200 text-slate-700 hover:border-brand-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {scheduleForDate?.consultation_fee && (
            <p className="mt-3 text-xs text-slate-400">
              Consultation fee: {formatCurrency(scheduleForDate.consultation_fee)}
            </p>
          )}
        </Card>
      )}

      {/* Step 4: details + confirm */}
      {time && (
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-700">4. A few details</p>
          <div className="flex flex-col gap-4">
            <Field label="Reason for visit" hint="Optional">
              <textarea
                className={inputClass}
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isTele}
                onChange={(e) => setIsTele(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600"
              />
              This is a teleconsultation (video call)
            </label>

            {submitError && <Alert>{submitError}</Alert>}

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <div className="flex-1 text-sm text-slate-600">
                Dr. {selectedDoctor?.first_name} {selectedDoctor?.last_name} ·{' '}
                {dateStr} at {time}
              </div>
              <Button onClick={handleBook} disabled={submitting}>
                {submitting ? 'Booking…' : 'Confirm booking'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
