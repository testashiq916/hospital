<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ot_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('patient_id')->constrained('patients');
            $table->foreignId('doctor_id')->constrained('users');
            $table->foreignId('assistant_doctor_id')->nullable()->constrained('users');
            $table->foreignId('anesthetist_id')->nullable()->constrained('users');
            $table->foreignId('nurse_id')->nullable()->constrained('users');
            $table->string('ot_id', 50)->unique();
            $table->string('ot_number', 20);
            $table->date('surgery_date');
            $table->time('surgery_time');
            $table->integer('expected_duration')->default(60);
            $table->string('surgery_type')->nullable();
            $table->text('surgery_reason')->nullable();
            $table->text('pre_operation_notes')->nullable();
            $table->text('post_operation_notes')->nullable();
            $table->string('anesthesia_type', 100)->nullable();
            $table->enum('status', ['scheduled', 'prepared', 'in_progress', 'completed', 'cancelled', 'postponed'])->default('scheduled');
            $table->boolean('is_emergency')->default(false);
            $table->enum('priority', ['routine', 'urgent', 'emergency'])->default('routine');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ot_schedules');
    }
};
