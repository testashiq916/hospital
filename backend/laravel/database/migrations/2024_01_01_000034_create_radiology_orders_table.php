<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('radiology_orders', function (Blueprint $table) {
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
            $table->foreignId('radiology_test_id')->constrained('radiology_tests');
            $table->string('body_part')->nullable();
            $table->text('clinical_indication')->nullable();
            $table->enum('priority', ['routine', 'urgent', 'stat'])->default('routine');
            $table->enum('status', ['ordered', 'scheduled', 'performed', 'reported', 'cancelled'])->default('ordered');
            $table->foreignId('performed_by')->nullable()->constrained('users');
            $table->timestamp('performed_at')->nullable();
            $table->text('report_text')->nullable();
            $table->json('dicom_images')->nullable();
            $table->string('pdf_path')->nullable();
            $table->text('ai_analysis')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('radiology_orders');
    }
};
