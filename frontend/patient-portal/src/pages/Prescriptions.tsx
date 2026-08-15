import { useEffect, useState } from 'react'
import { usePatient } from '../context/PatientContext'
import { prescriptionsApi } from '../api/clinical'
import type { Prescription } from '../types/api'
import { Card, EmptyState, PageSpinner } from '../components/ui'
import { formatDate } from '../lib/format'

export function Prescriptions() {
  const { patient } = usePatient()
  const [prescriptions, setPrescriptions] = useState<Prescription[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!patient) return
    prescriptionsApi
      .listForPatient(patient.id)
      .then((page) => setPrescriptions(page.data))
      .catch(() => setError('Could not load your prescriptions.'))
  }, [patient])

  if (!patient || prescriptions === null) {
    return error ? <p className="text-sm text-rose-600">{error}</p> : <PageSpinner />
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My prescriptions</h1>
        <p className="mt-1 text-sm text-slate-500">Medicines prescribed by your doctors.</p>
      </div>

      {prescriptions.length === 0 ? (
        <EmptyState
          icon="💊"
          title="No prescriptions yet"
          description="Prescriptions from your doctors will appear here after a visit."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {prescriptions.map((rx) => (
            <Card key={rx.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">
                    Dr. {rx.doctor?.first_name} {rx.doctor?.last_name}
                  </p>
                  <p className="text-sm text-slate-500">{formatDate(rx.prescription_date)}</p>
                </div>
                <span className="text-xs text-slate-400">{rx.prescription_id}</span>
              </div>

              {rx.diagnosis && (
                <p className="mt-3 text-sm text-slate-700">
                  <span className="font-medium">Diagnosis:</span> {rx.diagnosis}
                </p>
              )}

              <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
                {(rx.items ?? []).map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {item.medicine?.name ?? 'Medicine'}
                        {item.medicine?.strength ? ` (${item.medicine.strength})` : ''}
                      </p>
                      <p className="text-xs text-slate-500">
                        {[item.dosage, item.frequency, item.duration].filter(Boolean).join(' · ') ||
                          '—'}
                      </p>
                      {item.instructions && (
                        <p className="text-xs text-slate-400">{item.instructions}</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">Qty {item.quantity}</span>
                  </div>
                ))}
              </div>

              {rx.notes && <p className="mt-3 text-xs text-slate-500">Note: {rx.notes}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
