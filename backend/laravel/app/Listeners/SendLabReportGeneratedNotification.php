<?php

namespace App\Listeners;

use App\Events\Lab\LabReportGenerated;
use App\Jobs\Notification\SendEmailNotification;

class SendLabReportGeneratedNotification
{
    public function handle(LabReportGenerated $event): void
    {
        $report = $event->labReport->loadMissing('patient');
        $patient = $report->patient;

        if (! $patient?->email) {
            return;
        }

        SendEmailNotification::dispatch(
            $patient->email,
            'Lab Report Ready - '.$report->report_id,
            "Your lab report {$report->report_id} is now available."
        );
    }
}
