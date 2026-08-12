<?php

namespace App\Events\Patient;

use App\Models\Patient\Patient;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PatientRegistered
{
    use Dispatchable, SerializesModels;

    public function __construct(public Patient $patient) {}
}
