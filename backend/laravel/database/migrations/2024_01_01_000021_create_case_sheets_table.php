<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('case_sheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('patient_id')->constrained('patients');
            $table->foreignId('admission_id')->nullable()->constrained('patient_admissions')->nullOnDelete();
            $table->foreignId('visit_id')->nullable()->constrained('patient_visits')->nullOnDelete();
            $table->foreignId('doctor_id')->constrained('users');
            $table->string('case_sheet_id', 50)->unique();
            $table->date('note_date');
            $table->time('note_time');
            $table->enum('note_type', ['admission', 'progress', 'discharge', 'consultation', 'procedure'])->default('progress');
            $table->text('subjective')->nullable();
            $table->text('objective')->nullable();
            $table->text('assessment')->nullable();
            $table->text('plan')->nullable();
            $table->json('vitals')->nullable();
            $table->text('investigations')->nullable();
            $table->text('treatment_given')->nullable();
            $table->text('remarks')->nullable();
            $table->enum('status', ['draft', 'final', 'amended'])->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('case_sheets');
    }
};
