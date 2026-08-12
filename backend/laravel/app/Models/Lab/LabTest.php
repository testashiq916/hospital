<?php

namespace App\Models\Lab;

use App\Models\Hospital\Hospital;
use App\Models\System\Company;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LabTest extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'hospital_id', 'test_code', 'name', 'category', 'description',
        'price', 'turnaround_time', 'specimen_type', 'units', 'normal_range', 'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function hospital(): BelongsTo
    {
        return $this->belongsTo(Hospital::class);
    }

    public function parameters(): HasMany
    {
        return $this->hasMany(LabTestParameter::class);
    }
}
