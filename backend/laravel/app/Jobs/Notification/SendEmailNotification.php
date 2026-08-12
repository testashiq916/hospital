<?php

namespace App\Jobs\Notification;

use App\Services\Notification\NotificationServiceInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendEmailNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $to,
        public string $subject,
        public string $body,
    ) {}

    public function handle(NotificationServiceInterface $notifications): void
    {
        $notifications->email($this->to, $this->subject, $this->body);
    }
}
