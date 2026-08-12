<?php

namespace App\Http\Requests\API\V1\Appointment;

use Illuminate\Foundation\Http\FormRequest;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:users,id'],
            'appointment_date' => ['required', 'date'],
            'appointment_time' => ['required', 'date_format:H:i,H:i:s'],
            'appointment_type' => ['nullable', 'in:opd,follow_up,teleconsultation,emergency'],
            'reason' => ['nullable', 'string'],
            'is_emergency' => ['boolean'],
            'is_teleconsultation' => ['boolean'],
        ];
    }
}
