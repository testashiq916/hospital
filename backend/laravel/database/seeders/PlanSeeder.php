<?php

namespace Database\Seeders;

use App\Models\System\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Trial',
                'slug' => 'trial',
                'description' => '14-day free trial of the full platform.',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'features' => ['all_modules', 'ai_features'],
                'hospital_limit' => 1,
                'bed_limit' => 50,
                'user_limit' => 10,
                'patient_limit' => 1000,
            ],
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Single hospital, core modules.',
                'price_monthly' => 4999,
                'price_yearly' => 49990,
                'features' => ['patients', 'appointments', 'billing', 'pharmacy'],
                'hospital_limit' => 1,
                'bed_limit' => 100,
                'user_limit' => 25,
                'patient_limit' => 10000,
            ],
            [
                'name' => 'Professional',
                'slug' => 'professional',
                'description' => 'Multi-branch hospital group with AI features.',
                'price_monthly' => 14999,
                'price_yearly' => 149990,
                'features' => ['all_modules', 'ai_features', 'multi_branch'],
                'hospital_limit' => 5,
                'bed_limit' => 500,
                'user_limit' => 100,
                'patient_limit' => 100000,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'Unlimited branches and users, dedicated support.',
                'price_monthly' => 39999,
                'price_yearly' => 399990,
                'features' => ['all_modules', 'ai_features', 'multi_branch', 'priority_support'],
                'hospital_limit' => 100,
                'bed_limit' => 10000,
                'user_limit' => 1000,
                'patient_limit' => 1000000,
            ],
        ];

        foreach ($plans as $plan) {
            Plan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
