<?php

namespace App\Models\Clinical;

use App\Models\Appointment\Appointment;
use App\Models\Hospital\Hospital;
use App\Models\Patient\Patient;
use App\Models\Patient\PatientVisit;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OPDRecord extends Model
{
    use HasFactory, BelongsToCompany;

    protected $table = 'opd_records';

    protected $fillable = [
        'company_id', 'hospital_id', 'patient_id', 'doctor_id', 'visit_id',
        'appointment_id', 'opd_id', 'opd_date', 'opd_time', 'chief_complaint',
        'history_presenting', 'past_history', 'personal_history', 'family_history',
        'treatment_history', 'vitals', 'physical_examination', 'provisional_diagnosis',
        'final_diagnosis', 'investigation_advised', 'treatment_advised', 'advice',
        'follow_up_date', 'referral_notes', 'status', 'created_by',
    ];

    protected $casts = [
        'opd_date' => 'date',
        'vitals' => 'array',
        'follow_up_date' => 'date',
    ];

    protected static function booted(): void
    {
        static::creating(function (OPDRecord $record) {
            $record->opd_id ??= 'OPD-'.date('Y').'-'.strtoupper(uniqid());
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

    public function visit(): BelongsTo
    {
        return $this->belongsTo(PatientVisit::class, 'visit_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}
