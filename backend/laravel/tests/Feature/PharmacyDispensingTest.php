<?php

namespace Tests\Feature;

use App\Models\Hospital\Hospital;
use App\Models\Pharmacy\Medicine;
use App\Models\System\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PharmacyDispensingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);

        $admin = User::where('email', 'admin@demo-hms.test')->firstOrFail();
        Sanctum::actingAs($admin, ['*']);
    }

    public function test_dispensing_a_prescription_decrements_medicine_stock(): void
    {
        $hospital = Hospital::where('hospital_id', 'HOSP-DEMO-001')->firstOrFail();
        $doctor = User::where('email', 'doctor@demo-hms.test')->firstOrFail();
        $medicine = Medicine::where('name', 'Paracetamol')->firstOrFail();
        $startingStock = $medicine->current_stock;

        $patient = $this->postJson('/api/v1/patients', [
            'hospital_id' => $hospital->id,
            'first_name' => 'Pharma',
            'last_name' => 'Patient',
            'gender' => 'male',
            'date_of_birth' => '2000-01-01',
            'mobile' => '9777700001',
            'registration_type' => 'opd',
        ])->assertCreated();

        $prescription = $this->postJson('/api/v1/prescriptions', [
            'hospital_id' => $hospital->id,
            'patient_id' => $patient->json('id'),
            'doctor_id' => $doctor->id,
            'diagnosis' => 'Fever',
            'items' => [
                ['medicine_id' => $medicine->id, 'quantity' => 10, 'dosage' => '1 tablet', 'frequency' => 'twice a day', 'duration' => '5 days'],
            ],
        ])->assertCreated();

        $prescriptionId = $prescription->json('prescription.id');

        $response = $this->postJson('/api/v1/pharmacy-dispensing', [
            'prescription_id' => $prescriptionId,
            'items' => [
                ['medicine_id' => $medicine->id, 'quantity' => 10],
            ],
        ]);

        $response->assertCreated();

        $medicine->refresh();
        $this->assertEquals($startingStock - 10, $medicine->current_stock);

        $this->assertDatabaseHas('pharmacy_dispensing_items', [
            'medicine_id' => $medicine->id,
            'quantity' => 10,
        ]);
    }

    public function test_dispensing_more_than_available_stock_fails(): void
    {
        $hospital = Hospital::where('hospital_id', 'HOSP-DEMO-001')->firstOrFail();
        $doctor = User::where('email', 'doctor@demo-hms.test')->firstOrFail();
        $medicine = Medicine::where('name', 'Amlodipine')->firstOrFail(); // seeded with low stock (20)

        $patient = $this->postJson('/api/v1/patients', [
            'hospital_id' => $hospital->id,
            'first_name' => 'Pharma',
            'last_name' => 'Overdraw',
            'gender' => 'male',
            'date_of_birth' => '2000-01-01',
            'mobile' => '9777700002',
            'registration_type' => 'opd',
        ])->assertCreated();

        $prescription = $this->postJson('/api/v1/prescriptions', [
            'hospital_id' => $hospital->id,
            'patient_id' => $patient->json('id'),
            'doctor_id' => $doctor->id,
            'items' => [
                ['medicine_id' => $medicine->id, 'quantity' => 5],
            ],
        ])->assertCreated();

        $response = $this->postJson('/api/v1/pharmacy-dispensing', [
            'prescription_id' => $prescription->json('prescription.id'),
            'items' => [
                ['medicine_id' => $medicine->id, 'quantity' => 9999],
            ],
        ]);

        $response->assertStatus(422);
    }
}
