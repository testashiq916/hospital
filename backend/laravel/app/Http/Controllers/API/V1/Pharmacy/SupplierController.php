<?php

namespace App\Http\Controllers\API\V1\Pharmacy;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Pharmacy\Supplier;
use Illuminate\Http\Request;

class SupplierController extends CrudController
{
    protected string $model = Supplier::class;

    protected function rules(Request $request, $id = null): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'name' => ['required', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email'],
            'gstin' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}
