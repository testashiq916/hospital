<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('patient_id')->constrained('patients');
            $table->foreignId('doctor_id')->constrained('users');
            $table->string('appointment_id', 50)->unique();
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->time('end_time')->nullable();
            $table->enum('appointment_type', ['opd', 'follow_up', 'teleconsultation', 'emergency'])->default('opd');
            $table->enum('status', ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])->default('scheduled');
            $table->integer('token_number')->nullable();
            $table->integer('queue_number')->nullable();
            $table->integer('estimated_wait_time')->default(0);
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_emergency')->default(false);
            $table->boolean('is_teleconsultation')->default(false);
            $table->string('teleconsultation_link')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users');
            $table->text('cancelled_reason')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();

            $table->index(['doctor_id', 'appointment_date'], 'idx_appointment_doctor');
            $table->index('patient_id', 'idx_appointment_patient');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
