<?php

namespace App\Models\Pharmacy;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Global reference table (not tenant scoped) seeded with well-known
 * drug-drug interaction pairs, used by App\Services\AI\DrugInteractionService.
 */
class DrugInteraction extends Model
{
    use HasFactory;

    protected $fillable = ['drug_a', 'drug_b', 'severity', 'description', 'recommendation'];
}
