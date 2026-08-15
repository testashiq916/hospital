import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient, extractErrorMessage } from '@/api/client'
import { PageHeader, Card, ErrorBanner } from '@/components/ui/Misc'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/auth/AuthContext'

interface PatientTypeOption {
  id: number
  name: string
}
interface HospitalOption {
  id: number
  name: string
}

const initialState = {
  hospital_id: '',
  patient_type_id: '',
  first_name: '',
  last_name: '',
  middle_name: '',
  gender: 'male',
  date_of_birth: '',
  blood_group: '',
  marital_status: '',
  email: '',
  mobile: '',
  alternate_mobile: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  zip_code: '',
  guardian_name: '',
  guardian_relationship: '',
  guardian_contact: '',
  allergies: '',
  chronic_diseases: '',
  medications: '',
  insurance_provider: '',
  insurance_policy_number: '',
  insurance_coverage: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
  registration_type: 'opd',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 border-b border-slate-100 pb-2 text-sm font-semibold text-slate-800">{title}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{children}</div>
    </div>
  )
}

export default function PatientRegisterPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({ ...initialState, hospital_id: user?.hospital_id ? String(user.hospital_id) : '' })
  const [error, setError] = useState<string | null>(null)

  const hospitalsQuery = useQuery({
    queryKey: ['reference', '/hospitals'],
    queryFn: async () => (await apiClient.get('/hospitals', { params: { per_page: 200 } })).data.data as HospitalOption[],
  })
  const patientTypesQuery = useQuery({
    queryKey: ['reference', '/patient-types'],
    queryFn: async () => (await apiClient.get('/patient-types', { params: { per_page: 200 } })).data.data as PatientTypeOption[],
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, any> = { ...form }
      for (const key of Object.keys(payload)) {
        if (payload[key] === '') payload[key] = null
      }
      if (payload.insurance_coverage) payload.insurance_coverage = Number(payload.insurance_coverage)
      const res = await apiClient.post('/patients', payload)
      return res.data
    },
    onSuccess: (data) => navigate(`/patients/${data.id}`),
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function update<K extends keyof typeof initialState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    mutation.mutate()
  }

  return (
    <div>
      <PageHeader title="Register Patient" description="Capture OPD, IPD or emergency registration details." />
      <Card>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4">
              <ErrorBanner message={error} />
            </div>
          )}

          <Section title="Registration">
            <Select
              label="Hospital"
              required
              value={form.hospital_id}
              onChange={(e) => update('hospital_id', e.target.value)}
              options={(hospitalsQuery.data ?? []).map((h) => ({ value: h.id, label: h.name }))}
            />
            <Select
              label="Registration Type"
              value={form.registration_type}
              onChange={(e) => update('registration_type', e.target.value)}
              options={[
                { value: 'opd', label: 'OPD Registration' },
                { value: 'ipd', label: 'IPD Admission' },
                { value: 'emergency', label: 'Emergency Registration' },
              ]}
            />
            <Select
              label="Patient Type"
              value={form.patient_type_id}
              onChange={(e) => update('patient_type_id', e.target.value)}
              options={(patientTypesQuery.data ?? []).map((t) => ({ value: t.id, label: t.name }))}
            />
          </Section>

          <Section title="Basic Details">
            <Input label="First Name" required value={form.first_name} onChange={(e) => update('first_name', e.target.value)} />
            <Input label="Middle Name" value={form.middle_name} onChange={(e) => update('middle_name', e.target.value)} />
            <Input label="Last Name" required value={form.last_name} onChange={(e) => update('last_name', e.target.value)} />
            <Select
              label="Gender"
              required
              value={form.gender}
              onChange={(e) => update('gender', e.target.value)}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <Input
              label="Date of Birth"
              type="date"
              required
              value={form.date_of_birth}
              onChange={(e) => update('date_of_birth', e.target.value)}
            />
            <Select
              label="Blood Group"
              value={form.blood_group}
              onChange={(e) => update('blood_group', e.target.value)}
              options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((v) => ({ value: v, label: v }))}
            />
            <Select
              label="Marital Status"
              value={form.marital_status}
              onChange={(e) => update('marital_status', e.target.value)}
              options={['single', 'married', 'divorced', 'widowed'].map((v) => ({ value: v, label: v }))}
            />
          </Section>

          <Section title="Contact Details">
            <Input label="Mobile" required value={form.mobile} onChange={(e) => update('mobile', e.target.value)} />
            <Input label="Alternate Mobile" value={form.alternate_mobile} onChange={(e) => update('alternate_mobile', e.target.value)} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            <div className="md:col-span-3">
              <Textarea label="Address" value={form.address} onChange={(e) => update('address', e.target.value)} />
            </div>
            <Input label="City" value={form.city} onChange={(e) => update('city', e.target.value)} />
            <Input label="State" value={form.state} onChange={(e) => update('state', e.target.value)} />
            <Input label="Zip Code" value={form.zip_code} onChange={(e) => update('zip_code', e.target.value)} />
          </Section>

          <Section title="Guardian (for minors)">
            <Input label="Guardian Name" value={form.guardian_name} onChange={(e) => update('guardian_name', e.target.value)} />
            <Input
              label="Relationship"
              value={form.guardian_relationship}
              onChange={(e) => update('guardian_relationship', e.target.value)}
            />
            <Input label="Guardian Contact" value={form.guardian_contact} onChange={(e) => update('guardian_contact', e.target.value)} />
          </Section>

          <Section title="Medical Background">
            <Textarea label="Allergies" value={form.allergies} onChange={(e) => update('allergies', e.target.value)} />
            <Textarea label="Chronic Diseases" value={form.chronic_diseases} onChange={(e) => update('chronic_diseases', e.target.value)} />
            <Textarea label="Current Medications" value={form.medications} onChange={(e) => update('medications', e.target.value)} />
          </Section>

          <Section title="Insurance">
            <Input label="Insurance Provider" value={form.insurance_provider} onChange={(e) => update('insurance_provider', e.target.value)} />
            <Input
              label="Policy Number"
              value={form.insurance_policy_number}
              onChange={(e) => update('insurance_policy_number', e.target.value)}
            />
            <Input
              label="Coverage Amount"
              type="number"
              value={form.insurance_coverage}
              onChange={(e) => update('insurance_coverage', e.target.value)}
            />
          </Section>

          <Section title="Emergency Contact">
            <Input
              label="Name"
              value={form.emergency_contact_name}
              onChange={(e) => update('emergency_contact_name', e.target.value)}
            />
            <Input
              label="Phone"
              value={form.emergency_contact_phone}
              onChange={(e) => update('emergency_contact_phone', e.target.value)}
            />
            <Input
              label="Relationship"
              value={form.emergency_contact_relationship}
              onChange={(e) => update('emergency_contact_relationship', e.target.value)}
            />
          </Section>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => navigate('/patients')}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Registering…' : 'Register Patient'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
