<?php

namespace App\Http\Controllers\API\V1\Pharmacy;

use App\Http\Controllers\Controller;
use App\Models\Pharmacy\Prescription;
use App\Models\Pharmacy\PrescriptionItem;
use App\Services\AI\DrugInteractionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PrescriptionController extends Controller
{
    public function __construct(protected DrugInteractionService $interactions) {}

    public function index(Request $request)
    {
        $query = Prescription::query()->with(['patient', 'doctor', 'items.medicine']);

        $query->when($request->patient_id, fn ($q) => $q->where('patient_id', $request->patient_id));

        return response()->json($query->orderByDesc('id')->paginate((int) $request->input('per_page', 20)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:users,id'],
            'visit_id' => ['nullable', 'exists:patient_visits,id'],
            'admission_id' => ['nullable', 'exists:patient_admissions,id'],
            'diagnosis' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.medicine_id' => ['required', 'exists:medicines,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.dosage' => ['nullable', 'string'],
            'items.*.frequency' => ['nullable', 'string'],
            'items.*.duration' => ['nullable', 'string'],
            'items.*.instructions' => ['nullable', 'string'],
        ]);

        $prescription = DB::transaction(function () use ($data) {
            $items = $data['items'];
            unset($data['items']);

            $data['prescription_date'] = now()->toDateString();
            $data['prescription_time'] = now()->toTimeString();
            $data['created_by'] = Auth::id();

            $prescription = Prescription::create($data);

            foreach ($items as $item) {
                $item['prescription_id'] = $prescription->id;
                PrescriptionItem::create($item);
            }

            return $prescription->load('items.medicine');
        });

        $medicineIds = $prescription->items->pluck('medicine.name')->filter()->values()->all();
        $alerts = $this->interactions->checkForNames($medicineIds);

        return response()->json([
            'prescription' => $prescription,
            'drug_interaction_alerts' => $alerts,
        ], 201);
    }

    public function show(Prescription $prescription)
    {
        return response()->json($prescription->load(['patient', 'doctor', 'items.medicine', 'dispensings']));
    }
}
