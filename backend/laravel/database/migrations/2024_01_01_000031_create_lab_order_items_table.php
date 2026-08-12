<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_order_id')->constrained('lab_orders')->cascadeOnDelete();
            $table->foreignId('lab_test_id')->constrained('lab_tests');
            $table->string('specimen_id', 50)->nullable();
            $table->timestamp('sample_collected_at')->nullable();
            $table->timestamp('sample_received_at')->nullable();
            $table->decimal('result', 15, 2)->nullable();
            $table->text('result_text')->nullable();
            $table->enum('result_status', ['pending', 'processing', 'completed', 'abnormal'])->default('pending');
            $table->decimal('range_low', 15, 2)->nullable();
            $table->decimal('range_high', 15, 2)->nullable();
            $table->string('unit', 50)->nullable();
            $table->text('remarks')->nullable();
            $table->boolean('is_abnormal')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_order_items');
    }
};
