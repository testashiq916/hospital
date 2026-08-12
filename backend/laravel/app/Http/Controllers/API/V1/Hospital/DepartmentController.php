<?php

namespace App\Http\Controllers\API\V1\Hospital;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Hospital\Department;
use Illuminate\Http\Request;

class DepartmentController extends CrudController
{
    protected string $model = Department::class;

    protected array $with = ['hospital', 'headDoctor'];

    protected function applyFilters($query, Request $request)
    {
        return $query->when($request->hospital_id, fn ($q) => $q->where('hospital_id', $request->hospital_id));
    }

    protected function rules(Request $request, $id = null): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'head_doctor_id' => ['nullable', 'exists:users,id'],
            'is_active' => ['boolean'],
        ];
    }
}
