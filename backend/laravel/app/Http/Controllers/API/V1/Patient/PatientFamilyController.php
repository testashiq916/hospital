<?php

namespace App\Http\Controllers\API\V1\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient\Patient;
use App\Models\Patient\PatientFamily;
use Illuminate\Http\Request;

class PatientFamilyController extends Controller
{
    public function index(Patient $patient)
    {
        return response()->json($patient->family);
    }

    public function store(Request $request, Patient $patient)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'relationship' => ['required', 'string', 'max:50'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female,other'],
            'contact' => ['nullable', 'string', 'max:20'],
        ]);

        $data['patient_id'] = $patient->id;

        return response()->json(PatientFamily::create($data), 201);
    }

    public function update(Request $request, Patient $patient, PatientFamily $familyMember)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'relationship' => ['sometimes', 'string', 'max:50'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female,other'],
            'contact' => ['nullable', 'string', 'max:20'],
            'is_active' => ['boolean'],
        ]);

        $familyMember->update($data);

        return response()->json($familyMember->fresh());
    }

    public function destroy(Patient $patient, PatientFamily $familyMember)
    {
        $familyMember->delete();

        return response()->json(['message' => 'Family member removed.']);
    }
}
