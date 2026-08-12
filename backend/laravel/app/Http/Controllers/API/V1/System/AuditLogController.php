<?php

namespace App\Http\Controllers\API\V1\System;

use App\Http\Controllers\Controller;
use App\Models\System\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::query()->with('user')->where('company_id', $request->user()->company_id);

        $query->when($request->user_id, fn ($q) => $q->where('user_id', $request->user_id))
            ->when($request->action, fn ($q) => $q->where('action', 'like', "%{$request->action}%"))
            ->when($request->auditable_type, fn ($q) => $q->where('auditable_type', $request->auditable_type));

        return response()->json($query->orderByDesc('id')->paginate((int) $request->input('per_page', 30)));
    }
}
