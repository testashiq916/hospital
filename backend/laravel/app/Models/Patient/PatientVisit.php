<?php

namespace App\Models\Patient;

use App\Models\Hospital\Department;
use App\Models\Hospital\Hospital;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientVisit extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'hospital_id', 'patient_id', 'doctor_id', 'visit_id',
        'visit_date', 'visit_time', 'visit_type', 'department_id', 'token_number',
        'queue_number', 'chief_complaint', 'present_illness', 'past_medical_history',
        'clinical_notes', 'diagnosis', 'referral_doctor', 'referral_hospital',
        'status', 'is_emergency', 'created_by',
    ];

    protected $casts = [
        'visit_date' => 'date',
        'is_emergency' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (PatientVisit $visit) {
            $visit->visit_id ??= 'VIS-'.date('Y').'-'.strtoupper(uniqid());
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

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
