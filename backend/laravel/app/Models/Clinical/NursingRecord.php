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

class NursingRecord extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'hospital_id', 'patient_id', 'admission_id', 'nurse_id',
        'record_id', 'record_date', 'record_time', 'shift', 'vitals', 'input_output',
        'medications_given', 'procedures_done', 'observations', 'complications', 'remarks',
    ];

    protected $casts = [
        'record_date' => 'date',
        'vitals' => 'array',
        'input_output' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (NursingRecord $record) {
            $record->record_id ??= 'NUR-'.date('Y').'-'.strtoupper(uniqid());
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

    public function nurse(): BelongsTo
    {
        return $this->belongsTo(User::class, 'nurse_id');
    }
}
