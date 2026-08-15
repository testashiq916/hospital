import { http } from '../lib/http'
import type { Appointment, AppointmentType, Paginated } from '../types/api'

export interface BookAppointmentInput {
  hospital_id: number
  patient_id: number
  doctor_id: number
  appointment_date: string
  appointment_time: string
  appointment_type?: AppointmentType
  reason?: string
  is_teleconsultation?: boolean
}

export const appointmentsApi = {
  listForPatient: (patientId: number) =>
    http.get<Paginated<Appointment>>('/appointments', { patient_id: patientId, per_page: 100 }),
  get: (id: number) => http.get<Appointment>(`/appointments/${id}`),
  book: (payload: BookAppointmentInput) => http.post<Appointment>('/appointments', payload),
  cancel: (id: number, reason?: string) =>
    http.post<Appointment>(`/appointments/${id}/cancel`, { reason }),
}
