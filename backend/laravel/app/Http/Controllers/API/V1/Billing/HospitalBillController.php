<?php

namespace App\Http\Controllers\API\V1\Billing;

use App\Http\Controllers\Controller;
use App\Http\Requests\API\V1\Billing\StoreBillRequest;
use App\Models\Billing\HospitalBill;
use App\Services\Billing\BillingService;
use Illuminate\Http\Request;

class HospitalBillController extends Controller
{
    public function __construct(protected BillingService $billing) {}

    public function index(Request $request)
    {
        $query = HospitalBill::query()->with(['patient']);

        $query->when($request->patient_id, fn ($q) => $q->where('patient_id', $request->patient_id))
            ->when($request->payment_status, fn ($q) => $q->where('payment_status', $request->payment_status))
            ->when($request->bill_type, fn ($q) => $q->where('bill_type', $request->bill_type));

        return response()->json($query->orderByDesc('id')->paginate((int) $request->input('per_page', 20)));
    }

    public function store(StoreBillRequest $request)
    {
        $data = $request->validated();
        $items = $data['items'];
        unset($data['items']);

        $bill = $this->billing->createBill($data, $items);

        return response()->json($bill, 201);
    }

    public function show(HospitalBill $bill)
    {
        return response()->json($bill->load(['patient', 'items', 'payments', 'voucher.entries']));
    }
}
