<?php

namespace App\Models\Billing;

use App\Models\Hospital\Hospital;
use App\Models\Patient\Patient;
use App\Models\Patient\PatientAdmission;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InsuranceClaim extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'hospital_id', 'patient_id', 'admission_id', 'bill_id',
        'claim_id', 'claim_date', 'insurance_provider', 'policy_number', 'tpa_name',
        'claim_amount', 'approved_amount', 'rejected_amount', 'claim_status',
        'submission_date', 'approval_date', 'settlement_date', 'rejection_reason',
        'documents', 'notes', 'created_by',
    ];

    protected $casts = [
        'claim_date' => 'date',
        'submission_date' => 'date',
        'approval_date' => 'date',
        'settlement_date' => 'date',
        'claim_amount' => 'decimal:2',
        'approved_amount' => 'decimal:2',
        'rejected_amount' => 'decimal:2',
        'documents' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (InsuranceClaim $claim) {
            $claim->claim_id ??= 'CLM-'.date('Y').'-'.strtoupper(uniqid());
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

    public function admission(): BelongsTo
    {
        return $this->belongsTo(PatientAdmission::class, 'admission_id');
    }

    public function bill(): BelongsTo
    {
        return $this->belongsTo(HospitalBill::class, 'bill_id');
    }
}
