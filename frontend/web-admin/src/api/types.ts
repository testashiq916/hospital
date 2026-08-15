export interface Paginated<T> {
  current_page: number
  data: T[]
  first_page_url: string | null
  from: number | null
  last_page: number
  last_page_url: string | null
  per_page: number
  to: number | null
  total: number
}

export interface Permission {
  id: number
  name: string
  slug: string
  module: string
}

export interface Role {
  id: number
  name: string
  slug: string
  description: string | null
  permissions?: Permission[]
}

export interface Company {
  id: number
  uuid: string
  name: string
  code: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  zip_code: string | null
  timezone: string | null
  currency: string | null
  gstin: string | null
  pan: string | null
  subscription_status: string | null
  hospital_limit: number
  bed_limit: number
  user_limit: number
}

export interface Hospital {
  id: number
  company_id: number
  hospital_id: string
  name: string
  code: string
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  zip_code: string | null
  phone: string | null
  email: string | null
  ambulance_phone: string | null
  emergency_phone: string | null
  administrator: string | null
  hospital_type: string | null
  facility_types: string[] | null
  total_beds: number | null
  available_beds: number | null
  is_active: boolean
  is_head_office?: boolean
}

export interface User {
  id: number
  company_id: number
  hospital_id: number | null
  first_name: string
  last_name: string
  name: string
  email: string
  mobile: string | null
  role_id: number
  employee_id: string | null
  designation: string | null
  qualification: string | null
  specialization: string | null
  registration_no: string | null
  is_consultant: boolean
  is_super_admin: boolean
  is_active: boolean
  last_login_at: string | null
  role?: Role
  company?: Company
  hospital?: Hospital
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}
