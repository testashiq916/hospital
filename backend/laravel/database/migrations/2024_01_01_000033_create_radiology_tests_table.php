<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('radiology_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->string('test_code', 50)->unique();
            $table->string('name');
            $table->enum('modality', ['xray', 'ct', 'mri', 'ultrasound', 'pet', 'mammogram', 'fluoroscopy'])->default('xray');
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('radiology_tests');
    }
};
