<?php

namespace App\Models\Patient;

use App\Models\Appointment\Appointment;
use App\Models\Billing\HospitalBill;
use App\Models\Hospital\Hospital;
use App\Models\Lab\LabOrder;
use App\Models\Pharmacy\Prescription;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'hospital_id', 'patient_id', 'user_id', 'patient_type_id',
        'first_name', 'last_name', 'middle_name', 'gender', 'date_of_birth', 'age',
        'blood_group', 'marital_status', 'email', 'mobile', 'alternate_mobile',
        'address', 'city', 'state', 'country', 'zip_code',
        'guardian_name', 'guardian_relationship', 'guardian_contact', 'spouse_name',
        'father_name', 'mother_name',
        'blood_pressure', 'allergies', 'chronic_diseases', 'medications',
        'family_history', 'social_history',
        'insurance_provider', 'insurance_policy_number', 'insurance_expiry',
        'insurance_coverage', 'tpa_name', 'tpa_id',
        'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
        'is_active', 'is_deceased', 'deceased_date', 'deceased_reason',
        'registration_date', 'registration_type', 'created_by',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'insurance_expiry' => 'date',
        'insurance_coverage' => 'decimal:2',
        'is_active' => 'boolean',
        'is_deceased' => 'boolean',
        'deceased_date' => 'date',
        'registration_date' => 'date',
    ];

    protected static function booted(): void
    {
        static::creating(function (Patient $patient) {
            $patient->patient_id ??= 'PT-'.date('Y').'-'.strtoupper(uniqid());
        });
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function hospital(): BelongsTo
    {
        return $this->belongsTo(Hospital::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function patientType(): BelongsTo
    {
        return $this->belongsTo(PatientType::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function family(): HasMany
    {
        return $this->hasMany(PatientFamily::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(PatientDocument::class);
    }

    public function visits(): HasMany
    {
        return $this->hasMany(PatientVisit::class);
    }

    public function admissions(): HasMany
    {
        return $this->hasMany(PatientAdmission::class);
    }

    public function caseSheets(): HasMany
    {
        return $this->hasMany(CaseSheet::class);
    }

    public function timeline(): HasMany
    {
        return $this->hasMany(PatientTimeline::class)->orderByDesc('event_date');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function bills(): HasMany
    {
        return $this->hasMany(HospitalBill::class);
    }

    public function labOrders(): HasMany
    {
        return $this->hasMany(LabOrder::class);
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }
}
