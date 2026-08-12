<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('beds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('ward_id')->constrained('wards');
            $table->string('bed_id', 50)->unique();
            $table->string('bed_number', 20);
            $table->enum('bed_type', ['general', 'icu', 'private', 'semi_private', 'isolation'])->default('general');
            $table->decimal('daily_rate', 15, 2)->default(0);
            $table->enum('status', ['available', 'occupied', 'reserved', 'cleaning', 'maintenance'])->default('available');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['hospital_id', 'bed_number'], 'unique_bed_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('beds');
    }
};
