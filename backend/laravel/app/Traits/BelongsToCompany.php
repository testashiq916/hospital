<?php

namespace App\Traits;

use App\Scopes\CompanyScope;
use Illuminate\Support\Facades\Auth;

/**
 * Apply to every tenant-scoped Eloquent model (i.e. every model whose table
 * has a company_id column). Registers the global CompanyScope so all reads
 * are automatically constrained to the authenticated user's tenant, and
 * auto-fills company_id / hospital_id on create from the authenticated user
 * when the caller didn't already set them explicitly (e.g. from a request
 * payload or a seeder acting on behalf of a specific tenant).
 */
trait BelongsToCompany
{
    protected static function bootBelongsToCompany(): void
    {
        static::addGlobalScope(new CompanyScope);

        static::creating(function ($model) {
            if (! Auth::check()) {
                return;
            }

            $user = Auth::user();

            if (in_array('company_id', $model->getFillable(), true) && empty($model->company_id)) {
                $model->company_id = $user->company_id;
            }

            if (in_array('hospital_id', $model->getFillable(), true) && empty($model->hospital_id) && $user->hospital_id) {
                $model->hospital_id = $user->hospital_id;
            }
        });
    }

    public function scopeWithoutCompanyScope($query)
    {
        return $query->withoutGlobalScope(CompanyScope::class);
    }
}
