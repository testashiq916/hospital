<?php

namespace App\Http\Controllers\API\V1\Patient;

use App\Http\Controllers\Controller;
use App\Http\Requests\API\V1\Patient\StorePatientRequest;
use App\Models\Patient\Patient;
use App\Services\Patient\PatientService;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function __construct(protected PatientService $patients) {}

    public function index(Request $request)
    {
        $query = Patient::query()->with(['hospital', 'patientType']);

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('first_name', 'like', "%{$term}%")
                    ->orWhere('last_name', 'like', "%{$term}%")
                    ->orWhere('patient_id', 'like', "%{$term}%")
                    ->orWhere('mobile', 'like', "%{$term}%");
            });
        }

        if ($request->filled('hospital_id')) {
            $query->where('hospital_id', $request->hospital_id);
        }

        if ($request->filled('registration_type')) {
            $query->where('registration_type', $request->registration_type);
        }

        return response()->json($query->orderByDesc('id')->paginate((int) $request->input('per_page', 20)));
    }

    public function store(StorePatientRequest $request)
    {
        $patient = $this->patients->register($request->validated());

        return response()->json($patient->load(['hospital', 'patientType']), 201);
    }

    public function show(Patient $patient)
    {
        return response()->json($patient->load([
            'hospital', 'patientType', 'family', 'documents',
        ]));
    }

    public function update(StorePatientRequest $request, Patient $patient)
    {
        $data = $request->validated();

        if (! empty($data['date_of_birth'])) {
            $data['age'] = \Carbon\Carbon::parse($data['date_of_birth'])->age;
        }

        $patient->update($data);

        return response()->json($patient->fresh(['hospital', 'patientType']));
    }

    public function destroy(Patient $patient)
    {
        $patient->delete();

        return response()->json(['message' => 'Patient deleted successfully.']);
    }

    public function medicalHistory(Patient $patient)
    {
        return response()->json($patient->only([
            'allergies', 'chronic_diseases', 'medications', 'family_history',
            'social_history', 'blood_group', 'blood_pressure',
        ]));
    }

    public function timeline(Patient $patient)
    {
        return response()->json($patient->timeline()->paginate(30));
    }
}
