<?php

namespace App\Http\Controllers\API\V1\Doctor;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Appointment\DoctorSchedule;
use Illuminate\Http\Request;

class DoctorScheduleController extends CrudController
{
    protected string $model = DoctorSchedule::class;

    protected array $with = ['doctor'];

    protected function applyFilters($query, Request $request)
    {
        return $query->when($request->doctor_id, fn ($q) => $q->where('doctor_id', $request->doctor_id));
    }

    protected function rules(Request $request, $id = null): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'doctor_id' => ['required', 'exists:users,id'],
            'day_of_week' => ['required', 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday'],
            'start_time' => ['required', 'date_format:H:i,H:i:s'],
            'end_time' => ['required', 'date_format:H:i,H:i:s'],
            'slot_duration' => ['nullable', 'integer', 'min:5'],
            'max_patients' => ['nullable', 'integer', 'min:1'],
            'is_available' => ['boolean'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
