<?php

namespace App\Models\System;

use App\Models\Hospital\Hospital;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid', 'name', 'code', 'email', 'phone', 'address', 'city', 'state',
        'country', 'zip_code', 'timezone', 'currency', 'date_format', 'logo_path',
        'subscription_id', 'subscription_status', 'subscription_start_date',
        'subscription_end_date', 'hospital_limit', 'bed_limit', 'user_limit',
        'storage_limit', 'registration_no', 'gstin', 'pan', 'hospital_type',
        'is_active',
    ];

    protected $casts = [
        'subscription_start_date' => 'date',
        'subscription_end_date' => 'date',
        'is_active' => 'boolean',
        'hospital_limit' => 'integer',
        'bed_limit' => 'integer',
        'user_limit' => 'integer',
        'storage_limit' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (Company $company) {
            $company->uuid ??= (string) \Illuminate\Support\Str::uuid();
        });
    }

    public function hospitals(): HasMany
    {
        return $this->hasMany(Hospital::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function roles(): HasMany
    {
        return $this->hasMany(Role::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class, 'subscription_id');
    }
}
