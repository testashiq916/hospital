<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daybook', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->unsignedBigInteger('slno')->unique();
            $table->unsignedBigInteger('sno');
            $table->string('account_code', 20);
            $table->string('opposite_account_code', 20);
            $table->decimal('amount', 15, 2);
            $table->enum('drcr', ['dr', 'cr']);
            $table->enum('voucher_type', ['billing', 'payment', 'receipt', 'journal', 'contra', 'insurance']);
            $table->string('voucher_no', 50);
            $table->date('voucher_date');
            $table->text('remarks')->nullable();
            $table->string('reference_no', 50)->nullable();
            $table->date('reference_date')->nullable();
            $table->foreignId('patient_id')->nullable()->constrained('patients')->nullOnDelete();
            $table->foreignId('bill_id')->nullable()->constrained('hospital_bills')->nullOnDelete();
            $table->foreignId('hospital_id')->nullable()->constrained('hospitals')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();

            $table->foreign('account_code')->references('account_code')->on('chart_of_accounts');
            $table->foreign('opposite_account_code')->references('account_code')->on('chart_of_accounts');
            $table->index(['voucher_type', 'voucher_no'], 'idx_voucher');
            $table->index('account_code', 'idx_account');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daybook');
    }
};
