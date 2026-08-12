<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * SubscriptionCheck / CompanyScope middleware: blocks access for users
 * belonging to a suspended/cancelled/expired company subscription, and for
 * companies that have been deactivated. Data isolation itself is enforced at
 * the query level by App\Scopes\CompanyScope; this middleware is the
 * account-status gate.
 */
class EnsureCompanyActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $company = $user->company;

            if (! $company || ! $company->is_active) {
                return response()->json(['message' => 'Company account is inactive.'], 403);
            }

            if (in_array($company->subscription_status, ['suspended', 'cancelled', 'expired'], true)) {
                return response()->json([
                    'message' => 'Subscription is '.$company->subscription_status.'. Please contact support.',
                ], 403);
            }
        }

        return $next($request);
    }
}
