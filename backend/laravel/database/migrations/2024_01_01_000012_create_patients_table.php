<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->string('patient_id', 50)->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('patient_type_id')->nullable()->constrained('patient_types')->nullOnDelete();

            // Personal
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('middle_name', 100)->nullable();
            $table->enum('gender', ['male', 'female', 'other']);
            $table->date('date_of_birth');
            $table->integer('age')->nullable();
            $table->string('blood_group', 10)->nullable();
            $table->enum('marital_status', ['single', 'married', 'divorced', 'widowed'])->default('single');

            // Contact
            $table->string('email')->nullable();
            $table->string('mobile', 20);
            $table->string('alternate_mobile', 20)->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('zip_code', 20)->nullable();

            // Family
            $table->string('guardian_name')->nullable();
            $table->string('guardian_relationship', 50)->nullable();
            $table->string('guardian_contact', 20)->nullable();
            $table->string('spouse_name')->nullable();
            $table->string('father_name')->nullable();
            $table->string('mother_name')->nullable();

            // Medical
            $table->string('blood_pressure', 20)->nullable();
            $table->text('allergies')->nullable();
            $table->text('chronic_diseases')->nullable();
            $table->text('medications')->nullable();
            $table->text('family_history')->nullable();
            $table->text('social_history')->nullable();

            // Insurance
            $table->string('insurance_provider')->nullable();
            $table->string('insurance_policy_number', 50)->nullable();
            $table->date('insurance_expiry')->nullable();
            $table->decimal('insurance_coverage', 15, 2)->nullable();
            $table->string('tpa_name')->nullable();
            $table->string('tpa_id', 50)->nullable();

            // Emergency
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone', 20)->nullable();
            $table->string('emergency_contact_relationship', 50)->nullable();

            // Status
            $table->boolean('is_active')->default(true);
            $table->boolean('is_deceased')->default(false);
            $table->date('deceased_date')->nullable();
            $table->text('deceased_reason')->nullable();

            // Registration
            $table->date('registration_date');
            $table->enum('registration_type', ['opd', 'ipd', 'emergency'])->default('opd');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
