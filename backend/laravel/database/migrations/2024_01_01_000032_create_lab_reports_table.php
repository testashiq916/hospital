<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('lab_order_id')->constrained('lab_orders');
            $table->foreignId('patient_id')->constrained('patients');
            $table->string('report_id', 50)->unique();
            $table->date('report_date');
            $table->time('report_time');
            $table->string('report_title')->nullable();
            $table->text('clinical_interpretation')->nullable();
            $table->text('recommendation')->nullable();
            $table->string('pdf_path')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->timestamp('verified_at')->nullable();
            $table->text('ai_analysis')->nullable();
            $table->decimal('ai_risk_score', 5, 2)->nullable();
            $table->enum('status', ['draft', 'verified', 'reported', 'cancelled'])->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_reports');
    }
};
