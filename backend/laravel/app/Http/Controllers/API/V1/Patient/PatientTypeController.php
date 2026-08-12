<?php

namespace App\Http\Controllers\API\V1\Patient;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Patient\PatientType;
use Illuminate\Http\Request;

class PatientTypeController extends CrudController
{
    protected string $model = PatientType::class;

    protected function rules(Request $request, $id = null): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'name' => ['required', 'string', 'max:100'],
            'code' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}
