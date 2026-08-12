<?php

namespace Database\Seeders;

use App\Models\System\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Every permission slug referenced by middleware('permission:...') in
     * routes/api.php, grouped by module.
     */
    public static function matrix(): array
    {
        return [
            'hospitals' => ['view' => 'View hospitals', 'manage' => 'Manage hospitals'],
            'departments' => ['manage' => 'Manage departments'],
            'wards' => ['manage' => 'Manage wards'],
            'beds' => ['manage' => 'Manage beds'],
            'patients' => ['view' => 'View patients', 'manage' => 'Manage patients'],
            'patient_records' => ['manage' => 'Manage patient clinical records (visits, admissions, case sheets)'],
            'doctors' => ['view' => 'View doctors', 'manage' => 'Manage doctor schedules/unavailability'],
            'appointments' => ['view' => 'View appointments', 'manage' => 'Manage appointments & queue'],
            'clinical' => ['manage' => 'Manage OPD/IPD/nursing/ICU/OT records'],
            'lab' => ['view' => 'View lab orders/reports', 'manage' => 'Manage lab tests/orders/results'],
            'radiology' => ['manage' => 'Manage radiology tests/orders'],
            'blood_bank' => ['manage' => 'Manage blood bank inventory'],
            'pharmacy' => ['view' => 'View pharmacy/medicines', 'manage' => 'Manage medicines/inventory'],
            'prescriptions' => ['manage' => 'Manage prescriptions & dispensing'],
            'billing' => ['view' => 'View bills/payments', 'manage' => 'Create bills & collect payments'],
            'insurance' => ['manage' => 'Manage insurance claims'],
            'accounting' => ['view' => 'View chart of accounts/vouchers/daybook', 'manage' => 'Post vouchers & manage accounts'],
            'ai' => ['use' => 'Use AI features'],
            'reports' => ['view' => 'View reports & analytics'],
            'settings' => ['manage' => 'Manage company settings'],
            'users' => ['manage' => 'Manage users'],
            'roles' => ['manage' => 'Manage roles & permissions'],
            'audit' => ['view' => 'View audit logs'],
        ];
    }

    public function run(): void
    {
        foreach (self::matrix() as $module => $actions) {
            foreach ($actions as $action => $description) {
                Permission::updateOrCreate(
                    ['slug' => "{$module}.{$action}"],
                    [
                        'name' => ucfirst(str_replace('_', ' ', $module)).' - '.ucfirst($action),
                        'module' => $module,
                        'description' => $description,
                    ]
                );
            }
        }
    }
}
