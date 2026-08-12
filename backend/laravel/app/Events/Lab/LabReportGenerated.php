<?php

namespace App\Events\Lab;

use App\Models\Lab\LabReport;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LabReportGenerated
{
    use Dispatchable, SerializesModels;

    public function __construct(public LabReport $labReport) {}
}
