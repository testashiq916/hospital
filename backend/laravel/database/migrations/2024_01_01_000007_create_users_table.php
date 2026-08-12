<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->nullable()->constrained('hospitals')->nullOnDelete();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email');
            $table->string('password');
            $table->string('mobile', 20)->nullable();
            $table->foreignId('role_id')->nullable()->constrained('roles');
            $table->string('employee_id', 50)->nullable();
            $table->string('designation', 100)->nullable();
            $table->text('qualification')->nullable();
            $table->string('specialization')->nullable();
            $table->string('registration_no', 50)->nullable();
            $table->boolean('is_consultant')->default(false);
            $table->boolean('is_super_admin')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->rememberToken();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamps();

            $table->unique(['email', 'company_id'], 'unique_email_company');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
