<?php

namespace App\Events\Billing;

use App\Models\Billing\HospitalPayment;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentReceived
{
    use Dispatchable, SerializesModels;

    public function __construct(public HospitalPayment $payment) {}
}
