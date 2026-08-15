import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiClient, extractErrorMessage } from '@/api/client'
import { Card, PageHeader, ErrorBanner } from '@/components/ui/Misc'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useReferenceOptions } from '@/hooks/useReferenceOptions'
import { fullName } from '@/lib/format'

const TABS = ['Symptom Checker', 'Drug Interactions', 'Health Risk Score', 'ICD-10 Coding', 'Prescription Suggestions'] as const
type Tab = (typeof TABS)[number]

export default function AIFeaturesPage() {
  const [tab, setTab] = useState<Tab>('Symptom Checker')

  return (
    <div>
      <PageHeader title="AI Clinical Tools" description="Rule-based clinical decision support — always paired with human review." />
      <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`cursor-pointer border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Symptom Checker' && <SymptomChecker />}
      {tab === 'Drug Interactions' && <DrugInteractions />}
      {tab === 'Health Risk Score' && <HealthRiskScore />}
      {tab === 'ICD-10 Coding' && <Icd10Coding />}
      {tab === 'Prescription Suggestions' && <PrescriptionSuggestions />}
    </div>
  )
}

function SymptomChecker() {
  const [symptomsText, setSymptomsText] = useState('fever, cough, headache')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post('/ai/symptom-checker', {
          symptoms: symptomsText.split(',').map((s) => s.trim()).filter(Boolean),
        })
      ).data,
    onError: (err) => setError(extractErrorMessage(err)),
  })

  return (
    <Card>
      <h3 className="mb-1 text-sm font-semibold text-slate-800">AI Symptom Checker</h3>
      <p className="mb-3 text-xs text-slate-500">Enter comma-separated symptoms to get a preliminary, rule-based differential.</p>
      {error && <div className="mb-3"><ErrorBanner message={error} /></div>}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input label="Symptoms" value={symptomsText} onChange={(e) => setSymptomsText(e.target.value)} placeholder="e.g. fever, cough, sore throat" />
        </div>
        <Button onClick={() => { setError(null); mutation.mutate() }} disabled={mutation.isPending}>
          {mutation.isPending ? 'Analyzing…' : 'Analyze'}
        </Button>
      </div>

      {mutation.data && (
        <div className="mt-4">
          {mutation.data.is_emergency && <Badge tone="red">Possible emergency — seek immediate care</Badge>}
          <div className="mt-2 space-y-2">
            {mutation.data.results.map((r: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-slate-800">{r.condition}</div>
                  <div className="text-xs text-slate-500">Matched: {r.matched_symptoms.join(', ')}</div>
                </div>
                <Badge tone={r.confidence > 40 ? 'red' : r.confidence > 20 ? 'amber' : 'slate'}>{r.confidence}%</Badge>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">{mutation.data.advice}</p>
        </div>
      )}
    </Card>
  )
}

function DrugInteractions() {
  const [medsText, setMedsText] = useState('Aspirin, Warfarin')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post('/ai/drug-interactions', {
          medicine_names: medsText.split(',').map((s) => s.trim()).filter(Boolean),
        })
      ).data,
    onError: (err) => setError(extractErrorMessage(err)),
  })

  return (
    <Card>
      <h3 className="mb-1 text-sm font-semibold text-slate-800">Drug Interaction Checker</h3>
      <p className="mb-3 text-xs text-slate-500">Enter two or more medicine names to check for known interactions.</p>
      {error && <div className="mb-3"><ErrorBanner message={error} /></div>}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input label="Medicines (comma-separated)" value={medsText} onChange={(e) => setMedsText(e.target.value)} />
        </div>
        <Button onClick={() => { setError(null); mutation.mutate() }} disabled={mutation.isPending}>
          {mutation.isPending ? 'Checking…' : 'Check'}
        </Button>
      </div>

      {mutation.data && (
        <div className="mt-4 space-y-2">
          {mutation.data.alerts.length === 0 ? (
            <p className="text-sm text-slate-500">No known interactions found.</p>
          ) : (
            mutation.data.alerts.map((a: any, i: number) => (
              <div key={i} className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-red-800">
                    {a.drug_a} + {a.drug_b}
                  </span>
                  <Badge tone="red">{a.severity}</Badge>
                </div>
                <p className="mt-1 text-sm text-red-700">{a.description}</p>
                <p className="mt-1 text-xs text-red-600">{a.recommendation}</p>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  )
}

function HealthRiskScore() {
  const [patientId, setPatientId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const patientOptions = useReferenceOptions({ endpoint: '/patients', label: (p: any) => `${fullName(p)} (${p.patient_id})` })

  const scoreMutation = useMutation({
    mutationFn: async () => (await apiClient.get(`/ai/patients/${patientId}/health-risk-score`)).data,
    onError: (err) => setError(extractErrorMessage(err)),
  })

  const [vitals, setVitals] = useState({ height_cm: '', weight_kg: '', blood_pressure: '', smoker: false })
  const riskMutation = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post(`/ai/patients/${patientId}/disease-risk`, {
          height_cm: vitals.height_cm ? Number(vitals.height_cm) : undefined,
          weight_kg: vitals.weight_kg ? Number(vitals.weight_kg) : undefined,
          blood_pressure: vitals.blood_pressure || undefined,
          smoker: vitals.smoker,
        })
      ).data,
    onError: (err) => setError(extractErrorMessage(err)),
  })

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Health Risk Score</h3>
        {error && <div className="mb-3"><ErrorBanner message={error} /></div>}
        <Select label="Patient" required options={patientOptions} value={patientId} onChange={(e) => setPatientId(e.target.value)} />
        <Button className="mt-3" onClick={() => { setError(null); scoreMutation.mutate() }} disabled={!patientId || scoreMutation.isPending}>
          {scoreMutation.isPending ? 'Scoring…' : 'Compute Health Risk Score'}
        </Button>
        {scoreMutation.data && (
          <div className="mt-4 rounded-md border border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">{scoreMutation.data.score}</span>
              <Badge tone={scoreMutation.data.category === 'high' ? 'red' : scoreMutation.data.category === 'moderate' ? 'amber' : 'green'}>
                {scoreMutation.data.category}
              </Badge>
            </div>
            {scoreMutation.data.factors?.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
                {scoreMutation.data.factors.map((f: string, i: number) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Disease Risk Prediction</h3>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Height (cm)" type="number" value={vitals.height_cm} onChange={(e) => setVitals({ ...vitals, height_cm: e.target.value })} />
          <Input label="Weight (kg)" type="number" value={vitals.weight_kg} onChange={(e) => setVitals({ ...vitals, weight_kg: e.target.value })} />
          <Input label="Blood Pressure" placeholder="e.g. 140/90" value={vitals.blood_pressure} onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })} />
          <label className="flex items-center gap-2 pt-5 text-sm text-slate-700">
            <input type="checkbox" checked={vitals.smoker} onChange={(e) => setVitals({ ...vitals, smoker: e.target.checked })} />
            Smoker
          </label>
        </div>
        <Button className="mt-3" onClick={() => { setError(null); riskMutation.mutate() }} disabled={!patientId || riskMutation.isPending}>
          {riskMutation.isPending ? 'Predicting…' : 'Predict Disease Risk'}
        </Button>
        {riskMutation.data && (
          <div className="mt-4 space-y-2">
            {Object.entries(riskMutation.data).map(([disease, info]: [string, any]) => (
              <div key={disease} className="rounded-md border border-slate-200 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-800 capitalize">{disease.replace(/_/g, ' ')}</span>
                  <Badge tone={info.level === 'high' ? 'red' : info.level === 'moderate' ? 'amber' : 'green'}>
                    {info.score}% · {info.level}
                  </Badge>
                </div>
                {info.factors?.length > 0 && <p className="mt-1 text-xs text-slate-500">{info.factors.join(', ')}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function Icd10Coding() {
  const [text, setText] = useState('acute bronchitis with fever')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () => (await apiClient.post('/ai/icd10-coding', { diagnosis_text: text })).data,
    onError: (err) => setError(extractErrorMessage(err)),
  })

  return (
    <Card>
      <h3 className="mb-1 text-sm font-semibold text-slate-800">AI Medical Coding (ICD-10)</h3>
      {error && <div className="mb-3"><ErrorBanner message={error} /></div>}
      <Textarea label="Diagnosis Text" value={text} onChange={(e) => setText(e.target.value)} />
      <Button className="mt-3" onClick={() => { setError(null); mutation.mutate() }} disabled={mutation.isPending}>
        {mutation.isPending ? 'Coding…' : 'Suggest ICD-10 Codes'}
      </Button>
      {mutation.data && (
        <div className="mt-4 space-y-1.5">
          {mutation.data.codes.length === 0 ? (
            <p className="text-sm text-slate-500">No matching codes found.</p>
          ) : (
            mutation.data.codes.map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
                <Badge tone="blue">{c.code}</Badge>
                <span className="text-slate-700">{c.description}</span>
                <span className="ml-auto text-xs text-slate-400">matched "{c.keyword}"</span>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  )
}

function PrescriptionSuggestions() {
  const [text, setText] = useState('hypertension')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () => (await apiClient.post('/ai/prescription-suggestions', { diagnosis_text: text })).data,
    onError: (err) => setError(extractErrorMessage(err)),
  })

  return (
    <Card>
      <h3 className="mb-1 text-sm font-semibold text-slate-800">AI Prescription Suggestions</h3>
      <p className="mb-3 text-xs text-slate-500">Suggests medicine classes for a diagnosis — always subject to clinician review.</p>
      {error && <div className="mb-3"><ErrorBanner message={error} /></div>}
      <Textarea label="Diagnosis Text" value={text} onChange={(e) => setText(e.target.value)} />
      <Button className="mt-3" onClick={() => { setError(null); mutation.mutate() }} disabled={mutation.isPending}>
        {mutation.isPending ? 'Thinking…' : 'Suggest Medicine Classes'}
      </Button>
      {mutation.data && (
        <div className="mt-4 flex flex-wrap gap-2">
          {mutation.data.suggestions.length === 0 ? (
            <p className="text-sm text-slate-500">No suggestions available for this diagnosis.</p>
          ) : (
            mutation.data.suggestions.map((s: string, i: number) => (
              <Badge key={i} tone="purple">{s}</Badge>
            ))
          )}
        </div>
      )}
    </Card>
  )
}
