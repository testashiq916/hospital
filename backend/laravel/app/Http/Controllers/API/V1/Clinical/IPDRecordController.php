<?php

namespace App\Http\Controllers\API\V1\Clinical;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Clinical\IPDRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IPDRecordController extends CrudController
{
    protected string $model = IPDRecord::class;

    protected array $with = ['patient', 'doctor', 'bed'];

    protected function applyFilters($query, Request $request)
    {
        return $query->when($request->admission_id, fn ($q) => $q->where('admission_id', $request->admission_id));
    }

    protected function rules(Request $request, $id = null): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'patient_id' => ['required', 'exists:patients,id'],
            'admission_id' => ['required', 'exists:patient_admissions,id'],
            'bed_id' => ['required', 'exists:beds,id'],
            'doctor_id' => ['required', 'exists:users,id'],
            'diagnosis' => ['nullable', 'string'],
            'treatment_plan' => ['nullable', 'string'],
            'vitals' => ['nullable', 'array'],
            'input_output' => ['nullable', 'array'],
            'medications' => ['nullable', 'string'],
            'nursing_notes' => ['nullable', 'string'],
            'doctor_notes' => ['nullable', 'string'],
            'is_icu' => ['boolean'],
        ];
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules($request));
        $data['ipd_date'] = now()->toDateString();
        $data['ipd_time'] = now()->toTimeString();
        $data['created_by'] = Auth::id();
        $data['day_number'] = IPDRecord::where('admission_id', $data['admission_id'])->count() + 1;

        $record = IPDRecord::create($data);

        return response()->json($record->load($this->with), 201);
    }
}
