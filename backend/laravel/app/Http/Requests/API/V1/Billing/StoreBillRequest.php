<?php

namespace App\Http\Requests\API\V1\Billing;

use Illuminate\Foundation\Http\FormRequest;

class StoreBillRequest extends FormRequest
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
            'admission_id' => ['nullable', 'exists:patient_admissions,id'],
            'visit_id' => ['nullable', 'exists:patient_visits,id'],
            'bill_type' => ['required', 'in:opd,ipd,emergency,pharmacy,lab,radiology,procedure,discharge'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'service_charge' => ['nullable', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string'],
            'items.*.item_type' => ['required', 'string'],
            'items.*.item_id' => ['nullable', 'integer'],
            'items.*.quantity' => ['nullable', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'items.*.gst_rate' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
