<?php

namespace App\Models\Lab;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabTestParameter extends Model
{
    use HasFactory;

    const UPDATED_AT = null;

    protected $fillable = [
        'lab_test_id', 'parameter_name', 'normal_range_low', 'normal_range_high',
        'unit', 'description',
    ];

    protected $casts = [
        'normal_range_low' => 'decimal:2',
        'normal_range_high' => 'decimal:2',
    ];

    public function labTest(): BelongsTo
    {
        return $this->belongsTo(LabTest::class);
    }
}
