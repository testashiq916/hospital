<?php

namespace App\Http\Controllers\API\V1\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient\Patient;
use App\Models\Patient\PatientDocument;
use Illuminate\Http\Request;

class PatientDocumentController extends Controller
{
    public function index(Patient $patient)
    {
        return response()->json($patient->documents);
    }

    public function store(Request $request, Patient $patient)
    {
        $data = $request->validate([
            'document_type' => ['required', 'string', 'max:50'],
            'document_name' => ['required', 'string', 'max:255'],
            'document_path' => ['required', 'string', 'max:255'],
            'document_number' => ['nullable', 'string', 'max:100'],
            'issue_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date'],
        ]);

        $data['patient_id'] = $patient->id;

        return response()->json(PatientDocument::create($data), 201);
    }

    public function verify(Patient $patient, PatientDocument $document)
    {
        $document->update([
            'is_verified' => true,
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        return response()->json($document->fresh());
    }

    public function destroy(Patient $patient, PatientDocument $document)
    {
        $document->delete();

        return response()->json(['message' => 'Document removed.']);
    }
}
