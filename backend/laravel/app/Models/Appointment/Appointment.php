<?php

namespace App\Models\Appointment;

use App\Models\Hospital\Hospital;
use App\Models\Patient\Patient;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Appointment extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'hospital_id', 'patient_id', 'doctor_id', 'appointment_id',
        'appointment_date', 'appointment_time', 'end_time', 'appointment_type',
        'status', 'token_number', 'queue_number', 'estimated_wait_time', 'reason',
        'notes', 'is_emergency', 'is_teleconsultation', 'teleconsultation_link',
        'cancelled_by', 'cancelled_reason', 'created_by',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'is_emergency' => 'boolean',
        'is_teleconsultation' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Appointment $appointment) {
            $appointment->appointment_id ??= 'APT-'.date('Y').'-'.strtoupper(uniqid());
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

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function queueToken(): HasOne
    {
        return $this->hasOne(QueueToken::class);
    }
}
