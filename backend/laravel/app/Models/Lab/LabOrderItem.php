<?php

namespace App\Models\Lab;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'lab_order_id', 'lab_test_id', 'specimen_id', 'sample_collected_at',
        'sample_received_at', 'result', 'result_text', 'result_status', 'range_low',
        'range_high', 'unit', 'remarks', 'is_abnormal',
    ];

    protected $casts = [
        'sample_collected_at' => 'datetime',
        'sample_received_at' => 'datetime',
        'result' => 'decimal:2',
        'range_low' => 'decimal:2',
        'range_high' => 'decimal:2',
        'is_abnormal' => 'boolean',
    ];

    public function labOrder(): BelongsTo
    {
        return $this->belongsTo(LabOrder::class);
    }

    public function labTest(): BelongsTo
    {
        return $this->belongsTo(LabTest::class);
    }
}
