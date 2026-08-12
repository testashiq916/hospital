<?php

namespace App\Models\Clinical;

use App\Models\Hospital\Bed;
use App\Models\Hospital\Hospital;
use App\Models\Patient\Patient;
use App\Models\Patient\PatientAdmission;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IPDRecord extends Model
{
    use HasFactory, BelongsToCompany;

    protected $table = 'ipd_records';

    protected $fillable = [
        'company_id', 'hospital_id', 'patient_id', 'admission_id', 'bed_id',
        'doctor_id', 'ipd_id', 'ipd_date', 'ipd_time', 'diagnosis', 'treatment_plan',
        'day_number', 'vitals', 'input_output', 'fluids_iv', 'medications',
        'diet_advice', 'nursing_notes', 'doctor_notes', 'is_icu', 'status', 'created_by',
    ];

    protected $casts = [
        'ipd_date' => 'date',
        'vitals' => 'array',
        'input_output' => 'array',
        'is_icu' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (IPDRecord $record) {
            $record->ipd_id ??= 'IPD-'.date('Y').'-'.strtoupper(uniqid());
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

    public function bed(): BelongsTo
    {
        return $this->belongsTo(Bed::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}
