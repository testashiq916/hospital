<?php

namespace App\Listeners;

use App\Events\Billing\PaymentReceived;
use App\Jobs\Notification\SendEmailNotification;

class SendPaymentReceivedNotification
{
    public function handle(PaymentReceived $event): void
    {
        $payment = $event->payment->loadMissing('patient');
        $patient = $payment->patient;

        if (! $patient?->email) {
            return;
        }

        SendEmailNotification::dispatch(
            $patient->email,
            'Payment Receipt - '.$payment->payment_id,
            sprintf('We received your payment of %s via %s.', number_format((float) $payment->amount, 2), $payment->payment_method)
        );
    }
}
