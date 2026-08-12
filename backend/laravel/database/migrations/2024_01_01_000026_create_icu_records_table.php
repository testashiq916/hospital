<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('icu_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('patient_id')->constrained('patients');
            $table->foreignId('admission_id')->constrained('patient_admissions');
            $table->foreignId('doctor_id')->constrained('users');
            $table->string('icu_id', 50)->unique();
            $table->date('icu_date');
            $table->time('icu_time');
            $table->json('vitals')->nullable();
            $table->string('consciousness_level', 50)->nullable();
            $table->json('respirator_settings')->nullable();
            $table->decimal('oxygen_saturation', 5, 2)->nullable();
            $table->string('ventilator_mode', 50)->nullable();
            $table->text('iv_fluids')->nullable();
            $table->text('medications')->nullable();
            $table->text('lab_results')->nullable();
            $table->text('doctor_notes')->nullable();
            $table->text('emergency_notes')->nullable();
            $table->enum('status', ['active', 'stable', 'critical', 'transferred', 'discharged'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('icu_records');
    }
};
