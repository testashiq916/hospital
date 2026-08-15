import { usePatient } from '../context/PatientContext'
import { useAuth } from '../context/AuthContext'
import { PatientProfileForm } from '../components/PatientProfileForm'
import { Alert, Card, PageSpinner } from '../components/ui'
import { formatDate } from '../lib/format'
import { useState } from 'react'

export function Profile() {
  const { user } = useAuth()
  const { patient, updateProfile } = usePatient()
  const [saved, setSaved] = useState(false)

  if (!patient) return <PageSpinner />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Patient ID <span className="font-mono">{patient.patient_id}</span> · Registered{' '}
          {formatDate(patient.registration_date)}
        </p>
      </div>

      <Card className="flex flex-wrap items-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-semibold text-brand-700">
          {patient.first_name.charAt(0)}
          {patient.last_name.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-slate-900">
            {patient.first_name} {patient.last_name}
          </p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <p className="text-sm text-slate-500">{patient.mobile}</p>
        </div>
      </Card>

      {saved && <Alert tone="green">Profile updated.</Alert>}

      <Card>
        <PatientProfileForm
          initial={patient}
          submitLabel="Save changes"
          onSubmit={async (input) => {
            setSaved(false)
            await updateProfile(input)
            setSaved(true)
          }}
        />
      </Card>
    </div>
  )
}
