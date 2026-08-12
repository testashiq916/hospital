<?php

namespace App\Http\Controllers\API\V1\Clinical;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Clinical\ICURecord;
use Illuminate\Http\Request;

class ICURecordController extends CrudController
{
    protected string $model = ICURecord::class;

    protected array $with = ['patient', 'doctor'];

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
            'doctor_id' => ['required', 'exists:users,id'],
            'vitals' => ['nullable', 'array'],
            'consciousness_level' => ['nullable', 'string', 'max:50'],
            'oxygen_saturation' => ['nullable', 'numeric'],
            'ventilator_mode' => ['nullable', 'string', 'max:50'],
            'doctor_notes' => ['nullable', 'string'],
            'status' => ['nullable', 'in:active,stable,critical,transferred,discharged'],
        ];
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules($request));
        $data['icu_date'] = now()->toDateString();
        $data['icu_time'] = now()->toTimeString();

        return response()->json(ICURecord::create($data)->load($this->with), 201);
    }
}
