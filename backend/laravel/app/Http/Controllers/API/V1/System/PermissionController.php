<?php

namespace App\Http\Controllers\API\V1\System;

use App\Http\Controllers\Controller;
use App\Models\System\Permission;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $query = Permission::query()->when($request->module, fn ($q) => $q->where('module', $request->module));

        return response()->json($query->orderBy('module')->get());
    }
}
