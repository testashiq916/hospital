<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_admissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('patient_id')->constrained('patients');
            $table->foreignId('doctor_id')->constrained('users');
            $table->string('admission_id', 50)->unique();
            $table->date('admission_date');
            $table->time('admission_time');
            $table->enum('admission_type', ['elective', 'emergency', 'transfer'])->default('elective');
            $table->foreignId('bed_id')->nullable()->constrained('beds')->nullOnDelete();
            $table->foreignId('ward_id')->nullable()->constrained('wards')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->text('diagnosis')->nullable();
            $table->text('treatment_plan')->nullable();
            $table->foreignId('attending_doctor_id')->nullable()->constrained('users');
            $table->enum('status', ['active', 'discharged', 'transferred', 'expired'])->default('active');
            $table->date('discharge_date')->nullable();
            $table->time('discharge_time')->nullable();
            $table->text('discharge_summary')->nullable();
            $table->text('discharge_instructions')->nullable();
            $table->integer('length_of_stay')->default(0);
            $table->text('readmission_reason')->nullable();
            $table->boolean('is_readmission')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_admissions');
    }
};
