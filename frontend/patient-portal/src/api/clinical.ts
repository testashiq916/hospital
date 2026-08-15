import { http } from '../lib/http'
import type { LabReport, Paginated, Prescription } from '../types/api'

export const prescriptionsApi = {
  listForPatient: (patientId: number) =>
    http.get<Paginated<Prescription>>('/prescriptions', { patient_id: patientId, per_page: 50 }),
  get: (id: number) => http.get<Prescription>(`/prescriptions/${id}`),
}

export const labReportsApi = {
  listForPatient: (patientId: number) =>
    http.get<Paginated<LabReport>>('/lab-reports', { patient_id: patientId, per_page: 50 }),
  get: (id: number) => http.get<LabReport>(`/lab-reports/${id}`),
}
