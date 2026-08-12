<?php

namespace App\Models\Patient;

use App\Models\Hospital\Bed;
use App\Models\Hospital\Department;
use App\Models\Hospital\Hospital;
use App\Models\Hospital\Ward;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientAdmission extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'hospital_id', 'patient_id', 'doctor_id', 'admission_id',
        'admission_date', 'admission_time', 'admission_type', 'bed_id', 'ward_id',
        'department_id', 'diagnosis', 'treatment_plan', 'attending_doctor_id',
        'status', 'discharge_date', 'discharge_time', 'discharge_summary',
        'discharge_instructions', 'length_of_stay', 'readmission_reason',
        'is_readmission', 'created_by',
    ];

    protected $casts = [
        'admission_date' => 'date',
        'discharge_date' => 'date',
        'is_readmission' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (PatientAdmission $admission) {
            $admission->admission_id ??= 'ADM-'.date('Y').'-'.strtoupper(uniqid());
        });
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function hospital(): BelongsTo
    {
        return $this->belongsTo(Hospital::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function attendingDoctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'attending_doctor_id');
    }

    public function bed(): BelongsTo
    {
        return $this->belongsTo(Bed::class);
    }

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
