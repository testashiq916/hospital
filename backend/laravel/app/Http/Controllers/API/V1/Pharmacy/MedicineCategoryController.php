<?php

namespace App\Http\Controllers\API\V1\Pharmacy;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Pharmacy\MedicineCategory;
use Illuminate\Http\Request;

class MedicineCategoryController extends CrudController
{
    protected string $model = MedicineCategory::class;

    protected function rules(Request $request, $id = null): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}
