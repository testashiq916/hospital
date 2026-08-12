<?php

namespace App\Listeners;

use App\Events\Appointment\AppointmentBooked;
use App\Jobs\Notification\SendEmailNotification;
use App\Jobs\Notification\SendSMSNotification;

class SendAppointmentBookedNotification
{
    public function handle(AppointmentBooked $event): void
    {
        $appointment = $event->appointment->loadMissing('patient', 'doctor');
        $patient = $appointment->patient;

        $body = sprintf(
            'Your appointment with Dr. %s is confirmed for %s at %s. Token #%s.',
            $appointment->doctor?->name,
            $appointment->appointment_date->toDateString(),
            $appointment->appointment_time,
            $appointment->token_number,
        );

        if ($patient?->email) {
            SendEmailNotification::dispatch($patient->email, 'Appointment Confirmed', $body);
        }

        if ($patient?->mobile) {
            SendSMSNotification::dispatch($patient->mobile, $body);
        }
    }
}
