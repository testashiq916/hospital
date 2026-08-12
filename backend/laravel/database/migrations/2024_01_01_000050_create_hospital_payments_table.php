<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hospital_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('patient_id')->constrained('patients');
            $table->foreignId('bill_id')->constrained('hospital_bills');
            $table->string('payment_id', 50)->unique();
            $table->date('payment_date');
            $table->time('payment_time');
            $table->decimal('amount', 15, 2);
            $table->enum('payment_method', ['cash', 'card', 'upi', 'insurance', 'tpa', 'cheque', 'bank_transfer'])->default('cash');
            $table->string('transaction_id')->nullable();
            $table->string('card_last_four', 4)->nullable();
            $table->string('cheque_number', 50)->nullable();
            $table->date('cheque_date')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('upi_id', 100)->nullable();
            $table->string('payment_reference')->nullable();
            $table->enum('status', ['pending', 'success', 'failed', 'refunded'])->default('success');
            $table->json('gateway_response')->nullable();
            $table->foreignId('received_by')->nullable()->constrained('users');
            $table->foreignId('voucher_id')->nullable()->constrained('vouchers')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hospital_payments');
    }
};
