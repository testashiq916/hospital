<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('queue_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('doctor_id')->constrained('users');
            $table->foreignId('patient_id')->constrained('patients');
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->nullOnDelete();
            $table->integer('token_number');
            $table->date('queue_date');
            $table->enum('queue_status', ['waiting', 'called', 'in_progress', 'completed', 'skipped', 'cancelled'])->default('waiting');
            $table->timestamp('called_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('waiting_time')->default(0);
            $table->integer('service_time')->default(0);
            $table->timestamps();

            $table->unique(['doctor_id', 'queue_date', 'token_number'], 'unique_token');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('queue_tokens');
    }
};
