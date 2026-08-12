<?php

namespace App\Models\Accounting;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChartOfAccount extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'account_code', 'account_name', 'group_code', 'head_code',
        'account_type', 'opening_balance', 'opening_balance_date', 'current_balance',
        'status', 'is_default', 'is_system', 'created_by',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
        'opening_balance_date' => 'date',
        'current_balance' => 'decimal:2',
        'is_default' => 'boolean',
        'is_system' => 'boolean',
    ];

    public function getRouteKeyName(): string
    {
        return 'account_code';
    }
}
