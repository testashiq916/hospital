<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Gap-filling table: app/Models/AI/AIAnalysis.php is referenced by the folder
// structure (docs/spec/01-folder-structure.txt) but has no DDL in the source
// export. Backs the rule-based AI services (symptom checker, ICD-10 coding,
// lab report analysis, drug interactions, health-risk scoring).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->nullable()->constrained('hospitals')->nullOnDelete();
            $table->foreignId('patient_id')->nullable()->constrained('patients')->nullOnDelete();
            $table->string('type', 100);
            $table->string('module', 100)->nullable();
            $table->json('input');
            $table->json('output');
            $table->decimal('risk_score', 5, 2)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_analyses');
    }
};
