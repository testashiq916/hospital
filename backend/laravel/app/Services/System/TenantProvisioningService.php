<?php

namespace App\Services\System;

use App\Models\System\Company;
use App\Models\System\Permission;
use App\Models\System\Plan;
use App\Models\System\Role;
use App\Models\System\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Provisions a brand-new tenant (Company) on self-service registration:
 * creates the company on the trial plan, a hospital_admin role with every
 * permission granted, and the first admin user for that company.
 */
class TenantProvisioningService
{
    public function provision(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $plan = Plan::where('slug', 'trial')->first();

            $company = Company::create([
                'uuid' => (string) Str::uuid(),
                'name' => $data['company_name'],
                'code' => $data['company_code'] ?? Str::upper(Str::random(6)),
                'email' => $data['email'],
                'subscription_id' => $plan?->id,
                'subscription_status' => 'trial',
                'subscription_start_date' => now()->toDateString(),
                'subscription_end_date' => now()->addDays(14)->toDateString(),
                'hospital_limit' => $plan?->hospital_limit ?? 1,
                'bed_limit' => $plan?->bed_limit ?? 100,
                'user_limit' => $plan?->user_limit ?? 10,
                'is_active' => true,
            ]);

            $role = Role::create([
                'company_id' => $company->id,
                'name' => 'Hospital Admin',
                'slug' => 'hospital_admin',
                'description' => 'Full access administrator for this company.',
                'is_default' => true,
            ]);

            $role->permissions()->sync(Permission::pluck('id'));

            $user = User::create([
                'company_id' => $company->id,
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'mobile' => $data['mobile'] ?? null,
                'role_id' => $role->id,
                'designation' => 'Administrator',
                'is_super_admin' => false,
                'is_active' => true,
            ]);

            return [$company, $user];
        });
    }
}
