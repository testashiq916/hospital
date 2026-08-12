<?php

namespace App\Events\Billing;

use App\Models\Billing\HospitalBill;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InvoiceGenerated
{
    use Dispatchable, SerializesModels;

    public function __construct(public HospitalBill $bill) {}
}
