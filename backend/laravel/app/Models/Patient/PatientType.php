<?php

namespace App\Models\Patient;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientType extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = ['company_id', 'hospital_id', 'name', 'code', 'description', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];
}
