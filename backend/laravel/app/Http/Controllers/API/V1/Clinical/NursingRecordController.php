<?php

namespace App\Http\Controllers\API\V1\Clinical;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Clinical\NursingRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NursingRecordController extends CrudController
{
    protected string $model = NursingRecord::class;

    protected array $with = ['patient', 'nurse'];

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
            'nurse_id' => ['required', 'exists:users,id'],
            'record_date' => ['nullable', 'date'],
            'record_time' => ['nullable', 'date_format:H:i,H:i:s'],
            'shift' => ['nullable', 'in:morning,evening,night'],
            'vitals' => ['nullable', 'array'],
            'input_output' => ['nullable', 'array'],
            'medications_given' => ['nullable', 'string'],
            'observations' => ['nullable', 'string'],
        ];
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules($request));
        $data['record_date'] = $data['record_date'] ?? now()->toDateString();
        $data['record_time'] = $data['record_time'] ?? now()->toTimeString();

        return response()->json(NursingRecord::create($data)->load($this->with), 201);
    }
}
