<?php

namespace Database\Seeders;

use App\Models\Hospital\Hospital;
use App\Models\System\Company;
use App\Models\System\Permission;
use App\Models\System\Role;
use App\Models\System\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Full roles/permissions matrix + one seed user per role. Documented
 * password for every seeded user: "Password@123".
 */
class RoleUserSeeder extends Seeder
{
    public const SEED_PASSWORD = 'Password@123';

    /** @var array<string, array<string>> role slug => permission slugs ('*' = all) */
    protected const ROLE_PERMISSIONS = [
        'super_admin' => ['*'],
        'hospital_admin' => ['*'],
        'doctor' => [
            'patients.view', 'patient_records.manage', 'appointments.view', 'appointments.manage',
            'clinical.manage', 'lab.view', 'lab.manage', 'radiology.manage', 'prescriptions.manage',
            'ai.use', 'reports.view', 'doctors.view',
        ],
        'nurse' => [
            'patients.view', 'patient_records.manage', 'clinical.manage', 'lab.view', 'appointments.view',
        ],
        'receptionist' => [
            'patients.view', 'patients.manage', 'appointments.view', 'appointments.manage',
            'billing.view', 'doctors.view', 'hospitals.view',
        ],
        'lab_technician' => [
            'lab.view', 'lab.manage', 'radiology.manage', 'blood_bank.manage', 'patients.view', 'ai.use',
        ],
        'pharmacist' => [
            'pharmacy.view', 'pharmacy.manage', 'prescriptions.manage', 'patients.view', 'ai.use',
        ],
        'accountant' => [
            'billing.view', 'billing.manage', 'insurance.manage', 'accounting.view', 'accounting.manage', 'reports.view',
        ],
        'patient' => [],
    ];

    public function run(): void
    {
        $company = Company::where('code', 'DEMO-HMS')->firstOrFail();
        $hospital = Hospital::where('hospital_id', 'HOSP-DEMO-001')->firstOrFail();

        $allPermissionIds = Permission::pluck('id', 'slug');

        foreach (self::ROLE_PERMISSIONS as $slug => $permissionSlugs) {
            $role = Role::updateOrCreate(
                ['company_id' => $company->id, 'slug' => $slug],
                ['name' => ucwords(str_replace('_', ' ', $slug)), 'is_default' => $slug === 'hospital_admin']
            );

            $ids = $permissionSlugs === ['*']
                ? $allPermissionIds->values()->all()
                : collect($permissionSlugs)->map(fn ($s) => $allPermissionIds[$s] ?? null)->filter()->values()->all();

            $role->permissions()->sync($ids);
        }

        $users = [
            ['role' => 'super_admin', 'email' => 'superadmin@demo-hms.test', 'first' => 'Super', 'last' => 'Admin', 'is_super_admin' => true, 'designation' => 'Platform Super Admin'],
            ['role' => 'hospital_admin', 'email' => 'admin@demo-hms.test', 'first' => 'Hospital', 'last' => 'Admin', 'designation' => 'Hospital Administrator'],
            ['role' => 'doctor', 'email' => 'doctor@demo-hms.test', 'first' => 'Dev', 'last' => 'Sharma', 'designation' => 'Consulting Physician', 'is_consultant' => true, 'specialization' => 'General Medicine'],
            ['role' => 'nurse', 'email' => 'nurse@demo-hms.test', 'first' => 'Nina', 'last' => 'Fernandes', 'designation' => 'Staff Nurse'],
            ['role' => 'receptionist', 'email' => 'receptionist@demo-hms.test', 'first' => 'Riya', 'last' => 'Kapoor', 'designation' => 'Front Desk Receptionist'],
            ['role' => 'lab_technician', 'email' => 'labtech@demo-hms.test', 'first' => 'Leo', 'last' => 'Mathew', 'designation' => 'Lab Technician'],
            ['role' => 'pharmacist', 'email' => 'pharmacist@demo-hms.test', 'first' => 'Priya', 'last' => 'Nair', 'designation' => 'Chief Pharmacist'],
            ['role' => 'accountant', 'email' => 'accountant@demo-hms.test', 'first' => 'Arjun', 'last' => 'Rao', 'designation' => 'Accountant'],
            ['role' => 'patient', 'email' => 'patient@demo-hms.test', 'first' => 'Pooja', 'last' => 'Iyer', 'designation' => null],
        ];

        foreach ($users as $u) {
            $role = Role::where('company_id', $company->id)->where('slug', $u['role'])->first();

            User::updateOrCreate(
                ['company_id' => $company->id, 'email' => $u['email']],
                [
                    'hospital_id' => $hospital->id,
                    'first_name' => $u['first'],
                    'last_name' => $u['last'],
                    'password' => Hash::make(self::SEED_PASSWORD),
                    'mobile' => '+91-90000000'.random_int(10, 99),
                    'role_id' => $role?->id,
                    'employee_id' => strtoupper(substr($u['role'], 0, 3)).'-001',
                    'designation' => $u['designation'] ?? null,
                    'specialization' => $u['specialization'] ?? null,
                    'is_consultant' => $u['is_consultant'] ?? false,
                    'is_super_admin' => $u['is_super_admin'] ?? false,
                    'is_active' => true,
                ]
            );
        }
    }
}
