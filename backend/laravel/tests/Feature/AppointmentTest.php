<?php

namespace Tests\Feature;

use App\Models\Hospital\Hospital;
use App\Models\Patient\Patient;
use App\Models\System\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AppointmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);

        $admin = User::where('email', 'admin@demo-hms.test')->firstOrFail();
        Sanctum::actingAs($admin, ['*']);
    }

    protected function createPatient(string $mobile): Patient
    {
        $hospital = Hospital::where('hospital_id', 'HOSP-DEMO-001')->firstOrFail();

        $response = $this->postJson('/api/v1/patients', [
            'hospital_id' => $hospital->id,
            'first_name' => 'Patient',
            'last_name' => $mobile,
            'gender' => 'female',
            'date_of_birth' => '1995-01-01',
            'mobile' => $mobile,
            'registration_type' => 'opd',
        ])->assertCreated();

        return Patient::find($response->json('id'));
    }

    public function test_appointment_tokens_increment_sequentially_for_same_doctor_and_date(): void
    {
        $hospital = Hospital::where('hospital_id', 'HOSP-DEMO-001')->firstOrFail();
        $doctor = User::where('email', 'doctor@demo-hms.test')->firstOrFail();

        $patient1 = $this->createPatient('9999911111');
        $patient2 = $this->createPatient('9999922222');
        $patient3 = $this->createPatient('9999933333');

        // Monday of next week, guaranteed to have a doctor schedule.
        $nextMonday = now()->next('Monday')->toDateString();

        $tokens = [];
        foreach ([$patient1, $patient2, $patient3] as $i => $patient) {
            $response = $this->postJson('/api/v1/appointments', [
                'hospital_id' => $hospital->id,
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'appointment_date' => $nextMonday,
                'appointment_time' => sprintf('%02d:%02d', 9 + $i, 0),
                'appointment_type' => 'opd',
            ]);

            $response->assertCreated();
            $tokens[] = $response->json('token_number');
        }

        $this->assertSame([1, 2, 3], $tokens);
    }

    public function test_cannot_double_book_same_doctor_slot(): void
    {
        $hospital = Hospital::where('hospital_id', 'HOSP-DEMO-001')->firstOrFail();
        $doctor = User::where('email', 'doctor@demo-hms.test')->firstOrFail();
        $patient1 = $this->createPatient('9999944444');
        $patient2 = $this->createPatient('9999955555');

        $nextMonday = now()->next('Monday')->toDateString();

        $this->postJson('/api/v1/appointments', [
            'hospital_id' => $hospital->id,
            'patient_id' => $patient1->id,
            'doctor_id' => $doctor->id,
            'appointment_date' => $nextMonday,
            'appointment_time' => '09:00',
        ])->assertCreated();

        $response = $this->postJson('/api/v1/appointments', [
            'hospital_id' => $hospital->id,
            'patient_id' => $patient2->id,
            'doctor_id' => $doctor->id,
            'appointment_date' => $nextMonday,
            'appointment_time' => '09:00',
        ]);

        $response->assertStatus(422);
    }
}
