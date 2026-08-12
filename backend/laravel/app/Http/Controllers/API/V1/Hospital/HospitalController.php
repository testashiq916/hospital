<?php

namespace App\Http\Controllers\API\V1\Hospital;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Hospital\Hospital;
use Illuminate\Http\Request;

class HospitalController extends CrudController
{
    protected string $model = Hospital::class;

    protected array $with = ['departments', 'wards'];

    protected function rules(Request $request, $id = null): array
    {
        return [
            'company_id' => ['sometimes', 'exists:companies,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'zip_code' => ['nullable', 'string', 'max:20'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email'],
            'ambulance_phone' => ['nullable', 'string', 'max:20'],
            'emergency_phone' => ['nullable', 'string', 'max:20'],
            'administrator' => ['nullable', 'string', 'max:255'],
            'hospital_type' => ['nullable', 'in:general,speciality,super_speciality'],
            'facility_types' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'is_head_office' => ['boolean'],
        ];
    }
}
