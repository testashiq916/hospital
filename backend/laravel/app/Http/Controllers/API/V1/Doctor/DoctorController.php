<?php

namespace App\Http\Controllers\API\V1\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Appointment\QueueToken;
use App\Models\System\User;
use Illuminate\Http\Request;

/**
 * Doctor Dashboard endpoints (Today's Patients / Patient Queue) — doctor
 * CRUD itself lives on the general User Management endpoints since doctors
 * are users with role "doctor".
 */
class DoctorController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->whereHas('role', fn ($q) => $q->where('slug', 'doctor'))
            ->orWhere('is_consultant', true);

        if ($request->filled('hospital_id')) {
            $query->where('hospital_id', $request->hospital_id);
        }

        return response()->json($query->with('role')->paginate((int) $request->input('per_page', 20)));
    }

    public function todayQueue(Request $request, User $doctor)
    {
        $tokens = QueueToken::where('doctor_id', $doctor->id)
            ->whereDate('queue_date', now()->toDateString())
            ->with('patient')
            ->orderBy('token_number')
            ->get();

        return response()->json($tokens);
    }
}
