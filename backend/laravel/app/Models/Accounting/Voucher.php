<?php

namespace App\Models\Accounting;

use App\Models\Hospital\Hospital;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Voucher extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'voucher_no', 'voucher_type', 'voucher_date', 'reference_no',
        'reference_date', 'narration', 'total_debit', 'total_credit', 'total_amount',
        'balance_difference', 'is_balanced', 'is_posted', 'posted_by', 'posted_at',
        'hospital_id', 'created_by',
    ];

    protected $casts = [
        'voucher_date' => 'date',
        'reference_date' => 'date',
        'total_debit' => 'decimal:2',
        'total_credit' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'balance_difference' => 'decimal:2',
        'is_balanced' => 'boolean',
        'is_posted' => 'boolean',
        'posted_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function hospital(): BelongsTo
    {
        return $this->belongsTo(Hospital::class);
    }

    public function postedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    public function entries(): HasMany
    {
        return $this->hasMany(Daybook::class, 'voucher_no', 'voucher_no')
            ->where('voucher_type', $this->voucher_type);
    }
}
