<?php

namespace App\Models\Pharmacy;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Medicine extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'hospital_id', 'category_id', 'medicine_code', 'name',
        'generic_name', 'strength', 'dosage_form', 'unit', 'manufacturer', 'price',
        'gst_rate', 'reorder_level', 'reorder_quantity', 'current_stock', 'min_stock',
        'max_stock', 'batch_number', 'expiry_date', 'is_active', 'created_by',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'gst_rate' => 'decimal:2',
        'expiry_date' => 'date',
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Medicine $medicine) {
            $medicine->medicine_code ??= 'MED-'.strtoupper(uniqid());
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(MedicineCategory::class, 'category_id');
    }

    public function inventoryBatches(): HasMany
    {
        return $this->hasMany(PharmacyInventory::class);
    }

    public function isLowStock(): bool
    {
        return $this->current_stock <= $this->reorder_level;
    }

    public function isExpiringSoon(int $days = 30): bool
    {
        return $this->expiry_date && $this->expiry_date->diffInDays(now(), false) >= -$days && $this->expiry_date->isFuture();
    }
}
