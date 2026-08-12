<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opd_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('patient_id')->constrained('patients');
            $table->foreignId('doctor_id')->constrained('users');
            $table->foreignId('visit_id')->constrained('patient_visits');
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->nullOnDelete();
            $table->string('opd_id', 50)->unique();
            $table->date('opd_date');
            $table->time('opd_time');
            $table->text('chief_complaint')->nullable();
            $table->text('history_presenting')->nullable();
            $table->text('past_history')->nullable();
            $table->text('personal_history')->nullable();
            $table->text('family_history')->nullable();
            $table->text('treatment_history')->nullable();
            $table->json('vitals')->nullable();
            $table->text('physical_examination')->nullable();
            $table->text('provisional_diagnosis')->nullable();
            $table->text('final_diagnosis')->nullable();
            $table->text('investigation_advised')->nullable();
            $table->text('treatment_advised')->nullable();
            $table->text('advice')->nullable();
            $table->date('follow_up_date')->nullable();
            $table->text('referral_notes')->nullable();
            $table->enum('status', ['draft', 'final', 'cancelled'])->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opd_records');
    }
};
