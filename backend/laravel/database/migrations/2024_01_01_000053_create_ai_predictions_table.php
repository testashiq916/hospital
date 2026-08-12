<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Gap-filling table: app/Models/AI/AIPrediction.php (docs/spec/01-folder-structure.txt).
// Backs the Disease-Risk Prediction / Health-Risk Scoring AI services.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_predictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('patient_id')->nullable()->constrained('patients')->nullOnDelete();
            $table->string('type', 100);
            $table->string('module', 100)->nullable();
            $table->json('input');
            $table->json('output');
            $table->decimal('risk_score', 5, 2)->nullable();
            $table->decimal('confidence', 5, 2)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_predictions');
    }
};
