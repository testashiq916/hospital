<?php

namespace App\Models\Lab;

use App\Models\Hospital\Hospital;
use App\Models\Patient\Patient;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BloodBank extends Model
{
    use HasFactory, BelongsToCompany;

    protected $table = 'blood_bank';

    protected $fillable = [
        'company_id', 'hospital_id', 'donor_id', 'donor_name', 'blood_group',
        'rh_factor', 'component_type', 'quantity', 'unit', 'collection_date',
        'expiry_date', 'is_screened', 'screening_results', 'status',
        'issued_to_patient_id', 'issued_by', 'issued_at', 'notes', 'created_by',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'collection_date' => 'date',
        'expiry_date' => 'date',
        'is_screened' => 'boolean',
        'issued_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function hospital(): BelongsTo
    {
        return $this->belongsTo(Hospital::class);
    }

    public function issuedToPatient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'issued_to_patient_id');
    }

    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }
}
