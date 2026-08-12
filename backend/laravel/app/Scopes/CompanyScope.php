<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

/**
 * Multi-tenant safety net: every query against a tenant-scoped model is
 * automatically constrained to the authenticated user's company_id, unless
 * the user is flagged is_super_admin (platform-level, cross-tenant access).
 *
 * Applied via the App\Traits\BelongsToCompany trait rather than copy-pasted
 * onto every model.
 */
class CompanyScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (Auth::check()) {
            $user = Auth::user();

            if (! $user->is_super_admin) {
                $builder->where($model->qualifyColumn('company_id'), $user->company_id);
            }
        }
    }
}
