<?php

namespace App\Models\Clinical;

use App\Models\Hospital\Hospital;
use App\Models\Patient\Patient;
use App\Models\Patient\PatientAdmission;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ICURecord extends Model
{
    use HasFactory, BelongsToCompany;

    protected $table = 'icu_records';

    protected $fillable = [
        'company_id', 'hospital_id', 'patient_id', 'admission_id', 'doctor_id',
        'icu_id', 'icu_date', 'icu_time', 'vitals', 'consciousness_level',
        'respirator_settings', 'oxygen_saturation', 'ventilator_mode', 'iv_fluids',
        'medications', 'lab_results', 'doctor_notes', 'emergency_notes', 'status',
    ];

    protected $casts = [
        'icu_date' => 'date',
        'vitals' => 'array',
        'respirator_settings' => 'array',
        'oxygen_saturation' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (ICURecord $record) {
            $record->icu_id ??= 'ICU-'.date('Y').'-'.strtoupper(uniqid());
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

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}
