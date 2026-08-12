<?php

namespace App\Services\Notification;

interface NotificationServiceInterface
{
    public function email(string $to, string $subject, string $body): void;

    public function sms(string $to, string $message): void;

    public function push(string $to, string $title, string $message): void;

    public function whatsapp(string $to, string $message): void;
}
