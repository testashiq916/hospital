<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database in strict dependency order.
     */
    public function run(): void
    {
        $this->call([
            PlanSeeder::class,
            PermissionSeeder::class,
            CompanyHospitalSeeder::class,
            RoleUserSeeder::class,
            DoctorScheduleSeeder::class,
            ChartOfAccountsSeeder::class,
            PharmacySeeder::class,
            DrugInteractionSeeder::class,
            LabRadiologySeeder::class,
        ]);
    }
}
