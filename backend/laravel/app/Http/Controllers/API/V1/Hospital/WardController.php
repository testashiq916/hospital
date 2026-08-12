<?php

namespace App\Http\Controllers\API\V1\Hospital;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Hospital\Ward;
use Illuminate\Http\Request;

class WardController extends CrudController
{
    protected string $model = Ward::class;

    protected array $with = ['hospital', 'department', 'beds'];

    protected function applyFilters($query, Request $request)
    {
        return $query->when($request->hospital_id, fn ($q) => $q->where('hospital_id', $request->hospital_id));
    }

    protected function rules(Request $request, $id = null): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50'],
            'ward_type' => ['nullable', 'in:general,semi_private,private,icu,nicu,picu,isolation'],
            'total_beds' => ['nullable', 'integer', 'min:0'],
            'floor_number' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ];
    }
}
