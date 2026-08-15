import { http } from '../lib/http'
import type {
  FamilyMember,
  MedicalHistory,
  Paginated,
  Patient,
  PatientTimelineEvent,
} from '../types/api'

export interface PatientProfileInput {
  hospital_id: number
  first_name: string
  last_name: string
  gender: 'male' | 'female' | 'other'
  date_of_birth: string
  mobile: string
  email?: string
  blood_group?: string
  address?: string
  city?: string
  state?: string
  country?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  allergies?: string
  chronic_diseases?: string
  medications?: string
  registration_type?: 'opd' | 'ipd' | 'emergency'
}

export const patientsApi = {
  /**
   * The backend has no server-side link from a logged-in `patient`-role user
   * to their own `patients` row (see README "Known backend gaps"), so the
   * frontend resolves "my record" by an exact mobile-number match against
   * patients search results. Only ever used to locate the caller's own row.
   */
  findByMobile: async (mobile: string): Promise<Patient | null> => {
    const page = await http.get<Paginated<Patient>>('/patients', { search: mobile, per_page: 50 })
    return page.data.find((p) => p.mobile === mobile) ?? null
  },
  get: (id: number) => http.get<Patient>(`/patients/${id}`),
  create: (payload: PatientProfileInput) => http.post<Patient>('/patients', payload),
  update: (id: number, payload: Partial<PatientProfileInput>) =>
    http.put<Patient>(`/patients/${id}`, payload),
  medicalHistory: (id: number) => http.get<MedicalHistory>(`/patients/${id}/medical-history`),
  timeline: (id: number) =>
    http.get<Paginated<PatientTimelineEvent>>(`/patients/${id}/timeline`),
  family: {
    list: (patientId: number) => http.get<FamilyMember[]>(`/patients/${patientId}/family`),
    add: (
      patientId: number,
      payload: {
        name: string
        relationship: string
        date_of_birth?: string
        gender?: 'male' | 'female' | 'other'
        contact?: string
      },
    ) => http.post<FamilyMember>(`/patients/${patientId}/family`, payload),
    remove: (patientId: number, familyId: number) =>
      http.del<{ message: string }>(`/patients/${patientId}/family/${familyId}`),
  },
}
