<?php

namespace App\Models\Pharmacy;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PharmacyInventory extends Model
{
    use HasFactory, BelongsToCompany;

    protected $table = 'pharmacy_inventory';

    protected $fillable = [
        'company_id', 'hospital_id', 'medicine_id', 'batch_number', 'quantity',
        'unit_price', 'purchase_date', 'expiry_date', 'supplier_id', 'rack_location', 'status',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'purchase_date' => 'date',
        'expiry_date' => 'date',
    ];

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
