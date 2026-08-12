<?php

namespace App\Listeners;

use App\Events\Patient\PatientRegistered;
use App\Jobs\Notification\SendEmailNotification;

class SendPatientRegisteredNotification
{
    public function handle(PatientRegistered $event): void
    {
        $patient = $event->patient;

        if (! $patient->email) {
            return;
        }

        SendEmailNotification::dispatch(
            $patient->email,
            'Registration Confirmed',
            "Dear {$patient->first_name}, your patient ID is {$patient->patient_id}."
        );
    }
}
