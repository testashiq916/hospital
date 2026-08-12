<?php

namespace App\Models\Billing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillItem extends Model
{
    use HasFactory;

    const UPDATED_AT = null;

    protected $fillable = [
        'bill_id', 'item_type', 'item_id', 'description', 'quantity', 'unit_price',
        'discount_percent', 'discount_amount', 'gst_rate', 'gst_amount', 'total',
        'reference_no', 'notes',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'gst_rate' => 'decimal:2',
        'gst_amount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function bill(): BelongsTo
    {
        return $this->belongsTo(HospitalBill::class, 'bill_id');
    }
}
