<?php

namespace App\Http\Controllers\API\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\System\AuditLog;
use App\Models\System\User;
use App\Services\System\TenantProvisioningService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function __construct(protected TenantProvisioningService $provisioning) {}

    /**
     * Self-service SaaS signup: creates a new Company (tenant) on the trial
     * plan plus its first hospital_admin user.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_name' => ['required', 'string', 'max:255'],
            'company_code' => ['nullable', 'string', 'max:50', 'unique:companies,code'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'mobile' => ['nullable', 'string', 'max:20'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['password'] = Hash::make($data['password']);

        [$company, $user] = $this->provisioning->provision($data);

        $token = $user->createToken('auth_token')->plainTextToken;

        AuditLog::record('register', $user, [], ['email' => $user->email]);

        return response()->json([
            'message' => 'Registration successful.',
            'token' => $token,
            'user' => $user->load(['company', 'role.permissions']),
        ], 201);
    }

    /**
     * Login by email + password. Because email is only unique per company
     * (schema: unique_email_company), an optional company_code disambiguates
     * accounts that reuse the same email address across different tenants.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'company_code' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $query = User::withoutCompanyScope()->where('email', $request->email);

        if ($request->filled('company_code')) {
            $query->whereHas('company', fn ($q) => $q->where('code', $request->company_code));
        }

        $user = $query->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Account is deactivated.'], 403);
        }

        $user->forceFill(['last_login_at' => now()])->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        AuditLog::record('login', $user);

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'user' => $user->load(['company', 'hospital', 'role.permissions']),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        AuditLog::record('logout', $request->user());

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request)
    {
        return response()->json(
            $request->user()->load(['company', 'hospital', 'role.permissions'])
        );
    }
}
