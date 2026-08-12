<?php

namespace App\Models\Patient;

use App\Models\Hospital\Hospital;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientTimeline extends Model
{
    use HasFactory, BelongsToCompany;

    protected $table = 'patient_timeline';

    const UPDATED_AT = null;

    protected $fillable = [
        'company_id', 'hospital_id', 'patient_id', 'event_date', 'event_time',
        'event_type', 'event_title', 'event_description', 'reference_type',
        'reference_id', 'created_by',
    ];

    protected $casts = [
        'event_date' => 'date',
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
