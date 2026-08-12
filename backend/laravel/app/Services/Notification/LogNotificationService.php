<?php

namespace App\Services\Notification;

use Illuminate\Support\Facades\Log;

/**
 * No real email/SMS/push/WhatsApp provider is configured for this build, so
 * the transport is a log-based no-op driver behind a clean interface (per
 * the brief). Swapping in a real provider later only requires a new class
 * implementing NotificationServiceInterface and rebinding it in
 * AppServiceProvider — nothing calling this service needs to change.
 */
class LogNotificationService implements NotificationServiceInterface
{
    public function email(string $to, string $subject, string $body): void
    {
        Log::info('[notification:email]', ['to' => $to, 'subject' => $subject, 'body' => $body]);
    }

    public function sms(string $to, string $message): void
    {
        Log::info('[notification:sms]', ['to' => $to, 'message' => $message]);
    }

    public function push(string $to, string $title, string $message): void
    {
        Log::info('[notification:push]', ['to' => $to, 'title' => $title, 'message' => $message]);
    }

    public function whatsapp(string $to, string $message): void
    {
        Log::info('[notification:whatsapp]', ['to' => $to, 'message' => $message]);
    }
}
