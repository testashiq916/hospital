import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { patientsApi } from '../api/patients'
import type { PatientProfileInput } from '../api/patients'
import type { Patient } from '../types/api'
import { useAuth } from './AuthContext'

function cacheKey(userId: number): string {
  return `hms_patient_id_${userId}`
}

interface PatientContextValue {
  /** The `patients` row that belongs to the signed-in user, once resolved. */
  patient: Patient | null
  isLoading: boolean
  /** True once resolution has finished and no linked patient row was found. */
  needsProfile: boolean
  createProfile: (input: PatientProfileInput) => Promise<Patient>
  updateProfile: (input: Partial<PatientProfileInput>) => Promise<Patient>
  refresh: () => Promise<void>
}

const PatientContext = createContext<PatientContextValue | undefined>(undefined)

export function PatientProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [needsProfile, setNeedsProfile] = useState(false)

  const resolve = useCallback(async () => {
    if (!user) {
      setPatient(null)
      setNeedsProfile(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const cachedId = localStorage.getItem(cacheKey(user.id))
      if (cachedId) {
        try {
          const found = await patientsApi.get(Number(cachedId))
          setPatient(found)
          setNeedsProfile(false)
          return
        } catch {
          localStorage.removeItem(cacheKey(user.id))
        }
      }

      // No cached id (or it went stale) — fall back to matching on the
      // exact mobile number the patient registered/logged in with. See
      // README "Known backend gaps" for why this heuristic exists at all.
      const found = await patientsApi.findByMobile(user.mobile)
      if (found) {
        localStorage.setItem(cacheKey(user.id), String(found.id))
        setPatient(found)
        setNeedsProfile(false)
      } else {
        setPatient(null)
        setNeedsProfile(true)
      }
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    resolve()
  }, [resolve])

  const createProfile = useCallback(
    async (input: PatientProfileInput) => {
      if (!user) throw new Error('Must be signed in to create a patient profile.')
      const created = await patientsApi.create({ ...input, mobile: user.mobile })
      localStorage.setItem(cacheKey(user.id), String(created.id))
      setPatient(created)
      setNeedsProfile(false)
      return created
    },
    [user],
  )

  const updateProfile = useCallback(
    async (input: Partial<PatientProfileInput>) => {
      if (!patient) throw new Error('No patient profile to update.')
      const updated = await patientsApi.update(patient.id, input)
      setPatient(updated)
      return updated
    },
    [patient],
  )

  const refresh = useCallback(async () => {
    if (!patient) return
    const fresh = await patientsApi.get(patient.id)
    setPatient(fresh)
  }, [patient])

  const value = useMemo(
    () => ({ patient, isLoading, needsProfile, createProfile, updateProfile, refresh }),
    [patient, isLoading, needsProfile, createProfile, updateProfile, refresh],
  )

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
}

export function usePatient(): PatientContextValue {
  const ctx = useContext(PatientContext)
  if (!ctx) throw new Error('usePatient must be used within PatientProvider')
  return ctx
}
