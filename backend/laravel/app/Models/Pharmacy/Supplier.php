<?php

namespace App\Models\Pharmacy;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'hospital_id', 'name', 'contact_person', 'phone', 'email',
        'gstin', 'address', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function inventory(): HasMany
    {
        return $this->hasMany(PharmacyInventory::class);
    }
}
