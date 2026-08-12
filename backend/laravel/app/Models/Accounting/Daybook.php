<?php

namespace App\Models\Accounting;

use App\Models\Billing\HospitalBill;
use App\Models\Hospital\Hospital;
use App\Models\Patient\Patient;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Daybook extends Model
{
    use HasFactory, BelongsToCompany;

    protected $table = 'daybook';

    protected $fillable = [
        'company_id', 'slno', 'sno', 'account_code', 'opposite_account_code',
        'amount', 'drcr', 'voucher_type', 'voucher_no', 'voucher_date', 'remarks',
        'reference_no', 'reference_date', 'patient_id', 'bill_id', 'hospital_id', 'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'voucher_date' => 'date',
        'reference_date' => 'date',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'account_code', 'account_code');
    }

    public function oppositeAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'opposite_account_code', 'account_code');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function bill(): BelongsTo
    {
        return $this->belongsTo(HospitalBill::class, 'bill_id');
    }

    public function hospital(): BelongsTo
    {
        return $this->belongsTo(Hospital::class);
    }
}
