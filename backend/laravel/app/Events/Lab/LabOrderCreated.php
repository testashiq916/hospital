<?php

namespace App\Events\Lab;

use App\Models\Lab\LabOrder;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LabOrderCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public LabOrder $labOrder) {}
}
