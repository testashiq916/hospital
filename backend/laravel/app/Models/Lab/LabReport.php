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

class LabReport extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'hospital_id', 'lab_order_id', 'patient_id', 'report_id',
        'report_date', 'report_time', 'report_title', 'clinical_interpretation',
        'recommendation', 'pdf_path', 'is_verified', 'verified_by', 'verified_at',
        'ai_analysis', 'ai_risk_score', 'status', 'created_by',
    ];

    protected $casts = [
        'report_date' => 'date',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'ai_risk_score' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (LabReport $report) {
            $report->report_id ??= 'RPT-'.date('Y').'-'.strtoupper(uniqid());
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

    public function labOrder(): BelongsTo
    {
        return $this->belongsTo(LabOrder::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
