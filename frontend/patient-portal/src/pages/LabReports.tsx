import { useEffect, useState } from 'react'
import { usePatient } from '../context/PatientContext'
import { labReportsApi } from '../api/clinical'
import type { LabReport } from '../types/api'
import { Badge, Card, EmptyState, PageSpinner } from '../components/ui'
import { formatDate } from '../lib/format'

export function LabReports() {
  const { patient } = usePatient()
  const [reports, setReports] = useState<LabReport[] | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [detail, setDetail] = useState<Record<number, LabReport>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!patient) return
    labReportsApi
      .listForPatient(patient.id)
      .then((page) => setReports(page.data))
      .catch(() => setError('Could not load your reports.'))
  }, [patient])

  async function toggle(report: LabReport) {
    if (expanded === report.id) {
      setExpanded(null)
      return
    }
    setExpanded(report.id)
    if (!detail[report.id]) {
      const full = await labReportsApi.get(report.id)
      setDetail((d) => ({ ...d, [report.id]: full }))
    }
  }

  if (!patient || reports === null) {
    return error ? <p className="text-sm text-rose-600">{error}</p> : <PageSpinner />
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Lab &amp; radiology reports</h1>
        <p className="mt-1 text-sm text-slate-500">Results from tests ordered by your doctors.</p>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon="🧪"
          title="No reports yet"
          description="Lab and radiology reports will appear here once verified by the lab."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => {
            const full = detail[report.id]
            const isOpen = expanded === report.id
            return (
              <Card key={report.id} className="cursor-pointer" onClick={() => toggle(report)}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">
                      {report.report_title ?? 'Lab Report'}
                    </p>
                    <p className="text-sm text-slate-500">{formatDate(report.report_date)}</p>
                  </div>
                  <Badge tone={report.is_verified ? 'green' : 'amber'}>
                    {report.is_verified ? 'Verified' : 'Pending verification'}
                  </Badge>
                </div>

                {isOpen && (
                  <div className="mt-4 border-t border-slate-100 pt-4" onClick={(e) => e.stopPropagation()}>
                    {!full ? (
                      <p className="text-sm text-slate-400">Loading details…</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {full.clinical_interpretation && (
                          <p className="text-sm text-slate-700">
                            <span className="font-medium">Interpretation:</span>{' '}
                            {full.clinical_interpretation}
                          </p>
                        )}
                        {full.recommendation && (
                          <p className="text-sm text-slate-700">
                            <span className="font-medium">Recommendation:</span>{' '}
                            {full.recommendation}
                          </p>
                        )}
                        {full.labOrder?.items && full.labOrder.items.length > 0 && (
                          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
                            {full.labOrder.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
                              >
                                <div>
                                  <p className="text-sm font-medium text-slate-800">
                                    {item.lab_test?.name ?? 'Test'}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {item.result_text ??
                                      (item.result !== null ? String(item.result) : 'Pending')}
                                    {item.unit ? ` ${item.unit}` : ''}
                                  </p>
                                </div>
                                {item.is_abnormal && <Badge tone="red">Abnormal</Badge>}
                              </div>
                            ))}
                          </div>
                        )}
                        {full.pdf_path ? (
                          <a
                            href={full.pdf_path}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-brand-600 hover:underline"
                          >
                            Download report PDF
                          </a>
                        ) : (
                          <p className="text-xs text-slate-400">
                            No downloadable PDF was generated for this report.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
