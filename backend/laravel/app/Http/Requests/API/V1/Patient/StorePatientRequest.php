<?php

namespace App\Http\Requests\API\V1\Patient;

use Illuminate\Foundation\Http\FormRequest;

class StorePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'patient_type_id' => ['nullable', 'exists:patient_types,id'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'gender' => ['required', 'in:male,female,other'],
            'date_of_birth' => ['required', 'date'],
            'blood_group' => ['nullable', 'string', 'max:10'],
            'marital_status' => ['nullable', 'in:single,married,divorced,widowed'],
            'email' => ['nullable', 'email'],
            'mobile' => ['required', 'string', 'max:20'],
            'alternate_mobile' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'zip_code' => ['nullable', 'string', 'max:20'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_relationship' => ['nullable', 'string', 'max:50'],
            'guardian_contact' => ['nullable', 'string', 'max:20'],
            'allergies' => ['nullable', 'string'],
            'chronic_diseases' => ['nullable', 'string'],
            'medications' => ['nullable', 'string'],
            'insurance_provider' => ['nullable', 'string', 'max:255'],
            'insurance_policy_number' => ['nullable', 'string', 'max:50'],
            'insurance_coverage' => ['nullable', 'numeric'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:20'],
            'emergency_contact_relationship' => ['nullable', 'string', 'max:50'],
            'registration_type' => ['nullable', 'in:opd,ipd,emergency'],
        ];
    }
}
