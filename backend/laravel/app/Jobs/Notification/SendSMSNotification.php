<?php

namespace App\Jobs\Notification;

use App\Services\Notification\NotificationServiceInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendSMSNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $to,
        public string $message,
    ) {}

    public function handle(NotificationServiceInterface $notifications): void
    {
        $notifications->sms($this->to, $this->message);
    }
}
