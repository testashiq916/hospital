<?php

namespace Database\Seeders;

use App\Models\Appointment\DoctorSchedule;
use App\Models\Hospital\Hospital;
use App\Models\System\Company;
use App\Models\System\User;
use Illuminate\Database\Seeder;

class DoctorScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('code', 'DEMO-HMS')->firstOrFail();
        $hospital = Hospital::where('hospital_id', 'HOSP-DEMO-001')->firstOrFail();
        $doctor = User::where('company_id', $company->id)->where('email', 'doctor@demo-hms.test')->firstOrFail();

        foreach (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as $day) {
            DoctorSchedule::updateOrCreate(
                ['doctor_id' => $doctor->id, 'day_of_week' => $day, 'start_time' => '09:00:00'],
                [
                    'company_id' => $company->id,
                    'hospital_id' => $hospital->id,
                    'end_time' => '17:00:00',
                    'slot_duration' => 15,
                    'max_patients' => 30,
                    'is_available' => true,
                    'is_recurring' => true,
                    'location' => 'OPD Room 1',
                    'consultation_fee' => 500,
                ]
            );
        }
    }
}
