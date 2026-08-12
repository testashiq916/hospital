<?php

namespace App\Models\Hospital;

use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Hospital extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'hospital_id', 'name', 'code', 'address', 'city', 'state',
        'country', 'zip_code', 'phone', 'email', 'ambulance_phone', 'emergency_phone',
        'administrator', 'latitude', 'longitude', 'hospital_type', 'facility_types',
        'total_beds', 'available_beds', 'total_doctors', 'total_nurses',
        'is_active', 'is_head_office',
    ];

    protected $casts = [
        'facility_types' => 'array',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'is_active' => 'boolean',
        'is_head_office' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Hospital $hospital) {
            $hospital->hospital_id ??= 'HOSP-'.strtoupper(uniqid());
        });
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function departments(): HasMany
    {
        return $this->hasMany(Department::class);
    }

    public function wards(): HasMany
    {
        return $this->hasMany(Ward::class);
    }

    public function beds(): HasMany
    {
        return $this->hasMany(Bed::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
