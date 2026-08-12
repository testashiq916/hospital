<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_timeline', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('patient_id')->constrained('patients');
            $table->date('event_date');
            $table->time('event_time');
            $table->enum('event_type', ['visit', 'admission', 'discharge', 'lab_test', 'radiology', 'procedure', 'surgery', 'prescription', 'vital', 'note', 'other']);
            $table->string('event_title');
            $table->text('event_description')->nullable();
            $table->string('reference_type', 100)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['patient_id', 'event_date'], 'idx_patient_timeline');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_timeline');
    }
};
