<?php

namespace App\Http\Controllers\API\V1\AI;

use App\Http\Controllers\Controller;
use App\Models\AI\AIAnalysis;
use App\Models\AI\AIChatHistory;
use App\Models\AI\AIPrediction;
use App\Models\Lab\LabOrder;
use App\Models\Patient\Patient;
use App\Services\AI\DiseaseRiskPredictionService;
use App\Services\AI\DrugInteractionService;
use App\Services\AI\HealthRiskScoringService;
use App\Services\AI\ICD10CodingService;
use App\Services\AI\LabReportAnalysisService;
use App\Services\AI\SymptomCheckerService;
use App\Services\Appointment\AppointmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AIController extends Controller
{
    public function __construct(
        protected SymptomCheckerService $symptomChecker,
        protected ICD10CodingService $icd10,
        protected DiseaseRiskPredictionService $diseaseRisk,
        protected DrugInteractionService $drugInteractions,
        protected HealthRiskScoringService $healthRisk,
        protected LabReportAnalysisService $labAnalysis,
        protected AppointmentService $appointments,
    ) {}

    public function symptomChecker(Request $request)
    {
        $data = $request->validate([
            'patient_id' => ['nullable', 'exists:patients,id'],
            'symptoms' => ['required', 'array', 'min:1'],
            'symptoms.*' => ['string'],
        ]);

        $output = $this->symptomChecker->analyze($data['symptoms']);

        $this->recordChat($data['patient_id'] ?? null, 'symptom_checker', $data, $output);

        return response()->json($output);
    }

    public function icd10Coding(Request $request)
    {
        $data = $request->validate([
            'patient_id' => ['nullable', 'exists:patients,id'],
            'diagnosis_text' => ['required', 'string'],
        ]);

        $output = ['codes' => $this->icd10->suggestCodes($data['diagnosis_text'])];

        $this->recordAnalysis($data['patient_id'] ?? null, 'icd10_coding', $data, $output);

        return response()->json($output);
    }

    public function prescriptionSuggestions(Request $request)
    {
        $data = $request->validate([
            'patient_id' => ['nullable', 'exists:patients,id'],
            'diagnosis_text' => ['required', 'string'],
        ]);

        $output = ['suggestions' => $this->icd10->suggestMedicineClasses($data['diagnosis_text'])];

        $this->recordAnalysis($data['patient_id'] ?? null, 'prescription_suggestions', $data, $output);

        return response()->json($output);
    }

    public function diseaseRiskPrediction(Request $request, Patient $patient)
    {
        $vitals = $request->validate([
            'height_cm' => ['nullable', 'numeric'],
            'weight_kg' => ['nullable', 'numeric'],
            'blood_pressure' => ['nullable', 'string'],
            'smoker' => ['boolean'],
        ]);

        $output = $this->diseaseRisk->predict($patient, $vitals);

        $overall = collect($output)->max('score');

        AIPrediction::create([
            'company_id' => $patient->company_id,
            'hospital_id' => $patient->hospital_id,
            'patient_id' => $patient->id,
            'type' => 'disease_risk_prediction',
            'module' => 'clinical',
            'input' => $vitals,
            'output' => $output,
            'risk_score' => $overall,
            'created_by' => Auth::id(),
        ]);

        return response()->json($output);
    }

    public function healthRiskScore(Patient $patient)
    {
        $output = $this->healthRisk->score($patient);

        AIPrediction::create([
            'company_id' => $patient->company_id,
            'hospital_id' => $patient->hospital_id,
            'patient_id' => $patient->id,
            'type' => 'health_risk_scoring',
            'module' => 'clinical',
            'input' => [],
            'output' => $output,
            'risk_score' => $output['score'],
            'created_by' => Auth::id(),
        ]);

        return response()->json($output);
    }

    public function drugInteractions(Request $request)
    {
        $data = $request->validate([
            'patient_id' => ['nullable', 'exists:patients,id'],
            'medicine_names' => ['required', 'array', 'min:2'],
            'medicine_names.*' => ['string'],
        ]);

        $alerts = $this->drugInteractions->checkForNames($data['medicine_names']);

        $this->recordAnalysis($data['patient_id'] ?? null, 'drug_interaction', $data, ['alerts' => $alerts]);

        return response()->json(['alerts' => $alerts]);
    }

    public function labReportAnalysis(LabOrder $labOrder)
    {
        $output = $this->labAnalysis->analyze($labOrder);

        AIAnalysis::create([
            'company_id' => $labOrder->company_id,
            'hospital_id' => $labOrder->hospital_id,
            'patient_id' => $labOrder->patient_id,
            'type' => 'lab_report_analysis',
            'module' => 'lab',
            'input' => ['lab_order_id' => $labOrder->id],
            'output' => $output,
            'risk_score' => $output['risk_score'],
            'created_by' => Auth::id(),
        ]);

        return response()->json($output);
    }

    public function appointmentOptimization(Request $request, int $doctorId)
    {
        return response()->json($this->appointments->suggestOptimalSlot($doctorId, (int) $request->input('days_ahead', 7)));
    }

    public function chatHistory(Request $request)
    {
        $query = AIChatHistory::query();

        $query->when($request->patient_id, fn ($q) => $q->where('patient_id', $request->patient_id));

        return response()->json($query->orderByDesc('id')->paginate(20));
    }

    protected function recordAnalysis(?int $patientId, string $type, array $input, array $output): AIAnalysis
    {
        $user = Auth::user();

        return AIAnalysis::create([
            'company_id' => $user?->company_id,
            'hospital_id' => $user?->hospital_id,
            'patient_id' => $patientId,
            'type' => $type,
            'module' => 'ai',
            'input' => $input,
            'output' => $output,
            'created_by' => $user?->id,
        ]);
    }

    protected function recordChat(?int $patientId, string $type, array $input, array $output): AIChatHistory
    {
        $user = Auth::user();

        return AIChatHistory::create([
            'company_id' => $user?->company_id,
            'hospital_id' => $user?->hospital_id,
            'patient_id' => $patientId,
            'user_id' => $user?->id,
            'session_id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => $type,
            'input' => $input,
            'output' => $output,
            'created_by' => $user?->id,
        ]);
    }
}
