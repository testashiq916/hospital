<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('patient_id')->constrained('patients');
            $table->foreignId('doctor_id')->constrained('users');
            $table->string('visit_id', 50)->unique();
            $table->date('visit_date');
            $table->time('visit_time');
            $table->enum('visit_type', ['opd', 'emergency', 'follow_up', 'consultation'])->default('opd');
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->integer('token_number')->nullable();
            $table->integer('queue_number')->nullable();
            $table->text('chief_complaint')->nullable();
            $table->text('present_illness')->nullable();
            $table->text('past_medical_history')->nullable();
            $table->text('clinical_notes')->nullable();
            $table->text('diagnosis')->nullable();
            $table->string('referral_doctor')->nullable();
            $table->string('referral_hospital')->nullable();
            $table->enum('status', ['waiting', 'in_progress', 'completed', 'cancelled'])->default('waiting');
            $table->boolean('is_emergency')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_visits');
    }
};
