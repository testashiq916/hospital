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

class RadiologyOrder extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'hospital_id', 'patient_id', 'doctor_id', 'order_id',
        'order_date', 'order_time', 'visit_id', 'admission_id', 'radiology_test_id',
        'body_part', 'clinical_indication', 'priority', 'status', 'performed_by',
        'performed_at', 'report_text', 'dicom_images', 'pdf_path', 'ai_analysis', 'created_by',
    ];

    protected $casts = [
        'order_date' => 'date',
        'performed_at' => 'datetime',
        'dicom_images' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (RadiologyOrder $order) {
            $order->order_id ??= 'RAD-'.date('Y').'-'.strtoupper(uniqid());
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

    public function radiologyTest(): BelongsTo
    {
        return $this->belongsTo(RadiologyTest::class);
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
