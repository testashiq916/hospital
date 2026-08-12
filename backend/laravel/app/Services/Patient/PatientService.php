<?php

namespace App\Services\Patient;

use App\Events\Patient\PatientRegistered;
use App\Models\Patient\Patient;
use App\Models\Patient\PatientTimeline;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PatientService
{
    public function register(array $data): Patient
    {
        return DB::transaction(function () use ($data) {
            $user = Auth::user();

            $data['company_id'] = $data['company_id'] ?? $user?->company_id;
            $data['registration_date'] = $data['registration_date'] ?? now()->toDateString();
            $data['registration_type'] = $data['registration_type'] ?? 'opd';
            $data['created_by'] = $user?->id;

            if (! empty($data['date_of_birth'])) {
                $data['age'] = \Carbon\Carbon::parse($data['date_of_birth'])->age;
            }

            $patient = Patient::create($data);

            $this->logTimeline($patient, 'other', 'Patient Registered', "Registered via {$patient->registration_type} desk.");

            PatientRegistered::dispatch($patient);

            return $patient;
        });
    }

    public function logTimeline(Patient $patient, string $type, string $title, ?string $description = null, ?string $referenceType = null, ?int $referenceId = null): PatientTimeline
    {
        return PatientTimeline::create([
            'company_id' => $patient->company_id,
            'hospital_id' => $patient->hospital_id,
            'patient_id' => $patient->id,
            'event_date' => now()->toDateString(),
            'event_time' => now()->toTimeString(),
            'event_type' => $type,
            'event_title' => $title,
            'event_description' => $description,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'created_by' => Auth::id(),
        ]);
    }
}
