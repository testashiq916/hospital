import { http } from '../lib/http'
import type { Department, Doctor, DoctorSchedule, DoctorUnavailability, Paginated } from '../types/api'

export const doctorsApi = {
  departments: () => http.get<Paginated<Department>>('/departments', { per_page: 100 }),
  list: () => http.get<Paginated<Doctor>>('/doctors', { per_page: 100 }),
  schedules: (doctorId?: number) =>
    http.get<Paginated<DoctorSchedule>>('/doctor-schedules', {
      doctor_id: doctorId,
      per_page: 100,
    }),
  unavailability: (doctorId?: number) =>
    http.get<Paginated<DoctorUnavailability>>('/doctor-unavailability', {
      doctor_id: doctorId,
      per_page: 100,
    }),
}
