<?php

namespace App\Http\Controllers\API\V1\Billing;

use App\Http\Controllers\Controller;
use App\Models\Billing\HospitalBill;
use App\Models\Billing\HospitalPayment;
use App\Services\Billing\BillingService;
use Illuminate\Http\Request;

class HospitalPaymentController extends Controller
{
    public function __construct(protected BillingService $billing) {}

    public function index(Request $request)
    {
        $query = HospitalPayment::query()->with(['patient', 'bill']);

        $query->when($request->patient_id, fn ($q) => $q->where('patient_id', $request->patient_id))
            ->when($request->bill_id, fn ($q) => $q->where('bill_id', $request->bill_id));

        return response()->json($query->orderByDesc('id')->paginate((int) $request->input('per_page', 20)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'bill_id' => ['required', 'exists:hospital_bills,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'in:cash,card,upi,insurance,tpa,cheque,bank_transfer'],
            'transaction_id' => ['nullable', 'string'],
            'cheque_number' => ['nullable', 'string'],
            'bank_name' => ['nullable', 'string'],
            'upi_id' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $bill = HospitalBill::findOrFail($data['bill_id']);
        unset($data['bill_id']);

        $payment = $this->billing->recordPayment($bill, $data);

        return response()->json($payment, 201);
    }
}
