export interface NavLink {
  label: string
  to: string
  /** Permission module slug required to see this link; omit for always-visible. */
  module?: string
}

export interface NavSection {
  label: string
  icon: string
  links: NavLink[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Dashboard',
    icon: '📊',
    links: [{ label: 'Overview', to: '/' }],
  },
  {
    label: 'Patients',
    icon: '👤',
    links: [
      { label: 'All Patients', to: '/patients', module: 'patients' },
      { label: 'Register Patient', to: '/patients/new', module: 'patients' },
    ],
  },
  {
    label: 'Appointments',
    icon: '🗓️',
    links: [
      { label: 'Appointments', to: '/appointments', module: 'appointments' },
      { label: 'Queue Board', to: '/appointments/queue', module: 'appointments' },
    ],
  },
  {
    label: 'IPD / Admissions',
    icon: '🛏️',
    links: [{ label: 'Admissions', to: '/admissions', module: 'patient_records' }],
  },
  {
    label: 'Clinical',
    icon: '🏥',
    links: [
      { label: 'Patient Visits', to: '/clinical/visits', module: 'patient_records' },
      { label: 'OPD Records', to: '/clinical/opd-records', module: 'clinical' },
      { label: 'IPD Daily Records', to: '/clinical/ipd-records', module: 'clinical' },
      { label: 'Nursing Records', to: '/clinical/nursing-records', module: 'clinical' },
      { label: 'ICU Records', to: '/clinical/icu-records', module: 'clinical' },
      { label: 'Operation Theatre', to: '/clinical/ot-schedules', module: 'clinical' },
      { label: 'Case Sheets', to: '/clinical/case-sheets', module: 'patient_records' },
    ],
  },
  {
    label: 'Lab & Radiology',
    icon: '🔬',
    links: [
      { label: 'Lab Orders', to: '/lab/orders', module: 'lab' },
      { label: 'Lab Tests', to: '/lab/tests', module: 'lab' },
      { label: 'Radiology Orders', to: '/lab/radiology-orders', module: 'radiology' },
      { label: 'Radiology Tests', to: '/lab/radiology-tests', module: 'radiology' },
      { label: 'Blood Bank', to: '/lab/blood-bank', module: 'blood_bank' },
    ],
  },
  {
    label: 'Pharmacy',
    icon: '💊',
    links: [
      { label: 'Dispensing', to: '/pharmacy/dispensing', module: 'prescriptions' },
      { label: 'Prescriptions', to: '/pharmacy/prescriptions', module: 'prescriptions' },
      { label: 'Medicines', to: '/pharmacy/medicines', module: 'pharmacy' },
      { label: 'Categories', to: '/pharmacy/categories', module: 'pharmacy' },
      { label: 'Suppliers', to: '/pharmacy/suppliers', module: 'pharmacy' },
      { label: 'Inventory', to: '/pharmacy/inventory', module: 'pharmacy' },
    ],
  },
  {
    label: 'Billing',
    icon: '💳',
    links: [
      { label: 'Bills', to: '/billing/bills', module: 'billing' },
      { label: 'Payments', to: '/billing/payments', module: 'billing' },
      { label: 'Insurance Claims', to: '/billing/insurance-claims', module: 'insurance' },
    ],
  },
  {
    label: 'Accounting',
    icon: '💰',
    links: [
      { label: 'Chart of Accounts', to: '/accounting/chart-of-accounts', module: 'accounting' },
      { label: 'Vouchers', to: '/accounting/vouchers', module: 'accounting' },
      { label: 'Daybook', to: '/accounting/daybook', module: 'accounting' },
      { label: 'Trial Balance', to: '/accounting/trial-balance', module: 'accounting' },
    ],
  },
  {
    label: 'AI Features',
    icon: '🤖',
    links: [{ label: 'AI Tools', to: '/ai', module: 'ai' }],
  },
  {
    label: 'Reports',
    icon: '📈',
    links: [{ label: 'Analytics', to: '/reports', module: 'reports' }],
  },
  {
    label: 'Hospital Setup',
    icon: '🏢',
    links: [
      { label: 'Hospitals', to: '/hospital/hospitals', module: 'hospitals' },
      { label: 'Departments', to: '/hospital/departments', module: 'departments' },
      { label: 'Wards', to: '/hospital/wards', module: 'wards' },
      { label: 'Beds', to: '/hospital/beds', module: 'beds' },
      { label: 'Patient Types', to: '/hospital/patient-types', module: 'patients' },
      { label: 'Doctor Schedules', to: '/hospital/doctor-schedules', module: 'doctors' },
      { label: 'Doctor Unavailability', to: '/hospital/doctor-unavailability', module: 'doctors' },
    ],
  },
  {
    label: 'Settings',
    icon: '⚙️',
    links: [
      { label: 'Company Settings', to: '/settings/company', module: 'settings' },
      { label: 'Users', to: '/settings/users', module: 'users' },
      { label: 'Roles & Permissions', to: '/settings/roles', module: 'roles' },
      { label: 'Audit Logs', to: '/settings/audit-logs', module: 'audit' },
    ],
  },
]
