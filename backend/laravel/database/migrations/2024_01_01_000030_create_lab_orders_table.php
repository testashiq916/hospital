<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('patient_id')->constrained('patients');
            $table->foreignId('doctor_id')->constrained('users');
            $table->string('order_id', 50)->unique();
            $table->date('order_date');
            $table->time('order_time');
            $table->foreignId('visit_id')->nullable()->constrained('patient_visits')->nullOnDelete();
            $table->foreignId('admission_id')->nullable()->constrained('patient_admissions')->nullOnDelete();
            $table->enum('order_type', ['laboratory', 'radiology', 'pathology'])->default('laboratory');
            $table->enum('priority', ['routine', 'urgent', 'stat'])->default('routine');
            $table->text('clinical_notes')->nullable();
            $table->enum('status', ['ordered', 'collected', 'processing', 'completed', 'cancelled'])->default('ordered');
            $table->foreignId('collected_by')->nullable()->constrained('users');
            $table->timestamp('collected_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_orders');
    }
};
