<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insurance_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('patient_id')->constrained('patients');
            $table->foreignId('admission_id')->nullable()->constrained('patient_admissions')->nullOnDelete();
            $table->foreignId('bill_id')->nullable()->constrained('hospital_bills')->nullOnDelete();
            $table->string('claim_id', 50)->unique();
            $table->date('claim_date');
            $table->string('insurance_provider');
            $table->string('policy_number', 50)->nullable();
            $table->string('tpa_name')->nullable();
            $table->decimal('claim_amount', 15, 2)->default(0);
            $table->decimal('approved_amount', 15, 2)->default(0);
            $table->decimal('rejected_amount', 15, 2)->default(0);
            $table->enum('claim_status', ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'settled'])->default('draft');
            $table->date('submission_date')->nullable();
            $table->date('approval_date')->nullable();
            $table->date('settlement_date')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->json('documents')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insurance_claims');
    }
};
