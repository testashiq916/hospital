<?php

namespace App\Services\Patient;

use App\Events\Patient\PatientAdmitted;
use App\Events\Patient\PatientDischarged;
use App\Models\Hospital\Bed;
use App\Models\Hospital\Ward;
use App\Models\Patient\PatientAdmission;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdmissionService
{
    public function __construct(protected PatientService $patients) {}

    public function admit(array $data): PatientAdmission
    {
        return DB::transaction(function () use ($data) {
            $bed = null;

            if (! empty($data['bed_id'])) {
                $bed = Bed::lockForUpdate()->findOrFail($data['bed_id']);

                if ($bed->status !== 'available') {
                    throw ValidationException::withMessages(['bed_id' => 'Selected bed is not available.']);
                }

                $data['ward_id'] = $bed->ward_id;
            }

            $data['company_id'] = $data['company_id'] ?? Auth::user()?->company_id;
            $data['admission_date'] = $data['admission_date'] ?? now()->toDateString();
            $data['admission_time'] = $data['admission_time'] ?? now()->toTimeString();
            $data['created_by'] = Auth::id();

            $admission = PatientAdmission::create($data);

            if ($bed) {
                $bed->update(['status' => 'occupied']);
                $this->syncWardCounters($bed->ward_id);
            }

            $patient = $admission->patient;
            if ($patient) {
                $this->patients->logTimeline($patient, 'admission', 'Patient Admitted', "Admission #{$admission->admission_id}", PatientAdmission::class, $admission->id);
            }

            PatientAdmitted::dispatch($admission);

            return $admission;
        });
    }

    public function discharge(PatientAdmission $admission, array $data): PatientAdmission
    {
        return DB::transaction(function () use ($admission, $data) {
            $admission->update([
                'status' => 'discharged',
                'discharge_date' => $data['discharge_date'] ?? now()->toDateString(),
                'discharge_time' => $data['discharge_time'] ?? now()->toTimeString(),
                'discharge_summary' => $data['discharge_summary'] ?? null,
                'discharge_instructions' => $data['discharge_instructions'] ?? null,
                'length_of_stay' => now()->parse($admission->admission_date)->diffInDays(now()) + 1,
            ]);

            if ($admission->bed_id) {
                $bed = Bed::find($admission->bed_id);
                if ($bed) {
                    $bed->update(['status' => 'cleaning']);
                    $this->syncWardCounters($bed->ward_id);
                }
            }

            $patient = $admission->patient;
            if ($patient) {
                $this->patients->logTimeline($patient, 'discharge', 'Patient Discharged', "Admission #{$admission->admission_id} discharged.", PatientAdmission::class, $admission->id);
            }

            PatientDischarged::dispatch($admission);

            return $admission->fresh();
        });
    }

    public function transferBed(PatientAdmission $admission, int $newBedId): PatientAdmission
    {
        return DB::transaction(function () use ($admission, $newBedId) {
            $newBed = Bed::lockForUpdate()->findOrFail($newBedId);

            if ($newBed->status !== 'available') {
                throw ValidationException::withMessages(['bed_id' => 'Selected bed is not available.']);
            }

            $oldBedId = $admission->bed_id;

            if ($oldBedId) {
                $oldBed = Bed::find($oldBedId);
                $oldBed?->update(['status' => 'cleaning']);
                if ($oldBed) {
                    $this->syncWardCounters($oldBed->ward_id);
                }
            }

            $newBed->update(['status' => 'occupied']);
            $admission->update(['bed_id' => $newBed->id, 'ward_id' => $newBed->ward_id]);
            $this->syncWardCounters($newBed->ward_id);

            return $admission->fresh();
        });
    }

    protected function syncWardCounters(int $wardId): void
    {
        $ward = Ward::find($wardId);

        if (! $ward) {
            return;
        }

        $ward->occupied_beds = $ward->beds()->where('status', 'occupied')->count();
        $ward->available_beds = $ward->beds()->where('status', 'available')->count();
        $ward->total_beds = $ward->beds()->count();
        $ward->save();
    }
}
