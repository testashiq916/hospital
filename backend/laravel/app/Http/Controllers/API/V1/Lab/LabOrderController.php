<?php

namespace App\Http\Controllers\API\V1\Lab;

use App\Http\Controllers\Controller;
use App\Http\Requests\API\V1\Lab\StoreLabOrderRequest;
use App\Models\Lab\LabOrder;
use App\Models\Lab\LabOrderItem;
use App\Services\Lab\LabWorkflowService;
use Illuminate\Http\Request;

class LabOrderController extends Controller
{
    public function __construct(protected LabWorkflowService $workflow) {}

    public function index(Request $request)
    {
        $query = LabOrder::query()->with(['patient', 'doctor', 'items.labTest']);

        $query->when($request->patient_id, fn ($q) => $q->where('patient_id', $request->patient_id))
            ->when($request->status, fn ($q) => $q->where('status', $request->status));

        return response()->json($query->orderByDesc('id')->paginate((int) $request->input('per_page', 20)));
    }

    public function store(StoreLabOrderRequest $request)
    {
        $data = $request->validated();
        $testIds = $data['test_ids'];
        unset($data['test_ids']);

        $order = $this->workflow->createOrder($data, $testIds);

        return response()->json($order, 201);
    }

    public function show(LabOrder $labOrder)
    {
        return response()->json($labOrder->load(['patient', 'doctor', 'items.labTest.parameters', 'report']));
    }

    public function collect(Request $request, LabOrder $labOrder)
    {
        $data = $request->validate(['specimen_id' => ['nullable', 'string', 'max:50']]);

        return response()->json($this->workflow->collectSample($labOrder, $data['specimen_id'] ?? null));
    }

    public function enterResult(Request $request, LabOrder $labOrder, LabOrderItem $item)
    {
        abort_unless($item->lab_order_id === $labOrder->id, 404);

        $data = $request->validate([
            'result' => ['nullable', 'numeric'],
            'result_text' => ['nullable', 'string'],
            'range_low' => ['nullable', 'numeric'],
            'range_high' => ['nullable', 'numeric'],
            'unit' => ['nullable', 'string', 'max:50'],
            'remarks' => ['nullable', 'string'],
        ]);

        return response()->json($this->workflow->enterResult($item, $data));
    }

    public function verify(Request $request, LabOrder $labOrder)
    {
        $data = $request->validate([
            'report_title' => ['nullable', 'string', 'max:255'],
            'clinical_interpretation' => ['nullable', 'string'],
            'recommendation' => ['nullable', 'string'],
        ]);

        return response()->json($this->workflow->verifyAndReport($labOrder, $data), 201);
    }
}
