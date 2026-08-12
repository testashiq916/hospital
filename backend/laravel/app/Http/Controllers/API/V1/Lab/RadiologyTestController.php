<?php

namespace App\Http\Controllers\API\V1\Lab;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Lab\RadiologyTest;
use Illuminate\Http\Request;

class RadiologyTestController extends CrudController
{
    protected string $model = RadiologyTest::class;

    protected function rules(Request $request, $id = null): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'test_code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'modality' => ['required', 'in:xray,ct,mri,ultrasound,pet,mammogram,fluoroscopy'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
