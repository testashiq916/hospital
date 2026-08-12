<?php

namespace App\Http\Controllers\API\V1\Pharmacy;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Pharmacy\Medicine;
use App\Models\Pharmacy\PharmacyInventory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PharmacyInventoryController extends CrudController
{
    protected string $model = PharmacyInventory::class;

    protected array $with = ['medicine', 'supplier'];

    protected function applyFilters($query, Request $request)
    {
        return $query->when($request->medicine_id, fn ($q) => $q->where('medicine_id', $request->medicine_id));
    }

    protected function rules(Request $request, $id = null): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'medicine_id' => ['required', 'exists:medicines,id'],
            'batch_number' => ['nullable', 'string', 'max:50'],
            'quantity' => ['required', 'integer', 'min:0'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
            'purchase_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'rack_location' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:available,low_stock,expired,disposed'],
        ];
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules($request));

        $batch = PharmacyInventory::create($data);

        // Receiving stock into a batch replenishes the medicine's aggregate
        // current_stock counter (Purchase Orders / Stock Management screen).
        Medicine::where('id', $data['medicine_id'])->increment('current_stock', $data['quantity']);

        return response()->json($batch->load($this->with), 201);
    }
}
