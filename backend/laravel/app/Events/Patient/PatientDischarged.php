<?php

namespace App\Events\Patient;

use App\Models\Patient\PatientAdmission;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PatientDischarged
{
    use Dispatchable, SerializesModels;

    public function __construct(public PatientAdmission $admission) {}
}
