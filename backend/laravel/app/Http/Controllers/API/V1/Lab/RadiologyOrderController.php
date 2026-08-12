<?php

namespace App\Http\Controllers\API\V1\Lab;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Lab\RadiologyOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RadiologyOrderController extends CrudController
{
    protected string $model = RadiologyOrder::class;

    protected array $with = ['patient', 'doctor', 'radiologyTest'];

    protected function applyFilters($query, Request $request)
    {
        return $query->when($request->patient_id, fn ($q) => $q->where('patient_id', $request->patient_id))
            ->when($request->status, fn ($q) => $q->where('status', $request->status));
    }

    protected function rules(Request $request, $id = null): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:users,id'],
            'radiology_test_id' => ['required', 'exists:radiology_tests,id'],
            'body_part' => ['nullable', 'string', 'max:255'],
            'clinical_indication' => ['nullable', 'string'],
            'priority' => ['nullable', 'in:routine,urgent,stat'],
        ];
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules($request));
        $data['order_date'] = now()->toDateString();
        $data['order_time'] = now()->toTimeString();
        $data['created_by'] = Auth::id();

        return response()->json(RadiologyOrder::create($data)->load($this->with), 201);
    }

    public function report(Request $request, RadiologyOrder $radiologyOrder)
    {
        $data = $request->validate([
            'report_text' => ['required', 'string'],
            'dicom_images' => ['nullable', 'array'],
        ]);

        $data['status'] = 'reported';
        $data['performed_by'] = Auth::id();
        $data['performed_at'] = now();

        $radiologyOrder->update($data);

        return response()->json($radiologyOrder->fresh());
    }
}
