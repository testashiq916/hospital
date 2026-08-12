<?php

namespace App\Http\Controllers\API\V1\Pharmacy;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Pharmacy\Medicine;
use App\Services\Pharmacy\PharmacyDispensingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MedicineController extends CrudController
{
    protected string $model = Medicine::class;

    protected array $with = ['category'];

    protected function applyFilters($query, Request $request)
    {
        return $query->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when($request->category_id, fn ($q) => $q->where('category_id', $request->category_id));
    }

    protected function rules(Request $request, $id = null): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'category_id' => ['nullable', 'exists:medicine_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'generic_name' => ['nullable', 'string', 'max:255'],
            'strength' => ['nullable', 'string', 'max:100'],
            'dosage_form' => ['nullable', 'string', 'max:100'],
            'unit' => ['nullable', 'string', 'max:20'],
            'manufacturer' => ['nullable', 'string', 'max:255'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'gst_rate' => ['nullable', 'numeric', 'min:0'],
            'reorder_level' => ['nullable', 'integer', 'min:0'],
            'current_stock' => ['nullable', 'integer', 'min:0'],
            'expiry_date' => ['nullable', 'date'],
            'is_active' => ['boolean'],
        ];
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules($request));
        $data['created_by'] = Auth::id();

        return response()->json(Medicine::create($data)->load($this->with), 201);
    }

    public function lowStock(PharmacyDispensingService $service, Request $request)
    {
        return response()->json($service->lowStockMedicines(Auth::user()->company_id, $request->hospital_id));
    }

    public function expiringSoon(PharmacyDispensingService $service, Request $request)
    {
        return response()->json($service->expiringSoon((int) $request->input('days', 30)));
    }
}
