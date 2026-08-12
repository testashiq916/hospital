<?php

namespace App\Models\Billing;

use App\Models\Accounting\Voucher;
use App\Models\Hospital\Hospital;
use App\Models\Patient\Patient;
use App\Models\System\Company;
use App\Models\System\User;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HospitalPayment extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id', 'hospital_id', 'patient_id', 'bill_id', 'payment_id',
        'payment_date', 'payment_time', 'amount', 'payment_method', 'transaction_id',
        'card_last_four', 'cheque_number', 'cheque_date', 'bank_name', 'upi_id',
        'payment_reference', 'status', 'gateway_response', 'received_by',
        'voucher_id', 'notes',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'cheque_date' => 'date',
        'amount' => 'decimal:2',
        'gateway_response' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (HospitalPayment $payment) {
            $payment->payment_id ??= 'PAY-'.date('Y').'-'.strtoupper(uniqid());
        });
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function hospital(): BelongsTo
    {
        return $this->belongsTo(Hospital::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function bill(): BelongsTo
    {
        return $this->belongsTo(HospitalBill::class, 'bill_id');
    }

    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }
}
