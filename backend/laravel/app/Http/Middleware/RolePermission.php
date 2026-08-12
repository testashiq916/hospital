<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Real RBAC enforcement (not a stub): checks the authenticated user's role ->
 * permissions relationship (roles / permissions / role_permissions tables)
 * for the given permission slug. is_super_admin bypasses all checks.
 *
 * Usage: Route::middleware('permission:patients.create')
 */
class RolePermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! $user->hasPermission($permission)) {
            return response()->json([
                'message' => "Forbidden. Missing permission: {$permission}",
            ], 403);
        }

        return $next($request);
    }
}
