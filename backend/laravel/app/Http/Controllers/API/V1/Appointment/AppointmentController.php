<?php

namespace App\Http\Controllers\API\V1\Appointment;

use App\Http\Controllers\Controller;
use App\Http\Requests\API\V1\Appointment\StoreAppointmentRequest;
use App\Models\Appointment\Appointment;
use App\Services\Appointment\AppointmentService;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function __construct(protected AppointmentService $appointments) {}

    public function index(Request $request)
    {
        $query = Appointment::query()->with(['patient', 'doctor']);

        $query->when($request->doctor_id, fn ($q) => $q->where('doctor_id', $request->doctor_id))
            ->when($request->patient_id, fn ($q) => $q->where('patient_id', $request->patient_id))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->date, fn ($q) => $q->whereDate('appointment_date', $request->date));

        return response()->json($query->orderBy('appointment_date')->orderBy('token_number')->paginate((int) $request->input('per_page', 20)));
    }

    public function store(StoreAppointmentRequest $request)
    {
        $appointment = $this->appointments->book($request->validated());

        return response()->json($appointment->load(['patient', 'doctor']), 201);
    }

    public function show(Appointment $appointment)
    {
        return response()->json($appointment->load(['patient', 'doctor', 'queueToken']));
    }

    public function update(Request $request, Appointment $appointment)
    {
        $data = $request->validate([
            'status' => ['nullable', 'in:scheduled,confirmed,in_progress,completed,cancelled,no_show'],
            'notes' => ['nullable', 'string'],
        ]);

        $appointment->update($data);

        return response()->json($appointment->fresh());
    }

    public function cancel(Request $request, Appointment $appointment)
    {
        $data = $request->validate(['reason' => ['nullable', 'string']]);

        $appointment = $this->appointments->cancel($appointment, $data['reason'] ?? null, auth()->id());

        return response()->json($appointment);
    }

    public function optimalSlot(Request $request, int $doctorId)
    {
        return response()->json($this->appointments->suggestOptimalSlot($doctorId, (int) $request->input('days_ahead', 7)));
    }
}
