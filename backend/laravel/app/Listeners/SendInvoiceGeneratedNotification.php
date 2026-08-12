<?php

namespace App\Listeners;

use App\Events\Billing\InvoiceGenerated;
use App\Jobs\Notification\SendEmailNotification;

class SendInvoiceGeneratedNotification
{
    public function handle(InvoiceGenerated $event): void
    {
        $bill = $event->bill->loadMissing('patient');
        $patient = $bill->patient;

        if (! $patient?->email) {
            return;
        }

        $body = sprintf(
            'Invoice %s generated for %s. Total: %s. Balance due: %s.',
            $bill->bill_id,
            $patient->full_name,
            number_format((float) $bill->total_amount, 2),
            number_format((float) $bill->balance_amount, 2),
        );

        SendEmailNotification::dispatch($patient->email, 'Invoice Generated - '.$bill->bill_id, $body);
    }
}
