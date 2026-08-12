<?php

namespace App\Http\Controllers\API\V1\System;

use App\Http\Controllers\Controller;
use App\Models\System\AuditLog;
use App\Models\System\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->with(['role', 'hospital']);

        $query->when($request->role_id, fn ($q) => $q->where('role_id', $request->role_id))
            ->when($request->hospital_id, fn ($q) => $q->where('hospital_id', $request->hospital_id))
            ->when($request->search, fn ($q) => $q->where(function ($qq) use ($request) {
                $qq->where('first_name', 'like', "%{$request->search}%")
                    ->orWhere('last_name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            }));

        return response()->json($query->orderByDesc('id')->paginate((int) $request->input('per_page', 20)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'hospital_id' => ['nullable', 'exists:hospitals,id'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8'],
            'mobile' => ['nullable', 'string', 'max:20'],
            'role_id' => ['required', 'exists:roles,id'],
            'designation' => ['nullable', 'string', 'max:100'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'is_consultant' => ['boolean'],
        ]);

        $data['password'] = Hash::make($data['password']);
        $data['is_active'] = true;

        $user = User::create($data);

        AuditLog::record('user.create', $user, [], $user->only(['email', 'role_id']));

        return response()->json($user->load('role'), 201);
    }

    public function show(User $user)
    {
        return response()->json($user->load(['role.permissions', 'hospital']));
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name' => ['sometimes', 'string', 'max:100'],
            'mobile' => ['nullable', 'string', 'max:20'],
            'role_id' => ['nullable', 'exists:roles,id'],
            'hospital_id' => ['nullable', 'exists:hospitals,id'],
            'designation' => ['nullable', 'string', 'max:100'],
            'is_active' => ['boolean'],
        ]);

        $old = $user->only(array_keys($data));
        $user->update($data);

        AuditLog::record('user.update', $user, $old, $data);

        return response()->json($user->fresh('role'));
    }

    public function destroy(User $user)
    {
        AuditLog::record('user.delete', $user, $user->only(['email']), []);

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    public function resetPassword(Request $request, User $user)
    {
        $data = $request->validate(['password' => ['required', 'string', 'min:8']]);

        $user->update(['password' => Hash::make($data['password'])]);

        AuditLog::record('user.reset_password', $user);

        return response()->json(['message' => 'Password reset successfully.']);
    }
}
