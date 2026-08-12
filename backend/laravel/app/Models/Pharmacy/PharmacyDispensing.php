<?php

namespace App\Models\Pharmacy;

use App\Models\Hospital\Hospital;
use App\Models\Patient\Patient;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PharmacyDispensing extends Model
{
    use HasFactory, BelongsToCompany;

    protected $table = 'pharmacy_dispensing';

    protected $fillable = [
        'company_id', 'hospital_id', 'patient_id', 'prescription_id', 'dispensing_id',
        'dispensing_date', 'dispensing_time', 'pharmacist_id', 'notes',
    ];

    protected $casts = [
        'dispensing_date' => 'date',
    ];

    protected static function booted(): void
    {
        static::creating(function (PharmacyDispensing $dispensing) {
            $dispensing->dispensing_id ??= 'DSP-'.date('Y').'-'.strtoupper(uniqid());
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

    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }

    public function pharmacist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pharmacist_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PharmacyDispensingItem::class, 'dispensing_id');
    }
}
