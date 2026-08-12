<?php

namespace App\Http\Controllers\API\V1\Pharmacy;

use App\Http\Controllers\Controller;
use App\Models\Pharmacy\PharmacyDispensing;
use App\Models\Pharmacy\Prescription;
use App\Services\Pharmacy\PharmacyDispensingService;
use Illuminate\Http\Request;

class PharmacyDispensingController extends Controller
{
    public function __construct(protected PharmacyDispensingService $dispensing) {}

    public function index(Request $request)
    {
        $query = PharmacyDispensing::query()->with(['patient', 'pharmacist', 'items.medicine']);

        $query->when($request->patient_id, fn ($q) => $q->where('patient_id', $request->patient_id));

        return response()->json($query->orderByDesc('id')->paginate((int) $request->input('per_page', 20)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'prescription_id' => ['required', 'exists:prescriptions,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.medicine_id' => ['required', 'exists:medicines,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['nullable', 'numeric', 'min:0'],
            'items.*.discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $prescription = Prescription::findOrFail($data['prescription_id']);

        $dispensing = $this->dispensing->dispense($prescription, $data['items']);

        return response()->json($dispensing, 201);
    }

    public function show(PharmacyDispensing $pharmacyDispensing)
    {
        return response()->json($pharmacyDispensing->load(['patient', 'pharmacist', 'items.medicine', 'prescription']));
    }
}
