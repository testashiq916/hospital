<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nursing_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('patient_id')->constrained('patients');
            $table->foreignId('admission_id')->constrained('patient_admissions');
            $table->foreignId('nurse_id')->constrained('users');
            $table->string('record_id', 50)->unique();
            $table->date('record_date');
            $table->time('record_time');
            $table->enum('shift', ['morning', 'evening', 'night'])->default('morning');
            $table->json('vitals')->nullable();
            $table->json('input_output')->nullable();
            $table->text('medications_given')->nullable();
            $table->text('procedures_done')->nullable();
            $table->text('observations')->nullable();
            $table->text('complications')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nursing_records');
    }
};
