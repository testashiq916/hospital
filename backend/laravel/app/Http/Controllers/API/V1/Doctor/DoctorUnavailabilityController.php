<?php

namespace App\Http\Controllers\API\V1\Doctor;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Appointment\DoctorUnavailability;
use Illuminate\Http\Request;

class DoctorUnavailabilityController extends CrudController
{
    protected string $model = DoctorUnavailability::class;

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
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['nullable', 'string', 'max:255'],
            'is_full_day' => ['boolean'],
        ];
    }
}
