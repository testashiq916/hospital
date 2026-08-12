<?php

namespace App\Models\Lab;

use App\Models\Hospital\Hospital;
use App\Models\Patient\Patient;
use App\Models\Patient\PatientAdmission;
use App\Models\Patient\PatientVisit;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class LabOrder extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'hospital_id', 'patient_id', 'doctor_id', 'order_id',
        'order_date', 'order_time', 'visit_id', 'admission_id', 'order_type',
        'priority', 'clinical_notes', 'status', 'collected_by', 'collected_at',
        'completed_at', 'notes', 'created_by',
    ];

    protected $casts = [
        'order_date' => 'date',
        'collected_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (LabOrder $order) {
            $order->order_id ??= 'LAB-'.date('Y').'-'.strtoupper(uniqid());
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

    public function admission(): BelongsTo
    {
        return $this->belongsTo(PatientAdmission::class, 'admission_id');
    }

    public function collectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(LabOrderItem::class);
    }

    public function report(): HasOne
    {
        return $this->hasOne(LabReport::class);
    }
}
