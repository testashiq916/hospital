<?php

namespace Tests\Feature;

use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RoleUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@demo-hms.test',
            'password' => RoleUserSeeder::SEED_PASSWORD,
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'token', 'user' => ['id', 'email', 'company', 'role']]);
    }

    public function test_login_fails_with_invalid_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@demo-hms.test',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_fetch_me(): void
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@demo-hms.test',
            'password' => RoleUserSeeder::SEED_PASSWORD,
        ]);

        $token = $login->json('token');

        $response = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/v1/auth/me');

        $response->assertOk()->assertJsonPath('email', 'admin@demo-hms.test');
    }

    public function test_user_can_logout(): void
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@demo-hms.test',
            'password' => RoleUserSeeder::SEED_PASSWORD,
        ]);

        $token = $login->json('token');

        $tokenId = explode('|', $token)[0];

        $logout = $this->withHeader('Authorization', "Bearer {$token}")->postJson('/api/v1/auth/logout');
        $logout->assertOk();

        // The token row itself must be gone. Note: a follow-up simulated
        // HTTP call reusing the same token would still appear "authenticated"
        // here only because PHPUnit reuses one Application instance per test
        // and Sanctum's guard caches its resolved user for that instance's
        // lifetime — not something that can happen across real requests in
        // production, where every request boots a fresh guard resolution.
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $tokenId]);
    }

    public function test_self_service_registration_creates_new_tenant(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'company_name' => 'New Hospital Co',
            'first_name' => 'Owner',
            'last_name' => 'User',
            'email' => 'owner@newhospital.test',
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'owner@newhospital.test');

        $this->assertDatabaseHas('companies', ['name' => 'New Hospital Co']);
    }
}
