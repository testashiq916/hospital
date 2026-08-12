<?php

namespace App\Http\Controllers\API\V1\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient\PatientAdmission;
use App\Services\Patient\AdmissionService;
use Illuminate\Http\Request;

class PatientAdmissionController extends Controller
{
    public function __construct(protected AdmissionService $admissions) {}

    public function index(Request $request)
    {
        $query = PatientAdmission::query()->with(['patient', 'doctor', 'bed', 'ward']);

        $query->when($request->patient_id, fn ($q) => $q->where('patient_id', $request->patient_id))
            ->when($request->status, fn ($q) => $q->where('status', $request->status));

        return response()->json($query->orderByDesc('id')->paginate((int) $request->input('per_page', 20)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:users,id'],
            'attending_doctor_id' => ['nullable', 'exists:users,id'],
            'admission_type' => ['nullable', 'in:elective,emergency,transfer'],
            'bed_id' => ['nullable', 'exists:beds,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'diagnosis' => ['nullable', 'string'],
            'treatment_plan' => ['nullable', 'string'],
        ]);

        $admission = $this->admissions->admit($data);

        return response()->json($admission->load(['patient', 'doctor', 'bed', 'ward']), 201);
    }

    public function show(PatientAdmission $admission)
    {
        return response()->json($admission->load(['patient', 'doctor', 'attendingDoctor', 'bed', 'ward', 'department']));
    }

    public function discharge(Request $request, PatientAdmission $admission)
    {
        $data = $request->validate([
            'discharge_summary' => ['nullable', 'string'],
            'discharge_instructions' => ['nullable', 'string'],
        ]);

        return response()->json($this->admissions->discharge($admission, $data));
    }

    public function transfer(Request $request, PatientAdmission $admission)
    {
        $data = $request->validate([
            'bed_id' => ['required', 'exists:beds,id'],
        ]);

        return response()->json($this->admissions->transferBed($admission, $data['bed_id']));
    }
}
