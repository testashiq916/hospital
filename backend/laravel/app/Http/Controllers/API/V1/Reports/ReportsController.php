<?php

namespace App\Http\Controllers\API\V1\Reports;

use App\Http\Controllers\Controller;
use App\Models\Appointment\Appointment;
use App\Models\Billing\HospitalBill;
use App\Models\Hospital\Bed;
use App\Models\Hospital\Department;
use App\Models\Patient\Patient;
use App\Models\Patient\PatientAdmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReportsController extends Controller
{
    public function todaySummary(Request $request)
    {
        $today = now()->toDateString();
        $hospitalId = $request->hospital_id;

        return response()->json([
            'date' => $today,
            'total_patients' => Patient::when($hospitalId, fn ($q) => $q->where('hospital_id', $hospitalId))->count(),
            'new_registrations_today' => Patient::whereDate('registration_date', $today)->when($hospitalId, fn ($q) => $q->where('hospital_id', $hospitalId))->count(),
            'appointments_today' => Appointment::whereDate('appointment_date', $today)->when($hospitalId, fn ($q) => $q->where('hospital_id', $hospitalId))->count(),
            'admissions_today' => PatientAdmission::whereDate('admission_date', $today)->when($hospitalId, fn ($q) => $q->where('hospital_id', $hospitalId))->count(),
            'active_admissions' => PatientAdmission::where('status', 'active')->when($hospitalId, fn ($q) => $q->where('hospital_id', $hospitalId))->count(),
            'revenue_today' => (float) HospitalBill::whereDate('bill_date', $today)->when($hospitalId, fn ($q) => $q->where('hospital_id', $hospitalId))->sum('total_amount'),
            'occupancy_rate' => $this->occupancyRate($hospitalId),
        ]);
    }

    public function revenueTrend(Request $request)
    {
        $days = (int) $request->input('days', 30);
        $hospitalId = $request->hospital_id;

        $rows = HospitalBill::query()
            ->select(DB::raw('bill_date as date'), DB::raw('SUM(total_amount) as revenue'), DB::raw('COUNT(*) as bill_count'))
            ->when($hospitalId, fn ($q) => $q->where('hospital_id', $hospitalId))
            ->whereDate('bill_date', '>=', now()->subDays($days)->toDateString())
            ->groupBy('bill_date')
            ->orderBy('bill_date')
            ->get();

        return response()->json($rows);
    }

    public function departmentPerformance(Request $request)
    {
        $hospitalId = $request->hospital_id;

        $rows = Department::query()
            ->when($hospitalId, fn ($q) => $q->where('hospital_id', $hospitalId))
            ->withCount(['wards'])
            ->get()
            ->map(function (Department $department) {
                $visitCount = DB::table('patient_visits')->where('department_id', $department->id)->count();
                $admissionCount = DB::table('patient_admissions')->where('department_id', $department->id)->count();

                return [
                    'department_id' => $department->id,
                    'name' => $department->name,
                    'wards_count' => $department->wards_count,
                    'visits' => $visitCount,
                    'admissions' => $admissionCount,
                ];
            });

        return response()->json($rows);
    }

    public function occupancy(Request $request)
    {
        return response()->json(['occupancy_rate' => $this->occupancyRate($request->hospital_id)]);
    }

    protected function occupancyRate($hospitalId = null): float
    {
        $query = Bed::query()->when($hospitalId, fn ($q) => $q->where('hospital_id', $hospitalId));
        $total = (clone $query)->count();

        if ($total === 0) {
            return 0.0;
        }

        $occupied = (clone $query)->where('status', 'occupied')->count();

        return round(($occupied / $total) * 100, 2);
    }
}
