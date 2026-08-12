<?php

namespace App\Http\Controllers\API\V1\Clinical;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Clinical\OTSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OTScheduleController extends CrudController
{
    protected string $model = OTSchedule::class;

    protected array $with = ['patient', 'doctor'];

    protected function applyFilters($query, Request $request)
    {
        return $query->when($request->surgery_date, fn ($q) => $q->whereDate('surgery_date', $request->surgery_date))
            ->when($request->status, fn ($q) => $q->where('status', $request->status));
    }

    protected function rules(Request $request, $id = null): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:users,id'],
            'assistant_doctor_id' => ['nullable', 'exists:users,id'],
            'anesthetist_id' => ['nullable', 'exists:users,id'],
            'nurse_id' => ['nullable', 'exists:users,id'],
            'ot_number' => ['required', 'string', 'max:20'],
            'surgery_date' => ['required', 'date'],
            'surgery_time' => ['required', 'date_format:H:i,H:i:s'],
            'expected_duration' => ['nullable', 'integer', 'min:1'],
            'surgery_type' => ['nullable', 'string', 'max:255'],
            'surgery_reason' => ['nullable', 'string'],
            'anesthesia_type' => ['nullable', 'string', 'max:100'],
            'priority' => ['nullable', 'in:routine,urgent,emergency'],
            'is_emergency' => ['boolean'],
        ];
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules($request));
        $data['created_by'] = Auth::id();

        return response()->json(OTSchedule::create($data)->load($this->with), 201);
    }

    public function updateStatus(Request $request, OTSchedule $otSchedule)
    {
        $data = $request->validate([
            'status' => ['required', 'in:scheduled,prepared,in_progress,completed,cancelled,postponed'],
            'post_operation_notes' => ['nullable', 'string'],
        ]);

        $otSchedule->update($data);

        return response()->json($otSchedule->fresh());
    }
}
