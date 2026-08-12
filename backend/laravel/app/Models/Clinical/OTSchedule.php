<?php

namespace App\Models\Clinical;

use App\Models\Hospital\Hospital;
use App\Models\Patient\Patient;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OTSchedule extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'hospital_id', 'patient_id', 'doctor_id', 'assistant_doctor_id',
        'anesthetist_id', 'nurse_id', 'ot_id', 'ot_number', 'surgery_date',
        'surgery_time', 'expected_duration', 'surgery_type', 'surgery_reason',
        'pre_operation_notes', 'post_operation_notes', 'anesthesia_type', 'status',
        'is_emergency', 'priority', 'created_by',
    ];

    protected $casts = [
        'surgery_date' => 'date',
        'is_emergency' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (OTSchedule $schedule) {
            $schedule->ot_id ??= 'OT-'.date('Y').'-'.strtoupper(uniqid());
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

    public function assistantDoctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assistant_doctor_id');
    }

    public function anesthetist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'anesthetist_id');
    }

    public function nurse(): BelongsTo
    {
        return $this->belongsTo(User::class, 'nurse_id');
    }
}
