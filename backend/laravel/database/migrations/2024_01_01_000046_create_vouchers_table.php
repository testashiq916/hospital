<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('voucher_no', 50);
            $table->enum('voucher_type', ['billing', 'payment', 'receipt', 'journal', 'contra', 'insurance']);
            $table->date('voucher_date');
            $table->string('reference_no', 50)->nullable();
            $table->date('reference_date')->nullable();
            $table->text('narration')->nullable();
            $table->decimal('total_debit', 15, 2)->default(0);
            $table->decimal('total_credit', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->decimal('balance_difference', 15, 2)->default(0);
            $table->boolean('is_balanced')->default(false);
            $table->boolean('is_posted')->default(false);
            $table->foreignId('posted_by')->nullable()->constrained('users');
            $table->timestamp('posted_at')->nullable();
            $table->foreignId('hospital_id')->nullable()->constrained('hospitals')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();

            $table->unique(['company_id', 'voucher_type', 'voucher_no'], 'unique_voucher');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
