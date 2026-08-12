<?php

namespace Database\Seeders;

use App\Models\Hospital\Bed;
use App\Models\Hospital\Department;
use App\Models\Hospital\Hospital;
use App\Models\Hospital\Ward;
use App\Models\Patient\PatientType;
use App\Models\System\Company;
use App\Models\System\Plan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CompanyHospitalSeeder extends Seeder
{
    public function run(): void
    {
        $plan = Plan::where('slug', 'professional')->first();

        $company = Company::updateOrCreate(
            ['code' => 'DEMO-HMS'],
            [
                'uuid' => (string) Str::uuid(),
                'name' => 'Demo Hospital Group',
                'email' => 'admin@demo-hms.test',
                'phone' => '+91-9876543210',
                'address' => '221B Health Street',
                'city' => 'Bengaluru',
                'state' => 'Karnataka',
                'country' => 'India',
                'zip_code' => '560001',
                'timezone' => 'Asia/Kolkata',
                'currency' => 'INR',
                'subscription_id' => $plan?->id,
                'subscription_status' => 'active',
                'subscription_start_date' => now()->subMonths(2)->toDateString(),
                'subscription_end_date' => now()->addYear()->toDateString(),
                'hospital_limit' => $plan?->hospital_limit ?? 5,
                'bed_limit' => $plan?->bed_limit ?? 500,
                'user_limit' => $plan?->user_limit ?? 100,
                'registration_no' => 'REG-2020-0001',
                'gstin' => '29ABCDE1234F1Z5',
                'pan' => 'ABCDE1234F',
                'hospital_type' => 'super_speciality',
                'is_active' => true,
            ]
        );

        $hospital = Hospital::updateOrCreate(
            ['hospital_id' => 'HOSP-DEMO-001'],
            [
                'company_id' => $company->id,
                'name' => 'City Care Hospital',
                'code' => 'CCH',
                'address' => '221B Health Street',
                'city' => 'Bengaluru',
                'state' => 'Karnataka',
                'country' => 'India',
                'zip_code' => '560001',
                'phone' => '+91-9876543210',
                'email' => 'contact@citycarehospital.test',
                'ambulance_phone' => '+91-9000000001',
                'emergency_phone' => '+91-9000000002',
                'administrator' => 'Hospital Admin',
                'hospital_type' => 'super_speciality',
                'facility_types' => ['opd', 'ipd', 'icu', 'emergency', 'ot', 'lab', 'radiology', 'pharmacy'],
                'is_active' => true,
                'is_head_office' => true,
            ]
        );

        $department = Department::updateOrCreate(
            ['company_id' => $company->id, 'hospital_id' => $hospital->id, 'code' => 'GEN-MED'],
            ['name' => 'General Medicine', 'description' => 'General medicine & internal medicine department.', 'is_active' => true]
        );

        Department::updateOrCreate(
            ['company_id' => $company->id, 'hospital_id' => $hospital->id, 'code' => 'ORTHO'],
            ['name' => 'Orthopedics', 'description' => 'Bone & joint care.', 'is_active' => true]
        );

        $ward = Ward::updateOrCreate(
            ['company_id' => $company->id, 'hospital_id' => $hospital->id, 'code' => 'GW-1'],
            [
                'department_id' => $department->id,
                'name' => 'General Ward 1',
                'ward_type' => 'general',
                'floor_number' => 1,
                'is_active' => true,
            ]
        );

        $icuWard = Ward::updateOrCreate(
            ['company_id' => $company->id, 'hospital_id' => $hospital->id, 'code' => 'ICU-1'],
            [
                'department_id' => $department->id,
                'name' => 'ICU 1',
                'ward_type' => 'icu',
                'floor_number' => 2,
                'is_active' => true,
            ]
        );

        foreach (range(1, 5) as $i) {
            Bed::updateOrCreate(
                ['hospital_id' => $hospital->id, 'bed_number' => "GW1-{$i}"],
                [
                    'company_id' => $company->id,
                    'ward_id' => $ward->id,
                    'bed_id' => "BED-GW1-{$i}",
                    'bed_number' => "GW1-{$i}",
                    'bed_type' => 'general',
                    'daily_rate' => 2000,
                    'status' => 'available',
                    'is_active' => true,
                ]
            );
        }

        foreach (range(1, 3) as $i) {
            Bed::updateOrCreate(
                ['hospital_id' => $hospital->id, 'bed_number' => "ICU1-{$i}"],
                [
                    'company_id' => $company->id,
                    'ward_id' => $icuWard->id,
                    'bed_id' => "BED-ICU1-{$i}",
                    'bed_number' => "ICU1-{$i}",
                    'bed_type' => 'icu',
                    'daily_rate' => 8000,
                    'status' => 'available',
                    'is_active' => true,
                ]
            );
        }

        $totalBeds = Bed::where('hospital_id', $hospital->id)->count();
        $ward->update(['total_beds' => 5, 'available_beds' => 5]);
        $icuWard->update(['total_beds' => 3, 'available_beds' => 3]);
        $hospital->update(['total_beds' => $totalBeds, 'available_beds' => $totalBeds]);

        foreach (['OPD' => 'opd', 'IPD' => 'ipd', 'Emergency' => 'emergency'] as $name => $code) {
            PatientType::updateOrCreate(
                ['company_id' => $company->id, 'hospital_id' => $hospital->id, 'code' => $code],
                ['name' => $name, 'is_active' => true]
            );
        }
    }
}
