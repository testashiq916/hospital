<?php

namespace App\Services\Appointment;

use App\Events\Appointment\AppointmentBooked;
use App\Models\Appointment\Appointment;
use App\Models\Appointment\DoctorSchedule;
use App\Models\Appointment\DoctorUnavailability;
use App\Models\Appointment\QueueToken;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AppointmentService
{
    /**
     * Book an appointment: validates the doctor is not on leave and not
     * double-booked for the exact slot, then allocates the next sequential
     * token/queue number for that doctor + date (matches the Queue
     * Management / Token System feature).
     */
    public function book(array $data): Appointment
    {
        return DB::transaction(function () use ($data) {
            $date = Carbon::parse($data['appointment_date']);
            $dayOfWeek = strtolower($date->format('l'));

            $onLeave = DoctorUnavailability::where('doctor_id', $data['doctor_id'])
                ->whereDate('start_date', '<=', $date->toDateString())
                ->whereDate('end_date', '>=', $date->toDateString())
                ->exists();

            if ($onLeave) {
                throw ValidationException::withMessages([
                    'doctor_id' => 'Doctor is unavailable on the selected date.',
                ]);
            }

            if (! empty($data['appointment_time'])) {
                $conflict = Appointment::where('doctor_id', $data['doctor_id'])
                    ->whereDate('appointment_date', $date->toDateString())
                    ->where('appointment_time', $data['appointment_time'])
                    ->whereNotIn('status', ['cancelled', 'no_show'])
                    ->exists();

                if ($conflict) {
                    throw ValidationException::withMessages([
                        'appointment_time' => 'Doctor already has an appointment at this time.',
                    ]);
                }
            }

            $schedule = DoctorSchedule::where('doctor_id', $data['doctor_id'])
                ->where('day_of_week', $dayOfWeek)
                ->where('is_available', true)
                ->first();

            $tokenNumber = (int) Appointment::where('doctor_id', $data['doctor_id'])
                ->whereDate('appointment_date', $date->toDateString())
                ->lockForUpdate()
                ->max('token_number') + 1;

            $data['token_number'] = $tokenNumber;
            $data['queue_number'] = $tokenNumber;
            $data['status'] = $data['status'] ?? 'scheduled';
            $data['created_by'] = Auth::id();
            $data['company_id'] = $data['company_id'] ?? Auth::user()?->company_id;

            if ($schedule && empty($data['end_time'])) {
                $data['end_time'] = Carbon::parse($data['appointment_time'])
                    ->addMinutes($schedule->slot_duration)
                    ->format('H:i:s');
                $data['estimated_wait_time'] = ($tokenNumber - 1) * $schedule->slot_duration;
            }

            $appointment = Appointment::create($data);

            QueueToken::create([
                'company_id' => $appointment->company_id,
                'hospital_id' => $appointment->hospital_id,
                'doctor_id' => $appointment->doctor_id,
                'patient_id' => $appointment->patient_id,
                'appointment_id' => $appointment->id,
                'token_number' => $tokenNumber,
                'queue_date' => $date->toDateString(),
                'queue_status' => 'waiting',
            ]);

            AppointmentBooked::dispatch($appointment);

            return $appointment;
        });
    }

    public function cancel(Appointment $appointment, ?string $reason, ?int $cancelledBy): Appointment
    {
        $appointment->update([
            'status' => 'cancelled',
            'cancelled_reason' => $reason,
            'cancelled_by' => $cancelledBy,
        ]);

        QueueToken::where('appointment_id', $appointment->id)->update(['queue_status' => 'cancelled']);

        return $appointment->fresh();
    }

    /**
     * AI Appointment Optimization (folded in here per the closest-home rule):
     * suggests the least-loaded upcoming slot for a doctor over the next N days.
     */
    public function suggestOptimalSlot(int $doctorId, int $daysAhead = 7): ?array
    {
        $best = null;

        for ($i = 0; $i < $daysAhead; $i++) {
            $date = now()->addDays($i);
            $dayOfWeek = strtolower($date->format('l'));

            $schedule = DoctorSchedule::where('doctor_id', $doctorId)
                ->where('day_of_week', $dayOfWeek)
                ->where('is_available', true)
                ->first();

            if (! $schedule) {
                continue;
            }

            $onLeave = DoctorUnavailability::where('doctor_id', $doctorId)
                ->whereDate('start_date', '<=', $date->toDateString())
                ->whereDate('end_date', '>=', $date->toDateString())
                ->exists();

            if ($onLeave) {
                continue;
            }

            $bookedCount = Appointment::where('doctor_id', $doctorId)
                ->whereDate('appointment_date', $date->toDateString())
                ->whereNotIn('status', ['cancelled', 'no_show'])
                ->count();

            $load = $bookedCount / max(1, $schedule->max_patients);

            if ($best === null || $load < $best['load']) {
                $best = [
                    'date' => $date->toDateString(),
                    'day_of_week' => $dayOfWeek,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'booked' => $bookedCount,
                    'capacity' => $schedule->max_patients,
                    'load' => round($load, 2),
                ];
            }

            if ($load === 0.0) {
                break;
            }
        }

        return $best;
    }
}
