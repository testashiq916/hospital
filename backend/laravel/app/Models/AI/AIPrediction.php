<?php

namespace App\Models\AI;

use App\Models\Hospital\Hospital;
use App\Models\Patient\Patient;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AIPrediction extends Model
{
    use HasFactory, BelongsToCompany;

    protected $table = 'ai_predictions';

    protected $fillable = [
        'company_id', 'hospital_id', 'patient_id', 'type', 'module', 'input',
        'output', 'risk_score', 'confidence', 'created_by',
    ];

    protected $casts = [
        'input' => 'array',
        'output' => 'array',
        'risk_score' => 'decimal:2',
        'confidence' => 'decimal:2',
    ];

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

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
