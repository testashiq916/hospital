export interface Patient {
  id: number
  hospital_id: number
  patient_type_id: number | null
  patient_id: string
  first_name: string
  last_name: string
  middle_name: string | null
  gender: string
  date_of_birth: string
  age: number
  blood_group: string | null
  marital_status: string | null
  email: string | null
  mobile: string
  alternate_mobile: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  zip_code: string | null
  guardian_name: string | null
  guardian_relationship: string | null
  guardian_contact: string | null
  allergies: string | null
  chronic_diseases: string | null
  medications: string | null
  family_history: string | null
  social_history: string | null
  blood_pressure: string | null
  insurance_provider: string | null
  insurance_policy_number: string | null
  insurance_coverage: number | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relationship: string | null
  registration_type: string | null
  registration_date: string
  is_active: boolean
  hospital?: { id: number; name: string }
  patient_type?: { id: number; name: string } | null
}

export interface PatientFamilyMember {
  id: number
  patient_id: number
  name: string
  relationship: string
  date_of_birth: string | null
  gender: string | null
  contact: string | null
  is_active?: boolean
}

export interface PatientDocument {
  id: number
  patient_id: number
  document_type: string
  document_name: string
  document_path: string
  document_number: string | null
  issue_date: string | null
  expiry_date: string | null
  is_verified: boolean
}

export interface TimelineEvent {
  id: number
  event_date: string
  event_time: string | null
  event_type: string
  event_title: string
  event_description: string | null
}
