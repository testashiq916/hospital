<?php

namespace App\Providers;

use App\Events\Appointment\AppointmentBooked;
use App\Events\Billing\InvoiceGenerated;
use App\Events\Billing\PaymentReceived;
use App\Events\Lab\LabReportGenerated;
use App\Events\Patient\PatientRegistered;
use App\Listeners\SendAppointmentBookedNotification;
use App\Listeners\SendInvoiceGeneratedNotification;
use App\Listeners\SendLabReportGeneratedNotification;
use App\Listeners\SendPatientRegisteredNotification;
use App\Listeners\SendPaymentReceivedNotification;
use App\Services\Notification\LogNotificationService;
use App\Services\Notification\NotificationServiceInterface;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // No real email/SMS/push/WhatsApp provider is configured in this
        // environment; bind to the log-based driver. Swap this binding for a
        // real provider implementation to go live without touching callers.
        $this->app->bind(NotificationServiceInterface::class, LogNotificationService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(AppointmentBooked::class, SendAppointmentBookedNotification::class);
        Event::listen(InvoiceGenerated::class, SendInvoiceGeneratedNotification::class);
        Event::listen(LabReportGenerated::class, SendLabReportGeneratedNotification::class);
        Event::listen(PatientRegistered::class, SendPatientRegisteredNotification::class);
        Event::listen(PaymentReceived::class, SendPaymentReceivedNotification::class);
    }
}
