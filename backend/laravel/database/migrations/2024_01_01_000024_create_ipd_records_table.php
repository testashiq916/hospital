<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ipd_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('patient_id')->constrained('patients');
            $table->foreignId('admission_id')->constrained('patient_admissions');
            $table->foreignId('bed_id')->constrained('beds');
            $table->foreignId('doctor_id')->constrained('users');
            $table->string('ipd_id', 50)->unique();
            $table->date('ipd_date');
            $table->time('ipd_time');
            $table->text('diagnosis')->nullable();
            $table->text('treatment_plan')->nullable();
            $table->integer('day_number')->default(1);
            $table->json('vitals')->nullable();
            $table->json('input_output')->nullable();
            $table->text('fluids_iv')->nullable();
            $table->text('medications')->nullable();
            $table->text('diet_advice')->nullable();
            $table->text('nursing_notes')->nullable();
            $table->text('doctor_notes')->nullable();
            $table->boolean('is_icu')->default(false);
            $table->enum('status', ['active', 'discharged', 'transferred'])->default('active');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ipd_records');
    }
};
