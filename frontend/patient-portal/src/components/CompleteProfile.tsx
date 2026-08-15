import { PatientProfileForm } from './PatientProfileForm'
import { Alert, Card } from './ui'
import { useAuth } from '../context/AuthContext'
import { usePatient } from '../context/PatientContext'

/**
 * Shown in place of the app when a signed-in `patient`-role user has no
 * linked `patients` row yet. See README "Known backend gaps" — the backend
 * has no server-side way to create this link automatically, so we ask once,
 * up front, and cache the result client-side afterwards.
 */
export function CompleteProfile() {
  const { user } = useAuth()
  const { createProfile } = usePatient()

  if (!user?.hospital_id) {
    return (
      <div className="mx-auto max-w-lg py-16">
        <Alert>
          Your account isn't linked to a hospital yet, so a patient record can't be created. This
          can happen for self-service sign-ups — see the README for details.
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Complete your patient profile</h1>
      <p className="mt-1 text-sm text-slate-500">
        We need a few details before you can book appointments and view your records.
      </p>
      <Card className="mt-6">
        <PatientProfileForm
          hospitalId={user.hospital_id}
          submitLabel="Save and continue"
          onSubmit={(input) =>
            createProfile({
              ...input,
              first_name: input.first_name || user.first_name,
              last_name: input.last_name || user.last_name,
              email: input.email || user.email,
            })
          }
        />
      </Card>
    </div>
  )
}
