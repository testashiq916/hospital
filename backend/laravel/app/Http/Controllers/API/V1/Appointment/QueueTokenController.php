<?php

namespace App\Http\Controllers\API\V1\Appointment;

use App\Http\Controllers\Controller;
use App\Models\Appointment\QueueToken;
use Illuminate\Http\Request;

class QueueTokenController extends Controller
{
    public function index(Request $request)
    {
        $query = QueueToken::query()->with(['patient', 'doctor']);

        $query->when($request->doctor_id, fn ($q) => $q->where('doctor_id', $request->doctor_id))
            ->when($request->date, fn ($q) => $q->whereDate('queue_date', $request->date), fn ($q) => $q->whereDate('queue_date', now()->toDateString()));

        return response()->json($query->orderBy('token_number')->get());
    }

    public function call(QueueToken $queueToken)
    {
        $queueToken->update(['queue_status' => 'called', 'called_at' => now()]);

        return response()->json($queueToken->fresh());
    }

    public function start(QueueToken $queueToken)
    {
        $queueToken->update(['queue_status' => 'in_progress', 'started_at' => now()]);

        return response()->json($queueToken->fresh());
    }

    public function complete(QueueToken $queueToken)
    {
        $startedAt = $queueToken->started_at ?? now();

        $queueToken->update([
            'queue_status' => 'completed',
            'completed_at' => now(),
            'service_time' => now()->diffInMinutes($startedAt),
        ]);

        if ($queueToken->appointment_id) {
            $queueToken->appointment?->update(['status' => 'completed']);
        }

        return response()->json($queueToken->fresh());
    }

    public function skip(QueueToken $queueToken)
    {
        $queueToken->update(['queue_status' => 'skipped']);

        return response()->json($queueToken->fresh());
    }
}
