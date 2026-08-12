<?php

namespace App\Http\Controllers\API\V1\Lab;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Lab\BloodBank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BloodBankController extends CrudController
{
    protected string $model = BloodBank::class;

    protected function applyFilters($query, Request $request)
    {
        return $query->when($request->blood_group, fn ($q) => $q->where('blood_group', $request->blood_group))
            ->when($request->status, fn ($q) => $q->where('status', $request->status));
    }

    protected function rules(Request $request, $id = null): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'donor_name' => ['nullable', 'string', 'max:255'],
            'blood_group' => ['required', 'string', 'max:10'],
            'rh_factor' => ['nullable', 'in:positive,negative'],
            'component_type' => ['nullable', 'in:whole_blood,packed_rbc,platelets,plasma,cryoprecipitate'],
            'quantity' => ['required', 'numeric', 'min:0'],
            'collection_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date'],
        ];
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules($request));
        $data['created_by'] = Auth::id();

        return response()->json(BloodBank::create($data), 201);
    }

    public function issue(Request $request, BloodBank $bloodBank)
    {
        abort_if($bloodBank->status !== 'available', 422, 'Blood unit is not available.');

        $data = $request->validate([
            'issued_to_patient_id' => ['required', 'exists:patients,id'],
        ]);

        $bloodBank->update([
            'status' => 'issued',
            'issued_to_patient_id' => $data['issued_to_patient_id'],
            'issued_by' => Auth::id(),
            'issued_at' => now(),
        ]);

        return response()->json($bloodBank->fresh());
    }
}
