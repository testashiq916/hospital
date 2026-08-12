<?php

namespace App\Http\Controllers\API\V1\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient\PatientVisit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PatientVisitController extends Controller
{
    public function index(Request $request)
    {
        $query = PatientVisit::query()->with(['patient', 'doctor', 'department']);

        $query->when($request->patient_id, fn ($q) => $q->where('patient_id', $request->patient_id))
            ->when($request->doctor_id, fn ($q) => $q->where('doctor_id', $request->doctor_id))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->visit_date, fn ($q) => $q->whereDate('visit_date', $request->visit_date));

        return response()->json($query->orderByDesc('id')->paginate((int) $request->input('per_page', 20)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:users,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'visit_type' => ['nullable', 'in:opd,emergency,follow_up,consultation'],
            'chief_complaint' => ['nullable', 'string'],
            'is_emergency' => ['boolean'],
        ]);

        $data['visit_date'] = now()->toDateString();
        $data['visit_time'] = now()->toTimeString();
        $data['created_by'] = Auth::id();
        $data['token_number'] = PatientVisit::where('doctor_id', $data['doctor_id'])
            ->whereDate('visit_date', now()->toDateString())
            ->max('token_number') + 1;

        $visit = PatientVisit::create($data);

        return response()->json($visit->load(['patient', 'doctor']), 201);
    }

    public function show(PatientVisit $visit)
    {
        return response()->json($visit->load(['patient', 'doctor', 'department']));
    }

    public function update(Request $request, PatientVisit $visit)
    {
        $data = $request->validate([
            'clinical_notes' => ['nullable', 'string'],
            'diagnosis' => ['nullable', 'string'],
            'status' => ['nullable', 'in:waiting,in_progress,completed,cancelled'],
        ]);

        $visit->update($data);

        return response()->json($visit->fresh());
    }
}
