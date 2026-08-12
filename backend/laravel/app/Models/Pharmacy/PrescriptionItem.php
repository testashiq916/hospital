<?php

namespace App\Models\Pharmacy;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrescriptionItem extends Model
{
    use HasFactory;

    const UPDATED_AT = null;

    protected $fillable = [
        'prescription_id', 'medicine_id', 'quantity', 'dosage', 'frequency',
        'duration', 'instructions', 'route', 'timing', 'is_optional', 'substitute_allowed',
    ];

    protected $casts = [
        'is_optional' => 'boolean',
        'substitute_allowed' => 'boolean',
    ];

    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }
}
