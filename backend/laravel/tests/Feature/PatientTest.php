<?php

namespace Tests\Feature;

use App\Models\Hospital\Hospital;
use App\Models\System\Company;
use App\Models\System\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PatientTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
    }

    protected function actingAsAdmin(): User
    {
        $admin = User::where('email', 'admin@demo-hms.test')->firstOrFail();
        Sanctum::actingAs($admin, ['*']);

        return $admin;
    }

    protected function validPatientPayload(): array
    {
        $hospital = Hospital::where('hospital_id', 'HOSP-DEMO-001')->firstOrFail();

        return [
            'hospital_id' => $hospital->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'gender' => 'male',
            'date_of_birth' => '1990-05-15',
            'mobile' => '9999900001',
            'registration_type' => 'opd',
        ];
    }

    public function test_can_register_a_patient(): void
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/api/v1/patients', $this->validPatientPayload());

        $response->assertCreated()
            ->assertJsonPath('first_name', 'John')
            ->assertJsonStructure(['patient_id']);

        $this->assertDatabaseHas('patients', ['first_name' => 'John', 'last_name' => 'Doe']);
    }

    public function test_can_list_patients(): void
    {
        $this->actingAsAdmin();
        $this->postJson('/api/v1/patients', $this->validPatientPayload())->assertCreated();

        $response = $this->getJson('/api/v1/patients');

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_company_cannot_see_another_companys_patients(): void
    {
        // Company A creates a patient.
        $this->actingAsAdmin();
        $this->postJson('/api/v1/patients', $this->validPatientPayload())->assertCreated();

        // A brand new tenant (Company B) registers via self-service signup.
        $register = $this->postJson('/api/v1/auth/register', [
            'company_name' => 'Other Hospital Inc',
            'first_name' => 'Other',
            'last_name' => 'Admin',
            'email' => 'other-admin@otherhospital.test',
            'password' => 'AnotherPass123',
            'password_confirmation' => 'AnotherPass123',
        ])->assertCreated();

        // A company-A admin is still "logged in" for this test process (via
        // Sanctum::actingAs above), which means the CompanyScope global
        // scope would otherwise filter these lookups to company A only —
        // bypass it explicitly since this is test setup/assertion code, not
        // application code subject to tenant isolation itself.
        $companyBUser = User::withoutCompanyScope()->where('email', 'other-admin@otherhospital.test')->firstOrFail();

        $this->assertNotEquals(
            User::withoutCompanyScope()->where('email', 'admin@demo-hms.test')->firstOrFail()->company_id,
            $companyBUser->company_id,
        );

        Sanctum::actingAs($companyBUser, ['*']);

        $response = $this->getJson('/api/v1/patients');

        $response->assertOk()->assertJsonCount(0, 'data');
    }
}
