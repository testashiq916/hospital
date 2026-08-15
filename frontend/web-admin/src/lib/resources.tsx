import type { ResourceConfig } from '@/components/crud/types'
import { StatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, fullName, titleCase } from '@/lib/format'

const hospitalRef = { endpoint: '/hospitals', label: (h: any) => h.name }
const departmentRef = { endpoint: '/departments', label: (d: any) => d.name }
const wardRef = { endpoint: '/wards', label: (w: any) => `${w.name} (${w.code})` }
const doctorRef = {
  endpoint: '/doctors',
  label: (d: any) => `Dr. ${fullName(d)}${d.specialization ? ` — ${d.specialization}` : ''}`,
}
const userRef = { endpoint: '/users', label: (u: any) => fullName(u) }
const medicineCategoryRef = { endpoint: '/medicine-categories', label: (c: any) => c.name }
const medicineRef = { endpoint: '/medicines', label: (m: any) => `${m.name}${m.strength ? ` (${m.strength})` : ''}` }
const supplierRef = { endpoint: '/suppliers', label: (s: any) => s.name }

export const hospitalsConfig: ResourceConfig = {
  key: 'hospitals',
  title: 'Hospitals',
  singular: 'Hospital',
  endpoint: '/hospitals',
  description: 'Branches, facility settings and contact details.',
  searchable: false,
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    { key: 'city', label: 'City' },
    { key: 'hospital_type', label: 'Type', render: (r: any) => titleCase(r.hospital_type) },
    { key: 'total_beds', label: 'Beds' },
    { key: 'is_active', label: 'Status', render: (r: any) => <StatusBadge status={r.is_active ? 'active' : 'inactive'} /> },
  ],
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'code', label: 'Code', type: 'text', required: true },
    {
      name: 'hospital_type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'general', label: 'General' },
        { value: 'speciality', label: 'Speciality' },
        { value: 'super_speciality', label: 'Super Speciality' },
      ],
    },
    { name: 'address', label: 'Address', type: 'textarea', fullWidth: true },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'state', label: 'State', type: 'text' },
    { name: 'country', label: 'Country', type: 'text', defaultValue: 'India' },
    { name: 'zip_code', label: 'Zip Code', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'ambulance_phone', label: 'Ambulance Phone', type: 'text' },
    { name: 'emergency_phone', label: 'Emergency Phone', type: 'text' },
    { name: 'administrator', label: 'Administrator', type: 'text' },
    { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
  ],
}

export const departmentsConfig: ResourceConfig = {
  key: 'departments',
  title: 'Departments',
  singular: 'Department',
  endpoint: '/departments',
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    { key: 'hospital', label: 'Hospital', render: (r: any) => r.hospital?.name ?? '—' },
    { key: 'head_doctor', label: 'Head Doctor', render: (r: any) => (r.head_doctor ? fullName(r.head_doctor) : '—') },
    { key: 'is_active', label: 'Status', render: (r: any) => <StatusBadge status={r.is_active ? 'active' : 'inactive'} /> },
  ],
  filters: [{ name: 'hospital_id', label: 'Hospital', type: 'select', reference: hospitalRef }],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'code', label: 'Code', type: 'text', required: true },
    { name: 'head_doctor_id', label: 'Head Doctor', type: 'select', reference: doctorRef },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
    { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
  ],
}

export const wardsConfig: ResourceConfig = {
  key: 'wards',
  title: 'Wards',
  singular: 'Ward',
  endpoint: '/wards',
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    { key: 'ward_type', label: 'Type', render: (r: any) => titleCase(r.ward_type) },
    { key: 'total_beds', label: 'Total Beds' },
    { key: 'available_beds', label: 'Available' },
    { key: 'occupied_beds', label: 'Occupied' },
  ],
  filters: [{ name: 'hospital_id', label: 'Hospital', type: 'select', reference: hospitalRef }],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'department_id', label: 'Department', type: 'select', reference: departmentRef },
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'code', label: 'Code', type: 'text', required: true },
    {
      name: 'ward_type',
      label: 'Ward Type',
      type: 'select',
      options: [
        { value: 'general', label: 'General' },
        { value: 'semi_private', label: 'Semi Private' },
        { value: 'private', label: 'Private' },
        { value: 'icu', label: 'ICU' },
        { value: 'nicu', label: 'NICU' },
        { value: 'picu', label: 'PICU' },
        { value: 'isolation', label: 'Isolation' },
      ],
    },
    { name: 'total_beds', label: 'Total Beds', type: 'number' },
    { name: 'floor_number', label: 'Floor Number', type: 'number' },
    { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
  ],
}

const bedStatusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'maintenance', label: 'Maintenance' },
]

export const bedsConfig: ResourceConfig = {
  key: 'beds',
  title: 'Beds',
  singular: 'Bed',
  endpoint: '/beds',
  columns: [
    { key: 'bed_number', label: 'Bed #' },
    { key: 'ward', label: 'Ward', render: (r: any) => r.ward?.name ?? '—' },
    { key: 'bed_type', label: 'Type', render: (r: any) => titleCase(r.bed_type) },
    { key: 'daily_rate', label: 'Daily Rate', render: (r: any) => formatCurrency(r.daily_rate) },
    { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
  ],
  filters: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', reference: hospitalRef },
    { name: 'ward_id', label: 'Ward', type: 'select', reference: wardRef },
    { name: 'status', label: 'Status', type: 'select', options: bedStatusOptions },
  ],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'ward_id', label: 'Ward', type: 'select', required: true, reference: wardRef },
    { name: 'bed_number', label: 'Bed Number', type: 'text', required: true },
    {
      name: 'bed_type',
      label: 'Bed Type',
      type: 'select',
      options: [
        { value: 'general', label: 'General' },
        { value: 'icu', label: 'ICU' },
        { value: 'private', label: 'Private' },
        { value: 'semi_private', label: 'Semi Private' },
        { value: 'isolation', label: 'Isolation' },
      ],
    },
    { name: 'daily_rate', label: 'Daily Rate', type: 'number', step: '0.01' },
    { name: 'status', label: 'Status', type: 'select', options: bedStatusOptions, defaultValue: 'available' },
    { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
  ],
}

export const patientTypesConfig: ResourceConfig = {
  key: 'patient-types',
  title: 'Patient Types',
  singular: 'Patient Type',
  endpoint: '/patient-types',
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    { key: 'description', label: 'Description' },
    { key: 'is_active', label: 'Status', render: (r: any) => <StatusBadge status={r.is_active ? 'active' : 'inactive'} /> },
  ],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'code', label: 'Code', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
    { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
  ],
}

const dayOptions = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
].map((d) => ({ value: d, label: titleCase(d) }))

export const doctorSchedulesConfig: ResourceConfig = {
  key: 'doctor-schedules',
  title: 'Doctor Schedules',
  singular: 'Schedule',
  endpoint: '/doctor-schedules',
  description: 'Weekly recurring availability slots per doctor.',
  columns: [
    { key: 'doctor', label: 'Doctor', render: (r: any) => (r.doctor ? `Dr. ${fullName(r.doctor)}` : '—') },
    { key: 'day_of_week', label: 'Day', render: (r: any) => titleCase(r.day_of_week) },
    { key: 'start_time', label: 'Start' },
    { key: 'end_time', label: 'End' },
    { key: 'slot_duration', label: 'Slot (min)' },
    { key: 'max_patients', label: 'Max Patients' },
    { key: 'consultation_fee', label: 'Fee', render: (r: any) => formatCurrency(r.consultation_fee) },
  ],
  filters: [{ name: 'doctor_id', label: 'Doctor', type: 'select', reference: doctorRef }],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'doctor_id', label: 'Doctor', type: 'select', required: true, reference: doctorRef },
    { name: 'day_of_week', label: 'Day of Week', type: 'select', required: true, options: dayOptions },
    { name: 'start_time', label: 'Start Time', type: 'time', required: true },
    { name: 'end_time', label: 'End Time', type: 'time', required: true },
    { name: 'slot_duration', label: 'Slot Duration (min)', type: 'number', defaultValue: 15 },
    { name: 'max_patients', label: 'Max Patients', type: 'number' },
    { name: 'consultation_fee', label: 'Consultation Fee', type: 'number', step: '0.01' },
    { name: 'is_available', label: 'Available', type: 'checkbox', defaultValue: true },
  ],
}

export const doctorUnavailabilityConfig: ResourceConfig = {
  key: 'doctor-unavailability',
  title: 'Doctor Unavailability',
  singular: 'Unavailability',
  endpoint: '/doctor-unavailability',
  columns: [
    { key: 'doctor', label: 'Doctor', render: (r: any) => (r.doctor ? `Dr. ${fullName(r.doctor)}` : '—') },
    { key: 'start_date', label: 'From', render: (r: any) => formatDate(r.start_date) },
    { key: 'end_date', label: 'To', render: (r: any) => formatDate(r.end_date) },
    { key: 'reason', label: 'Reason' },
  ],
  filters: [{ name: 'doctor_id', label: 'Doctor', type: 'select', reference: doctorRef }],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'doctor_id', label: 'Doctor', type: 'select', required: true, reference: doctorRef },
    { name: 'start_date', label: 'Start Date', type: 'date', required: true },
    { name: 'end_date', label: 'End Date', type: 'date', required: true },
    { name: 'reason', label: 'Reason', type: 'text', fullWidth: true },
    { name: 'is_full_day', label: 'Full Day', type: 'checkbox', defaultValue: true },
  ],
}

export const labTestsConfig: ResourceConfig = {
  key: 'lab-tests',
  title: 'Lab Tests',
  singular: 'Lab Test',
  endpoint: '/lab-tests',
  columns: [
    { key: 'test_code', label: 'Code' },
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price', render: (r: any) => formatCurrency(r.price) },
    { key: 'turnaround_time', label: 'TAT (hrs)' },
    { key: 'specimen_type', label: 'Specimen' },
  ],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'test_code', label: 'Test Code', type: 'text', required: true },
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'price', label: 'Price', type: 'number', step: '0.01' },
    { name: 'turnaround_time', label: 'Turnaround Time (hrs)', type: 'number' },
    { name: 'specimen_type', label: 'Specimen Type', type: 'text' },
    { name: 'units', label: 'Units', type: 'text' },
    { name: 'normal_range', label: 'Normal Range', type: 'text' },
    { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
  ],
}

export const radiologyTestsConfig: ResourceConfig = {
  key: 'radiology-tests',
  title: 'Radiology Tests',
  singular: 'Radiology Test',
  endpoint: '/radiology-tests',
  columns: [
    { key: 'test_code', label: 'Code' },
    { key: 'name', label: 'Name' },
    { key: 'modality', label: 'Modality', render: (r: any) => titleCase(r.modality) },
    { key: 'price', label: 'Price', render: (r: any) => formatCurrency(r.price) },
  ],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'test_code', label: 'Test Code', type: 'text', required: true },
    { name: 'name', label: 'Name', type: 'text', required: true },
    {
      name: 'modality',
      label: 'Modality',
      type: 'select',
      required: true,
      options: [
        { value: 'xray', label: 'X-Ray' },
        { value: 'ct', label: 'CT Scan' },
        { value: 'mri', label: 'MRI' },
        { value: 'ultrasound', label: 'Ultrasound' },
        { value: 'pet', label: 'PET' },
        { value: 'mammogram', label: 'Mammogram' },
        { value: 'fluoroscopy', label: 'Fluoroscopy' },
      ],
    },
    { name: 'price', label: 'Price', type: 'number', step: '0.01' },
    { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
  ],
}

export const medicineCategoriesConfig: ResourceConfig = {
  key: 'medicine-categories',
  title: 'Medicine Categories',
  singular: 'Category',
  endpoint: '/medicine-categories',
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    { key: 'description', label: 'Description' },
  ],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'code', label: 'Code', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
    { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
  ],
}

export const medicinesConfig: ResourceConfig = {
  key: 'medicines',
  title: 'Medicines',
  singular: 'Medicine',
  endpoint: '/medicines',
  searchable: true,
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'generic_name', label: 'Generic Name' },
    { key: 'strength', label: 'Strength' },
    { key: 'category', label: 'Category', render: (r: any) => r.category?.name ?? '—' },
    { key: 'current_stock', label: 'Stock' },
    { key: 'price', label: 'Price', render: (r: any) => formatCurrency(r.price) },
    { key: 'expiry_date', label: 'Expiry', render: (r: any) => formatDate(r.expiry_date) },
  ],
  filters: [{ name: 'category_id', label: 'Category', type: 'select', reference: medicineCategoryRef }],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'category_id', label: 'Category', type: 'select', reference: medicineCategoryRef },
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'generic_name', label: 'Generic Name', type: 'text' },
    { name: 'strength', label: 'Strength', type: 'text' },
    { name: 'dosage_form', label: 'Dosage Form', type: 'text' },
    { name: 'unit', label: 'Unit', type: 'text' },
    { name: 'manufacturer', label: 'Manufacturer', type: 'text' },
    { name: 'price', label: 'Price', type: 'number', step: '0.01' },
    { name: 'gst_rate', label: 'GST Rate (%)', type: 'number', step: '0.01' },
    { name: 'reorder_level', label: 'Reorder Level', type: 'number' },
    { name: 'current_stock', label: 'Current Stock', type: 'number' },
    { name: 'expiry_date', label: 'Expiry Date', type: 'date' },
    { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
  ],
}

export const suppliersConfig: ResourceConfig = {
  key: 'suppliers',
  title: 'Suppliers',
  singular: 'Supplier',
  endpoint: '/suppliers',
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'contact_person', label: 'Contact' },
    { key: 'phone', label: 'Phone' },
    { key: 'gstin', label: 'GSTIN' },
  ],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'contact_person', label: 'Contact Person', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'gstin', label: 'GSTIN', type: 'text' },
    { name: 'address', label: 'Address', type: 'textarea', fullWidth: true },
    { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
  ],
}

export const pharmacyInventoryConfig: ResourceConfig = {
  key: 'pharmacy-inventory',
  title: 'Pharmacy Inventory',
  singular: 'Stock Batch',
  endpoint: '/pharmacy-inventory',
  description: 'Receive stock batches; quantities replenish the medicine total automatically.',
  columns: [
    { key: 'medicine', label: 'Medicine', render: (r: any) => r.medicine?.name ?? '—' },
    { key: 'batch_number', label: 'Batch #' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'unit_price', label: 'Unit Price', render: (r: any) => formatCurrency(r.unit_price) },
    { key: 'expiry_date', label: 'Expiry', render: (r: any) => formatDate(r.expiry_date) },
    { key: 'supplier', label: 'Supplier', render: (r: any) => r.supplier?.name ?? '—' },
    { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
  ],
  filters: [{ name: 'medicine_id', label: 'Medicine', type: 'select', reference: medicineRef }],
  canEdit: false,
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'medicine_id', label: 'Medicine', type: 'select', required: true, reference: medicineRef },
    { name: 'batch_number', label: 'Batch Number', type: 'text' },
    { name: 'quantity', label: 'Quantity Received', type: 'number', required: true },
    { name: 'unit_price', label: 'Unit Price', type: 'number', step: '0.01' },
    { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
    { name: 'expiry_date', label: 'Expiry Date', type: 'date' },
    { name: 'supplier_id', label: 'Supplier', type: 'select', reference: supplierRef },
    { name: 'rack_location', label: 'Rack Location', type: 'text' },
  ],
}

export const chartOfAccountsConfig: ResourceConfig = {
  key: 'chart-of-accounts',
  title: 'Chart of Accounts',
  singular: 'Account',
  endpoint: '/chart-of-accounts',
  canEdit: false,
  columns: [
    { key: 'account_code', label: 'Code' },
    { key: 'account_name', label: 'Name' },
    { key: 'group_code', label: 'Group' },
    { key: 'head_code', label: 'Head' },
    { key: 'account_type', label: 'Type', render: (r: any) => titleCase(r.account_type) },
    { key: 'opening_balance', label: 'Opening Balance', render: (r: any) => formatCurrency(r.opening_balance) },
    { key: 'current_balance', label: 'Current Balance', render: (r: any) => formatCurrency(r.current_balance) },
  ],
  fields: [
    { name: 'account_code', label: 'Account Code', type: 'text', required: true },
    { name: 'account_name', label: 'Account Name', type: 'text', required: true },
    { name: 'group_code', label: 'Group Code', type: 'text', required: true },
    { name: 'head_code', label: 'Head Code', type: 'text', required: true },
    {
      name: 'account_type',
      label: 'Account Type',
      type: 'select',
      required: true,
      options: [
        { value: 'debit', label: 'Debit' },
        { value: 'credit', label: 'Credit' },
      ],
    },
    { name: 'opening_balance', label: 'Opening Balance', type: 'number', step: '0.01', defaultValue: 0 },
  ],
}

export const visitsConfig: ResourceConfig = {
  key: 'visits',
  title: 'Patient Visits',
  singular: 'Visit',
  endpoint: '/visits',
  canDelete: false,
  columns: [
    { key: 'token_number', label: 'Token' },
    { key: 'patient', label: 'Patient', render: (r: any) => fullName(r.patient) },
    { key: 'doctor', label: 'Doctor', render: (r: any) => (r.doctor ? `Dr. ${fullName(r.doctor)}` : '—') },
    { key: 'visit_type', label: 'Type', render: (r: any) => titleCase(r.visit_type) },
    { key: 'visit_date', label: 'Date', render: (r: any) => formatDate(r.visit_date) },
    { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
  ],
  filters: [
    { name: 'doctor_id', label: 'Doctor', type: 'select', reference: doctorRef },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: ['waiting', 'in_progress', 'completed', 'cancelled'].map((v) => ({ value: v, label: titleCase(v) })),
    },
  ],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'patient_id', label: 'Patient', type: 'select', required: true, reference: { endpoint: '/patients', label: (p: any) => `${fullName(p)} (${p.patient_id ?? p.id})` } },
    { name: 'doctor_id', label: 'Doctor', type: 'select', required: true, reference: doctorRef },
    { name: 'department_id', label: 'Department', type: 'select', reference: departmentRef },
    {
      name: 'visit_type',
      label: 'Visit Type',
      type: 'select',
      options: ['opd', 'emergency', 'follow_up', 'consultation'].map((v) => ({ value: v, label: titleCase(v) })),
    },
    { name: 'chief_complaint', label: 'Chief Complaint', type: 'textarea', fullWidth: true },
    { name: 'is_emergency', label: 'Emergency', type: 'checkbox' },
  ],
}

export const caseSheetsConfig: ResourceConfig = {
  key: 'case-sheets',
  title: 'Case Sheets',
  singular: 'Case Sheet',
  endpoint: '/case-sheets',
  canDelete: false,
  columns: [
    { key: 'patient', label: 'Patient', render: (r: any) => fullName(r.patient) },
    { key: 'doctor', label: 'Doctor', render: (r: any) => (r.doctor ? `Dr. ${fullName(r.doctor)}` : '—') },
    { key: 'note_type', label: 'Type', render: (r: any) => titleCase(r.note_type) },
    { key: 'note_date', label: 'Date', render: (r: any) => formatDate(r.note_date) },
    { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
  ],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'patient_id', label: 'Patient', type: 'select', required: true, reference: { endpoint: '/patients', label: (p: any) => fullName(p) } },
    { name: 'doctor_id', label: 'Doctor', type: 'select', required: true, reference: doctorRef },
    {
      name: 'note_type',
      label: 'Note Type',
      type: 'select',
      options: ['admission', 'progress', 'discharge', 'consultation', 'procedure'].map((v) => ({
        value: v,
        label: titleCase(v),
      })),
    },
    { name: 'subjective', label: 'Subjective', type: 'textarea', fullWidth: true },
    { name: 'objective', label: 'Objective', type: 'textarea', fullWidth: true },
    { name: 'assessment', label: 'Assessment', type: 'textarea', fullWidth: true },
    { name: 'plan', label: 'Plan', type: 'textarea', fullWidth: true },
  ],
}

export const opdRecordsConfig: ResourceConfig = {
  key: 'opd-records',
  title: 'OPD Records',
  singular: 'OPD Record',
  endpoint: '/opd-records',
  columns: [
    { key: 'patient', label: 'Patient', render: (r: any) => fullName(r.patient) },
    { key: 'doctor', label: 'Doctor', render: (r: any) => (r.doctor ? `Dr. ${fullName(r.doctor)}` : '—') },
    { key: 'opd_date', label: 'Date', render: (r: any) => formatDate(r.opd_date) },
    { key: 'provisional_diagnosis', label: 'Diagnosis' },
    { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
  ],
  filters: [{ name: 'patient_id', label: 'Patient', type: 'select', reference: { endpoint: '/patients', label: (p: any) => fullName(p) } }],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'patient_id', label: 'Patient', type: 'select', required: true, reference: { endpoint: '/patients', label: (p: any) => fullName(p) } },
    { name: 'doctor_id', label: 'Doctor', type: 'select', required: true, reference: doctorRef },
    { name: 'visit_id', label: 'Visit', type: 'select', required: true, reference: { endpoint: '/visits', label: (v: any) => `Visit #${v.id} — ${fullName(v.patient)}` } },
    { name: 'chief_complaint', label: 'Chief Complaint', type: 'textarea', fullWidth: true },
    { name: 'history_presenting', label: 'History of Presenting Illness', type: 'textarea', fullWidth: true },
    { name: 'physical_examination', label: 'Physical Examination', type: 'textarea', fullWidth: true },
    { name: 'provisional_diagnosis', label: 'Provisional Diagnosis', type: 'text', fullWidth: true },
    { name: 'final_diagnosis', label: 'Final Diagnosis', type: 'text', fullWidth: true },
    { name: 'treatment_advised', label: 'Treatment Advised', type: 'textarea', fullWidth: true },
    { name: 'advice', label: 'Advice', type: 'textarea', fullWidth: true },
    { name: 'follow_up_date', label: 'Follow-up Date', type: 'date' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: ['draft', 'final', 'cancelled'].map((v) => ({ value: v, label: titleCase(v) })),
      defaultValue: 'final',
    },
  ],
}

export const ipdRecordsConfig: ResourceConfig = {
  key: 'ipd-records',
  title: 'IPD Daily Records',
  singular: 'IPD Record',
  endpoint: '/ipd-records',
  columns: [
    { key: 'patient', label: 'Patient', render: (r: any) => fullName(r.patient) },
    { key: 'day_number', label: 'Day #' },
    { key: 'bed', label: 'Bed', render: (r: any) => r.bed?.bed_number ?? '—' },
    { key: 'ipd_date', label: 'Date', render: (r: any) => formatDate(r.ipd_date) },
    { key: 'is_icu', label: 'ICU', render: (r: any) => (r.is_icu ? <StatusBadge status="critical" /> : '—') },
  ],
  filters: [{ name: 'admission_id', label: 'Admission ID', type: 'text' }],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'patient_id', label: 'Patient', type: 'select', required: true, reference: { endpoint: '/patients', label: (p: any) => fullName(p) } },
    { name: 'admission_id', label: 'Admission', type: 'select', required: true, reference: { endpoint: '/admissions', label: (a: any) => `#${a.id} — ${fullName(a.patient)}` } },
    { name: 'bed_id', label: 'Bed', type: 'select', required: true, reference: { endpoint: '/beds', label: (b: any) => b.bed_number } },
    { name: 'doctor_id', label: 'Doctor', type: 'select', required: true, reference: doctorRef },
    { name: 'diagnosis', label: 'Diagnosis', type: 'textarea', fullWidth: true },
    { name: 'treatment_plan', label: 'Treatment Plan', type: 'textarea', fullWidth: true },
    { name: 'medications', label: 'Medications', type: 'textarea', fullWidth: true },
    { name: 'nursing_notes', label: 'Nursing Notes', type: 'textarea', fullWidth: true },
    { name: 'doctor_notes', label: 'Doctor Notes', type: 'textarea', fullWidth: true },
    { name: 'is_icu', label: 'ICU Patient', type: 'checkbox' },
  ],
}

export const nursingRecordsConfig: ResourceConfig = {
  key: 'nursing-records',
  title: 'Nursing Records',
  singular: 'Nursing Record',
  endpoint: '/nursing-records',
  columns: [
    { key: 'patient', label: 'Patient', render: (r: any) => fullName(r.patient) },
    { key: 'nurse', label: 'Nurse', render: (r: any) => (r.nurse ? fullName(r.nurse) : '—') },
    { key: 'shift', label: 'Shift', render: (r: any) => titleCase(r.shift) },
    { key: 'record_date', label: 'Date', render: (r: any) => formatDate(r.record_date) },
  ],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'patient_id', label: 'Patient', type: 'select', required: true, reference: { endpoint: '/patients', label: (p: any) => fullName(p) } },
    { name: 'admission_id', label: 'Admission', type: 'select', required: true, reference: { endpoint: '/admissions', label: (a: any) => `#${a.id} — ${fullName(a.patient)}` } },
    { name: 'nurse_id', label: 'Nurse', type: 'select', required: true, reference: userRef },
    {
      name: 'shift',
      label: 'Shift',
      type: 'select',
      options: ['morning', 'evening', 'night'].map((v) => ({ value: v, label: titleCase(v) })),
    },
    { name: 'medications_given', label: 'Medications Given', type: 'textarea', fullWidth: true },
    { name: 'observations', label: 'Observations', type: 'textarea', fullWidth: true },
  ],
}

export const icuRecordsConfig: ResourceConfig = {
  key: 'icu-records',
  title: 'ICU Records',
  singular: 'ICU Record',
  endpoint: '/icu-records',
  columns: [
    { key: 'patient', label: 'Patient', render: (r: any) => fullName(r.patient) },
    { key: 'consciousness_level', label: 'Consciousness' },
    { key: 'oxygen_saturation', label: 'SpO2' },
    { key: 'icu_date', label: 'Date', render: (r: any) => formatDate(r.icu_date) },
    { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
  ],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'patient_id', label: 'Patient', type: 'select', required: true, reference: { endpoint: '/patients', label: (p: any) => fullName(p) } },
    { name: 'admission_id', label: 'Admission', type: 'select', required: true, reference: { endpoint: '/admissions', label: (a: any) => `#${a.id} — ${fullName(a.patient)}` } },
    { name: 'doctor_id', label: 'Doctor', type: 'select', required: true, reference: doctorRef },
    { name: 'consciousness_level', label: 'Consciousness Level', type: 'text' },
    { name: 'oxygen_saturation', label: 'Oxygen Saturation (%)', type: 'number', step: '0.1' },
    { name: 'ventilator_mode', label: 'Ventilator Mode', type: 'text' },
    { name: 'doctor_notes', label: 'Doctor Notes', type: 'textarea', fullWidth: true },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: ['active', 'stable', 'critical', 'transferred', 'discharged'].map((v) => ({ value: v, label: titleCase(v) })),
    },
  ],
}

export const otSchedulesConfig: ResourceConfig = {
  key: 'ot-schedules',
  title: 'Operation Theatre Schedule',
  singular: 'Surgery',
  endpoint: '/ot-schedules',
  columns: [
    { key: 'patient', label: 'Patient', render: (r: any) => fullName(r.patient) },
    { key: 'doctor', label: 'Surgeon', render: (r: any) => (r.doctor ? `Dr. ${fullName(r.doctor)}` : '—') },
    { key: 'ot_number', label: 'OT #' },
    { key: 'surgery_date', label: 'Date', render: (r: any) => formatDate(r.surgery_date) },
    { key: 'surgery_type', label: 'Surgery' },
    { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
  ],
  filters: [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: ['scheduled', 'prepared', 'in_progress', 'completed', 'cancelled', 'postponed'].map((v) => ({
        value: v,
        label: titleCase(v),
      })),
    },
  ],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'patient_id', label: 'Patient', type: 'select', required: true, reference: { endpoint: '/patients', label: (p: any) => fullName(p) } },
    { name: 'doctor_id', label: 'Surgeon', type: 'select', required: true, reference: doctorRef },
    { name: 'assistant_doctor_id', label: 'Assistant Surgeon', type: 'select', reference: doctorRef },
    { name: 'anesthetist_id', label: 'Anesthetist', type: 'select', reference: doctorRef },
    { name: 'nurse_id', label: 'Nurse', type: 'select', reference: userRef },
    { name: 'ot_number', label: 'OT Number', type: 'text', required: true },
    { name: 'surgery_date', label: 'Surgery Date', type: 'date', required: true },
    { name: 'surgery_time', label: 'Surgery Time', type: 'time', required: true },
    { name: 'expected_duration', label: 'Expected Duration (min)', type: 'number' },
    { name: 'surgery_type', label: 'Surgery Type', type: 'text', fullWidth: true },
    { name: 'surgery_reason', label: 'Reason', type: 'textarea', fullWidth: true },
    { name: 'anesthesia_type', label: 'Anesthesia Type', type: 'text' },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: ['routine', 'urgent', 'emergency'].map((v) => ({ value: v, label: titleCase(v) })),
    },
    { name: 'is_emergency', label: 'Emergency', type: 'checkbox' },
  ],
}

export const radiologyOrdersConfig: ResourceConfig = {
  key: 'radiology-orders',
  title: 'Radiology Orders',
  singular: 'Radiology Order',
  endpoint: '/radiology-orders',
  columns: [
    { key: 'patient', label: 'Patient', render: (r: any) => fullName(r.patient) },
    { key: 'radiology_test', label: 'Test', render: (r: any) => r.radiology_test?.name ?? '—' },
    { key: 'body_part', label: 'Body Part' },
    { key: 'priority', label: 'Priority', render: (r: any) => <StatusBadge status={r.priority} /> },
    { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
  ],
  filters: [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: ['ordered', 'scheduled', 'in_progress', 'reported', 'cancelled'].map((v) => ({
        value: v,
        label: titleCase(v),
      })),
    },
  ],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'patient_id', label: 'Patient', type: 'select', required: true, reference: { endpoint: '/patients', label: (p: any) => fullName(p) } },
    { name: 'doctor_id', label: 'Doctor', type: 'select', required: true, reference: doctorRef },
    { name: 'radiology_test_id', label: 'Test', type: 'select', required: true, reference: { endpoint: '/radiology-tests', label: (t: any) => t.name } },
    { name: 'body_part', label: 'Body Part', type: 'text' },
    { name: 'clinical_indication', label: 'Clinical Indication', type: 'textarea', fullWidth: true },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: ['routine', 'urgent', 'stat'].map((v) => ({ value: v, label: titleCase(v) })),
    },
  ],
}

export const bloodBankConfig: ResourceConfig = {
  key: 'blood-bank',
  title: 'Blood Bank',
  singular: 'Blood Unit',
  endpoint: '/blood-bank',
  columns: [
    { key: 'blood_group', label: 'Group', render: (r: any) => `${r.blood_group}${r.rh_factor === 'negative' ? '−' : '+'}` },
    { key: 'component_type', label: 'Component', render: (r: any) => titleCase(r.component_type) },
    { key: 'quantity', label: 'Quantity (ml)' },
    { key: 'donor_name', label: 'Donor' },
    { key: 'expiry_date', label: 'Expiry', render: (r: any) => formatDate(r.expiry_date) },
    { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
  ],
  filters: [
    { name: 'blood_group', label: 'Blood Group', type: 'select', options: ['A', 'B', 'AB', 'O'].map((v) => ({ value: v, label: v })) },
    { name: 'status', label: 'Status', type: 'select', options: ['available', 'issued', 'expired', 'discarded'].map((v) => ({ value: v, label: titleCase(v) })) },
  ],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'donor_name', label: 'Donor Name', type: 'text' },
    { name: 'blood_group', label: 'Blood Group', type: 'select', required: true, options: ['A', 'B', 'AB', 'O'].map((v) => ({ value: v, label: v })) },
    { name: 'rh_factor', label: 'Rh Factor', type: 'select', options: [{ value: 'positive', label: 'Positive' }, { value: 'negative', label: 'Negative' }] },
    {
      name: 'component_type',
      label: 'Component',
      type: 'select',
      options: ['whole_blood', 'packed_rbc', 'platelets', 'plasma', 'cryoprecipitate'].map((v) => ({ value: v, label: titleCase(v) })),
    },
    { name: 'quantity', label: 'Quantity (ml)', type: 'number', required: true },
    { name: 'collection_date', label: 'Collection Date', type: 'date' },
    { name: 'expiry_date', label: 'Expiry Date', type: 'date' },
  ],
}

export const insuranceClaimsConfig: ResourceConfig = {
  key: 'insurance-claims',
  title: 'Insurance Claims',
  singular: 'Claim',
  endpoint: '/insurance-claims',
  canEdit: false,
  canDelete: false,
  columns: [
    { key: 'patient', label: 'Patient', render: (r: any) => fullName(r.patient) },
    { key: 'insurance_provider', label: 'Provider' },
    { key: 'claim_amount', label: 'Claimed', render: (r: any) => formatCurrency(r.claim_amount) },
    { key: 'approved_amount', label: 'Approved', render: (r: any) => (r.approved_amount != null ? formatCurrency(r.approved_amount) : '—') },
    { key: 'claim_status', label: 'Status', render: (r: any) => <StatusBadge status={r.claim_status} /> },
  ],
  fields: [
    { name: 'hospital_id', label: 'Hospital', type: 'select', required: true, reference: hospitalRef },
    { name: 'patient_id', label: 'Patient', type: 'select', required: true, reference: { endpoint: '/patients', label: (p: any) => fullName(p) } },
    { name: 'bill_id', label: 'Bill', type: 'select', reference: { endpoint: '/bills', label: (b: any) => `Bill #${b.id} — ${formatCurrency(b.total_amount)}` } },
    { name: 'insurance_provider', label: 'Insurance Provider', type: 'text', required: true },
    { name: 'policy_number', label: 'Policy Number', type: 'text' },
    { name: 'tpa_name', label: 'TPA Name', type: 'text' },
    { name: 'claim_amount', label: 'Claim Amount', type: 'number', step: '0.01', required: true },
  ],
}

export const auditLogsConfig: ResourceConfig = {
  key: 'audit-logs',
  title: 'Audit Logs',
  singular: 'Log',
  endpoint: '/audit-logs',
  canCreate: false,
  canEdit: false,
  canDelete: false,
  columns: [
    { key: 'created_at', label: 'When', render: (r: any) => formatDate(r.created_at) },
    { key: 'user', label: 'User', render: (r: any) => (r.user ? fullName(r.user) : 'System') },
    { key: 'action', label: 'Action' },
    { key: 'auditable_type', label: 'Entity', render: (r: any) => r.auditable_type?.split('\\').pop() ?? '—' },
  ],
  fields: [],
}
