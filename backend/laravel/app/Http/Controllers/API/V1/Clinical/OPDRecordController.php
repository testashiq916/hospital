<?php

namespace App\Http\Controllers\API\V1\Clinical;

use App\Http\Controllers\API\V1\CrudController;
use App\Models\Clinical\OPDRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OPDRecordController extends CrudController
{
    protected string $model = OPDRecord::class;

    protected array $with = ['patient', 'doctor', 'visit'];

    protected function applyFilters($query, Request $request)
    {
        return $query->when($request->patient_id, fn ($q) => $q->where('patient_id', $request->patient_id));
    }

    protected function rules(Request $request, $id = null): array
    {
        return [
            'hospital_id' => ['required', 'exists:hospitals,id'],
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:users,id'],
            'visit_id' => ['required', 'exists:patient_visits,id'],
            'appointment_id' => ['nullable', 'exists:appointments,id'],
            'chief_complaint' => ['nullable', 'string'],
            'history_presenting' => ['nullable', 'string'],
            'vitals' => ['nullable', 'array'],
            'physical_examination' => ['nullable', 'string'],
            'provisional_diagnosis' => ['nullable', 'string'],
            'final_diagnosis' => ['nullable', 'string'],
            'treatment_advised' => ['nullable', 'string'],
            'advice' => ['nullable', 'string'],
            'follow_up_date' => ['nullable', 'date'],
            'status' => ['nullable', 'in:draft,final,cancelled'],
        ];
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules($request));
        $data['opd_date'] = now()->toDateString();
        $data['opd_time'] = now()->toTimeString();
        $data['created_by'] = Auth::id();

        $record = OPDRecord::create($data);

        return response()->json($record->load($this->with), 201);
    }
}
