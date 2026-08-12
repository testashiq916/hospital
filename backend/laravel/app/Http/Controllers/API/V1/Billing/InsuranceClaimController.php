<?php

namespace App\Http\Controllers\API\V1\Billing;

use App\Http\Controllers\Controller;
use App\Models\Billing\InsuranceClaim;
use App\Services\Billing\BillingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InsuranceClaimController extends Controller
{
    public function __construct(protected BillingService $billing) {}

    public function index(Request $request)
    {
        $query = InsuranceClaim::query()->with(['patient', 'bill']);

        $query->when($request->patient_id, fn ($q) => $q->where('patient_id', $request->patient_id))
            ->when($request->claim_status, fn ($q) => $q->where('claim_status', $request->claim_status));

        return response()->json($query->orderByDesc('id')->paginate((int) $request->input('per_page', 20)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'patient_id' => ['required', 'exists:patients,id'],
            'admission_id' => ['nullable', 'exists:patient_admissions,id'],
            'bill_id' => ['nullable', 'exists:hospital_bills,id'],
            'insurance_provider' => ['required', 'string', 'max:255'],
            'policy_number' => ['nullable', 'string', 'max:50'],
            'tpa_name' => ['nullable', 'string', 'max:255'],
            'claim_amount' => ['required', 'numeric', 'min:0'],
        ]);

        $data['claim_date'] = now()->toDateString();
        $data['claim_status'] = 'draft';
        $data['created_by'] = Auth::id();

        return response()->json(InsuranceClaim::create($data), 201);
    }

    public function show(InsuranceClaim $insuranceClaim)
    {
        return response()->json($insuranceClaim->load(['patient', 'bill']));
    }

    public function approve(Request $request, InsuranceClaim $insuranceClaim)
    {
        $data = $request->validate([
            'approved_amount' => ['required', 'numeric', 'min:0'],
        ]);

        $patientPayable = max(0, (float) $insuranceClaim->claim_amount - (float) $data['approved_amount']);

        $insuranceClaim->update([
            'approved_amount' => $data['approved_amount'],
            'rejected_amount' => max(0, (float) $insuranceClaim->claim_amount - (float) $data['approved_amount']),
            'claim_status' => 'approved',
            'approval_date' => now()->toDateString(),
        ]);

        $this->billing->postInsuranceClaimVoucher($insuranceClaim, (float) $data['approved_amount'], $patientPayable);

        return response()->json($insuranceClaim->fresh());
    }

    public function settle(InsuranceClaim $insuranceClaim)
    {
        $insuranceClaim->update([
            'claim_status' => 'settled',
            'settlement_date' => now()->toDateString(),
        ]);

        return response()->json($insuranceClaim->fresh());
    }

    public function reject(Request $request, InsuranceClaim $insuranceClaim)
    {
        $data = $request->validate(['rejection_reason' => ['required', 'string']]);

        $insuranceClaim->update([
            'claim_status' => 'rejected',
            'rejection_reason' => $data['rejection_reason'],
            'rejected_amount' => $insuranceClaim->claim_amount,
        ]);

        return response()->json($insuranceClaim->fresh());
    }
}
