<?php

namespace App\Http\Controllers\API\V1\Lab;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Lab\LabTest;
use App\Models\Lab\LabTestParameter;
use Illuminate\Http\Request;

class LabTestController extends CrudController
{
    protected string $model = LabTest::class;

    protected array $with = ['parameters'];

    protected function rules(Request $request, $id = null): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'test_code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'turnaround_time' => ['nullable', 'integer', 'min:1'],
            'specimen_type' => ['nullable', 'string', 'max:100'],
            'units' => ['nullable', 'string', 'max:50'],
            'normal_range' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }

    public function addParameter(Request $request, LabTest $labTest)
    {
        $data = $request->validate([
            'parameter_name' => ['required', 'string', 'max:255'],
            'normal_range_low' => ['nullable', 'numeric'],
            'normal_range_high' => ['nullable', 'numeric'],
            'unit' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
        ]);

        $data['lab_test_id'] = $labTest->id;

        return response()->json(LabTestParameter::create($data), 201);
    }
}
