// Shapes mirror what backend/laravel actually returns (verified against a
// running instance while building this app) — not guessed from the schema.

export interface Paginated<T> {
  current_page: number
  data: T[]
  last_page: number
  per_page: number
  total: number
  next_page_url: string | null
  prev_page_url: string | null
}

export interface Role {
  id: number
  name: string
  slug: string
}

export interface Company {
  id: number
  name: string
  code: string
  currency: string
}

export interface Hospital {
  id: number
  hospital_id: string
  name: string
  code: string
  address: string | null
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
  hospital_type: string
  facility_types: string[] | null
}

export interface AuthUser {
  id: number
  company_id: number
  hospital_id: number | null
  first_name: string
  last_name: string
  name: string
  email: string
  mobile: string
  role_id: number
  is_super_admin: boolean
  is_active: boolean
  company?: Company
  hospital?: Hospital
  role?: Role
}

export interface LoginResponse {
  message: string
  token: string
  user: AuthUser
}

export type Gender = 'male' | 'female' | 'other'
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'
export type RegistrationType = 'opd' | 'ipd' | 'emergency'

export interface Patient {
  id: number
  company_id: number
  hospital_id: number
  patient_id: string
  user_id: number | null
  first_name: string
  last_name: string
  middle_name: string | null
  gender: Gender
  date_of_birth: string
  age: number | null
  blood_group: string | null
  marital_status: MaritalStatus
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
  spouse_name: string | null
  father_name: string | null
  mother_name: string | null
  blood_pressure: string | null
  allergies: string | null
  chronic_diseases: string | null
  medications: string | null
  family_history: string | null
  social_history: string | null
  insurance_provider: string | null
  insurance_policy_number: string | null
  insurance_expiry: string | null
  insurance_coverage: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relationship: string | null
  is_active: boolean
  registration_date: string
  registration_type: RegistrationType
  hospital?: Hospital
  family?: FamilyMember[]
}

export interface FamilyMember {
  id: number
  patient_id: number
  name: string
  relationship: string
  date_of_birth: string | null
  gender: Gender | null
  contact: string | null
  is_active: boolean
}

export interface Department {
  id: number
  hospital_id: number
  name: string
  code: string
  description: string | null
  is_active: boolean
}

export interface Doctor {
  id: number
  first_name: string
  last_name: string
  name: string
  email: string
  mobile: string
  designation: string | null
  qualification: string | null
  specialization: string | null
  is_consultant: boolean
  is_active: boolean
}

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface DoctorSchedule {
  id: number
  doctor_id: number
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
  slot_duration: number
  max_patients: number
  is_available: boolean
  location: string | null
  consultation_fee: string | null
  doctor?: Doctor
}

export interface DoctorUnavailability {
  id: number
  doctor_id: number
  start_date: string
  end_date: string
  reason: string | null
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type AppointmentType = 'opd' | 'follow_up' | 'teleconsultation' | 'emergency'

export interface Appointment {
  id: number
  appointment_id: string
  hospital_id: number
  patient_id: number
  doctor_id: number
  appointment_date: string
  appointment_time: string
  end_time: string | null
  appointment_type: AppointmentType
  reason: string | null
  token_number: number
  queue_number: number
  estimated_wait_time: number | null
  status: AppointmentStatus
  is_emergency: boolean
  is_teleconsultation: boolean
  teleconsultation_link: string | null
  cancelled_reason: string | null
  notes: string | null
  patient?: Patient
  doctor?: Doctor
}

export interface Medicine {
  id: number
  name: string
  generic_name: string | null
  strength: string | null
  dosage_form: string | null
  unit: string | null
  price: string
}

export interface PrescriptionItem {
  id: number
  prescription_id: number
  medicine_id: number
  quantity: number
  dosage: string | null
  frequency: string | null
  duration: string | null
  instructions: string | null
  route: string | null
  timing: string | null
  medicine?: Medicine
}

export interface Prescription {
  id: number
  prescription_id: string
  hospital_id: number
  patient_id: number
  doctor_id: number
  diagnosis: string | null
  notes: string | null
  prescription_date: string
  prescription_time: string
  doctor?: Doctor
  patient?: Patient
  items?: PrescriptionItem[]
}

export interface LabTest {
  id: number
  test_code: string
  name: string
  category: string | null
  price: string
  turnaround_time: number | null
  specimen_type: string | null
}

export interface LabOrderItem {
  id: number
  lab_order_id: number
  lab_test_id: number
  specimen_id: string | null
  result: number | null
  result_text: string | null
  result_status: 'pending' | 'completed'
  range_low: string | null
  range_high: string | null
  unit: string | null
  remarks: string | null
  is_abnormal: boolean
  lab_test?: LabTest
}

export type LabOrderStatus = 'ordered' | 'collected' | 'in_progress' | 'completed' | 'reported'

export interface LabOrder {
  id: number
  order_id: string
  hospital_id: number
  patient_id: number
  doctor_id: number
  order_type: 'laboratory' | 'radiology' | 'pathology'
  priority: 'routine' | 'urgent' | 'stat'
  clinical_notes: string | null
  status: LabOrderStatus
  order_date: string
  doctor?: Doctor
  patient?: Patient
  items?: LabOrderItem[]
}

export interface LabReport {
  id: number
  report_id: string
  hospital_id: number
  lab_order_id: number
  patient_id: number
  report_date: string
  report_title: string | null
  clinical_interpretation: string | null
  recommendation: string | null
  pdf_path: string | null
  is_verified: boolean
  verified_at: string | null
  status: string
  labOrder?: LabOrder
  patient?: Patient
}

export type BillType =
  | 'opd'
  | 'ipd'
  | 'emergency'
  | 'pharmacy'
  | 'lab'
  | 'radiology'
  | 'procedure'
  | 'discharge'

export type PaymentStatus = 'pending' | 'partial' | 'paid'

export interface BillItem {
  id: number
  bill_id: number
  item_type: string
  description: string
  quantity: number
  unit_price: string
  total: string
}

export interface HospitalBill {
  id: number
  bill_id: string
  hospital_id: number
  patient_id: number
  bill_type: BillType
  bill_date: string
  subtotal: string
  discount_amount: string
  tax_amount: string
  service_charge: string
  total_amount: string
  paid_amount: string
  balance_amount: string
  payment_status: PaymentStatus
  patient_payable: string
  items?: BillItem[]
  payments?: HospitalPayment[]
}

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'upi'
  | 'insurance'
  | 'tpa'
  | 'cheque'
  | 'bank_transfer'

export interface HospitalPayment {
  id: number
  bill_id: number
  patient_id: number
  amount: string
  payment_method: PaymentMethod
  payment_date: string
  payment_time: string
  transaction_id: string | null
  notes: string | null
  bill?: HospitalBill
}

export interface PatientTimelineEvent {
  id: number
  patient_id: number
  event_date: string
  event_time: string
  event_type: string
  event_title: string
  event_description: string | null
}

export interface MedicalHistory {
  allergies: string | null
  chronic_diseases: string | null
  medications: string | null
  family_history: string | null
  social_history: string | null
  blood_group: string | null
  blood_pressure: string | null
}
