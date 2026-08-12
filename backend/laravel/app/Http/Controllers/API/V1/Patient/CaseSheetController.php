<?php

namespace App\Http\Controllers\API\V1\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient\CaseSheet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CaseSheetController extends Controller
{
    public function index(Request $request)
    {
        $query = CaseSheet::query()->with(['patient', 'doctor']);

        $query->when($request->patient_id, fn ($q) => $q->where('patient_id', $request->patient_id))
            ->when($request->admission_id, fn ($q) => $q->where('admission_id', $request->admission_id));

        return response()->json($query->orderByDesc('id')->paginate((int) $request->input('per_page', 20)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'patient_id' => ['required', 'exists:patients,id'],
            'admission_id' => ['nullable', 'exists:patient_admissions,id'],
            'visit_id' => ['nullable', 'exists:patient_visits,id'],
            'doctor_id' => ['required', 'exists:users,id'],
            'note_type' => ['nullable', 'in:admission,progress,discharge,consultation,procedure'],
            'subjective' => ['nullable', 'string'],
            'objective' => ['nullable', 'string'],
            'assessment' => ['nullable', 'string'],
            'plan' => ['nullable', 'string'],
            'vitals' => ['nullable', 'array'],
        ]);

        $data['note_date'] = now()->toDateString();
        $data['note_time'] = now()->toTimeString();
        $data['created_by'] = Auth::id();
        $data['status'] = 'final';

        return response()->json(CaseSheet::create($data)->load(['patient', 'doctor']), 201);
    }

    public function show(CaseSheet $caseSheet)
    {
        return response()->json($caseSheet->load(['patient', 'doctor', 'admission', 'visit']));
    }

    public function update(Request $request, CaseSheet $caseSheet)
    {
        $data = $request->validate([
            'subjective' => ['nullable', 'string'],
            'objective' => ['nullable', 'string'],
            'assessment' => ['nullable', 'string'],
            'plan' => ['nullable', 'string'],
            'status' => ['nullable', 'in:draft,final,amended'],
        ]);

        $caseSheet->update($data);

        return response()->json($caseSheet->fresh());
    }
}
