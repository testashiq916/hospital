<?php

namespace App\Http\Requests\API\V1\Lab;

use Illuminate\Foundation\Http\FormRequest;

class StoreLabOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:users,id'],
            'visit_id' => ['nullable', 'exists:patient_visits,id'],
            'admission_id' => ['nullable', 'exists:patient_admissions,id'],
            'order_type' => ['nullable', 'in:laboratory,radiology,pathology'],
            'priority' => ['nullable', 'in:routine,urgent,stat'],
            'clinical_notes' => ['nullable', 'string'],
            'test_ids' => ['required', 'array', 'min:1'],
            'test_ids.*' => ['exists:lab_tests,id'],
        ];
    }
}
