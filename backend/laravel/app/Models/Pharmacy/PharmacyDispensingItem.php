<?php

namespace App\Models\Pharmacy;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PharmacyDispensingItem extends Model
{
    use HasFactory;

    const UPDATED_AT = null;

    protected $fillable = [
        'dispensing_id', 'medicine_id', 'quantity', 'unit_price', 'batch_number',
        'expiry_date', 'discount_percent', 'discount_amount', 'gst_rate', 'gst_amount', 'total',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'expiry_date' => 'date',
        'discount_percent' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'gst_rate' => 'decimal:2',
        'gst_amount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function dispensing(): BelongsTo
    {
        return $this->belongsTo(PharmacyDispensing::class, 'dispensing_id');
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }
}
