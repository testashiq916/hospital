<?php

namespace App\Http\Controllers\API\V1\Lab;

use App\Http\Controllers\Controller;
use App\Models\Lab\LabReport;
use Illuminate\Http\Request;

class LabReportController extends Controller
{
    public function index(Request $request)
    {
        $query = LabReport::query()->with(['patient', 'labOrder']);

        $query->when($request->patient_id, fn ($q) => $q->where('patient_id', $request->patient_id));

        return response()->json($query->orderByDesc('id')->paginate((int) $request->input('per_page', 20)));
    }

    public function show(LabReport $labReport)
    {
        return response()->json($labReport->load(['patient', 'labOrder.items.labTest']));
    }
}
