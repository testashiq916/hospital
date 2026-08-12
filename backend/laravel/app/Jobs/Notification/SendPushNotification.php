<?php

namespace App\Jobs\Notification;

use App\Services\Notification\NotificationServiceInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendPushNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $to,
        public string $title,
        public string $message,
    ) {}

    public function handle(NotificationServiceInterface $notifications): void
    {
        $notifications->push($this->to, $this->title, $this->message);
    }
}
